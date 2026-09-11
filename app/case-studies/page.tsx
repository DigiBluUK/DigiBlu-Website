import type { Metadata } from "next";
import { getCaseStudies } from "@/lib/content";
import { SITE_ORIGIN } from "@/lib/site";
import SkipLink from "@/components/SkipLink";
import PageHeader from "@/components/PageHeader";
import PageIntro from "@/components/PageIntro";
import Footer from "@/components/Footer";
import PageBehaviours from "@/components/PageBehaviours";

// The index of every case study as a page (11 Sep 2026). Each case study
// had its own page already; the list of them existed only inside the
// reader dialog, filled by script, so a crawler on the home page found the
// three featured links and nothing else. The home page's "View all" links
// here and still opens the reader on a plain click. The rows are the
// reader's own row style, as real links.
const TITLE = "Case Studies | DigiBlu";
const DESCRIPTION =
  "Ten client engagements where DigiBlu's work made a measurable difference, across energy, healthcare, travel, manufacturing, finance and the public sector.";
const URL = `${SITE_ORIGIN}/case-studies`;
const OG = "/assets/og/case-studies.jpg";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { type: "website", siteName: "DigiBlu", title: TITLE, description: DESCRIPTION, url: URL, images: [{ url: OG, width: 1200, height: 630, type: "image/jpeg", alt: "DigiBlu case studies" }] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: [OG] },
};

export default function CaseStudiesIndexPage() {
  const caseStudies = getCaseStudies();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: TITLE,
    description: DESCRIPTION,
    url: URL,
    isPartOf: { "@type": "WebSite", name: "DigiBlu", url: SITE_ORIGIN + "/" },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: caseStudies.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.title, url: `${SITE_ORIGIN}/case-studies/${c.key}` })),
    },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SkipLink target="#detail-content" />
      <PageHeader />
      <main>
        <div className="detail-page" id="detail-content">
          <PageIntro
            eyebrow="Case Studies"
            title="Where our work has made a difference"
            intro="Every engagement we publish, with the client, the sector and what changed. Each opens as its own page."
          />
          <div className="case-index-list page-case-list">
            {caseStudies.map((c) => (
              <a className="case-index-item" href={`/case-studies/${c.key}`} key={c.key}>
                <span>
                  <span className="case-index-client" style={{ display: "block" }}>
                    {c.client} · {c.service}
                  </span>
                  <span className="case-index-title" style={{ display: "block" }}>
                    {c.title}
                  </span>
                </span>
                <span className="case-index-go" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h14m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              </a>
            ))}
          </div>
        </div>
      </main>
      <Footer standalone />
      <PageBehaviours />
    </>
  );
}
