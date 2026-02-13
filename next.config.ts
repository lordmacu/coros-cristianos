import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  experimental: {
    // Limit concurrent static page generation to avoid ENFILE errors
    staticGenerationMaxConcurrency: 3,
  },
};

export default nextConfig;
