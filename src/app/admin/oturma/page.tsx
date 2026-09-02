import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getTables, getSeatEdges } from "@/lib/seating";
import AdminTabs from "@/components/AdminTabs";
import SeatingEditor from "@/components/SeatingEditor";
import { logoutAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function OturmaPage() {
  if (!(await isAdmin())) redirect("/admin");
  const [tables, edges] = await Promise.all([getTables(), getSeatEdges()]);

  return (
    <main className="mx-auto min-h-dvh w-full max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink-soft">
            Yönetim
          </p>
          <h1 className="font-display text-4xl text-ink">Oturma Planı</h1>
        </div>
        <form action={logoutAction}>
          <button className="rounded-full border border-ink/15 px-4 py-2 text-xs text-ink-soft transition hover:bg-ink/[0.04]">
            Çıkış
          </button>
        </form>
      </div>

      <AdminTabs active="oturma" />

      <SeatingEditor initialTables={tables} initialEdges={edges} />

      <Link
        href="/"
        className="mt-6 inline-block text-sm text-ink-soft underline-offset-4 transition hover:text-ink hover:underline"
      >
        ← Ana sayfa
      </Link>
    </main>
  );
}
