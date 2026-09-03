# DigiBlu Brand Guide

The visual and editorial system as actually built on digiblu.com. Every value
here is taken from the live stylesheet rather than proposed, so this document
and the site cannot drift apart: if you change one, change the other.

Design tokens live in `assets/site.css` on `:root`. **Prefer a token over a
literal value** anywhere you can - the whole light/dark system depends on it.

---

## 1. The one idea to understand first

The palette is not two stylesheets. It is **one ink colour, expressed as raw
RGB channels**, that every translucent colour on the page derives from:

```css
--ink-rgb: 255, 255, 255;   /* dark theme  */
--ink-rgb: 13, 17, 23;      /* light theme */
```

Borders, muted text, scrims and hairlines are all written as
`rgba(var(--ink-rgb), <alpha>)`. Flipping that one token inverts the entire
site. This is why **you should never hard-code `#fff` or `#000`** for text or
borders: it will look correct in one theme and be invisible in the other.

There is one deliberate exception, `--page-ink-rgb`. Two surfaces (the hero and
the Case Studies band) pin white ink for their own children because they sit on
photography in both themes. Anything nested inside them that belongs to the
*page* rather than that surface must opt back out with `var(--page-ink-rgb)`.

---

## 2. Logo

| Asset | Use |
|---|---|
| `assets/logo-mask.png` | The wordmark. A single-ink alpha mask, painted with `mask-image` + `background-color`, so it takes the current theme's ink automatically. Aspect ratio **4.1184:1**, measured from the mask ink bounds (313x76) - re-derive it if the mask is ever regenerated. |
| `assets/favicon.svg` | Tab icon. Navy plate with white mark in light mode, white plate with navy mark in dark, via a media query inside the SVG. |
| `assets/favicon.png` | 256px fallback and `apple-touch-icon` - white mark on a navy rounded plate. |

**Rules**

- The wordmark is painted with `background-color`, never as a coloured image.
  Use `var(--text)` so it follows the theme. Do not use `currentColor` inside
  the hero: that surface pins its own ink and `color` merely inherits, so the
  mark resolves to near-black and disappears against the artwork.
- Below 900px the nav lockup crops to the icon only.
- The icon alone is a filled disc with the **db knocked out of it** - the
  letterforms are holes, not ink. Anything tracing the mark has to respect that.
- Minimum clear space: the height of the mark on all sides.

---

## 3. Colour

### Core palette

| Token | Dark (default) | Light | Role |
|---|---|---|---|
| `--bg` | `#000000` | `#ffffff` | Page background |
| `--surface` | `#050505` | `#f6f7f9` | Raised panels |
| `--surface-2` | `#060606` | `#ffffff` | Dialog panels |
| `--field-bg` | `#0d0d0d` | `#f1f3f6` | Form fields |
| `--text` | `#ffffff` | `#0d1117` | Primary text |
| `--ink-rgb` | `255, 255, 255` | `13, 17, 23` | Channels behind every alpha colour |
| `--hairline` | `rgba(var(--ink-rgb), 0.28)` | same | Dividers, borders |
| `--glass-rgb` | `10, 12, 18` | `255, 255, 255` | Tint behind the frosted nav |

### Accent

**`--blue: #1d6ef5`** is the only accent colour on the site. It is theme
independent - the same blue in both modes. Buttons, links, active states, the
focus ring and the mark's scroll highlight all use it.

`#1a61d8` is the one permitted hover variant (the blue at 88% brightness). It
exists because white-on-blue at 4.56:1 needed to improve rather than weaken on
hover; it raises that to 5.61:1.

### The blue-to-navy gradient family

Used for art panels and the expanded leadership card. Always 135 degrees.

| | Stops |
|---|---|
| a1 | `#4a8dff 0%` → `#1b4fd6 45%` → `#0a1f6e 100%` |
| a2 | `#1b4fd6 0%` → `#0a1f6e 55%` → `#050b28 100%` |
| a3 | `#6aa4ff 0%` → `#2f63e0 50%` → `#12307f 100%` |
| a4 | `#0a1f6e 0%` → `#1b4fd6 60%` → `#4a8dff 100%` |

Panels cycle through these by position so that neighbouring cards never repeat.

### Muted text: use the alpha tokens

| Token | Dark | Light |
|---|---|---|
| `--ink-a-faint` | 0.40 | 0.60 |
| `--ink-a-low` | 0.45 | 0.62 |
| `--ink-a-mid` | 0.50 | 0.64 |
| `--ink-a-high` | 0.55 | 0.66 |
| `--ink-a-aa` | 0.58 | 0.66 |

**The light values are higher on purpose, and this is not optional.** The same
alpha that reads comfortably on black measures only 2.6-4.3:1 on white and
fails AA. Writing a literal `rgba(var(--ink-rgb), 0.5)` will pass in dark mode
and fail in light. Use the token.

---

## 4. Typography

**DM Sans** throughout, self-hosted (`assets/dmsans.woff2`). Weights 300, 400,
500, 600, 700.

| Role | Size | Weight | Line height | Tracking |
|---|---|---|---|---|
| Hero headline (`h1`) | `clamp(42px, 7.2vw, 92px)` | 300 | 1.06 | -1px |
| Section heading (`h2`) | `clamp(34px, 4.6vw, 52px)` | 400 | 1.12 | -0.7px |
| Statement / lede | `clamp(23px, 2.4vw, 33px)` | 400 | - | - |
| Body | 15px | 400 | 1.5-1.6 | - |
| Eyebrow pill | 11.5px | 500 | - | 1.4px, uppercase |

**Notes**

- Headings are **light, not bold**. The hero is weight 300 and section headings
  400. Negative tracking at large sizes is what keeps them from feeling loose.
- Everything scales with `clamp()`, so there are no separate mobile type rules
  to maintain.
- The measure for long-form copy is capped around 940px.
- **There is no global `h1`/`h2` styling.** Every heading rule is scoped to its
  section. A heading in a new container inherits nothing and silently falls
  back to browser defaults, which looks plausible enough to miss - give any new
  container its own heading rule.

---

## 5. Layout and rhythm

| Token | Desktop | ≤900px |
|---|---|---|
| `--maxw` | 1500px | - |
| `--gutter` | 24px | - |
| `--section-y` | 72px | 56px |
| `--head-gap` | 48px | 36px |
| `--nav-h` | measured from the live nav | - |

**Rules**

- Every section pads symmetrically from `--section-y`, so the gap between any
  two sections is `2 × --section-y` (144px desktop, 112px mobile). Reordering
  sections can therefore never produce an uneven gap.
- Every section heading is followed by `--head-gap`. Verified identical across
  About, Services, Case Studies and Clients.
- Put that padding on the **section itself**, not an inner wrapper. Putting it
  on the inner wrapper only has broken the rhythm more than once.
- A heading followed by a *subtitle* rather than content is the one legitimate
  exception, and sits tighter (14px in the Team section).
- Full-bleed sections use a `.section` / `.section-inner` split: background and
  padding on the outer, max-width on the inner.

---

## 6. Motion

The house easing is **`cubic-bezier(0.2, 0.8, 0.2, 1)`** - a quick start with a
long settle. It is the only custom curve in the stylesheet.

| Pattern | Timing |
|---|---|
| Layout transitions (expand, grow) | 0.45-0.5s |
| Colour and opacity | 0.2-0.4s |
| Scroll-linked colour | 0.3s (short, so it tracks the gesture rather than trailing it) |
| Entrance stagger | 0.06s between siblings, ~0.46s total |

**Principles**

- **Motion is a response, not decoration.** Scroll position and pointer
  position drive it; nothing loops for attention.
- **Hidden states are added by script, never authored in the markup.** With JS
  disabled, no observer, or reduced motion, content is simply visible. Anything
  that starts at `opacity: 0` in the HTML is a bug waiting to happen.
- **Everything respects `prefers-reduced-motion`.** Under it, scroll-driven
  reveals show their full content immediately and pinned sections do not pin.
  Nothing may be reachable only through a gesture that never happens.
- **Animate `opacity` and `transform` only.** They are the compositor-friendly
  properties; animating anything else repaints.
- Continuous animation pauses while the page is scrolling and while the element
  is off screen. On a weak GPU this is the difference between smooth and janky.

---

## 7. Photography and imagery

### Case studies

Real photography of the sector, under a brand scrim:

```css
filter: grayscale(0.55) contrast(1.05);
background: linear-gradient(135deg,
  rgba(10, 31, 110, 0.70) 0%,
  rgba(29, 110, 245, 0.38) 52%,
  rgba(5, 11, 40, 0.78) 100%);
```

The scrim and partial desaturation are what let photographs from many different
sources read as one set - a warm image and a cold one land in the same key.
Aspect ratio 16:6, dropping to 16:4.5 at or below 640px so a photograph never
takes a third of a phone screen before the title appears.

**Sourcing rules**

- Licence must permit commercial use with no attribution required.
- **Never use imagery carrying a real organisation's branding.** Rejected
  otherwise-strong bank photographs because they showed competitor signage - a
  named rival on a client's case study misrepresents that client.
- Anonymised engagements get generic sector imagery, never anything
  identifying.

### Leadership portraits

- Square cut-outs on transparency, **face-centred in the image**. The strip
  shows a wide, short band, so centring the face in the source is what makes a
  plain centred crop land correctly at every viewport width. Do not fix framing
  with a `background-position` offset - it is only ever right at one width.
- Collapsed: greyscale circles - an index.
- Expanded: a white circular cut-out at full colour on the gradient card.
- **Ask for cut-outs.** Keying a subject out of a real room fails when clothing
  or hair matches the background, which is exactly what happened here.

### Client logos and accreditations

Single-ink alpha masks painted with `background-color: var(--text)`, so one rule
serves both themes with no per-logo overrides. Sizes are **area-normalised, not
height-matched** - lockups range from square icon blocks to thin wordmarks, and
equal heights leave the wide ones dominant.

---

## 8. Components

**Buttons** - Blue fill with white label, or a bordered ghost variant. Radius 999px for pills, 10px for form fields, 12-20px for cards and
panels.

**Eyebrow pill** - `padding: 6px 14px`, 1px hairline border, `border-radius:
999px`, 11.5px uppercase at 1.4px tracking. Text-only in most sections; the one
over photography gets a dark chip behind it, because border contrast against a
photograph cannot be computed the way it can against a flat surface.

**Frosted nav** - Transparent over the hero, becoming an inset rounded glass
panel past 24px of scroll: `rgba(var(--glass-rgb), 0.68)` with
`backdrop-filter: blur(12px)`. **0.68 is a floor, not a taste call** - the
panel floats over arbitrary content, so its contrast cannot be computed
statically, and that opacity keeps labels legible over anything scrolling
beneath. There is an `@supports not` fallback to a near-opaque surface.

**Dialogs** - `.modal-overlay` + `.modal-panel`, with background `inert`, a
focus trap, Escape and backdrop-click. Dialogs can stack, so closing one hands
the scroll lock to any still-open dialog rather than releasing it. On phones the
close control is a header row the content starts beneath, never a floating
button over scrolling content.

---

## 9. Accessibility

This is part of the brand, not a separate checklist.

- **Contrast: zero failures in both themes**, audited across every visible text
  node. Body text meets 4.5:1; large text meets 3:1.
- **All tap targets at least 24px.** Where a control is visually smaller, it
  uses a transparent `::after` overlay to reach 44px **without changing
  layout** - do not "simplify" that into padding, which shifts the rhythm.
- **Focus is always visible**: `outline: 2px solid var(--blue)` at 2px offset.
  Hover and focus states are defined together, never hover alone.
- **Hover is never the only route to anything.** It has no touch equivalent and
  cannot be reached from a keyboard.
- Decorative elements are `aria-hidden`; duplicated marquee content is removed
  from the tab order rather than announced twice.
- `color-scheme` is declared in all three theme states so the browser paints its
  own native UI in the right key.

---

## 10. Voice and content

**Tone** - Direct and specific. Claims carry figures ("64 processes
automated", "90 to 45 days"). Consulting judgment, not vendor enthusiasm.

**Rules**

- **No em dashes in visible copy.** Use a spaced hyphen ( - ). This applies to
  every content string, including data in the JavaScript objects.
- **No fabricated people, quotes, figures or clients.** Named individuals must
  be real and published. Attribution is fine; invention is not.
- **Real links only.** Every navigation target resolves to a real section or a
  real page.
- **Third-party article content is condensed, not copy-pasted.** Only short
  attributed quotes are verbatim.
- **Legal policy text is reproduced in full and verbatim**, structured by the
  source's own numbered sections. It is a legal document: paraphrasing changes
  what it says. Where the source itself has a genuine gap, note the gap rather
  than inventing content to fill it.
- Anonymised clients stay anonymous, in copy and in imagery.

---

## 11. Asset inventory

| Path | Contents |
|---|---|
| `assets/site.css` | All styling and every design token. Single source of truth. |
| `assets/dmsans.woff2` | DM Sans variable font, self-hosted |
| `assets/logo-mask.png` | Wordmark alpha mask |
| `assets/favicon.svg` / `.png` | Theme-aware tab icon and fallback |
| `assets/hero.jpg`, `footer-bg.jpg` | Hero and Case Studies artwork |
| `assets/team/*.png` | Leadership portraits, face-centred cut-outs |
| `assets/clients/*.png` | Client logo alpha masks |
| `assets/badges/*.png` | Accreditation artwork |
| `assets/case-studies/*.jpg` | Per-engagement photography, 1600x600 |
| `assets/og/case-studies/*.jpg` | Per-engagement social cards, 1200x630 |

CSS `url()` values in `assets/site.css` are relative to **that file**, not to
the page that links it. A new reference is `url('image.png')`, not
`url('assets/image.png')`.
