// Generated from index.html by scripts/html-to-jsx.cjs; hand-fixes are
// allowed after generation, so do not regenerate over a tuned file.
export default function BadgeDialog() {
  return (
    <>
        <div className="modal-overlay" id="badgeModal">
          <div className="modal-panel service-panel badge-panel" role="dialog" aria-modal="true" aria-labelledby="badgeModalTitle" tabIndex={-1}>
            <button className="modal-close" aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M5 5l14 14M19 5 5 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </button>
            <div className="service-modal-body badge-modal-body">
              <div className="badge-modal-visual-wrap" id="badgeModalVisualWrap">
                <img id="badgeModalVisual" alt="" />
              </div>
              {/* No eyebrow pill here. It read "Accreditation", which the badge
                   title below already says, and being forced to display:block in
                   this centred body it stretched full width and sat visibly
                   off-axis against the centred artwork and heading. */}
              <h2 id="badgeModalTitle"></h2>
              <p className="service-modal-intro" id="badgeModalDesc"></p>
            </div>
          </div>
        </div>

        {/* Team member profile, opened from the Our Experts strip — same pattern
             as the accreditation chips opening #badgeModal. Reuses .service-panel
             and the badge modal's centred visual treatment.

             The bio paragraph is omitted entirely when a member has no bio text:
             digiblu.com publishes only name and job title for these people, so
             bios have to come from DigiBlu rather than be written here. */}
    </>
  );
}
