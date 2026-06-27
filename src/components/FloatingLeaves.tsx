import type { CSSProperties } from "react";

type Leaf = {
  left: string;
  size: number;
  dur: number;
  delay: number;
  drift: number;
  spin: number;
  op: number;
  tone: string;
};

// Sabit değerler (rastgele değil) — hydration uyumsuzluğu olmasın.
const LEAVES: Leaf[] = [
  { left: "6%", size: 16, dur: 17, delay: 0, drift: 30, spin: 220, op: 0.35, tone: "text-sage" },
  { left: "18%", size: 11, dur: 22, delay: 5, drift: -20, spin: 280, op: 0.3, tone: "text-dusk-deep" },
  { left: "33%", size: 14, dur: 19, delay: 9, drift: 24, spin: 200, op: 0.28, tone: "text-sage" },
  { left: "49%", size: 9, dur: 24, delay: 2, drift: -16, spin: 320, op: 0.24, tone: "text-dusk" },
  { left: "63%", size: 15, dur: 18, delay: 12, drift: 28, spin: 240, op: 0.32, tone: "text-sage" },
  { left: "77%", size: 12, dur: 21, delay: 4, drift: -22, spin: 260, op: 0.3, tone: "text-dusk-deep" },
  { left: "89%", size: 10, dur: 23, delay: 8, drift: 18, spin: 300, op: 0.26, tone: "text-sage" },
];

/** Arka planda usulca süzülen yapraklar (saf CSS animasyonu). */
export default function FloatingLeaves() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {LEAVES.map((l, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`leaf absolute top-0 ${l.tone}`}
          style={
            {
              left: l.left,
              width: l.size,
              height: l.size,
              animation: `leafFall ${l.dur}s linear ${l.delay}s infinite`,
              "--drift": `${l.drift}px`,
              "--spin": `${l.spin}deg`,
              "--leaf-op": l.op,
            } as CSSProperties
          }
        >
          <path d="M12 1.5c-4.5 4-6.5 8.5-6.5 12 0 3.6 2.9 6.5 6.5 6.5s6.5-2.9 6.5-6.5c0-3.5-2-8-6.5-12z" />
          <path
            d="M12 4.5v13"
            stroke="#ffffff"
            strokeWidth="0.6"
            opacity="0.25"
            fill="none"
          />
        </svg>
      ))}
    </div>
  );
}
