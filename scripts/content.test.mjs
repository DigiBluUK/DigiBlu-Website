import test from "node:test";
import assert from "node:assert/strict";
import {
  getCaseStudies,
  getCaseStudy,
  getFeaturedCaseStudies,
  getServices,
  getLegalDocs,
  getLegalDoc,
  getTeam,
  getAccreditations,
} from "../lib/content.ts";

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
