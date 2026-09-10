const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { readObjects, writeContent, frontMatter } = require("./extract-content.cjs");

const root = path.join(__dirname, "..");

test("the five objects come out of index.html with the known counts", () => {
  const o = readObjects(root);
  assert.equal(o.CASE_STUDIES.length, 8);
  assert.equal(Object.keys(o.SERVICES).length, 6);
  assert.equal(Object.keys(o.LEGAL_DETAILS).length, 5);
  assert.equal(Object.keys(o.BADGE_DETAILS).length, 6);
  assert.equal(o.TEAM_MEMBERS.length, 8);
  assert.equal(Object.keys(o.TEAM_PHOTOS).length, 8);
});

test("front matter round-trips any string through YAML", () => {
  const fm = frontMatter({ title: 'He said "no": it\'s #1', n: 3, list: [{ v: "<50%", l: "x" }] });
  assert.match(fm, /^---\n/);
  assert.match(fm, /title: "He said \\"no\\": it's #1"\n/);
  assert.match(fm, /n: 3\n/);
});

test("writing the tree produces 33 files whose copy equals the source", () => {
  const o = readObjects(root);
  // Written to a temporary root, never the repository: content/ is the
  // authored source now, and an extraction over it drops anything added
  // since the migration (it took the legal documents' description fields
  // with it on 10 Sep 2026) and churns every file's line endings.
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "digiblu-extract-"));
  const files = writeContent(tmp, o);
  assert.equal(files.length, 33);
  const sse = fs.readFileSync(path.join(tmp, "content/case-studies/sse-ovo.md"), "utf8");
  assert.ok(sse.includes(JSON.stringify(o.CASE_STUDIES[0].title)));
  assert.ok(sse.includes("## Overview\n\n" + o.CASE_STUDIES[0].overview.split("\n")[0]));
  const terms = fs.readFileSync(path.join(tmp, "content/legal/website-terms-of-use.md"), "utf8");
  assert.ok(terms.includes("## " + o.LEGAL_DETAILS.terms.points[0].h + "\n\n" + o.LEGAL_DETAILS.terms.points[0].p));
  fs.rmSync(tmp, { recursive: true, force: true });
});
