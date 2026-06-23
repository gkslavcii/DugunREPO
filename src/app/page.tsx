import Link from "next/link";
import { siteConfig } from "@/config/site";
import ParallaxCouple from "@/components/ParallaxCouple";

export default function Home() {
  const { coupleNames, mode, events, coupleImage } = siteConfig;
  const ev = events[mode];

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-6">
      {/* yumuşak atmosfer ışıkları */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-12%] h-[55vh] w-[55vh] -translate-x-1/2 rounded-full bg-dusk/25 blur-3xl" />
        <div className="absolute bottom-[-15%] right-[-8%] h-[42vh] w-[42vh] rounded-full bg-sage/20 blur-3xl" />
      </div>

      {/* üst başlık */}
      <p className="mb-4 text-center text-xs font-medium uppercase tracking-[0.35em] text-ink-soft sm:mb-6 sm:text-sm">
        {ev.eyebrow}
      </p>

      {/* çift fotoğrafı (3D efekt) */}
      <ParallaxCouple
        src={coupleImage}
        alt={`${coupleNames.bride} & ${coupleNames.groom}`}
      />

      {/* isimler */}
      <h1 className="mt-5 text-center font-display text-5xl font-medium leading-none text-ink sm:mt-6 sm:text-6xl md:text-7xl">
        {coupleNames.bride}
        <span className="mx-3 align-middle font-display text-3xl italic text-dusk-deep sm:text-4xl">
          &amp;
        </span>
        {coupleNames.groom}
      </h1>

      {/* ayraç */}
      <div className="my-4 flex items-center gap-3 sm:my-5">
        <span className="h-px w-12 bg-line" />
        <span className="h-1.5 w-1.5 rotate-45 bg-dusk-deep/50" />
        <span className="h-px w-12 bg-line" />
      </div>

      {/* hoş geldin metni */}
      <p className="max-w-md text-center font-body text-lg leading-relaxed text-ink-soft sm:text-xl">
        {ev.welcome}
      </p>

      {/* yönlendirmeler */}
      <div className="mt-7 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
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
