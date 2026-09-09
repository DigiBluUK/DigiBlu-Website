import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

// The old <head> of index.html, expressed the Next way. The canonical/OG host
// is the GitHub Pages one the old head carried; it moves to digiblu.com at
// cut-over (Priority 5), in one place.
const SITE = "https://digibluuk.github.io/DigiBlu-Website/";
const TITLE = "DigiBlu | AI and Digital Transformation Consultancy";
const DESCRIPTION =
  "DigiBlu pairs experienced consulting practitioners with deep technical expertise, delivering AI, automation and digital transformation that gets to value fast.";
const SOCIAL =
  "Experienced practitioners with client, technology and consultancy backgrounds. Pragmatic, technology-agnostic partners focused on speed to value.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: SITE },
  openGraph: {
    type: "website",
    siteName: "DigiBlu",
    title: TITLE,
    description: SOCIAL,
    url: SITE,
    images: [
      {
        url: "assets/og-image.jpg",
        width: 1200,
        height: 630,
        type: "image/jpeg",
        alt: "DigiBlu - AI and Digital Transformation Consultancy",
      },
    ],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: SOCIAL, images: ["assets/og-image.jpg"] },
  icons: {
    // SVG first: it carries a prefers-color-scheme query so the tab icon
    // follows the browser's theme. The PNG is the fallback and the touch icon.
    icon: [
      { url: "/assets/favicon.svg", type: "image/svg+xml" },
      { url: "/assets/favicon.png", type: "image/png" },
    ],
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
        <link rel="preload" as="image" href="/assets/hero.svg" type="image/svg+xml" fetchPriority="high" />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
