// Folds content/**/*.md into one JSON module, content/.generated/content.json,
// that lib/content.ts imports. The markdown stays the source of truth; this
// runs before every build and test (pnpm content) so the loaders never
// touch the disk at request time - the Cloudflare Worker has no disk, and a
// route rendered on demand there died with readdir ENOENT while the loaders
// read the folder with fs.
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const matter = require("gray-matter");
const { marked } = require("marked");

const ROOT = path.join(__dirname, "..", "content");
const OUT = path.join(ROOT, ".generated", "content.json");

// breaks: true so a single newline is a <br> (the legal points' numbered
// sub-clauses); GFM autolinks off (an email address in the privacy policy is
// plain text on the old page). Same settings the loaders used.
marked.use({ breaks: true, gfm: true, tokenizer: { url: () => undefined } });

const render = (md) => marked.parse(md.trim()).trim();

// Splits a body on "## " headings into sections; text before the first
// heading, or a body with no headings, comes back as html.
function parseBody(body) {
  const parts = body.split(/^## (.+)$/m);
  const html = render(parts[0]);
  const sections = [];
  for (let i = 1; i < parts.length; i += 2) sections.push({ heading: parts[i].trim(), html: render(parts[i + 1] || "") });
  return { sections, html };
}

// Each item's source file, for lastmod; kept out of the content itself.
const SOURCES = new WeakMap();

function load(type, map) {
  const dir = path.join(ROOT, type);
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const { data, content } = matter(fs.readFileSync(path.join(dir, f), "utf8"));
      const item = map(data, parseBody(content));
      SOURCES.set(item, path.join("content", type, f));
      return item;
    })
    .sort((a, b) => a.order - b.order);
}

// The sitemap's lastmod for each page (24 Sep 2026): the date of the last
// commit touching the files the page is made from - its own markdown for a
// case study or legal document; the content folder and the page file for a
// listing page; the content and the home page's sections for the home page.
// Where git has no answer (no git, or a file not yet committed) the build
// time stands in. A shallow clone gives every page its latest commit's date.
const REPO = path.join(__dirname, "..");
const BUILD_TIME = new Date().toISOString();
function lastCommit(paths) {
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%cI", "--", ...paths], { cwd: REPO, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    return out ? new Date(out).toISOString() : BUILD_TIME;
  } catch {
    return BUILD_TIME;
  }
}
function lastModified(data) {
  const lastmod = {
    "/": lastCommit(["content", "components/sections", "app/page.tsx"]),
    "/services": lastCommit(["content/services", "app/services/page.tsx"]),
    "/case-studies": lastCommit(["content/case-studies", "app/case-studies/page.tsx"]),
    "/team": lastCommit(["content/team", "app/team/page.tsx"]),
    "/accreditations": lastCommit(["content/accreditations", "app/accreditations/page.tsx"]),
    "/contact": lastCommit(["app/contact/page.tsx", "components/ContactFormBody.tsx"]),
  };
  for (const c of data.caseStudies) lastmod["/case-studies/" + c.key] = lastCommit([SOURCES.get(c)]);
  for (const d of data.legalDocs) lastmod["/legal/" + d.slug] = lastCommit([SOURCES.get(d)]);
  return lastmod;
}

function buildContent() {
  const withSections = (d, b) => ({ ...d, sections: b.sections });
  const withHtml = (d, b) => ({ ...d, html: b.html });
  const data = {
    caseStudies: load("case-studies", withSections),
    services: load("services", withSections),
    legalDocs: load("legal", withSections),
    team: load("team", withHtml),
    accreditations: load("accreditations", withHtml),
  };
  return { ...data, lastmod: lastModified(data) };
}

if (require.main === module) {
  const data = buildContent();
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(data));
  console.log("content/.generated/content.json:", Object.entries(data).map(([k, v]) => `${Array.isArray(v) ? v.length : Object.keys(v).length} ${k}`).join(", "));
}

module.exports = { buildContent };
