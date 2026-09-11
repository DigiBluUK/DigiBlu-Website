// Generated from index.html by scripts/html-to-jsx.cjs; hand-fixes are
// allowed after generation, so do not regenerate over a tuned file.
export default function Accreditations() {
  return (
    <>
        <section className="accred" aria-labelledby="accredLabel">
          <div className="accred-inner">
            <p className="accred-label" id="accredLabel">Accredited &amp; certified</p>
            {/* Auto-scrolling single line, same mechanism as the Clients carousel
                 below: two identical groups animated to -50% so the loop is
                 seamless. Only the first group is in the accessibility tree and the
                 tab order; the duplicate is aria-hidden with tabindex="-1" so it
                 stays clickable (the strip moves, so whichever copy happens to be
                 under the cursor is arbitrary) without doubling the tab stops or
                 announcing every certification twice. */}
            <div className="accred-viewport">
              <div className="accred-track">
                <ul className="accred-group">
                  <li><a href="/accreditations#9001" className="accred-chip" data-badge="9001">
                    <span className="accred-chip-name">ISO 9001</span>
                    <span className="accred-chip-desc">Quality Management</span>
                  </a></li>
                  <li><a href="/accreditations#14001" className="accred-chip" data-badge="14001">
                    <span className="accred-chip-name">ISO 14001</span>
                    <span className="accred-chip-desc">Environmental Management</span>
                  </a></li>
                  <li><a href="/accreditations#27001" className="accred-chip" data-badge="27001">
                    <span className="accred-chip-name">ISO 27001</span>
                    <span className="accred-chip-desc">Information Security</span>
                  </a></li>
                  <li><a href="/accreditations#42001" className="accred-chip" data-badge="42001">
                    <span className="accred-chip-name">ISO/IEC 42001</span>
                    <span className="accred-chip-desc">AI Management</span>
                  </a></li>
                  <li><a href="/accreditations#cyber" className="accred-chip" data-badge="cyber">
                    <span className="accred-chip-name">Cyber Essentials Plus</span>
                    <span className="accred-chip-desc">Cyber Security</span>
                  </a></li>
                  <li><a href="/accreditations#gcloud" className="accred-chip" data-badge="gcloud">
                    <span className="accred-chip-name">UK Government G-Cloud</span>
                    <span className="accred-chip-desc">Approved Supplier</span>
                  </a></li>
                </ul>
                <ul className="accred-group" aria-hidden="true">
                  <li><a href="/accreditations#9001" className="accred-chip" data-badge="9001" tabIndex={-1}>
                    <span className="accred-chip-name">ISO 9001</span>
                    <span className="accred-chip-desc">Quality Management</span>
                  </a></li>
                  <li><a href="/accreditations#14001" className="accred-chip" data-badge="14001" tabIndex={-1}>
                    <span className="accred-chip-name">ISO 14001</span>
                    <span className="accred-chip-desc">Environmental Management</span>
                  </a></li>
                  <li><a href="/accreditations#27001" className="accred-chip" data-badge="27001" tabIndex={-1}>
                    <span className="accred-chip-name">ISO 27001</span>
                    <span className="accred-chip-desc">Information Security</span>
                  </a></li>
                  <li><a href="/accreditations#42001" className="accred-chip" data-badge="42001" tabIndex={-1}>
                    <span className="accred-chip-name">ISO/IEC 42001</span>
                    <span className="accred-chip-desc">AI Management</span>
                  </a></li>
                  <li><a href="/accreditations#cyber" className="accred-chip" data-badge="cyber" tabIndex={-1}>
                    <span className="accred-chip-name">Cyber Essentials Plus</span>
                    <span className="accred-chip-desc">Cyber Security</span>
                  </a></li>
                  <li><a href="/accreditations#gcloud" className="accred-chip" data-badge="gcloud" tabIndex={-1}>
                    <span className="accred-chip-name">UK Government G-Cloud</span>
                    <span className="accred-chip-desc">Approved Supplier</span>
                  </a></li>
                </ul>
              </div>
            </div>
          </div>
        </section>
    </>
  );
}
