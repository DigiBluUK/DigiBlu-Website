import type { Metadata } from "next";
import { getServices } from "@/lib/content";
import { SITE_ORIGIN } from "@/lib/site";
import SkipLink from "@/components/SkipLink";
import PageHeader from "@/components/PageHeader";
import PageIntro from "@/components/PageIntro";
import Markdown from "@/components/Markdown";
import Footer from "@/components/Footer";
import PageBehaviours from "@/components/PageBehaviours";

// Every service in full on one page (the developer's review of 11 Sep 2026:
// the write-ups existed only inside the Learn more dialog, which nothing can
// crawl). The home page's cards and the footer link here (/services#key),
// and the dialog still opens on a plain click there. Numbered in card order,
// which is the content order since the same day.
const TITLE = "Services | DigiBlu";
const DESCRIPTION =
  "DigiBlu's six services in full: Artificial Intelligence, Opportunity Discovery, Process Excellence, Digital Solutions, Target Operating Model and Managed Services.";
const URL = `${SITE_ORIGIN}/services`;
const OG = "/assets/og/services.jpg";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { type: "website", siteName: "DigiBlu", title: TITLE, description: DESCRIPTION, url: URL, images: [{ url: OG, width: 1200, height: 630, type: "image/jpeg", alt: "DigiBlu services" }] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: [OG] },
};

export default function ServicesPage() {
  const services = getServices();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: TITLE,
    description: DESCRIPTION,
    url: URL,
    isPartOf: { "@type": "WebSite", name: "DigiBlu", url: SITE_ORIGIN + "/" },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: services.map((s, i) => ({ "@type": "ListItem", position: i + 1, name: s.title, url: `${URL}#${s.key}` })),
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
            eyebrow="Services"
            title="How we help you move forward"
            intro="Six ways we work with clients, from finding the opportunity to running what we build. Each is described in full below."
          />
          <div className="page-list">
            {services.map((s, i) => (
              <article className="page-item" id={s.key} key={s.key}>
                <span className="pill service-modal-eyebrow">Service {String(i + 1).padStart(2, "0")}</span>
                <h2>{s.title}</h2>
                <p className="service-modal-intro">{s.intro}</p>
                <div className="service-modal-list">
                  <Markdown sections={s.sections} itemClass="service-modal-item" />
                </div>
                <a className="faq-cta-btn" href="/#contact">
                  <span className="arrow-badge">
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h14m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                  Discuss this service
                </a>
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer standalone />
      <PageBehaviours />
    </>
  );
}
