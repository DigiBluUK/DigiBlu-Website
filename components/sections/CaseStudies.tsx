import { getCaseStudies } from "@/lib/content";

// Generated from index.html by scripts/html-to-jsx.cjs; hand-fixes are
// allowed after generation, so do not regenerate over a tuned file. The
// three cards are authored here (their tags and blurbs are not in the
// content); pages.test.cjs checks they are the content's featured three, in
// order. The count is the content's, so a new case study updates it.
export default function CaseStudies() {
  return (
    <>
        <section className="cases" id="case-studies">
          <div className="cases-inner">
          <span className="pill">Case Studies</span>
          <h2>Where our work<br />has made a difference</h2>

          {/* Real client engagements, sourced from digiblu.com/case-studies. The
               three shown here are the featured set; the full list is on
               /case-studies, which "View all" links to. */}

          <div className="case-list">
            <article className="case">
              <div className="case-grid">
                <div>
                <span className="case-client">SSE / OVO</span>
                <h3 className="case-headline">Automating complicated customer service interactions</h3>
                </div>
                <div>
                  <p className="case-body">As energy bills climbed, so did call volumes. We built virtual agents that handle Direct Debit reviews and collections conversations end to end - across QR codes, URLs and WhatsApp - so customers can resolve arrears without waiting to speak to anyone.</p>
                  <div className="case-tags">
                    <span className="case-tag">350% forecast ROI</span>
                    <span className="case-tag">Under half the cost per transaction</span>
                    <span className="case-tag">100% policy compliant</span>
                  </div>
                  <a href="/case-studies/sse-ovo" className="case-read-more">
                    Read more<span className="sr-only">: automating complicated customer service interactions</span>
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h14m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </a>
                </div>
              </div>
            </article>

            <article className="case">
              <div className="case-grid">
                <div>
                <span className="case-client">Safari Destinations</span>
                <h3 className="case-headline">Building a strategic partnership for AI transformation</h3>
                </div>
                <div>
                  <p className="case-body">Supplier rates, traveller information and management reporting ran on email, spreadsheets and manual data entry. As AI transformation partner to Safari Destinations we digitised those processes, replaced Excel reporting with business intelligence, and now run a managed service that keeps improving them.</p>
                  <div className="case-tags">
                    <span className="case-tag">AI transformation partnership</span>
                    <span className="case-tag">Multiple processes digitised</span>
                    <span className="case-tag">Ongoing managed service</span>
                  </div>
                  <a href="/case-studies/safari-destinations" className="case-read-more">
                    Read more<span className="sr-only">: building a strategic partnership for AI transformation</span>
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h14m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </a>
                </div>
              </div>
            </article>

            <article className="case">
              <div className="case-grid">
                <div>
                <span className="case-client">AssuranceSD</span>
                <h3 className="case-headline">Transforming FMS services with digital onboarding</h3>
                </div>
                <div>
                  <p className="case-body">Applying for government funding ran on paper, and it was hardest on the elderly and disabled applicants it exists to help. We built a secure web application with Jotform forms and e-signatures, so applications are completed and signed online with fewer errors and faster approvals.</p>
                  <div className="case-tags">
                    <span className="case-tag">Paper-free applications</span>
                    <span className="case-tag">Fewer errors and resubmissions</span>
                    <span className="case-tag">Multi-state US coverage</span>
                  </div>
                  <a href="/case-studies/assurancesd" className="case-read-more">
                    Read more<span className="sr-only">: transforming FMS services with digital onboarding</span>
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h14m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </a>
                </div>
              </div>
            </article>
          </div>

          <div className="cases-actions">
            {/* A real link to the index page since 11 Sep 2026; the reader
                 dialog it used to open was removed on 18 Sep 2026. */}
            <a href="/case-studies" className="case-viewall-btn">
              View all case studies
              <span className="case-count">{`(${getCaseStudies().length})`}</span>
            </a>
          </div>
          </div>
        </section>
    </>
  );
}
