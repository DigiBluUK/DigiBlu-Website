// The one place the host lives. SITE_ORIGIN is overridable from the
// environment for a build that must claim a different host. Defaults to
// the production domain since 11 Sep 2026: it was the retired GitHub Pages
// host, which put a dead address in every canonical, share card and JSON-LD
// of any build that forgot the variable (the developer's review saw exactly
// that). Previews are noindex, so a canonical pointing at digiblu.com from
// a preview is correct.
export const SITE_ORIGIN = (process.env.SITE_ORIGIN || "https://digiblu.com").replace(/\/+$/, "");
export const SITE_URL = SITE_ORIGIN + "/";
export const SITE_TITLE = "DigiBlu | AI and Digital Transformation Consultancy";
export const SITE_DESCRIPTION =
  "DigiBlu pairs experienced consulting practitioners with deep technical expertise, delivering AI, automation and digital transformation that gets to value fast.";
export const SITE_SOCIAL =
  "Experienced practitioners with client, technology and consultancy backgrounds. Pragmatic, technology-agnostic partners focused on speed to value.";
