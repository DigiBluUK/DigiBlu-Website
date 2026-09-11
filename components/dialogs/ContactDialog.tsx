import ContactFormBody from "@/components/ContactFormBody";

// The contact dialog on the home page: the overlay, the panel and the
// close button around the shared form markup (components/ContactFormBody.tsx,
// which /contact renders too since 11 Sep 2026). Generated from index.html
// by scripts/html-to-jsx.cjs originally; hand-fixes are allowed.
export default function ContactDialog() {
  return (
    <>
        <div className="modal-overlay" id="contactModal">
          <div className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="modalTitle" tabIndex={-1}>
            <button className="modal-close" aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M5 5l14 14M19 5 5 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </button>
            <ContactFormBody heading="h2" />
          </div>
        </div>

    </>
  );
}
