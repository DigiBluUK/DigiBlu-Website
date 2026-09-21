import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { SITE_URL as SITE, SITE_TITLE as TITLE, SITE_DESCRIPTION as DESCRIPTION, SITE_SOCIAL as SOCIAL, SITE_OPEN_GRAPH } from "@/lib/site";
import { CONSENT_DEFAULT_SCRIPT } from "@/lib/consent/gtag";
import Consent from "@/components/consent/Consent";

// The site-wide <head>. The host and the site-wide strings live in
// lib/site.ts, shared with the routes, the sitemap and robots. No canonical
// or og:url here (21 Sep 2026): every page, the 404 included, inherits the
// layout's metadata, and those two named the home page; app/page.tsx sets
// its own, like every other route.

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: SITE_OPEN_GRAPH,
  twitter: { card: "summary_large_image", title: TITLE, description: SOCIAL, images: ["assets/og-image.jpg"] },
  icons: {
    // The dark mark on a white rounded plate, one look in both themes
    // (10 Sep 2026). SVG first; the PNG is the fallback and the
    // touch icon; the ICO carries 16/32/48/256 for the browsers and the
    // Windows taskbar that still ask for /favicon.ico.
    icon: [
      { url: "/assets/favicon.svg", type: "image/svg+xml" },
      { url: "/assets/favicon.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/assets/favicon.png",
  },
};

export const viewport: Viewport = { themeColor: "#000000" };

const ORG = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "DigiBlu",
  legalName: "DigiBlu UK Limited",
  url: SITE,
  logo: SITE + "assets/logo.png",
  image: SITE + "assets/og-image.jpg",
  description: DESCRIPTION,
  address: {
    "@type": "PostalAddress",
    streetAddress: "First Floor, Steeple House, Church Lane",
    addressLocality: "Chelmsford",
    addressRegion: "Essex",
    postalCode: "CM1 1NH",
    addressCountry: "GB",
  },
  sameAs: ["https://uk.linkedin.com/company/digiblu"],
};

// Runs before first paint so an explicit theme choice does not flash. Only
// an explicit choice is stamped; with none stored the CSS media query decides,
// so an external theme control is not overridden on load.
const THEME_INIT =
  "(function(){var s=null;try{s=localStorage.getItem('digiblu-theme')}catch(e){}if(s==='light'||s==='dark'){document.documentElement.setAttribute('data-theme',s)}})();";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // suppressHydrationWarning: THEME_INIT may stamp data-theme on <html>
    // before React hydrates, and that attribute is not in the server markup.
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Consent Mode defaults first: everything Google denied before any
            Google code could run. The consent manager updates them later. */}
        <script dangerouslySetInnerHTML={{ __html: CONSENT_DEFAULT_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG) }} />
      </head>
      <body>
        {children}
        <Consent />
      </body>
    </html>
  );
}
