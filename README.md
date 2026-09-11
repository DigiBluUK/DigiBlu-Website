# DigiBlu Website

Marketing site for **DigiBlu**, a UK AI and digital transformation consultancy: [digiblu.com](https://www.digiblu.com).

A Next.js 16 App Router site. Every page is prerendered at build time; the runtime (OpenNext on Cloudflare Workers) is configured so a route can render on demand if one ever needs to. Content is markdown. The stylesheet and the interaction code are the original hand-built site's, carried across verbatim.

## Structure

```
app/                   Routes: the home page, /services, /team, /accreditations, /case-studies and /case-studies/[key],
                       /legal/[slug], /contact, /api/contact (the one dynamic route), sitemap, robots
components/            Server components for the markup; components/behaviours/ for the client-side behaviour
content/               The authored content as markdown with front matter (case studies, services, legal, team, accreditations)
lib/                   Site constants (lib/site.ts), the typed content loaders (lib/content.ts), the contact API's pieces (lib/contact/)
public/assets/         Everything the pages reference: artwork, photography, logos, the font
source/                The supplied team photographs the shipped headshots were made from
scripts/               Build-time scripts and their tests (node --test)
docs/                  Implementation plans, the sign-off checklist, the redirect list, and the delivery playbook (website-delivery-playbook.md)
open-next.config.ts    Cloudflare Workers runtime via OpenNext
wrangler.jsonc         Worker configuration (no account details yet)
```

The original hand-built static site was retired from the tree on 10 September 2026; `v2.2.0` is the first release without it, and everything up to `v2.1.0` still carries it in git history.

## Working on it

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # the content build and the contact API
npm run build        # prerenders every route
npm run test:pages   # after a build: metadata, share cards and content of every prerendered page
```

Content lives in `content/<type>/<key>.md`. Front-matter values are JSON-quoted strings, so any character in the copy is safe. `npm run content` folds the markdown into the module the pages import; `build` and `test` run it for you.

To try the Cloudflare Worker locally:

```bash
npm run preview:cf   # builds the Worker, populates its prerender cache, serves it with wrangler
```

## Consent and analytics

Cookie consent is `lib/consent/` plus `components/consent/`: vanilla-cookieconsent configured from `lib/consent/config.ts`, Google Consent Mode v2 defaults set in the document head, and a GA4 loader that runs only after analytics is allowed. Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` (see `.env.example`); leave it empty to build without analytics. To reuse on another site, copy the two folders, the head script line in `app/layout.tsx`, the `<Consent />` mount and the footer's `<CookieSettingsLink />`, then edit `config.ts`.

## Branches and releases

| Branch | Role |
|---|---|
| `dev` | Integration and UAT. Day-to-day work lands here. |
| `main` | Production: the release that is live. Only moves at a release, which is tagged. |

Releasing is a merge of `dev` into `main` plus a version tag. `v1.0.0` is the original static site; `v2.0.0` is the Next.js rebuild; `v2.2.0` retires the old site's files from the tree.

## Status

Not yet deployed: Cloudflare is not connected and digiblu.com still points at the previous site. **The contact form posts to `/api/contact`**, which validates the enquiry, verifies Cloudflare Turnstile and hands it to `sendEnquiry()` in `lib/contact/send.ts`; that function only records that an enquiry arrived until the Azure Communication Services call is added there, and the Turnstile keys (`.env.example`) must be set in Cloudflare. Do both before sharing this outside the team.

## Full technical notes

[`CLAUDE.md`](./CLAUDE.md) has the complete build history, the design-system reference, every non-obvious decision, and the cut-over runbook. [`BRAND.md`](./BRAND.md) is the brand guide as built. Read `CLAUDE.md` before making significant changes.
