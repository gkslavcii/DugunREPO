import Link from "next/link";
import { siteConfig } from "@/config/site";
import ParallaxCouple from "@/components/ParallaxCouple";
import FloatingLeaves from "@/components/FloatingLeaves";
import { Monogram, Sprig } from "@/components/ornaments";

export default function Home() {
  const { coupleNames, mode, events, coupleImage } = siteConfig;
  const ev = events[mode];

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-5 sm:py-8">
      {/* yarı saydam fotoğraf arka planı */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-30 overflow-hidden"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/couple-original.jpeg"
          alt=""
          className="h-full w-full scale-110 object-cover opacity-[0.16] blur-2xl"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ivory/75 via-ivory/45 to-ivory/80" />
      </div>

      {/* ışıltılar + doku + vinyet */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-20">
        <div className="absolute left-1/2 top-[-12%] h-[55vh] w-[55vh] -translate-x-1/2 rounded-full bg-dusk/20 blur-3xl" />
        <div className="absolute bottom-[-15%] right-[-8%] h-[42vh] w-[42vh] rounded-full bg-sage/18 blur-3xl" />
        <div className="absolute left-[-8%] top-[28%] h-[34vh] w-[34vh] rounded-full bg-[#d9c08a]/15 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(51,65,75,0.08))]" />
        <div className="grain absolute inset-0 opacity-[0.06] mix-blend-soft-light" />
      </div>

      {/* süzülen yapraklar */}
      <FloatingLeaves />

      {/* zarif çerçeve */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-3 rounded-[26px] border border-[#c9a96a]/40 sm:inset-5"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-4 rounded-[22px] border border-dusk-deep/15 sm:inset-6"
      />
      <Sprig className="pointer-events-none absolute left-5 top-5 h-3 w-10 rotate-[35deg] text-sage/45 sm:left-8 sm:top-8" />
      <Sprig className="pointer-events-none absolute right-5 top-5 h-3 w-10 -rotate-[35deg] -scale-x-100 text-sage/45 sm:right-8 sm:top-8" />
      <Sprig className="pointer-events-none absolute bottom-5 left-5 h-3 w-10 -rotate-[35deg] text-sage/45 sm:bottom-8 sm:left-8" />
      <Sprig className="pointer-events-none absolute bottom-5 right-5 h-3 w-10 rotate-[35deg] -scale-x-100 text-sage/45 sm:bottom-8 sm:right-8" />

      {/* içerik */}
      <div className="reveal" style={{ animationDelay: "0.05s" }}>
        <Monogram left={coupleNames.bride[0]} right={coupleNames.groom[0]} />
      </div>

      <p
        className="reveal mb-3 mt-3 text-center text-xs font-medium uppercase tracking-[0.35em] text-ink-soft sm:mb-5 sm:mt-4 sm:text-sm"
        style={{ animationDelay: "0.18s" }}
      >
        {ev.eyebrow}
      </p>

      <div className="reveal" style={{ animationDelay: "0.32s" }}>
        <ParallaxCouple
          src={coupleImage}
          alt={`${coupleNames.bride} & ${coupleNames.groom}`}
        />
      </div>

      <h1
        className="reveal mt-4 text-center font-display text-5xl font-medium leading-none text-ink sm:mt-6 sm:text-6xl md:text-7xl"
        style={{ animationDelay: "0.5s" }}
      >
        {coupleNames.bride}
        <span className="mx-3 align-middle font-display text-3xl italic text-dusk-deep sm:text-4xl">
          &amp;
        </span>
        {coupleNames.groom}
      </h1>

      <div
        className="reveal my-3 flex items-center gap-3 sm:my-5"
        style={{ animationDelay: "0.62s" }}
      >
        <Sprig className="h-5 w-14 text-sage/80" />
        <span className="h-1.5 w-1.5 rotate-45 bg-dusk-deep/50" />
        <Sprig className="h-5 w-14 -scale-x-100 text-sage/80" />
      </div>

      <p
        className="reveal max-w-md text-center font-body text-base leading-relaxed text-ink-soft sm:text-xl"
        style={{ animationDelay: "0.74s" }}
      >
        {ev.welcome}
      </p>

      <div
        className="reveal mt-6 flex w-full max-w-sm flex-col gap-2.5 sm:mt-8 sm:max-w-none sm:flex-row sm:justify-center"
        style={{ animationDelay: "0.88s" }}
      >
        <Link
          href="/andac"
          className="inline-flex h-11 items-center justify-center rounded-full border border-ink/15 bg-white/50 px-8 font-body text-sm font-medium tracking-wide text-ink transition hover:border-ink/30 hover:bg-white/80 sm:h-12"
        >
          Andaç Bırak
        </Link>
        <Link
          href="/fotograflar"
          className="inline-flex h-11 items-center justify-center rounded-full bg-ink px-8 font-body text-sm font-medium tracking-wide text-ivory shadow-sm transition hover:opacity-90 sm:h-12"
        >
          Fotoğraf Yükle
        </Link>
      </div>
    </main>
  );
}
