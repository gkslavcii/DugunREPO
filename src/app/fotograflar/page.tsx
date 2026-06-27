import Link from "next/link";
import { siteConfig } from "@/config/site";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isAdmin } from "@/lib/auth";
import { isR2Configured } from "@/lib/r2";
import PhotoUploader from "@/components/PhotoUploader";
import DeletePhotoButton from "@/components/DeletePhotoButton";

export const dynamic = "force-dynamic";

type Photo = { id: string; key: string };

export default async function FotograflarPage() {
  const { coupleNames } = siteConfig;

  const sb = getSupabaseAdmin();
  let photos: Photo[] = [];
  if (sb) {
    const { data } = await sb
      .from("photos")
      .select("id, key")
      .order("created_at", { ascending: false });
    photos = (data as Photo[]) ?? [];
  }

  const admin = await isAdmin();
  const ready = isR2Configured();

  return (
    <main className="relative flex min-h-dvh flex-col items-center px-6 py-16 sm:py-20">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[40vh] w-[40vh] -translate-x-1/2 rounded-full bg-sage/15 blur-3xl" />
      </div>

      <p className="text-xs uppercase tracking-[0.3em] text-ink-soft">
        {coupleNames.bride} &amp; {coupleNames.groom}
      </p>
      <h1 className="mt-3 font-display text-5xl text-ink sm:text-6xl">
        Fotoğraflar
      </h1>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px w-10 bg-line" />
        <span className="h-1.5 w-1.5 rotate-45 bg-dusk-deep/50" />
        <span className="h-px w-10 bg-line" />
      </div>

      <p className="mb-8 max-w-md text-center leading-relaxed text-ink-soft">
        Çektiğiniz kareleri yükleyin, bu güzel günü hep birlikte ölümsüzleştirelim.
      </p>

      {ready ? (
        <PhotoUploader />
      ) : (
        <p className="rounded-xl bg-[#b56a60]/10 px-4 py-3 text-center text-sm text-[#b56a60]">
          Fotoğraf yükleme henüz yapılandırılmadı.
        </p>
      )}

      {photos.length > 0 ? (
        <div className="mt-12 grid w-full max-w-3xl grid-cols-2 gap-2 sm:grid-cols-3">
          {photos.map((p) => (
            <div
              key={p.id}
              className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-white/40"
            >
              <a href={`/foto/${p.key}`} target="_blank" rel="noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/foto/${p.key}?w=600`}
                  alt="Düğün fotoğrafı"
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              </a>
              {admin && <DeletePhotoButton id={p.id} />}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-12 w-full max-w-md rounded-2xl border border-dashed border-line bg-white/40 px-6 py-14 text-center text-ink-soft">
          Henüz fotoğraf yok. İlk yükleyen sen ol! 📸
        </div>
      )}

      <Link
        href="/"
        className="mt-12 text-sm text-ink-soft underline-offset-4 transition hover:text-ink hover:underline"
      >
        ← Ana sayfa
      </Link>
    </main>
  );
}
