// Generated from index.html by scripts/html-to-jsx.cjs; hand-fixes are
// allowed after generation, so do not regenerate over a tuned file.
export default function ServiceDialog() {
  return (
    <>
        <div className="modal-overlay" id="serviceModal">
          <div className="modal-panel service-panel" role="dialog" aria-modal="true" aria-labelledby="svcTitle" tabIndex={-1}>
            <button className="modal-close" aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M5 5l14 14M19 5 5 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </button>
            <div className="service-modal-body">
              <span className="pill service-modal-eyebrow" id="svcEyebrow">Service 01</span>
              <h2 id="svcTitle">Artificial Intelligence</h2>
              <p className="service-modal-intro" id="svcIntro"></p>
              <div className="service-modal-list" id="svcList"></div>
              <div className="service-modal-footer">
                <button type="button" className="faq-cta-btn js-contact-open">
                  <span className="arrow-badge">
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h14m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                  Discuss this service
                </button>
              </div>
            </div>
          </div>
        </div>

    </>
  );
}
