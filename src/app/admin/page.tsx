import Link from "next/link";
import { isAdmin, adminConfigured } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getMode } from "@/lib/settings";
import AdminLogin from "@/components/AdminLogin";
import DeleteNoteButton from "@/components/DeleteNoteButton";
import { logoutAction, setModeAction } from "./actions";

export const dynamic = "force-dynamic";

type Note = {
  id: string;
  content: string;
  name: string | null;
  created_at: string;
  is_public: boolean;
};

export default async function AdminPage() {
  if (!(await isAdmin())) {
    return <AdminLogin configured={adminConfigured()} />;
  }

  const sb = getSupabaseAdmin();
  let notes: Note[] = [];
  if (sb) {
    const { data } = await sb
      .from("notes")
      .select("id, content, name, created_at, is_public")
      .order("created_at", { ascending: false });
    notes = (data as Note[]) ?? [];
  }
  const mode = await getMode();

  const fmt = new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <main className="mx-auto min-h-dvh w-full max-w-2xl px-6 py-12">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink-soft">
            Yönetim
          </p>
          <h1 className="font-display text-4xl text-ink">Yönetim Paneli</h1>
        </div>
        <form action={logoutAction}>
          <button className="rounded-full border border-ink/15 px-4 py-2 text-xs text-ink-soft transition hover:bg-ink/[0.04]">
            Çıkış
          </button>
        </form>
      </div>

      {/* Anasayfa modu anahtarı */}
      <section className="mb-8 flex items-center justify-between gap-4 rounded-2xl border border-line bg-white/60 p-5">
        <div>
          <p className="text-sm text-ink-soft">Anasayfa modu</p>
          <p className="font-display text-2xl text-ink">
            {mode === "kina" ? "Kına Gecesi" : "Düğün"}
          </p>
        </div>
        <form action={setModeAction}>
          <input
            type="hidden"
            name="mode"
            value={mode === "kina" ? "dugun" : "kina"}
          />
          <button className="rounded-full bg-dusk-deep px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90">
            {mode === "kina" ? "Düğün moduna geç" : "Kına moduna geç"}
          </button>
        </form>
      </section>

      <h2 className="mb-3 font-display text-2xl text-ink">Andaç Notları</h2>
      <p className="mb-6 text-sm text-ink-soft">
        Toplam <span className="font-semibold text-ink">{notes.length}</span> not
      </p>

      {notes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white/40 px-6 py-16 text-center text-ink-soft">
          Henüz not yok. Misafirler bıraktıkça burada görünecek.
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {notes.map((n) => (
            <li
              key={n.id}
              className="rounded-2xl border border-line bg-white/60 p-5 shadow-sm"
            >
              <p className="whitespace-pre-wrap leading-relaxed text-ink">
                {n.content}
              </p>
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-line/70 pt-3 text-xs text-ink-soft">
                <span className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                  <span className="font-medium text-ink">
                    {n.name || "İsimsiz misafir"}
                  </span>
                  <span>· {fmt.format(new Date(n.created_at))}</span>
                  {n.is_public && (
                    <span className="rounded-full bg-sage/25 px-2 py-0.5 text-[10px] font-medium text-[#5f6e46]">
                      herkese açık
                    </span>
                  )}
                </span>
                <DeleteNoteButton id={n.id} />
              </div>
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/"
        className="mt-10 inline-block text-sm text-ink-soft underline-offset-4 transition hover:text-ink hover:underline"
      >
        ← Ana sayfa
      </Link>
    </main>
  );
}
