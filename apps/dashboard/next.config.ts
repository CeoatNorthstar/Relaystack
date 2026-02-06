import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable Turbopack for production builds (fixes Cloudflare Pages monorepo issue)
  experimental: {
    turbo: {
      root: ".",
    },
  },
  // Required for Cloudflare Pages
  output: "standalone",
};

export default nextConfig;
