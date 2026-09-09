// Compares the old site and the Next.js one, both running locally, on the
// counts and text a like-for-like port must keep. Rendering-level checks
// (computed styles, layout) are done in the browser tool per section; this
// is the whole-page gate. Exit code 1 on any difference.
//
// The old page's scripts inject elements at runtime (reader rows, the word
// spans of the narrative, team bios); those never appear in either server
// response, so the comparison is on served HTML, before any script runs.
// node scripts/parity.cjs [oldPath] [newPath] - defaults to the home page;
// e.g. node scripts/parity.cjs /case-studies/sse-ovo.html /case-studies/sse-ovo
// Paths may be given without the leading slash: Git Bash on Windows rewrites
// an argument that starts with "/" into a filesystem path before Node sees
// it (set MSYS_NO_PATHCONV=1 to stop that, or just omit the slash).
const norm = (p) => "/" + p.replace(/^\/+/, "");
const [oldArg = "/", newArg = oldArg] = process.argv.slice(2);
const OLD = (process.env.OLD || "http://localhost:4173") + norm(oldArg);
const NEW = (process.env.NEW || "http://localhost:3000") + norm(newArg);

function stats(html) {
  const body = html.slice(html.indexOf("<body"), html.lastIndexOf("</body>"));
  const noScript = body.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<!--[\s\S]*?-->/g, "");
  const count = (re) => (noScript.match(re) || []).length;
  // React serialises ' as &#x27; where the hand-written HTML had the literal
  // character, so entities are decoded rather than dropped before comparing.
  const ENT = { "&#x27;": "'", "&#39;": "'", "&quot;": '"', "&amp;": "&", "&nbsp;": " ", "&lt;": "<", "&gt;": ">", "&rsquo;": "’", "&mdash;": "—", "&copy;": "©" };
  const text = noScript.replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/gi, (e) => ENT[e.toLowerCase()] ?? " ").replace(/\s+/g, " ").trim();
  return {
    sections: count(/<section\b/g),
    dialogs: count(/class="modal-overlay"/g),
    buttons: count(/<button\b/g),
    anchors: count(/<a\b/g),
    circles: count(/<circle\b/g),
    imgs: count(/<img\b/g),
    headings: count(/<h[1-3]\b/g),
    forms: count(/<form\b/g),
    inputs: count(/<(?:input|textarea|select)\b/g),
    words: text.split(" ").length,
    h1: (noScript.match(/<h1[^>]*>[\s\S]*?<\/h1>/) || [""])[0].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim(),
    text,
  };
}

(async () => {
  const [a, b] = await Promise.all([OLD, NEW].map((u) => fetch(u).then((r) => r.text())));
  const sa = stats(a), sb = stats(b);
  let bad = 0;
  for (const k of Object.keys(sa)) {
    if (k === "text") continue;
    const ok = JSON.stringify(sa[k]) === JSON.stringify(sb[k]);
    if (!ok) bad++;
    console.log((ok ? "  ok  " : " DIFF ") + k.padEnd(9), "old:", JSON.stringify(sa[k]), "new:", JSON.stringify(sb[k]));
  }
  if (sa.text !== sb.text) {
    bad++;
    const wa = sa.text.split(" "), wb = sb.text.split(" ");
    let i = 0; while (i < wa.length && i < wb.length && wa[i] === wb[i]) i++;
    console.log(" DIFF text      first difference at word", i, "\n   old:", wa.slice(Math.max(0, i - 5), i + 8).join(" "), "\n   new:", wb.slice(Math.max(0, i - 5), i + 8).join(" "));
  } else {
    console.log("  ok   text      identical visible text,", sa.words, "words");
  }
  // exitCode, not exit(): a hard exit right after fetch trips a libuv
  // assertion on Windows and reports 127 instead of the verdict
  process.exitCode = bad ? 1 : 0;
})();
