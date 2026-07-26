"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { signIn, signOut, isAdmin } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  setMode,
  setRequirePhotoApproval,
  setCountdown,
  setContent,
} from "@/lib/settings";
import type { EventMode } from "@/config/site";

export type LoginState = { error: string } | null;

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  const ok = await signIn(password);
  if (!ok) return { error: "Şifre hatalı. Tekrar deneyin." };
  redirect("/admin");
}

export async function logoutAction() {
  await signOut();
  redirect("/admin");
}

export async function deleteNoteAction(formData: FormData) {
  if (!(await isAdmin())) return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const sb = getSupabaseAdmin();
  if (sb) await sb.from("notes").delete().eq("id", id);
  revalidatePath("/admin");
}

export async function setModeAction(formData: FormData) {
  if (!(await isAdmin())) return;
  const mode = String(formData.get("mode") ?? "");
  if (mode === "kina" || mode === "nisan" || mode === "dugun") {
    await setMode(mode as EventMode);
    revalidatePath("/");
    revalidatePath("/admin/ayarlar");
  }
}

export async function setPhotoApprovalAction(formData: FormData) {
  if (!(await isAdmin())) return;
  const on = String(formData.get("value") ?? "") === "on";
  await setRequirePhotoApproval(on);
  revalidatePath("/admin/ayarlar");
  revalidatePath("/fotograflar");
}

export async function setCountdownAction(formData: FormData) {
  if (!(await isAdmin())) return;
  const enabled = formData.get("enabled") === "on";
  const dates = {
    kina: String(formData.get("kina_date") ?? "").trim() || null,
    nisan: String(formData.get("nisan_date") ?? "").trim() || null,
    dugun: String(formData.get("dugun_date") ?? "").trim() || null,
  };
  await setCountdown(enabled, dates);
  revalidatePath("/");
  revalidatePath("/admin/ayarlar");
}

export async function saveContentAction(formData: FormData) {
  if (!(await isAdmin())) return;
  const g = (k: string) => String(formData.get(k) ?? "").trim() || null;
  await setContent({
    bride_name: g("bride_name"),
    groom_name: g("groom_name"),
    kina_eyebrow: g("kina_eyebrow"),
    kina_welcome: g("kina_welcome"),
    nisan_eyebrow: g("nisan_eyebrow"),
    nisan_welcome: g("nisan_welcome"),
    dugun_eyebrow: g("dugun_eyebrow"),
    dugun_welcome: g("dugun_welcome"),
    andac_desc: g("andac_desc"),
    foto_desc: g("foto_desc"),
  });
  revalidatePath("/");
  revalidatePath("/andac");
  revalidatePath("/fotograflar");
  revalidatePath("/admin/ayarlar");
}
