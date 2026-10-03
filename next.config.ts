import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: true,
  serverActions: {
    bodySizeLimit: '100mb',
  },
};

export default nextConfig;