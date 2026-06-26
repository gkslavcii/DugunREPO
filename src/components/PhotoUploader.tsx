"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createUploadUrl, registerPhoto } from "@/app/fotograflar/actions";

export default function PhotoUploader() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(0);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<string | null>(null);

  async function handleFiles(fileList: FileList) {
    const files = Array.from(fileList).filter(
      (f) => f.type.startsWith("image/") || f.type === "",
    );
    if (files.length === 0) return;

    setBusy(true);
    setTotal(files.length);
    setDone(0);
    setStatus(null);

    let ok = 0;
    let fail = 0;

    for (const file of files) {
      try {
        const contentType = file.type || "image/jpeg";
        if (file.size > 30 * 1024 * 1024) {
          fail++;
        } else {
          const res = await createUploadUrl(contentType);
          if (!res) {
            fail++;
          } else {
            const put = await fetch(res.url, {
              method: "PUT",
              headers: { "Content-Type": contentType },
              body: file,
            });
            if (put.ok) {
              const reg = await registerPhoto(res.key);
              if (reg.ok) ok++;
              else fail++;
            } else {
              fail++;
            }
          }
        }
      } catch {
        fail++;
      }
      setDone((d) => d + 1);
    }

    setBusy(false);
    setStatus(
      fail === 0
        ? `${ok} fotoğraf yüklendi, teşekkürler! 💛`
        : `${ok} yüklendi, ${fail} yüklenemedi.`,
    );
    if (inputRef.current) inputRef.current.value = "";
    router.refresh();
  }

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="inline-flex h-12 w-full items-center justify-center rounded-full bg-ink px-8 font-body text-sm font-medium tracking-wide text-ivory shadow-sm transition hover:opacity-90 disabled:opacity-70"
      >
        {busy ? `Yükleniyor… ${done}/${total}` : "Fotoğraf Seç ve Yükle"}
      </button>
      <p className="text-center text-xs text-ink-soft">
        Birden fazla seçebilirsin · yüklenenler herkese açık galeride görünür
      </p>
      {status && (
        <p className="text-center text-sm font-medium text-dusk-deep">
          {status}
        </p>
      )}
    </div>
  );
}
