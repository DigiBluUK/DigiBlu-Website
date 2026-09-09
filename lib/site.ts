// The one place the host lives. SITE_ORIGIN is overridable from the
// environment so a preview deployment does not need the value forked; it
// moves to https://digiblu.com at cut-over, here and nowhere else.
export const SITE_ORIGIN = (process.env.SITE_ORIGIN || "https://digibluuk.github.io/DigiBlu-Website").replace(/\/+$/, "");
export const SITE_URL = SITE_ORIGIN + "/";
export const SITE_TITLE = "DigiBlu | AI and Digital Transformation Consultancy";
export const SITE_DESCRIPTION =
  "DigiBlu pairs experienced consulting practitioners with deep technical expertise, delivering AI, automation and digital transformation that gets to value fast.";
export const SITE_SOCIAL =
  "Experienced practitioners with client, technology and consultancy backgrounds. Pragmatic, technology-agnostic partners focused on speed to value.";
