# Behaviours (Priority 4) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the seventeen scripts at the foot of `index.html` (lines 975-2940) into client components so the Next.js site behaves exactly as the old one: nav, theme, dialogs, readers, the contact form, the scroll-driven About section, the team strip and the lattice figure.

**Architecture:** Each script becomes one `"use client"` component under `components/behaviours/` that renders nothing and runs the script's logic in a `useEffect` against the server-rendered markup, which is unchanged. The logic is copied from its line range, not rewritten; the only edits are the ones each task names (content from props instead of the script's objects, `href`s that are already absolute, a run-once guard so React Strict Mode's double effect cannot bind twice). Content-driven dialogs receive their content as props from a server component that reads `lib/content.ts`. Two helpers the scripts share (`createModalController`, the About pin progress) become modules.

**Tech Stack:** React 19 client components, the ported vanilla JavaScript typed loosely (`// @ts-nocheck` is not allowed; the ports are typed with `HTMLElement` casts where TypeScript needs them).

**Spec:** the old scripts, with the behaviour each one guarantees documented in `CLAUDE.md` (Page structure, sections 1-12 and Dialogs). Verification steps below are those documented checks.

## Global Constraints

- Branch `next`. The markup components from Priority 2 are not edited except where a task says so.
- Every port is a copy of its line range in `index.html` first, then the listed edits. No behaviour is redesigned.
- Every behaviour component wraps its effect in `once(key, fn)` from `lib/client/once.ts`, so Strict Mode's mount-unmount-mount in development binds listeners exactly once. Effects do not need cleanup for that reason, but any `setInterval`/observer created must still be disconnected in the returned cleanup when one is easy to return.
- `prefers-reduced-motion` gates stay exactly where the old scripts had them.
- Commit after every task, with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- Verification runs against the dev server on 3000 with the old site on 4173 beside it. The preview pane never delivers animation frames, so anything scheduled through `requestAnimationFrame` (the lattice cursor response, the probe) is verified by reading the code side by side and by the class or style it writes after a `setTimeout`, never by waiting for a frame.

---

## File Structure

| Path | Responsibility |
|---|---|
| `lib/client/once.ts` | `once(key: string, fn: () => void | (() => void))`: runs `fn` the first time a key is seen per page load; returns its cleanup or a no-op. |
| `lib/client/modal.ts` | `createModalController(overlay, opts?)`, ported from `index.html` lines 1959-2056. Consumers: team, reader, badge, legal dialogs. |
| `lib/client/about-pin.ts` | `pinProgress()` with `.live()`, ported from lines 1065-1115; still assigned to `window.__aboutPinProgress` so the two consumers' code stays verbatim. |
| `components/behaviours/NavChrome.tsx` | Lines 1648-1672 (nav measurement, `.scrolled`), 1674-1715 (theme toggles), 1717-1755 (mobile menu), 1631-1646 (scroll-to-top). One component, four `once` blocks. |
| `components/behaviours/ServicesReveal.tsx` | Lines 1597-1629. |
| `components/behaviours/PhoneDigits.tsx` | Lines 1568-1595. |
| `components/behaviours/AboutNarrative.tsx` | Lines 976-1063. |
| `components/behaviours/Values.tsx` | Lines 1117-1232. |
| `components/behaviours/GeoFigure.tsx` | Lines 1341-1454 (mark-lit, scroll and offscreen pausing, hover class, low-end probe). |
| `components/behaviours/GeoCursor.tsx` | Lines 1456-1566. |
| `components/behaviours/TeamStrip.tsx` | Lines 1234-1339, `team: TeamMember[]` prop. |
| `components/behaviours/ServiceDialog.tsx` | Lines 1867-1957 (the part of script 13 after the `SERVICES` object), `services: Service[]` prop. |
| `components/behaviours/CaseReader.tsx` | Lines 2253-2539 (script 14 after the `CASE_STUDIES` object), `caseStudies: CaseStudy[]` prop. |
| `components/behaviours/BadgeDialog.tsx` | Lines 2583-2616 (script 15 after `BADGE_DETAILS`), `accreditations: Accreditation[]` prop. |
| `components/behaviours/LegalDialog.tsx` | Lines 2722-2761 (script 16 after `LEGAL_DETAILS`), `legalDocs: LegalDoc[]` prop. |
| `components/behaviours/ContactForm.tsx` | Lines 2763-2939. |
| `components/HomeBehaviours.tsx` | Server component: reads the content, renders every behaviour component with its props. Mounted last in `app/page.tsx`. |
| `components/PageBehaviours.tsx` | For the standalone routes: `<NavChrome />` only (theme, mobile menu, scrolled nav, scroll-to-top has no button there). Mounted in both `[key]` and `[slug]` pages. |

The dialog markup components from Priority 2 keep their names; the behaviour components above live in `components/behaviours/` so `ServiceDialog` (markup) and `behaviours/ServiceDialog` (script) are different files.

---

### Task 1: Helpers and the mounting points

**Files:**
- Create: `lib/client/once.ts`, `lib/client/modal.ts`, `lib/client/about-pin.ts`, `components/HomeBehaviours.tsx`, `components/PageBehaviours.tsx`
- Modify: `app/page.tsx`, `app/case-studies/[key]/page.tsx`, `app/legal/[slug]/page.tsx`

**Interfaces:**
- `once(key, fn)` as above.
- `createModalController(overlay: HTMLElement, opts?: { onClose?: () => void }): { open(restoreFocusTo?: HTMLElement | null): void; close(skipRestore?: boolean): void; isOpen(): boolean }` with exactly the behaviour of lines 1959-2056 (background `inert`, focus trap, Escape, backdrop click, stacking hand-off in `close()`). Copy the function body; export it; type `overlay` as `HTMLElement`.
- `pinProgress()` returns a number 0..1 and carries `.live(): boolean`; assigned to `window.__aboutPinProgress` in a `once("about-pin")` block that `AboutNarrative` and `Values` call before their own effects (import `ensureAboutPin()` from the module and call it first).

- [ ] **Step 1: Write `lib/client/once.ts`**

```ts
// Runs fn the first time key is seen in this page load. React Strict Mode
// mounts, unmounts and remounts every component in development, so an
// effect that binds window listeners or wraps words in spans would run
// twice; the old scripts ran exactly once and were written that way.
const seen = new Set<string>();
export function once(key: string, fn: () => void | (() => void)): () => void {
  if (seen.has(key)) return () => {};
  seen.add(key);
  return fn() || (() => {});
}
```

- [ ] **Step 2: Write `lib/client/modal.ts`**

Copy `index.html` lines 1959-2056 into the file, then: change `function createModalController(overlay, opts) {` to `export function createModalController(overlay: HTMLElement, opts?: { onClose?: () => void }) {`; prefix `var` declarations that TypeScript flags with the narrowest `as HTMLElement` casts; keep every line of logic. Add at the top `// Ported verbatim from index.html lines 1959-2056; see CLAUDE.md, Dialogs.`

- [ ] **Step 3: Write `lib/client/about-pin.ts`**

Copy lines 1065-1115 (the whole IIFE body, without the `(function () {` and `})();` wrapper) into
```ts
import { once } from "./once";
declare global { interface Window { __aboutPinProgress?: (() => number) & { live: () => boolean } } }
export function ensureAboutPin() {
  once("about-pin", () => {
    // ...lines 1066-1114 verbatim, ending with window.__aboutPinProgress = pinProgress;
  });
}
```

- [ ] **Step 4: Write the two mounting components**

`components/HomeBehaviours.tsx` (a server component; it grows one line per task):
```tsx
import { getAccreditations, getCaseStudies, getLegalDocs, getServices, getTeam } from "@/lib/content";

// Reads the content once at build time and hands each behaviour its props.
// Every child is a client component that renders nothing and wires the
// server-rendered markup on mount. Order matters only where the old
// scripts' order did: ServiceDialog before ContactForm (its CTA hands off).
export default function HomeBehaviours() {
  const props = { services: getServices(), caseStudies: getCaseStudies(), legalDocs: getLegalDocs(), accreditations: getAccreditations(), team: getTeam() };
  void props;
  return <></>;
}
```

`components/PageBehaviours.tsx`:
```tsx
export default function PageBehaviours() {
  return <></>;
}
```

Mount `<HomeBehaviours />` as the last child of the fragment in `app/page.tsx`, and `<PageBehaviours />` as the last child in both route pages.

- [ ] **Step 5: Build and commit**

Run: `npm run build`
Expected: passes.

```bash
git add lib/client components/HomeBehaviours.tsx components/PageBehaviours.tsx app
git commit -m "Behaviour helpers and mounting points (P4 Task 1)"
```

---

### Task 2: Nav chrome (measurement, scrolled glass, theme, mobile menu, scroll-to-top)

**Files:**
- Create: `components/behaviours/NavChrome.tsx`
- Modify: `components/HomeBehaviours.tsx`, `components/PageBehaviours.tsx`

- [ ] **Step 1: Write the component**

```tsx
"use client";
import { useEffect } from "react";
import { once } from "@/lib/client/once";

export default function NavChrome() {
  useEffect(() => {
    once("nav-measure", () => { /* lines 1649-1671 verbatim */ });
    once("theme-toggle", () => { /* lines 1675-1714 verbatim */ });
    once("mobile-menu", () => { /* lines 1718-1754 verbatim */ });
    once("scroll-top", () => { /* lines 1632-1645 verbatim */ });
  }, []);
  return null;
}
```

Paste each range in place of its comment. Edits: none to logic. TypeScript: `document.getElementById(...)` results cast `as HTMLElement | null` where a property is set; `matchMedia` guarded as the source does.

- [ ] **Step 2: Mount** in both `HomeBehaviours` and `PageBehaviours` (`<NavChrome />`).

- [ ] **Step 3: Verify** on `http://localhost:3000/` (and `/legal/privacy-policy` for the page header):
```js
// after a scroll of 300px: 
({ navH: getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), scrolled: document.querySelector('nav').classList.contains('scrolled'), scrollTopShown: document.getElementById('scrollTopBtn').classList.contains('show') })
// click #themeToggle then:
({ theme: document.documentElement.getAttribute('data-theme'), stored: localStorage.getItem('digiblu-theme'), label: document.querySelector('#themeToggle').getAttribute('aria-label') })
// click .nav-toggle at 375px width then:
({ open: document.getElementById('mobileMenu').classList.contains('open'), expanded: document.querySelector('.nav-toggle').getAttribute('aria-expanded') })
```
Expected: the same values the old site gives for the same actions (run the same snippets on 4173).

- [ ] **Step 4: Commit** `git add components && git commit -m "Nav chrome behaviours (P4 Task 2)"`

---

### Task 3: Services entrance and the phone field

**Files:**
- Create: `components/behaviours/ServicesReveal.tsx` (lines 1598-1628), `components/behaviours/PhoneDigits.tsx` (lines 1569-1594)
- Modify: `components/HomeBehaviours.tsx`

- [ ] **Step 1: Write both** with the same shape as Task 2 (`once("services-reveal", ...)`, `once("phone-digits", ...)`), mount both.

- [ ] **Step 2: Verify**: on load `document.querySelector('.services').classList.contains('reveal-ready')` is true before the section is scrolled to and false 1.3s after it has been; typing `+44 (0) 7700 900abc` into `#cf-phone` leaves `+44 (0) 7700 900` (open the contact dialog after Task 11, or set the value and dispatch `input` now).

- [ ] **Step 3: Commit** `git commit -m "Services entrance and phone digits (P4 Task 3)"`

---

### Task 4: About narrative fill and the values

**Files:**
- Create: `components/behaviours/AboutNarrative.tsx` (lines 977-1062), `components/behaviours/Values.tsx` (lines 1118-1231)
- Modify: `components/HomeBehaviours.tsx`

- [ ] **Step 1: Write both**; each calls `ensureAboutPin()` before its `once` block. No logic edits.

- [ ] **Step 2: Verify** (both ports, `scroll-behavior: auto`, dispatch `scroll` after each `scrollTo`, transitions off on `.about-word` and `.value-item`):
```js
const head=document.querySelector('.about-head'); ({ words: document.querySelectorAll('.about-word').length, reading: head.classList.contains('is-reading') })
// scroll About to centre: read count of .about-word.is-read -> 51
// desktop: every .value-item has .is-open; phone (375px): scroll sweep reveals a prefix set only
```

- [ ] **Step 3: Commit** `git commit -m "About narrative fill and values (P4 Task 4)"`

---

### Task 5: The lattice figure

**Files:**
- Create: `components/behaviours/GeoFigure.tsx` (lines 1342-1453), `components/behaviours/GeoCursor.tsx` (lines 1457-1565)
- Modify: `components/HomeBehaviours.tsx`

- [ ] **Step 1: Write both**, mount both. No logic edits; the probe and the cursor loop stay as they are.

- [ ] **Step 2: Verify**: with the figure centred, `fig.style.getPropertyValue('--mark-lit')` is `1.00` and `getComputedStyle(fig.querySelector('.mk-lit')).opacity` is `1`; after a scroll event `fig.classList.contains('is-scrolling')` is true and clears within 200ms; `pointerenter` adds `is-hovering`. The cursor response is compared by reading `GeoCursor.tsx` against lines 1457-1565 (the pane delivers no frames).

- [ ] **Step 3: Commit** `git commit -m "Lattice figure behaviours (P4 Task 5)"`

---

### Task 6: Team strip and profile dialog

**Files:**
- Create: `components/behaviours/TeamStrip.tsx` (lines 1235-1338)
- Modify: `components/HomeBehaviours.tsx`

- [ ] **Step 1: Write it** with `export default function TeamStrip({ team }: { team: TeamMember[] })`. Edits: delete the `TEAM_MEMBERS` array (lines 1259-1270ish, up to its `];`) and use `team` in its place; where the script reads `m.bio` into `textContent` (lines 1295 and 1321), read `m.html` into `innerHTML` instead (the bio is markdown-rendered, first-party); `createModalController` is imported from `@/lib/client/modal`.

- [ ] **Step 2: Verify**: clicking the fourth slice makes it `.active`, injects `.team-slice-bio` spans (8), opens `#teamModal` with Jon's name and role; prev/next buttons move the active slice; Escape closes and restores focus.

- [ ] **Step 3: Commit** `git commit -m "Team strip and profile dialog from content (P4 Task 6)"`

---

### Task 7: Service dialog

**Files:**
- Create: `components/behaviours/ServiceDialog.tsx` (lines 1867-1957)
- Modify: `components/HomeBehaviours.tsx`

- [ ] **Step 1: Write it** with `{ services }: { services: Service[] }`. Edits: `var data = SERVICES[key]` becomes `var data = services.find((s) => s.key === key)`; `data.items.forEach(function (item) {...})` becomes `data.sections.forEach(...)` with `item.h` -> `section.heading` and the paragraph filled by `innerHTML = section.html`; `serviceNumber()` is unchanged (it reads the printed `.service-num`). The opener selector stays `.service-learn-more, .footer-col button[data-service]`. The "Discuss this service" hand-off to the contact dialog stays; it works once Task 11 mounts the contact form, and must be mounted BEFORE `ContactForm` in `HomeBehaviours`.

- [ ] **Step 2: Verify**: clicking the second card's Learn more opens `#serviceModal` with eyebrow `Service 02`, title `Opportunity Discovery`, 5 items; the footer's `Process Excellence` button opens it too; Escape closes.

- [ ] **Step 3: Commit** `git commit -m "Service dialog from content (P4 Task 7)"`

---

### Task 8: Case-study reader

**Files:**
- Create: `components/behaviours/CaseReader.tsx` (lines 2253-2539)
- Modify: `components/HomeBehaviours.tsx`

- [ ] **Step 1: Write it** with `{ caseStudies }: { caseStudies: CaseStudy[] }`. Edits: `CASE_STUDIES` -> `caseStudies` throughout; `CASE_PHOTO[c.key]` -> `c.photo`; the four `addSection('Overview', c.overview)` calls become one loop over `c.sections` calling `addSection(s.heading, s.html)`, and `addSection` sets the section body with `innerHTML` instead of splitting on `\n` into `<p>`s (the html already carries the paragraphs); the permalink rows it creates get `href = '/case-studies/' + c.key` (they were `'case-studies/' + c.key + '.html'`); `createModalController` imported. `PAGE_SIZE` and the pager stay.

- [ ] **Step 2: Verify**: `View all case studies (8)` opens the reader on the first entry with 8 sidebar rows; a row click selects it (`.is-active`, `aria-current`); the first card's Read more opens SSE/OVO with 3 pills, 4 sections and the quote; ctrl-click on Read more is not prevented (`defaultPrevented` false on a dispatched ctrl click); Escape closes.

- [ ] **Step 3: Commit** `git commit -m "Case-study reader from content (P4 Task 8)"`

---

### Task 9: Accreditation chips and badge dialog

**Files:**
- Create: `components/behaviours/BadgeDialog.tsx` (lines 2583-2616)
- Modify: `components/HomeBehaviours.tsx`

- [ ] **Step 1: Write it** with `{ accreditations }: { accreditations: Accreditation[] }`. Edits: `BADGE_DETAILS[key]` -> `accreditations.find((a) => a.key === key)`; `visual.src = d.img` unchanged (img paths are absolute now); `descEl.textContent = d.desc` -> `descEl.innerHTML = d.html`.

- [ ] **Step 2: Verify**: clicking `ISO 14001` in the strip (either copy) opens `#badgeModal` with the ISO 14001 image at natural size and the description; `G-Cloud` toggles `.on-dark-plate`.

- [ ] **Step 3: Commit** `git commit -m "Badge dialog from content (P4 Task 9)"`

---

### Task 10: Legal dialog

**Files:**
- Create: `components/behaviours/LegalDialog.tsx` (lines 2722-2761)
- Modify: `components/HomeBehaviours.tsx`

- [ ] **Step 1: Write it** with `{ legalDocs }: { legalDocs: LegalDoc[] }`. Edits: `LEGAL_DETAILS[key]` -> `legalDocs.find((d) => d.key === key)`; `d.points.forEach(item => ...)` -> `d.sections.forEach(s => ...)` with `s.heading` and `innerHTML = s.html`. The footer's `[data-legal]` anchors keep their real hrefs; a plain click still opens the dialog (the handler `preventDefault`s exactly as before).

- [ ] **Step 2: Verify**: footer `Privacy Policy` click opens `#legalModal` with 24 items and `defaultPrevented` true; ctrl-click is not prevented; the contact dialog's privacy link opens it stacked (Task 11) and closing hands `inert` back.

- [ ] **Step 3: Commit** `git commit -m "Legal dialog from content (P4 Task 10)"`

---

### Task 11: Contact dialog and form

**Files:**
- Create: `components/behaviours/ContactForm.tsx` (lines 2764-2938)
- Modify: `components/HomeBehaviours.tsx`

- [ ] **Step 1: Write it**. No content props. Edits: none to logic; the `openFromHash()` for `#contact` stays. The submit handler still `preventDefault`s and shows the success screen: the ACS endpoint is Priority 1's and is wired when it exists (one `fetch('/api/contact', ...)` in this handler, then).

- [ ] **Step 2: Verify**: Get in touch opens `#contactModal`; Next with empty fields stays on step 1; valid step 1 advances; consent unchecked blocks submit, checked submits and shows `.sent`; Escape closes and body scroll is restored (`document.body.style.overflow` empty, no stray `inert`).

- [ ] **Step 3: Commit** `git commit -m "Contact dialog and form (P4 Task 11)"`

---

### Task 12: Whole-site behaviour sweep, notes, push

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: The dialog sweep** (from the audit baseline): open and close each of the six dialogs by button, Escape and backdrop click; after each, `document.querySelectorAll('[inert]').length === 0`, `document.body.style.overflow === ''`, and focus is back on the opener. Run `node scripts/parity.cjs` and the two page parities: still all `ok` (behaviours do not change served HTML).

- [ ] **Step 2: Console**: a fresh load of `/` reports no errors (the only earlier warning, `src=""`, is gone).

- [ ] **Step 3: Notes**: append to the "Next.js port" section in `CLAUDE.md`:

```markdown
**Priority 4 (behaviours) is done**: the seventeen scripts are `components/behaviours/*` - `"use client"` components that render nothing and run the old script's logic in an effect against the server-rendered markup, copied from its line range in `index.html` with only the named edits (content from props, `innerHTML` for markdown-rendered fields, absolute hrefs). `lib/client/once.ts` runs each effect exactly once per page load, which is what makes React Strict Mode's double mount harmless; `lib/client/modal.ts` is `createModalController`, `lib/client/about-pin.ts` the shared pin progress. `components/HomeBehaviours.tsx` reads the content and mounts them in the old order (service dialog before contact form); `components/PageBehaviours.tsx` mounts the nav chrome on the standalone routes. The contact form still posts nowhere - the ACS endpoint is Priority 1's.
```

- [ ] **Step 4: Commit and push** `git commit -m "Handover notes for the behaviours (P4 Task 12)" && git push origin next`

---

## Self-review

- Coverage: all seventeen scripts are assigned (1 About narrative, 2 pin, 3 values, 4 team, 5-6 geo, 7 phone, 8 services reveal, 9 scroll-top, 10 nav, 11 theme, 12 menu, 13 service dialog, 14 reader, 15 badges, 16 legal, 17 contact) plus the shared `createModalController`.
- Names: `once`, `createModalController`, `ensureAboutPin`, the content getters and types from Priority 3, `HomeBehaviours`, `PageBehaviours`.
- The one intentional deviation from "verbatim": markdown-rendered fields are written with `innerHTML` where the script used `textContent`, because Priority 3 turned those strings into HTML. Every other line is the old one.
