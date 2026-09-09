import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCaseStudies, getCaseStudy } from "@/lib/content";
import { SITE_ORIGIN } from "@/lib/site";
import SkipLink from "@/components/SkipLink";
import PageHeader from "@/components/PageHeader";
import BackLink from "@/components/BackLink";
import Markdown from "@/components/Markdown";
import Footer from "@/components/Footer";

// One static page per case study, from content/case-studies/*.md; the
// markup is generate-static-pages.js's renderCaseStudy, converted.
export const dynamicParams = false;

export function generateStaticParams() {
  return getCaseStudies().map((c) => ({ key: c.key }));
}

// The old generator's truncate(): the overview to 155 characters on a word
// boundary, for the meta description and the JSON-LD.
const description = (overviewHtml: string) => {
  const text = overviewHtml.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  return text.length <= 155 ? text : text.slice(0, 152).replace(/\s+\S*$/, "") + "...";
};

export async function generateMetadata({ params }: { params: Promise<{ key: string }> }): Promise<Metadata> {
  const c = getCaseStudy((await params).key);
  if (!c) return {};
  const title = `${c.title} | DigiBlu Case Studies`;
  const desc = description(c.sections[0].html);
  const url = `${SITE_ORIGIN}/case-studies/${c.key}`;
  const alt = `${c.client} case study - ${c.title}`;
  return {
    title,
    description: desc,
    alternates: { canonical: url },
    openGraph: { type: "website", siteName: "DigiBlu", title, description: desc, url, images: [{ url: c.ogImage, width: 1200, height: 630, type: "image/jpeg", alt }] },
    twitter: { card: "summary_large_image", title, description: desc, images: [c.ogImage] },
  };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ key: string }> }) {
  const c = getCaseStudy((await params).key);
  if (!c) notFound();
  // The art panel's gradient is picked by position in the list, as the
  // reader does, so neighbouring entries never share a panel.
  const i = getCaseStudies().findIndex((x) => x.key === c.key);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: c.title,
    description: description(c.sections[0].html),
    url: `${SITE_ORIGIN}/case-studies/${c.key}`,
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
          <div className="blog-modal-art" aria-hidden="true">
            <div className={`blog-art a${(i % 4) + 1}`}>
              <img className="case-art-photo" src={c.photo} alt="" decoding="async" />
              <span className="case-art-scrim"></span>
            </div>
          </div>
          <span className="pill case-modal-eyebrow">
            {c.sector} · {c.service}
          </span>
          <h1>{c.title}</h1>
          <p className="case-modal-client">{c.client}</p>
          <div className="case-stats">
            {c.stats.map((s) => (
              <div className="case-stat" key={s.l}>
                <b>{s.v}</b>
                <span>{s.l}</span>
              </div>
            ))}
          </div>
          <Markdown sections={c.sections} itemClass="case-section" />
          {c.quote && (
            <figure className="case-modal-quote">
              <p>{c.quote.text}</p>
              <cite>{c.quote.cite}</cite>
            </figure>
          )}
        </div>
      </main>
      <Footer standalone />
    </>
  );
}
