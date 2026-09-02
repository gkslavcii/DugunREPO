"use client";

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
  type SeatEdges,
  type SeatGuest,
  type Shape,
  type Table,
} from "@/lib/seatingLayout";
import {
  addGuest,
  createTable,
  deleteTable,
  removeGuest,
  setSeatEdges,
  updateTable,
  updateTablePosition,
} from "@/app/admin/oturma/actions";

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
}: {
  initialTables: Table[];
  initialGuests: SeatGuest[];
  initialEdges: SeatEdges;
}) {
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [guests, setGuests] = useState<SeatGuest[]>(initialGuests);
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newShape, setNewShape] = useState<Shape>("round");
  const [newCap, setNewCap] = useState(8);
  const [edges, setEdges] = useState<SeatEdges>(initialEdges);
  const [guestName, setGuestName] = useState("");
  const [busy, setBusy] = useState(false);

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

  function onPointerDown(e: RPointerEvent) {
    const el = vpRef.current;
    if (!el) return;
    el.setPointerCapture(e.pointerId);
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size >= 2) {
      startPinch();
      return;
    }

    const tableEl = (e.target as HTMLElement).closest(
      "[data-table-id]",
    ) as HTMLElement | null;
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
    setSelectedId(null);
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
    } else {
      if (Math.abs(e.clientX - g.sx) + Math.abs(e.clientY - g.sy) > 3)
        g.moved = true;
      const dx = (e.clientX - g.sx) / view.scale;
      const dy = (e.clientY - g.sy) / view.scale;
      setTables((ts) =>
        ts.map((t) =>
          t.id === g.tid ? { ...t, x: g.otx + dx, y: g.oty + dy } : t,
        ),
      );
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
      setSelectedId(created.id);
    }
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

  async function onAddGuest() {
    const name = guestName.trim();
    if (!name || !selectedId) return;
    setGuestName("");
    const g = await addGuest(selectedId, name);
    if (g) setGuests((gs) => [...gs, g]);
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
    <div className="flex flex-col gap-3">
      {/* araç çubuğu */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-white/60 p-3">
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

        <div className="ml-auto flex items-center gap-1">
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
      </div>

      {/* kenar yön etiketleri */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
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

      {/* tuval */}
      <div
        ref={vpRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative h-[62vh] w-full touch-none select-none overflow-hidden rounded-2xl border border-line bg-cream/40"
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

      {/* seçili masa paneli */}
      {selected && (
        <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white/60 p-3">
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
            <div className="mt-2 flex gap-2">
              <input
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onAddGuest();
                  }
                }}
                placeholder="Misafir adı ekle"
                maxLength={60}
                className="flex-1 rounded-full border border-line bg-white px-4 py-1.5 text-sm text-ink outline-none focus:border-dusk-deep"
              />
              <button
                type="button"
                onClick={onAddGuest}
                className="rounded-full bg-ink px-4 py-1.5 text-sm font-medium text-ivory transition hover:opacity-90"
              >
                Ekle
              </button>
            </div>
          </div>
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
