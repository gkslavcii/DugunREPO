import { getObject } from "@/lib/r2";
import { getSettings } from "@/lib/settings";

export const runtime = "nodejs";

/**
 * Paylaşım (Open Graph) görseli. Admin bir arka plan yüklediyse onu 1200×630
 * kırpar; yoksa varsayılan public/images/og.jpg döner. `?v=` sadece önbellek
 * kırma içindir (arka plan değişince paylaşım kartı tazelensin).
 */
export async function GET(req: Request) {
  try {
    const { backgroundKey } = await getSettings();
    if (backgroundKey) {
      const obj = await getObject(backgroundKey);
      if (obj?.Body) {
        const src = Buffer.from(await obj.Body.transformToByteArray());
        try {
          const sharp = (await import("sharp")).default;
          const out = await sharp(src)
            .resize(1200, 630, {
              fit: "cover",
              position: sharp.strategy.attention,
            })
            .jpeg({ quality: 85 })
            .toBuffer();
          return new Response(new Uint8Array(out), {
            headers: {
              "Content-Type": "image/jpeg",
              "Cache-Control": "public, max-age=86400",
            },
          });
        } catch {
          // sharp yoksa: kırpmadan kaynak görseli döndür
          return new Response(new Uint8Array(src), {
            headers: {
              "Content-Type": obj.ContentType ?? "image/jpeg",
              "Cache-Control": "public, max-age=86400",
            },
          });
        }
      }
    }
  } catch {
    // hata olursa varsayılana düş
  }

  const def = await fetch(new URL("/images/og.jpg", req.url));
  const buf = Buffer.from(await def.arrayBuffer());
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
