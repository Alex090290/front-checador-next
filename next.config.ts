import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
};

console.log(">>> CONFIG CARGADA:", nextConfig);

export default nextConfig;