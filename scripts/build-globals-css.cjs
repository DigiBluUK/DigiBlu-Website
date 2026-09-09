// Produces app/globals.css from assets/site.css and mirrors assets/ into
// public/assets/. The stylesheet is copied VERBATIM except that its url()
// references, written relative to assets/site.css, become absolute under
// /assets/ (Next serves public/ at the site root and leaves absolute urls
// alone), and one @font-face is prepended so DM Sans is self-hosted - the
// old <head> loaded it from Google Fonts. Idempotent; run via `npm run assets`.
const fs = require("node:fs");
const path = require("node:path");

const FONT_FACE =
  "@font-face { font-family: 'DM Sans'; font-style: normal; font-weight: 100 1000; font-display: swap; src: url('/assets/dmsans.woff2') format('woff2'); }\n";

function listUrls(css) {
  return [...css.matchAll(/url\('([^']+)'\)/g)].map((m) => m[1]).filter((u) => !u.startsWith("data:"));
}

function buildGlobalsCss(root) {
  const src = fs.readFileSync(path.join(root, "assets/site.css"), "utf8");
  const out = FONT_FACE + src.replace(/url\('(?!\/|data:|https?:)([^']+)'\)/g, "url('/assets/$1')");
  fs.mkdirSync(path.join(root, "app"), { recursive: true });
  fs.writeFileSync(path.join(root, "app/globals.css"), out);
  copyAssets(path.join(root, "assets"), path.join(root, "public/assets"));
  return out;
}

function copyAssets(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    // the stylesheet is imported, not served; team/source/ is originals, never served
    if (entry.name === "site.css" || entry.name === "source") continue;
    const a = path.join(from, entry.name), b = path.join(to, entry.name);
    if (entry.isDirectory()) copyAssets(a, b);
    else fs.copyFileSync(a, b);
  }
}

if (require.main === module) {
  const css = buildGlobalsCss(path.join(__dirname, ".."));
  console.log("app/globals.css:", css.length, "bytes;", listUrls(css).length, "url() references; assets mirrored to public/assets");
}

module.exports = { buildGlobalsCss, listUrls };
