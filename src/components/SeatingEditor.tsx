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
  tableSize,
  type SeatEdges,
  type Shape,
  type Table,
} from "@/lib/seatingLayout";
import {
  createTable,
  deleteTable,
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

const MIN_SCALE = 0.35;
const MAX_SCALE = 3;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const SHAPE_LABEL: Record<Shape, string> = {
  round: "Yuvarlak",
  square: "Kare",
  rect: "Uzun",
};

export default function SeatingEditor({
  initialTables,
  initialEdges,
}: {
  initialTables: Table[];
  initialEdges: SeatEdges;
}) {
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newShape, setNewShape] = useState<Shape>("round");
  const [newCap, setNewCap] = useState(8);
  const [edges, setEdges] = useState<SeatEdges>(initialEdges);
  const [busy, setBusy] = useState(false);

  const vpRef = useRef<HTMLDivElement>(null);
  const gestureRef = useRef<Gesture>(null);
  const tablesRef = useRef(tables);
  useEffect(() => {
    tablesRef.current = tables;
  }, [tables]);

  const selected = tables.find((t) => t.id === selectedId) ?? null;

  const zoomAt = useCallback((cx: number, cy: number, factor: number) => {
    setView((v) => {
      const ns = clamp(v.scale * factor, MIN_SCALE, MAX_SCALE);
      const wx = (cx - v.x) / v.scale;
      const wy = (cy - v.y) / v.scale;
      return { x: cx - wx * ns, y: cy - wy * ns, scale: ns };
    });
  }, []);

  // başlangıçta dünya (0,0)'ı ekranın ortasına al
  useEffect(() => {
    const el = vpRef.current;
    if (el)
      setView((v) => ({ ...v, x: el.clientWidth / 2, y: el.clientHeight / 2 }));
  }, []);

  // non-passive wheel zoom (imleç merkezli)
  useEffect(() => {
    const el = vpRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      zoomAt(
        e.clientX - rect.left,
        e.clientY - rect.top,
        e.deltaY < 0 ? 1.12 : 1 / 1.12,
      );
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  function zoomButton(factor: number) {
    const el = vpRef.current;
    if (!el) return;
    zoomAt(el.clientWidth / 2, el.clientHeight / 2, factor);
  }

  function onBgPointerDown(e: RPointerEvent) {
    vpRef.current?.setPointerCapture(e.pointerId);
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

  function onTablePointerDown(e: RPointerEvent, t: Table) {
    e.stopPropagation();
    vpRef.current?.setPointerCapture(e.pointerId);
    gestureRef.current = {
      type: "drag",
      id: e.pointerId,
      sx: e.clientX,
      sy: e.clientY,
      tid: t.id,
      otx: t.x,
      oty: t.y,
      moved: false,
    };
    setSelectedId(t.id);
  }

  function onPointerMove(e: RPointerEvent) {
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
    const g = gestureRef.current;
    gestureRef.current = null;
    if (!g || g.id !== e.pointerId) return;
    if (g.type === "drag" && g.moved) {
      const cur = tablesRef.current.find((t) => t.id === g.tid);
      if (cur) updateTablePosition(g.tid, Math.round(cur.x), Math.round(cur.y));
    }
  }

  async function addTable() {
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

  function patchSelected(fields: Partial<Pick<Table, "name" | "shape" | "capacity">>) {
    if (!selectedId) return;
    setTables((ts) =>
      ts.map((t) => (t.id === selectedId ? { ...t, ...fields } : t)),
    );
    updateTable(selectedId, fields);
  }

  async function removeSelected() {
    if (!selectedId) return;
    const id = selectedId;
    setTables((ts) => ts.filter((t) => t.id !== id));
    setSelectedId(null);
    await deleteTable(id);
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
          onClick={addTable}
          disabled={busy}
          className="rounded-full bg-ink px-4 py-1.5 text-sm font-medium text-ivory transition hover:opacity-90 disabled:opacity-60"
        >
          + Masa Ekle
        </button>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => zoomButton(1 / 1.2)}
            className="h-8 w-8 rounded-full border border-line text-ink transition hover:bg-ink/[0.04]"
            aria-label="Uzaklaştır"
          >
            −
          </button>
          <button
            type="button"
            onClick={() => zoomButton(1.2)}
            className="h-8 w-8 rounded-full border border-line text-ink transition hover:bg-ink/[0.04]"
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
        onPointerDown={onBgPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative h-[62vh] w-full touch-none overflow-hidden rounded-2xl border border-line bg-cream/40"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(51,65,75,0.10) 1px, transparent 1px)",
          backgroundSize: `${gridPx}px ${gridPx}px`,
          backgroundPosition: `${view.x}px ${view.y}px`,
        }}
      >
        {/* dünya katmanı */}
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
            return (
              <div
                key={t.id}
                onPointerDown={(e) => onTablePointerDown(e, t)}
                className="absolute cursor-grab active:cursor-grabbing"
                style={{ left: t.x, top: t.y, width: 0, height: 0 }}
              >
                {chairs.map((c, i) => (
                  <div
                    key={i}
                    className="absolute rounded-[3px] bg-dusk-deep/45"
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
                  className={`absolute flex items-center justify-center border bg-white text-center text-[11px] font-medium leading-tight text-ink shadow-sm ${
                    isSel
                      ? "border-dusk-deep ring-2 ring-dusk/40"
                      : "border-line"
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
                  {t.name || `Masa`}
                </div>
              </div>
            );
          })}
        </div>

        {/* ekran kenarına sabit yön etiketleri */}
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
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-center text-sm text-ink-soft">
            Yukarıdan şekil + kişi sayısı seçip “Masa Ekle” ile başla.
            <br />
            Masaları sürükleyerek diz, tekerlek/±&nbsp;ile yakınlaş.
          </div>
        )}
      </div>

      {/* seçili masa paneli */}
      {selected && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-white/60 p-3">
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
            onClick={removeSelected}
            className="ml-auto rounded-full border border-[#b56a60]/40 px-4 py-1.5 text-sm text-[#b56a60] transition hover:bg-[#b56a60]/10"
          >
            Masayı sil
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
