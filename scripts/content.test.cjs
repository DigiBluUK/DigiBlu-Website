const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { buildContent } = require("./build-content.cjs");

// The content module lib/content.ts imports is built by build-content.cjs;
// these assert what it builds, which is what every page reads.
const c = buildContent();

test("case studies: nine, ordered, sectioned, three featured in card order", () => {
  const all = c.caseStudies;
  assert.equal(all.length, 9);
  assert.equal(all[1].key, "safari-destinations");
  assert.equal(all[2].key, "assurancesd");
  // Removed on 23 Sep 2026, not approved by the client.
  assert.ok(!all.some((x) => x.key === "quote-processing"));
  assert.equal(all[0].key, "sse-ovo");
  assert.deepEqual(all[0].sections.map((s) => s.heading), ["Overview", "The problem", "What we did", "Outcome"]);
  assert.match(all[0].sections[0].html, /^<p>OVO, one of the UK/);
  assert.equal(all[0].stats.length, 3);
  assert.equal(all[0].quote.cite, "Jon Willicombe, Head of Early-Stage Collections - OVO");
  assert.deepEqual(all.filter((x) => x.featured > 0).sort((a, b) => a.featured - b.featured).map((x) => x.key), ["sse-ovo", "safari-destinations", "assurancesd"]);
});

test("legal: six by slug, sub-clauses on their own lines, no autolinks", () => {
  assert.equal(c.legalDocs.length, 6);
  assert.equal(c.legalDocs[5].slug, "accessibility-statement");
  const privacy = c.legalDocs.find((d) => d.slug === "privacy-policy");
  assert.equal(privacy.title, "Privacy and Cookies Policy");
  assert.equal(privacy.intro, "Last updated 24 September 2026.");
  // Cloudflare serves the site from its edge worldwide, so the policy makes no
  // claim about where it is hosted (removed from section 15, 24 Sep 2026).
  assert.ok(!privacy.sections.some((s) => /hosted in the UK/i.test(s.html)), "no UK-hosting claim");
  assert.ok(privacy.sections.some((s) => s.heading === "12. Cookies and Similar Storage" && s.html.includes("Turnstile")));
  assert.ok(privacy.sections.some((s) => s.heading === "12. Cookies and Similar Storage" && s.html.includes("_ga_RVNLDVSLJ8")));
  // Enquiries reach DigiBlu through Azure Communication Services (18 Sep 2026);
  // section 14 promises disclosure only "as set out in this notice", so this
  // naming is what keeps that true. The address stays plain text, like the rest.
  assert.ok(privacy.sections.some((s) => s.heading === "12. Cookies and Similar Storage" && s.html.includes("Azure Communication Services") && s.html.includes("Microsoft")));
  assert.ok(!privacy.sections.some((s) => /href="[^"]*microsoft/.test(s.html)), "the Microsoft address stays plain text");
  // The contact form reports a generate_lead event (18 Sep 2026): section 12
  // says so, and that nothing typed goes with it.
  assert.ok(privacy.sections.some((s) => s.heading === "12. Cookies and Similar Storage" && s.html.includes("how many send an enquiry") && s.html.includes("never what you wrote")));
  assert.ok(privacy.sections.some((s) => s.html.includes("<br>")), "a numbered point should keep its line breaks");
  assert.ok(!privacy.sections.some((s) => s.html.includes("mailto:")), "an email address stays plain text");
});

// No em dashes anywhere in the copy (21 Sep 2026): the site uses a spaced
// hyphen. Checks the built content, so every field of every document counts.
test("content: no em dashes", () => {
  const all = JSON.stringify(buildContent());
  assert.ok(!all.includes(String.fromCharCode(0x2014)) && !all.includes("&mdash;"), "em dash in content");
});

// The old site's addresses, to be uploaded as a Cloudflare Bulk Redirects
// list at the DNS switch: every row well formed, every target a page this
// site serves, every anchor one the page carries (21 Sep 2026).
test("redirects: every target is a page this site serves", () => {
  const c = buildContent();
  const rows = fs.readFileSync(path.join(__dirname, "..", "docs", "redirects", "old-site-redirects.csv"), "utf8").trim().split(/\r?\n/);
  assert.equal(rows[0], "source_url,target_url,status,preserve_query_string,include_subdomains,subpath_matching,preserve_path_suffix");
  const keys = (list) => new Set(list.map((x) => x.key));
  const anchors = { "/services": keys(c.services), "/team": keys(c.team), "/accreditations": keys(c.accreditations), "/": new Set(["about", "case-studies", "services", "team", "hero-content"]) };
  const pages = new Set(["/", "/services", "/team", "/accreditations", "/case-studies", "/contact", ...c.caseStudies.map((x) => "/case-studies/" + x.key), ...c.legalDocs.map((d) => "/legal/" + d.slug)]);
  for (const row of rows.slice(1)) {
    const cols = row.split(",");
    assert.equal(cols.length, 7, "columns: " + row);
    assert.equal(cols[2], "301", "status: " + row);
    const u = new URL(cols[1]);
    assert.equal(u.origin, "https://www.digiblu.com", "origin: " + row);
    assert.ok(pages.has(u.pathname), "page: " + row);
    if (u.hash) assert.ok(anchors[u.pathname] && anchors[u.pathname].has(u.hash.slice(1)), "anchor: " + row);
  }
});

// Every sitemap URL has a lastmod (24 Sep 2026), from git where it can.
test("lastmod: a valid date for every page", () => {
  const pages = ["/", "/services", "/case-studies", "/team", "/accreditations", "/contact", ...c.caseStudies.map((x) => "/case-studies/" + x.key), ...c.legalDocs.map((d) => "/legal/" + d.slug)];
  for (const p of pages) {
    const v = c.lastmod[p];
    assert.ok(v && !Number.isNaN(Date.parse(v)), "lastmod " + p);
    assert.ok(Date.parse(v) <= Date.now() + 60000, "lastmod in the future " + p);
  }
  assert.equal(Object.keys(c.lastmod).length, pages.length, "no lastmod for a page that does not exist");
});

test("services, team, accreditations", () => {
  // Card order on the home page (01 to 06), which the services page numbers follow.
  assert.deepEqual(c.services.map((s) => s.key), ["ai", "discovery", "process", "digital", "tom", "post"]);
  assert.equal(c.services[0].sections.length, 5);
  assert.equal(c.team.length, 8);
  assert.equal(c.team[0].photo, "/assets/team/vic-gysin.png");
  assert.deepEqual(c.team.map((m) => m.key), ["vic-gysin", "david-williams", "karen-potgieter", "jon-hinder", "martin-mccloskey", "dianne-harris", "dave-vanderwesthuizen", "nick-bantick"]);
  assert.equal(c.accreditations.find((a) => a.key === "gcloud").onDark, true);
});
