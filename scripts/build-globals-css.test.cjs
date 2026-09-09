const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { buildGlobalsCss, listUrls } = require("./build-globals-css.cjs");

const root = path.join(__dirname, "..");

test("every url() in globals.css is absolute under /assets/ and exists in public/assets", () => {
  buildGlobalsCss(root);
  const css = fs.readFileSync(path.join(root, "app/globals.css"), "utf8");
  const urls = listUrls(css);
  assert.ok(urls.length > 20, "expected the stylesheet's asset references, got " + urls.length);
  for (const u of urls) {
    assert.match(u, /^\/assets\//, "not absolute: " + u);
    assert.ok(fs.existsSync(path.join(root, "public", u)), "missing file for " + u);
  }
});

test("the font face is self-hosted and no Google Fonts reference remains", () => {
  const css = fs.readFileSync(path.join(root, "app/globals.css"), "utf8");
  assert.match(css, /@font-face \{ font-family: 'DM Sans'/);
  assert.match(css, /url\('\/assets\/dmsans\.woff2'\)/);
  assert.doesNotMatch(css, /fonts\.googleapis/);
});

test("the stylesheet body is byte-identical to assets/site.css apart from url() paths", () => {
  const src = fs.readFileSync(path.join(root, "assets/site.css"), "utf8");
  const css = fs.readFileSync(path.join(root, "app/globals.css"), "utf8");
  const body = css.slice(css.indexOf("\n", css.indexOf("@font-face")) + 1);
  assert.equal(body.replace(/url\('\/assets\//g, "url('"), src);
});
