import Link from "next/link";
import AndacForm from "@/components/AndacForm";
import VoiceRecorder from "@/components/VoiceRecorder";
import PageAmbience from "@/components/PageAmbience";
import { siteConfig } from "@/config/site";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isR2Configured } from "@/lib/r2";
import { Monogram, Sprig } from "@/components/ornaments";

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
    try {
      const { data } = await sb
        .from("notes")
        .select("id, content, name, created_at")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(50);
      publicNotes = (data as PublicNote[]) ?? [];
    } catch {
      publicNotes = [];
    }
  }

  const fmt = new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" });

  return (
    <main className="relative flex min-h-dvh flex-col items-center px-6 py-16 sm:py-20">
      <PageAmbience />

      <div
        className="reveal flex flex-col items-center"
        style={{ animationDelay: "0.05s" }}
      >
        <Monogram left={coupleNames.bride[0]} right={coupleNames.groom[0]} />
        <p className="mt-4 text-xs uppercase tracking-[0.3em] text-ink-soft">
          {coupleNames.bride} &amp; {coupleNames.groom}
        </p>
        <h1 className="mt-2 font-display text-5xl text-ink sm:text-6xl">Andaç</h1>
        <div className="my-6 flex items-center gap-3">
          <Sprig className="h-5 w-14 text-sage/80" />
          <span className="h-1.5 w-1.5 rotate-45 bg-dusk-deep/50" />
          <Sprig className="h-5 w-14 -scale-x-100 text-sage/80" />
        </div>
        <p className="mb-9 max-w-md text-center leading-relaxed text-ink-soft">
          Bize bir not, bir dilek ya da güzel bir anı bırakın — ister yazarak,
          ister sesinizle. Mesajınızı yalnızca biz göreceğiz; yazılı notu
          dilersen herkese açık da paylaşabilirsin.
        </p>
      </div>

      <AndacForm />

      {/* veya sesli mesaj */}
      {isR2Configured() && (
        <div className="mt-14 flex w-full max-w-lg flex-col items-center">
          <div className="mb-7 flex w-full items-center gap-4">
            <span className="h-px flex-1 bg-line" />
            <span className="whitespace-nowrap text-xs uppercase tracking-[0.3em] text-ink-soft">
              veya sesini bırak
            </span>
            <span className="h-px flex-1 bg-line" />
          </div>
          <VoiceRecorder />
        </div>
      )}

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
