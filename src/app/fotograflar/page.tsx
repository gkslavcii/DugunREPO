import Link from "next/link";
import { siteConfig } from "@/config/site";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isAdmin } from "@/lib/auth";
import { isR2Configured } from "@/lib/r2";
import PhotoUploader from "@/components/PhotoUploader";
import PhotoGallery from "@/components/PhotoGallery";
import DarkBackdrop from "@/components/DarkBackdrop";
import { Monogram, Sprig } from "@/components/ornaments";

export const dynamic = "force-dynamic";

type Photo = { id: string; key: string };

export default async function FotograflarPage() {
  const { coupleNames } = siteConfig;

  const sb = getSupabaseAdmin();
  let photos: Photo[] = [];
  let dbError = false;
  if (sb) {
    try {
      const { data, error } = await sb
        .from("photos")
        .select("id, key")
        .order("created_at", { ascending: false });
      if (error) dbError = true;
      else photos = (data as Photo[]) ?? [];
    } catch {
      dbError = true;
    }
  }

  const admin = await isAdmin();
  const ready = isR2Configured();

  return (
    <main className="relative flex min-h-dvh flex-col items-center px-6 py-16 sm:py-20">
      <DarkBackdrop />

      <div
        className="reveal flex flex-col items-center"
        style={{ animationDelay: "0.05s" }}
      >
        <Monogram
          left={coupleNames.bride[0]}
          right={coupleNames.groom[0]}
          variant="light"
        />
        <p className="mt-4 text-xs uppercase tracking-[0.3em] text-ivory/70">
          {coupleNames.bride} &amp; {coupleNames.groom}
        </p>
        <h1 className="mt-2 font-display text-5xl text-ivory sm:text-6xl">
          Fotoğraflar
        </h1>
        <div className="my-6 flex items-center gap-3">
          <Sprig className="h-5 w-14 text-sage/80" />
          <span className="h-1.5 w-1.5 rotate-45 bg-ivory/50" />
          <Sprig className="h-5 w-14 -scale-x-100 text-sage/80" />
        </div>
        <p className="mb-8 max-w-md text-center leading-relaxed text-ivory/80">
          Çektiğiniz kareleri yükleyin, bu güzel günü hep birlikte
          ölümsüzleştirelim.
        </p>
      </div>

      {ready ? (
        <PhotoUploader />
      ) : (
        <p className="rounded-xl bg-[#b56a60]/10 px-4 py-3 text-center text-sm text-[#b56a60]">
          Fotoğraf yükleme henüz yapılandırılmadı.
        </p>
      )}

      {dbError ? (
        <div className="mt-12 w-full max-w-md rounded-2xl border border-dashed border-white/20 bg-white/[0.05] px-6 py-14 text-center text-ivory/70 backdrop-blur-sm">
          Fotoğraflar şu an yüklenemiyor. Lütfen birazdan tekrar deneyin. 🙏
        </div>
      ) : photos.length > 0 ? (
        <PhotoGallery photos={photos} admin={admin} />
      ) : (
        <div className="mt-12 w-full max-w-md rounded-2xl border border-dashed border-white/20 bg-white/[0.05] px-6 py-14 text-center text-ivory/70 backdrop-blur-sm">
          Henüz fotoğraf yok. İlk yükleyen sen ol! 📸
        </div>
      )}

      <Link
        href="/"
        className="mt-12 text-sm text-ivory/70 underline-offset-4 transition hover:text-ivory hover:underline"
      >
        ← Ana sayfa
      </Link>
    </main>
  );
}
