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
