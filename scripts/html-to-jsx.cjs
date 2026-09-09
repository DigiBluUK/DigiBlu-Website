// HTML -> JSX for the section markup in index.html. The markup is
// hand-written and well-formed, so a tag-by-tag rewrite is enough; nothing
// here parses a tree. Usage:
//   node scripts/html-to-jsx.cjs <fromLine> <toLine> <ComponentName> <out.tsx>
const fs = require("node:fs");
const path = require("node:path");

const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
const TABLE = {
  class: "className", for: "htmlFor", tabindex: "tabIndex", maxlength: "maxLength", minlength: "minLength",
  autocomplete: "autoComplete", autofocus: "autoFocus", readonly: "readOnly", novalidate: "noValidate",
  enctype: "encType", crossorigin: "crossOrigin", fetchpriority: "fetchPriority", srcset: "srcSet",
  datetime: "dateTime", spellcheck: "spellCheck", contenteditable: "contentEditable", "accept-charset": "acceptCharset",
  "http-equiv": "httpEquiv", "xlink:href": "xlinkHref", "xml:space": "xmlSpace", "xmlns:xlink": "xmlnsXlink",
  allowfullscreen: "allowFullScreen", referrerpolicy: "referrerPolicy",
};

function camel(s) { return s.replace(/-([a-z])/g, (m, c) => c.toUpperCase()); }

function attrName(name) {
  const lower = name.toLowerCase();
  if (TABLE[lower]) return TABLE[lower];
  if (lower.startsWith("aria-") || lower.startsWith("data-")) return lower;
  if (name.includes("-")) return camel(name);
  return name; // viewBox, preserveAspectRatio, keyPoints... already camelCase in SVG
}

function styleObject(value) {
  const pairs = value.split(";").map((p) => p.trim()).filter(Boolean).map((p) => {
    const i = p.indexOf(":");
    const k = p.slice(0, i).trim(), v = p.slice(i + 1).trim();
    const key = k.startsWith("--") ? `'${k}'` : camel(k);
    return `${key}: '${v.replace(/'/g, "\\'")}'`;
  });
  return `{{${pairs.join(", ")}}}`;
}

function convertAttrs(attrs) {
  const out = [];
  const re = /([^\s=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  let m;
  while ((m = re.exec(attrs))) {
    const name = m[1];
    const value = m[2] !== undefined ? m[2] : m[3] !== undefined ? m[3] : m[4];
    if (value === undefined) { out.push(attrName(name)); continue; }
    if (name.toLowerCase() === "style") { out.push(`style=${styleObject(value)}`); continue; }
    out.push(`${attrName(name)}="${value}"`);
  }
  return out.length ? " " + out.join(" ") : "";
}

function toJsx(html) {
  let out = "";
  let i = 0;
  const tag = /<!--([\s\S]*?)-->|<\/?([A-Za-z][\w:-]*)((?:\s+[^\s=>\/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'>]+))?)*)\s*(\/?)>/g;
  let m;
  while ((m = tag.exec(html))) {
    out += text(html.slice(i, m.index));
    i = m.index + m[0].length;
    if (m[1] !== undefined) { out += `{/*${m[1].replace(/\*\//g, "* /")}*/}`; continue; }
    const closing = m[0].startsWith("</");
    const name = m[2];
    if (closing) { out += `</${name}>`; continue; }
    const attrs = convertAttrs(m[3] || "");
    const selfClosed = m[4] === "/";
    if (selfClosed) out += `<${name}${attrs}/>`;
    else if (VOID.has(name.toLowerCase())) out += `<${name}${attrs} />`;
    else out += `<${name}${attrs}>`;
  }
  out += text(html.slice(i));
  return out;
}

// one pass, or the escape of "{" would itself be re-escaped by the "}" pass
function text(s) { return s.replace(/[{}]/g, (c) => (c === "{" ? "{'{'}" : "{'}'}")); }

function componentFile(name, jsx) {
  const body = jsx.split("\n").map((l) => (l.trim() ? "      " + l : "")).join("\n");
  return `// Generated from index.html by scripts/html-to-jsx.cjs; hand-fixes are\n// allowed after generation, so do not regenerate over a tuned file.\nexport default function ${name}() {\n  return (\n    <>\n${body}\n    </>\n  );\n}\n`;
}

if (require.main === module) {
  const [from, to, name, outFile] = process.argv.slice(2);
  const lines = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8").split(/\r?\n/);
  const slice = lines.slice(Number(from) - 1, Number(to)).join("\n");
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, componentFile(name, toJsx(slice)));
  console.log("wrote", outFile, "from index.html lines", from + "-" + to);
}

module.exports = { toJsx, componentFile };
