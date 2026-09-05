import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // sharp'ı bundle etme; Vercel'de native binary'siyle çalışsın
  serverExternalPackages: ["sharp"],
};

export default nextConfig;
