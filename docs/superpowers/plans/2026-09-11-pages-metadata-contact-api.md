# Pages, metadata and contact API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Answer the developer's pre-launch review of 11 Sep 2026: every piece of content gets a real, prerendered, crawlable page with its own metadata and share card (the dialogs stay, as progressive enhancement over real links: "Option A"), and the contact form posts to a real API route that validates, verifies Cloudflare Turnstile and hands off to one function the developer will fill with the Azure Communication Services call.

**Architecture:** Four new static routes (`/services`, `/team`, `/accreditations`, `/case-studies`) render the same markdown content the dialogs already read, with the standalone-page chrome the case-study and legal pages use. The home page's buttons that open dialogs become real `<a href>` links to those pages; each dialog behaviour keeps its plain-click opening and steps aside for modifier clicks and crawlers (the pattern the case studies already use). The site origin defaults to the production domain so no build can carry a dead host in its metadata. One route handler (`POST /api/contact`) is the only dynamic route; the Worker runs it, the static pages are untouched.

**Tech Stack:** Next.js 16 App Router (static routes + one route handler), React 19 server components, TypeScript, the seventeen verbatim behaviour scripts, Cloudflare Turnstile (explicit render, test keys locally), node:test.

**Spec:** the developer's review and the decisions taken in the session of 11 Sep 2026, recorded in the Requirements section below. There is no separate spec file.

## Requirements (the spec)

1. **Crawlable pages, dialogs kept (Option A).** Services, team, accreditations and the case-study list exist only inside dialogs filled by script today; each gets a real page. The home page does not change visually. Every button that opens one of those dialogs becomes a real link to the page (`<a href>`), opening the dialog on a plain click and navigating on ctrl/cmd/shift/middle click or with no JavaScript. Case studies and legal documents already have pages and are left alone.
2. **Contact form stays in its dialog for now.** A `/contact` page is a separate decision DigiBlu will make; nothing here precludes it.
3. **Metadata.** `SITE_ORIGIN` defaults to `https://digiblu.com` (it was the retired GitHub Pages host). Every page has its own title, description, canonical, Open Graph and Twitter card, and JSON-LD; the four new pages get share cards. A test over the built output checks all of it.
4. **Contact API.** `POST /api/contact` accepts JSON, validates, verifies a Turnstile token server-side with the secret from the environment, and calls `sendEnquiry()`, a stub the developer replaces. The form posts to it, shows the success screen on success and an error otherwise. Turnstile renders on the form's last step; the site key is a public build variable, the secret is a Worker secret, neither is in the source. Cloudflare's documented test keys work locally.
5. **Safari Destinations placeholders stay** (acknowledged by DigiBlu).

## Global Constraints

- No em dashes in any visible copy (site-wide rule).
- No fabricated people or claims; every new sentence describes something this build does.
- The behaviours stay JavaScript and keep their shape; hand edits are noted in the file.
- Work on `dev`; commit per task with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`; `main` moves only on DigiBlu's word.
- Every `url()` in `app/globals.css` is absolute `/assets/...`.
- `npm test` must stay green; `npm run build` must succeed; the Worker build (`npm run build:cf`) must succeed.
- Keep section 12 of the Privacy and Cookies Policy true: if Turnstile sets anything, say so.

---

## File structure

| Path | Responsibility |
|---|---|
| `lib/site.ts` | The origin default moves to `https://digiblu.com`. |
| `lib/content.ts` | `TeamMember` gains `key`; `getService(key)` and `getTeamMember(key)` are not needed (pages list everything). |
| `content/team/*.md` | Each gains `key` (the file name) for the page anchors. |
| `content/services/*.md` | `order` matches the home cards (discovery 2, process 3) so the page numbers agree with the cards. |
| `components/PageIntro.tsx` | The shared top of a listing page: back link, eyebrow pill, h1, intro paragraph. |
| `app/services/page.tsx`, `app/team/page.tsx`, `app/accreditations/page.tsx`, `app/case-studies/page.tsx` | The four listing pages, each with metadata and JSON-LD. |
| `components/sections/Services.tsx`, `Team.tsx`, `Accreditations.tsx`, `CaseStudies.tsx`, `components/Footer.tsx` | Buttons become links. |
| `components/behaviours/ServiceDialog.jsx`, `BadgeDialog.jsx`, `CaseReader.jsx` | Openers are links: skip modified clicks, preventDefault plain ones. |
| `app/globals.css` | `.page-list` / `.page-item` for the listing pages; `text-decoration: none` on the three button-styled classes now used on `<a>`; `.modal-error`; `.cf-hp`. |
| `lib/contact/validate.ts`, `lib/contact/turnstile.ts`, `lib/contact/send.ts` | Validation, Turnstile verification, the developer's hand-off. Relative imports only, so node:test can load them. |
| `app/api/contact/route.ts` | The route handler. |
| `components/dialogs/ContactDialog.tsx`, `components/behaviours/ContactForm.jsx`, `components/HomeBehaviours.tsx` | Turnstile container, honeypot, error line; the fetch; the site key passed as a prop. |
| `next.config.ts` | CSP admits `https://challenges.cloudflare.com` for scripts and frames; build-time warning when the site key is missing on a production build. |
| `.env.example`, `.env.local` | Turnstile test keys; production notes. |
| `app/sitemap.ts` | Four more URLs. |
| `docs/redirects/old-site-redirects.csv` | Old service, leadership, contact and project addresses point at the new pages. |
| `scripts/contact.test.cjs` | Unit tests for the validator and the route handler (Turnstile mocked). |
| `scripts/pages.test.cjs` | Post-build test over `.next/server/app/**.html`: metadata, canonical, share-card files, content presence, sitemap. |
| `package.json`, `.github/workflows/ci.yml` | `test:pages` after the build. |
| `public/assets/og/services.jpg`, `team.jpg`, `accreditations.jpg`, `case-studies.jpg` | The four share cards. |
| `CLAUDE.md`, `README.md`, `content/legal/privacy-policy.md` | Handover and the policy's section 12. |

---

### Task 1: Origin default and content keys

**Files:**
- Modify: `lib/site.ts:4`
- Modify: `.env.example` (the SITE_ORIGIN comment)
- Modify: `content/team/*.md` (8 files: add `key`)
- Modify: `content/services/discovery.md`, `content/services/process.md` (`order`)
- Modify: `lib/content.ts` (`TeamMember.key`)
- Test: `scripts/content.test.cjs`

**Interfaces:**
- Produces: `TeamMember.key: string` (`vic-gysin`, `david-williams`, `karen-potgieter`, `jon-hinder`, `martin-mccloskey`, `dianne-harris`, `dave-vanderwesthuizen`, `nick-bantick`); services in card order `ai, discovery, process, digital, tom, post`.

- [ ] **Step 1: Write the failing test**

In `scripts/content.test.cjs`, change the third test to:

```js
test("services, team, accreditations", () => {
  // Card order on the home page (01 to 06), which the services page numbers follow.
  assert.deepEqual(c.services.map((s) => s.key), ["ai", "discovery", "process", "digital", "tom", "post"]);
  assert.equal(c.services[0].sections.length, 5);
  assert.equal(c.team.length, 8);
  assert.equal(c.team[0].photo, "/assets/team/vic-gysin.png");
  assert.deepEqual(c.team.map((m) => m.key), ["vic-gysin", "david-williams", "karen-potgieter", "jon-hinder", "martin-mccloskey", "dianne-harris", "dave-vanderwesthuizen", "nick-bantick"]);
  assert.equal(c.accreditations.find((a) => a.key === "gcloud").onDark, true);
});
```

- [ ] **Step 2: Run it** — `npm test` — expected: FAIL on the services order and on `key` being `undefined`.

- [ ] **Step 3: Content and code**

`content/services/discovery.md`: `order: 2`. `content/services/process.md`: `order: 3`. Each `content/team/<file>.md` front matter gains `key: "<file name without .md>"`. `lib/content.ts`: `export type TeamMember = { key: string; name: string; role: string; cls: string; photo: string; order: number; html: string };`.

`lib/site.ts` line 4:

```ts
// Defaults to the production domain since 11 Sep 2026 (it was the retired
// GitHub Pages host, which put a dead address in every canonical and share
// card of any build that forgot the variable). Previews are noindex, so a
// canonical that points at digiblu.com from a preview is correct.
export const SITE_ORIGIN = (process.env.SITE_ORIGIN || "https://digiblu.com").replace(/\/+$/, "");
```

`.env.example`: replace the two SITE_ORIGIN lines with:

```
# The public origin, used for canonical URLs, share cards, sitemap and robots.
# Defaults to https://digiblu.com; set it only for a build that must claim a
# different host.
# SITE_ORIGIN=https://digiblu.com
```

- [ ] **Step 4: Run** `npm test` — expected: 3 pass.
- [ ] **Step 5: Commit** `git commit -am "Origin defaults to digiblu.com; team keys; services in card order"`.

---

### Task 2: The four listing pages

**Files:**
- Create: `components/PageIntro.tsx`, `app/services/page.tsx`, `app/team/page.tsx`, `app/accreditations/page.tsx`, `app/case-studies/page.tsx`
- Modify: `app/globals.css` (append the page-list rules), `app/sitemap.ts`
- Test: `scripts/pages.test.cjs` (Task 5 runs it; this task's check is the build and a fetch)

**Interfaces:**
- Produces: routes `/services`, `/team`, `/accreditations`, `/case-studies`; anchors `#<service key>`, `#<team key>`, `#<accreditation key>`; share-card paths `/assets/og/services.jpg`, `/assets/og/team.jpg`, `/assets/og/accreditations.jpg`, `/assets/og/case-studies.jpg` (files made in Task 6).

- [ ] **Step 1: `components/PageIntro.tsx`**

```tsx
import BackLink from "@/components/BackLink";

// The top of a listing page (services, team, accreditations, case studies):
// the same chrome the case-study and legal pages open with, so the four new
// pages read as siblings of the sixteen that existed before them.
export default function PageIntro({ eyebrow, title, intro }: { eyebrow: string; title: string; intro: string }) {
  return (
    <>
      <BackLink />
      <span className="pill service-modal-eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p className="service-modal-intro">{intro}</p>
    </>
  );
}
```

- [ ] **Step 2: `app/services/page.tsx`**

```tsx
import type { Metadata } from "next";
import { getServices } from "@/lib/content";
import { SITE_ORIGIN } from "@/lib/site";
import SkipLink from "@/components/SkipLink";
import PageHeader from "@/components/PageHeader";
import PageIntro from "@/components/PageIntro";
import Markdown from "@/components/Markdown";
import Footer from "@/components/Footer";
import PageBehaviours from "@/components/PageBehaviours";

// Every service in full on one page (the developer's review of 11 Sep 2026:
// the write-ups existed only inside the Learn more dialog, which nothing
// can crawl). The home page's cards and the footer link here, and the
// dialog still opens on a plain click. Numbered in card order.
const TITLE = "Services | DigiBlu";
const DESCRIPTION = "DigiBlu's six services in full: Artificial Intelligence, Opportunity Discovery, Process Excellence, Digital Solutions, Target Operating Model and Managed Services.";
const URL = `${SITE_ORIGIN}/services`;
const OG = "/assets/og/services.jpg";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { type: "website", siteName: "DigiBlu", title: TITLE, description: DESCRIPTION, url: URL, images: [{ url: OG, width: 1200, height: 630, type: "image/jpeg", alt: "DigiBlu services" }] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: [OG] },
};

export default function ServicesPage() {
  const services = getServices();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: TITLE,
    description: DESCRIPTION,
    url: URL,
    isPartOf: { "@type": "WebSite", name: "DigiBlu", url: SITE_ORIGIN + "/" },
    mainEntity: { "@type": "ItemList", itemListElement: services.map((s, i) => ({ "@type": "ListItem", position: i + 1, name: s.title, url: `${URL}#${s.key}` })) },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SkipLink target="#detail-content" />
      <PageHeader />
      <main>
        <div className="detail-page" id="detail-content">
          <PageIntro eyebrow="Services" title="How we help you move forward" intro="Six ways we work with clients, from finding the opportunity to running what we build. Each is described in full below." />
          <div className="page-list">
            {services.map((s, i) => (
              <article className="page-item" id={s.key} key={s.key}>
                <span className="pill service-modal-eyebrow">Service {String(i + 1).padStart(2, "0")}</span>
                <h2>{s.title}</h2>
                <p className="service-modal-intro">{s.intro}</p>
                <div className="service-modal-list">
                  <Markdown sections={s.sections} itemClass="service-modal-item" />
                </div>
                <a className="faq-cta-btn" href="/#contact">
                  <span className="arrow-badge">
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h14m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                  Discuss this service
                </a>
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer standalone />
      <PageBehaviours />
    </>
  );
}
```

- [ ] **Step 3: `app/team/page.tsx`**

Same shape. Constants: `TITLE = "Our Experts | DigiBlu"`, `DESCRIPTION = "Meet DigiBlu's leadership team: eight practitioners with client, technology and consultancy backgrounds, leading each practice area from strategy through delivery."`, `URL = ${SITE_ORIGIN}/team`, `OG = "/assets/og/team.jpg"`. JSON-LD `mainEntity` is an `ItemList` of `{ "@type": "Person", name, jobTitle: role, url: URL#key, worksFor: { "@type": "Organization", name: "DigiBlu" } }` (real, published people). Body:

```tsx
<PageIntro eyebrow="Our Experts" title="Meet the leadership team" intro="Practitioners with client, technology, and consultancy backgrounds, leading each of our practice areas from strategy through delivery." />
<div className="page-list">
  {getTeam().map((m) => (
    <article className="page-item team-page-item" id={m.key} key={m.key}>
      <span className={`team-modal-photo ${m.cls}`} role="img" aria-label={m.name}></span>
      <div>
        <h2>{m.name}</h2>
        <p className="team-modal-role">{m.role}</p>
        <div className="service-modal-intro" dangerouslySetInnerHTML={{ __html: m.html }} />
      </div>
    </article>
  ))}
</div>
```

- [ ] **Step 4: `app/accreditations/page.tsx`**

`TITLE = "Accreditations and Certifications | DigiBlu"`, `DESCRIPTION = "The six certifications DigiBlu holds and what each one means: ISO 9001, ISO 14001, ISO 27001, ISO/IEC 42001, Cyber Essentials Plus and UK Government G-Cloud approved supplier."`, `URL = ${SITE_ORIGIN}/accreditations`, `OG = "/assets/og/accreditations.jpg"`. JSON-LD `mainEntity` an `ItemList` of `ListItem` names. Body:

```tsx
<PageIntro eyebrow="Accredited & certified" title="Our accreditations" intro="Independent certifications that cover how we manage quality, the environment, information security and AI, and confirm our status as an approved government supplier." />
<div className="page-list">
  {getAccreditations().map((a) => (
    <article className="page-item accred-page-item" id={a.key} key={a.key}>
      <div className={"badge-modal-visual-wrap accred-page-visual" + (a.onDark ? " on-dark-plate" : "")}>
        <img src={a.img} alt={`${a.title} certification mark`} decoding="async" />
      </div>
      <div>
        <h2>{a.title}</h2>
        <div className="service-modal-intro" dangerouslySetInnerHTML={{ __html: a.html }} />
      </div>
    </article>
  ))}
</div>
```

- [ ] **Step 5: `app/case-studies/page.tsx`**

`TITLE = "Case Studies | DigiBlu"`, `DESCRIPTION = "Ten client engagements where DigiBlu's work made a measurable difference, across energy, healthcare, travel, manufacturing, financial services and the public sector."`, `URL = ${SITE_ORIGIN}/case-studies`, `OG = "/assets/og/case-studies.jpg"`. JSON-LD `ItemList` of `ListItem` with each case study's page URL. Body: the reader's row look, as real links:

```tsx
<PageIntro eyebrow="Case Studies" title="Where our work has made a difference" intro="Every engagement we publish, with the client, the sector and what changed. Each opens as its own page." />
<div className="case-index-list page-case-list">
  {getCaseStudies().map((c) => (
    <a className="case-index-item" href={`/case-studies/${c.key}`} key={c.key}>
      <span>
        <span className="case-index-client" style={{ display: "block" }}>{c.client} · {c.service}</span>
        <span className="case-index-title" style={{ display: "block" }}>{c.title}</span>
      </span>
      <span className="case-index-go" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h14m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </span>
    </a>
  ))}
</div>
```

- [ ] **Step 6: CSS** (append to `app/globals.css`, before the closing of the base rules; all absolute paths, none needed here)

```css
  /* ---------- Listing pages (11 Sep 2026) ----------
     /services, /team, /accreditations and /case-studies: the content the
     home page's dialogs show, as real prerendered pages the dialogs now sit
     over. Same .detail-page frame as the case-study and legal pages. */
  .page-list { display: flex; flex-direction: column; gap: 44px; margin-top: 8px; }
  .page-item { padding-top: 40px; border-top: 1px solid rgba(var(--ink-rgb), 0.12); scroll-margin-top: calc(var(--nav-h, 75px) + 26px); }
  .page-item:first-child { padding-top: 0; border-top: none; }
  .page-item h2 { font-size: 26px; font-weight: 700; letter-spacing: -0.4px; color: var(--text); margin-bottom: 10px; }
  .page-item .service-modal-list { margin-bottom: 24px; }
  .page-item .service-modal-intro:last-child { margin-bottom: 0; }
  .team-page-item, .accred-page-item { display: flex; gap: 28px; align-items: flex-start; }
  .team-page-item .team-modal-photo { margin: 0; flex-shrink: 0; }
  .accred-page-visual { min-height: 0; margin: 0; width: 132px; flex-shrink: 0; justify-content: center; }
  .accred-page-visual img { max-width: 100%; max-height: 96px; width: auto; height: auto; }
  .accred-page-visual.on-dark-plate { padding: 14px 18px; }
  .page-case-list .case-index-item { text-decoration: none; }
  @media (max-width: 560px) {
    .team-page-item, .accred-page-item { flex-direction: column; gap: 16px; }
  }
  /* Button-styled classes now carried by <a> elements (the home page's
     openers are real links since 11 Sep 2026). */
  a.accred-chip, a.case-viewall-btn { text-decoration: none; }
  a.faq-cta-btn { text-decoration: none; }
```

- [ ] **Step 7: `app/sitemap.ts`** — add after the home entry:

```ts
    { url: SITE_ORIGIN + "/services", changeFrequency: "monthly", priority: 0.8 },
    { url: SITE_ORIGIN + "/case-studies", changeFrequency: "monthly", priority: 0.8 },
    { url: SITE_ORIGIN + "/team", changeFrequency: "monthly", priority: 0.6 },
    { url: SITE_ORIGIN + "/accreditations", changeFrequency: "yearly", priority: 0.5 },
```

and update the comment to "twenty URLs".

- [ ] **Step 8: Build and look** — `npm run build`; then `npm start` on 3100 and fetch each of the four pages with `curl -s` to confirm 200 and the content text (a service section heading, a name, a certification title, a case-study title) is in the HTML.
- [ ] **Step 9: Commit** `git commit -am "Four listing pages: services, team, accreditations, case studies"`.

---

### Task 3: Openers become links, dialogs stay

**Files:**
- Modify: `components/sections/Services.tsx` (6 buttons), `components/sections/Accreditations.tsx` (12 buttons), `components/sections/CaseStudies.tsx` (View all), `components/sections/Team.tsx` (a link under the strip), `components/Footer.tsx` (services links, Our Experts)
- Modify: `components/behaviours/ServiceDialog.jsx`, `BadgeDialog.jsx`, `CaseReader.jsx`
- Modify: `docs/redirects/old-site-redirects.csv`, `docs/redirects/README.md`

- [ ] **Step 1: Services cards** — each `<button type="button" className="service-learn-more" data-service="X">` becomes `<a href="/services#X" className="service-learn-more" data-service="X">` (closing tag too). Same for the two accreditation groups: `<button type="button" className="accred-chip" data-badge="K">` becomes `<a href="/accreditations#K" className="accred-chip" data-badge="K">`; the duplicate group keeps `tabIndex={-1}`. View all: `<a href="/case-studies" className="case-viewall-btn" id="caseViewAll">`. Team section: after the strip, add

```tsx
<div className="cases-actions team-actions">
  <a className="case-viewall-btn" href="/team">Read the full profiles</a>
</div>
```

Footer Services column: always `<a href={`/services#${key}`} data-service={key}>{name}</a>` (drop the `standalone` branch there; keep it for Contact Us). Footer Company column gains `<li><a href="/team">Our Experts</a></li>` after About Us.

- [ ] **Step 2: `ServiceDialog.jsx`** — openers selector becomes `'.service-learn-more, .footer-col [data-service]'`; `openModal(e)` starts with

```js
        // Real links since 11 Sep 2026 (/services#key): a modified click or a
        // crawler gets the page, a plain click still opens the dialog.
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1) return;
        e.preventDefault();
```

`BadgeDialog.jsx` delegated handler: after `var btn = e.target.closest('.accred-chip'); if (!btn) return;` add the same modifier check and `e.preventDefault()` before `populate`. `CaseReader.jsx` View all handler: `function (e) { if (isModified(e)) return; e.preventDefault(); openDetail(...) }`.

- [ ] **Step 3: Redirect map** — rows 2-7 target `https://digiblu.com/services#ai|#digital|#process|#tom|#discovery|#post` respectively; rows 10-11 (`/about-digiblu`, `/leadership-team` prefix) target `https://digiblu.com/team`; the `/our-projects` prefix row and the First National Bank row target `https://digiblu.com/case-studies`; `/contact-us` stays `/#contact`. README bullets updated to match.

- [ ] **Step 4: Verify in the browser** (dev server): plain click on Learn more opens the dialog with the right service; ctrl-click opens `/services#ai` in a new tab; the accreditation chip and View all likewise; a keyboard Enter on a chip opens the dialog; the footer service links open the dialog on the home page and navigate on a legal page.
- [ ] **Step 5: Commit** `git commit -am "Dialog openers are real links to the new pages"`.

---

### Task 4: Contact API with Turnstile

**Files:**
- Create: `lib/contact/validate.ts`, `lib/contact/turnstile.ts`, `lib/contact/send.ts`, `app/api/contact/route.ts`
- Modify: `components/dialogs/ContactDialog.tsx`, `components/behaviours/ContactForm.jsx`, `components/HomeBehaviours.tsx`, `next.config.ts`, `.env.example`, `.env.local`, `app/globals.css`, `wrangler.jsonc` (comment)
- Test: `scripts/contact.test.cjs`

**Interfaces:**
- Produces: `validateEnquiry(input: unknown): { ok: true; enquiry: Enquiry } | { ok: false; error: string }`; `verifyTurnstile(token: string, secret: string, remoteIp?: string): Promise<boolean>`; `sendEnquiry(enquiry: Enquiry): Promise<void>`; `POST /api/contact` JSON `{ firstName, lastName, email, phone?, company?, message?, consent: true, website: "", turnstileToken }` returning `200 { ok: true }`, `400 { ok: false, error }`, `403 { ok: false, error }`, `500 { ok: false, error }`.

- [ ] **Step 1: Failing tests** `scripts/contact.test.cjs`

```js
const test = require("node:test");
const assert = require("node:assert/strict");

// Node 24 strips types, so the TypeScript modules load directly. They use
// relative imports and web-standard Request/Response only, for this reason.
const load = (p) => import(p);
const good = { firstName: "Jane", lastName: "Smith", email: "jane@example.com", phone: "07123 456789", company: "Acme", message: "Hello", consent: true, website: "", turnstileToken: "tok" };

test("validateEnquiry: accepts a complete enquiry and trims it", async () => {
  const { validateEnquiry } = await load("../lib/contact/validate.ts");
  const r = validateEnquiry({ ...good, firstName: "  Jane " });
  assert.equal(r.ok, true);
  assert.equal(r.enquiry.firstName, "Jane");
  assert.equal(r.enquiry.phone, "07123 456789");
});

test("validateEnquiry: rejects missing names, bad email, no consent, a filled honeypot, oversize text", async () => {
  const { validateEnquiry } = await load("../lib/contact/validate.ts");
  for (const bad of [
    { ...good, firstName: "" }, { ...good, lastName: " " }, { ...good, email: "nope" }, { ...good, consent: false },
    { ...good, website: "http://spam" }, { ...good, message: "x".repeat(4001) }, "not an object", null,
  ]) assert.equal(validateEnquiry(bad).ok, false, JSON.stringify(bad).slice(0, 40));
});

test("POST /api/contact: 200 with a verified token, 403 without, 400 on bad input, 500 with no secret", async () => {
  const { POST } = await load("../app/api/contact/route.ts");
  const req = (body, headers) => new Request("http://localhost/api/contact", { method: "POST", headers: { "content-type": "application/json", ...(headers || {}) }, body: typeof body === "string" ? body : JSON.stringify(body) });
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    assert.match(String(url), /challenges\.cloudflare\.com\/turnstile\/v0\/siteverify$/);
    const params = new URLSearchParams(init.body);
    return new Response(JSON.stringify({ success: params.get("response") === "tok" }), { headers: { "content-type": "application/json" } });
  };
  try {
    process.env.TURNSTILE_SECRET_KEY = "secret";
    assert.equal((await POST(req(good))).status, 200);
    assert.equal((await POST(req({ ...good, turnstileToken: "wrong" }))).status, 403);
    assert.equal((await POST(req({ ...good, turnstileToken: "" }))).status, 403);
    assert.equal((await POST(req({ ...good, email: "bad" }))).status, 400);
    assert.equal((await POST(req("{not json"))).status, 400);
    delete process.env.TURNSTILE_SECRET_KEY;
    assert.equal((await POST(req(good))).status, 500);
  } finally {
    globalThis.fetch = realFetch;
  }
});
```

- [ ] **Step 2: Run** `npm test` — expected: FAIL (modules not found).

- [ ] **Step 3: `lib/contact/validate.ts`**

```ts
// The contact form's payload, checked on the server before anything is
// done with it. Relative imports and no Next types on purpose: node:test
// loads this file directly (scripts/contact.test.cjs).
export type Enquiry = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  message: string;
};

export type Validation = { ok: true; enquiry: Enquiry } | { ok: false; error: string };

const LIMITS = { firstName: 100, lastName: 100, email: 254, phone: 40, company: 200, message: 4000 } as const;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function text(v: unknown, max: number): string | null {
  if (v === undefined || v === null) return "";
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length > max ? null : t;
}

export function validateEnquiry(input: unknown): Validation {
  if (!input || typeof input !== "object") return { ok: false, error: "Please fill in the form." };
  const o = input as Record<string, unknown>;
  // Honeypot: a field no person sees; anything in it is a bot.
  if (typeof o.website === "string" && o.website.trim() !== "") return { ok: false, error: "Please fill in the form." };
  if (o.consent !== true) return { ok: false, error: "Please agree to the Privacy and Cookies Policy." };
  const firstName = text(o.firstName, LIMITS.firstName);
  const lastName = text(o.lastName, LIMITS.lastName);
  const email = text(o.email, LIMITS.email);
  const phone = text(o.phone, LIMITS.phone);
  const company = text(o.company, LIMITS.company);
  const message = text(o.message, LIMITS.message);
  if (firstName === null || lastName === null || email === null || phone === null || company === null || message === null) return { ok: false, error: "One of the fields is too long." };
  if (!firstName || !lastName) return { ok: false, error: "Please tell us your name." };
  if (!email || !EMAIL.test(email)) return { ok: false, error: "Please enter a valid email address." };
  return { ok: true, enquiry: { firstName, lastName, email, phone, company, message } };
}
```

- [ ] **Step 4: `lib/contact/turnstile.ts`**

```ts
// Server-side check of a Cloudflare Turnstile token. The secret never
// reaches a browser: it is TURNSTILE_SECRET_KEY in the Worker's secrets
// (wrangler secret put) and in .env.local for local work, where Cloudflare's
// documented test pair always passes.
const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(token: string, secret: string, remoteIp?: string): Promise<boolean> {
  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);
  try {
    const res = await fetch(VERIFY_URL, { method: "POST", body });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
```

- [ ] **Step 5: `lib/contact/send.ts`**

```ts
import type { Enquiry } from "./validate";

// The one function to replace. The route handler calls it only after the
// payload has been validated and the Turnstile token verified, so by the
// time an enquiry arrives here it is a real one from a person.
//
// DigiBlu's developer wires the downstream call in here: send the enquiry
// by email through Azure Communication Services (or whatever the chosen
// channel is). Configuration belongs in the Worker's environment (vars for
// addresses, secrets for keys), never in this file. Throwing makes the
// route answer 500 and the form show its error line, so throw on failure
// rather than swallowing it.
//
// Until then this records that an enquiry arrived and nothing else: no
// personal data goes to the logs.
export async function sendEnquiry(enquiry: Enquiry): Promise<void> {
  console.log("[contact] enquiry received", { at: new Date().toISOString(), hasMessage: enquiry.message.length > 0 });
}
```

- [ ] **Step 6: `app/api/contact/route.ts`**

```ts
import { validateEnquiry } from "../../../lib/contact/validate";
import { verifyTurnstile } from "../../../lib/contact/turnstile";
import { sendEnquiry } from "../../../lib/contact/send";

// The contact form's endpoint: the only dynamic route on the site, run by
// the Cloudflare Worker. Same-origin JSON in, JSON out; validates, verifies
// the Turnstile token with the secret from the environment, then hands the
// enquiry to sendEnquiry() (lib/contact/send.ts), which is the developer's.
// Web-standard Request/Response only so scripts/contact.test.cjs can call
// POST directly.
const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });

export async function POST(req: Request): Promise<Response> {
  let input: unknown;
  try {
    input = await req.json();
  } catch {
    return json(400, { ok: false, error: "Please fill in the form." });
  }
  const v = validateEnquiry(input);
  if (!v.ok) return json(400, { ok: false, error: v.error });

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error("[contact] TURNSTILE_SECRET_KEY is not set; refusing to accept enquiries unverified");
    return json(500, { ok: false, error: "The form is not available right now. Please email us instead." });
  }
  const token = typeof (input as Record<string, unknown>).turnstileToken === "string" ? ((input as Record<string, unknown>).turnstileToken as string) : "";
  const ip = req.headers.get("cf-connecting-ip") || undefined;
  if (!token || !(await verifyTurnstile(token, secret, ip))) return json(403, { ok: false, error: "The security check did not pass. Please try again." });

  try {
    await sendEnquiry(v.enquiry);
  } catch (e) {
    console.error("[contact] sendEnquiry failed", e);
    return json(500, { ok: false, error: "We could not send your request. Please try again or email us." });
  }
  return json(200, { ok: true });
}
```

- [ ] **Step 7: Run** `npm test` — expected: all pass (5 tests).

- [ ] **Step 8: The form.** `ContactDialog.tsx`: in step 2, after the consent block:

```tsx
                  {/* Cloudflare Turnstile renders here when step 2 opens
                       (explicit render from ContactForm.jsx, site key from the
                       build). Empty when no site key is configured. */}
                  <div className="modal-field modal-turnstile"><div id="cf-turnstile"></div></div>
                  {/* Honeypot: never shown, never filled by a person. */}
                  <div className="cf-hp" aria-hidden="true"><label htmlFor="cf-website">Website</label><input id="cf-website" type="text" tabIndex={-1} autoComplete="off" /></div>
```

and before `.modal-actions`: `<p className="modal-error" id="cf-error" role="alert" hidden></p>`. Also fix the counter's initial text to `Step 1 of 2`.

`HomeBehaviours.tsx`: `<ContactForm turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""} />`.

`ContactForm.jsx`: signature `ContactForm({ turnstileSiteKey })`; after `var totalSteps`, add the Turnstile and submit machinery:

```js
      var errorEl = overlay.querySelector('#cf-error');
      var turnstileEl = overlay.querySelector('#cf-turnstile');
      var SITE_KEY = turnstileSiteKey || '';
      var widgetId = null;
      var sending = false;

      function showError(msg) { if (errorEl) { errorEl.textContent = msg; errorEl.hidden = false; } }
      function clearError() { if (errorEl) { errorEl.textContent = ''; errorEl.hidden = true; } }

      // Turnstile (11 Sep 2026): loaded the first time the dialog opens, not
      // with the page, and rendered explicitly when step 2 shows so the
      // widget measures itself in a visible container. No site key means no
      // widget and no script; the API then refuses in production, which is
      // the build-time warning in next.config.ts.
      function loadTurnstile(cb) {
        if (!SITE_KEY) return;
        if (window.turnstile) return cb();
        var existing = document.getElementById('cf-turnstile-script');
        if (existing) { existing.addEventListener('load', cb); return; }
        var s = document.createElement('script');
        s.id = 'cf-turnstile-script';
        s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        s.async = true; s.defer = true;
        s.addEventListener('load', cb);
        document.head.appendChild(s);
      }
      function renderTurnstile() {
        if (!SITE_KEY || !turnstileEl) return;
        loadTurnstile(function () {
          if (widgetId !== null) { window.turnstile.reset(widgetId); return; }
          widgetId = window.turnstile.render(turnstileEl, {
            sitekey: SITE_KEY,
            theme: document.documentElement.getAttribute('data-theme') || 'auto',
            'error-callback': function () { showError('The security check could not load. Please try again.'); },
          });
        });
      }
      function resetTurnstile() { if (widgetId !== null && window.turnstile) window.turnstile.reset(widgetId); }
      function turnstileToken() { return (widgetId !== null && window.turnstile) ? (window.turnstile.getResponse(widgetId) || '') : ''; }

      function payload() {
        var g = function (id) { var el = overlay.querySelector('#' + id); return el ? el.value : ''; };
        return {
          firstName: g('cf-first'), lastName: g('cf-last'), email: g('cf-email'), phone: g('cf-phone'),
          company: g('cf-company'), message: g('cf-message'),
          consent: !!(overlay.querySelector('#cf-consent') || {}).checked,
          website: g('cf-website'),
          turnstileToken: turnstileToken()
        };
      }
```

In `showStep(n)`: `if (n === totalSteps) renderTurnstile(); clearError();`. In `closeModal()`: `resetTurnstile(); clearError();`. Replace the submit handler:

```js
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!currentStepIsValid() || sending) return;
        if (SITE_KEY && !turnstileToken()) { showError('Please wait for the security check to finish, then try again.'); return; }
        sending = true;
        submitBtn.disabled = true;
        var label = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        clearError();
        var fallback = 'We could not send your request. Please try again or email us.';
        fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload()) })
          .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok && j.ok === true, error: j.error }; }); })
          .then(function (res) {
            if (res.ok) { panel.classList.add('sent'); doneBtn.focus(); }
            else { showError(res.error || fallback); resetTurnstile(); }
          })
          .catch(function () { showError(fallback); resetTurnstile(); })
          .then(function () { sending = false; submitBtn.disabled = false; submitBtn.textContent = label; });
      });
```

CSS (append): `.modal-error { color: var(--error); font-size: 13.5px; font-weight: 500; margin: -4px 0 14px; }`, `.cf-hp { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; }`, `.modal-turnstile { min-height: 0; }`, and `--error: #ff8080` on `:root` with `--error: #b3261e` in both light blocks (6.6:1 and 6.1:1).

- [ ] **Step 9: CSP and env.** `next.config.ts`: `const TURNSTILE = "https://challenges.cloudflare.com";`, `script-src` gains ` ${TURNSTILE}`, `frame-src 'none'` becomes `` `frame-src ${TURNSTILE}` ``; a second warning:

```ts
if (!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && process.env.NODE_ENV === "production" && !NOINDEX) {
  console.warn("\n[digiblu] NEXT_PUBLIC_TURNSTILE_SITE_KEY is not set: the contact form will render no security check and the API will refuse every enquiry. Set it in the build variables for production, and TURNSTILE_SECRET_KEY as a Worker secret.\n");
}
```

`.env.example` gains:

```
# Cloudflare Turnstile, the contact form's bot check (11 Sep 2026). The site
# key is public and inlined into the page at build time; the secret is used
# only by the API route and must be a Worker secret in production
# (wrangler secret put TURNSTILE_SECRET_KEY), never a build variable.
# These are Cloudflare's documented test keys: the widget always passes and
# the verify call always succeeds. Production keys come from DigiBlu's
# developer (Cloudflare dashboard > Turnstile > Add widget, hostname digiblu.com).
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

`.env.local` gains the same two lines. `wrangler.jsonc` comment: "TURNSTILE_SECRET_KEY is a secret (wrangler secret put); NEXT_PUBLIC_* values are build variables."

- [ ] **Step 10: Verify on the dev server** (fresh load): open the dialog, step 2 shows the Turnstile widget (test key, passes on its own), submit with names and email; the network shows `POST /api/contact` 200 and the success screen; submit with the honeypot filled via the console shows the error line and no success; with the dev server's `TURNSTILE_SECRET_KEY` removed the API answers 500 and the form shows the error. Check `document.cookie` and the Cloudflare docs for whether Turnstile sets a cookie; write the answer into the policy in Task 7.
- [ ] **Step 11: Commit** `git commit -am "Contact API with Turnstile; the form posts to it"`.

---

### Task 5: Post-build page test

**Files:**
- Create: `scripts/pages.test.cjs`
- Modify: `package.json` (`test:pages`), `.github/workflows/ci.yml` (run it after the build)

- [ ] **Step 1: The test**

```js
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

// Runs against the prerendered output of `next build` (.next/server/app):
// what a crawler, a share preview and a visitor without JavaScript get.
// npm run test:pages, after npm run build. CI runs it after the build.
const APP = path.join(__dirname, "..", ".next", "server", "app");
const PUBLIC = path.join(__dirname, "..", "public");
const { buildContent } = require("./build-content.cjs");
const c = buildContent();
const ORIGIN = (process.env.SITE_ORIGIN || "https://digiblu.com").replace(/\/+$/, "");

const html = (route) => fs.readFileSync(path.join(APP, route === "/" ? "index.html" : route.slice(1) + ".html"), "utf8");
const text = (h) => h.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
const meta = (h, attr, name) => { const m = h.match(new RegExp(`<meta[^>]*${attr}="${name}"[^>]*content="([^"]*)"`)) || h.match(new RegExp(`<meta[^>]*content="([^"]*)"[^>]*${attr}="${name}"`)); return m ? m[1] : null; };
const canonical = (h) => { const m = h.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"/); return m ? m[1] : null; };
const title = (h) => (h.match(/<title>([^<]*)<\/title>/) || [])[1];

const pages = ["/", "/services", "/team", "/accreditations", "/case-studies", ...c.caseStudies.map((x) => "/case-studies/" + x.key), ...c.legalDocs.map((d) => "/legal/" + d.slug)];

test("a build exists", () => { assert.ok(fs.existsSync(path.join(APP, "index.html")), "run npm run build first"); });

test("every page: unique title, description, canonical on the origin, share card that exists, no dead host", () => {
  const titles = new Set();
  for (const p of pages) {
    const h = html(p);
    const t = title(h); assert.ok(t && !titles.has(t), p + " title"); titles.add(t);
    const d = meta(h, "name", "description"); assert.ok(d && d.length >= 50 && d.length <= 160, p + " description length " + (d || "").length);
    assert.equal(canonical(h), ORIGIN + (p === "/" ? "/" : p), p + " canonical");
    const og = meta(h, "property", "og:image"); assert.ok(og && og.startsWith(ORIGIN + "/assets/"), p + " og:image " + og);
    assert.ok(fs.existsSync(path.join(PUBLIC, og.slice(ORIGIN.length))), p + " share card file " + og);
    assert.equal(meta(h, "property", "og:title"), t, p + " og:title");
    assert.ok(meta(h, "name", "twitter:card"), p + " twitter card");
    assert.ok(h.includes('type="application/ld+json"'), p + " json-ld");
    assert.ok(!h.includes("digibluuk.github.io"), p + " carries the retired host");
  }
});

test("the listing pages carry the content the dialogs show", () => {
  const s = text(html("/services")); for (const x of c.services) { assert.ok(s.includes(x.title), x.title); assert.ok(s.includes(text(x.sections[0].html).trim().slice(0, 40)), x.key + " section"); }
  const t = text(html("/team")); for (const m of c.team) { assert.ok(t.includes(m.name), m.name); assert.ok(t.includes(text(m.html).trim().slice(0, 40)), m.key + " bio"); }
  const a = text(html("/accreditations")); for (const x of c.accreditations) { assert.ok(a.includes(x.title), x.title); assert.ok(a.includes(text(x.html).trim().slice(0, 40)), x.key + " description"); }
  const cs = html("/case-studies"); for (const x of c.caseStudies) assert.ok(cs.includes(`href="/case-studies/${x.key}"`), x.key + " link");
});

test("the home page links to every listing page", () => {
  const h = html("/");
  for (const href of ["/services#ai", "/accreditations#9001", "/case-studies", "/team"]) assert.ok(h.includes(`href="${href}"`), href);
});

test("sitemap lists every page", () => {
  const p = ["sitemap.xml.body", "sitemap.xml", "sitemap.body"].map((f) => path.join(APP, f)).find(fs.existsSync);
  assert.ok(p, "sitemap output");
  const xml = fs.readFileSync(p, "utf8");
  for (const page of pages) assert.ok(xml.includes(`<loc>${ORIGIN}${page === "/" ? "/" : page}</loc>`), page);
});
```

- [ ] **Step 2: `package.json`** `"test:pages": "node --test scripts/pages.test.cjs"`; `ci.yml` adds `- run: npm run test:pages` after the Next build step (with the same `NEXT_PUBLIC_ROBOTS: noindex` env).
- [ ] **Step 3: Run** `npm run build && npm run test:pages` — expected: the share-card assertion fails for the four new pages until Task 6; everything else passes.
- [ ] **Step 4: Commit** `git commit -am "Post-build page test: metadata, share cards, content, sitemap"`.

---

### Task 6: Four share cards

**Files:**
- Create: `public/assets/og/services.jpg`, `team.jpg`, `accreditations.jpg`, `case-studies.jpg` (1200x630 JPEG, quality 0.86)
- Scratchpad: `og-receiver.cjs` accepts `?path=<name>` for the page cards (writes `public/assets/og/<name>.jpg`)

- [ ] **Step 1:** Extend the receiver: `POST /save?page=<name>` writes `public/assets/og/<name>.jpg` (same key regex). Start it (`node og-receiver.cjs`), open `http://localhost:4999/` in the Browser pane.
- [ ] **Step 2:** Run the canvas routine there for each card: hero.jpg cover-cropped to 1200x630, the hero's left-to-right scrim, the logo painted white through `logo-mask.png` at top-left, DM Sans loaded with `FontFace` from `/assets/dmsans.woff2`, an eyebrow ("DigiBlu"), a title wrapped at 800px and a one-line strapline:
  - services: "Our services", "AI, automation and digital transformation, from opportunity to managed service"
  - team: "Meet the leadership team", "Practitioners with client, technology and consultancy backgrounds"
  - accreditations: "Accredited and certified", "ISO 9001, 14001, 27001 and 42001, Cyber Essentials Plus, G-Cloud"
  - case-studies: "Case studies", "Ten engagements where our work made a measurable difference"
- [ ] **Step 3:** Verify each file is a JPEG of 1200x630 (SOF marker) and view one in the pane.
- [ ] **Step 4:** `npm run build && npm run test:pages` — expected: all pass.
- [ ] **Step 5: Commit** `git add public/assets/og && git commit -m "Share cards for the four listing pages"`.

---

### Task 7: Policy line, handover, status page

**Files:**
- Modify: `content/legal/privacy-policy.md` (section 12: Turnstile; the enquiry sentence), `content/legal/accessibility-statement.md` (no change unless the form's behaviour changed), `CLAUDE.md`, `README.md`, `docs/redirects/README.md`
- Status page in the scratchpad, republished.

- [ ] **Step 1:** Section 12 gains, after "No advertising or marketing cookies", a paragraph: "Our contact form. When you send an enquiry, Cloudflare Turnstile checks that the request comes from a person and not an automated script; [what Turnstile stores, from the verification in Task 4 step 10]. The details you enter are sent to us and used only to respond to your enquiry, as described in section 3." (The developer's email step is what "sent to us" will mean; the sentence is true of the mechanism.) Update `scripts/content.test.cjs` if the section 12 assertion needs it.
- [ ] **Step 2:** `CLAUDE.md`: a "Pages over dialogs (11 Sep 2026)" section (why, what, the link-plus-dialog pattern, the four pages, the tests, the origin default, the redirect map), a "Contact API" subsection (files, contract, Turnstile keys, what the developer fills in, the CSP change), the Files table and the runbook (Turnstile keys in step 1; step 5 rewritten as done except the ACS call). `README.md`: one paragraph. Runbook variables: `NEXT_PUBLIC_TURNSTILE_SITE_KEY` build variable, `TURNSTILE_SECRET_KEY` secret.
- [ ] **Step 3:** Status page: Part 1 gains the review response (pages, metadata, contact API); Part 2: the contact blocker reworded (site side done; developer's ACS call and the two Turnstile keys remain), a task for the developer's keys, the redirect upload item mentions the new targets.
- [ ] **Step 4:** `npm test && npm run build && npm run test:pages && npm run build:cf`; commit `git commit -am "Handover, policy section 12 and status for the review response"`; push `dev`.

---

## Self-review

- Requirement 1: Tasks 2 and 3. Requirement 2: nothing touches the dialog's existence; the form stays in it (Task 4 edits it in place). Requirement 3: Task 1 (origin), Task 2 (metadata), Task 5 (the test), Task 6 (cards). Requirement 4: Task 4. Requirement 5: untouched.
- No placeholders: every code step carries its code; the two prose steps in Task 7 name the exact files and sentences.
- Names used across tasks: `validateEnquiry`, `verifyTurnstile`, `sendEnquiry`, `POST`, `PageIntro`, `TeamMember.key`, `.page-list`/`.page-item`, `#cf-turnstile`, `#cf-error`, `#cf-website`, `turnstileSiteKey` prop: consistent.
