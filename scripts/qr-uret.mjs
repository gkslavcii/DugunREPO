// Siteye giden QR kodunu uretir (sade PNG + SVG).
// Kullanim:  node scripts/qr-uret.mjs [adres]
// Ornek:     node scripts/qr-uret.mjs https://sezin-goksel-wedding.vercel.app

import QRCode from "qrcode";
import { mkdirSync, writeFileSync } from "node:fs";

const url = process.argv[2] || "https://sezin-goksel-wedding.vercel.app";
mkdirSync("public/qr", { recursive: true });

const color = { dark: "#2c3a42", light: "#ffffff" };

await QRCode.toFile("public/qr/qr.png", url, {
  width: 1000,
  margin: 2,
  color,
  errorCorrectionLevel: "M",
});

const svg = await QRCode.toString(url, {
  type: "svg",
  margin: 2,
  color,
  errorCorrectionLevel: "M",
});
writeFileSync("public/qr/qr.svg", svg);

console.log("QR uretildi ->", url);
console.log(" - public/qr/qr.png");
console.log(" - public/qr/qr.svg");
