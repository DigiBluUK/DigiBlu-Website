import type { Metadata } from "next";
import SkipLink from "@/components/SkipLink";
import PageHeader from "@/components/PageHeader";
import BackLink from "@/components/BackLink";
import Footer from "@/components/Footer";
import PageBehaviours from "@/components/PageBehaviours";

// The site's own 404, in the standalone pages' chrome, in place of Next's
// bare default. Prerendered like everything else.
export const metadata: Metadata = { title: "Page not found | DigiBlu", robots: { index: false, follow: false } };

export default function NotFound() {
  return (
    <>
      <SkipLink target="#detail-content" />
      <PageHeader />
      <main>
        <div className="detail-page" id="detail-content">
          <BackLink />
          <span className="pill service-modal-eyebrow">404</span>
          <h1>That page is not here</h1>
          <p className="service-modal-intro">
            The address may be out of date or mistyped. Everything on the site is reachable from the home page: our services, case studies, who we
            are and how to get in touch.
          </p>
        </div>
      </main>
      <Footer standalone />
      <PageBehaviours />
    </>
  );
}
