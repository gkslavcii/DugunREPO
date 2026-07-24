import { getObject } from "@/lib/r2";

export const runtime = "nodejs";

/**
 * Sesli mesajları sitenin kendi alan adından sunar (r2.dev'e bağımlı değil).
 * Yalnızca "sesli/" anahtarları; kısa kayıtlar olduğu için tüm gövde döner.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key } = await params;
  const fullKey = key.join("/");
  if (!fullKey.startsWith("sesli/")) {
    return new Response("Not found", { status: 404 });
  }

  const obj = await getObject(fullKey);
  if (!obj || !obj.Body) {
    return new Response("Not found", { status: 404 });
  }

  const buf = Buffer.from(await obj.Body.transformToByteArray());
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": obj.ContentType ?? "audio/webm",
      "Content-Length": String(buf.length),
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
