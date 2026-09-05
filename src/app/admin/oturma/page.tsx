import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import {
  getTables,
  getSeatGuests,
  getSeatEdges,
  getSeatStart,
} from "@/lib/seating";
import { getSettings } from "@/lib/settings";
import SeatingEditor from "@/components/SeatingEditor";

export const dynamic = "force-dynamic";

export default async function OturmaPage() {
  if (!(await isAdmin())) redirect("/admin");
  const [tables, guests, edges, start, settings] = await Promise.all([
    getTables(),
    getSeatGuests(),
    getSeatEdges(),
    getSeatStart(),
    getSettings(),
  ]);

  return (
    <SeatingEditor
      initialTables={tables}
      initialGuests={guests}
      initialEdges={edges}
      initialPublic={settings.seatingPublic}
      initialStart={start}
    />
  );
}
