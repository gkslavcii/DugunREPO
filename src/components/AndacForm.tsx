"use client";

import { useActionState } from "react";
import Link from "next/link";
import { submitAndac, type AndacState } from "@/app/andac/actions";

export default function AndacForm() {
  const [state, formAction, pending] = useActionState<AndacState, FormData>(
    submitAndac,
    null,
  );

  if (state?.ok) {
    return (
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-dusk/20 text-3xl">
          💛
        </div>
        <p className="font-display text-4xl text-ink">Teşekkürler!</p>
        <p className="max-w-sm text-ink-soft">{state.message}</p>
        <div className="mt-2 flex gap-3">
          <button
            type="button"
            onClick={() => location.reload()}
            className="rounded-full border border-ink/15 bg-white/50 px-6 py-2.5 text-sm text-ink transition hover:bg-white"
          >
            Bir not daha bırak
          </button>
          <Link
            href="/"
            className="rounded-full bg-ink px-6 py-2.5 text-sm text-ivory transition hover:opacity-90"
          >
            Ana sayfa
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex w-full max-w-lg flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="content" className="text-sm font-medium text-ink">
          Notunuz <span className="text-[#b56a60]">*</span>
        </label>
        <textarea
          id="content"
          name="content"
          required
          maxLength={1000}
          rows={5}
          placeholder="Sezin & Göksel'e güzel dilekleriniz..."
          className="w-full resize-none rounded-2xl border border-line bg-white/70 px-4 py-3 text-ink shadow-sm outline-none transition placeholder:text-ink-soft/50 focus:border-dusk-deep focus:ring-2 focus:ring-dusk/30"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-sm font-medium text-ink">
          İsminiz{" "}
          <span className="font-normal text-ink-soft">(isteğe bağlı)</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          maxLength={80}
          placeholder="Adınız Soyadınız"
          className="w-full rounded-full border border-line bg-white/70 px-4 py-3 text-ink shadow-sm outline-none transition placeholder:text-ink-soft/50 focus:border-dusk-deep focus:ring-2 focus:ring-dusk/30"
        />
      </div>

      {/* bot tuzağı — gerçek kullanıcı görmez */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      {state && !state.ok && (
        <p className="text-sm text-[#b56a60]">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 inline-flex h-12 items-center justify-center rounded-full bg-ink px-8 text-sm font-medium tracking-wide text-ivory shadow-sm transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Gönderiliyor..." : "Gönder"}
      </button>
    </form>
  );
}
