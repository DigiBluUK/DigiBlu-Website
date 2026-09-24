import data from "@/content/.generated/content.json";

// The authored content, from content/**/*.md by way of one JSON module that
// scripts/build-content.cjs writes before every build and test (pnpm
// content). A static import rather than fs reads on purpose: the loaders
// run wherever a page renders, and the Cloudflare Worker has no disk - an
// on-demand render there died with readdir ENOENT when this read the folder.

export type Section = { heading: string; html: string };
export type Stat = { v: string; l: string };
export type Quote = { text: string; cite: string };
export type CaseStudy = {
  key: string;
  client: string;
  sector: string;
  service: string;
  title: string;
  order: number;
  featured: number;
  photo: string;
  ogImage: string;
  stats: Stat[];
  quote: Quote | null;
  sections: Section[];
};
export type Service = { key: string; title: string; intro: string; order: number; sections: Section[] };
export type LegalDoc = { key: string; slug: string; title: string; url: string; intro: string; description: string; order: number; sections: Section[] };
export type TeamMember = { key: string; name: string; role: string; cls: string; photo: string; order: number; html: string };
export type Accreditation = { key: string; title: string; img: string; onDark: boolean; order: number; html: string };

type Content = {
  caseStudies: CaseStudy[];
  services: Service[];
  legalDocs: LegalDoc[];
  team: TeamMember[];
  accreditations: Accreditation[];
  /** Page path to ISO date: the sitemap's lastmod (scripts/build-content.cjs). */
  lastmod: Record<string, string>;
};

const content = data as Content;

export function getCaseStudies(): CaseStudy[] {
  return content.caseStudies;
}
export function getCaseStudy(key: string): CaseStudy | undefined {
  return content.caseStudies.find((c) => c.key === key);
}
/** The sitemap's lastmod for a page path, from build-content.cjs. */
export function getLastModified(pagePath: string): string | undefined {
  return content.lastmod[pagePath];
}
export function getServices(): Service[] {
  return content.services;
}
export function getLegalDocs(): LegalDoc[] {
  return content.legalDocs;
}
export function getLegalDoc(slug: string): LegalDoc | undefined {
  return content.legalDocs.find((d) => d.slug === slug);
}
export function getTeam(): TeamMember[] {
  return content.team;
}
export function getAccreditations(): Accreditation[] {
  return content.accreditations;
}
