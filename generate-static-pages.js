// Generates real, pre-rendered static pages for every case study, blog post
// and legal document, plus sitemap.xml/robots.txt. See CLAUDE.md ("Static
// pages" section) for why this exists: the homepage only ever renders this
// content into modals on click, which caps how well any of it can be
// individually indexed. Re-run this whenever CASE_STUDIES/BLOG_POSTS/
// LEGAL_DETAILS change in index.html, or the generated pages drift out of
// sync with the modals.
//
// Reads index.html as text and extracts the three data objects the same way
// this project's other generator scripts have all session (marker-based
// string slicing + new Function), rather than duplicating the content into a
// second data file. index.html stays the single source of truth.

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SITE_ORIGIN = 'https://digiblu.com';

const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

function extractBlock(startMarker, endMarker) {
  const s = html.indexOf(startMarker);
  if (s === -1) throw new Error('start marker not found: ' + startMarker);
  const e = html.indexOf(endMarker, s);
  if (e === -1) throw new Error('end marker not found: ' + endMarker);
  return html.slice(s, e);
}

function evalBlock(text, varName) {
  return new Function(text + '\nreturn ' + varName + ';')();
}

const CASE_STUDIES = evalBlock(
  extractBlock('var CASE_STUDIES = [', '\n      var byKey = {};'),
  'CASE_STUDIES'
);
const BLOG_POSTS = evalBlock(
  extractBlock('var BLOG_POSTS = {', "\n      var overlay = document.getElementById('blogDetailModal');"),
  'BLOG_POSTS'
);
const LEGAL_DETAILS = evalBlock(
  extractBlock('var LEGAL_DETAILS = {', "\n      var overlay = document.getElementById('legalModal');"),
  'LEGAL_DETAILS'
);

// Each post's art panel (gradient class + category icon) is authored in the
// homepage's blog card markup, not in BLOG_POSTS, so it is lifted straight
// from there rather than re-derived — the blog detail modal clones the same
// node for the same reason, so card, modal and static page cannot disagree.
const BLOG_ART = (function () {
  const art = {};
  const cardRe = /<a href="blog\/([^"]+)\.html" class="blog-card"[^>]*>\s*(<div class="blog-art[\s\S]*?<\/div>)/g;
  let m;
  while ((m = cardRe.exec(html))) art[m[1]] = m[2];
  return art;
})();

console.log('Extracted', CASE_STUDIES.length, 'case studies,', Object.keys(BLOG_POSTS).length, 'blog posts,', Object.keys(LEGAL_DETAILS).length, 'legal docs,', Object.keys(BLOG_ART).length, 'blog art panels');

// Real digiblu.com URL slugs for legal docs (from LEGAL_DETAILS[key].url),
// nicer than the terse internal keys ('terms', 'privacy', etc.)
const LEGAL_SLUGS = {
  terms: 'website-terms-of-use',
  privacy: 'privacy-policy',
  slavery: 'modern-slavery-policy',
  carbon: 'carbon-reduction-plan',
  'armed-forces': 'armed-forces-covenant'
};

function escapeHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function truncate(str, max) {
  if (str.length <= max) return str;
  return str.slice(0, max - 1).trimEnd() + '…';
}

const FAVICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%23000'/%3E%3Cpath d='M7 21.5 13 14l4.5 5L25 9.5' stroke='%231d6ef5' stroke-width='3' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E";

function pageHead({ title, description, canonicalPath, ogType }) {
  const canonicalUrl = SITE_ORIGIN + '/' + canonicalPath;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<meta name="theme-color" content="#000000">
<link rel="canonical" href="${canonicalUrl}">

<meta property="og:type" content="${ogType}">
<meta property="og:site_name" content="DigiBlu">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${canonicalUrl}">
<meta property="og:image" content="${SITE_ORIGIN}/assets/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:type" content="image/jpeg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
<meta name="twitter:image" content="${SITE_ORIGIN}/assets/og-image.jpg">

<link rel="icon" href="${FAVICON}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<script>
  (function () {
    var stored = null;
    try { stored = localStorage.getItem('digiblu-theme'); } catch (e) {}
    if (stored === 'light' || stored === 'dark') {
      document.documentElement.setAttribute('data-theme', stored);
    }
  })();
</script>
<link rel="stylesheet" href="../assets/site.css?v=20260811">
</head>
`;
}

function pageHeader() {
  return `<body>
  <a class="skip-link" href="#detail-content">Skip to content</a>

  <nav class="page-header">
    <a href="../index.html#hero-content" class="logo" aria-label="DigiBlu, home"><span class="logo-mark" aria-hidden="true"></span></a>

    <ul class="nav-center">
      <li><a href="../index.html#hero-content">Home</a></li>
      <li><a href="../index.html#about">About Us</a></li>
      <li><a href="../index.html#services">Services</a></li>
      <li><a href="../index.html#case-studies">Case Studies</a></li>
      <li><a href="../index.html#team">Our Experts</a></li>
      <li><a href="../index.html#faq">FAQ</a></li>
    </ul>

    <div class="nav-right">
      <button class="theme-toggle" id="themeToggle" aria-label="Switch to light mode">
        <svg class="icon-moon" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
        </svg>
        <svg class="icon-sun" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="4.2" stroke="currentColor" stroke-width="1.7"/>
          <path d="M12 2.5v2.2M12 19.3v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
        </svg>
      </button>
      <a class="btn-signup" href="../index.html#contact">Get in touch</a>
      <button class="nav-toggle" aria-expanded="false" aria-controls="mobileMenu" aria-label="Open menu">
        <svg class="icon-open" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
        <svg class="icon-close" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 5l14 14M19 5 5 19" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
      </button>
    </div>

    <div class="mobile-menu" id="mobileMenu">
      <ul>
        <li><a href="../index.html#hero-content">Home</a></li>
        <li><a href="../index.html#about">About Us</a></li>
        <li><a href="../index.html#services">Services</a></li>
        <li><a href="../index.html#case-studies">Case Studies</a></li>
        <li><a href="../index.html#team">Our Experts</a></li>
        <li><a href="../index.html#faq">FAQ</a></li>
      </ul>
      <!-- Mirrors the homepage: below 900px only the theme toggle moves out
           of the bar and into the menu (the CTA stays in the bar). No id on
           this toggle — #themeToggle must stay unique; the script binds by
           class, and sets the visible label to match the aria-label. -->
      <div class="mobile-menu-actions">
        <button class="theme-toggle" aria-label="Switch to light mode">
          <svg class="icon-moon" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
          </svg>
          <svg class="icon-sun" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="4.2" stroke="currentColor" stroke-width="1.7"/>
            <path d="M12 2.5v2.2M12 19.3v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
          </svg>
          <span class="theme-toggle-label">Switch to light mode</span>
        </button>
      </div>
    </div>
  </nav>
`;
}

function pageFooter() {
  return `  <footer>
    <div class="footer-inner">
      <div class="footer-brand">
        <div class="footer-logo">
          <span class="logo-mark" role="img" aria-label="DigiBlu"></span>
        </div>
        <p class="footer-desc">Experienced practitioners with client, technology, and consultancy backgrounds, working as pragmatic, technology-agnostic partners focused on speed to value.</p>
        <p class="footer-address">Digiblu UK Ltd., Steeple House, Suite 3 First Floor, Church Lane, Chelmsford, Essex, CM1 1NH, United Kingdom.</p>
        <div class="footer-socials">
          <a href="https://uk.linkedin.com/company/digiblu" target="_blank" rel="noopener" aria-label="DigiBlu on LinkedIn">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M6.94 8.5H4.06V19h2.88V8.5ZM5.5 4a1.67 1.67 0 1 0 0 3.33A1.67 1.67 0 0 0 5.5 4ZM19.94 19h-2.87v-5.63c0-1.34-.03-3.07-1.87-3.07-1.87 0-2.16 1.46-2.16 2.97V19H10.2V8.5h2.76v1.43h.04c.38-.73 1.32-1.5 2.72-1.5 2.9 0 3.44 1.91 3.44 4.4V19Z"/></svg>
          </a>
        </div>
      </div>

      <div class="footer-cols">
        <div class="footer-col">
          <h4>Services</h4>
          <ul>
            <li><a href="../index.html#services">Artificial Intelligence</a></li>
            <li><a href="../index.html#services">Process Excellence</a></li>
            <li><a href="../index.html#services">Opportunity Discovery</a></li>
            <li><a href="../index.html#services">Digital Solutions</a></li>
            <li><a href="../index.html#services">Target Operating Model</a></li>
            <li><a href="../index.html#services">Post-Implementation</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Company</h4>
          <ul>
            <li><a href="../index.html#hero-content">Home</a></li>
            <li><a href="../index.html#about">About Us</a></li>
            <li><a href="../index.html#blog">Blog</a></li>
            <li><a href="../index.html#case-studies">Case Studies</a></li>
            <li><a href="../index.html#faq">FAQ</a></li>
            <li><a href="../index.html#contact">Contact Us</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Legal</h4>
          <ul>
            <li><a href="../legal/website-terms-of-use.html">Terms of Use</a></li>
            <li><a href="../legal/privacy-policy.html">Privacy Policy</a></li>
            <li><a href="../legal/modern-slavery-policy.html">Modern Slavery Policy</a></li>
            <li><a href="../legal/carbon-reduction-plan.html">Carbon Reduction Plan</a></li>
            <li><a href="../legal/armed-forces-covenant.html">Armed Forces Covenant</a></li>
          </ul>
        </div>
      </div>
    </div>

    <div class="footer-bottom">&copy; DigiBlu UK Limited 2026. All rights reserved.</div>
  </footer>
`;
}

function pageScripts() {
  return `  <script>
    (function () {
      // Binds every .theme-toggle: below 900px the bar's copy is hidden and
      // the one inside the mobile menu takes over, and both must stay in sync.
      var btns = document.querySelectorAll('.theme-toggle');
      var meta = document.querySelector('meta[name="theme-color"]');
      if (!btns.length) return;
      function effective() {
        var attr = document.documentElement.getAttribute('data-theme');
        if (attr === 'light' || attr === 'dark') return attr;
        return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
      }
      function label() {
        var isLight = effective() === 'light';
        var text = isLight ? 'Switch to dark mode' : 'Switch to light mode';
        btns.forEach(function (b) {
          b.setAttribute('aria-label', text);
          var vis = b.querySelector('.theme-toggle-label');
          if (vis) vis.textContent = text;
        });
        if (meta) meta.setAttribute('content', isLight ? '#ffffff' : '#000000');
      }
      btns.forEach(function (b) {
        b.addEventListener('click', function () {
          var next = effective() === 'light' ? 'dark' : 'light';
          document.documentElement.setAttribute('data-theme', next);
          try { localStorage.setItem('digiblu-theme', next); } catch (e) {}
          label();
        });
      });
      window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', label);
      label();
    })();

    (function () {
      var toggle = document.querySelector('.nav-toggle');
      var menu = document.getElementById('mobileMenu');
      if (!toggle || !menu) return;
      function setMenu(open) {
        menu.classList.toggle('open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      }
      toggle.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });
      menu.addEventListener('click', function (e) { if (e.target.tagName === 'A') setMenu(false); });
      document.addEventListener('click', function (e) {
        if (!menu.contains(e.target) && !toggle.contains(e.target)) setMenu(false);
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && menu.classList.contains('open')) { setMenu(false); toggle.focus(); }
      });
    })();
  </script>
</body>
</html>
`;
}

function backLink() {
  return `      <a class="detail-back" href="../index.html">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M19 12H5m0 0 6-6m-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Back to home
      </a>
`;
}

// ---------- Case studies ----------

function caseStudyDescription(c) {
  return truncate(c.overview, 155);
}

function renderCaseStudy(c) {
  const stats = c.stats.map(s => `          <div class="case-stat"><b>${escapeHtml(s.v)}</b><span>${escapeHtml(s.l)}</span></div>`).join('\n');
  const sections = [
    ['Overview', c.overview],
    ['The problem', c.problem],
    ['What we did', c.solution],
    ['Outcome', c.outcome]
  ].map(([label, body]) => `      <div class="case-section">
        <h3>${escapeHtml(label)}</h3>
        <p>${escapeHtml(body)}</p>
      </div>`).join('\n');

  const quote = c.quote ? `      <figure class="case-modal-quote">
        <p>${escapeHtml(c.quote.text)}</p>
        <cite>${escapeHtml(c.quote.cite)}</cite>
      </figure>
` : '';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: c.title,
    description: caseStudyDescription(c),
    url: `${SITE_ORIGIN}/case-studies/${c.key}.html`,
    isPartOf: { '@type': 'WebSite', name: 'DigiBlu', url: SITE_ORIGIN + '/' }
  };

  return pageHead({
    title: `${c.title} | DigiBlu Case Studies`,
    description: caseStudyDescription(c),
    canonicalPath: `case-studies/${c.key}.html`,
    ogType: 'website'
  }) + `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>\n` + pageHeader() + `
  <main>
    <div class="detail-page" id="detail-content">
${backLink()}
      <span class="pill case-modal-eyebrow">${escapeHtml(c.sector)} · ${escapeHtml(c.service)}</span>
      <h1>${escapeHtml(c.title)}</h1>
      <p class="case-modal-client">${escapeHtml(c.client)}</p>
      <div class="case-stats">
${stats}
      </div>
${sections}
${quote}    </div>
  </main>
` + pageFooter() + pageScripts();
}

// ---------- Blog posts ----------

function blogDescription(p) {
  const firstPoint = p.points && p.points[0] ? p.points[0].p : '';
  return truncate(firstPoint, 155);
}

function renderBlogPost(key, p) {
  const fullBlocks = (p.full || []).map(b =>
    b.type === 'h' ? `      <h3>${escapeHtml(b.text)}</h3>` : `      <p>${escapeHtml(b.text)}</p>`
  ).join('\n');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: p.title,
    description: blogDescription(p),
    datePublished: p.date,
    url: `${SITE_ORIGIN}/blog/${key}.html`,
    publisher: { '@type': 'Organization', name: 'DigiBlu', logo: { '@type': 'ImageObject', url: `${SITE_ORIGIN}/assets/logo.png` } },
    mainEntityOfPage: `${SITE_ORIGIN}/blog/${key}.html`
  };

  return pageHead({
    title: `${p.title} | DigiBlu Blog`,
    description: blogDescription(p),
    canonicalPath: `blog/${key}.html`,
    ogType: 'article'
  }) + `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>\n` + pageHeader() + `
  <main>
    <div class="detail-page" id="detail-content">
${backLink()}
      <div class="blog-modal-art" aria-hidden="true">${BLOG_ART[key] || ''}</div>
      <span class="pill service-modal-eyebrow">${escapeHtml(p.tag)}</span>
      <h1>${escapeHtml(p.title)}</h1>
      <div class="blog-meta"><span>${escapeHtml(p.date)}</span><span class="dot"></span><span>${escapeHtml(p.read)}</span></div>
      <div class="blog-full-text">
${fullBlocks}
      </div>
    </div>
  </main>
` + pageFooter() + pageScripts();
}

// ---------- Legal docs ----------

function legalDescription(d) {
  return truncate(d.intro, 155);
}

function renderLegalDoc(key, d) {
  const items = d.points.map(pt => `        <div class="service-modal-item">
          <h3>${escapeHtml(pt.h)}</h3>
          <p style="white-space: pre-line">${escapeHtml(pt.p)}</p>
        </div>`).join('\n');

  const slug = LEGAL_SLUGS[key];
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: d.title,
    description: legalDescription(d),
    url: `${SITE_ORIGIN}/legal/${slug}.html`,
    isPartOf: { '@type': 'WebSite', name: 'DigiBlu', url: SITE_ORIGIN + '/' }
  };

  return pageHead({
    title: `${d.title} | DigiBlu`,
    description: legalDescription(d),
    canonicalPath: `legal/${slug}.html`,
    ogType: 'website'
  }) + `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>\n` + pageHeader() + `
  <main>
    <div class="detail-page" id="detail-content">
${backLink()}
      <span class="pill service-modal-eyebrow">Legal</span>
      <h1>${escapeHtml(d.title)}</h1>
      <p class="service-modal-intro">${escapeHtml(d.intro)}</p>
      <div class="service-modal-list">
${items}
      </div>
    </div>
  </main>
` + pageFooter() + pageScripts();
}

// ---------- Write files ----------

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const written = [];

const caseDir = path.join(ROOT, 'case-studies');
ensureDir(caseDir);
CASE_STUDIES.forEach(c => {
  const out = renderCaseStudy(c);
  fs.writeFileSync(path.join(caseDir, c.key + '.html'), out, 'utf8');
  written.push('case-studies/' + c.key + '.html');
});

const blogDir = path.join(ROOT, 'blog');
ensureDir(blogDir);
Object.keys(BLOG_POSTS).forEach(key => {
  const out = renderBlogPost(key, BLOG_POSTS[key]);
  fs.writeFileSync(path.join(blogDir, key + '.html'), out, 'utf8');
  written.push('blog/' + key + '.html');
});

const legalDir = path.join(ROOT, 'legal');
ensureDir(legalDir);
Object.keys(LEGAL_DETAILS).forEach(key => {
  const slug = LEGAL_SLUGS[key];
  if (!slug) throw new Error('no slug mapped for legal key: ' + key);
  const out = renderLegalDoc(key, LEGAL_DETAILS[key]);
  fs.writeFileSync(path.join(legalDir, slug + '.html'), out, 'utf8');
  written.push('legal/' + slug + '.html');
});

// ---------- sitemap.xml + robots.txt ----------

const allUrls = [SITE_ORIGIN + '/'].concat(written.map(p => SITE_ORIGIN + '/' + p));
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap, 'utf8');

const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_ORIGIN}/sitemap.xml
`;
fs.writeFileSync(path.join(ROOT, 'robots.txt'), robots, 'utf8');

console.log('Wrote', written.length, 'pages:');
written.forEach(w => console.log(' -', w));
console.log('Wrote sitemap.xml (' + allUrls.length + ' URLs) and robots.txt');
