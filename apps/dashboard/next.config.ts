import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Required for Cloudflare Pages
  output: "standalone",
  // Disable type checking during build (speeds up build)
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable ESLint during builds
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
