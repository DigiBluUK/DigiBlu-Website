import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Plain <img> throughout, as the old site; no image optimisation service.
  images: { unoptimized: true },
};

export default nextConfig;
