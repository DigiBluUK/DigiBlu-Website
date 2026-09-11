import type { Metadata } from "next";
import { getAccreditations } from "@/lib/content";
import { SITE_ORIGIN } from "@/lib/site";
import SkipLink from "@/components/SkipLink";
import PageHeader from "@/components/PageHeader";
import PageIntro from "@/components/PageIntro";
import Footer from "@/components/Footer";
import PageBehaviours from "@/components/PageBehaviours";

// The six certifications with their descriptions and marks as a page
// (11 Sep 2026): on the home page they exist only inside the badge dialog
// the strip's chips open. The chips link here (/accreditations#key).
const TITLE = "Accreditations and Certifications | DigiBlu";
const DESCRIPTION =
  "The six certifications DigiBlu holds and what each means: ISO 9001, 14001, 27001 and 42001, Cyber Essentials Plus, and UK Government G-Cloud approved supplier.";
const URL = `${SITE_ORIGIN}/accreditations`;
const OG = "/assets/og/accreditations.jpg";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { type: "website", siteName: "DigiBlu", title: TITLE, description: DESCRIPTION, url: URL, images: [{ url: OG, width: 1200, height: 630, type: "image/jpeg", alt: "DigiBlu accreditations and certifications" }] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: [OG] },
};

export default function AccreditationsPage() {
  const accreditations = getAccreditations();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: TITLE,
    description: DESCRIPTION,
    url: URL,
    isPartOf: { "@type": "WebSite", name: "DigiBlu", url: SITE_ORIGIN + "/" },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: accreditations.map((a, i) => ({ "@type": "ListItem", position: i + 1, name: a.title, url: `${URL}#${a.key}` })),
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
            eyebrow="Accredited & certified"
            title="Our accreditations"
            intro="Independent certifications that cover how we manage quality, the environment, information security and AI, and confirm our status as an approved government supplier."
          />
          <div className="page-list">
            {accreditations.map((a) => (
              <article className="page-item accred-page-item" id={a.key} key={a.key}>
                <div className={"badge-modal-visual-wrap accred-page-visual" + (a.onDark ? " on-dark-plate" : "")}>
                  <img src={a.img} alt={`${a.title} certification mark`} decoding="async" />
                </div>
                <div>
                  <h2>{a.title}</h2>
                  <div className="service-modal-intro" dangerouslySetInnerHTML={{ __html: a.html }} />
                </div>
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
