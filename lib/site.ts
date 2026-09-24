// The one place the host lives. SITE_ORIGIN is overridable from the
// environment for a build that must claim a different host. Defaults to
// the production domain since 11 Sep 2026: it was the retired GitHub Pages
// host, which put a dead address in every canonical, share card and JSON-LD
// of any build that forgot the variable (the developer's review saw exactly
// that). Previews are noindex, so a canonical pointing at the live host from
// a preview is correct. www.digiblu.com since 24 Sep 2026: it is the host the
// old site is indexed under (digiblu.com redirects to it), so keeping it
// avoids re-indexing every page under a new host.
export const SITE_ORIGIN = (process.env.SITE_ORIGIN || "https://www.digiblu.com").replace(/\/+$/, "");
export const SITE_URL = SITE_ORIGIN + "/";
export const SITE_TITLE = "DigiBlu | AI and Digital Transformation Consultancy";
export const SITE_DESCRIPTION =
  "DigiBlu pairs experienced consulting practitioners with deep technical expertise, delivering AI, automation and digital transformation that gets to value fast.";
export const SITE_SOCIAL =
  "Experienced practitioners with client, technology and consultancy backgrounds. Pragmatic, technology-agnostic partners focused on speed to value.";

// The site-wide share card. The root layout uses it as every page's
// default, and the home page repeats it with its own url, because a page's
// openGraph replaces the layout's rather than merging with it.
export const SITE_OPEN_GRAPH = {
  type: "website" as const,
  siteName: "DigiBlu",
  title: SITE_TITLE,
  description: SITE_SOCIAL,
  images: [
    {
      url: "assets/og-image.jpg",
      width: 1200,
      height: 630,
      type: "image/jpeg",
      alt: "DigiBlu - AI and Digital Transformation Consultancy",
    },
  ],
};
