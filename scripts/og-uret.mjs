// Varsayilan sosyal paylasim (Open Graph) gorseli: public/images/og.jpg
// Admin bir arka plan yuklemediyse /api/og bunu dondurur.
// Kullanim: node scripts/og-uret.mjs

import sharp from "sharp";

await sharp("public/images/dans.jpg")
  .resize(1200, 630, { fit: "cover", position: sharp.strategy.attention })
  .jpeg({ quality: 85 })
  .toFile("public/images/og.jpg");

console.log("Varsayilan OG gorseli olusturuldu -> public/images/og.jpg");
