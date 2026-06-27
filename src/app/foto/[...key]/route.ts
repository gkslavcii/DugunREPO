import sharp from "sharp";
import { getObject } from "@/lib/r2";

export const runtime = "nodejs";

/**
 * Fotoğrafları sitenin kendi alan adından sunar (r2.dev'e bağımlı değil).
 * `?w=<genislik>` verilirse sharp ile küçültülmüş webp döner (galeri için).
 * Aksi halde orijinali döner. Yanıtlar uzun süre önbelleklenir.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key } = await params;
  const fullKey = key.join("/");
  if (!fullKey.startsWith("fotograflar/")) {
    return new Response("Not found", { status: 404 });
  }

  const obj = await getObject(fullKey);
  if (!obj || !obj.Body) {
    return new Response("Not found", { status: 404 });
  }

  const original = Buffer.from(await obj.Body.transformToByteArray());
  let body: Buffer = original;
  let contentType = obj.ContentType ?? "image/jpeg";

  const w = Number(new URL(req.url).searchParams.get("w"));
  if (w > 0 && w <= 2000) {
    try {
      body = await sharp(original)
        .rotate() // EXIF yönünü düzelt (telefon fotoğrafları için)
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
      contentType = "image/webp";
    } catch {
      body = original; // HEIC vb. küçültülemezse orijinali ver
    }
  }

  return new Response(new Uint8Array(body), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
