"use client";

import { useEffect, useState } from "react";

/**
 * Hedef tarihe kalan GÜN sayısını zarifçe gösterir (anasayfa koyu hero için).
 * Sadece admin sayacı açtıysa render edilir.
 */
export default function Countdown({
  targetIso,
  label,
}: {
  targetIso: string; // "YYYY-MM-DD"
  label: string; // "Düğüne" / "Kınaya"
}) {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    const compute = () => {
      const target = new Date(`${targetIso}T00:00:00`);
      if (Number.isNaN(target.getTime())) return setDays(null);
      const now = new Date();
      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );
      setDays(
        Math.round(
          (target.getTime() - startOfToday.getTime()) / 86_400_000,
        ),
      );
    };
    compute();
    const t = setInterval(compute, 60_000);
    return () => clearInterval(t);
  }, [targetIso]);

  if (days === null || days < 0) return null;

  return (
    <div className="flex flex-col items-center gap-1 text-ivory">
      {days === 0 ? (
        <p className="font-display text-2xl text-[#e7d0a2]">Bugün! 🎉</p>
      ) : (
        <p className="flex items-baseline gap-2">
          <span className="text-xs uppercase tracking-[0.3em] text-ivory/70">
            {label}
          </span>
          <span className="font-display text-3xl leading-none text-[#e7d0a2]">
            {days}
          </span>
          <span className="text-xs uppercase tracking-[0.3em] text-ivory/70">
            gün
          </span>
        </p>
      )}
    </div>
  );
}
