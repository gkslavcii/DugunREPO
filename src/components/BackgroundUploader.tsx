"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createBackgroundUploadUrl,
  registerBackground,
} from "@/app/admin/actions";

/** Admin: anasayfa/paylaşım arka plan resmini yükler (JPG/PNG/WEBP). */
export default function BackgroundUploader() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 15 * 1024 * 1024) {
      setStatus("Görsel çok büyük (en fazla 15 MB).");
      return;
    }
    setBusy(true);
    setStatus(null);
    try {
      const ct = file.type;
      const res = await createBackgroundUploadUrl(ct);
      if (!res) {
        setStatus("Yalnızca JPG / PNG / WEBP yükleyebilirsin.");
        setBusy(false);
        return;
      }
      const put = await fetch(res.url, {
        method: "PUT",
        headers: { "Content-Type": ct },
        body: file,
      });
      if (!put.ok) {
        setStatus("Yükleme başarısız oldu.");
        setBusy(false);
        return;
      }
      const reg = await registerBackground(res.key);
      setStatus(reg.ok ? "Arka plan güncellendi ✓" : "Kaydedilemedi.");
    } catch {
      setStatus("Bir şeyler ters gitti.");
    }
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
    router.refresh();
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="rounded-full bg-dusk-deep px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-70"
      >
        {busy ? "Yükleniyor…" : "Resim yükle"}
      </button>
      {status && <p className="text-xs text-ink-soft">{status}</p>}
    </div>
  );
}
