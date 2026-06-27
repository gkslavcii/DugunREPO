import Link from "next/link";
import { siteConfig } from "@/config/site";
import ParallaxCouple from "@/components/ParallaxCouple";
import FloatingLeaves from "@/components/FloatingLeaves";
import { Monogram, Sprig } from "@/components/ornaments";

export default function Home() {
  const { coupleNames, mode, events, coupleImage } = siteConfig;
  const ev = events[mode];

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-8">
      {/* arka plan: ışıltılar + doku + vinyet */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-20">
        <div className="absolute left-1/2 top-[-12%] h-[55vh] w-[55vh] -translate-x-1/2 rounded-full bg-dusk/25 blur-3xl" />
        <div className="absolute bottom-[-15%] right-[-8%] h-[42vh] w-[42vh] rounded-full bg-sage/20 blur-3xl" />
        <div className="absolute left-[-8%] top-[28%] h-[34vh] w-[34vh] rounded-full bg-[#d9c08a]/15 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(51,65,75,0.07))]" />
        <div className="grain absolute inset-0 opacity-[0.06] mix-blend-soft-light" />
      </div>

      {/* süzülen yapraklar */}
      <FloatingLeaves />

      {/* monogram */}
      <div className="reveal" style={{ animationDelay: "0.05s" }}>
        <Monogram left={coupleNames.bride[0]} right={coupleNames.groom[0]} />
      </div>

      {/* üst başlık */}
      <p
        className="reveal mb-4 mt-4 text-center text-xs font-medium uppercase tracking-[0.35em] text-ink-soft sm:mb-6 sm:text-sm"
        style={{ animationDelay: "0.18s" }}
      >
        {ev.eyebrow}
      </p>

      {/* çift fotoğrafı (3D efekt) */}
      <div className="reveal" style={{ animationDelay: "0.32s" }}>
        <ParallaxCouple
          src={coupleImage}
          alt={`${coupleNames.bride} & ${coupleNames.groom}`}
        />
      </div>

      {/* isimler */}
      <h1
        className="reveal mt-5 text-center font-display text-5xl font-medium leading-none text-ink sm:mt-6 sm:text-6xl md:text-7xl"
        style={{ animationDelay: "0.5s" }}
      >
        {coupleNames.bride}
        <span className="mx-3 align-middle font-display text-3xl italic text-dusk-deep sm:text-4xl">
          &amp;
        </span>
        {coupleNames.groom}
      </h1>

      {/* botanik ayraç */}
      <div
        className="reveal my-4 flex items-center gap-3 sm:my-5"
        style={{ animationDelay: "0.62s" }}
      >
        <Sprig className="h-5 w-14 text-sage/80" />
        <span className="h-1.5 w-1.5 rotate-45 bg-dusk-deep/50" />
        <Sprig className="h-5 w-14 -scale-x-100 text-sage/80" />
      </div>

      {/* hoş geldin metni */}
      <p
        className="reveal max-w-md text-center font-body text-lg leading-relaxed text-ink-soft sm:text-xl"
        style={{ animationDelay: "0.74s" }}
      >
        {ev.welcome}
      </p>

      {/* yönlendirmeler */}
      <div
        className="reveal mt-7 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center"
        style={{ animationDelay: "0.88s" }}
      >
        <Link
          href="/andac"
          className="inline-flex h-12 items-center justify-center rounded-full border border-ink/15 bg-white/40 px-8 font-body text-sm font-medium tracking-wide text-ink transition hover:border-ink/30 hover:bg-white/70"
        >
          Andaç Bırak
        </Link>
        <Link
          href="/fotograflar"
          className="inline-flex h-12 items-center justify-center rounded-full bg-ink px-8 font-body text-sm font-medium tracking-wide text-ivory shadow-sm transition hover:opacity-90"
        >
          Fotoğraf Yükle
        </Link>
      </div>
    </main>
  );
}
