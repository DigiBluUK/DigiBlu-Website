// Generated from index.html by scripts/html-to-jsx.cjs; hand-fixes are
// allowed after generation, so do not regenerate over a tuned file.
export default function Hero() {
  return (
    <>
        <section className="hero">
              <svg className="hero-spark" viewBox="0 0 1672 941" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
            <defs>
              <radialGradient id="heroSparkGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f2f7ff" stopOpacity="0.95"/>
                <stop offset="40%" stopColor="#8fb8ff" stopOpacity="0.55"/>
                <stop offset="100%" stopColor="#8fb8ff" stopOpacity="0"/>
              </radialGradient>
            </defs>
            <g opacity="0">
              <animate attributeName="opacity" dur="24s" begin="0s" repeatCount="indefinite" calcMode="linear" values="0;1;1;0;0" keyTimes="0;0.05;0.55;0.6;1"/>
              <circle r="15" fill="url(#heroSparkGlow)">
                <animateMotion dur="12s" begin="0s" repeatCount="indefinite" calcMode="linear" keyPoints="0;1;0" keyTimes="0;0.5;1" path="M719.9 941L1055 370.1A106 106 0 0 1 1163 319L1672 399.8"/>
              </circle>
              <circle r="3" fill="#f8fbff">
                <animateMotion dur="12s" begin="0s" repeatCount="indefinite" calcMode="linear" keyPoints="0;1;0" keyTimes="0;0.5;1" path="M719.9 941L1055 370.1A106 106 0 0 1 1163 319L1672 399.8"/>
              </circle>
            </g>
            <g opacity="0">
              <animate attributeName="opacity" dur="24s" begin="8s" repeatCount="indefinite" calcMode="linear" values="0;1;1;0;0" keyTimes="0;0.05;0.55;0.6;1"/>
              <circle r="15" fill="url(#heroSparkGlow)">
                <animateMotion dur="12s" begin="-4s" repeatCount="indefinite" calcMode="linear" keyPoints="0;1;0" keyTimes="0;0.5;1" path="M838.4 941L1108 500.9A96.9 96.9 0 0 1 1206.1 455.8L1672 530.9"/>
              </circle>
              <circle r="3" fill="#f8fbff">
                <animateMotion dur="12s" begin="-4s" repeatCount="indefinite" calcMode="linear" keyPoints="0;1;0" keyTimes="0;0.5;1" path="M838.4 941L1108 500.9A96.9 96.9 0 0 1 1206.1 455.8L1672 530.9"/>
              </circle>
            </g>
            <g opacity="0">
              <animate attributeName="opacity" dur="24s" begin="16s" repeatCount="indefinite" calcMode="linear" values="0;1;1;0;0" keyTimes="0;0.05;0.55;0.6;1"/>
              <circle r="15" fill="url(#heroSparkGlow)">
                <animateMotion dur="12s" begin="-7s" repeatCount="indefinite" calcMode="linear" keyPoints="0;1;0" keyTimes="0;0.5;1" path="M478.8 941L951.6 71.5A105.4 105.4 0 0 1 1060.8 17.8L1379 68.7"/>
              </circle>
              <circle r="3" fill="#f8fbff">
                <animateMotion dur="12s" begin="-7s" repeatCount="indefinite" calcMode="linear" keyPoints="0;1;0" keyTimes="0;0.5;1" path="M478.8 941L951.6 71.5A105.4 105.4 0 0 1 1060.8 17.8L1379 68.7"/>
              </circle>
            </g>
          </svg>
          <div className="site-nav" id="siteNav">
          <nav>
            <a href="#hero-content" className="logo" aria-label="DigiBlu, home"><span className="logo-mark" aria-hidden="true"></span></a>

            <ul className="nav-center">
              <li><a href="#hero-content">Home</a></li>
              <li><a href="#services">Services</a></li>
              <li><a href="#case-studies">Case Studies</a></li>
              <li><a href="#about">About Us</a></li>
              <li><a href="#team">Our Experts</a></li>
            </ul>

            <div className="nav-right">
              <button className="theme-toggle" id="themeToggle" aria-label="Switch to light mode">
                <svg className="icon-moon" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
                </svg>
                <svg className="icon-sun" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.7"/>
                  <path d="M12 2.5v2.2M12 19.3v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
                </svg>
              </button>
              <a className="btn-signup js-contact-open" href="/contact">Get in touch</a>
              <button className="nav-toggle" aria-expanded="false" aria-controls="mobileMenu" aria-label="Open menu">
                <svg className="icon-open" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                <svg className="icon-close" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 5l14 14M19 5 5 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <div className="mobile-menu" id="mobileMenu">
              <ul>
                <li><a href="#hero-content">Home</a></li>
                <li><a href="#services">Services</a></li>
                <li><a href="#case-studies">Case Studies</a></li>
                <li><a href="#about">About Us</a></li>
                <li><a href="#team">Our Experts</a></li>
                </ul>
              {/* Only the theme toggle lives in here. The CTA sits in the bar at
                   every width — there is room for it beside the hamburger, and it
                   is the page's primary action so it shouldn't be a tap away.
                   This is a separate element from the one in .nav-right rather
                   than the same node moved by CSS (you can't reparent with CSS),
                   which is why it carries no id — #themeToggle must stay unique.
                   The theme script binds every .theme-toggle, so it needs no extra
                   wiring; it also sets the visible label, which must stay equal to
                   the aria-label (WCAG 2.5.3, label in name). */}
              <div className="mobile-menu-actions">
                <button className="theme-toggle" aria-label="Switch to light mode">
                  <svg className="icon-moon" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
                  </svg>
                  <svg className="icon-sun" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.7"/>
                    <path d="M12 2.5v2.2M12 19.3v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
                  </svg>
                  <span className="theme-toggle-label">Switch to light mode</span>
                </button>
              </div>
            </div>
          </nav>
          </div>

          <div className="hero-center" id="hero-content">
            <span className="hero-logo" aria-hidden="true"></span>
            <h1><span>Applied AI,</span> <span>real ROI</span></h1>
          </div>

          <div className="hero-bottom">
            {/* Arrow is an inline SVG, not the U+2197 character it used to be:
                 iOS/Android give that codepoint emoji presentation by default, so
                 the same markup rendered as a flat glyph on desktop and a colour
                 emoji on mobile. An SVG renders identically everywhere and matches
                 the arrows already used by .case-read-more / .service-learn-more. */}
            {/* A real link to /contact since 11 Sep 2026; a plain click still
                 opens the dialog (ContactForm.jsx). */}
            <a className="btn-started js-contact-open" href="/contact">
              Get in touch
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M7 17 17 7M8.5 7H17v8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </a>
            <p>We pair operating model expertise with practitioners who’ve built the AI solutions themselves, so transformation delivers value fast and drives continuous improvement.</p>
          </div>
        </section>
    </>
  );
}
