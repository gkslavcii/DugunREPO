import Link from "next/link";
import { siteConfig } from "@/config/site";
import { getSettings } from "@/lib/settings";
import FloatingLeaves from "@/components/FloatingLeaves";
import Countdown from "@/components/Countdown";
import VisitBeacon from "@/components/VisitBeacon";
import { Monogram, Sprig } from "@/components/ornaments";

export const revalidate = 60;

export default async function Home() {
  const { coupleNames, events } = siteConfig;
  const settings = await getSettings();
  const mode = settings.mode;
  const ev = events[mode];
  const countdownLabel = mode === "kina" ? "Kınaya" : "Düğüne";
  const countdownDate =
    mode === "kina" ? settings.countdownKinaDate : settings.countdownDugunDate;

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-between overflow-hidden px-6 py-10 sm:py-12">
      <VisitBeacon />

      {/* sinematik fotoğraf arka planı (bg-ink → foto gelmese de zemin koyu kalır) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-30 overflow-hidden bg-ink"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/dans.jpg"
          alt=""
          className="h-full w-full object-cover object-[50%_30%]"
        />
        {/* paletle bütünleşen ton — mürekkep-mavisi sıcaklık */}
        <div className="absolute inset-0 bg-dusk-deep/15 mix-blend-soft-light" />
        {/* okunabilirlik için dikey ışık-gölge geçişi */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/55 via-ink/20 to-ink/90" />
        {/* kenar vinyeti — çerçeveyi ve çifti öne çıkarır */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_36%,transparent_44%,rgb(22_28_33_/_0.62))]" />
      </div>

      {/* yumuşak ışıltı + ince doku */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-20">
        <div className="absolute left-1/2 top-[-10%] h-[46vh] w-[46vh] -translate-x-1/2 rounded-full bg-dusk/10 blur-3xl" />
        <div className="grain absolute inset-0 opacity-[0.05] mix-blend-soft-light" />
      </div>

      {/* süzülen yapraklar */}
      <FloatingLeaves />

      {/* zarif altın çerçeve */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-3 rounded-[26px] border border-[#d9c08a]/55 sm:inset-5"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-4 rounded-[22px] border border-ivory/15 sm:inset-6"
      />
      <Sprig className="pointer-events-none absolute left-5 top-5 h-3 w-10 rotate-[35deg] text-[#d9c08a]/60 sm:left-8 sm:top-8" />
      <Sprig className="pointer-events-none absolute right-5 top-5 h-3 w-10 -rotate-[35deg] -scale-x-100 text-[#d9c08a]/60 sm:right-8 sm:top-8" />
      <Sprig className="pointer-events-none absolute bottom-5 left-5 h-3 w-10 -rotate-[35deg] text-[#d9c08a]/60 sm:bottom-8 sm:left-8" />
      <Sprig className="pointer-events-none absolute bottom-5 right-5 h-3 w-10 rotate-[35deg] -scale-x-100 text-[#d9c08a]/60 sm:bottom-8 sm:right-8" />

      {/* üst blok — monogram + üst başlık */}
      <div
        className="reveal flex flex-col items-center pt-2"
        style={{ animationDelay: "0.05s" }}
      >
        <Monogram
          left={coupleNames.bride[0]}
          right={coupleNames.groom[0]}
          variant="light"
        />
        <p className="mt-3 text-center text-xs font-medium uppercase tracking-[0.35em] text-ivory/80 sm:text-sm">
          {ev.eyebrow}
        </p>
      </div>

      {/* alt blok — isimler + hoşgeldiniz + butonlar */}
      <div className="flex flex-col items-center pb-2">
        <h1
          className="reveal text-center font-display text-6xl font-medium leading-none text-ivory [text-shadow:0_2px_28px_rgb(20_26_31_/_0.55)] sm:text-7xl md:text-8xl"
          style={{ animationDelay: "0.3s" }}
        >
          {coupleNames.bride}
          <span className="mx-3 align-middle font-display text-4xl italic text-[#e7d0a2] sm:text-5xl">
            &amp;
          </span>
          {coupleNames.groom}
        </h1>

        <div
          className="reveal my-4 flex items-center gap-3 sm:my-5"
          style={{ animationDelay: "0.45s" }}
        >
          <Sprig className="h-5 w-14 text-[#d9c08a]/85" />
          <span className="h-1.5 w-1.5 rotate-45 bg-ivory/60" />
          <Sprig className="h-5 w-14 -scale-x-100 text-[#d9c08a]/85" />
        </div>

        <p
          className="reveal max-w-md text-center font-body text-base leading-relaxed text-ivory/85 [text-shadow:0_1px_16px_rgb(20_26_31_/_0.55)] sm:text-lg"
          style={{ animationDelay: "0.6s" }}
        >
          {ev.welcome}
        </p>

        {settings.countdownEnabled && countdownDate && (
          <div className="reveal mt-6" style={{ animationDelay: "0.68s" }}>
            <Countdown targetIso={countdownDate} label={countdownLabel} />
          </div>
        )}

        <div
          className="reveal mt-7 flex w-full max-w-sm flex-col gap-2.5 sm:mt-8 sm:max-w-none sm:flex-row sm:justify-center"
          style={{ animationDelay: "0.75s" }}
        >
          <Link
            href="/andac"
            className="inline-flex h-11 items-center justify-center rounded-full border border-ivory/40 bg-white/10 px-8 font-body text-sm font-medium tracking-wide text-ivory backdrop-blur-sm transition hover:bg-white/20 sm:h-12"
          >
            Andaç Bırak
          </Link>
          <Link
            href="/fotograflar"
            className="inline-flex h-11 items-center justify-center rounded-full bg-ivory px-8 font-body text-sm font-medium tracking-wide text-ink shadow-lg transition hover:bg-white sm:h-12"
          >
            Fotoğraf Yükle
          </Link>
        </div>
      </div>
    </main>
  );
}
