// Tum dugun fotograflarini R2'den bilgisayara toplu indirir.
// Calistirma:  node --env-file=.env.local scripts/fotograflari-indir.mjs
// Fotograflar "indirilen-fotograflar/" klasorune kaydedilir.

import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});
const bucket = process.env.R2_BUCKET;
const outDir = "indirilen-fotograflar";

let token;
let total = 0;
do {
  const res = await s3.send(
    new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: "fotograflar/",
      ContinuationToken: token,
    }),
  );
  for (const obj of res.Contents ?? []) {
    if (obj.Key.includes("/test/")) continue; // test dosyalarini atla
    const get = await s3.send(
      new GetObjectCommand({ Bucket: bucket, Key: obj.Key }),
    );
    const bytes = Buffer.from(await get.Body.transformToByteArray());
    const dest = join(outDir, obj.Key);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, bytes);
    total++;
    console.log("indirildi:", obj.Key);
  }
  token = res.IsTruncated ? res.NextContinuationToken : undefined;
} while (token);

console.log(`\nToplam ${total} fotograf "${outDir}" klasorune indirildi.`);
