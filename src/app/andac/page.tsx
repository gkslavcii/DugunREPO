import Link from "next/link";
import AndacForm from "@/components/AndacForm";
import { siteConfig } from "@/config/site";

export default function AndacPage() {
  const { coupleNames } = siteConfig;

  return (
    <main className="relative flex min-h-dvh flex-col items-center px-6 py-16 sm:py-20">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[40vh] w-[40vh] -translate-x-1/2 rounded-full bg-dusk/15 blur-3xl" />
      </div>

      <p className="text-xs uppercase tracking-[0.3em] text-ink-soft">
        {coupleNames.bride} &amp; {coupleNames.groom}
      </p>
      <h1 className="mt-3 font-display text-5xl text-ink sm:text-6xl">Andaç</h1>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px w-10 bg-line" />
        <span className="h-1.5 w-1.5 rotate-45 bg-dusk-deep/50" />
        <span className="h-px w-10 bg-line" />
      </div>

      <p className="mb-9 max-w-md text-center leading-relaxed text-ink-soft">
        Bize bir not, bir dilek ya da güzel bir anı bırakın. Notunuzu yalnızca
        biz göreceğiz.
      </p>

      <AndacForm />

      <Link
        href="/"
        className="mt-10 text-sm text-ink-soft underline-offset-4 transition hover:text-ink hover:underline"
      >
        ← Ana sayfa
      </Link>
    </main>
  );
}
