// Consent configuration: the one file to edit when this module is reused on
// another site. Everything site-specific lives here; consent.ts, gtag.ts and
// the components read it and hard-code nothing about DigiBlu.

export type ConsentCategory = "necessary" | "analytics" | "marketing";

export type ConsentConfig = {
  /** Shown in the banner and preferences copy. */
  siteName: string;
  /** GA4 measurement id, or empty to run without analytics at all. Read from
   *  the environment so production and previews can differ; the fallback is
   *  the placeholder from the brief and must be replaced before launch. A
   *  measurement id is not a secret (every visitor's browser sees it), but
   *  keeping it out of the source keeps environments separate. */
  gaMeasurementId: string;
  /** Categories the banner offers. Necessary is always on. Analytics is only
   *  offered when a measurement id is set; marketing stays off until a
   *  marketing service exists, so no category is shown with nothing in it. */
  categories: { analytics: boolean; marketing: boolean };
  /** Where the consent record is kept: local storage (no cookie at all) or a
   *  first-party cookie. Either counts as strictly necessary. */
  storage: { mechanism: "localStorage" | "cookie"; key: string; expiresAfterDays: number };
  /** Bump when the categories or their meaning change: the banner reappears
   *  and asks again. Recorded with every consent so old decisions are not
   *  applied to new categories. */
  revision: number;
  /** Links the banner and preferences point at. */
  privacyPolicyUrl: string;
  cookiePolicyUrl?: string;
  /** Other storage the site uses for its own functioning, listed in the
   *  preferences under Necessary so the disclosure is complete. */
  necessaryStorage: { name: string; where: string; purpose: string; duration: string }[];
  /** How page views are counted. "page-load": one page_view per full page
   *  load (an anchor-navigated single page, or pages linked with plain
   *  anchors). "client-route": also one per client-side route change, for a
   *  site that navigates with next/link. Hash changes are never page views. */
  pageViews: "page-load" | "client-route";
};

export const consentConfig: ConsentConfig = {
  siteName: "DigiBlu",
  // From the environment only, no fallback (10 Sep 2026): the production
  // value (G-RVNLDVSLJ8, the "digiblu.com" web stream) is set in Cloudflare's
  // build variables and in .env.local for local testing. Empty means the
  // banner offers no Analytics category and nothing from Google ever loads,
  // which is what a preview should do; next.config.ts warns at build time
  // so production cannot ship without it unnoticed.
  gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "",
  categories: { analytics: true, marketing: false },
  storage: { mechanism: "localStorage", key: "digiblu_consent", expiresAfterDays: 182 },
  revision: 1,
  privacyPolicyUrl: "/legal/privacy-policy",
  necessaryStorage: [
    { name: "digiblu_consent", where: "Local storage", purpose: "Remembers the cookie choices you make here, so we do not ask again.", duration: "6 months" },
    { name: "digiblu-theme", where: "Local storage", purpose: "Remembers whether you chose the light or dark look. Only set if you use the theme button.", duration: "Until you clear it" },
  ],
  pageViews: "page-load",
};

/** True when analytics is configured and offered. */
export const analyticsEnabled = consentConfig.categories.analytics && Boolean(consentConfig.gaMeasurementId);
