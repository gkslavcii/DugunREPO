"use client";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as RPointerEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  chairPositions,
  clampScale,
  fitView,
  tableSize,
  zoomAtPoint,
  type SeatEdges,
  type Table,
} from "@/lib/seatingLayout";
import { searchGuestTable, type SeatMatch } from "@/app/oturma/actions";

type Pan = { id: number; sx: number; sy: number; ox: number; oy: number } | null;

export default function SeatingViewer({
  tables,
  edges,
  start,
}: {
  tables: Table[];
  edges: SeatEdges;
  start: { x: number; y: number } | null;
}) {
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 });
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<SeatMatch[]>([]);
  const [searched, setSearched] = useState(false);
  const [highlight, setHighlight] = useState<{
    tableId: string;
    guest: string;
  } | null>(null);

  const vpRef = useRef<HTMLDivElement>(null);
  const panRef = useRef<Pan>(null);
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchRef = useRef<{ dist: number; cx: number; cy: number } | null>(null);

  const highTable = highlight
    ? tables.find((t) => t.id === highlight.tableId) ?? null
    : null;

  useEffect(() => {
    const el = vpRef.current;
    if (el) setView(fitView(tables, el.clientWidth, el.clientHeight));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // aramayı geciktir
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setMatches([]);
      setSearched(false);
      return;
    }
    const t = setTimeout(async () => {
      const res = await searchGuestTable(q);
      setMatches(res);
      setSearched(true);
      if (res.length === 1) selectMatch(res[0]);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  function centerOn(tableId: string) {
    const t = tables.find((x) => x.id === tableId);
    const el = vpRef.current;
    if (!t || !el) return;
    setView((v) => {
      const s = clampScale(Math.max(v.scale, 1.1));
      return {
        x: el.clientWidth / 2 - t.x * s,
        y: el.clientHeight / 2 - t.y * s,
        scale: s,
      };
    });
  }

  function selectMatch(m: SeatMatch) {
    if (!m.tableId) return;
    setHighlight({ tableId: m.tableId, guest: m.guest });
    centerOn(m.tableId);
  }

  function startPinch() {
    const pts = [...pointersRef.current.values()];
    const el = vpRef.current;
    if (pts.length < 2 || !el) return;
    const rect = el.getBoundingClientRect();
    const [a, b] = pts;
    pinchRef.current = {
      dist: Math.hypot(b.x - a.x, b.y - a.y),
      cx: (a.x + b.x) / 2 - rect.left,
      cy: (a.y + b.y) / 2 - rect.top,
    };
    panRef.current = null;
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
    panRef.current = {
      id: e.pointerId,
      sx: e.clientX,
      sy: e.clientY,
      ox: view.x,
      oy: view.y,
    };
  }

  function onPointerMove(e: RPointerEvent) {
    if (pointersRef.current.has(e.pointerId))
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

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
      setView((v) =>
        zoomAtPoint(
          { ...v, x: v.x + (cx - prev.cx), y: v.y + (cy - prev.cy) },
          cx,
          cy,
          factor,
        ),
      );
      pinchRef.current = { dist, cx, cy };
      return;
    }

    const p = panRef.current;
    if (!p || p.id !== e.pointerId) return;
    setView((v) => ({
      ...v,
      x: p.ox + (e.clientX - p.sx),
      y: p.oy + (e.clientY - p.sy),
    }));
  }

  function onPointerUp(e: RPointerEvent) {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) pinchRef.current = null;
    if (panRef.current?.id === e.pointerId) panRef.current = null;
  }

  function zoomButton(factor: number) {
    const el = vpRef.current;
    if (!el) return;
    setView((v) =>
      zoomAtPoint(v, el.clientWidth / 2, el.clientHeight / 2, factor),
    );
  }
  function doFit() {
    const el = vpRef.current;
    if (el) setView(fitView(tables, el.clientWidth, el.clientHeight));
  }

  const gridPx = 26 * view.scale;

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-ivory">
      {/* üst şerit (yüzen) */}
      <div className="absolute inset-x-2 top-2 z-10 mx-auto flex max-w-xl flex-col gap-2 rounded-2xl border border-line bg-white/90 px-4 py-3 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="rounded-full border border-ink/15 px-3 py-1.5 text-xs text-ink-soft transition hover:bg-ink/[0.04]"
          >
            ← Ana sayfa
          </Link>
          <h1 className="font-display text-2xl text-ink">Yerini Bul</h1>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="İsmini yaz…"
          autoFocus
          className="w-full rounded-full border border-line bg-white px-4 py-2.5 text-sm text-ink shadow-sm outline-none focus:border-dusk-deep focus:ring-2 focus:ring-dusk/30"
        />

        {highlight && highTable ? (
          <p className="text-sm text-ink">
            <span className="font-medium">{highlight.guest}</span> →{" "}
            <span className="font-display text-xl text-dusk-deep">
              {highTable.name || "Masa"}
            </span>{" "}
            <span className="text-ink-soft">· haritada işaretli</span>
          </p>
        ) : query.trim().length >= 2 && matches.length > 1 ? (
          <div className="flex flex-wrap gap-1.5">
            {matches.map((m, i) => (
              <button
                key={i}
                type="button"
                onClick={() => selectMatch(m)}
                className="rounded-full border border-line bg-white px-3 py-1 text-sm text-ink transition hover:border-dusk-deep"
              >
                {m.guest}
              </button>
            ))}
          </div>
        ) : searched && matches.length === 0 ? (
          <p className="text-sm text-ink-soft">
            İsim bulunamadı. Karşılamadaki görevlilere sorabilirsin. 🙂
          </p>
        ) : null}
      </div>

      {/* harita */}
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
          {start && highTable && (
            <svg
              className="pointer-events-none absolute left-0 top-0 overflow-visible"
              style={{ width: 0, height: 0 }}
              aria-hidden
            >
              <line
                x1={start.x}
                y1={start.y}
                x2={highTable.x}
                y2={highTable.y}
                stroke="#6f97ad"
                strokeWidth={3}
                strokeLinecap="round"
                strokeDasharray="2 10"
                vectorEffect="non-scaling-stroke"
                className="seat-path"
              />
            </svg>
          )}

          {tables.map((t) => {
            const { w, h } = tableSize(t.shape, t.capacity);
            const chairs = chairPositions(t.shape, t.capacity);
            const isHigh = highlight?.tableId === t.id;
            return (
              <div
                key={t.id}
                className="absolute"
                style={{ left: t.x, top: t.y, width: 0, height: 0 }}
              >
                {chairs.map((c, i) => (
                  <div
                    key={i}
                    className={`absolute rounded-[3px] ${
                      isHigh ? "bg-dusk-deep" : "bg-dusk-deep/40"
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
                  className={`absolute flex items-center justify-center border bg-white text-center text-[11px] font-medium leading-tight text-ink ${
                    isHigh
                      ? "border-dusk-deep shadow-lg ring-4 ring-dusk/50"
                      : "border-line shadow-sm"
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
                  {t.name || "Masa"}
                </div>
                {isHigh && (
                  <div
                    className="absolute animate-bounce text-2xl"
                    style={{
                      left: 0,
                      top: -h / 2 - 30,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    📍
                  </div>
                )}
              </div>
            );
          })}

          {start && (
            <div
              className="absolute"
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
            Oturma planı henüz hazırlanmadı.
          </div>
        )}
      </div>

      {/* sağ alt: zoom */}
      <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 rounded-2xl border border-line bg-white/85 p-1.5 shadow-lg backdrop-blur-sm">
        <button
          type="button"
          onClick={doFit}
          className="rounded-full border border-line px-3 py-1.5 text-xs text-ink transition hover:bg-ink/[0.04]"
        >
          Tümü
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
