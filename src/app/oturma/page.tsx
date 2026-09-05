import Link from "next/link";
import {
  getTables,
  getSeatEdges,
  getSeatStart,
  getObjects,
  getLines,
} from "@/lib/seating";
import { getSettings } from "@/lib/settings";
import SeatingViewer from "@/components/SeatingViewer";

export const dynamic = "force-dynamic";

export default async function OturmaPublicPage() {
  const [settings, tables, edges, start, objects, lines] = await Promise.all([
    getSettings(),
    getTables(),
    getSeatEdges(),
    getSeatStart(),
    getObjects(),
    getLines(),
  ]);

  if (!settings.seatingPublic) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-ivory px-6 text-center">
        <p className="text-ink-soft">Oturma planı henüz yayınlanmadı. 🙂</p>
        <Link
          href="/"
          className="rounded-full border border-ink/15 px-4 py-2 text-sm text-ink-soft transition hover:bg-ink/[0.04]"
        >
          ← Ana sayfa
        </Link>
      </main>
    );
  }

  return (
    <SeatingViewer
      tables={tables}
      edges={edges}
      start={start}
      objects={objects}
      lines={lines}
    />
  );
}
