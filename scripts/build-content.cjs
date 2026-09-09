// Folds content/**/*.md into one JSON module, content/.generated/content.json,
// that lib/content.ts imports. The markdown stays the source of truth; this
// runs before every build and test (npm run content) so the loaders never
// touch the disk at request time - the Cloudflare Worker has no disk, and a
// route rendered on demand there died with readdir ENOENT while the loaders
// read the folder with fs.
const fs = require("node:fs");
const path = require("node:path");
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

function load(type, map) {
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

function buildContent() {
  const withSections = (d, b) => ({ ...d, sections: b.sections });
  const withHtml = (d, b) => ({ ...d, html: b.html });
  return {
    caseStudies: load("case-studies", withSections),
    services: load("services", withSections),
    legalDocs: load("legal", withSections),
    team: load("team", withHtml),
    accreditations: load("accreditations", withHtml),
  };
}

if (require.main === module) {
  const data = buildContent();
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(data));
  console.log("content/.generated/content.json:", Object.entries(data).map(([k, v]) => `${v.length} ${k}`).join(", "));
}

module.exports = { buildContent };
