"use client";

import { useState } from "react";

/**
 * Tüm fotoğrafları ORİJİNAL kalitede tek ZIP olarak indirir.
 * Tarayıcıda çalışır (JSZip); her dosyayı /foto proxy'sinden ham haliyle çeker.
 */
export default function DownloadAllButton() {
  const [busy, setBusy] = useState(false);
  const [prog, setProg] = useState(0);

  async function run() {
    setBusy(true);
    setProg(0);
    try {
      const res = await fetch("/api/photos", { cache: "no-store" });
      const { photos } = (await res.json()) as { photos: { key: string }[] };
      if (!photos.length) {
        alert("İndirilecek fotoğraf yok.");
        setBusy(false);
        return;
      }

      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();

      for (let i = 0; i < photos.length; i++) {
        const key = photos[i].key;
        const r = await fetch(`/foto/${key}`); // ?w yok => ORİJİNAL
        if (r.ok) zip.file(key, await r.blob());
        setProg(Math.round(((i + 1) / photos.length) * 100));
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "dugun-fotograflari.zip";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("İndirme sırasında bir sorun oldu, tekrar dener misin?");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={run}
      disabled={busy}
      className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-ivory transition hover:opacity-90 disabled:opacity-60"
    >
      {busy ? `İndiriliyor… %${prog}` : "Tüm fotoğrafları indir (ZIP)"}
    </button>
  );
}
