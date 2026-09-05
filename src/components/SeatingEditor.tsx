"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as RPointerEvent,
  type ReactNode,
} from "react";
import {
  chairPositions,
  fitView,
  tableSize,
  zoomAtPoint,
  LINE_COLORS,
  LINE_WIDTHS,
  type SeatEdges,
  type SeatGuest,
  type SeatObject,
  type SeatLine,
  type Shape,
  type Table,
} from "@/lib/seatingLayout";
import {
  addGuests,
  clearStartMark,
  createLine,
  createObject,
  createTable,
  deleteLine,
  deleteObject,
  deleteTable,
  removeGuest,
  setSeatEdges,
  setSeatingPublicAction,
  setStartMark,
  updateObject,
  updateTable,
  updateTablePosition,
} from "@/app/admin/oturma/actions";

type Pt = { x: number; y: number };

type Gesture =
  | { type: "pan"; id: number; sx: number; sy: number; ox: number; oy: number }
  | {
      type: "drag";
      id: number;
      sx: number;
      sy: number;
      tid: string;
      otx: number;
      oty: number;
      moved: boolean;
    }
  | {
      type: "start";
      id: number;
      sx: number;
      sy: number;
      ox: number;
      oy: number;
      moved: boolean;
    }
  | {
      type: "objdrag";
      id: number;
      sx: number;
      sy: number;
      oid: string;
      otx: number;
      oty: number;
      moved: boolean;
    }
  | { type: "pen"; id: number; x1: number; y1: number }
  | null;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const SHAPE_LABEL: Record<Shape, string> = {
  round: "Yuvarlak",
  square: "Kare",
  rect: "Uzun",
};

export default function SeatingEditor({
  initialTables,
  initialGuests,
  initialEdges,
  initialPublic,
  initialStart,
  initialObjects,
  initialLines,
}: {
  initialTables: Table[];
  initialGuests: SeatGuest[];
  initialEdges: SeatEdges;
  initialPublic: boolean;
  initialStart: Pt | null;
  initialObjects: SeatObject[];
  initialLines: SeatLine[];
}) {
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [guests, setGuests] = useState<SeatGuest[]>(initialGuests);
  const [objects, setObjects] = useState<SeatObject[]>(initialObjects);
  const [lines, setLines] = useState<SeatLine[]>(initialLines);
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selObj, setSelObj] = useState<string | null>(null);
  const [selLine, setSelLine] = useState<string | null>(null);
  const [newShape, setNewShape] = useState<Shape>("round");
  const [newCap, setNewCap] = useState(8);
  const [edges, setEdges] = useState<SeatEdges>(initialEdges);
  const [guestName, setGuestName] = useState("");
  const [pub, setPub] = useState(initialPublic);
  const [start, setStart] = useState<Pt | null>(initialStart);
  const [showEdges, setShowEdges] = useState(false);
  const [penOn, setPenOn] = useState(false);
  const [penColor, setPenColor] = useState(LINE_COLORS[0]);
  const [penWidth, setPenWidth] = useState(LINE_WIDTHS[1]);
  const [penDraft, setPenDraft] = useState<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  } | null>(null);
  const [busy, setBusy] = useState(false);

  const objectsRef = useRef<SeatObject[]>(objects);
  useEffect(() => {
    objectsRef.current = objects;
  }, [objects]);

  const startRef = useRef<Pt | null>(start);
  useEffect(() => {
    startRef.current = start;
  }, [start]);

  const vpRef = useRef<HTMLDivElement>(null);
  const gestureRef = useRef<Gesture>(null);
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchRef = useRef<{ dist: number; cx: number; cy: number } | null>(null);
  const tablesRef = useRef(tables);
  useEffect(() => {
    tablesRef.current = tables;
  }, [tables]);

  const selected = tables.find((t) => t.id === selectedId) ?? null;
  const countFor = (tid: string) =>
    guests.filter((g) => g.tableId === tid).length;
  const selectedGuests = selectedId
    ? guests.filter((g) => g.tableId === selectedId)
    : [];

  // başlangıçta masaları ortala (yoksa dünya 0,0'ı ekran ortasına)
  useEffect(() => {
    const el = vpRef.current;
    if (!el) return;
    setView(
      tables.length
        ? fitView(tables, el.clientWidth, el.clientHeight)
        : { x: el.clientWidth / 2, y: el.clientHeight / 2, scale: 1 },
    );
    // yalnızca mount'ta
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // non-passive tekerlek zoom (imleç merkezli)
  useEffect(() => {
    const el = vpRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      setView((v) =>
        zoomAtPoint(
          v,
          e.clientX - rect.left,
          e.clientY - rect.top,
          e.deltaY < 0 ? 1.12 : 1 / 1.12,
        ),
      );
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const zoomButton = useCallback((factor: number) => {
    const el = vpRef.current;
    if (!el) return;
    setView((v) => zoomAtPoint(v, el.clientWidth / 2, el.clientHeight / 2, factor));
  }, []);

  const doFit = useCallback(() => {
    const el = vpRef.current;
    if (!el) return;
    setView(fitView(tablesRef.current, el.clientWidth, el.clientHeight));
  }, []);

  function startPinch() {
    const pts = [...pointersRef.current.values()];
    if (pts.length < 2) return;
    const el = vpRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const [a, b] = pts;
    pinchRef.current = {
      dist: Math.hypot(b.x - a.x, b.y - a.y),
      cx: (a.x + b.x) / 2 - rect.left,
      cy: (a.y + b.y) / 2 - rect.top,
    };
    gestureRef.current = null;
  }

  function toWorld(clientX: number, clientY: number): Pt {
    const el = vpRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    return {
      x: (clientX - rect.left - view.x) / view.scale,
      y: (clientY - rect.top - view.y) / view.scale,
    };
  }
  function clearSel() {
    setSelectedId(null);
    setSelObj(null);
    setSelLine(null);
  }

  function onPointerDown(e: RPointerEvent) {
    const el = vpRef.current;
    if (!el) return;
    el.setPointerCapture(e.pointerId);
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size >= 2) {
      startPinch();
      return;
    }

    // kalem modu: çizgi çiz
    if (penOn) {
      const w = toWorld(e.clientX, e.clientY);
      gestureRef.current = { type: "pen", id: e.pointerId, x1: w.x, y1: w.y };
      setPenDraft({ x1: w.x, y1: w.y, x2: w.x, y2: w.y });
      return;
    }

    const target = e.target as HTMLElement;

    if (target.closest("[data-start]") && startRef.current) {
      const s = startRef.current;
      gestureRef.current = {
        type: "start",
        id: e.pointerId,
        sx: e.clientX,
        sy: e.clientY,
        ox: s.x,
        oy: s.y,
        moved: false,
      };
      return;
    }

    const objEl = target.closest("[data-obj-id]") as HTMLElement | null;
    const oid = objEl?.getAttribute("data-obj-id");
    if (oid) {
      const o = objectsRef.current.find((x) => x.id === oid);
      if (o) {
        gestureRef.current = {
          type: "objdrag",
          id: e.pointerId,
          sx: e.clientX,
          sy: e.clientY,
          oid,
          otx: o.x,
          oty: o.y,
          moved: false,
        };
        setSelectedId(null);
        setSelLine(null);
        setSelObj(oid);
        return;
      }
    }

    const lineEl = target.closest("[data-line-id]") as HTMLElement | null;
    const lid = lineEl?.getAttribute("data-line-id");
    if (lid) {
      setSelectedId(null);
      setSelObj(null);
      setSelLine(lid);
      gestureRef.current = null;
      return;
    }

    const tableEl = target.closest("[data-table-id]") as HTMLElement | null;
    const tid = tableEl?.dataset.tableId;
    if (tid) {
      const t = tablesRef.current.find((x) => x.id === tid);
      if (t) {
        gestureRef.current = {
          type: "drag",
          id: e.pointerId,
          sx: e.clientX,
          sy: e.clientY,
          tid,
          otx: t.x,
          oty: t.y,
          moved: false,
        };
        setSelObj(null);
        setSelLine(null);
        setSelectedId(tid);
        return;
      }
    }
    gestureRef.current = {
      type: "pan",
      id: e.pointerId,
      sx: e.clientX,
      sy: e.clientY,
      ox: view.x,
      oy: view.y,
    };
    clearSel();
  }

  function onPointerMove(e: RPointerEvent) {
    if (pointersRef.current.has(e.pointerId)) {
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    if (pointersRef.current.size >= 2 && pinchRef.current) {
      const el = vpRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const [a, b] = [...pointersRef.current.values()];
      const dist = Math.hypot(b.x - a.x, b.y - a.y);
      const cx = (a.x + b.x) / 2 - rect.left;
      const cy = (a.y + b.y) / 2 - rect.top;
      const prev = pinchRef.current;
      const factor = dist / (prev.dist || dist);
      const panDx = cx - prev.cx;
      const panDy = cy - prev.cy;
      setView((v) =>
        zoomAtPoint({ ...v, x: v.x + panDx, y: v.y + panDy }, cx, cy, factor),
      );
      pinchRef.current = { dist, cx, cy };
      return;
    }

    const g = gestureRef.current;
    if (!g || g.id !== e.pointerId) return;
    if (g.type === "pan") {
      setView((v) => ({
        ...v,
        x: g.ox + (e.clientX - g.sx),
        y: g.oy + (e.clientY - g.sy),
      }));
    } else if (g.type === "drag") {
      if (Math.abs(e.clientX - g.sx) + Math.abs(e.clientY - g.sy) > 3)
        g.moved = true;
      const dx = (e.clientX - g.sx) / view.scale;
      const dy = (e.clientY - g.sy) / view.scale;
      setTables((ts) =>
        ts.map((t) =>
          t.id === g.tid ? { ...t, x: g.otx + dx, y: g.oty + dy } : t,
        ),
      );
    } else if (g.type === "start") {
      if (Math.abs(e.clientX - g.sx) + Math.abs(e.clientY - g.sy) > 3)
        g.moved = true;
      const dx = (e.clientX - g.sx) / view.scale;
      const dy = (e.clientY - g.sy) / view.scale;
      setStart({ x: g.ox + dx, y: g.oy + dy });
    } else if (g.type === "objdrag") {
      if (Math.abs(e.clientX - g.sx) + Math.abs(e.clientY - g.sy) > 3)
        g.moved = true;
      const dx = (e.clientX - g.sx) / view.scale;
      const dy = (e.clientY - g.sy) / view.scale;
      setObjects((os) =>
        os.map((o) =>
          o.id === g.oid ? { ...o, x: g.otx + dx, y: g.oty + dy } : o,
        ),
      );
    } else if (g.type === "pen") {
      const w = toWorld(e.clientX, e.clientY);
      setPenDraft((d) => (d ? { ...d, x2: w.x, y2: w.y } : d));
    }
  }

  function onPointerUp(e: RPointerEvent) {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) pinchRef.current = null;
    const g = gestureRef.current;
    if (g && g.id === e.pointerId) {
      gestureRef.current = null;
      if (g.type === "drag" && g.moved) {
        const cur = tablesRef.current.find((t) => t.id === g.tid);
        if (cur)
          updateTablePosition(g.tid, Math.round(cur.x), Math.round(cur.y));
      } else if (g.type === "start" && g.moved) {
        const s = startRef.current;
        if (s) setStartMark(Math.round(s.x), Math.round(s.y));
      } else if (g.type === "objdrag" && g.moved) {
        const cur = objectsRef.current.find((o) => o.id === g.oid);
        if (cur)
          updateObject(g.oid, { x: Math.round(cur.x), y: Math.round(cur.y) });
      } else if (g.type === "pen") {
        const end = toWorld(e.clientX, e.clientY);
        setPenDraft(null);
        if (Math.hypot(end.x - g.x1, end.y - g.y1) > 6) {
          const tmp: SeatLine = {
            id: `tmp-${Date.now()}`,
            x1: g.x1,
            y1: g.y1,
            x2: end.x,
            y2: end.y,
            color: penColor,
            width: penWidth,
          };
          setLines((ls) => [...ls, tmp]);
          createLine(g.x1, g.y1, end.x, end.y, penColor, penWidth).then(
            (created) => {
              setLines((ls) =>
                created
                  ? ls.map((l) => (l.id === tmp.id ? created : l))
                  : ls.filter((l) => l.id !== tmp.id),
              );
            },
          );
        }
      }
    }
  }

  async function onAddTable() {
    const el = vpRef.current;
    const cx = el ? el.clientWidth / 2 : 200;
    const cy = el ? el.clientHeight / 2 : 200;
    const wx = Math.round((cx - view.x) / view.scale);
    const wy = Math.round((cy - view.y) / view.scale);
    setBusy(true);
    const created = await createTable(newShape, newCap, wx, wy);
    setBusy(false);
    if (created) {
      setTables((ts) => [...ts, created]);
      setSelObj(null);
      setSelLine(null);
      setSelectedId(created.id);
    }
  }

  async function onAddObject() {
    const el = vpRef.current;
    const cx = el ? el.clientWidth / 2 : 200;
    const cy = el ? el.clientHeight / 2 : 200;
    const wx = Math.round((cx - view.x) / view.scale);
    const wy = Math.round((cy - view.y) / view.scale);
    const created = await createObject(wx, wy);
    if (created) {
      setObjects((os) => [...os, created]);
      setSelectedId(null);
      setSelLine(null);
      setSelObj(created.id);
    }
  }

  function patchObject(
    fields: Partial<Pick<SeatObject, "label" | "w" | "h">>,
  ) {
    if (!selObj) return;
    setObjects((os) =>
      os.map((o) => (o.id === selObj ? { ...o, ...fields } : o)),
    );
    updateObject(selObj, fields);
  }

  async function onRemoveObject() {
    if (!selObj) return;
    const id = selObj;
    setObjects((os) => os.filter((o) => o.id !== id));
    setSelObj(null);
    await deleteObject(id);
  }

  async function onRemoveLine() {
    if (!selLine) return;
    const id = selLine;
    setLines((ls) => ls.filter((l) => l.id !== id));
    setSelLine(null);
    await deleteLine(id);
  }

  function togglePen() {
    setPenOn((v) => {
      const n = !v;
      if (n) clearSel();
      return n;
    });
  }

  function patchSelected(
    fields: Partial<Pick<Table, "name" | "shape" | "capacity">>,
  ) {
    if (!selectedId) return;
    setTables((ts) =>
      ts.map((t) => (t.id === selectedId ? { ...t, ...fields } : t)),
    );
    updateTable(selectedId, fields);
  }

  async function onRemoveTable() {
    if (!selectedId) return;
    const id = selectedId;
    setTables((ts) => ts.filter((t) => t.id !== id));
    setGuests((gs) => gs.filter((g) => g.tableId !== id));
    setSelectedId(null);
    await deleteTable(id);
  }

  async function onAddGuests() {
    const names = guestName
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!names.length || !selectedId) return;
    setGuestName("");
    const gs = await addGuests(selectedId, names);
    if (gs.length) setGuests((prev) => [...prev, ...gs]);
  }

  function togglePublic() {
    const next = !pub;
    setPub(next);
    setSeatingPublicAction(next);
  }

  function placeStart() {
    const el = vpRef.current;
    const cx = el ? el.clientWidth / 2 : 200;
    const cy = el ? el.clientHeight / 2 : 200;
    const p = {
      x: Math.round((cx - view.x) / view.scale),
      y: Math.round((cy - view.y) / view.scale),
    };
    setStart(p);
    setStartMark(p.x, p.y);
  }

  function removeStart() {
    setStart(null);
    clearStartMark();
  }

  async function onRemoveGuest(id: string) {
    setGuests((gs) => gs.filter((g) => g.id !== id));
    await removeGuest(id);
  }

  function saveEdge(side: keyof SeatEdges, value: string) {
    const next = { ...edges, [side]: value || null };
    setEdges(next);
    setSeatEdges({
      top: next.top ?? "",
      right: next.right ?? "",
      bottom: next.bottom ?? "",
      left: next.left ?? "",
    });
  }

  const gridPx = 26 * view.scale;

  return (
    <div className="fixed inset-0 z-30 overflow-hidden bg-cream/40">
      {/* araç çubuğu (sol üst, yüzen) */}
      <div className="absolute left-2 top-2 z-10 flex max-w-[calc(100%-1rem)] flex-wrap items-center gap-2 rounded-2xl border border-line bg-white/85 p-2 shadow-lg backdrop-blur-sm">
        <Link
          href="/admin"
          className="rounded-full border border-ink/15 px-3 py-1.5 text-xs text-ink-soft transition hover:bg-ink/[0.04]"
        >
          ← Panel
        </Link>
        <div className="flex overflow-hidden rounded-full border border-line">
          {(Object.keys(SHAPE_LABEL) as Shape[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setNewShape(s)}
              className={`px-3 py-1.5 text-xs font-medium transition ${
                newShape === s
                  ? "bg-dusk-deep text-white"
                  : "bg-white text-ink-soft hover:bg-ink/[0.04]"
              }`}
            >
              {SHAPE_LABEL[s]}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-1.5 text-xs text-ink-soft">
          Kişi
          <input
            type="number"
            min={1}
            max={20}
            value={newCap}
            onChange={(e) => setNewCap(clamp(Number(e.target.value) || 1, 1, 20))}
            className="w-16 rounded-full border border-line bg-white px-3 py-1.5 text-sm text-ink outline-none focus:border-dusk-deep"
          />
        </label>
        <button
          type="button"
          onClick={onAddTable}
          disabled={busy}
          className="rounded-full bg-ink px-4 py-1.5 text-sm font-medium text-ivory transition hover:opacity-90 disabled:opacity-60"
        >
          + Masa Ekle
        </button>
        <button
          type="button"
          onClick={onAddObject}
          className="rounded-full border border-line px-3 py-1.5 text-sm text-ink transition hover:bg-ink/[0.04]"
        >
          + Alan
        </button>
        <button
          type="button"
          onClick={togglePen}
          className={`rounded-full px-3 py-1.5 text-sm transition ${
            penOn
              ? "bg-dusk-deep text-white"
              : "border border-line text-ink hover:bg-ink/[0.04]"
          }`}
        >
          ✏️ Çizgi
        </button>
      </div>

      {/* kalem stili (çizgi modu açıkken) */}
      {penOn && (
        <div className="absolute left-2 top-[4.75rem] z-10 flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-white/90 p-2 shadow-lg backdrop-blur-sm">
          <span className="text-xs text-ink-soft">Renk</span>
          {LINE_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setPenColor(c)}
              aria-label={c}
              className={`h-6 w-6 rounded-full border-2 transition ${
                penColor === c ? "border-ink" : "border-white"
              }`}
              style={{ background: c }}
            />
          ))}
          <span className="ml-1 text-xs text-ink-soft">Kalınlık</span>
          {LINE_WIDTHS.map((wd, i) => (
            <button
              key={wd}
              type="button"
              onClick={() => setPenWidth(wd)}
              className={`flex h-7 items-center rounded-full px-3 text-xs transition ${
                penWidth === wd
                  ? "bg-dusk-deep text-white"
                  : "border border-line text-ink hover:bg-ink/[0.04]"
              }`}
            >
              {["İnce", "Orta", "Kalın"][i]}
            </button>
          ))}
        </div>
      )}

      {/* sağ üst: aç/kapat + giriş + yönler + yazdır */}
      <div className="absolute right-2 top-2 z-10 flex max-w-[calc(100%-1rem)] flex-wrap items-center justify-end gap-2 rounded-2xl border border-line bg-white/85 p-2 shadow-lg backdrop-blur-sm">
        <button
          type="button"
          onClick={togglePublic}
          className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
            pub
              ? "bg-sage text-white"
              : "border border-line text-ink-soft hover:bg-ink/[0.04]"
          }`}
        >
          Misafirlere: {pub ? "Açık" : "Kapalı"}
        </button>
        {start ? (
          <button
            type="button"
            onClick={removeStart}
            className="rounded-full border border-line px-3 py-1.5 text-xs text-ink-soft transition hover:bg-ink/[0.04]"
          >
            🚪 Giriş kaldır
          </button>
        ) : (
          <button
            type="button"
            onClick={placeStart}
            className="rounded-full border border-line px-3 py-1.5 text-xs text-ink transition hover:bg-ink/[0.04]"
          >
            🚪 Giriş koy
          </button>
        )}
        <button
          type="button"
          onClick={() => setShowEdges((v) => !v)}
          className={`rounded-full px-3 py-1.5 text-xs transition ${
            showEdges
              ? "bg-dusk-deep text-white"
              : "border border-line text-ink hover:bg-ink/[0.04]"
          }`}
        >
          Yönler
        </button>
        <Link
          href="/admin/oturma/yazdir"
          className="rounded-full border border-line px-3 py-1.5 text-xs text-ink transition hover:bg-ink/[0.04]"
        >
          Yazdır
        </Link>
      </div>

      {/* sağ alt: zoom + sığdır */}
      <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 rounded-2xl border border-line bg-white/85 p-1.5 shadow-lg backdrop-blur-sm">
        <button
          type="button"
          onClick={doFit}
          className="rounded-full border border-line px-3 py-1.5 text-xs text-ink transition hover:bg-ink/[0.04]"
        >
          Sığdır
        </button>
        <button
          type="button"
          onClick={() => zoomButton(1 / 1.2)}
          className="h-8 w-8 rounded-full border border-line text-lg leading-none text-ink transition hover:bg-ink/[0.04]"
          aria-label="Uzaklaştır"
        >
          −
        </button>
        <button
          type="button"
          onClick={() => zoomButton(1.2)}
          className="h-8 w-8 rounded-full border border-line text-lg leading-none text-ink transition hover:bg-ink/[0.04]"
          aria-label="Yakınlaştır"
        >
          +
        </button>
      </div>

      {/* kenar yön etiketleri (Yönler ile açılır) */}
      {showEdges && (
      <div className="absolute right-2 top-[4.75rem] z-10 grid w-[min(92vw,24rem)] grid-cols-2 gap-2 rounded-2xl border border-line bg-white/85 p-2 shadow-lg backdrop-blur-sm sm:grid-cols-4">
        {(
          [
            ["top", "Üst yön"],
            ["right", "Sağ yön"],
            ["bottom", "Alt yön"],
            ["left", "Sol yön"],
          ] as [keyof SeatEdges, string][]
        ).map(([side, label]) => (
          <input
            key={side}
            defaultValue={edges[side] ?? ""}
            onBlur={(e) => saveEdge(side, e.target.value)}
            placeholder={label}
            maxLength={30}
            className="rounded-full border border-line bg-white px-3 py-1.5 text-sm text-ink outline-none focus:border-dusk-deep"
          />
        ))}
      </div>
      )}

      {/* tuval (tam ekran arka plan) */}
      <div
        ref={vpRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="absolute inset-0 z-0 touch-none select-none overflow-hidden bg-cream/40"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(51,65,75,0.10) 1px, transparent 1px)",
          backgroundSize: `${gridPx}px ${gridPx}px`,
          backgroundPosition: `${view.x}px ${view.y}px`,
        }}
      >
        <div
          className="absolute left-0 top-0"
          style={{
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
            transformOrigin: "0 0",
          }}
        >
          {lines.map((l) => {
            const cx = (l.x1 + l.x2) / 2;
            const cy = (l.y1 + l.y2) / 2;
            const len = Math.hypot(l.x2 - l.x1, l.y2 - l.y1);
            const ang = (Math.atan2(l.y2 - l.y1, l.x2 - l.x1) * 180) / Math.PI;
            return (
              <div
                key={l.id}
                data-line-id={l.id}
                className="absolute cursor-pointer"
                style={{
                  left: cx,
                  top: cy,
                  width: len,
                  height: Math.max(l.width, 16),
                  transform: `translate(-50%, -50%) rotate(${ang}deg)`,
                }}
              >
                <div
                  className="absolute left-0 top-1/2 w-full -translate-y-1/2 rounded-full"
                  style={{
                    height: l.width,
                    background: l.color,
                    outline: selLine === l.id ? "2px solid #6f97ad" : "none",
                    outlineOffset: 2,
                  }}
                />
              </div>
            );
          })}

          {objects.map((o) => (
            <div
              key={o.id}
              data-obj-id={o.id}
              className="absolute cursor-grab active:cursor-grabbing"
              style={{ left: o.x, top: o.y, width: 0, height: 0 }}
            >
              <div
                className={`absolute flex items-center justify-center rounded-lg border-2 border-dashed bg-sage/15 px-1 text-center text-[11px] font-medium leading-tight text-ink ${
                  selObj === o.id
                    ? "border-dusk-deep ring-2 ring-dusk/40"
                    : "border-sage/60"
                }`}
                style={{
                  left: 0,
                  top: 0,
                  width: o.w,
                  height: o.h,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {o.label || "Alan"}
              </div>
            </div>
          ))}

          {tables.map((t) => {
            const { w, h } = tableSize(t.shape, t.capacity);
            const chairs = chairPositions(t.shape, t.capacity);
            const isSel = t.id === selectedId;
            const count = countFor(t.id);
            const full = count >= t.capacity && t.capacity > 0;
            return (
              <div
                key={t.id}
                data-table-id={t.id}
                className="absolute cursor-grab active:cursor-grabbing"
                style={{ left: t.x, top: t.y, width: 0, height: 0 }}
              >
                {chairs.map((c, i) => (
                  <div
                    key={i}
                    className={`absolute rounded-[3px] ${
                      i < count ? "bg-dusk-deep" : "bg-dusk-deep/25"
                    }`}
                    style={{
                      left: c.x,
                      top: c.y,
                      width: 11,
                      height: 11,
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                ))}
                <div
                  className={`absolute flex flex-col items-center justify-center gap-0.5 border bg-white px-1 text-center leading-tight text-ink shadow-sm ${
                    isSel ? "border-dusk-deep ring-2 ring-dusk/40" : "border-line"
                  }`}
                  style={{
                    left: 0,
                    top: 0,
                    width: w,
                    height: h,
                    transform: "translate(-50%, -50%)",
                    borderRadius: t.shape === "round" ? 9999 : 12,
                  }}
                >
                  <span className="text-[11px] font-medium">
                    {t.name || "Masa"}
                  </span>
                  <span
                    className={`text-[9px] ${full ? "text-[#5f6e46]" : "text-ink-soft"}`}
                  >
                    {count}/{t.capacity}
                  </span>
                </div>
              </div>
            );
          })}

          {start && (
            <div
              data-start
              className="absolute cursor-grab active:cursor-grabbing"
              style={{ left: start.x, top: start.y, width: 0, height: 0 }}
            >
              <div
                className="absolute flex flex-col items-center"
                style={{ transform: "translate(-50%, -50%)" }}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-dusk-deep text-sm shadow-md">
                  🚪
                </div>
                <span className="mt-0.5 whitespace-nowrap rounded bg-ink/75 px-1.5 py-0.5 text-[9px] font-medium text-ivory">
                  Giriş
                </span>
              </div>
            </div>
          )}

          {penDraft &&
            (() => {
              const cx = (penDraft.x1 + penDraft.x2) / 2;
              const cy = (penDraft.y1 + penDraft.y2) / 2;
              const len = Math.hypot(
                penDraft.x2 - penDraft.x1,
                penDraft.y2 - penDraft.y1,
              );
              const ang =
                (Math.atan2(
                  penDraft.y2 - penDraft.y1,
                  penDraft.x2 - penDraft.x1,
                ) *
                  180) /
                Math.PI;
              return (
                <div
                  className="pointer-events-none absolute rounded-full opacity-70"
                  style={{
                    left: cx,
                    top: cy,
                    width: len,
                    height: penWidth,
                    background: penColor,
                    transform: `translate(-50%, -50%) rotate(${ang}deg)`,
                  }}
                />
              );
            })()}
        </div>

        {edges.top && (
          <EdgeTag className="left-1/2 top-2 -translate-x-1/2">
            {edges.top} ↑
          </EdgeTag>
        )}
        {edges.bottom && (
          <EdgeTag className="bottom-2 left-1/2 -translate-x-1/2">
            {edges.bottom} ↓
          </EdgeTag>
        )}
        {edges.left && (
          <EdgeTag className="left-2 top-1/2 -translate-y-1/2">
            ← {edges.left}
          </EdgeTag>
        )}
        {edges.right && (
          <EdgeTag className="right-2 top-1/2 -translate-y-1/2">
            {edges.right} →
          </EdgeTag>
        )}

        {tables.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-ink-soft">
            Yukarıdan şekil + kişi sayısı seçip “Masa Ekle” ile başla. Masaları
            sürükle, iki parmak/tekerlek/± ile yakınlaş, “Sığdır” ile hepsini
            ekrana getir.
          </div>
        )}
      </div>

      {/* seçili masa paneli (alt-orta, yüzen) */}
      {selected && (
        <div className="absolute inset-x-2 bottom-2 z-10 mx-auto flex max-h-[46vh] max-w-2xl flex-col gap-3 overflow-y-auto rounded-2xl border border-line bg-white/90 p-3 shadow-lg backdrop-blur-sm">
          <div className="flex flex-wrap items-center gap-3">
            <input
              value={selected.name}
              onChange={(e) => patchSelected({ name: e.target.value })}
              placeholder="Masa adı (ör. Masa 1)"
              maxLength={40}
              className="w-40 rounded-full border border-line bg-white px-3 py-1.5 text-sm text-ink outline-none focus:border-dusk-deep"
            />
            <div className="flex overflow-hidden rounded-full border border-line">
              {(Object.keys(SHAPE_LABEL) as Shape[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => patchSelected({ shape: s })}
                  className={`px-3 py-1.5 text-xs font-medium transition ${
                    selected.shape === s
                      ? "bg-dusk-deep text-white"
                      : "bg-white text-ink-soft hover:bg-ink/[0.04]"
                  }`}
                >
                  {SHAPE_LABEL[s]}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-1.5 text-xs text-ink-soft">
              Kişi
              <input
                type="number"
                min={1}
                max={20}
                value={selected.capacity}
                onChange={(e) =>
                  patchSelected({
                    capacity: clamp(Number(e.target.value) || 1, 1, 20),
                  })
                }
                className="w-16 rounded-full border border-line bg-white px-3 py-1.5 text-sm text-ink outline-none focus:border-dusk-deep"
              />
            </label>
            <button
              type="button"
              onClick={onRemoveTable}
              className="ml-auto rounded-full border border-[#b56a60]/40 px-4 py-1.5 text-sm text-[#b56a60] transition hover:bg-[#b56a60]/10"
            >
              Masayı sil
            </button>
          </div>

          {/* misafirler */}
          <div className="border-t border-line/70 pt-3">
            <p className="mb-2 text-xs font-medium text-ink-soft">
              Misafirler{" "}
              <span className="text-ink">
                {selectedGuests.length}/{selected.capacity}
              </span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {selectedGuests.map((g) => (
                <span
                  key={g.id}
                  className="inline-flex items-center gap-1 rounded-full bg-dusk/15 py-1 pl-3 pr-1.5 text-sm text-ink"
                >
                  {g.name}
                  <button
                    type="button"
                    onClick={() => onRemoveGuest(g.id)}
                    aria-label="Kaldır"
                    className="flex h-4 w-4 items-center justify-center rounded-full text-ink-soft transition hover:bg-ink/10 hover:text-[#b56a60]"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="mt-2 flex items-start gap-2">
              <textarea
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                rows={2}
                placeholder="İsim(ler) — her satıra bir tane; listeyi de yapıştırabilirsin"
                className="flex-1 resize-none rounded-xl border border-line bg-white px-4 py-2 text-sm text-ink outline-none focus:border-dusk-deep"
              />
              <button
                type="button"
                onClick={onAddGuests}
                className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-ivory transition hover:opacity-90"
              >
                Ekle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* seçili alan (obje) paneli */}
      {selObj &&
        (() => {
          const o = objects.find((x) => x.id === selObj);
          if (!o) return null;
          return (
            <div className="absolute inset-x-2 bottom-2 z-10 mx-auto flex max-w-xl flex-wrap items-center gap-3 rounded-2xl border border-line bg-white/90 p-3 shadow-lg backdrop-blur-sm">
              <input
                value={o.label}
                onChange={(e) => patchObject({ label: e.target.value })}
                placeholder="Alan adı (ör. Sahne, Bar, DJ)"
                maxLength={40}
                className="w-44 rounded-full border border-line bg-white px-3 py-1.5 text-sm text-ink outline-none focus:border-dusk-deep"
              />
              <label className="flex items-center gap-1.5 text-xs text-ink-soft">
                En
                <input
                  type="number"
                  min={30}
                  max={800}
                  step={10}
                  value={Math.round(o.w)}
                  onChange={(e) =>
                    patchObject({ w: clamp(Number(e.target.value) || 30, 30, 800) })
                  }
                  className="w-20 rounded-full border border-line bg-white px-3 py-1.5 text-sm text-ink outline-none focus:border-dusk-deep"
                />
              </label>
              <label className="flex items-center gap-1.5 text-xs text-ink-soft">
                Boy
                <input
                  type="number"
                  min={30}
                  max={800}
                  step={10}
                  value={Math.round(o.h)}
                  onChange={(e) =>
                    patchObject({ h: clamp(Number(e.target.value) || 30, 30, 800) })
                  }
                  className="w-20 rounded-full border border-line bg-white px-3 py-1.5 text-sm text-ink outline-none focus:border-dusk-deep"
                />
              </label>
              <button
                type="button"
                onClick={onRemoveObject}
                className="ml-auto rounded-full border border-[#b56a60]/40 px-4 py-1.5 text-sm text-[#b56a60] transition hover:bg-[#b56a60]/10"
              >
                Alanı sil
              </button>
            </div>
          );
        })()}

      {/* seçili çizgi paneli */}
      {selLine && (
        <div className="absolute inset-x-2 bottom-2 z-10 mx-auto flex max-w-xl items-center gap-3 rounded-2xl border border-line bg-white/90 p-3 shadow-lg backdrop-blur-sm">
          <span className="text-sm text-ink">Çizgi seçildi</span>
          <button
            type="button"
            onClick={onRemoveLine}
            className="ml-auto rounded-full border border-[#b56a60]/40 px-4 py-1.5 text-sm text-[#b56a60] transition hover:bg-[#b56a60]/10"
          >
            Çizgiyi sil
          </button>
        </div>
      )}
    </div>
  );
}

function EdgeTag({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`pointer-events-none absolute rounded-full bg-ink/75 px-3 py-1 text-xs font-medium text-ivory shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
