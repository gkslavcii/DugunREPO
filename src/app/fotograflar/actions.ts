"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  isR2Configured,
  newKey,
  presignPut,
  publicUrl,
  objectExists,
  deleteObject,
} from "@/lib/r2";

const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
]);

/** Tarayıcıya imzalı yükleme adresi + nesne anahtarı verir. */
export async function createUploadUrl(
  contentType: string,
): Promise<{ url: string; key: string } | null> {
  if (!isR2Configured()) return null;
  if (!ALLOWED.has(contentType)) return null;
  const key = newKey(contentType);
  const url = await presignPut(key, contentType);
  return { url, key };
}

/** Yükleme bitince fotoğrafı galeriye kaydeder (önce R2'de var mı diye doğrular). */
export async function registerPhoto(key: string): Promise<{ ok: boolean }> {
  const sb = getSupabaseAdmin();
  if (!sb || !isR2Configured()) return { ok: false };
  if (!key.startsWith("fotograflar/")) return { ok: false };
  if (!(await objectExists(key))) return { ok: false };

  const { error } = await sb.from("photos").insert({ key, url: publicUrl(key) });
  if (error) return { ok: false };

  revalidatePath("/fotograflar");
  return { ok: true };
}

/** Yalnızca yönetici: fotoğrafı hem R2'den hem veritabanından siler. */
export async function deletePhoto(formData: FormData) {
  if (!(await isAdmin())) return;
  const id = String(formData.get("id") ?? "");
  const sb = getSupabaseAdmin();
  if (!sb || !id) return;

  const { data } = await sb.from("photos").select("key").eq("id", id).single();
  if (data?.key) {
    try {
      await deleteObject(data.key);
    } catch {
      // R2'de yoksa bile DB kaydını temizleyelim
    }
  }
  await sb.from("photos").delete().eq("id", id);
  revalidatePath("/fotograflar");
}
