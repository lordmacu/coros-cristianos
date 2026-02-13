import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? "/coros-cristianos" : "",
  images: {
    unoptimized: true,
  },
  experimental: {
    // Limit concurrent static page generation to avoid ENFILE errors
    staticGenerationMaxConcurrency: 3,
  },
};

export default nextConfig;
