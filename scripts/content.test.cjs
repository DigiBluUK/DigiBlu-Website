const test = require("node:test");
const assert = require("node:assert/strict");
const { buildContent } = require("./build-content.cjs");

// The content module lib/content.ts imports is built by build-content.cjs;
// these assert what it builds, which is what every page reads.
const c = buildContent();

test("case studies: ten, ordered, sectioned, three featured in card order", () => {
  const all = c.caseStudies;
  assert.equal(all.length, 10);
  assert.equal(all[1].key, "safari-destinations");
  assert.equal(all[3].key, "quote-processing");
  assert.equal(all[0].key, "sse-ovo");
  assert.deepEqual(all[0].sections.map((s) => s.heading), ["Overview", "The problem", "What we did", "Outcome"]);
  assert.match(all[0].sections[0].html, /^<p>OVO, one of the UK/);
  assert.equal(all[0].stats.length, 3);
  assert.equal(all[0].quote.cite, "Jon Willicombe, Head of Early-Stage Collections - OVO");
  assert.deepEqual(all.filter((x) => x.featured > 0).sort((a, b) => a.featured - b.featured).map((x) => x.key), ["sse-ovo", "safari-destinations", "quote-processing"]);
});

test("legal: six by slug, sub-clauses on their own lines, no autolinks", () => {
  assert.equal(c.legalDocs.length, 6);
  assert.equal(c.legalDocs[5].slug, "accessibility-statement");
  const privacy = c.legalDocs.find((d) => d.slug === "privacy-policy");
  assert.equal(privacy.title, "Privacy and Cookies Policy");
  assert.equal(privacy.intro, "Last updated 10 September 2026.");
  assert.ok(privacy.sections.some((s) => s.heading === "12. Cookies and Similar Storage" && s.html.includes("_ga_RVNLDVSLJ8")));
  assert.ok(privacy.sections.some((s) => s.html.includes("<br>")), "a numbered point should keep its line breaks");
  assert.ok(!privacy.sections.some((s) => s.html.includes("mailto:")), "an email address stays plain text");
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
