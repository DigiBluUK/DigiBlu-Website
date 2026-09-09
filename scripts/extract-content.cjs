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
    if (Array.isArray(v)) {
      lines.push(`${k}:`);
      for (const item of v) {
        if (item && typeof item === "object") lines.push("  - " + Object.entries(item).map(([a, b]) => line(a, b)).join("\n    "));
        else lines.push("  - " + JSON.stringify(item));
      }
    } else if (v && typeof v === "object") {
      lines.push(`${k}:`);
      for (const [a, b] of Object.entries(v)) lines.push("  " + line(a, b));
    } else lines.push(line(k, v));
  }
  return "---\n" + lines.join("\n") + "\n---\n";
}

const paras = (s) => String(s).split("\n").map((t) => t.trim()).filter(Boolean).join("\n\n");
const write = (root, rel, text) => {
  const p = path.join(root, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, text);
  return rel;
};

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
    const photo = o.TEAM_PHOTOS[m.cls];
    if (!photo) throw new Error("no photo rule for " + m.cls);
    const slug = photo.split("/").pop().replace(/\.png$/, "");
    const fm = frontMatter({ name: m.name, role: m.role, cls: m.cls, photo, order: i + 1 });
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
