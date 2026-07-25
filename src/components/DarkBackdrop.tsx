import { Sprig } from "./ornaments";
import FloatingLeaves from "./FloatingLeaves";

/**
 * İç sayfalar (Andaç, Fotoğraflar) için anasayfayla aynı KOYU sinematik tema.
 * Hafif fotoğraf + mürekkep perdesi + ışıltılar + doku + altın çerçeve.
 * `fixed` olduğundan uzun/kaydırılan sayfalarda da ekranı sarar; içerik üstünde akar.
 */
export default function DarkBackdrop() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/dans.jpg"
          alt=""
          className="h-full w-full scale-110 object-cover opacity-[0.12] blur-2xl"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/85 via-ink/80 to-ink/95" />
        <div className="absolute left-1/2 top-[-8%] h-[46vh] w-[46vh] -translate-x-1/2 rounded-full bg-dusk/15 blur-3xl" />
        <div className="absolute bottom-[-12%] right-[-6%] h-[40vh] w-[40vh] rounded-full bg-sage/12 blur-3xl" />
        <div className="absolute left-[-10%] top-[38%] h-[32vh] w-[32vh] rounded-full bg-[#d9c08a]/12 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgb(20_26_31_/_0.55))]" />
        <div className="grain absolute inset-0 opacity-[0.05] mix-blend-soft-light" />
      </div>

      {/* altın çerçeve + köşe dalları (anasayfayla aynı imza) */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-3 -z-10 rounded-[26px] border border-[#d9c08a]/40 sm:inset-5"
      />
      <Sprig className="pointer-events-none fixed left-5 top-5 -z-10 h-3 w-10 rotate-[35deg] text-[#d9c08a]/45 sm:left-8 sm:top-8" />
      <Sprig className="pointer-events-none fixed right-5 top-5 -z-10 h-3 w-10 -rotate-[35deg] -scale-x-100 text-[#d9c08a]/45 sm:right-8 sm:top-8" />
      <Sprig className="pointer-events-none fixed bottom-5 left-5 -z-10 h-3 w-10 -rotate-[35deg] text-[#d9c08a]/45 sm:bottom-8 sm:left-8" />
      <Sprig className="pointer-events-none fixed bottom-5 right-5 -z-10 h-3 w-10 rotate-[35deg] -scale-x-100 text-[#d9c08a]/45 sm:bottom-8 sm:right-8" />

      <FloatingLeaves />
    </>
  );
}
