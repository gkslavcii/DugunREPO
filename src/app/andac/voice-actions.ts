"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  isR2Configured,
  newKey,
  presignPut,
  objectExists,
  deleteObject,
} from "@/lib/r2";

const ALLOWED = new Set([
  "audio/webm",
  "audio/ogg",
  "audio/mp4",
  "audio/x-m4a",
  "audio/mpeg",
  "audio/wav",
]);

/** Tarayıcıya sesli mesaj için imzalı yükleme adresi + anahtar verir. */
export async function createVoiceUploadUrl(
  contentType: string,
): Promise<{ url: string; key: string } | null> {
  if (!isR2Configured()) return null;
  if (!ALLOWED.has(contentType)) return null;
  const key = newKey(contentType, "sesli");
  const url = await presignPut(key, contentType);
  return { url, key };
}

/** Yükleme bitince sesli mesajı kaydeder (önce R2'de var mı diye doğrular). */
export async function registerVoiceMessage(
  key: string,
  name: string,
  durationSec: number,
): Promise<{ ok: boolean }> {
  const sb = getSupabaseAdmin();
  if (!sb || !isR2Configured()) return { ok: false };
  if (!key.startsWith("sesli/")) return { ok: false };
  if (!(await objectExists(key))) return { ok: false };

  const cleanName = (name ?? "").trim().slice(0, 80) || null;
  const dur =
    Number.isFinite(durationSec) && durationSec > 0
      ? Math.round(durationSec)
      : null;

  const { error } = await sb
    .from("voice_messages")
    .insert({ key, name: cleanName, duration_sec: dur });
  if (error) return { ok: false };

  return { ok: true };
}

/** Yalnızca yönetici: sesli mesajı hem R2'den hem veritabanından siler. */
export async function deleteVoiceMessage(formData: FormData) {
  if (!(await isAdmin())) return;
  const id = String(formData.get("id") ?? "");
  const sb = getSupabaseAdmin();
  if (!sb || !id) return;

  const { data } = await sb
    .from("voice_messages")
    .select("key")
    .eq("id", id)
    .single();
  if (data?.key) {
    try {
      await deleteObject(data.key);
    } catch {
      // R2'de yoksa bile DB kaydını temizleyelim
    }
  }
  await sb.from("voice_messages").delete().eq("id", id);
  revalidatePath("/admin");
}
