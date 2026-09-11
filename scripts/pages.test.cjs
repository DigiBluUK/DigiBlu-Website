const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

// Runs against the prerendered output of `next build` (.next/server/app):
// what a crawler, a share preview and a visitor without JavaScript get.
// `npm run test:pages`, after `npm run build`; CI runs it after the build.
// Added 11 Sep 2026 with the listing pages, after the developer's review
// found dialog-only content and a dead host in the metadata.
const APP = path.join(__dirname, "..", ".next", "server", "app");
const PUBLIC = path.join(__dirname, "..", "public");
const { buildContent } = require("./build-content.cjs");
const c = buildContent();
const ORIGIN = (process.env.SITE_ORIGIN || "https://digiblu.com").replace(/\/+$/, "");

const html = (route) => fs.readFileSync(path.join(APP, route === "/" ? "index.html" : route.slice(1) + ".html"), "utf8");
const text = (h) => h.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
const decode = (s) => s.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
const meta = (h, attr, name) => {
  const m = h.match(new RegExp(`<meta[^>]*${attr}="${name}"[^>]*content="([^"]*)"`)) || h.match(new RegExp(`<meta[^>]*content="([^"]*)"[^>]*${attr}="${name}"`));
  return m ? decode(m[1]) : null;
};
const canonical = (h) => { const m = h.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"/); return m ? m[1] : null; };
const title = (h) => { const m = h.match(/<title>([^<]*)<\/title>/); return m ? decode(m[1]) : null; };

const pages = [
  "/", "/services", "/team", "/accreditations", "/case-studies", "/contact",
  ...c.caseStudies.map((x) => "/case-studies/" + x.key),
  ...c.legalDocs.map((d) => "/legal/" + d.slug),
];

test("a build exists", () => {
  assert.ok(fs.existsSync(path.join(APP, "index.html")), "run npm run build first");
});

test("every page: unique title, description, canonical on the origin, share card that exists, no dead host", () => {
  const titles = new Set();
  for (const p of pages) {
    const h = html(p);
    const t = title(h);
    assert.ok(t && !titles.has(t), p + " title " + t);
    titles.add(t);
    const d = meta(h, "name", "description");
    assert.ok(d && d.length >= 50 && d.length <= 160, p + " description length " + (d || "").length);
    // Next writes the home canonical without the trailing slash.
    assert.equal(canonical(h), p === "/" ? ORIGIN : ORIGIN + p, p + " canonical");
    const og = meta(h, "property", "og:image");
    assert.ok(og && og.startsWith(ORIGIN + "/assets/"), p + " og:image " + og);
    assert.ok(fs.existsSync(path.join(PUBLIC, og.slice(ORIGIN.length))), p + " share card file " + og);
    assert.equal(meta(h, "property", "og:title"), t, p + " og:title");
    assert.ok(meta(h, "name", "twitter:card"), p + " twitter card");
    assert.ok(h.includes('type="application/ld+json"'), p + " json-ld");
    assert.ok(!h.includes("digibluuk.github.io"), p + " carries the retired host");
  }
});

test("the listing pages carry the content the dialogs show", () => {
  const first = (x) => text(x).trim().slice(0, 40);
  const s = text(html("/services"));
  for (const x of c.services) {
    assert.ok(s.includes(x.title), "services: " + x.title);
    assert.ok(s.includes(first(x.sections[0].html)), "services: " + x.key + " first section");
  }
  const t = text(html("/team"));
  for (const m of c.team) {
    assert.ok(t.includes(m.name), "team: " + m.name);
    assert.ok(t.includes(first(m.html)), "team: " + m.key + " bio");
  }
  const a = text(html("/accreditations"));
  for (const x of c.accreditations) {
    assert.ok(a.includes(x.title), "accreditations: " + x.title);
    assert.ok(a.includes(first(x.html)), "accreditations: " + x.key + " description");
  }
  const cs = html("/case-studies");
  for (const x of c.caseStudies) assert.ok(cs.includes(`href="/case-studies/${x.key}"`), "case studies: " + x.key + " link");
});

test("the home page links to every listing page", () => {
  const h = html("/");
  for (const href of ["/services#ai", "/services#post", "/accreditations#9001", "/case-studies", "/team", "/contact"]) {
    assert.ok(h.includes(`href="${href}"`), href);
  }
});

test("the contact page carries the form and the home page its dialog", () => {
  const p = html("/contact");
  for (const id of ["contactPage", "cf-first", "cf-email", "cf-consent", "cf-turnstile", "cf-website", "cf-error"]) assert.ok(p.includes(`id="${id}"`), "contact page: " + id);
  assert.ok(!p.includes('id="contactModal"'), "contact page has no dialog overlay");
  const h = html("/");
  assert.ok(h.includes('id="contactModal"') && h.includes('id="cf-first"'), "home page keeps the dialog");
});

test("sitemap lists every page", () => {
  const p = ["sitemap.xml.body", "sitemap.xml"].map((f) => path.join(APP, f)).find(fs.existsSync);
  assert.ok(p, "sitemap output");
  const xml = fs.readFileSync(p, "utf8");
  for (const page of pages) assert.ok(xml.includes(`<loc>${ORIGIN}${page === "/" ? "/" : page}</loc>`), "sitemap: " + page);
});
