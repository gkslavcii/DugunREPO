"use server";

import { getSupabaseAdmin } from "@/lib/supabase";

export type AndacState = { ok: boolean; message: string } | null;

export async function submitAndac(
  _prev: AndacState,
  formData: FormData,
): Promise<AndacState> {
  const content = String(formData.get("content") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const honeypot = String(formData.get("website") ?? "").trim();

  // Bot tuzağı: gizli alan doluysa sessizce "başarılı" dön.
  if (honeypot) return { ok: true, message: "Teşekkürler!" };

  if (!content) return { ok: false, message: "Lütfen bir not yazın." };
  if (content.length > 1000)
    return { ok: false, message: "Not çok uzun (en fazla 1000 karakter)." };
  if (name.length > 80) return { ok: false, message: "İsim çok uzun." };

  const supabase = getSupabaseAdmin();
  if (!supabase)
    return {
      ok: false,
      message: "Sistem henüz hazır değil. Lütfen birazdan tekrar deneyin.",
    };

  const { error } = await supabase
    .from("notes")
    .insert({ content, name: name || null });

  if (error)
    return {
      ok: false,
      message: "Bir şeyler ters gitti, tekrar dener misiniz?",
    };

  return { ok: true, message: "Notunuz bize ulaştı, çok teşekkür ederiz! 💛" };
}
