import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  // Remove 'export' for dev; add back when deploying to a static host
};

export default nextConfig;
