import { getTables, getSeatEdges } from "@/lib/seating";
import SeatingViewer from "@/components/SeatingViewer";

export const dynamic = "force-dynamic";

export default async function OturmaPublicPage() {
  const [tables, edges] = await Promise.all([getTables(), getSeatEdges()]);
  return <SeatingViewer tables={tables} edges={edges} />;
}
