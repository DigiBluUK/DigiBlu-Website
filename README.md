# DigiBlu Website

Marketing site for **DigiBlu**, a UK AI and digital transformation consultancy: [digiblu.com](https://www.digiblu.com).

A Next.js 16 App Router site. Every page is prerendered at build time; the runtime (OpenNext on Cloudflare Workers) is configured so a route can render on demand if one ever needs to. Content is markdown. The stylesheet and the interaction code are the original hand-built site's, carried across verbatim.

## Structure

```
app/                   Routes: the home page, /case-studies/[key], /legal/[slug], sitemap, robots
components/            Server components for the markup; components/behaviours/ for the client-side behaviour
content/               The authored content as markdown with front matter (case studies, services, legal, team, accreditations)
lib/                   Site constants (lib/site.ts) and the typed content loaders (lib/content.ts)
public/assets/         Everything the pages reference: artwork, photography, logos, the font
scripts/               Build-time scripts and their tests (node --test)
docs/                  Implementation plans and the sign-off checklist
open-next.config.ts    Cloudflare Workers runtime via OpenNext
wrangler.jsonc         Worker configuration (no account details yet)
```

The old static site (`index.html`, `assets/`, `generate-static-pages.js`, the generated `case-studies/` and `legal/` folders, `digiblu-site.html`) is still in the tree as the reference the port was checked against. It is retired at cut-over; see the runbook in `CLAUDE.md`.

## Working on it

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # the build-time scripts
npm run build        # prerenders every route
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

Releasing is a merge of `dev` into `main` plus a version tag. `v1.0.0` is the original static site; `v2.0.0` is the Next.js rebuild.

## Status

Not yet deployed: Cloudflare is not connected and digiblu.com still points at the previous site. **The contact form does not send anywhere.** Submitting it shows a success screen and nothing is transmitted; the Azure Communication Services endpoint is a separate piece of work. Wire that up before sharing this outside the team.

## Full technical notes

[`CLAUDE.md`](./CLAUDE.md) has the complete build history, the design-system reference, every non-obvious decision, and the cut-over runbook. [`BRAND.md`](./BRAND.md) is the brand guide as built. Read `CLAUDE.md` before making significant changes.
