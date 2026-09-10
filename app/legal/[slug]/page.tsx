import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLegalDoc, getLegalDocs } from "@/lib/content";
import { SITE_ORIGIN } from "@/lib/site";
import SkipLink from "@/components/SkipLink";
import PageHeader from "@/components/PageHeader";
import BackLink from "@/components/BackLink";
import Markdown from "@/components/Markdown";
import Footer from "@/components/Footer";
import PageBehaviours from "@/components/PageBehaviours";

// One static page per legal document, from content/legal/*.md. The slugs
// are DigiBlu's own (privacy-policy, not the terse internal keys).
export const dynamicParams = false;

export function generateStaticParams() {
  return getLegalDocs().map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const d = getLegalDoc((await params).slug);
  if (!d) return {};
  const title = `${d.title} | DigiBlu`;
  const url = `${SITE_ORIGIN}/legal/${d.slug}`;
  // description is the front-matter summary of the document; intro is the
  // "Last updated ..." line shown on the page, which is no description of
  // anything in a search result (found in the 10 Sep 2026 metadata review).
  const description = d.description || d.intro;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", siteName: "DigiBlu", title, description, url },
  };
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const d = getLegalDoc((await params).slug);
  if (!d) notFound();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: d.title,
    description: d.description || d.intro,
    url: `${SITE_ORIGIN}/legal/${d.slug}`,
    isPartOf: { "@type": "WebSite", name: "DigiBlu", url: SITE_ORIGIN + "/" },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SkipLink target="#detail-content" />
      <PageHeader />
      <main>
        <div className="detail-page" id="detail-content">
          <BackLink />
          <span className="pill service-modal-eyebrow">Legal</span>
          <h1>{d.title}</h1>
          <p className="service-modal-intro">{d.intro}</p>
          <div className="service-modal-list">
            <Markdown sections={d.sections} itemClass="service-modal-item" />
          </div>
        </div>
      </main>
      <Footer standalone />
      <PageBehaviours />
    </>
  );
}
