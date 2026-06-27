import { getSupabaseAdmin } from "./supabase";
import { siteConfig, type EventMode } from "@/config/site";

/**
 * Anasayfa modu ("kina" / "dugun") Supabase'de saklanır; admin panelinden
 * değiştirilir. Tablo/satır yoksa veya hata olursa site.ts'teki varsayılana düşer.
 */
export async function getMode(): Promise<EventMode> {
  const sb = getSupabaseAdmin();
  if (!sb) return siteConfig.mode;
  try {
    const { data } = await sb
      .from("app_settings")
      .select("mode")
      .eq("id", 1)
      .single();
    return data?.mode === "kina" || data?.mode === "dugun"
      ? data.mode
      : siteConfig.mode;
  } catch {
    return siteConfig.mode;
  }
}

/** Sadece admin tarafından (server action içinden) çağrılmalı. */
export async function setMode(mode: EventMode): Promise<void> {
  const sb = getSupabaseAdmin();
  if (!sb) return;
  await sb
    .from("app_settings")
    .upsert({ id: 1, mode, updated_at: new Date().toISOString() });
}
