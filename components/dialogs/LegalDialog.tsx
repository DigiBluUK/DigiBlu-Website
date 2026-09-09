// Generated from index.html by scripts/html-to-jsx.cjs; hand-fixes are
// allowed after generation, so do not regenerate over a tuned file.
export default function LegalDialog() {
  return (
    <>
        <div className="modal-overlay" id="legalModal">
          <div className="modal-panel service-panel" role="dialog" aria-modal="true" aria-labelledby="legalModalTitle" tabIndex={-1}>
            <button className="modal-close" aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M5 5l14 14M19 5 5 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </button>
            <div className="service-modal-body">
              <span className="pill service-modal-eyebrow">Legal</span>
              <h2 id="legalModalTitle"></h2>
              <p className="service-modal-intro" id="legalModalIntro"></p>
              <div className="service-modal-list" id="legalModalList"></div>
              <div className="service-modal-footer">
              </div>
            </div>
          </div>
        </div>
    </>
  );
}
