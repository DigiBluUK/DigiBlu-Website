# DigiBlu website

Marketing site for DigiBlu (digiblu.com), a UK AI and digital transformation consultancy. A Next.js 16 App Router app deployed on Cloudflare Workers through **vinext**. Content is markdown; the stylesheet and the interaction scripts are the original hand-built site's, carried across verbatim.

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
- **digiblu.com still points at the old Wix site.** The DNS switch is coordinated with Radu. Before it: confirm the production build variables, and upload `docs/redirects/old-site-redirects.csv` as a Cloudflare Bulk Redirects list.

## Layout

| Path | Holds |
|---|---|
| `app/` | Routes: home, `/services`, `/team`, `/accreditations`, `/case-studies` and `/case-studies/[key]`, `/legal/[slug]`, `/contact`, `/api/contact` (the one dynamic route), `not-found`, `sitemap`, `robots`. `app/globals.css` is the whole stylesheet. |
| `components/` | Server components for the markup (`sections/`, `dialogs/`, footer, page chrome); `behaviours/*.jsx` are the ported scripts, mounted by `HomeBehaviours.tsx` and `PageBehaviours.tsx`. |
| `content/` | **The source of truth for copy**: `case-studies/` (10), `services/` (6), `legal/` (6), `team/` (8), `accreditations/` (6), `lattice.json` (the About figure). |
| `lib/` | `site.ts` (origin), `content.ts` (typed loaders), `contact/` (validate, Turnstile, send), `consent/`, `client/` (modal controller, About pin). |
| `public/assets/` | Everything the pages reference. Edit and add files here directly. |
| `source/` | The supplied team photographs the headshots were made from. |
| `scripts/` | `build-content.cjs` and the three test files. |
| `docs/` | `notes/` (the detail), `redirects/`, `parity-checklist.md`, `superpowers/plans/`. |

## How things work

- **Content**: `content/**/*.md` with JSON-quoted front matter. `pnpm content` folds it into `content/.generated/content.json` (gitignored), which the pages import - the Worker has no disk. A new case study needs its markdown, a 1600x600 photo in `public/assets/case-studies/` and a 1200x630 share card in `public/assets/og/case-studies/`. `quote: null` when there is no quote.
- **Pages, and one dialog**: every service, case study, bio, accreditation and legal document is on its own page and nowhere else; the home page links to them (on the `pages-only` branch since 18 Sep 2026, at Radu's request, replacing DigiBlu's "Option A" dialogs). The contact form is the one dialog, and also a page (`/contact`). The team strip's desktop card still shows each bio; opening a profile goes to `/team#<key>`. `pnpm test:pages` fails if document content reaches the home page again.
- **Contact form**: `POST /api/contact` validates (`lib/contact/validate.ts`), verifies Cloudflare Turnstile (`lib/contact/turnstile.ts`) and sends through Azure Communication Services (`lib/contact/send.ts`, Radu's) to `Digiblu_Website_Contact_Us@digiblu.com` with reply-to set to the sender. Delivery is not awaited: **a failed email shows only in Cloudflare Observability**. Variables: `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`, `AZURE_COMMUNICATION_SERVICES_CONNECTION_STRING`, `CONTACT_FORM_SENDER_EMAIL_ADDRESS`, `CONTACT_FORM_RECIPIENT_EMAIL_ADDRESS` (`.env.example` documents each; secrets are Worker secrets).
- **Consent and analytics**: vanilla-cookieconsent with Google Consent Mode v2; GA4 (`G-RVNLDVSLJ8`, from `NEXT_PUBLIC_GA_MEASUREMENT_ID` only) loads nothing until a visitor allows analytics. Section 12 of the Privacy and Cookies Policy describes exactly what the site stores: change it together with `lib/consent/config.ts`.
- **Headers and indexing**: `next.config.ts` sets the CSP and security headers on every route (checked under vinext on 18 Sep 2026, 404s included). `NEXT_PUBLIC_ROBOTS=noindex` on non-production builds disallows crawling. `SITE_ORIGIN` defaults to `https://digiblu.com`.

## Rules

**Content**
- No em dashes in visible copy; use a spaced hyphen.
- No fabricated people, quotes, figures or clients. Real, published names are fine.
- Real links only.
- Third-party article content is condensed, never copied. Legal text is verbatim and complete; a gap in DigiBlu's own source is noted, never filled. Sections 12 and 13 of the Privacy and Cookies Policy are ours (approved by DigiBlu): keep them true.
- Anonymised clients stay anonymous in copy and imagery: the healthcare workforce provider, the US city agency, and NSM (shown as "Mobility equipment manufacturer").
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
- Baseline to keep: no contrast failures in either theme, no horizontal overflow from 320 to 1895px, tap targets at least 24px, dialogs leave no `inert` behind.

## Open items (18 Sep 2026)

- Dialogs to pages (Radu): built on the `pages-only` branch (preview `https://pages-only-digiblu-website.radu-ghitescu.workers.dev/`), keeping the contact form as a dialog; awaiting DigiBlu's decision. `dev` still has the dialogs. If approved, merge `pages-only` into `dev`; if not, delete the branch.
- The Privacy and Cookies Policy names Microsoft (Azure Communication Services) as the service that emails enquiries to DigiBlu: on `dev` in section 12, dated 18 September 2026, awaiting DigiBlu's approval with the rest of that paragraph (the Turnstile part is unapproved too). Section 15 (DigiBlu's text) still says the websites are hosted in the UK, which is no longer accurate on Cloudflare Workers: DigiBlu's to change.
- The NSM case study's quote is the brief's example, attributed to Tim Sunley: unconfirmed.
- `dev` is ahead of `main` with approved work (the Safari Destinations correction, contact-form spacing): release pending, then the DNS switch.
- David's and Karen's headshots are old 560px crops; re-source them as cut-outs.
- The generators for the About figure, the headshots and the share cards were one-off scripts in a session scratchpad and are not in the repo.

## Notes

| File | Covers |
|---|---|
| `docs/notes/sections.md` | Every home-page section and dialog: behaviour, reasoning, what was reverted, known traps |
| `docs/notes/design-system.md` | Each design token and why it has its value |
| `docs/notes/consent-and-contact.md` | Consent and analytics, pages under the dialogs, the contact API |
| `docs/notes/content-and-seo.md` | Content sources and policy, legal text handling, SEO |
| `docs/notes/platform.md` | The Next.js port, hardening, Lighthouse, the cut-over runbook, the retired static site |
| `docs/notes/qa.md` | The audit baseline, preview-environment traps, what was deliberately not done |
