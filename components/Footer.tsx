// Generated from index.html by scripts/html-to-jsx.cjs; hand-fixes are
// allowed after generation, so do not regenerate over a tuned file.
export default function Footer() {
  return (
    <>
        <footer>
          <div className="footer-inner">
            <div className="footer-brand">
              <div className="footer-logo">
                <span className="logo-mark" role="img" aria-label="DigiBlu"></span>
              </div>
              <p className="footer-desc">Experienced practitioners with client, technology, and consultancy backgrounds, working as pragmatic, technology-agnostic partners focused on speed to value.</p>
              <p className="footer-address">DigiBlu UK Limited, First Floor, Steeple House, Church Lane, Chelmsford, CM1 1NH, United Kingdom.</p>
              <div className="footer-socials">
                <a href="https://uk.linkedin.com/company/digiblu" target="_blank" rel="noopener" aria-label="DigiBlu on LinkedIn">
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M6.94 8.5H4.06V19h2.88V8.5ZM5.5 4a1.67 1.67 0 1 0 0 3.33A1.67 1.67 0 0 0 5.5 4ZM19.94 19h-2.87v-5.63c0-1.34-.03-3.07-1.87-3.07-1.87 0-2.16 1.46-2.16 2.97V19H10.2V8.5h2.76v1.43h.04c.38-.73 1.32-1.5 2.72-1.5 2.9 0 3.44 1.91 3.44 4.4V19Z"/></svg>
                </a>
              </div>
            </div>

            {/* Every footer link now stays inside this single-page site rather than
                 navigating to the real digiblu.com: Company links are in-page
                 anchors matching the header nav's own section IDs, Services links
                 open the same #serviceModal as the "Learn more" buttons on the
                 Services cards, and Legal links open #legalModal with condensed,
                 real policy content plus a link out to the authoritative page. */}
            <div className="footer-cols">
              <div className="footer-col">
                <h4>Services</h4>
                <ul>
                  <li><button type="button" data-service="ai">Artificial Intelligence</button></li>
                  <li><button type="button" data-service="discovery">Opportunity Discovery</button></li>
                  <li><button type="button" data-service="process">Process Excellence</button></li>
                  <li><button type="button" data-service="digital">Digital Solutions</button></li>
                  <li><button type="button" data-service="tom">Target Operating Model</button></li>
                  <li><button type="button" data-service="post">Managed Services</button></li>
                </ul>
              </div>

              <div className="footer-col">
                <h4>Company</h4>
                <ul>
                  <li><a href="#hero-content">Home</a></li>
                  <li><a href="#case-studies">Case Studies</a></li>
                  <li><a href="#about">About Us</a></li>
                      <li><button type="button" className="js-contact-open">Contact Us</button></li>
                </ul>
              </div>

              <div className="footer-col">
                <h4>Legal</h4>
                <ul>
                  <li><a href="legal/website-terms-of-use.html" data-legal="terms">Terms of Use</a></li>
                  <li><a href="legal/privacy-policy.html" data-legal="privacy">Privacy Policy</a></li>
                  <li><a href="legal/modern-slavery-policy.html" data-legal="slavery">Modern Slavery Policy</a></li>
                  <li><a href="legal/carbon-reduction-plan.html" data-legal="carbon">Carbon Reduction Plan</a></li>
                  <li><a href="legal/armed-forces-covenant.html" data-legal="armed-forces">Armed Forces Covenant</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="footer-bottom">&copy; DigiBlu UK Limited 2026. All rights reserved.</div>
        </footer>
    </>
  );
}
