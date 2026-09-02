/**
 * Oturma planı için saf yardımcılar (sunucu + client ortak kullanır).
 * Masa şekline ve kapasitesine göre masa boyutu ve sandalye konumlarını üretir.
 */
export type Shape = "round" | "square" | "rect";

export type Table = {
  id: string;
  name: string;
  shape: Shape;
  capacity: number;
  x: number;
  y: number;
};

export type SeatEdges = {
  top: string | null;
  right: string | null;
  bottom: string | null;
  left: string | null;
};

export type SeatGuest = {
  id: string;
  name: string;
  tableId: string | null;
};

export type View = { x: number; y: number; scale: number };

export const MIN_SCALE = 0.3;
export const MAX_SCALE = 3;

export function clampScale(s: number): number {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));
}

/** Bir noktayı sabit tutarak (imleç/pinch merkezi) yakınlaştırır. */
export function zoomAtPoint(
  v: View,
  cx: number,
  cy: number,
  factor: number,
): View {
  const ns = clampScale(v.scale * factor);
  const wx = (cx - v.x) / v.scale;
  const wy = (cy - v.y) / v.scale;
  return { x: cx - wx * ns, y: cy - wy * ns, scale: ns };
}

/** Tüm masaları görünür alana ortalayacak görünümü hesaplar. */
export function fitView(
  tables: Table[],
  vpW: number,
  vpH: number,
): View {
  if (tables.length === 0 || vpW <= 0 || vpH <= 0) {
    return { x: vpW / 2, y: vpH / 2, scale: 1 };
  }
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const t of tables) {
    const { w, h } = tableSize(t.shape, t.capacity);
    const pad = Math.max(w, h) / 2 + 28; // sandalyeler dahil
    minX = Math.min(minX, t.x - pad);
    minY = Math.min(minY, t.y - pad);
    maxX = Math.max(maxX, t.x + pad);
    maxY = Math.max(maxY, t.y + pad);
  }
  const cw = Math.max(1, maxX - minX);
  const ch = Math.max(1, maxY - minY);
  const margin = 48;
  const scale = clampScale(
    Math.min((vpW - margin) / cw, (vpH - margin) / ch, 1.4),
  );
  const ccx = (minX + maxX) / 2;
  const ccy = (minY + maxY) / 2;
  return { x: vpW / 2 - ccx * scale, y: vpH / 2 - ccy * scale, scale };
}

export const SHAPES: Shape[] = ["round", "square", "rect"];

export function normShape(s: unknown): Shape {
  return SHAPES.includes(s as Shape) ? (s as Shape) : "round";
}

/** Masa gövdesinin dünya-pikseli boyutu. */
export function tableSize(shape: Shape, capacity: number): { w: number; h: number } {
  const n = Math.max(1, capacity);
  if (shape === "round") {
    const d = Math.max(58, 30 + n * 6);
    return { w: d, h: d };
  }
  if (shape === "square") {
    const s = Math.max(58, 42 + n * 4);
    return { w: s, h: s };
  }
  // uzun masa (dikdörtgen)
  const half = Math.ceil(n / 2);
  return { w: Math.max(96, half * 34), h: 54 };
}

/** Masa merkezine göre (0,0) sandalye konumları. */
export function chairPositions(
  shape: Shape,
  capacity: number,
): { x: number; y: number }[] {
  const n = Math.max(1, capacity);
  const { w, h } = tableSize(shape, capacity);
  const gap = 12;
  const out: { x: number; y: number }[] = [];

  if (shape === "round") {
    const r = w / 2 + gap;
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      out.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
    }
    return out;
  }

  const placeH = (count: number, y: number) => {
    for (let i = 0; i < count; i++) {
      out.push({ x: -w / 2 + (w * (i + 1)) / (count + 1), y });
    }
  };
  const placeV = (count: number, x: number) => {
    for (let i = 0; i < count; i++) {
      out.push({ x, y: -h / 2 + (h * (i + 1)) / (count + 1) });
    }
  };

  if (shape === "rect") {
    const top = Math.ceil(n / 2);
    placeH(top, -h / 2 - gap);
    placeH(n - top, h / 2 + gap);
    return out;
  }

  // kare: 4 kenara dağıt
  const counts = [0, 0, 0, 0];
  for (let i = 0; i < n; i++) counts[i % 4]++;
  placeH(counts[0], -h / 2 - gap);
  placeV(counts[1], w / 2 + gap);
  placeH(counts[2], h / 2 + gap);
  placeV(counts[3], -w / 2 - gap);
  return out;
}
