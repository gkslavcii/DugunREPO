import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import AdminTabs from "@/components/AdminTabs";
import {
  logoutAction,
  setModeAction,
  setPhotoApprovalAction,
  setCountdownAction,
  saveContentAction,
} from "../actions";

export const dynamic = "force-dynamic";

const inputCls =
  "w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none transition focus:border-dusk-deep";
const labelCls = "flex flex-col gap-1 text-xs font-medium text-ink-soft";

const MODES = [
  { id: "kina", label: "Kına" },
  { id: "nisan", label: "Nişan" },
  { id: "dugun", label: "Düğün" },
] as const;

export default async function AyarlarPage() {
  if (!(await isAdmin())) redirect("/admin");
  const s = await getSettings();

  return (
    <main className="mx-auto min-h-dvh w-full max-w-2xl px-6 py-12">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink-soft">
            Yönetim
          </p>
          <h1 className="font-display text-4xl text-ink">Ayarlar</h1>
        </div>
        <form action={logoutAction}>
          <button className="rounded-full border border-ink/15 px-4 py-2 text-xs text-ink-soft transition hover:bg-ink/[0.04]">
            Çıkış
          </button>
        </form>
      </div>

      <AdminTabs active="ayarlar" />

      {/* Anasayfa modu */}
      <section className="mb-6 rounded-2xl border border-line bg-white/60 p-5">
        <p className="mb-3 text-sm text-ink-soft">Anasayfa modu</p>
        <div className="flex flex-wrap gap-2">
          {MODES.map((m) => (
            <form key={m.id} action={setModeAction}>
              <input type="hidden" name="mode" value={m.id} />
              <button
                className={`rounded-full px-6 py-2.5 text-sm font-medium transition ${
                  s.mode === m.id
                    ? "bg-dusk-deep text-white"
                    : "border border-ink/15 text-ink hover:bg-ink/[0.04]"
                }`}
              >
                {m.label}
              </button>
            </form>
          ))}
        </div>
      </section>

      {/* İçerik */}
      <section className="mb-6 rounded-2xl border border-line bg-white/60 p-5">
        <h2 className="mb-4 font-display text-2xl text-ink">İçerik</h2>
        <form action={saveContentAction} className="flex flex-col gap-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelCls}>
              Gelin ismi
              <input
                name="bride_name"
                defaultValue={s.brideName}
                maxLength={40}
                className={inputCls}
              />
            </label>
            <label className={labelCls}>
              Damat ismi
              <input
                name="groom_name"
                defaultValue={s.groomName}
                maxLength={40}
                className={inputCls}
              />
            </label>
          </div>

          {MODES.map((m) => (
            <div
              key={m.id}
              className="rounded-xl border border-line/70 bg-white/50 p-4"
            >
              <p className="mb-3 font-medium text-ink">{m.label}</p>
              <div className="flex flex-col gap-3">
                <label className={labelCls}>
                  Üst başlık
                  <input
                    name={`${m.id}_eyebrow`}
                    defaultValue={s.events[m.id].eyebrow}
                    maxLength={80}
                    className={inputCls}
                  />
                </label>
                <label className={labelCls}>
                  Hoş geldiniz metni
                  <textarea
                    name={`${m.id}_welcome`}
                    defaultValue={s.events[m.id].welcome}
                    rows={2}
                    maxLength={300}
                    className={`${inputCls} resize-none`}
                  />
                </label>
              </div>
            </div>
          ))}

          <label className={labelCls}>
            Andaç sayfası açıklaması
            <textarea
              name="andac_desc"
              defaultValue={s.andacDesc}
              rows={3}
              maxLength={400}
              className={`${inputCls} resize-none`}
            />
          </label>
          <label className={labelCls}>
            Fotoğraf sayfası açıklaması
            <textarea
              name="foto_desc"
              defaultValue={s.fotoDesc}
              rows={2}
              maxLength={400}
              className={`${inputCls} resize-none`}
            />
          </label>

          <button className="self-start rounded-full bg-dusk-deep px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90">
            İçeriği Kaydet
          </button>
        </form>
      </section>

      {/* Anasayfa geri sayımı */}
      <section className="mb-6 rounded-2xl border border-line bg-white/60 p-5">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <p className="text-sm text-ink-soft">Anasayfa geri sayımı</p>
          <p className="font-display text-xl text-ink">
            {s.countdownEnabled ? "Açık" : "Kapalı"}
          </p>
        </div>
        <form action={setCountdownAction} className="flex flex-col gap-3">
          <div className="grid gap-4 sm:grid-cols-3">
            <label className={labelCls}>
              Kına tarihi
              <input
                type="date"
                name="kina_date"
                defaultValue={s.countdownDates.kina ?? ""}
                className={inputCls}
              />
            </label>
            <label className={labelCls}>
              Nişan tarihi
              <input
                type="date"
                name="nisan_date"
                defaultValue={s.countdownDates.nisan ?? ""}
                className={inputCls}
              />
            </label>
            <label className={labelCls}>
              Düğün tarihi
              <input
                type="date"
                name="dugun_date"
                defaultValue={s.countdownDates.dugun ?? ""}
                className={inputCls}
              />
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-ink-soft">
              <input
                type="checkbox"
                name="enabled"
                defaultChecked={s.countdownEnabled}
                className="h-4 w-4 accent-dusk-deep"
              />
              Anasayfada göster
            </label>
            <button className="rounded-full bg-dusk-deep px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90">
              Kaydet
            </button>
          </div>
        </form>
      </section>

      {/* Fotoğraf onayı */}
      <section className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-line bg-white/60 p-5">
        <div>
          <p className="text-sm text-ink-soft">Fotoğraf onayı</p>
          <p className="font-display text-2xl text-ink">
            {s.requirePhotoApproval ? "Açık" : "Kapalı"}
          </p>
        </div>
        <form action={setPhotoApprovalAction}>
          <input
            type="hidden"
            name="value"
            value={s.requirePhotoApproval ? "off" : "on"}
          />
          <button className="whitespace-nowrap rounded-full bg-dusk-deep px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90">
            {s.requirePhotoApproval ? "Kapat" : "Aç"}
          </button>
        </form>
      </section>

      <Link
        href="/"
        className="mt-4 inline-block text-sm text-ink-soft underline-offset-4 transition hover:text-ink hover:underline"
      >
        ← Ana sayfa
      </Link>
    </main>
  );
}
