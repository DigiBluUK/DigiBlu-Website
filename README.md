# DigiBlu Website

Marketing site for **DigiBlu**, a UK AI and digital transformation consultancy: [digiblu.com](https://www.digiblu.com).

A Next.js 16 App Router site on Cloudflare Workers through vinext, which prerenders one route and renders the rest on first request, then caches them. Content is markdown. The stylesheet and the interaction code are the original hand-built site's, carried across verbatim.

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
docs/                  notes/ (the dated detail behind every decision), parity-checklist.md (the release sign-off list)
                       and redirects/ (the old Wix addresses and where each goes, for the DNS switch)
vite.config.ts         vinext build and the Cloudflare adapters (KV cache, CDN cache)
wrangler.jsonc         Worker configuration (account details come from Workers Builds)
```

The original hand-built static site was retired from the tree on 10 September 2026; `v2.2.0` is the first release without it, and everything up to `v2.1.0` still carries it in git history.

## Working on it

pnpm is the package manager (`pnpm-lock.yaml`).

```bash
pnpm install
pnpm dev             # http://localhost:3000
pnpm test            # the content build and the contact API
pnpm build           # Next build
pnpm test:pages      # after a build: metadata, share cards and content of every page
```

Content lives in `content/<type>/<key>.md`. Front-matter values are JSON-quoted strings, so any character in the copy is safe. `pnpm content` folds the markdown into the module the pages import; `build` and `test` run it for you.

To try the Cloudflare Worker locally:

```bash
pnpm build:vinext    # content + vinext build into dist/
pnpm start:vinext    # serves the built Worker with wrangler
```

Deploys run through Cloudflare Workers Builds: build `pnpm build:vinext`, deploy
`npx vinext-cloudflare deploy --config dist/server/wrangler.json --skip-build`.
From this machine, `pnpm deploy:vinext` does both. `TURNSTILE_SECRET_KEY` is a
Worker secret, set in the dashboard (see `.env.example`).

## Consent and analytics

Cookie consent is `lib/consent/` plus `components/consent/`: vanilla-cookieconsent configured from `lib/consent/config.ts`, Google Consent Mode v2 defaults set in the document head, and a GA4 loader that runs only after analytics is allowed. Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` (see `.env.example`); leave it empty to build without analytics. To reuse on another site, copy the two folders, the head script line in `app/layout.tsx`, the `<Consent />` mount and the footer's `<CookieSettingsLink />`, then edit `config.ts`.

## Branches and releases

| Branch | Role |
|---|---|
| `dev` | Integration and UAT. Day-to-day work lands here. |
| `main` | Production: the release that is live. Only moves at a release, which is tagged. |

Releasing is a merge of `dev` into `main` plus a version tag. `v1.0.0` is the original static site; `v2.0.0` is the Next.js rebuild; `v2.2.0` retires the old site's files from the tree.

## Status

Deployed through Cloudflare Workers Builds since 14 September 2026: `main` to `digiblu-website.radu-ghitescu.workers.dev` and every other branch to `<branch>-digiblu-website.radu-ghitescu.workers.dev`, all behind Cloudflare Access. digiblu.com still points at the previous site until the DNS switch. **The contact form is live**: `/api/contact` validates the enquiry, verifies Cloudflare Turnstile and sends it through Azure Communication Services to DigiBlu's enquiries list.

## Technical notes

[`CLAUDE.md`](./CLAUDE.md) is the current summary: commands, environments, rules and open items. The detail behind every decision - section by section, the design tokens, consent and the contact API, content policy, the platform history and the cut-over runbook - is in [`docs/notes/`](./docs/notes/). [`BRAND.md`](./BRAND.md) is the brand guide as built. Read `CLAUDE.md`, then the relevant note, before making significant changes.
