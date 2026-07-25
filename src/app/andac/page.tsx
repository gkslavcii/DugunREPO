import Link from "next/link";
import AndacForm from "@/components/AndacForm";
import VoiceRecorder from "@/components/VoiceRecorder";
import DarkBackdrop from "@/components/DarkBackdrop";
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
      <DarkBackdrop />

      <div
        className="reveal flex flex-col items-center"
        style={{ animationDelay: "0.05s" }}
      >
        <Monogram
          left={coupleNames.bride[0]}
          right={coupleNames.groom[0]}
          variant="light"
        />
        <p className="mt-4 text-xs uppercase tracking-[0.3em] text-ivory/70">
          {coupleNames.bride} &amp; {coupleNames.groom}
        </p>
        <h1 className="mt-2 font-display text-5xl text-ivory sm:text-6xl">
          Andaç
        </h1>
        <div className="my-6 flex items-center gap-3">
          <Sprig className="h-5 w-14 text-sage/80" />
          <span className="h-1.5 w-1.5 rotate-45 bg-ivory/50" />
          <Sprig className="h-5 w-14 -scale-x-100 text-sage/80" />
        </div>
        <p className="mb-9 max-w-md text-center leading-relaxed text-ivory/80">
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
            <span className="h-px flex-1 bg-white/15" />
            <span className="whitespace-nowrap text-xs uppercase tracking-[0.3em] text-ivory/60">
              veya sesini bırak
            </span>
            <span className="h-px flex-1 bg-white/15" />
          </div>
          <VoiceRecorder />
        </div>
      )}

      {publicNotes.length > 0 && (
        <section className="mt-16 w-full max-w-lg">
          <div className="mb-7 flex flex-col items-center">
            <h2 className="font-display text-3xl text-ivory">
              Paylaşılan Andaçlar
            </h2>
            <div className="mt-3 flex items-center gap-3">
              <span className="h-px w-8 bg-white/15" />
              <span className="h-1.5 w-1.5 rotate-45 bg-ivory/50" />
              <span className="h-px w-8 bg-white/15" />
            </div>
          </div>
          <ul className="flex flex-col gap-4">
            {publicNotes.map((n) => (
              <li
                key={n.id}
                className="rounded-2xl border border-white/15 bg-white/[0.07] p-5 shadow-sm backdrop-blur-sm"
              >
                <p className="whitespace-pre-wrap leading-relaxed text-ivory/90">
                  {n.content}
                </p>
                <p className="mt-3 font-display text-lg text-[#e7d0a2]">
                  — {n.name || "İsimsiz misafir"}
                </p>
                <p className="mt-0.5 text-xs text-ivory/50">
                  {fmt.format(new Date(n.created_at))}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Link
        href="/"
        className="mt-12 text-sm text-ivory/70 underline-offset-4 transition hover:text-ivory hover:underline"
      >
        ← Ana sayfa
      </Link>
    </main>
  );
}
