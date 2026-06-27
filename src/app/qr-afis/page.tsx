import { siteConfig } from "@/config/site";
import { Monogram, Sprig } from "@/components/ornaments";

/**
 * Giriş afişi (masa kartının büyük versiyonu).
 * Tarayıcıdan "Yazdır → PDF" ile A5/A4 boyutunda baskı alınabilir.
 */
export default function QrAfisPage() {
  const { coupleNames } = siteConfig;

  return (
    <main className="flex min-h-dvh items-center justify-center bg-ivory px-6 py-12 print:bg-white print:p-0">
      <div className="relative w-[520px] max-w-full overflow-hidden rounded-[32px] border border-line bg-gradient-to-b from-[#FBF8F3] to-[#F1E9DC] px-12 py-16 text-center shadow-xl print:rounded-none print:border-0 print:shadow-none">
        <Sprig className="absolute left-6 top-7 h-6 w-20 text-sage/55" />
        <Sprig className="absolute right-6 top-7 h-6 w-20 -scale-x-100 text-sage/55" />

        <div className="flex flex-col items-center">
          <Monogram left={coupleNames.bride[0]} right={coupleNames.groom[0]} />

          <p className="mt-5 text-xs uppercase tracking-[0.35em] text-ink-soft">
            Anılarımızı Paylaşın
          </p>
          <h1 className="mt-3 font-display text-5xl leading-tight text-ink">
            {coupleNames.bride}
            <span className="mx-2 italic text-dusk-deep">&amp;</span>
            {coupleNames.groom}
          </h1>

          <div className="my-6 flex items-center gap-2">
            <span className="h-px w-10 bg-line" />
            <span className="h-1.5 w-1.5 rotate-45 bg-dusk-deep/50" />
            <span className="h-px w-10 bg-line" />
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-line">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/qr/qr.png" alt="QR kod" className="h-64 w-64" />
          </div>

          <p className="mt-6 font-display text-3xl text-ink">
            Kareyi telefonunla okut
          </p>
          <p className="mt-2 text-base leading-relaxed text-ink-soft">
            Çektiğin fotoğrafları{" "}
            <strong className="font-semibold text-ink">yükle</strong>, bize bir{" "}
            <strong className="font-semibold text-ink">not bırak</strong> 💛
          </p>
        </div>
      </div>
    </main>
  );
}
