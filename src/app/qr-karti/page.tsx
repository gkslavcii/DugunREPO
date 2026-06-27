import { siteConfig } from "@/config/site";
import { Monogram, Sprig } from "@/components/ornaments";

/**
 * Baskıya hazır masa/giriş kartı.
 * Tarayıcıdan açıp "Yazdır → PDF olarak kaydet" ile kusursuz (vektörel) çıktı alınır.
 */
export default function QrKartiPage() {
  const { coupleNames } = siteConfig;

  return (
    <main className="flex min-h-dvh items-center justify-center bg-ivory px-6 py-10 print:bg-white print:p-0">
      <div className="relative w-[380px] max-w-full overflow-hidden rounded-[28px] border border-line bg-gradient-to-b from-[#FBF8F3] to-[#F1E9DC] px-8 py-10 text-center shadow-xl print:rounded-none print:border-0 print:shadow-none">
        {/* köşe süslemeleri */}
        <Sprig className="absolute left-4 top-5 h-5 w-14 text-sage/55" />
        <Sprig className="absolute right-4 top-5 h-5 w-14 -scale-x-100 text-sage/55" />

        <div className="flex flex-col items-center">
          <Monogram left={coupleNames.bride[0]} right={coupleNames.groom[0]} />

          <p className="mt-4 text-[10px] uppercase tracking-[0.35em] text-ink-soft">
            Düğünümüze Hoş Geldiniz
          </p>
          <h1 className="mt-2 font-display text-4xl leading-tight text-ink">
            {coupleNames.bride}
            <span className="mx-1.5 italic text-dusk-deep">&amp;</span>
            {coupleNames.groom}
          </h1>

          <div className="my-5 flex items-center gap-2">
            <span className="h-px w-8 bg-line" />
            <span className="h-1 w-1 rotate-45 bg-dusk-deep/50" />
            <span className="h-px w-8 bg-line" />
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-line">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/qr/qr.png" alt="QR kod" className="h-48 w-48" />
          </div>

          <p className="mt-5 font-display text-2xl text-ink">
            Kareyi telefonunla okut
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
            Anılarını paylaş: <strong className="font-semibold text-ink">fotoğraf yükle</strong>,{" "}
            bize bir <strong className="font-semibold text-ink">not bırak</strong> 💛
          </p>
        </div>
      </div>
    </main>
  );
}
