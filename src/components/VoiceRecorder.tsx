"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createVoiceUploadUrl,
  registerVoiceMessage,
} from "@/app/andac/voice-actions";
import Petals from "./Petals";

const MAX_SECONDS = 120;

type Status =
  | "idle"
  | "recording"
  | "recorded"
  | "uploading"
  | "done"
  | "error";

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  const prefs = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
    "audio/ogg",
  ];
  for (const t of prefs) {
    try {
      if (MediaRecorder.isTypeSupported(t)) return t;
    } catch {
      /* yoksay */
    }
  }
  return undefined;
}

function baseType(t: string): string {
  return (t || "audio/webm").split(";")[0].trim();
}

function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

type Env = "ios-safari" | "ios-chrome" | "ios-other" | "android" | "other";

function detectEnv(): Env {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent || "";
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (/Macintosh/.test(ua) &&
      typeof document !== "undefined" &&
      "ontouchend" in document); // iPadOS masaüstü modu
  if (isIOS) {
    if (/CriOS/.test(ua)) return "ios-chrome";
    if (/FxiOS|EdgiOS|OPiOS|GSA/.test(ua)) return "ios-other";
    return "ios-safari";
  }
  if (/Android/.test(ua)) return "android";
  return "other";
}

function permSteps(env: Env): string[] {
  if (env === "ios-safari")
    return [
      'Adres çubuğundaki "aA" simgesine dokun',
      '"Web Sitesi Ayarları"na gir',
      'Mikrofon → "İzin Ver" seç',
      "Sayfayı yenileyip mikrofona tekrar dokun",
    ];
  if (env === "ios-chrome")
    return [
      "iPhone Ayarlar uygulamasını aç",
      "Aşağı inip Chrome'a dokun",
      'Mikrofon iznini aç',
      "Bu sayfaya dönüp tekrar dene",
    ];
  if (env === "ios-other")
    return [
      "iPhone Ayarlar uygulamasını aç",
      "Aşağı inip kullandığın tarayıcıya dokun",
      "Mikrofon iznini aç",
      "Bu sayfaya dönüp tekrar dene",
    ];
  if (env === "android")
    return [
      "Adres çubuğundaki 🔒 simgesine dokun",
      '"İzinler" (Site ayarları)',
      'Mikrofon → "İzin ver"',
      "Kapalıysa: Ayarlar → Uygulamalar → tarayıcın → İzinler → Mikrofon",
    ];
  return [
    "Adres çubuğundaki 🔒 / kamera simgesine tıkla",
    'Mikrofon → "İzin ver"',
    '"Tekrar dene"ye bas',
  ];
}

const MicIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    className="h-6 w-6"
    aria-hidden
  >
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M6 11a6 6 0 0 0 12 0" />
    <path d="M12 17v3" />
  </svg>
);

export default function VoiceRecorder() {
  const [status, setStatus] = useState<Status>("idle");
  const [supported, setSupported] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [permHelp, setPermHelp] = useState(false);
  const [env, setEnv] = useState<Env>("other");

  const mrRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const blobRef = useRef<Blob | null>(null);
  const urlRef = useRef<string | null>(null);
  const durationRef = useRef(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const ok =
      typeof navigator !== "undefined" &&
      !!navigator.mediaDevices?.getUserMedia &&
      typeof MediaRecorder !== "undefined";
    setSupported(ok);
    setEnv(detectEnv());
  }, []);

  const stopTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const clearTick = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearTick();
      stopTracks();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, [clearTick, stopTracks]);

  const resetPreview = useCallback(() => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    setPreviewUrl(null);
    blobRef.current = null;
    chunksRef.current = [];
    durationRef.current = 0;
    setElapsed(0);
  }, []);

  async function startRecording() {
    setError(null);
    resetPreview();

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      const name = (err as { name?: string })?.name ?? "";
      let msg =
        "Mikrofona erişilemedi. Tarayıcı iznini kontrol edip tekrar dene.";
      if (name === "NotAllowedError" || name === "SecurityError") {
        msg = "Mikrofon izni kapalı görünüyor.";
        setPermHelp(true);
      } else if (name === "NotFoundError" || name === "OverconstrainedError") {
        msg = "Cihazında mikrofon bulunamadı.";
      } else if (name === "NotReadableError") {
        msg =
          "Mikrofon başka bir uygulama tarafından kullanılıyor olabilir. Diğer uygulamaları kapatıp tekrar dene.";
      }
      setError(msg);
      setStatus("error");
      return;
    }
    streamRef.current = stream;

    const mime = pickMimeType();
    let mr: MediaRecorder;
    try {
      mr = mime
        ? new MediaRecorder(stream, { mimeType: mime })
        : new MediaRecorder(stream);
    } catch {
      mr = new MediaRecorder(stream);
    }
    mrRef.current = mr;
    chunksRef.current = [];

    mr.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };
    mr.onstop = () => {
      clearTick();
      const type = baseType(mr.mimeType);
      const blob = new Blob(chunksRef.current, { type });
      blobRef.current = blob;
      const url = URL.createObjectURL(blob);
      urlRef.current = url;
      setPreviewUrl(url);
      stopTracks();
      setStatus("recorded");
    };

    const startedAt = Date.now();
    durationRef.current = 0;
    setElapsed(0);
    mr.start();
    setStatus("recording");
    tickRef.current = setInterval(() => {
      const s = Math.floor((Date.now() - startedAt) / 1000);
      durationRef.current = s;
      setElapsed(s);
      if (s >= MAX_SECONDS) stopRecording();
    }, 250);
  }

  function stopRecording() {
    const mr = mrRef.current;
    if (mr && mr.state !== "inactive") {
      try {
        mr.stop();
      } catch {
        /* yoksay */
      }
    }
  }

  async function send() {
    const blob = blobRef.current;
    if (!blob) return;
    if (blob.size > 25 * 1024 * 1024) {
      setError("Kayıt çok büyük.");
      return;
    }
    setStatus("uploading");
    setError(null);
    try {
      const contentType = baseType(blob.type);
      const res = await createVoiceUploadUrl(contentType);
      if (!res) {
        setError("Sistem şu an hazır değil, birazdan tekrar dene.");
        setStatus("recorded");
        return;
      }
      const put = await fetch(res.url, {
        method: "PUT",
        headers: { "Content-Type": contentType },
        body: blob,
      });
      if (!put.ok) {
        setError("Yükleme başarısız oldu, tekrar dener misin?");
        setStatus("recorded");
        return;
      }
      const reg = await registerVoiceMessage(
        res.key,
        name,
        durationRef.current,
      );
      if (!reg.ok) {
        setError("Kaydedilemedi, tekrar dener misin?");
        setStatus("recorded");
        return;
      }
      resetPreview();
      setName("");
      setCelebrate((c) => c + 1);
      setStatus("done");
    } catch {
      setError("Bir şeyler ters gitti, tekrar dener misin?");
      setStatus("recorded");
    }
  }

  if (!supported) {
    return (
      <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-white/[0.07] p-6 text-center text-sm text-ivory/70 backdrop-blur-sm">
        Tarayıcın ses kaydını desteklemiyor gibi. Güncel Chrome ya da Safari ile
        tekrar dener misin? 🎙️
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="flex w-full max-w-lg flex-col items-center gap-4 rounded-2xl border border-white/15 bg-white/[0.07] p-8 text-center shadow-sm backdrop-blur-sm">
        {celebrate > 0 && <Petals key={celebrate} />}
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-dusk/20 text-2xl">
          🎙️
        </div>
        <p className="font-display text-3xl text-ivory">Sesin bize ulaştı!</p>
        <p className="text-sm text-ivory/80">Çok teşekkür ederiz 💛</p>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setStatus("idle");
          }}
          className="mt-1 rounded-full border border-white/20 bg-white/10 px-6 py-2.5 text-sm text-ivory backdrop-blur-sm transition hover:bg-white/20"
        >
          Bir tane daha bırak
        </button>
      </div>
    );
  }

  const recording = status === "recording";
  const recorded = status === "recorded";
  const uploading = status === "uploading";

  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-4 rounded-2xl border border-white/15 bg-white/[0.07] p-6 shadow-sm backdrop-blur-sm">
      {celebrate > 0 && <Petals key={celebrate} />}

      {/* kayıt / durdur düğmesi */}
      {!recorded && !uploading && (
        <div className="relative flex h-20 w-20 items-center justify-center">
          {recording && (
            <span className="absolute inset-0 animate-ping rounded-full bg-rose/40" />
          )}
          <button
            type="button"
            onClick={recording ? stopRecording : startRecording}
            aria-label={recording ? "Kaydı durdur" : "Kaydı başlat"}
            className={`relative flex h-16 w-16 items-center justify-center rounded-full shadow-md transition ${
              recording
                ? "bg-rose text-white"
                : "bg-ivory text-ink hover:bg-white"
            }`}
          >
            {recording ? (
              <span className="h-5 w-5 rounded-[4px] bg-white" />
            ) : (
              <MicIcon />
            )}
          </button>
        </div>
      )}

      {/* durum metni / sayaç */}
      {!recorded && !uploading && (
        <div className="text-center">
          {recording ? (
            <p className="font-display text-2xl text-ivory">
              {fmt(elapsed)}{" "}
              <span className="align-middle text-sm text-rose">● kaydediliyor</span>
            </p>
          ) : (
            <>
              <p className="text-sm font-medium text-ivory">
                Bize sesli mesaj bırak
              </p>
              <p className="mt-1 text-xs text-ivory/60">
                Mikrofona dokun · en fazla 2 dakika · herkese açık paylaşılmaz
              </p>
            </>
          )}
        </div>
      )}

      {/* önizleme + gönderme */}
      {recorded && previewUrl && (
        <div className="flex w-full flex-col items-center gap-4">
          <p className="text-sm text-ivory/70">
            Kaydını dinle{durationRef.current ? ` · ${fmt(durationRef.current)}` : ""}
          </p>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio src={previewUrl} controls className="w-full" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            placeholder="İsmin (isteğe bağlı)"
            className="w-full rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-ivory shadow-sm outline-none backdrop-blur-sm transition placeholder:text-ivory/40 focus:border-dusk focus:ring-2 focus:ring-dusk/30"
          />
          <div className="flex w-full flex-col gap-2.5 sm:flex-row">
            <button
              type="button"
              onClick={startRecording}
              className="inline-flex h-12 w-full items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 text-sm text-ivory backdrop-blur-sm transition hover:bg-white/20 sm:w-auto sm:flex-1"
            >
              Tekrar kaydet
            </button>
            <button
              type="button"
              onClick={send}
              className="inline-flex h-12 w-full items-center justify-center rounded-full bg-ivory px-6 text-sm font-medium text-ink shadow-sm transition hover:bg-white sm:w-auto sm:flex-1"
            >
              Gönder
            </button>
          </div>
        </div>
      )}

      {uploading && (
        <p className="py-4 text-sm font-medium text-dusk">Gönderiliyor…</p>
      )}

      {error && (
        <p className="text-center text-sm text-rose">
          {error}
          {permHelp && (
            <>
              {" "}
              <button
                type="button"
                onClick={() => setPermHelp(true)}
                className="font-medium underline underline-offset-2"
              >
                Nasıl açarım?
              </button>
            </>
          )}
        </p>
      )}

      {/* izin yönlendirme popup'ı */}
      {permHelp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-5 backdrop-blur-sm"
          onClick={() => setPermHelp(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-ivory p-6 text-left shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="text-2xl">🎙️</span>
              <h3 className="font-display text-2xl text-ink">
                Mikrofon izni gerekli
              </h3>
            </div>
            <p className="mb-4 text-sm text-ink-soft">
              Sesli mesaj için mikrofona izin vermen yeterli:
            </p>
            <ol className="mb-5 flex flex-col gap-2.5">
              {permSteps(env).map((s, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-ink">
                  <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-dusk-deep/15 text-xs font-medium text-dusk-deep">
                    {i + 1}
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setPermHelp(false)}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-ink/15 bg-white/60 text-sm text-ink transition hover:bg-white"
              >
                Kapat
              </button>
              <button
                type="button"
                onClick={() => {
                  setPermHelp(false);
                  startRecording();
                }}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-ink text-sm font-medium text-ivory transition hover:opacity-90"
              >
                Tekrar dene
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
