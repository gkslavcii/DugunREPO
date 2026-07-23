import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Herkese açık fotoğraf listesi (anahtarlar) — canlı duvar ve toplu indirme kullanır.
export async function GET() {
  const sb = getSupabaseAdmin();
  let photos: { key: string }[] = [];
  if (sb) {
    try {
      const { data } = await sb
        .from("photos")
        .select("key")
        .order("created_at", { ascending: false })
        .limit(2000);
      photos = (data as { key: string }[]) ?? [];
    } catch {
      photos = [];
    }
  }
  return Response.json({ photos });
}
