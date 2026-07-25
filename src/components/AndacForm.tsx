"use client";

import { useActionState } from "react";
import Link from "next/link";
import { submitAndac, type AndacState } from "@/app/andac/actions";
import Petals from "./Petals";

export default function AndacForm() {
  const [state, formAction, pending] = useActionState<AndacState, FormData>(
    submitAndac,
    null,
  );

  if (state?.ok) {
    return (
      <div className="flex flex-col items-center gap-5 text-center">
        <Petals />
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-dusk/20 text-3xl">
          💛
        </div>
        <p className="font-display text-4xl text-ivory">Teşekkürler!</p>
        <p className="max-w-sm text-ivory/80">{state.message}</p>
        <div className="mt-2 flex gap-3">
          <button
            type="button"
            onClick={() => location.reload()}
            className="rounded-full border border-white/20 bg-white/10 px-6 py-2.5 text-sm text-ivory backdrop-blur-sm transition hover:bg-white/20"
          >
            Bir not daha bırak
          </button>
          <Link
            href="/"
            className="rounded-full bg-ivory px-6 py-2.5 text-sm text-ink transition hover:bg-white"
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
        <label htmlFor="content" className="text-sm font-medium text-ivory">
          Notunuz <span className="text-rose">*</span>
        </label>
        <textarea
          id="content"
          name="content"
          required
          maxLength={1000}
          rows={5}
          placeholder="Sezin & Göksel'e güzel dilekleriniz..."
          className="w-full resize-none rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-ivory shadow-sm outline-none backdrop-blur-sm transition placeholder:text-ivory/40 focus:border-dusk focus:ring-2 focus:ring-dusk/30"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-sm font-medium text-ivory">
          İsminiz{" "}
          <span className="font-normal text-ivory/60">(isteğe bağlı)</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          maxLength={80}
          placeholder="Adınız Soyadınız"
          className="w-full rounded-full border border-white/20 bg-white/10 px-4 py-3 text-ivory shadow-sm outline-none backdrop-blur-sm transition placeholder:text-ivory/40 focus:border-dusk focus:ring-2 focus:ring-dusk/30"
        />
      </div>

      <label className="flex cursor-pointer items-start gap-2.5 text-sm text-ivory/80">
        <input
          type="checkbox"
          name="is_public"
          className="mt-0.5 h-4 w-4 accent-dusk"
        />
        <span>
          Bu notu <span className="font-medium text-ivory">herkese açık</span>{" "}
          yayınla (Andaç sayfasında diğer misafirler de görebilsin)
        </span>
      </label>

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
        <p className="text-sm text-rose">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 inline-flex h-12 items-center justify-center rounded-full bg-ivory px-8 text-sm font-medium tracking-wide text-ink shadow-sm transition hover:bg-white disabled:opacity-60"
      >
        {pending ? "Gönderiliyor..." : "Gönder"}
      </button>
    </form>
  );
}
