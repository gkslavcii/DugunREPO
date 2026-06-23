"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fotoğraftan hafif 3D / derinlik efekti.
 * Masaüstünde fareyle, mobilde cihaz eğimiyle (gyro) yumuşakça hareket eder.
 * "Hareketi azalt" tercihi açıksa sabit durur.
 *
 * Fotoğraf henüz yoksa (public/images/couple.png) zarif bir yer tutucu gösterir.
 */
export default function ParallaxCouple({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) return;

    let raf = 0;
    let tx = 0,
      ty = 0,
      cx = 0,
      cy = 0;

    const onMove = (e: MouseEvent) => {
      tx = (e.clientX / window.innerWidth) * 2 - 1;
      ty = (e.clientY / window.innerHeight) * 2 - 1;
    };

    const onTilt = (e: DeviceOrientationEvent) => {
      tx = Math.max(-1, Math.min(1, (e.gamma ?? 0) / 35));
      ty = Math.max(-1, Math.min(1, (e.beta ?? 0) / 35));
    };

    const loop = () => {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      const el = imgRef.current;
      if (el) {
        el.style.transform = `translate3d(${cx * 14}px, ${cy * 12}px, 0) rotateX(${-cy * 3}deg) rotateY(${cx * 4}deg)`;
      }
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("deviceorientation", onTilt, true);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("deviceorientation", onTilt);
    };
  }, []);

  return (
    <div className="relative [perspective:1200px]">
      {/* yere düşen yumuşak gölge */}
      <div
        aria-hidden
        className="absolute inset-x-10 bottom-1 h-7 rounded-[50%] bg-ink/20 blur-2xl"
      />

      {!imgError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          draggable={false}
          onError={() => setImgError(true)}
          className="relative max-h-[46vh] w-auto max-w-[88vw] select-none object-contain drop-shadow-2xl [transform-style:preserve-3d] sm:max-h-[56vh]"
        />
      ) : (
        <div className="flex h-[42vh] max-h-[460px] w-[78vw] max-w-[330px] flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-dusk-deep/40 bg-white/50 px-6 text-center sm:h-[50vh]">
          <div className="font-display text-3xl text-dusk-deep">
            Sezin &amp; Göksel
          </div>
          <p className="text-sm leading-relaxed text-ink-soft">
            İkinizin arka planı silinmiş fotoğrafı buraya gelecek.
          </p>
          <code className="rounded bg-ink/5 px-2 py-1 text-[11px] text-ink-soft">
            public/images/couple.png
          </code>
        </div>
      )}
    </div>
  );
}
