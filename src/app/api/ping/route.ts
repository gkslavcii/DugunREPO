import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Supabase ücretsiz projesi 7 gün hareketsiz kalınca uykuya dalar.
// Bu uç nokta, haftalık otomatik "dürtme" ile projeyi uyanık tutar.
export async function GET() {
  const sb = getSupabaseAdmin();
  let ok = false;
  if (sb) {
    const { error } = await sb.from("notes").select("id").limit(1);
    ok = !error;
  }
  return Response.json({ ok, t: Date.now() });
}
