import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Ziyaretçi sayacı: cihaz başına 1 kez (istemci localStorage ile denetler).
export async function POST() {
  const sb = getSupabaseAdmin();
  if (sb) {
    try {
      await sb.from("visits").insert({ created_at: new Date().toISOString() });
    } catch {
      // sessizce geç
    }
  }
  return Response.json({ ok: true });
}
