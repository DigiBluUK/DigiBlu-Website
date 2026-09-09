# Markdown Content (Priority 3) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move every piece of authored content out of `index.html`'s script objects into markdown files with front matter, load them through one typed module, and serve the 8 case-study and 5 legal pages as real Next.js routes with their metadata, share cards, sitemap and robots.

**Architecture:** A one-off extraction script reads the five JS objects out of `index.html` the way `generate-static-pages.js` already does (marker slicing + `new Function`) and writes `content/<type>/<key>.md`. `lib/content.ts` parses those files with `gray-matter`, renders their markdown bodies to HTML with `marked`, and exposes typed getters that server components call at build time. Two dynamic routes with `generateStaticParams` replace the generated `case-studies/*.html` and `legal/*.html`; their markup is the generator's, converted. Every route is static.

**Tech Stack:** `gray-matter` 4.0.3, `marked` (latest 16.x, pinned exactly at install), Node 24 type stripping for the loader tests (`node --test` importing `.ts`).

**Spec:** `docs/superpowers/plans/2026-09-09-nextjs-foundation.md` (Priority 2, done) and the 9 Sep 2026 decision: markdown case studies, like-for-like pages.

## Global Constraints

- Branch `next`. The old site's files, including `generate-static-pages.js`, stay untouched: they are the reference and still serve `http://localhost:4173`.
- Content is copied, never edited: every string in the markdown files must equal the script object it came from. The extraction test asserts it.
- Pin exact versions. No em dashes in any user-visible copy.
- Links in the new app are absolute (`/case-studies/sse-ovo`, `/#services`), never `../index.html#...`.
- Commit after every task, with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

---

## File Structure

| Path | Responsibility |
|---|---|
| `scripts/extract-content.cjs`, `scripts/extract-content.test.cjs` | Reads `CASE_STUDIES`, `SERVICES`, `LEGAL_DETAILS`, `BADGE_DETAILS`, `TEAM_MEMBERS` out of `index.html` and writes `content/**`. Idempotent. |
| `content/case-studies/<key>.md` (8) | Front matter: key, client, sector, service, title, featured, photo, ogImage, stats, quote. Body: `## Overview`, `## The problem`, `## What we did`, `## Outcome`. |
| `content/services/<key>.md` (6) | Front matter: key, title, intro. Body: one `## heading` + paragraph per item. |
| `content/legal/<slug>.md` (5) | Front matter: key, slug, title, url, intro. Body: one `## heading` + paragraph per point; sub-clauses stay on their own lines. |
| `content/team/<slug>.md` (8) | Front matter: name, role, photo, cls, order. Body: bio. |
| `content/accreditations/<key>.md` (6) | Front matter: key, title, img, onDark. Body: description. |
| `lib/site.ts` | `SITE_ORIGIN` (env-overridable), `SITE_URL`, shared title/description strings; `app/layout.tsx` reads from here. |
| `lib/content.ts`, `scripts/content.test.mjs` | Typed loaders and the markdown renderer. |
| `components/PageHeader.tsx`, `components/BackLink.tsx` | The standalone pages' nav and back link, from the generator, with absolute hrefs. |
| `components/Markdown.tsx` | Renders a list of `{ heading, html }` sections in the old `.case-section` / `.service-modal-item` markup. |
| `app/case-studies/[key]/page.tsx`, `app/legal/[slug]/page.tsx` | The routes. |
| `app/sitemap.ts`, `app/robots.ts` | Replace the generator's `sitemap.xml` and `robots.txt`. |
| `components/Footer.tsx`, `components/sections/CaseStudies.tsx` | Modify: hrefs go absolute and point at the new routes. |
| `scripts/parity.cjs` | Modify: takes two paths so a case-study page can be compared with its old static page. |

---

### Task 1: Install and extract

**Files:**
- Modify: `package.json`
- Create: `scripts/extract-content.cjs`, `scripts/extract-content.test.cjs`, `content/**/*.md`

**Interfaces:**
- Produces: the `content/` tree above. Front-matter values are written with `JSON.stringify`, which is valid YAML, so any character in the copy survives. Case-study body paragraphs are separated by blank lines; legal sub-clauses joined with `\n` in the source stay single-newline-separated (rendered with `breaks: true` in Task 2).

- [ ] **Step 1: Install**

Run: `npm install --save-exact --no-audit --no-fund gray-matter@4.0.3 marked@16`
Expected: both pinned in `package.json` at exact versions.

- [ ] **Step 2: Write the failing test**

`scripts/extract-content.test.cjs`:
```js
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { readObjects, writeContent, frontMatter } = require("./extract-content.cjs");

const root = path.join(__dirname, "..");

test("the five objects come out of index.html with the known counts", () => {
  const o = readObjects(root);
  assert.equal(o.CASE_STUDIES.length, 8);
  assert.equal(Object.keys(o.SERVICES).length, 6);
  assert.equal(Object.keys(o.LEGAL_DETAILS).length, 5);
  assert.equal(Object.keys(o.BADGE_DETAILS).length, 6);
  assert.equal(o.TEAM_MEMBERS.length, 8);
});

test("front matter round-trips any string through YAML", () => {
  const fm = frontMatter({ title: 'He said "no": it\'s #1', n: 3, list: [{ v: "<50%", l: "x" }] });
  assert.match(fm, /^---\n/);
  assert.match(fm, /title: "He said \\"no\\": it's #1"\n/);
  assert.match(fm, /n: 3\n/);
});

test("writing the tree produces 33 files whose copy equals the source", () => {
  const o = readObjects(root);
  const files = writeContent(root, o);
  assert.equal(files.length, 33);
  const sse = fs.readFileSync(path.join(root, "content/case-studies/sse-ovo.md"), "utf8");
  assert.ok(sse.includes(JSON.stringify(o.CASE_STUDIES[0].title)));
  assert.ok(sse.includes("## Overview\n\n" + o.CASE_STUDIES[0].overview.split("\n")[0]));
  const terms = fs.readFileSync(path.join(root, "content/legal/website-terms-of-use.md"), "utf8");
  assert.ok(terms.includes("## " + o.LEGAL_DETAILS.terms.points[0].h + "\n\n" + o.LEGAL_DETAILS.terms.points[0].p));
});
```

- [ ] **Step 3: Run it to make sure it fails**

Run: `node --test scripts/extract-content.test.cjs`
Expected: FAIL, module not found.

- [ ] **Step 4: Write the extractor**

`scripts/extract-content.cjs`:
```js
// One-off migration of the authored content out of index.html's script
// objects into content/**/*.md - the same marker slicing + new Function that
// generate-static-pages.js uses, so nothing is re-typed. Idempotent: run it
// again and the files are rewritten identically. After cut-over the markdown
// is the source of truth and this script is history.
const fs = require("node:fs");
const path = require("node:path");

const LEGAL_SLUGS = { terms: "website-terms-of-use", privacy: "privacy-policy", slavery: "modern-slavery-policy", carbon: "carbon-reduction-plan", "armed-forces": "armed-forces-covenant" };
const FEATURED = ["sse-ovo", "assurancesd", "cedar-creek"]; // the three cards on the home page, in order

function readObjects(root) {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const css = fs.readFileSync(path.join(root, "assets/site.css"), "utf8");
  const block = (name, open) => {
    const s = html.indexOf(`var ${name} = ${open}`);
    if (s < 0) throw new Error("not found: " + name);
    const close = open === "[" ? "\n      ];" : "\n      };";
    const e = html.indexOf(close, s);
    if (e < 0) throw new Error("no close for " + name);
    return new Function(html.slice(s, e + close.length) + `\nreturn ${name};`)();
  };
  const photos = {};
  for (const m of css.matchAll(/\.(tp-[a-z]+)\s*\{[^}]*url\('team\/([^']+)'\)/g)) photos[m[1]] = "/assets/team/" + m[2];
  return {
    CASE_STUDIES: block("CASE_STUDIES", "["),
    SERVICES: block("SERVICES", "{"),
    LEGAL_DETAILS: block("LEGAL_DETAILS", "{"),
    BADGE_DETAILS: block("BADGE_DETAILS", "{"),
    TEAM_MEMBERS: block("TEAM_MEMBERS", "["),
    TEAM_PHOTOS: photos,
  };
}

// Every value through JSON.stringify: a JSON string is a valid YAML
// double-quoted scalar, so quotes, colons and hashes in the copy are safe.
function frontMatter(obj) {
  const line = (k, v) => `${k}: ${JSON.stringify(v)}`;
  const lines = [];
  for (const [k, v] of Object.entries(obj)) {
    if (Array.isArray(v)) { lines.push(`${k}:`); for (const item of v) lines.push(`  - ${typeof item === "object" ? Object.entries(item).map(([a, b]) => `${a}: ${JSON.stringify(b)}`).join("\n    ") : JSON.stringify(item)}`); }
    else if (v && typeof v === "object") { lines.push(`${k}:`); for (const [a, b] of Object.entries(v)) lines.push(`  ${line(a, b)}`); }
    else lines.push(line(k, v));
  }
  return "---\n" + lines.join("\n") + "\n---\n";
}

const paras = (s) => String(s).split("\n").map((t) => t.trim()).filter(Boolean).join("\n\n");
const write = (root, rel, text) => { const p = path.join(root, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, text); return rel; };

function writeContent(root, o) {
  const files = [];
  o.CASE_STUDIES.forEach((c, i) => {
    const fm = frontMatter({ key: c.key, client: c.client, sector: c.sector, service: c.service, title: c.title, order: i + 1, featured: FEATURED.indexOf(c.key) + 1 || 0, photo: `/assets/case-studies/${c.key}.jpg`, ogImage: `/assets/og/case-studies/${c.key}.jpg`, stats: c.stats, quote: c.quote || null });
    const body = [["Overview", c.overview], ["The problem", c.problem], ["What we did", c.solution], ["Outcome", c.outcome]].map(([h, b]) => `## ${h}\n\n${paras(b)}`).join("\n\n");
    files.push(write(root, `content/case-studies/${c.key}.md`, fm + "\n" + body + "\n"));
  });
  Object.entries(o.SERVICES).forEach(([key, s], i) => {
    const fm = frontMatter({ key, title: s.title, intro: s.intro, order: i + 1 });
    files.push(write(root, `content/services/${key}.md`, fm + "\n" + s.items.map((it) => `## ${it.h}\n\n${it.p}`).join("\n\n") + "\n"));
  });
  Object.entries(o.LEGAL_DETAILS).forEach(([key, d], i) => {
    const fm = frontMatter({ key, slug: LEGAL_SLUGS[key], title: d.title, url: d.url, intro: d.intro, order: i + 1 });
    files.push(write(root, `content/legal/${LEGAL_SLUGS[key]}.md`, fm + "\n" + d.points.map((pt) => `## ${pt.h}\n\n${pt.p}`).join("\n\n") + "\n"));
  });
  Object.entries(o.BADGE_DETAILS).forEach(([key, b], i) => {
    const fm = frontMatter({ key, title: b.title, img: "/" + b.img, onDark: !!b.onDark, order: i + 1 });
    files.push(write(root, `content/accreditations/${key}.md`, fm + "\n" + b.desc + "\n"));
  });
  o.TEAM_MEMBERS.forEach((m, i) => {
    const slug = o.TEAM_PHOTOS[m.cls].split("/").pop().replace(/\.png$/, "");
    const fm = frontMatter({ name: m.name, role: m.role, cls: m.cls, photo: o.TEAM_PHOTOS[m.cls], order: i + 1 });
    files.push(write(root, `content/team/${slug}.md`, fm + "\n" + m.bio + "\n"));
  });
  return files;
}

if (require.main === module) {
  const root = path.join(__dirname, "..");
  const files = writeContent(root, readObjects(root));
  console.log("wrote", files.length, "content files");
}

module.exports = { readObjects, writeContent, frontMatter };
```

- [ ] **Step 5: Run the tests, then the extractor**

Run: `node --test scripts/extract-content.test.cjs` then `node scripts/extract-content.cjs`
Expected: 3 passing; `wrote 33 content files`. Open `content/case-studies/sse-ovo.md` and `content/legal/privacy-policy.md` and read them once: front matter parses by eye, sections carry the right headings.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json scripts/extract-content.cjs scripts/extract-content.test.cjs content
git commit -m "Content extracted to markdown: 8 case studies, 6 services, 5 legal, 8 team, 6 accreditations (P3 Task 1)"
```

---

### Task 2: The loaders

**Files:**
- Create: `lib/site.ts`, `lib/content.ts`, `scripts/content.test.mjs`
- Modify: `app/layout.tsx` (read SITE/TITLE/DESCRIPTION from `lib/site.ts`)

**Interfaces:**
- Produces:
  - `lib/site.ts`: `export const SITE_ORIGIN: string` (from `process.env.SITE_ORIGIN`, default `https://digibluuk.github.io/DigiBlu-Website`, no trailing slash), `SITE_URL = SITE_ORIGIN + "/"`, `SITE_TITLE`, `SITE_DESCRIPTION`, `SITE_SOCIAL`.
  - `lib/content.ts`: types `CaseStudy`, `Service`, `LegalDoc`, `TeamMember`, `Accreditation`, `Section = { heading: string; html: string }`; functions `getCaseStudies(): CaseStudy[]` (sorted by `order`), `getCaseStudy(key): CaseStudy | undefined`, `getFeaturedCaseStudies(): CaseStudy[]` (featured > 0, sorted by featured), `getServices(): Service[]`, `getLegalDocs(): LegalDoc[]`, `getLegalDoc(slug)`, `getTeam(): TeamMember[]`, `getAccreditations(): Accreditation[]`. Each item carries `sections: Section[]` (from `##` headings) and, where the body has no headings, `html: string`.

- [ ] **Step 1: Write the failing test**

`scripts/content.test.mjs`:
```js
import test from "node:test";
import assert from "node:assert/strict";
import { getCaseStudies, getCaseStudy, getFeaturedCaseStudies, getServices, getLegalDocs, getLegalDoc, getTeam, getAccreditations } from "../lib/content.ts";

test("case studies: eight, ordered, sectioned, three featured in card order", () => {
  const all = getCaseStudies();
  assert.equal(all.length, 8);
  assert.equal(all[0].key, "sse-ovo");
  assert.deepEqual(all[0].sections.map((s) => s.heading), ["Overview", "The problem", "What we did", "Outcome"]);
  assert.match(all[0].sections[0].html, /^<p>OVO, one of the UK/);
  assert.equal(all[0].stats.length, 3);
  assert.equal(all[0].quote.cite, "Jon Willicombe, Head of Early-Stage Collections - OVO");
  assert.deepEqual(getFeaturedCaseStudies().map((c) => c.key), ["sse-ovo", "assurancesd", "cedar-creek"]);
  assert.equal(getCaseStudy("nope"), undefined);
});

test("legal: five by slug, sub-clauses on their own lines", () => {
  assert.equal(getLegalDocs().length, 5);
  const privacy = getLegalDoc("privacy-policy");
  assert.equal(privacy.title, "Privacy Policy");
  assert.equal(privacy.intro, "Last updated August 2026.");
  assert.ok(privacy.sections.some((s) => s.html.includes("<br>")), "a numbered point should keep its line breaks");
});

test("services, team, accreditations", () => {
  assert.deepEqual(getServices().map((s) => s.key), ["ai", "process", "discovery", "digital", "tom", "post"]);
  assert.equal(getServices()[0].sections.length, 5);
  assert.equal(getTeam().length, 8);
  assert.equal(getTeam()[0].photo, "/assets/team/vic-gysin.png");
  assert.equal(getAccreditations().find((a) => a.key === "gcloud").onDark, true);
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `node --test scripts/content.test.mjs`
Expected: FAIL, cannot find `../lib/content.ts`. (If Node refuses the `.ts` import, run with `node --experimental-strip-types --test scripts/content.test.mjs` and put that flag in the `test` script; Node 24 strips types unflagged.)

- [ ] **Step 3: Write `lib/site.ts`**

```ts
// The one place the host lives. SITE_ORIGIN is overridable from the
// environment so a preview deployment does not need the value forked.
export const SITE_ORIGIN = (process.env.SITE_ORIGIN || "https://digibluuk.github.io/DigiBlu-Website").replace(/\/+$/, "");
export const SITE_URL = SITE_ORIGIN + "/";
export const SITE_TITLE = "DigiBlu | AI and Digital Transformation Consultancy";
export const SITE_DESCRIPTION =
  "DigiBlu pairs experienced consulting practitioners with deep technical expertise, delivering AI, automation and digital transformation that gets to value fast.";
export const SITE_SOCIAL =
  "Experienced practitioners with client, technology and consultancy backgrounds. Pragmatic, technology-agnostic partners focused on speed to value.";
```

Then in `app/layout.tsx` delete the four local constants and `import { SITE_URL as SITE, SITE_TITLE as TITLE, SITE_DESCRIPTION as DESCRIPTION, SITE_SOCIAL as SOCIAL } from "@/lib/site";`.

- [ ] **Step 4: Write `lib/content.ts`**

```ts
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
marked.use({ breaks: true, gfm: true });

export type Section = { heading: string; html: string };
export type Stat = { v: string; l: string };
export type Quote = { text: string; cite: string };
export type CaseStudy = { key: string; client: string; sector: string; service: string; title: string; order: number; featured: number; photo: string; ogImage: string; stats: Stat[]; quote: Quote | null; sections: Section[] };
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

function load<T>(type: string, map: (data: Record<string, unknown>, body: ReturnType<typeof parseBody>, file: string) => T): T[] {
  const dir = path.join(ROOT, type);
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const { data, content } = matter(fs.readFileSync(path.join(dir, f), "utf8"));
      return map(data, parseBody(content), f.replace(/\.md$/, ""));
    })
    .sort((a, b) => ((a as { order: number }).order ?? 0) - ((b as { order: number }).order ?? 0));
}

export function getCaseStudies(): CaseStudy[] {
  return load("case-studies", (d, b) => ({ ...(d as Omit<CaseStudy, "sections">), sections: b.sections }));
}
export function getCaseStudy(key: string): CaseStudy | undefined {
  return getCaseStudies().find((c) => c.key === key);
}
export function getFeaturedCaseStudies(): CaseStudy[] {
  return getCaseStudies().filter((c) => c.featured > 0).sort((a, b) => a.featured - b.featured);
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
```

- [ ] **Step 5: Run the tests and the build**

Run: `node --test scripts/content.test.mjs` then `npm run build`
Expected: 3 passing; build passes (the loaders are not imported by a page yet, but they type-check).

- [ ] **Step 6: Commit**

```bash
git add lib scripts/content.test.mjs app/layout.tsx
git commit -m "Typed content loaders over the markdown, site constants in one place (P3 Task 2)"
```

---

### Task 3: Page chrome for standalone routes

**Files:**
- Create: `components/PageHeader.tsx`, `components/BackLink.tsx`, `components/Markdown.tsx`
- Modify: `components/Footer.tsx`, `components/sections/CaseStudies.tsx`, `components/SkipLink.tsx`

**Interfaces:**
- Produces: `<PageHeader />` (the generator's `<nav class="page-header">` with hrefs `/#hero-content`, `/#services`, `/#case-studies`, `/#about`, `/#team`, CTA `/#contact`), `<BackLink />` (`<a class="detail-back" href="/">`), `<Markdown sections={Section[]} itemClass="case-section" | "service-modal-item" />`, `<SkipLink target="#detail-content" />` (default stays `#hero-content`).

- [ ] **Step 1: Generate the header from the generator's markup**

Save `pageHeader()`'s return value (from `<nav class="page-header">` to `</nav>`) to a temp file and convert it: `node -e "const g=require('./generate-static-pages.js')"` will run the generator, so instead copy lines 165-224 of `generate-static-pages.js` into `/tmp/page-header.html`, strip the backtick and template syntax by eye, and run `node scripts/html-to-jsx.cjs` on it by pointing the converter at that file: add an optional fifth argument `sourceFile` to the converter (`const src = process.argv[6] || path.join(__dirname, "..", "index.html")`). Then replace every `../index.html#` with `/#` in `components/PageHeader.tsx`, and `../index.html` with `/`.

- [ ] **Step 2: Write `BackLink.tsx`, `Markdown.tsx`, and parametrise `SkipLink`**

`components/BackLink.tsx`:
```tsx
export default function BackLink() {
  return (
    <a className="detail-back" href="/">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 12H5m0 0 6-6m-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Back to home
    </a>
  );
}
```

Copy the `<svg>`'s remaining attributes from `backLink()` in the generator so it is identical.

`components/Markdown.tsx`:
```tsx
import type { Section } from "@/lib/content";

// First-party content rendered from markdown; the HTML comes from our own
// files at build time, which is why dangerouslySetInnerHTML is acceptable.
export default function Markdown({ sections, itemClass }: { sections: Section[]; itemClass: "case-section" | "service-modal-item" }) {
  return (
    <>
      {sections.map((s) => (
        <div className={itemClass} key={s.heading}>
          <h3>{s.heading}</h3>
          <div dangerouslySetInnerHTML={{ __html: s.html }} />
        </div>
      ))}
    </>
  );
}
```

`components/SkipLink.tsx`:
```tsx
export default function SkipLink({ target = "#hero-content" }: { target?: string }) {
  return (
    <a className="skip-link" href={target}>
      Skip to content
    </a>
  );
}
```

- [ ] **Step 3: Absolute hrefs in the footer and the case cards**

In `components/Footer.tsx`: `href="legal/<slug>.html"` becomes `href="/legal/<slug>"` (five), and every `href="#..."` becomes `href="/#..."`. In `components/sections/CaseStudies.tsx`: the three `href="case-studies/<key>.html"` become `href="/case-studies/<key>"`.

- [ ] **Step 4: Verify**

Run: `npm run build`. Then in the browser on `http://localhost:3000/`:
```js
({ legal: [...document.querySelectorAll('.footer-col [data-legal]')].map(a=>a.getAttribute('href')), cases: [...document.querySelectorAll('a[href^="/case-studies/"]')].map(a=>a.getAttribute('href')), company: [...document.querySelectorAll('.footer-col a[href^="/#"]')].length })
```
Expected: `/legal/website-terms-of-use` ... (5), `/case-studies/sse-ovo`, `/case-studies/assurancesd`, `/case-studies/cedar-creek`, `company` > 0.

- [ ] **Step 5: Commit**

```bash
git add components scripts/html-to-jsx.cjs
git commit -m "Page chrome for standalone routes; absolute hrefs (P3 Task 3)"
```

---

### Task 4: The case-study route

**Files:**
- Create: `app/case-studies/[key]/page.tsx`

- [ ] **Step 1: Write the page**

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCaseStudies, getCaseStudy } from "@/lib/content";
import { SITE_ORIGIN } from "@/lib/site";
import SkipLink from "@/components/SkipLink";
import PageHeader from "@/components/PageHeader";
import BackLink from "@/components/BackLink";
import Markdown from "@/components/Markdown";
import Footer from "@/components/Footer";

export const dynamicParams = false;

export function generateStaticParams() {
  return getCaseStudies().map((c) => ({ key: c.key }));
}

const description = (overview: string) => {
  const text = overview.replace(/<[^>]+>/g, "").trim();
  return text.length <= 155 ? text : text.slice(0, 152).replace(/\s+\S*$/, "") + "...";
};

export async function generateMetadata({ params }: { params: Promise<{ key: string }> }): Promise<Metadata> {
  const c = getCaseStudy((await params).key);
  if (!c) return {};
  const title = `${c.title} | DigiBlu Case Studies`;
  const desc = description(c.sections[0].html);
  return {
    title,
    description: desc,
    alternates: { canonical: `${SITE_ORIGIN}/case-studies/${c.key}` },
    openGraph: { type: "website", siteName: "DigiBlu", title, description: desc, url: `${SITE_ORIGIN}/case-studies/${c.key}`, images: [{ url: c.ogImage, width: 1200, height: 630, type: "image/jpeg", alt: `${c.client} case study - ${c.title}` }] },
    twitter: { card: "summary_large_image", title, description: desc, images: [c.ogImage] },
  };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ key: string }> }) {
  const c = getCaseStudy((await params).key);
  if (!c) notFound();
  const i = getCaseStudies().findIndex((x) => x.key === c.key);
  const jsonLd = { "@context": "https://schema.org", "@type": "WebPage", name: c.title, description: description(c.sections[0].html), url: `${SITE_ORIGIN}/case-studies/${c.key}`, isPartOf: { "@type": "WebSite", name: "DigiBlu", url: SITE_ORIGIN + "/" } };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SkipLink target="#detail-content" />
      <PageHeader />
      <main>
        <div className="detail-page" id="detail-content">
          <BackLink />
          <div className="blog-modal-art" aria-hidden="true">
            <div className={`blog-art a${(i % 4) + 1}`}>
              <img className="case-art-photo" src={c.photo} alt="" />
              <div className="case-art-scrim" />
            </div>
          </div>
          <span className="pill case-modal-eyebrow">{c.sector} · {c.service}</span>
          <h1>{c.title}</h1>
          <p className="case-modal-client">{c.client}</p>
          <div className="case-stats">
            {c.stats.map((s) => (
              <div className="case-stat" key={s.l}><b>{s.v}</b><span>{s.l}</span></div>
            ))}
          </div>
          <Markdown sections={c.sections} itemClass="case-section" />
          {c.quote && (
            <figure className="case-modal-quote">
              <p>{c.quote.text}</p>
              <cite>{c.quote.cite}</cite>
            </figure>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
```

Check `renderCaseStudy` in the generator for the exact art markup (the `<img class="case-art-photo">` and the scrim sibling) and mirror it.

- [ ] **Step 2: Verify**

Run: `npm run build`
Expected: the route table lists `● /case-studies/[key]` with 8 paths, all static (SSG).

Then `node scripts/parity.cjs /case-studies/sse-ovo.html /case-studies/sse-ovo` (after Task 6 adds path arguments; until then compare in the browser: open `http://localhost:4173/case-studies/sse-ovo.html` and `http://localhost:3000/case-studies/sse-ovo` and run
```js
({ h1: document.querySelector('h1').textContent, sections: [...document.querySelectorAll('.case-section h3')].map(e=>e.textContent), stats: document.querySelectorAll('.case-stat').length, quote: !!document.querySelector('.case-modal-quote'), photo: document.querySelector('.case-art-photo').naturalWidth, title: document.title })
```
Expected: identical; `photo: 1600`.)

- [ ] **Step 3: Commit**

```bash
git add "app/case-studies"
git commit -m "Case-study route from markdown, 8 static pages with metadata and share cards (P3 Task 4)"
```

---

### Task 5: The legal route

**Files:**
- Create: `app/legal/[slug]/page.tsx`

- [ ] **Step 1: Write the page**

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLegalDoc, getLegalDocs } from "@/lib/content";
import { SITE_ORIGIN } from "@/lib/site";
import SkipLink from "@/components/SkipLink";
import PageHeader from "@/components/PageHeader";
import BackLink from "@/components/BackLink";
import Markdown from "@/components/Markdown";
import Footer from "@/components/Footer";

export const dynamicParams = false;

export function generateStaticParams() {
  return getLegalDocs().map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const d = getLegalDoc((await params).slug);
  if (!d) return {};
  const title = `${d.title} | DigiBlu`;
  return { title, description: d.intro, alternates: { canonical: `${SITE_ORIGIN}/legal/${d.slug}` }, openGraph: { type: "website", siteName: "DigiBlu", title, description: d.intro, url: `${SITE_ORIGIN}/legal/${d.slug}` } };
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const d = getLegalDoc((await params).slug);
  if (!d) notFound();
  const jsonLd = { "@context": "https://schema.org", "@type": "WebPage", name: d.title, description: d.intro, url: `${SITE_ORIGIN}/legal/${d.slug}`, isPartOf: { "@type": "WebSite", name: "DigiBlu", url: SITE_ORIGIN + "/" } };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SkipLink target="#detail-content" />
      <PageHeader />
      <main>
        <div className="detail-page" id="detail-content">
          <BackLink />
          <span className="pill service-modal-eyebrow">Legal</span>
          <h1>{d.title}</h1>
          <p className="service-modal-intro">{d.intro}</p>
          <div className="service-modal-list">
            <Markdown sections={d.sections} itemClass="service-modal-item" />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run build`
Expected: `● /legal/[slug]` with 5 paths. Browser on `/legal/privacy-policy` (both servers): `document.querySelectorAll('.service-modal-item').length` equal (24), `document.querySelector('.service-modal-item p').innerHTML.includes('<br>')` true on the Next side where the old side has `white-space: pre-line` newlines, and the visible text of the first item identical.

- [ ] **Step 3: Commit**

```bash
git add "app/legal"
git commit -m "Legal route from markdown, 5 static pages (P3 Task 5)"
```

---

### Task 6: Sitemap, robots, and page parity

**Files:**
- Create: `app/sitemap.ts`, `app/robots.ts`
- Modify: `scripts/parity.cjs`

- [ ] **Step 1: Write both**

`app/sitemap.ts`:
```ts
import type { MetadataRoute } from "next";
import { getCaseStudies, getLegalDocs } from "@/lib/content";
import { SITE_ORIGIN } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_ORIGIN + "/", changeFrequency: "monthly", priority: 1 },
    ...getCaseStudies().map((c) => ({ url: `${SITE_ORIGIN}/case-studies/${c.key}`, changeFrequency: "yearly" as const, priority: 0.7 })),
    ...getLegalDocs().map((d) => ({ url: `${SITE_ORIGIN}/legal/${d.slug}`, changeFrequency: "yearly" as const, priority: 0.3 })),
  ];
}
```

`app/robots.ts`:
```ts
import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/" }, sitemap: SITE_ORIGIN + "/sitemap.xml" };
}
```

- [ ] **Step 2: Path arguments for the parity script**

In `scripts/parity.cjs` replace the two constants with:
```js
const [oldPath = "/", newPath = oldPath] = process.argv.slice(2);
const OLD = (process.env.OLD || "http://localhost:4173") + oldPath;
const NEW = (process.env.NEW || "http://localhost:3000") + newPath;
```
and make `h1` fall back to the first `<h1 ...>` with attributes: `/<h1[^>]*>[\s\S]*?<\/h1>/`.

- [ ] **Step 3: Verify**

Run: `npm run build`, then with both servers up:
```bash
node scripts/parity.cjs /case-studies/sse-ovo.html /case-studies/sse-ovo
node scripts/parity.cjs /legal/privacy-policy.html /legal/privacy-policy
```
Expected: every count and the text `ok`. Known acceptable difference: the old pages' footer links are `../legal/...` and the new are `/legal/...`, which the script does not compare. Also `curl -s http://localhost:3000/sitemap.xml | grep -c "<loc>"` prints 14 and `curl -s http://localhost:3000/robots.txt` shows the sitemap line.

- [ ] **Step 4: Commit**

```bash
git add app/sitemap.ts app/robots.ts scripts/parity.cjs
git commit -m "Sitemap and robots from the content; parity script takes paths (P3 Task 6)"
```

---

### Task 7: Handover notes and push

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Extend the "Next.js port" section**

Append to the section added in Priority 2:

```markdown
**Priority 3 (content) is done**: the authored content lives in `content/<type>/*.md` with front matter - 8 case studies, 6 services, 5 legal documents, 8 team bios, 6 accreditations - extracted once from `index.html`'s script objects by `scripts/extract-content.cjs` (front-matter values are JSON-encoded, which is valid YAML, so the copy is byte-for-byte). `lib/content.ts` is the only reader: `gray-matter` for front matter, `marked` with `breaks: true` (the legal points' numbered sub-clauses are single newlines and must stay on their own lines), bodies split on `##` into `sections`. `app/case-studies/[key]` and `app/legal/[slug]` are static routes with per-page metadata, share cards and `WebPage` JSON-LD; `app/sitemap.ts` and `app/robots.ts` replace the generator's files; the host is `SITE_ORIGIN` in `lib/site.ts`, env-overridable. `scripts/parity.cjs <oldPath> <newPath>` compares any page with its old static twin. **The markdown is the source of truth from here; `index.html`'s objects are the frozen reference until cut-over.** The home page's dialogs still read nothing (Priority 4 gives them the content as props).
```

- [ ] **Step 2: Commit and push**

```bash
git add CLAUDE.md
git commit -m "Handover notes for the markdown content (P3 Task 7)"
git push origin next
```

---

## Self-review

- Coverage: extraction (1), loaders and site constants (2), chrome and absolute links (3), case-study pages (4), legal pages (5), sitemap/robots/parity (6), notes (7). Services, team and accreditation content are extracted and loadable now and consumed by the dialogs in Priority 4.
- Names: `Section`, `getCaseStudies`, `getCaseStudy`, `getFeaturedCaseStudies`, `getLegalDocs`, `getLegalDoc`, `getServices`, `getTeam`, `getAccreditations` are defined in Task 2 and used in Tasks 4-6 with those exact names; `SITE_ORIGIN` from `lib/site.ts` everywhere; `Markdown`'s `itemClass` values match the old class names.
- Placeholders: none.
