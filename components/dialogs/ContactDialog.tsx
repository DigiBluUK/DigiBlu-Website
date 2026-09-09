// Generated from index.html by scripts/html-to-jsx.cjs; hand-fixes are
// allowed after generation, so do not regenerate over a tuned file.
export default function ContactDialog() {
  return (
    <>
        <div className="modal-overlay" id="contactModal">
          <div className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="modalTitle" tabIndex={-1}>
            <button className="modal-close" aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M5 5l14 14M19 5 5 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </button>

            <div className="modal-aside">
              <div>
                <h2 id="modalTitle">Get in touch</h2>
                <p className="modal-sub">Complete these quick steps and a member of our team will be in touch.</p>
              </div>

              <div className="modal-steps">
                <div className="modal-step active" data-step-indicator="1">
                  <span className="step-num">1</span>
                  <span className="step-label">Your details</span>
                </div>
                <div className="modal-step" data-step-indicator="2">
                  <span className="step-num">2</span>
                  <span className="step-label">Your enquiry</span>
                </div>
              </div>
            </div>

            <div className="modal-main">
              <p className="step-counter" id="mm-counter" aria-live="polite">Step 1 of 3</p>
              <h2 id="mm-title">Your details</h2>
              <p className="modal-sub" id="mm-sub">Let us know who we will be speaking with.</p>

              <form className="modal-form" noValidate>
                <div className="form-step active" data-step="1">
                  <div className="modal-field-row">
                    <div className="modal-field">
                      <label htmlFor="cf-first">First Name</label>
                      <input id="cf-first" type="text" autoComplete="given-name" placeholder="e.g. Jane" required />
                    </div>
                    <div className="modal-field">
                      <label htmlFor="cf-last">Last Name</label>
                      <input id="cf-last" type="text" autoComplete="family-name" placeholder="e.g. Smith" required />
                    </div>
                  </div>
                  <div className="modal-field">
                    <label htmlFor="cf-email">Work Email</label>
                    <input id="cf-email" type="email" autoComplete="email" placeholder="jane@company.com" required />
                  </div>
                  <div className="modal-field">
                    <label htmlFor="cf-phone">Phone Number <span className="modal-field-optional">(optional)</span></label>
                    <input id="cf-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="e.g. 07123 456789" />
                  </div>
                </div>

                <div className="form-step" data-step="2">
                  <div className="modal-field">
                    <label htmlFor="cf-company">Company <span className="modal-field-optional">(optional)</span></label>
                    <input id="cf-company" type="text" autoComplete="organization" placeholder="Company name" />
                  </div>
                  <div className="modal-field">
                    <label htmlFor="cf-message">What can we help with? <span className="modal-field-optional">(optional)</span></label>
                    <textarea id="cf-message" rows={3} placeholder="Tell us about your project"></textarea>
                  </div>
                  {/* Consent moved here when the "Schedule a time" step was removed.
                       It is a legal gate rather than a data field, so it has to live on
                       whichever step is last: currentStepIsValid() is what blocks
                       submission on it, and it only checks the step being left. */}
                  <div className="modal-field modal-consent">
                    <label className="modal-checkbox">
                      <input type="checkbox" id="cf-consent" required />
                      <span>I agree to DigiBlu's <a href="legal/privacy-policy.html" data-legal="privacy" target="_blank" rel="noopener">Privacy Policy</a> and consent to being contacted about my enquiry.</span>
                    </label>
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="modal-back" hidden>Back</button>
                  <button type="button" className="modal-next">Next</button>
                  <button type="submit" className="modal-submit" hidden>Send request</button>
                </div>

              </form>

              <div className="modal-success" role="status">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="tickBrand" gradientUnits="userSpaceOnUse" x1="2" y1="2" x2="22" y2="22"><stop offset="0" className="gb1"/><stop offset="0.55" className="gb2"/><stop offset="1" className="gb3"/></linearGradient></defs><circle cx="12" cy="12" r="10" stroke="url(#tickBrand)" strokeWidth="1.6"/><path d="M8 12.5l2.5 2.5L16 9.5" stroke="url(#tickBrand)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <h2>Request sent</h2>
                <p>Thanks for reaching out. A member of the DigiBlu team will be in touch shortly.</p>
                <button type="button" className="modal-done">Done</button>
              </div>
            </div>
          </div>
        </div>

    </>
  );
}
