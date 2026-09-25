# DigiBlu website

Marketing site for DigiBlu (www.digiblu.com), a UK AI and digital transformation consultancy. A Next.js 16 App Router app deployed on Cloudflare Workers through **vinext**. Content is markdown; the stylesheet and the interaction scripts are the original hand-built site's, carried across verbatim.

**This file is the current summary. Keep it that way:** put detail and history in `docs/notes/`, not here (it reached 161KB once and was cut down on 18 Sep 2026 at DigiBlu's developer's request). Before changing an area, read its note (index at the end). `BRAND.md` is the design system; `README.md` the quick start.

## Commands

pnpm is the package manager, pinned in `package.json` (`packageManager`). It is not installed globally here: run it as `npx -y pnpm@latest <script>`, which switches to the pinned version.

| Command | Does |
|---|---|
| `pnpm test` | builds the content module, then the content and contact-API tests |
| `pnpm build`, then `pnpm test:pages` | Next build, then the page tests over its output (titles, descriptions, canonicals, share cards, JSON-LD, sitemap, listing-page content) |
| `pnpm build:vinext` | the production build Cloudflare runs, into `dist/` |
| `pnpm dev` | Next dev server on 3000 |

Browser pane launch configs (`.claude/launch.json`): `digiblu-next` (`next dev`, 3000) and `digiblu-vinext` (the built Worker through wrangler, 8787; run `pnpm build:vinext` first, and stop the server before rebuilding - wrangler locks `dist/`). **Verify behaviour in `digiblu-vinext`**: it is what visitors get. vinext prerenders only one route and renders the rest on request, then caches them, so `next build` is not the deployed behaviour.

## Environments and releases

- **Live at https://www.digiblu.com since 25 Sep 2026.** `digiblu.com` redirects to `www`, and the old Wix addresses redirect through a Cloudflare Bulk Redirects list uploaded from `docs/redirects/old-site-redirects.csv` (both set up by Radu, DigiBlu's developer).
- **Deploys run in GitHub Actions** (`.github/workflows/deploy.yml`, Radu's, 25 Sep 2026; Cloudflare's own builds cannot deploy on tags):
  - a push to `main` builds with `NEXT_PUBLIC_ROBOTS=noindex` and deploys the preview, `https://dev-digiblu-website.digiblu.workers.dev/` (behind Cloudflare Access: a DigiBlu Cloudflare account, so it cannot be fetched from this machine; ask the user to check it);
  - **a pushed tag starting with `v` deploys to production.** Semantic versions; v2.6.0 was the first published release.
- **Work on `main`: a push is a preview, a tag is a release.** Tag only when DigiBlu says release: `git tag -a vX.Y.Z -m "..." && git push origin vX.Y.Z`. The `dev` branch no longer deploys anything and is behind `main`: do not work on it.
- **The pipeline runs no tests.** Before tagging: `pnpm test`, `pnpm build` then `pnpm test:pages`, and a check in `digiblu-vinext`. After tagging, follow the run at https://github.com/DigiBluUK/DigiBlu-Website/actions (the repository is public, so the API answers without a login), then check the live site.
- **Radu commits to `main` too:** `git fetch` and fast-forward before starting work.
- **Configuration:** the build variables (`NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`) are GitHub repository variables; runtime variables and secrets live in the Cloudflare dashboard, and `keep_vars` in `wrangler.jsonc` stops a deploy removing them. Never add `vars` to `wrangler.jsonc`.

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
| `docs/` | `notes/` (the detail), `redirects/` (the old site's addresses, live as a Cloudflare Bulk Redirects list since 25 Sep 2026), `parity-checklist.md` (the sign-off list). |
| `.github/workflows/deploy.yml` | The deploy pipeline (Radu's): preview on a push to `main`, production on a `v*` tag. |

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
- Anonymised clients stay anonymous: the healthcare workforce provider and the US city agency.
- **A client's name, logo or case study appears only with the client's approval.** A case study (23 Sep 2026) and a logo (25 Sep 2026) were removed for want of it; restore neither until DigiBlu confirms the approval. **The GitHub repository is public**, so this covers every file, notes and commit messages included: never write their real names, or anything that links one to its case study. (The home page's client logo strip may show clients by name; it never ties one to a case study.)
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

## Open items (25 Sep 2026)

- The Privacy and Cookies Policy names Microsoft (Azure Communication Services) as the service that emails enquiries to DigiBlu (section 12, live since v2.5.0), with the Turnstile paragraph and the Google Analytics line on counting enquiries: none formally approved by DigiBlu yet. Section 15 makes no claim about where the site is hosted (removed 24 Sep 2026 with DigiBlu's approval: Cloudflare serves it from its edge worldwide).
- The About section's dot figure overflows the page between about 901 and 1190px wide (a 1024px tablet in landscape scrolls sideways), since 8 Sep 2026: `.about-top`'s second column is `minmax(0, 1fr)`, which collapses to nothing when the text column takes the space, while the figure keeps its 210px or more. `minmax(0, 860px) auto` fixes it (found 25 Sep 2026, not yet made).
- Every sitemap `lastmod` on the live site is the deploy commit's date: `actions/checkout` fetches one commit, so the git history `build-content.cjs` reads is not there. `fetch-depth: 0` on both checkout steps fixes it (Radu's file).
- For DigiBlu to decide (21 Sep 2026 review): two published quote credits differ from the team page (healthcare: "Dave Van der Westhuizen, Lead Consultant"; Old Mutual: "Jonathan Hinder, COO"); Special Olympics' stat reads "17,500" where the text says "more than 17,500"; "Northwest University" may officially be North-West University; the Carbon Reduction Plan (their text) gives net zero by 2050 and by the end of 2030, and 33.71 against 33.6 tCO2e.
- For Radu: `waitUntil` stops 30s after the response, so a slow send's outcome can go unlogged; he wants a failed send's contact details in the logs so someone can follow up, which the current logging does not capture (tested 21 Sep 2026) - his change, and the privacy policy needs a line when he makes it. ACS stores nothing (a pass-through gateway in DigiBlu's Azure tenant), so the policy needs no data-location line.
- The `dev` branch is unused since 25 Sep 2026 (`main` is the preview); delete it when DigiBlu agrees.
- Names removed from the files at clients' request are still in the public repository's history; making the repository private, or rewriting its history, is DigiBlu's call.
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
