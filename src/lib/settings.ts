import { getSupabaseAdmin } from "./supabase";
import { siteConfig, type EventMode } from "@/config/site";

/**
 * Site ayarları Supabase'de tek satırda (app_settings, id=1) saklanır; admin
 * panelinden değiştirilir. Tablo/satır yoksa veya hata olursa varsayılana düşer.
 */
export type AppSettings = {
  mode: EventMode;
  requirePhotoApproval: boolean;
  countdownEnabled: boolean;
  countdownDate: string | null; // "YYYY-MM-DD"
};

const DEFAULTS: AppSettings = {
  mode: siteConfig.mode,
  requirePhotoApproval: false,
  countdownEnabled: false,
  countdownDate: null,
};

export async function getSettings(): Promise<AppSettings> {
  const sb = getSupabaseAdmin();
  if (!sb) return DEFAULTS;
  try {
    const { data } = await sb
      .from("app_settings")
      .select("mode, require_photo_approval, countdown_enabled, countdown_date")
      .eq("id", 1)
      .single();
    if (!data) return DEFAULTS;
    const mode: EventMode =
      data.mode === "kina" || data.mode === "dugun" ? data.mode : DEFAULTS.mode;
    return {
      mode,
      requirePhotoApproval: Boolean(data.require_photo_approval),
      countdownEnabled: Boolean(data.countdown_enabled),
      countdownDate: (data.countdown_date as string | null) ?? null,
    };
  } catch {
    return DEFAULTS;
  }
}

export async function getMode(): Promise<EventMode> {
  return (await getSettings()).mode;
}

export async function requirePhotoApproval(): Promise<boolean> {
  return (await getSettings()).requirePhotoApproval;
}

/** app_settings satırını (id=1) kısmi olarak günceller; verilmeyen alanlar korunur. */
async function patch(fields: Record<string, unknown>): Promise<void> {
  const sb = getSupabaseAdmin();
  if (!sb) return;
  try {
    await sb
      .from("app_settings")
      .upsert({ id: 1, ...fields, updated_at: new Date().toISOString() });
  } catch {
    // backend ulaşılamıyorsa sessizce geç
  }
}

/** Aşağıdakiler yalnızca admin server action'larından çağrılmalı. */
export async function setMode(mode: EventMode): Promise<void> {
  await patch({ mode });
}

export async function setRequirePhotoApproval(value: boolean): Promise<void> {
  await patch({ require_photo_approval: value });
}

export async function setCountdown(
  enabled: boolean,
  date: string | null,
): Promise<void> {
  await patch({ countdown_enabled: enabled, countdown_date: date });
}
