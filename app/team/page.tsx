import type { Metadata } from "next";
import { getTeam } from "@/lib/content";
import { SITE_ORIGIN } from "@/lib/site";
import SkipLink from "@/components/SkipLink";
import PageHeader from "@/components/PageHeader";
import PageIntro from "@/components/PageIntro";
import Footer from "@/components/Footer";
import PageBehaviours from "@/components/PageBehaviours";

// The eight leadership bios as a page (11 Sep 2026): on the home page they
// exist only inside the profile dialog. Real, published people, from
// content/team/*.md; the photo classes are the strip's own.
const TITLE = "Our Experts | DigiBlu";
const DESCRIPTION =
  "Meet DigiBlu's leadership team: eight practitioners with client, technology and consultancy backgrounds, leading each practice area from strategy through delivery.";
const URL = `${SITE_ORIGIN}/team`;
const OG = "/assets/og/team.jpg";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { type: "website", siteName: "DigiBlu", title: TITLE, description: DESCRIPTION, url: URL, images: [{ url: OG, width: 1200, height: 630, type: "image/jpeg", alt: "DigiBlu leadership team" }] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: [OG] },
};

export default function TeamPage() {
  const team = getTeam();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: TITLE,
    description: DESCRIPTION,
    url: URL,
    isPartOf: { "@type": "WebSite", name: "DigiBlu", url: SITE_ORIGIN + "/" },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: team.map((m, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: { "@type": "Person", name: m.name, jobTitle: m.role, url: `${URL}#${m.key}`, worksFor: { "@type": "Organization", name: "DigiBlu" } },
      })),
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
            eyebrow="Our Experts"
            title="Meet the leadership team"
            intro="Practitioners with client, technology, and consultancy backgrounds, leading each of our practice areas from strategy through delivery."
          />
          <div className="page-list">
            {team.map((m) => (
              <article className="page-item team-page-item" id={m.key} key={m.key}>
                <span className={`team-modal-photo ${m.cls}`} role="img" aria-label={m.name}></span>
                <div>
                  <h2>{m.name}</h2>
                  <p className="team-modal-role">{m.role}</p>
                  <div className="service-modal-intro" dangerouslySetInnerHTML={{ __html: m.html }} />
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
