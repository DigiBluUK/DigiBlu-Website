import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Plain <img> throughout, as the old site; no image optimisation service.
  images: { unoptimized: true },
  // The content loaders read content/**/*.md from disk with fs, which file
  // tracing cannot see, so the markdown is declared for every route: without
  // it the Cloudflare Worker's server function had no content/ and any
  // on-demand render died with readdir ENOENT.
  outputFileTracingIncludes: { "/**": ["./content/**/*"] },
};

export default nextConfig;
