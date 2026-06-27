import Link from "next/link";
import AndacForm from "@/components/AndacForm";
import { siteConfig } from "@/config/site";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type PublicNote = {
  id: string;
  content: string;
  name: string | null;
  created_at: string;
};

export default async function AndacPage() {
  const { coupleNames } = siteConfig;

  const sb = getSupabaseAdmin();
  let publicNotes: PublicNote[] = [];
  if (sb) {
    const { data } = await sb
      .from("notes")
      .select("id, content, name, created_at")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(50);
    publicNotes = (data as PublicNote[]) ?? [];
  }

  const fmt = new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" });

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
        biz göreceğiz — dilersen herkese açık da paylaşabilirsin.
      </p>

      <AndacForm />

      {publicNotes.length > 0 && (
        <section className="mt-16 w-full max-w-lg">
          <div className="mb-7 flex flex-col items-center">
            <h2 className="font-display text-3xl text-ink">
              Paylaşılan Andaçlar
            </h2>
            <div className="mt-3 flex items-center gap-3">
              <span className="h-px w-8 bg-line" />
              <span className="h-1.5 w-1.5 rotate-45 bg-dusk-deep/50" />
              <span className="h-px w-8 bg-line" />
            </div>
          </div>
          <ul className="flex flex-col gap-4">
            {publicNotes.map((n) => (
              <li
                key={n.id}
                className="rounded-2xl border border-line bg-white/50 p-5 shadow-sm"
              >
                <p className="whitespace-pre-wrap leading-relaxed text-ink">
                  {n.content}
                </p>
                <p className="mt-3 font-display text-lg text-dusk-deep">
                  — {n.name || "İsimsiz misafir"}
                </p>
                <p className="mt-0.5 text-xs text-ink-soft/70">
                  {fmt.format(new Date(n.created_at))}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Link
        href="/"
        className="mt-12 text-sm text-ink-soft underline-offset-4 transition hover:text-ink hover:underline"
      >
        ← Ana sayfa
      </Link>
    </main>
  );
}
