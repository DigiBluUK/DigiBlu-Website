const test = require("node:test");
const assert = require("node:assert/strict");
const { extractLattice } = require("./extract-lattice.cjs");

test("900 field dots and 78 lit copies, on the 30x30 pitch", () => {
  const { field, lit } = extractLattice();
  assert.equal(field.length, 900);
  assert.equal(lit.length, 78);
  assert.equal(field.filter((d) => d.cls.includes("mk")).length, 78);
  assert.ok(field.every((d) => d.cx >= 14 && d.cx <= 370 && d.r >= 1.05 && d.r <= 3.15));
  assert.deepEqual(
    lit.map((d) => d.cx + "," + d.cy),
    field.filter((d) => d.cls.includes("mk")).map((d) => d.cx + "," + d.cy)
  );
});
