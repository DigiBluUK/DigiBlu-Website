import type { MetadataRoute } from "next";
import { getCaseStudies, getLegalDocs } from "@/lib/content";
import { SITE_ORIGIN } from "@/lib/site";

// The home page, the four listing pages (services, case studies, team,
// accreditations) and the contact page (all 11 Sep 2026), every case study
// and every legal document: twenty-one URLs.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_ORIGIN + "/", changeFrequency: "monthly", priority: 1 },
    { url: SITE_ORIGIN + "/services", changeFrequency: "monthly", priority: 0.8 },
    { url: SITE_ORIGIN + "/case-studies", changeFrequency: "monthly", priority: 0.8 },
    { url: SITE_ORIGIN + "/team", changeFrequency: "monthly", priority: 0.6 },
    { url: SITE_ORIGIN + "/accreditations", changeFrequency: "yearly", priority: 0.5 },
    { url: SITE_ORIGIN + "/contact", changeFrequency: "yearly", priority: 0.7 },
    ...getCaseStudies().map((c) => ({ url: `${SITE_ORIGIN}/case-studies/${c.key}`, changeFrequency: "yearly" as const, priority: 0.7 })),
    ...getLegalDocs().map((d) => ({ url: `${SITE_ORIGIN}/legal/${d.slug}`, changeFrequency: "yearly" as const, priority: 0.3 })),
  ];
}
