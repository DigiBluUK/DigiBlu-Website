import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

// Content lives in content/<type>/<file>.md. Read synchronously at build
// time by server components; nothing here runs in the browser.
const ROOT = path.join(process.cwd(), "content");

// breaks: true so a single newline is a <br> - the legal points carry
// numbered sub-clauses joined that way, and the old page showed them with
// white-space: pre-line. Paragraphs are still blank-line separated.
// GFM autolinks are off: the legal text names privacy@digiblu.com as plain
// text and the old page showed it that way; a mailto link would be a change.
marked.use({ breaks: true, gfm: true, tokenizer: { url: () => undefined } });

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
export type LegalDoc = { key: string; slug: string; title: string; url: string; intro: string; order: number; sections: Section[] };
export type TeamMember = { name: string; role: string; cls: string; photo: string; order: number; html: string };
export type Accreditation = { key: string; title: string; img: string; onDark: boolean; order: number; html: string };

function render(md: string): string {
  return (marked.parse(md.trim()) as string).trim();
}

// Splits a body on "## " headings into sections; text before the first
// heading, or a body with no headings, comes back as html.
function parseBody(body: string): { sections: Section[]; html: string } {
  const parts = body.split(/^## (.+)$/m);
  const html = render(parts[0]);
  const sections: Section[] = [];
  for (let i = 1; i < parts.length; i += 2) sections.push({ heading: parts[i].trim(), html: render(parts[i + 1] || "") });
  return { sections, html };
}

type Body = ReturnType<typeof parseBody>;

function load<T extends { order: number }>(type: string, map: (data: Record<string, unknown>, body: Body) => T): T[] {
  const dir = path.join(ROOT, type);
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const { data, content } = matter(fs.readFileSync(path.join(dir, f), "utf8"));
      return map(data, parseBody(content));
    })
    .sort((a, b) => a.order - b.order);
}

export function getCaseStudies(): CaseStudy[] {
  return load("case-studies", (d, b) => ({ ...(d as Omit<CaseStudy, "sections">), sections: b.sections }));
}
export function getCaseStudy(key: string): CaseStudy | undefined {
  return getCaseStudies().find((c) => c.key === key);
}
export function getFeaturedCaseStudies(): CaseStudy[] {
  return getCaseStudies()
    .filter((c) => c.featured > 0)
    .sort((a, b) => a.featured - b.featured);
}
export function getServices(): Service[] {
  return load("services", (d, b) => ({ ...(d as Omit<Service, "sections">), sections: b.sections }));
}
export function getLegalDocs(): LegalDoc[] {
  return load("legal", (d, b) => ({ ...(d as Omit<LegalDoc, "sections">), sections: b.sections }));
}
export function getLegalDoc(slug: string): LegalDoc | undefined {
  return getLegalDocs().find((d) => d.slug === slug);
}
export function getTeam(): TeamMember[] {
  return load("team", (d, b) => ({ ...(d as Omit<TeamMember, "html">), html: b.html }));
}
export function getAccreditations(): Accreditation[] {
  return load("accreditations", (d, b) => ({ ...(d as Omit<Accreditation, "html">), html: b.html }));
}
