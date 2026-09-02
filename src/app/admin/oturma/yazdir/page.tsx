import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getTables, getSeatGuests } from "@/lib/seating";
import { getSettings } from "@/lib/settings";
import PrintButton from "@/components/PrintButton";

export const dynamic = "force-dynamic";

export default async function YazdirPage() {
  if (!(await isAdmin())) redirect("/admin");
  const [tables, guests, settings] = await Promise.all([
    getTables(),
    getSeatGuests(),
    getSettings(),
  ]);
  const byTable = (id: string) => guests.filter((g) => g.tableId === id);

  return (
    <main className="mx-auto min-h-dvh w-full max-w-2xl px-6 py-10 print:py-0">
      <div className="mb-8 flex items-center justify-between print:hidden">
        <Link
          href="/admin/oturma"
          className="text-sm text-ink-soft transition hover:text-ink"
        >
          ← Oturma
        </Link>
        <PrintButton />
      </div>

      <div className="mb-6 text-center">
        <h1 className="font-display text-4xl text-ink">Oturma Planı</h1>
        <p className="mt-1 text-sm text-ink-soft">
          {settings.brideName} &amp; {settings.groomName} · {guests.length}{" "}
          misafir · {tables.length} masa
        </p>
      </div>

      {tables.length === 0 ? (
        <p className="text-center text-ink-soft">Henüz masa yok.</p>
      ) : (
        <div className="flex flex-col gap-5">
          {tables.map((t, i) => {
            const gs = byTable(t.id);
            return (
              <div
                key={t.id}
                className="break-inside-avoid border-b border-line pb-4"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="font-display text-xl text-ink">
                    {t.name || `Masa ${i + 1}`}
                  </h2>
                  <span className="text-xs text-ink-soft">
                    {gs.length}/{t.capacity}
                  </span>
                </div>
                {gs.length ? (
                  <ol className="mt-1 columns-2 gap-6 pl-5 text-sm text-ink [&>li]:break-inside-avoid list-decimal">
                    {gs.map((g) => (
                      <li key={g.id}>{g.name}</li>
                    ))}
                  </ol>
                ) : (
                  <p className="mt-1 text-sm text-ink-soft/70">— boş —</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
