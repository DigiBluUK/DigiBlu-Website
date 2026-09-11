// Generated from index.html by scripts/html-to-jsx.cjs; hand-fixes are
// allowed after generation, so do not regenerate over a tuned file.
export default function PageHeader() {
  return (
    <>
      <nav className="page-header">
          <a href="/#hero-content" className="logo" aria-label="DigiBlu, home"><span className="logo-mark" aria-hidden="true"></span></a>

          <ul className="nav-center">
            <li><a href="/#hero-content">Home</a></li>
            <li><a href="/#services">Services</a></li>
            <li><a href="/#case-studies">Case Studies</a></li>
            <li><a href="/#about">About Us</a></li>
            <li><a href="/#team">Our Experts</a></li>
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
            <a className="btn-signup" href="/contact">Get in touch</a>
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
              <li><a href="/#hero-content">Home</a></li>
              <li><a href="/#services">Services</a></li>
              <li><a href="/#case-studies">Case Studies</a></li>
              <li><a href="/#about">About Us</a></li>
              <li><a href="/#team">Our Experts</a></li>
              </ul>
            {/* Mirrors the homepage: below 900px only the theme toggle moves out
                 of the bar and into the menu (the CTA stays in the bar). No id on
                 this toggle — #themeToggle must stay unique; the script binds by
                 class, and sets the visible label to match the aria-label. */}
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
    </>
  );
}
