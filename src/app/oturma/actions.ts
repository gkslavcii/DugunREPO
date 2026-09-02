"use server";

import { getSupabaseAdmin } from "@/lib/supabase";

export type SeatMatch = { guest: string; tableId: string | null };

/**
 * Misafir arama — yalnızca sorguya uyan kayıtları döner (tüm listeyi sızdırmaz).
 * Wildcard karakterleri temizlenir; en az 2 harf gerekir.
 */
export async function searchGuestTable(query: string): Promise<SeatMatch[]> {
  const q = (query ?? "").replace(/[%_]/g, "").trim();
  if (q.length < 2) return [];
  const sb = getSupabaseAdmin();
  if (!sb) return [];
  try {
    const { data } = await sb
      .from("seat_guests")
      .select("name, table_id")
      .ilike("name", `%${q}%`)
      .limit(12);
    return ((data as Record<string, unknown>[]) ?? []).map((r) => ({
      guest: String(r.name),
      tableId: r.table_id ? String(r.table_id) : null,
    }));
  } catch {
    return [];
  }
}
