import type { MetadataRoute } from "next";
import { getCaseStudies, getLegalDocs } from "@/lib/content";
import { SITE_ORIGIN } from "@/lib/site";

// The home page plus every case study and legal document: fourteen URLs,
// the same set generate-static-pages.js wrote to sitemap.xml.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_ORIGIN + "/", changeFrequency: "monthly", priority: 1 },
    ...getCaseStudies().map((c) => ({ url: `${SITE_ORIGIN}/case-studies/${c.key}`, changeFrequency: "yearly" as const, priority: 0.7 })),
    ...getLegalDocs().map((d) => ({ url: `${SITE_ORIGIN}/legal/${d.slug}`, changeFrequency: "yearly" as const, priority: 0.3 })),
  ];
}
