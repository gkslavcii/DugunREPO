"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { signIn, signOut, isAdmin } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  setMode,
  setRequirePhotoApproval,
  setCountdown,
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
  if (mode === "kina" || mode === "dugun") {
    await setMode(mode as EventMode);
    revalidatePath("/");
    revalidatePath("/admin");
  }
}

export async function setPhotoApprovalAction(formData: FormData) {
  if (!(await isAdmin())) return;
  const on = String(formData.get("value") ?? "") === "on";
  await setRequirePhotoApproval(on);
  revalidatePath("/admin");
  revalidatePath("/fotograflar");
}

export async function setCountdownAction(formData: FormData) {
  if (!(await isAdmin())) return;
  const enabled = formData.get("enabled") === "on";
  const date = String(formData.get("date") ?? "").trim() || null;
  await setCountdown(enabled, date);
  revalidatePath("/");
  revalidatePath("/admin");
}
