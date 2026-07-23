"use client";

import { useState, useEffect, useRef } from "react";

/**
 * Tam ekran, kendi kendine ilerleyen fotoğraf duvarı.
 * Her 6 sn'de bir sonraki fotoğrafa geçer; her 20 sn'de yeni yüklemeleri çeker
 * ve yeni bir fotoğraf gelirse onu öne alır.
 */
export default function PhotoWall({ initialKeys }: { initialKeys: string[] }) {
  const [keys, setKeys] = useState<string[]>(initialKeys);
  const [index, setIndex] = useState(0);
  const seen = useRef<Set<string>>(new Set(initialKeys));

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch("/api/photos", { cache: "no-store" });
        const { photos } = await res.json();
        const list: string[] = (photos ?? []).map(
          (p: { key: string }) => p.key,
        );
        const fresh = list.filter((k) => !seen.current.has(k));
        list.forEach((k) => seen.current.add(k));
        setKeys(list);
        if (fresh.length > 0) setIndex(0); // liste newest-first: en yeniyi öne al
      } catch {
        /* sessizce geç */
      }
    };
    const id = setInterval(poll, 20000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (keys.length <= 1) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % keys.length),
      6000,
    );
    return () => clearInterval(id);
  }, [keys.length]);

  const current = keys.length ? keys[index % keys.length] : undefined;

  return (
    <main className="relative flex h-dvh w-screen items-center justify-center overflow-hidden bg-ink">
      {current ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={current}
          src={`/foto/${current}?w=1600`}
          alt=""
          className="max-h-full max-w-full animate-[wallFade_1s_ease] object-contain"
        />
      ) : (
        <div className="px-6 text-center text-ivory/80">
          <p className="font-display text-5xl">İlk fotoğrafı bekliyoruz</p>
          <p className="mt-3 text-ivory/60">
            Kareyi okutup ilk kareyi siz yükleyin 📸
          </p>
        </div>
      )}

      {/* köşe: monogram + QR + ipucu */}
      <div className="absolute bottom-6 right-6 flex items-center gap-3 rounded-2xl bg-black/35 px-4 py-3 backdrop-blur-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/qr/qr.png" alt="QR" className="h-16 w-16 rounded bg-white p-1" />
        <div className="text-left text-ivory">
          <p className="font-display text-lg leading-tight">Sezin &amp; Göksel</p>
          <p className="text-xs text-ivory/80">Kareyi okut · sen de yükle</p>
        </div>
      </div>
    </main>
  );
}
