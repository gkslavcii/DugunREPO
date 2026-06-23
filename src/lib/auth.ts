import { cookies } from "next/headers";
import { createHash } from "node:crypto";

const COOKIE = "dugun_admin";

export function adminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

/** Şifreden türetilen oturum jetonu (şifrenin kendisi çereze yazılmaz). */
function token(): string {
  const pw = process.env.ADMIN_PASSWORD ?? "";
  return createHash("sha256").update("dugun::" + pw).digest("hex");
}

export async function isAdmin(): Promise<boolean> {
  if (!adminConfigured()) return false;
  const c = await cookies();
  return c.get(COOKIE)?.value === token();
}

/** Şifre doğruysa oturum çerezini kurar. Sadece server action içinden çağrılmalı. */
export async function signIn(password: string): Promise<boolean> {
  if (!adminConfigured()) return false;
  if (password !== process.env.ADMIN_PASSWORD) return false;
  const c = await cookies();
  c.set(COOKIE, token(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 gün
  });
  return true;
}

export async function signOut(): Promise<void> {
  const c = await cookies();
  c.delete(COOKIE);
}
