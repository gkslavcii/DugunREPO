import { getSupabaseAdmin } from "@/lib/supabase";
import PhotoWall from "@/components/PhotoWall";

export const dynamic = "force-dynamic";

/**
 * Canlı fotoğraf duvarı — projeksiyon/TV için tam ekran slayt gösterisi.
 * Yeni yüklenen fotoğraflar otomatik olarak akışa girer.
 */
export default async function SlaytPage() {
  const sb = getSupabaseAdmin();
  let initial: string[] = [];
  if (sb) {
    try {
      const { data } = await sb
        .from("photos")
        .select("key")
        .eq("approved", true)
        .order("created_at", { ascending: false })
        .limit(100);
      initial = ((data as { key: string }[]) ?? []).map((p) => p.key);
    } catch {
      initial = [];
    }
  }
  return <PhotoWall initialKeys={initial} />;
}
