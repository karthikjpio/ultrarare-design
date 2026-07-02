# ultrarare.design

Marketing landing page for **ultrarare.design** — a demo-first web-design service.

**The pitch:** people who don't have a website land here → book a free demo → if they like it, the full site ships in **48 hours**. The site itself is the sales pitch, so it leans on craft: a near-black, Linear-inspired aesthetic with frosted glass, a single lavender accent, and a set of restrained, interaction-driven animations.

---

## Stack

Plain **static HTML / CSS / JS** — no build step, no framework, no dependencies to install. One third-party script (Lenis smooth scroll) loads from a CDN at runtime. Deploys as-is to Netlify, Vercel, GitHub Pages, or any static host.

## Run it locally

Any static file server works. The repo includes a preview config for Python's built-in server:

```bash
python3 -m http.server 4321
# open http://localhost:4321
```

Or just open `index.html` directly in a browser (the CDN script still needs a network connection).

---

## File structure

```
index.html                  Single-page markup
assets/
  css/
    styles.css              Base design system — tokens, layout, type, components
    glass.css               Services section + glassmorphism + ambient lights + runner/progress styling
    animations.css          Motion — scroll reveals, hovers, nav compaction (reduced-motion gated)
    enhance.css             Lenis base CSS, custom cursor, marquee, masked headings
  js/
    main.js                 Hero/work reveals, magnetic buttons, card tilt, mobile menu, nav .is-scrolled (8px)
    animations.js           rAF scroll loop: --progress, nav .scrolled (60px), runner + build-status, services reveals
    enhance.js              Lenis smooth scroll, masked-heading splitting, custom cursor
.claude/launch.json         Local preview server config
DESIGN-linear.app.md        Design-system reference this site is built from (Linear's marketing aesthetic)
```

**Architecture convention:** `styles.css` and `main.js` are the stable base — additive features are layered into the other files and win by source order / specificity. Avoid editing the base files for new features.

---

## Page sections (top → bottom)

Hero → **Services** (two pillars: Brand & Design / AI Automation) → How it works → Selected work → Why ultrarare → Marquee → Closing CTA → Footer.

---

## Design system

Sourced from `DESIGN-linear.app.md`. Key tokens (defined as CSS variables in `styles.css`):

| Token | Value | Use |
|---|---|---|
| `--canvas` | `#010102` | Page background |
| `--surface-1/2` | `#0f1011` / `#141516` | Card / panel fills |
| `--hairline` | `#23252a` | 1px borders |
| `--ink` / `--ink-subtle` | `#f7f8f8` / `#8a8f98` | Text / secondary text |
| `--primary` | `#5e6ad2` | The single lavender accent (CTAs, brand, focus) |

Type: **Inter** (display + body) and **JetBrains Mono** (eyebrows, numbers), via Google Fonts. Aggressive negative letter-spacing on display sizes.

---

## Features

**Glassmorphism** — frosted glass on the nav, service pillars, process + why cards, work cards, the CTA banner, and the build-status pill. All wrapped in `@supports (backdrop-filter)` with opaque-surface fallbacks. Footer, hero text, and body stay non-glass.

**Ambient lights** — three fixed radial glows (`.ambient__glow`) behind everything, drifting slowly left↔right (CSS `driftA/B/C`). Because they're fixed, the frosted glass scrolling over them reveals them passing through.

**Build → ship narrative** — driven by `--progress` (0–1) written on `:root` each scroll frame:
- A **running man** travels the top progress track toward a finish flag and ends arms-up.
- A **build-status pill** (bottom-right) mirrors the stage: Brief → Designing → Building → Shipping → **Shipped · 48h**.

**Animations** — hero line-clip reveal on load; scroll-triggered staggered reveals; magnetic buttons; project-card 3D tilt + hover; nav condense/blur on scroll.

**KOTA-inspired polish** —
- **Lenis** momentum smooth scrolling (in-page anchors routed through it with a nav offset).
- **Masked heading reveals** — section titles unmask word-by-word on scroll.
- **Custom cursor** — a dot that grows into a lavender "View ↗" over work cards (hover/fine-pointer devices only; hidden on touch).
- **Marquee** keyword strip before the CTA, pause-on-hover.

**Accessibility** — all decorative motion is gated behind `prefers-reduced-motion: reduce` (Lenis + custom cursor are skipped; marquee, light-drift, runner, progress bar, and reveals are frozen or hidden). Decorative elements carry `aria-hidden`. Text contrast on glass surfaces meets WCAG AA.

---

## Customization / things to replace

| What | Where | Notes |
|---|---|---|
| **Booking link** | `index.html` (all CTA anchors) | Currently `https://topmate.io/karthikjp/`. Search-and-replace to change. |
| **Projects** | `index.html` → 3× `.work-card` | Placeholders **Corner & Bean / Marquee Events / Stillpoint Yoga** with CSS-rendered browser mockups. They're clickable but go nowhere (`href="#"`). To make one real: set the `href`, and swap the `.browser__view` mock block for an `<img>` of the real site. |
| **Logo** | `index.html` → `.wordmark` | Text wordmark (`ultrarare` + lavender `.design`). Replace with an image if you have a logo. |
| **Tagline** | `index.html` | "Rare by design" — hero eyebrow + footer. |
| **Hero copy / timeline** | `index.html` | Headline "Don't have a website? Let's fix that!"; "48 hours" timeline appears in several spots. |

---

## Status

Live design is complete with **placeholder** projects and a text logo. Next steps when ready: drop in real project screenshots + links, and a logo image. Larger ideas on the shelf (pinned/horizontal-scroll sections, count-up stats, a full-bleed statement section) are best added once real projects and metrics exist.
