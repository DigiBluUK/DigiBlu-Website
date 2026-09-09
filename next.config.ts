import type { NextConfig } from "next";

// Security headers on every route. Set here rather than in public/_headers,
// which Cloudflare applies to static assets only; the pages come from the
// Worker and take these.
//
// The Content Security Policy allows the site itself plus the two Google
// hosts the consent-gated analytics uses, and nothing else. Inline scripts
// are allowed ('unsafe-inline') because Next.js hydrates every page through
// inline scripts and the site keeps its own three (consent defaults, theme
// init, JSON-LD); the alternative, a per-request nonce, needs middleware
// and would make every page dynamic, which the static-by-default design
// rules out. 'unsafe-eval' is NOT allowed. Inline styles are allowed for
// the same reason (style attributes in the markup and the dialogs).
const GOOGLE_SCRIPT = "https://www.googletagmanager.com";
const GOOGLE_COLLECT = "https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com";
// React's development build evaluates code for its debugging tools and
// says so in the console under a CSP without it; production never does, so
// 'unsafe-eval' is granted to the dev server only.
const DEV_EVAL = process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : "";
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${DEV_EVAL} ${GOOGLE_SCRIPT}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: ${GOOGLE_COLLECT}`,
  "font-src 'self'",
  `connect-src 'self' ${GOOGLE_COLLECT}`,
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: CSP },
  // A year, subdomains included. Add "; preload" and submit to hstspreload.org
  // only once every subdomain is known to serve HTTPS; preload is hard to undo.
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

// Previews and UAT must not be indexed: set NEXT_PUBLIC_ROBOTS=noindex on
// every non-production environment and both robots.txt and this header say
// so. Production leaves it unset.
const NOINDEX = process.env.NEXT_PUBLIC_ROBOTS === "noindex";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Plain <img> throughout, as the old site; no image optimisation service.
  images: { unoptimized: true },
  // The content loaders read content/**/*.md from disk with fs, which file
  // tracing cannot see, so the markdown is declared for every route: without
  // it the Cloudflare Worker's server function had no content/ and any
  // on-demand render died with readdir ENOENT.
  outputFileTracingIncludes: { "/**": ["./content/**/*"] },
  async headers() {
    const headers = NOINDEX ? [...securityHeaders, { key: "X-Robots-Tag", value: "noindex, nofollow" }] : securityHeaders;
    return [{ source: "/(.*)", headers }];
  },
};

export default nextConfig;
