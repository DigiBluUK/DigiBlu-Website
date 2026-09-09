# Parity Sign-off and Cut-over Prep (Priority 5) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prove the Next.js site is a like-for-like replacement across viewports, themes and the Cloudflare Worker packaging, give DigiBlu a checklist to sign it off against, and write the cut-over runbook, without touching `main`, DNS or a Cloudflare account.

**Architecture:** Nothing new is built. The Worker bundle from `npm run build:cf` is run locally by wrangler and fetched route by route; the dev site is swept at the audit-baseline widths in both themes with the same measurements the old site was held to; the sign-off checklist is written for a person with a browser, from the behaviours `CLAUDE.md` documents; the runbook lists the exact cut-over steps and the old files that go.

**Spec:** `CLAUDE.md` "Audit baseline" (contrast 0 failures both themes, no horizontal overflow at 320/375/390/740/1440/1895, tap targets at least 24px, all dialogs clean), "Branches and releases", and the 9 Sep 2026 decisions.

## Global Constraints

- Branch `next`. `main` and `dev` untouched. No Cloudflare account, no DNS change, no deploy.
- The old files stay until cut-over; the runbook says what goes, the plan does not delete them.
- Commit after every task with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

---

### Task 1: The Worker serves the site

- [ ] **Step 1**: `npm run build:cf` (fresh), then start the local Worker: `npx wrangler dev --port 8787` in the background (it reads `wrangler.jsonc` and serves `.open-next/worker.js` with the assets binding).
- [ ] **Step 2**: Fetch and check status and a marker on each: `/` (200, contains `Applied AI, real ROI`), `/case-studies/sse-ovo` (200, `<h1>Automating`), `/legal/privacy-policy` (200, `Privacy Policy`), `/sitemap.xml` (200, 14 `<loc>`), `/robots.txt` (200, `Sitemap:`), `/assets/hero.svg` (200, `image/svg+xml`), `/assets/team/vic-gysin.png` (200), `/nope` (404).
- [ ] **Step 3**: Stop the Worker. Record the results in the runbook (Task 4).

### Task 2: Viewport and theme sweep

- [ ] **Step 1**: On `http://localhost:3000/`, at 320, 375, 390, 740, 1440 and 1895px wide: `document.documentElement.scrollWidth - innerWidth` is 0; the mobile menu opens and closes below 900; the nav CTA is present at every width.
- [ ] **Step 2**: Light theme (`data-theme="light"`): sample the contrast of the values numerals, the "Our values" label, footer text, the nav links over the scrolled glass and the case-stat pills, computing from the rendered colours (all at or above the thresholds the old site met: 4.5:1 for small text, 3:1 for large).
- [ ] **Step 3**: Tap targets: every `button`, `a` and `input` inside `main`, `footer` and the dialogs has a bounding box at least 24px in both axes when visible (the `.service-learn-more` overlay trick counts as the old site's).

### Task 3: The sign-off checklist

- [ ] **Step 1**: Write `docs/parity-checklist.md`: one line per visible behaviour, phrased for a person with a browser (what to do, what to expect), grouped by section, both themes, phone and desktop, with the URL of the preview to check against. Derived from `CLAUDE.md` Page structure and Dialogs.
- [ ] **Step 2**: Commit.

### Task 4: The cut-over runbook

- [ ] **Step 1**: Add "Cut-over runbook" to `CLAUDE.md` after "Next.js port": the Cloudflare steps (Workers Builds connected to the GitHub repo, production branch `main`, preview branches `dev` and `next`, `SITE_ORIGIN=https://digiblu.com` as a build variable, custom domain, DNS), the merge and tag (`next` into `dev`, sign-off on the preview, `dev` into `main`, `v2.0.0`), and the removals that happen in the same release: `index.html`, `digiblu-site.html`, `generate-static-pages.js`, `case-studies/*.html`, `legal/*.html`, `sitemap.xml`, `robots.txt`, `favicon.ico` (to `public/`), `assets/` (after `assets/site.css` becomes `app/globals.css` for real and `assets/team/source/` moves to `source/`), the `digiblu-static` launch entry, `scripts/build-globals-css.cjs`, `scripts/extract-*.cjs`, `scripts/html-to-jsx.cjs`, `scripts/port-behaviour.cjs`, `scripts/parity.cjs`, and the claude.ai artifact flow. What must NOT be removed: `content/`, `public/assets/`, `lib/`, `components/`, `app/`.
- [ ] **Step 2**: Commit and push `next`.

---

## Self-review

Covers the Worker packaging (1), the audit baseline re-run (2), the human sign-off (3) and the runbook (4). No deploy, no DNS, no deletions.
