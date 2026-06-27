// Sosyal paylasim (Open Graph) gorselini uretir: src/app/opengraph-image.jpg
// Link WhatsApp/Instagram'da paylasilinca cikan kapak gorseli.
// Kullanim: node scripts/og-uret.mjs

import sharp from "sharp";

await sharp("public/images/couple-original.jpeg")
  .resize(1200, 630, { fit: "cover", position: sharp.strategy.attention })
  .jpeg({ quality: 85 })
  .toFile("src/app/opengraph-image.jpg");

console.log("OG gorseli olusturuldu -> src/app/opengraph-image.jpg");
