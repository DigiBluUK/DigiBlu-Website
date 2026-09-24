# DigiBlu website

Marketing site for DigiBlu (www.digiblu.com), a UK AI and digital transformation consultancy. A Next.js 16 App Router app deployed on Cloudflare Workers through **vinext**. Content is markdown; the stylesheet and the interaction scripts are the original hand-built site's, carried across verbatim.

**This file is the current summary. Keep it that way:** put detail and history in `docs/notes/`, not here (it reached 161KB once and was cut down on 18 Sep 2026 at DigiBlu's developer's request). Before changing an area, read its note (index at the end). `BRAND.md` is the design system; `README.md` the quick start.

## Commands

pnpm is the package manager. It is not installed globally here: run it as `npx -y pnpm@latest <script>`.

| Command | Does |
|---|---|
| `pnpm test` | builds the content module, then the content and contact-API tests |
| `pnpm build`, then `pnpm test:pages` | Next build, then the page tests over its output (titles, descriptions, canonicals, share cards, JSON-LD, sitemap, listing-page content) |
| `pnpm build:vinext` | the production build Cloudflare runs, into `dist/` |
| `pnpm dev` | Next dev server on 3000 |

Browser pane launch configs (`.claude/launch.json`): `digiblu-next` (`next dev`, 3000) and `digiblu-vinext` (the built Worker through wrangler, 8787; run `pnpm build:vinext` first, and stop the server before rebuilding - wrangler locks `dist/`). **Verify behaviour in `digiblu-vinext`**: it is what visitors get. vinext prerenders only one route and renders the rest on request, then caches them, so `next build` is not the deployed behaviour.

## Environments and releases

- **`dev` is UAT, `main` is production.** Work on `dev` and push to `origin dev`. A release is DigiBlu's call: fast-forward `main` to `dev`, tag, push.
- **Cloudflare Workers Builds deploys every push** (set up by Radu, DigiBlu's developer, on 14 Sep 2026): `main` to `https://digiblu-website.radu-ghitescu.workers.dev/`, any other branch to `https://<branch>-digiblu-website.radu-ghitescu.workers.dev/` - a hyphen before `digiblu-website`, not a dot (the dotted form fails TLS). All are behind Cloudflare Access (a DigiBlu login), so they cannot be fetched from this machine; ask the user to check them.
- **There is no CI and no test gate: a push to `main` deploys.** Run the tests before a release.
- **Radu sometimes commits straight to `main`.** Before a release, `git log dev..origin/main`, and bring anything there into `dev` first.
- **www.digiblu.com still points at the old Wix site** (the canonical host: digiblu.com redirects to it). The DNS switch is coordinated with Radu. Before it: confirm the production build variables, and upload `docs/redirects/old-site-redirects.csv` as a Cloudflare Bulk Redirects list.

## Layout

| Path | Holds |
|---|---|
| `app/` | Routes: home, `/services`, `/team`, `/accreditations`, `/case-studies` and `/case-studies/[key]`, `/legal/[slug]`, `/contact`, `/api/contact` (the one dynamic route), `not-found`, `sitemap`, `robots`. `app/globals.css` is the whole stylesheet. |
| `components/` | Server components for the markup (`sections/`, footer, page chrome, the contact form's body); `behaviours/*.jsx` are the ported scripts, mounted by `HomeBehaviours.tsx` and `PageBehaviours.tsx`. |
| `content/` | **The source of truth for copy**: `case-studies/` (9), `services/` (6), `legal/` (6), `team/` (8), `accreditations/` (6), `lattice.json` (the About figure). |
| `lib/` | `site.ts` (origin), `content.ts` (typed loaders), `contact/` (validate, Turnstile, send), `consent/`, `client/` (`once.ts`, the About pin). |
| `public/assets/` | Everything the pages reference. Edit and add files here directly. |
| `source/` | Not served: the supplied team photographs the headshots were made from, and `hero.jpg` / `footer-bg.jpg`, the rasters the hero and case-study art were traced from (the share cards were built from `hero.jpg`). |
| `scripts/` | `build-content.cjs` and the three test files. |
| `docs/` | `notes/` (the detail), `redirects/` (the old site's addresses, for the DNS switch), `parity-checklist.md` (the release sign-off list). |

## How things work

- **Content**: `content/**/*.md` with JSON-quoted front matter. `pnpm content` folds it into `content/.generated/content.json` (gitignored), which the pages import - the Worker has no disk. A new case study needs its markdown, a 1600x600 photo in `public/assets/case-studies/` and a 1200x630 share card in `public/assets/og/case-studies/`. `quote: null` when there is no quote.
- **Pages, no dialogs**: every service, case study, bio, accreditation and legal document, and the contact form, is on its own page and nowhere else; the home page links to them (at Radu's request, replacing DigiBlu's "Option A" dialogs; built on the `pages-only` branch on 18 Sep 2026 and merged into `dev` on 21 Sep 2026 with DigiBlu's approval). The team strip's desktop card still shows each bio; opening a profile goes to `/team#<key>`. `pnpm test:pages` fails if a dialog, the form or document content reaches the home page again.
- **Contact form**: `POST /api/contact` validates (`lib/contact/validate.ts`), verifies Cloudflare Turnstile (`lib/contact/turnstile.ts`) and sends through Azure Communication Services (`lib/contact/send.ts`, Radu's) to `Digiblu_Website_Contact_Us@digiblu.com` with reply-to set to the sender. Delivery is not awaited: **a failed email shows only in Cloudflare Observability**, and errors are logged through `loggableError` (name, code, status and a message with access keys and addresses redacted), never raw. Variables: `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `AZURE_COMMUNICATION_SERVICES_CONNECTION_STRING`, `CONTACT_FORM_SENDER_EMAIL_ADDRESS`, `CONTACT_FORM_RECIPIENT_EMAIL_ADDRESS` (`.env.example` documents each; secrets are Worker secrets).
- **Consent and analytics**: vanilla-cookieconsent with Google Consent Mode v2; GA4 (`G-RVNLDVSLJ8`, from `NEXT_PUBLIC_GA_MEASUREMENT_ID` only) loads nothing until a visitor allows analytics. Section 12 of the Privacy and Cookies Policy describes exactly what the site stores and measures: change it together with `lib/consent/config.ts`. A successful enquiry sends a `generate_lead` event with no form content; DigiBlu marks it as a key event in GA4 Admin. Analytics is opt-in, so it undercounts: the enquiries mailbox is the true total.
- **Page chrome**: every standalone page has the home page's fixed, frosted nav (`PageHeader` sits in the same `.site-nav` wrapper; `main` is padded by the measured `--nav-h`) and the scroll-to-top disc (21 Sep 2026). The cookie banner is a compact box, bottom right (full width on a phone); the disc hides while it is up.
- **Headers and indexing**: `next.config.ts` sets the CSP and security headers on every route (checked under vinext on 18 Sep 2026, 404s included). `NEXT_PUBLIC_ROBOTS=noindex` on non-production builds disallows crawling. `SITE_ORIGIN` defaults to `https://www.digiblu.com` (since 24 Sep 2026: the host the old site is indexed under). `/sitemap.xml` carries a `lastmod` per URL, from the git history of the files each page is made from (`scripts/build-content.cjs`).

## Rules

**Content**
- No em dashes in visible copy; use a spaced hyphen.
- No fabricated people, quotes, figures or clients. Real, published names are fine.
- Real links only.
- Third-party article content is condensed, never copied. Legal text is verbatim and complete; a gap in DigiBlu's own source is noted, never filled. Sections 12 and 13 of the Privacy and Cookies Policy are ours (approved by DigiBlu): keep them true.
- Anonymised clients stay anonymous: the healthcare workforce provider and the US city agency (and the mobility equipment manufacturer, whose case study was removed on 23 Sep 2026; if it returns, it stays anonymised). **The GitHub repository is public**, so this covers every file, notes and commit messages included: never write their real names, or anything that links one to its case study. (The home page's client logo strip may show clients by name; it never ties one to a case study.)
- Photography must be licensed for commercial use without attribution, and must carry no other organisation's branding. Look at a candidate before proposing it; alt text is not a branding check.

**Design** (`BRAND.md` has the system)
- Colour through tokens, never a literal `#fff`/`#000`; muted text through `--ink-a-*` (the light-theme values are higher on purpose, for AA).
- Every section pads `var(--section-y) var(--gutter)` on the section itself; headings take `--head-gap`.
- There is no global `h1`/`h2` rule: scope one for any new container. Check child-combinator selectors whenever a wrapper is added.
- Hidden states are added by script, never authored in markup; everything respects `prefers-reduced-motion`. Animate `opacity` and `transform` only.
- Never put a gradient under a transparent border (it shows as a ring); use `border: 0`.
- `url()` values in `globals.css` are absolute (`/assets/...`).

**Verification**
- Measure rather than eyeball: `getComputedStyle`, `getBoundingClientRect`, canvas pixel sampling.
- The Browser pane freezes CSS transitions at t=0 and throttles `requestAnimationFrame`: disable transitions before reading a style, await a frame after dispatching pointer events, and follow each `scrollTo` with `dispatchEvent(new Event('scroll'))` after forcing `scroll-behavior: auto`.
- Assert the absence of broken references rather than counting successes.
- Baseline to keep: no contrast failures in either theme, no horizontal overflow from 320 to 1895px, tap targets at least 24px, every control usable from the keyboard.

## Open items (23 Sep 2026)

- The Privacy and Cookies Policy names Microsoft (Azure Communication Services) as the service that emails enquiries to DigiBlu: on `dev` in section 12, dated 18 September 2026, awaiting DigiBlu's approval with the rest of that paragraph (the Turnstile part is unapproved too), and so is the Google Analytics line on counting enquiries. Section 15 no longer says the website is hosted in the UK (removed 24 Sep 2026 with DigiBlu's approval: Cloudflare serves it from its edge worldwide, so no hosting location can be claimed).
- The quote-processing case study was removed on 23 Sep 2026 (not approved by the client) and AssuranceSD is featured third again. Its markdown, photo and share card are in git history if it is approved later.
- For DigiBlu to decide (21 Sep 2026 review): two published quote credits differ from the team page (healthcare: "Dave Van der Westhuizen, Lead Consultant"; Old Mutual: "Jonathan Hinder, COO"); Special Olympics' stat reads "17,500" where the text says "more than 17,500"; "Northwest University" may officially be North-West University; the Carbon Reduction Plan (their text) gives net zero by 2050 and by the end of 2030, and 33.71 against 33.6 tCO2e.
- For Radu: `waitUntil` stops 30s after the response, so a slow send's outcome can go unlogged; whether to pin pnpm with a `packageManager` field (Workers Builds picks its own version); he wants a failed send's contact details in the logs so someone can follow up, which the current logging does not capture (tested 21 Sep 2026) - his change, and the privacy policy needs a line when he makes it. ACS stores nothing (Radu, 21 Sep 2026: a pass-through gateway in DigiBlu's Azure tenant), so the policy needs no data-location line. `react-server-dom-webpack` was pinned to 19.2.8 on 21 Sep 2026 to match React (it had resolved to 19.3.0, which requires React 19.3).
- The anonymised clients' real names are in the repository's history (removed from the files on 21 Sep 2026); making the repository private, or rewriting its history, is DigiBlu's call.
- Released to `main` as v2.5.1 on 24 Sep 2026 with Radu's pre-launch points (www.digiblu.com as the canonical host, no UK-hosting claim, sitemap lastmod), after v2.5.0 on 23 Sep 2026 (everything since v2.4.0: pages instead of dialogs, the Safari Destinations case study, the enquiry event, the page chrome and cookie banner, the 21 Sep 2026 review fixes, the policy lines above, and the quote-processing case study's removal). Next: the DNS switch with Radu, which DigiBlu gave the go-ahead for on 23 Sep 2026.
- David's and Karen's headshots are old 560px crops; re-source them as cut-outs.
- The generators for the About figure, the headshots and the share cards were one-off scripts in a session scratchpad and are not in the repo.

## Notes

| File | Covers |
|---|---|
| `docs/notes/sections.md` | Every home-page section (and the dialogs, as history): behaviour, reasoning, what was reverted, known traps |
| `docs/notes/design-system.md` | Each design token and why it has its value |
| `docs/notes/consent-and-contact.md` | Consent and analytics, the move from dialogs to pages, the contact API |
| `docs/notes/content-and-seo.md` | Content sources and policy, legal text handling, SEO |
| `docs/notes/platform.md` | The Next.js port, hardening, Lighthouse, the cut-over runbook, the retired static site |
| `docs/notes/qa.md` | The audit baseline, preview-environment traps, what was deliberately not done |
