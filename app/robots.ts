import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "@/lib/site";

// Production allows everything and points at the sitemap. Any environment
// with NEXT_PUBLIC_ROBOTS=noindex (previews, UAT) disallows all, and
// next.config.ts adds the matching X-Robots-Tag header on every response.
export default function robots(): MetadataRoute.Robots {
  if (process.env.NEXT_PUBLIC_ROBOTS === "noindex") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return { rules: { userAgent: "*", allow: "/" }, sitemap: SITE_ORIGIN + "/sitemap.xml" };
}
