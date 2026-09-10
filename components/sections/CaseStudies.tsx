// Generated from index.html by scripts/html-to-jsx.cjs; hand-fixes are
// allowed after generation, so do not regenerate over a tuned file.
export default function CaseStudies() {
  return (
    <>
        <section className="cases" id="case-studies">
          <div className="cases-inner">
          <span className="pill">Case Studies</span>
          <h2>Where our work<br />has made a difference</h2>

          {/* Real client engagements, sourced from digiblu.com/case-studies. The
               three shown here are the featured set; the full nine live in the
               CASE_STUDIES object in the script below and open via "View all". */}

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
                  <a href="/case-studies/sse-ovo" className="case-read-more" data-case="sse-ovo">
                    Read more
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
                  <a href="/case-studies/assurancesd" className="case-read-more" data-case="assurancesd">
                    Read more
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h14m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </a>
                </div>
              </div>
            </article>

            <article className="case">
              <div className="case-grid">
                <div>
                <span className="case-client">National mobility solutions provider</span>
                <h3 className="case-headline">Automating supplier quote processing with Generative AI</h3>
                </div>
                <div>
                  <p className="case-body">Supplier quotations arrive in every format, and each one had to be read, matched against the original specification and resolved by hand. We combined Generative AI, document processing and workflow automation so routine cases resolve themselves within defined business rules, with exceptions routed to a purpose-built reconciliation app for human review.</p>
                  <div className="case-tags">
                    <span className="case-tag">AI-powered quote processing</span>
                    <span className="case-tag">End-to-end automation</span>
                    <span className="case-tag">Human-in-the-loop exceptions</span>
                  </div>
                  <a href="/case-studies/quote-processing" className="case-read-more" data-case="quote-processing">
                    Read more
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h14m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </a>
                </div>
              </div>
            </article>
          </div>

          <div className="cases-actions">
            <button type="button" className="case-viewall-btn" id="caseViewAll">
              View all case studies
              <span className="case-count">(9)</span>
            </button>
          </div>
          </div>
        </section>
    </>
  );
}
