"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/admin/actions";

export default function AdminLogin({ configured }: { configured: boolean }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    loginAction,
    null,
  );

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-3xl border border-line bg-white/60 p-8 shadow-sm">
        <p className="text-center text-xs uppercase tracking-[0.3em] text-ink-soft">
          Sezin &amp; Göksel
        </p>
        <h1 className="mt-2 text-center font-display text-4xl text-ink">
          Yönetim
        </h1>
        <p className="mb-6 mt-3 text-center text-sm text-ink-soft">
          Notları görmek için şifreyi gir.
        </p>

        {!configured && (
          <p className="mb-4 rounded-lg bg-[#b56a60]/10 px-3 py-2 text-center text-xs text-[#b56a60]">
            ADMIN_PASSWORD ayarlanmamış (.env.local).
          </p>
        )}

        <form action={action} className="flex flex-col gap-3">
          <input
            type="password"
            name="password"
            required
            autoFocus
            placeholder="Şifre"
            className="w-full rounded-full border border-line bg-white px-4 py-3 text-center text-ink outline-none transition focus:border-dusk-deep focus:ring-2 focus:ring-dusk/30"
          />
          {state?.error && (
            <p className="text-center text-sm text-[#b56a60]">{state.error}</p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-12 items-center justify-center rounded-full bg-ink px-8 text-sm font-medium text-ivory transition hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Kontrol ediliyor..." : "Giriş"}
          </button>
        </form>
      </div>
    </main>
  );
}
