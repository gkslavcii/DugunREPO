import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSettings } from "@/lib/settings";
import { Monogram, Sprig } from "@/components/ornaments";
import PrintButton from "@/components/PrintButton";

export const dynamic = "force-dynamic";

type Note = {
  id: string;
  content: string;
  name: string | null;
  created_at: string;
};
type Photo = { key: string };

export default async function AniKitabiPage() {
  if (!(await isAdmin())) redirect("/admin");

  const { brideName, groomName } = await getSettings();
  const sb = getSupabaseAdmin();
  let notes: Note[] = [];
  let photos: Photo[] = [];
  if (sb) {
    try {
      const { data } = await sb
        .from("notes")
        .select("id, content, name, created_at")
        .order("created_at", { ascending: true });
      notes = (data as Note[]) ?? [];
    } catch {
      /* sessizce geç */
    }
    try {
      const { data } = await sb
        .from("photos")
        .select("key")
        .eq("approved", true)
        .order("created_at", { ascending: false })
        .limit(300);
      photos = (data as Photo[]) ?? [];
    } catch {
      /* sessizce geç */
    }
  }

  const fmt = new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" });

  return (
    <main className="mx-auto min-h-dvh w-full max-w-2xl px-6 py-10 print:py-0">
      {/* araç çubuğu — baskıda gizli */}
      <div className="mb-8 flex items-center justify-between print:hidden">
        <Link href="/admin" className="text-sm text-ink-soft hover:text-ink">
          ← Panel
        </Link>
        <PrintButton />
      </div>

      {/* kapak */}
      <section className="flex flex-col items-center py-8 text-center">
        <Monogram left={brideName[0]} right={groomName[0]} />
        <h1 className="mt-5 font-display text-5xl text-ink">
          {brideName}
          <span className="mx-2 italic text-dusk-deep">&amp;</span>
          {groomName}
        </h1>
        <p className="mt-2 text-xs uppercase tracking-[0.35em] text-ink-soft">
          Andaç Defteri
        </p>
        <div className="my-5 flex items-center gap-3">
          <Sprig className="h-5 w-14 text-sage/70" />
          <span className="h-1.5 w-1.5 rotate-45 bg-dusk-deep/50" />
          <Sprig className="h-5 w-14 -scale-x-100 text-sage/70" />
        </div>
        <p className="text-ink-soft">
          {notes.length} güzel dilek · {photos.length} fotoğraf
        </p>
      </section>

      {/* notlar */}
      <section className="flex flex-col gap-6">
        {notes.length === 0 ? (
          <p className="text-center text-ink-soft">Henüz not yok.</p>
        ) : (
          notes.map((n) => (
            <div
              key={n.id}
              className="break-inside-avoid border-b border-line pb-6"
            >
              <p className="whitespace-pre-wrap font-body text-lg leading-relaxed text-ink">
                &ldquo;{n.content}&rdquo;
              </p>
              <p className="mt-2 font-display text-lg text-dusk-deep">
                — {n.name || "İsimsiz misafir"}
              </p>
              <p className="text-xs text-ink-soft/70">
                {fmt.format(new Date(n.created_at))}
              </p>
            </div>
          ))
        )}
      </section>

      {/* fotoğraflar */}
      {photos.length > 0 && (
        <section className="mt-14 break-before-page">
          <h2 className="mb-6 text-center font-display text-3xl text-ink">
            Fotoğraflar
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {photos.map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={p.key}
                src={`/foto/${p.key}?w=400`}
                alt=""
                className="aspect-square w-full rounded-lg object-cover"
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
