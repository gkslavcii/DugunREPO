import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Mulish } from "next/font/google";
import { getSettings } from "@/lib/settings";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const mulish = Mulish({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-mulish",
  display: "swap",
});

const DESCRIPTION =
  "Düğünümüze hoş geldiniz — bu güzel günü birlikte ölümsüzleştirelim.";

export async function generateMetadata(): Promise<Metadata> {
  const { brideName, groomName, backgroundKey } = await getSettings();
  const title = `${brideName} & ${groomName}`;
  const ogUrl = `/api/og?v=${encodeURIComponent(backgroundKey ?? "default")}`;
  return {
    metadataBase: new URL("https://sezin-goksel-wedding.vercel.app"),
    title,
    description: DESCRIPTION,
    openGraph: {
      title,
      description: DESCRIPTION,
      type: "website",
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: DESCRIPTION,
      images: [ogUrl],
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#faf7f2",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="tr"
      className={`${cormorant.variable} ${mulish.variable} antialiased`}
    >
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
