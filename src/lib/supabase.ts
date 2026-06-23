import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Supabase anahtarları .env.local içinde tanımlı mı? */
export function isSupabaseConfigured(): boolean {
  return Boolean(url && serviceKey && url.startsWith("https://"));
}

/**
 * Sunucu tarafı, tam yetkili istemci (service_role).
 * RLS'i bypass eder — ASLA istemciye/tarayıcıya sızdırma.
 * Yapılandırma yoksa null döner (uygulama çökmez).
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  return createClient(url!, serviceKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
