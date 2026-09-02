import { getSupabaseAdmin } from "./supabase";
import { siteConfig, type EventMode } from "@/config/site";

/**
 * Site ayarları + içerik Supabase'de tek satırda (app_settings, id=1) saklanır;
 * admin panelinden düzenlenir. Herhangi bir alan boşsa site.ts varsayılanına düşer.
 * select("*") kullanıyoruz: migration henüz çalışmasa (sütun eksik olsa) bile
 * sorgu patlamaz, eksik alanlar varsayılana düşer.
 */
export type EventText = { eyebrow: string; welcome: string };

export type AppSettings = {
  mode: EventMode;
  brideName: string;
  groomName: string;
  events: Record<EventMode, EventText>;
  andacDesc: string;
  fotoDesc: string;
  requirePhotoApproval: boolean;
  countdownEnabled: boolean;
  countdownDates: Record<EventMode, string | null>;
  backgroundKey: string | null;
  seatingPublic: boolean;
};

/** Arka plan/paylaşım resmi URL'i (yüklenmişse R2 proxy'sinden, yoksa varsayılan). */
export function bgUrl(key: string | null, w = 1600): string {
  return key ? `/foto/${key}?w=${w}` : "/images/dans.jpg";
}

const DEFAULTS: AppSettings = {
  mode: siteConfig.mode,
  brideName: siteConfig.coupleNames.bride,
  groomName: siteConfig.coupleNames.groom,
  events: {
    kina: { ...siteConfig.events.kina },
    nisan: { ...siteConfig.events.nisan },
    dugun: { ...siteConfig.events.dugun },
  },
  andacDesc: siteConfig.andacDesc,
  fotoDesc: siteConfig.fotoDesc,
  requirePhotoApproval: false,
  countdownEnabled: false,
  countdownDates: { kina: null, nisan: null, dugun: null },
  backgroundKey: null,
  seatingPublic: false,
};

const MODES: EventMode[] = ["kina", "nisan", "dugun"];

export async function getSettings(): Promise<AppSettings> {
  const sb = getSupabaseAdmin();
  if (!sb) return DEFAULTS;
  try {
    const { data } = await sb
      .from("app_settings")
      .select("*")
      .eq("id", 1)
      .single();
    if (!data) return DEFAULTS;
    const row = data as Record<string, unknown>;
    const txt = (k: string, def: string): string => {
      const v = row[k];
      return typeof v === "string" && v.trim() ? v : def;
    };
    const date = (k: string): string | null => {
      const v = row[k];
      return typeof v === "string" && v ? v : null;
    };
    const mode: EventMode = MODES.includes(row.mode as EventMode)
      ? (row.mode as EventMode)
      : DEFAULTS.mode;
    return {
      mode,
      brideName: txt("bride_name", DEFAULTS.brideName),
      groomName: txt("groom_name", DEFAULTS.groomName),
      events: {
        kina: {
          eyebrow: txt("kina_eyebrow", DEFAULTS.events.kina.eyebrow),
          welcome: txt("kina_welcome", DEFAULTS.events.kina.welcome),
        },
        nisan: {
          eyebrow: txt("nisan_eyebrow", DEFAULTS.events.nisan.eyebrow),
          welcome: txt("nisan_welcome", DEFAULTS.events.nisan.welcome),
        },
        dugun: {
          eyebrow: txt("dugun_eyebrow", DEFAULTS.events.dugun.eyebrow),
          welcome: txt("dugun_welcome", DEFAULTS.events.dugun.welcome),
        },
      },
      andacDesc: txt("andac_desc", DEFAULTS.andacDesc),
      fotoDesc: txt("foto_desc", DEFAULTS.fotoDesc),
      requirePhotoApproval: Boolean(row.require_photo_approval),
      countdownEnabled: Boolean(row.countdown_enabled),
      countdownDates: {
        kina: date("countdown_kina_date"),
        nisan: date("countdown_nisan_date"),
        dugun: date("countdown_dugun_date"),
      },
      backgroundKey: date("background_key"),
      seatingPublic: Boolean(row.seating_public),
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
  dates: Record<EventMode, string | null>,
): Promise<void> {
  await patch({
    countdown_enabled: enabled,
    countdown_kina_date: dates.kina,
    countdown_nisan_date: dates.nisan,
    countdown_dugun_date: dates.dugun,
  });
}

export type ContentFields = {
  bride_name?: string | null;
  groom_name?: string | null;
  kina_eyebrow?: string | null;
  kina_welcome?: string | null;
  nisan_eyebrow?: string | null;
  nisan_welcome?: string | null;
  dugun_eyebrow?: string | null;
  dugun_welcome?: string | null;
  andac_desc?: string | null;
  foto_desc?: string | null;
};

export async function setContent(fields: ContentFields): Promise<void> {
  await patch(fields);
}

export async function setBackground(key: string | null): Promise<void> {
  await patch({ background_key: key });
}

export async function setSeatingPublic(value: boolean): Promise<void> {
  await patch({ seating_public: value });
}

export async function setSeatStart(
  x: number | null,
  y: number | null,
): Promise<void> {
  await patch({ seat_start_x: x, seat_start_y: y });
}
