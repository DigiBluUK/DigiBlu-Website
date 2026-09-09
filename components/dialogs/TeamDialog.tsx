// Generated from index.html by scripts/html-to-jsx.cjs; hand-fixes are
// allowed after generation, so do not regenerate over a tuned file.
export default function TeamDialog() {
  return (
    <>
        <div className="modal-overlay" id="teamModal">
          <div className="modal-panel service-panel team-panel" role="dialog" aria-modal="true" aria-labelledby="teamModalName" tabIndex={-1}>
            <button className="modal-close" aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M5 5l14 14M19 5 5 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </button>
            <div className="service-modal-body team-modal-body">
              <span className="team-modal-photo" id="teamModalPhoto" role="img" aria-label=""></span>
              <h2 id="teamModalName"></h2>
              <p className="team-modal-role" id="teamModalRole"></p>
              <p className="service-modal-intro" id="teamModalBio" hidden></p>
            </div>
          </div>
        </div>

    </>
  );
}
