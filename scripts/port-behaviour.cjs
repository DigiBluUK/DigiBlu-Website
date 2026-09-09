// Stamps one or more script ranges from index.html into a client component
// that runs them once on mount. The old scripts are IIFE bodies indented six
// spaces; each range is dropped, verbatim, inside a once() block at the same
// indentation, so a diff against index.html shows only the wrapper. Usage:
//   node scripts/port-behaviour.cjs <Name> <out.jsx> [--pin] [--props "{ team }"] key:from-to [key:from-to ...]
// --pin prepends ensureAboutPin() (the About fill and the values need the
// shared pin progress published first); --props makes the component take
// props, for the content-driven dialogs, whose bodies are then edited by hand.
const fs = require("node:fs");
const path = require("node:path");

const args = process.argv.slice(2);
const name = args.shift(), outFile = args.shift();
let pin = false, props = "";
const ranges = [];
while (args.length) {
  const a = args.shift();
  if (a === "--pin") pin = true;
  else if (a === "--props") props = args.shift();
  else { const m = a.match(/^([\w-]+):(\d+)-(\d+)$/); if (!m) throw new Error("bad range " + a); ranges.push({ key: m[1], from: +m[2], to: +m[3] }); }
}
if (!name || !outFile || !ranges.length) throw new Error("usage: port-behaviour <Name> <out.jsx> [--pin] [--props ...] key:from-to ...");

const lines = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8").split(/\r?\n/);
const blocks = ranges.map(({ key, from, to }) => {
  const body = lines.slice(from - 1, to).join("\n");
  return `    once("${key}", () => {\n${body}\n    });`;
});
const out = `"use client";
import { useEffect } from "react";
import { once } from "@/lib/client/once";
${pin ? 'import { ensureAboutPin } from "@/lib/client/about-pin";\n' : ""}
// Ported from index.html lines ${ranges.map((r) => r.from + "-" + r.to).join(", ")} by
// scripts/port-behaviour.cjs: the old script's body, verbatim, run once on
// mount against the server-rendered markup. Kept as JavaScript on purpose -
// this is the old site's code, not a rewrite. Hand edits after generation
// are allowed and are noted in the file where made.
export default function ${name}(${props}) {
  useEffect(() => {
${pin ? "    ensureAboutPin();\n" : ""}${blocks.join("\n")}
  }, []);
  return null;
}
`;
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, out);
console.log("wrote", outFile, "from lines", ranges.map((r) => r.from + "-" + r.to).join(", "));
