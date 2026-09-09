// Pulls the About figure's dots out of index.html's inline SVG into
// content/lattice.json, so the component renders from data instead of
// carrying 60KB of JSX. The geometry itself is made by the old
// scratchpad/geo/dots.cjs; this only copies what it produced.
const fs = require("node:fs");
const path = require("node:path");

function extractLattice() {
  const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  const start = html.indexOf('<svg class="geo-flow"'), end = html.indexOf("</svg>", start);
  const svg = html.slice(start, end);
  const litStart = svg.indexOf('<g class="mk-lit">');
  const parse = (s) => [...s.matchAll(/<circle class="([^"]+)" cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)"\/>/g)].map((m) => ({ cls: m[1], cx: +m[2], cy: +m[3], r: +m[4] }));
  return { field: parse(svg.slice(0, litStart)), lit: parse(svg.slice(litStart)) };
}

if (require.main === module) {
  const data = extractLattice();
  fs.mkdirSync(path.join(__dirname, "..", "content"), { recursive: true });
  fs.writeFileSync(path.join(__dirname, "..", "content/lattice.json"), JSON.stringify(data));
  console.log("content/lattice.json:", data.field.length, "field dots,", data.lit.length, "lit copies");
}

module.exports = { extractLattice };
