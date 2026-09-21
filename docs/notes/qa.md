# QA baseline and environment

The audit baseline to re-run after styling changes, the preview-environment traps that make a correct page look broken, and the items deliberately left undone.

> **Moved verbatim out of CLAUDE.md on 18 Sep 2026**, when CLAUDE.md was cut to a
> current summary on DigiBlu's developer's advice. These notes were written as the work
> happened: each is dated, and some describe states that have since changed.
> **Where anything here disagrees with CLAUDE.md, CLAUDE.md is current.** Since they were
> written: the site deploys on **vinext** (not OpenNext) with **pnpm** (not npm) and has
> **no CI**; the contact form sends email through Azure Communication Services; and the
> old static site is retired, so where a note names `index.html`, `assets/site.css` or the
> claude.ai artifact build, read `app/globals.css` and the components.
> **There are no dialogs since 18 Sep 2026** (built on the `pages-only` branch, merged into `dev`
> on 21 Sep 2026): every service, case study, bio, accreditation, legal document and the contact
> form is a page of its own, and `lib/client/modal.js` (`createModalController`) and
> `components/dialogs/` no longer exist. Where a note describes a dialog, the case-study reader or
> a dialog opener, it is history.

## Audit baseline (re-run these before shipping changes)

A full review was carried out and its findings fixed. The measured state afterwards, worth re-checking after any styling change:

- **Contrast: 0 failures in both themes** (was 6 dark / 64 light). Audit walks visible text, computes effective background, and must skip three things or it produces false positives: elements under a `background-image` ancestor (can't be computed numerically), elements under an `opacity: 0` ancestor (the inactive `.team-slice` labels are hardcoded white for the active blue slice and are legitimately invisible otherwise), and anything under `aria-hidden`.
- **No horizontal overflow** at 320 / 375 / 390 / 740 / 1440 / 1895px.
- **All tap targets ≥24px.** `.service-learn-more` and `.case-read-more` are inline-styled text links only ~17px tall - they use a transparent `::after` overlay to reach 44px **without changing layout**. Don't "simplify" that away by adding padding; padding shifts the surrounding rhythm. (`.case-back-btn` was the third, in the case-study reader, and went with it.)
- ~~**All 5 dialogs** open/close/Escape cleanly, restore body scroll, and leave no stray `inert`.~~ **History: there are no dialogs since 18 Sep 2026.** In its place: the cookie preferences dialog (Cookie settings in the footer) opens, keeps focus inside, closes with Escape and returns focus; the contact form on `/contact` steps, validates and sends; and the fixed nav, mobile menu and scroll-to-top disc work on every page.

## Deliberately NOT done (offered, declined or deferred)

- ~~**Sticky nav.**~~ **Done** - the nav is now fixed and frosted at every width (see the Hero entry in `sections.md`), and on every standalone page since 21 Sep 2026, so this is no longer outstanding.
- **Class naming debt.** The blog reused `.cases-actions` / `.case-viewall-btn`, and the blog/case modals reused `.service-modal-*`. The blog and the dialogs are gone, but the debt is not: the standalone pages still use `.service-modal-*` / `.case-modal-*` / `.team-modal-*` names and the contact page's panel the `.modal-*` ones. Functionally correct, confusingly named. A rename touches CSS and markup across many places for zero user-visible benefit, so it was left alone rather than bundled into a large verified fix set.
- ~~**Modal plumbing consolidation.** The contact and service modals still carry their own copies of the inert/focus-trap/Escape logic instead of `createModalController`.~~ **Moot since 18 Sep 2026**: the dialogs, their plumbing and `createModalController` are all gone.

## Known follow-ups (not urgent, just flagged)

- **Team photo sources are mixed resolution.** Vic, Dianne, Nick, Jon, Martin and Dave come from supplied full-size photographs; David and Karen exist only as the old 560 crops (their Wix originals, 425x525 to 2000x2000, were never kept). The framing is now uniform, but re-sourcing those two as cut-outs would give them a clean alpha rather than the repaired one and real pixels beyond the old crop's edges instead of carried ones.

- **History, superseded by the Next.js site** (it prerenders or renders every page on the Worker, serves `app/sitemap.ts` and `app/robots.ts`, self-hosts DM Sans and has no artifact build; what remains for SEO is the DNS switch, the redirects and Search Console, in the cut-over runbook in `platform.md`). The original item: **SEO - remaining items** (see the SEO section in `content-and-seo.md`; the Static pages section went with the old site): every blog post/case study/legal doc now has its own pre-rendered URL with `Article`/`WebPage` JSON-LD (done - see Static pages), so what's left is mostly deployment-time: `robots.txt`/`sitemap.xml` exist (generated alongside the static pages) but are meaningless until this is on a real domain, not previewed as an Artifact; deploy the lightweight `index.html` + real cacheable asset files rather than the base64-inlined artifact build, and self-host Google Fonts there too (already true for the artifact build only, and for `assets/site.css` - the source `index.html`/generated pages still pull DM Sans from Google Fonts); author/`dateModified` schema on blog posts is low priority since digiblu.com doesn't publish author names for these.
- **Accreditation marquee placement** was raised and deliberately left alone: the recommendation was to keep trust badges directly under the hero (they answer "are these people legitimate?" while a visitor is still deciding whether to scroll) and, if the row feels heavy since it became image-based, shrink it rather than relocate it above the footer. Not agreed either way — revisit if asked.
- ~~**BLOCKER FOR PUBLIC LAUNCH - the contact form's downstream call is the developer's.**~~ **Resolved 14 Sep 2026**: Radu replaced the logging stub in `lib/contact/send.ts` with the Azure Communication Services call. `/api/contact` validates, verifies Cloudflare Turnstile and emails the enquiry to DigiBlu with reply-to set to the sender; delivery is tracked in the background, so **a failed email shows only in Cloudflare Observability**. What remains is confirming the production Turnstile keys and ACS variables at the DNS switch (the cut-over runbook in `platform.md`). The form collects first and last name, work email, optional phone (`#cf-phone`, `type="tel"`, no `required` - not format-validated since international numbers vary), company and message; the API reads all of them.

## Environment note

Browser-preview screenshot tooling has been unreliable across sessions (`the page is not compositing frames` / stuck mid-CSS-transition reads / hangs on `img.decode()` for lazy images while the pane is hidden).

**Read this before trusting a `getComputedStyle` result on any animated property.** Because the pane often isn't compositing, `requestAnimationFrame` never fires, so **CSS transitions freeze at t=0 and never advance**. `getComputedStyle` then returns the *start* of the transition, not the target - which reads exactly like a broken style rule. This cost real debugging time twice (the G-Cloud `filter` invert and the blog filter pill background both looked broken and were not). When checking a property that has a `transition` on it, set `el.style.transition = 'none'` and force a reflow first, then read. Waiting with `setTimeout` does **not** help - a frozen transition never completes. `file://` navigation also renders as a non-interactive static snapshot in this tool - use a `.claude/launch.json` server instead, so the Browser preview tool loads over real `http://`: `digiblu-next` (`next dev` on 3000) or, to see what visitors get, `digiblu-vinext` (the built Worker through wrangler on 8787, after `pnpm build:vinext`). The old `npx http-server` entry on 4173 went with the old site on 10 Sep 2026. Verification has leaned on `getComputedStyle`, `getBoundingClientRect`, canvas pixel-sampling for contrast, direct `fetch()`/network checks for asset loading, `querySelector`/`click()` simulation for interactive flows, and direct cascade/rule inspection instead of visual screenshots. If screenshot tooling is healthy in a future session, a straightforward visual pass is still worth doing - everything here was checked numerically, not eyeballed.
