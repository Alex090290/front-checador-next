import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Genera .next/standalone: un servidor Node mínimo para la imagen de Docker
  output: "standalone",
  productionBrowserSourceMaps: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
};

export default nextConfig;