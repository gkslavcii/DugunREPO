"use client";

import type { CSSProperties } from "react";

// Başarı anında bir kerelik düşen yaprak/yaprakçık efekti.
const PETALS = [
  { left: "12%", dur: 2.6, delay: 0, size: 16, r: 300, tone: "#d8a7a0" },
  { left: "24%", dur: 3.0, delay: 0.2, size: 12, r: -280, tone: "#a3b18a" },
  { left: "38%", dur: 2.4, delay: 0.05, size: 18, r: 340, tone: "#9cbccd" },
  { left: "50%", dur: 3.2, delay: 0.3, size: 14, r: -320, tone: "#d8a7a0" },
  { left: "62%", dur: 2.7, delay: 0.1, size: 16, r: 300, tone: "#a3b18a" },
  { left: "74%", dur: 3.1, delay: 0.25, size: 12, r: -300, tone: "#9cbccd" },
  { left: "86%", dur: 2.5, delay: 0.15, size: 15, r: 330, tone: "#d8a7a0" },
  { left: "18%", dur: 2.9, delay: 0.4, size: 13, r: -340, tone: "#9cbccd" },
  { left: "56%", dur: 2.8, delay: 0.5, size: 17, r: 310, tone: "#a3b18a" },
  { left: "68%", dur: 3.0, delay: 0.35, size: 12, r: -290, tone: "#d8a7a0" },
];

export default function Petals() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
    >
      {PETALS.map((p, i) => (
        <span
          key={i}
          className="absolute -top-8"
          style={
            {
              left: p.left,
              animation: `petalFall ${p.dur}s ease-in ${p.delay}s forwards`,
              "--r": `${p.r}deg`,
            } as CSSProperties
          }
        >
          <svg width={p.size} height={p.size} viewBox="0 0 24 24" fill={p.tone}>
            <path d="M12 2 C 7 8, 7 15, 12 22 C 17 15, 17 8, 12 2 Z" />
          </svg>
        </span>
      ))}
    </div>
  );
}
