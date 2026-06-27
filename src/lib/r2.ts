import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET;
const publicBase = process.env.R2_PUBLIC_URL;

export function isR2Configured(): boolean {
  return Boolean(accountId && accessKeyId && secretAccessKey && bucket);
}

let _client: S3Client | null = null;
function client(): S3Client {
  if (!_client) {
    _client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKeyId!,
        secretAccessKey: secretAccessKey!,
      },
    });
  }
  return _client;
}

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/heic": "heic",
  "image/heif": "heif",
};

/** Sunucuda benzersiz, tarihe göre gruplanmış bir nesne anahtarı üretir. */
export function newKey(contentType: string): string {
  const ext = EXT[contentType] ?? "bin";
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
    d.getDate(),
  ).padStart(2, "0")}`;
  return `fotograflar/${ymd}/${randomUUID()}.${ext}`;
}

export function publicUrl(key: string): string {
  return `${(publicBase ?? "").replace(/\/$/, "")}/${key}`;
}

/** Tarayıcının doğrudan R2'ye yüklemesi için kısa ömürlü imzalı PUT adresi. */
export async function presignPut(
  key: string,
  contentType: string,
): Promise<string> {
  return getSignedUrl(
    client(),
    new PutObjectCommand({ Bucket: bucket!, Key: key, ContentType: contentType }),
    { expiresIn: 600 },
  );
}

export async function objectExists(key: string): Promise<boolean> {
  try {
    await client().send(new HeadObjectCommand({ Bucket: bucket!, Key: key }));
    return true;
  } catch {
    return false;
  }
}

export async function deleteObject(key: string): Promise<void> {
  await client().send(new DeleteObjectCommand({ Bucket: bucket!, Key: key }));
}

/** Nesneyi R2'den çeker (S3 endpoint üzerinden — r2.dev'e bağımlı değil). */
export async function getObject(key: string) {
  if (!isR2Configured()) return null;
  try {
    return await client().send(
      new GetObjectCommand({ Bucket: bucket!, Key: key }),
    );
  } catch {
    return null;
  }
}
