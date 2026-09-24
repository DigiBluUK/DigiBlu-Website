const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

// Runs against the prerendered output of `next build` (.next/server/app):
// what a crawler, a share preview and a visitor without JavaScript get.
// `pnpm test:pages`, after `pnpm build`. There is no CI: run it before a
// release. Note it checks the Next build, not the vinext bundle Cloudflare
// deploys; check behaviour in the digiblu-vinext launch config.
// Added 11 Sep 2026 with the listing pages, after the developer's review
// found dialog-only content and a dead host in the metadata.
const APP = path.join(__dirname, "..", ".next", "server", "app");
const PUBLIC = path.join(__dirname, "..", "public");
const { buildContent } = require("./build-content.cjs");
const c = buildContent();
const ORIGIN = (process.env.SITE_ORIGIN || "https://www.digiblu.com").replace(/\/+$/, "");

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
  assert.ok(fs.existsSync(path.join(APP, "index.html")), "run pnpm build first");
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

test("the listing pages carry every service, bio, accreditation and case study", () => {
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

// The form is on /contact only since 18 Sep 2026; the home page's contact
// buttons link there.
test("the contact form is on its page, and only there", () => {
  const p = html("/contact");
  for (const id of ["contactPage", "cf-first", "cf-email", "cf-consent", "cf-turnstile", "cf-website", "cf-error"]) assert.ok(p.includes(`id="${id}"`), "contact page: " + id);
  const h = html("/");
  assert.ok(!h.includes('id="cf-first"'), "home page has no contact form");
  assert.ok(!/class="[^"]*js-contact-open/.test(h), "home page contact links are plain links");
});

// The dialogs were removed on 18 Sep 2026 at DigiBlu's developer's request:
// each document lives on its own page and nowhere else, so the home page
// neither shows it nor carries it in its payload for a dialog to fill (it
// shipped all of it before: the home page fell from 371KB to 271KB when the
// content dialogs went; most of what remains is Next's own payload of the
// page). Probes are plain word runs so JSON escaping in the payload cannot
// hide a match. The team bios stay: the strip's desktop card shows them.
test("the home page has no dialogs and carries no document content", () => {
  const h = html("/");
  assert.equal((h.match(/class="modal-overlay"/g) || []).length, 0, "no dialog overlays");
  const probe = (x) => (text(x).match(/[A-Za-z]+(?: [A-Za-z]+){5}/) || [])[0];
  const docs = [
    ...c.legalDocs.map((d) => ["legal " + d.slug, d.sections[0].html]),
    ...c.services.map((x) => ["service " + x.key, x.sections[0].html]),
    ...c.accreditations.map((x) => ["accreditation " + x.key, x.html]),
    ...c.caseStudies.map((x) => ["case study " + x.key, x.sections[x.sections.length - 1].html]),
  ];
  for (const [label, body] of docs) {
    const p = probe(body);
    assert.ok(p, label + ": no probe");
    assert.ok(!h.includes(p), label + ": on the home page (" + p + ")");
  }
});

// 21 Sep 2026: every page has the fixed nav and the scroll-to-top disc; the
// listing pages answer every anchor the home page, the footer and the
// redirect list link to; the home page's featured cards are the content's
// featured three, in order, and its count is the content's; the team strip
// is rendered from the content, in order.
test("every page has the fixed nav and the scroll-to-top disc", () => {
  for (const p of pages) {
    const h = html(p);
    assert.ok(h.includes('id="siteNav"'), p + ": #siteNav");
    assert.ok(h.includes('id="scrollTopBtn"'), p + ": #scrollTopBtn");
  }
});

test("the listing pages carry an anchor for every key", () => {
  const ids = (h) => new Set([...h.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  const s = ids(html("/services"));
  for (const x of c.services) assert.ok(s.has(x.key), "/services#" + x.key);
  const t = ids(html("/team"));
  for (const m of c.team) assert.ok(t.has(m.key), "/team#" + m.key);
  const a = ids(html("/accreditations"));
  for (const x of c.accreditations) assert.ok(a.has(x.key), "/accreditations#" + x.key);
});

test("the home page: featured cards, case study count and team strip match the content", () => {
  const h = html("/");
  const featured = c.caseStudies.filter((x) => x.featured > 0).sort((a, b) => a.featured - b.featured).map((x) => x.key);
  const cards = [...h.matchAll(/href="\/case-studies\/([^"#]+)" class="case-read-more"/g)].map((m) => m[1]);
  assert.deepEqual(cards, featured, "featured cards");
  assert.ok(h.includes('<span class="case-count">(' + c.caseStudies.length + ")</span>"), "View all count");
  const strip = [...h.matchAll(/data-key="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(strip, [...c.team].sort((a, b) => a.order - b.order).map((m) => m.key), "team strip order");
});

test("sitemap lists every page", () => {
  const p = ["sitemap.xml.body", "sitemap.xml"].map((f) => path.join(APP, f)).find(fs.existsSync);
  assert.ok(p, "sitemap output");
  const xml = fs.readFileSync(p, "utf8");
  for (const page of pages) assert.ok(xml.includes(`<loc>${ORIGIN}${page === "/" ? "/" : page}</loc>`), "sitemap: " + page);
  // Every URL has a lastmod (24 Sep 2026).
  const urls = xml.split("<url>").slice(1);
  assert.equal(urls.length, pages.length, "one <url> per page");
  for (const u of urls) assert.match(u, /<lastmod>\d{4}-\d{2}-\d{2}T[^<]+<\/lastmod>/, "lastmod: " + (u.match(/<loc>([^<]+)/) || [])[1]);
});
