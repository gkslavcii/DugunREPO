import Link from "next/link";

/** Henüz yapılmamış sayfalar için zarif yer tutucu. */
export default function ComingSoon({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/4 h-[40vh] w-[40vh] -translate-x-1/2 rounded-full bg-dusk/20 blur-3xl" />
      </div>

      <p className="mb-3 text-xs uppercase tracking-[0.3em] text-ink-soft">
        Sezin &amp; Göksel
      </p>
      <h1 className="font-display text-5xl text-ink sm:text-6xl">{title}</h1>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px w-10 bg-line" />
        <span className="h-1.5 w-1.5 rotate-45 bg-dusk-deep/50" />
        <span className="h-px w-10 bg-line" />
      </div>

      <p className="max-w-sm leading-relaxed text-ink-soft">{desc}</p>

      <Link
        href="/"
        className="mt-8 inline-flex items-center rounded-full border border-ink/15 px-6 py-2.5 text-sm text-ink transition hover:bg-ink/[0.04]"
      >
        ← Ana sayfa
      </Link>
    </main>
  );
}
