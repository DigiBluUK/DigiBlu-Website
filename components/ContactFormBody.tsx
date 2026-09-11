// The contact form's markup, shared by the home page's dialog
// (components/dialogs/ContactDialog.tsx) and the /contact page
// (app/contact/page.tsx) since 11 Sep 2026: one form, two containers, the
// same script (components/behaviours/ContactForm.jsx) wiring whichever is
// on the page. Generated from index.html originally; hand-tuned since.
//
// heading: the dialog titles itself with an h2 (the page behind it owns
// the h1); on /contact this title is the page's h1.
export default function ContactFormBody({ heading = "h2" }: { heading?: "h1" | "h2" }) {
  const Heading = heading;
  return (
    <>
      <div className="modal-aside">
        <div>
          <Heading id="modalTitle">Get in touch</Heading>
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
        <p className="step-counter" id="mm-counter" aria-live="polite">Step 1 of 2</p>
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
                <span>I agree to DigiBlu's <a href="/legal/privacy-policy" data-legal="privacy" target="_blank" rel="noopener">Privacy and Cookies Policy</a> and consent to being contacted about my enquiry.</span>
              </label>
            </div>
            {/* Cloudflare Turnstile renders here when step 2 opens (explicit
                 render from ContactForm.jsx, site key from the build; 11 Sep
                 2026). Empty when no site key is configured. */}
            <div className="modal-field modal-turnstile"><div id="cf-turnstile"></div></div>
            {/* Honeypot: off-screen, never shown, never filled by a person;
                 the API rejects anything with a value in it. */}
            <div className="cf-hp" aria-hidden="true">
              <label htmlFor="cf-website">Website</label>
              <input id="cf-website" type="text" tabIndex={-1} autoComplete="off" />
            </div>
          </div>

          <p className="modal-error" id="cf-error" role="alert" hidden></p>

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
    </>
  );
}
