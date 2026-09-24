import type { MetadataRoute } from "next";
import { getCaseStudies, getLastModified, getLegalDocs } from "@/lib/content";
import { SITE_ORIGIN } from "@/lib/site";

// The home page, the four listing pages (services, case studies, team,
// accreditations), the contact page, every case study and every legal
// document (21 URLs on 24 Sep 2026). Each carries a lastmod from the git
// history of the files it is made from (scripts/build-content.cjs).
export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [
    { url: SITE_ORIGIN + "/", changeFrequency: "monthly", priority: 1 },
    { url: SITE_ORIGIN + "/services", changeFrequency: "monthly", priority: 0.8 },
    { url: SITE_ORIGIN + "/case-studies", changeFrequency: "monthly", priority: 0.8 },
    { url: SITE_ORIGIN + "/team", changeFrequency: "monthly", priority: 0.6 },
    { url: SITE_ORIGIN + "/accreditations", changeFrequency: "yearly", priority: 0.5 },
    { url: SITE_ORIGIN + "/contact", changeFrequency: "yearly", priority: 0.7 },
    ...getCaseStudies().map((c) => ({ url: `${SITE_ORIGIN}/case-studies/${c.key}`, changeFrequency: "yearly" as const, priority: 0.7 })),
    ...getLegalDocs().map((d) => ({ url: `${SITE_ORIGIN}/legal/${d.slug}`, changeFrequency: "yearly" as const, priority: 0.3 })),
  ];
  return entries.map((e) => ({ ...e, lastModified: getLastModified(e.url.slice(SITE_ORIGIN.length) || "/") }));
}
