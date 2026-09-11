# JUSPEACE Landing Page — Design Reference

Design source: [JUSPACE — Landing Page (Figma)](https://www.figma.com/design/nJMD4pVmkKVBI0uWEq0EBR/JUSPACE?node-id=139-12)

Captured via Figma MCP on **2026-08-26** for pre-development planning in `juspeace-fe`.

---

## Overview

| Property | Value |
| --- | --- |
| **Frame** | `Landing Page` (node `139:12`) |
| **Artboard** | **1920 × 16,646 px** (long single-page scroll) |
| **Figma file pages** | Only **Home Page** — no separate mobile frame in this file |
| **Design tokens** | No Figma variables bound to this node (colors/fonts are hardcoded in layers) |

This is a **full marketing landing page**, not a simple product grid. The current home page (`src/app/page.tsx`) is a minimal placeholder and will need a substantial rebuild to match this design.

---

## Page sections (top → bottom)

```text
1. Hero                    (~1177px)   dark full-bleed image + overlay
2. Brand Story             white bg    narrative + 3-photo grid
3. The Relationship        white bg    campaign copy + statement
4. Product Collection      white bg    3 bracelet variants (Black / White / Stripe)
5. Product Features        white bg    masonry close-up collage
6. Product Gallery         white bg    lifestyle + packaging images
7. Donation                dark bg     heart graphic + mission copy
8. FAQs                    white bg    2-column accordion (10 items)
9. Footer                  black bg    newsletter + links + social
```

Each major section has a small **Instrument Serif** label (e.g. `Brand Story`, `FEATURES`, `GALLERY`) and a large **Satoshi Bold** display headline underneath.

---

## Layout & structure

### Global header (over hero)

- **Logo** — top-left, ~65×64, circular crop
- **Nav** — centered: `STORY` · `COLLECTION` · `DONATION` · `FAQ` · `TRACK ORDER` (68px gap, uppercase, letter-spaced)
- **Bag** — top-right bordered box: bag icon + `BAG ( 0 )`
- **Language selector** — flag icon in bordered box (85×66)

Nav anchors should map to in-page sections (`#story`, `#collection`, etc.).

### Hero

- Full-width background image with **55% black overlay** (`rgba(0,0,0,0.55)`)
- Headline (2 lines): **“Love Together.” / “Change Together.”** — Satoshi Bold 88px / 95px line-height, −2% letter-spacing, white
- Sub-copy top-right: JUSPEACE origin story (~433px wide, Fragment Mono 18px)
- Tag: `[ WHITE | PURE HOPE ]`
- CTAs: **BUY NOW** (white filled button, 54px tall) + **EXPLORE COLLECTION** (underlined text link)
- **Horizontal thumbnail strip** — ~10 rounded squares (202×208, `border-radius: 38px`), staggered vertically; one thumbnail sits higher (carousel / scroll-snap candidate)
- Scroll cue: `[ Scroll ]` + double-arrow icon

### Brand Story

- Flower icon: `gd-flower.png` centered above headline
- Hero quote (4 lines): **“JUSPEACE is more / than a bracelet. / It is a message we / choose to carry.”** — Satoshi Bold 58px, centered, −2% letter-spacing
- Subtext (2 lines, Korean): “JUSPEACE는 단순한 팔찌가 아닙니다. / 우리가 선택해 지니는 하나의 메시지입니다.” — Satoshi Regular ~18px
- **3-column photo grid** (511×696 each): left / center / right editorial images

### The Relationship

- Label: `THE RELATIONSHIP`
- Large statement: **“The juspeace bracelet - embodies that pledge on the wrist.”** — Satoshi Bold **120px**, line-height 128px, centered (~1116px max width)
- Two side columns with bracket labels: `[ JUSTICE & PEACE ]` and `[ THE CAMPAIGN ]`

### Product Collection

- Label: `PRODUCT COLLECTION` + headline **“Product Collection”** (120px)
- **3 repeated rows**, each:
  - **Left**: large product photo (~777×1116)
  - **Right**: variant title in Instrument Serif 48px:
    - `/ BLACK STRONG COMMIMENT`
    - `/ WHITE PURE HOPE`
    - `/ STRIPE HARMONY & PEACE`
  - Index badge `[1]` in **teal `#33b194`**
  - Description in Fragment Mono 22px at 60% black opacity
  - **Purchase panel** (699×196, `border-radius: 32px`, bg `rgba(231,231,231,0.42)`):
    - Product name, variant label, **stock in red `#b13333`** (“20.00 stocks”)
    - “More Details” underlined link
    - Quantity stepper (54px) + **BUY NOW** button

Products align with backend catalog: **Black**, **White**, **Stripe** variants.

### Product Features

- Label `FEATURES` + **“Product Features”** headline
- **Asymmetric masonry grid** — mixed aspect ratios with caption labels:
  - `[ The bracelet ]`
  - `[ Antique silver lettering ]`
  - `[ Side adjustment to fit the wrist ]`
  - `[ Sturdy metal end tip ]`
  - `[ JUSPEACE engraved bead ]`

### Product Gallery

- Label `GALLERY` + **“Product Gallery”** headline
- **Desktop**: 3-column grid with cards at ±16.59° rotation, `border-radius: 21px`, optional `#f5f5f5` border
- Designer notes in Figma (important for responsive work):

| Gallery group | Count |
| --- | --- |
| `[ Product only images ]` | 26 |
| `[ Life Style Images ]` | 26 |
| `[ Close Up Images ]` | 26 |
| `[ Packaging Images ]` | 26 |

- **`[ Mobile Swipe Gallery ]`** and **`[ Desktop Thumbnails ]`** — mobile needs horizontal swipe; desktop needs thumbnail nav

### Donation

- Full-width **dark section** (~1044px) with heart/mechanical graphic
- Label: `Donation`
- Headline: **“Your act of peace become someone’s chance at life.”**
- Body: donation to youth rehabilitation / art therapy programs
- Tag: `[ W 150,000 - Donation Bracelet ]`

### FAQs

- Headline: **“FAQs”** (120px)
- **2 columns × 5 rows** accordion cards (810×156 each, `border-radius: 32px`)
- Collapsed state only in Figma — chevron on the right; expand/collapse behavior not shown
- Sample questions:
  - Is this an official JUSPEACE product?
  - What products are available?
  - Which countries can place orders?
  - Which payment methods are supported?
  - How long does the delivery take?
  - How can customers track their orders?
  - How are cancellation and refund requests handled?
  - Where will the proceeds be donated?
  - How can customers contact support?

### Footer

- **Black background** (~932px)
- Left: logo, `[ Newsletter ]`, “Be the first to know what’s new.”, email input + **Subscribe** button, social icons (Instagram, YouTube, X)
- Center/right: link columns — About Company, About Foundation, Customer Support, policies (Privacy, Terms, Shipping, Cancellation, Donation Notice)
- Contact: `love@juspeace.ai`, business registration `233-82-01129`
- Location: `36F, Three IFC, 10 Gukjegeumung-ro, Yeongdeungpo-gu, Seoul, South Korea`
- Bottom bar: `@ 2026 RED ENTERTECH CO., LTD.` + `JUSTICE & PEACE, WOVEN AS ONE` + partner logo

---

## Typography system

| Role | Font | Sizes (from design) |
| --- | --- | --- |
| Nav, section labels, product names | **Instrument Serif** | 18–48px |
| Display headlines | **Satoshi Bold** | 58px (quotes), **120px** (section titles) |
| Body, buttons, FAQ, captions | **Fragment Mono** | 16–24px |
| Product index badges | **Fragment Mono SC** | 18px |

Letter-spacing:

- Nav: `1.8px`
- Display headlines: `-1.16px` to `-2.4px`

**Implementation note:** Add these fonts via `next/font` (or licensed equivalents). They are not in the current FE stack.

---

## Color palette

| Token | Value | Usage |
| --- | --- | --- |
| Page bg | `#FFFFFF` | Content sections |
| Hero/footer | `#000000` | Dark sections |
| Hero overlay | `rgba(0,0,0,0.55)` | Image dimming |
| Border (hero UI) | `rgba(255,255,255,0.6)` | Nav bag, buttons |
| Muted text | `rgba(0,0,0,0.6)` | Descriptions |
| Card bg | `rgba(231,231,231,0.42)` | Product panels, FAQ |
| Card border | `rgba(0,0,0,0.06)` | Subtle outline |
| Accent teal | `#33b194` | `[1]` index badges |
| Stock red | `#b13333` | Stock count |
| Light gray | `#f5f5f5` | Gallery borders, count pills |

No Figma variables were exported for this frame — define Tailwind/CSS tokens from this table.

---

## Components to build

| Component | Notes |
| --- | --- |
| `SiteHeader` (redesign) | Transparent over hero → solid on scroll; anchor nav; bag count from Zustand |
| `HeroSection` | Background image, overlay, headline, CTAs, thumbnail carousel |
| `BrandStorySection` | Quote + 3-image grid |
| `RelationshipSection` | Large typographic statement |
| `ProductCollectionSection` | 3 rows wired to `listProducts()` API |
| `ProductPurchasePanel` | Qty stepper + Buy Now → cart |
| `FeaturesMasonry` | CSS grid / masonry with captions |
| `ProductGallery` | Desktop grid + **mobile swipe** (called out in Figma) |
| `DonationSection` | Dark full-bleed + CTA |
| `FaqAccordion` | 2-col desktop, 1-col mobile; 10 items |
| `SiteFooter` (redesign) | Newsletter form, link columns, social |

Suggested location: `src/components/landing/`.

---

## Animation stack

Research date: **2026-08-26**. This landing page needs **scroll storytelling**, **React UI motion**, and **carousels** — one library is not enough. Use a hybrid stack.

### Recommended libraries

| Library | Role | Install | Approx. bundle |
| --- | --- | --- | --- |
| **GSAP + ScrollTrigger** | Primary — scroll reveals, stagger, parallax, section choreography | `gsap`, `@gsap/react` | ~42 KB gzipped (core + ScrollTrigger) |
| **Motion** (`motion/react`) | Secondary — header, FAQ, buttons, hover/tap, simple enter/exit | `motion` | ~17–20 KB gzipped |
| **Embla Carousel** | Carousels — hero thumbnails, mobile swipe gallery | `embla-carousel`, `embla-carousel-react` | ~7 KB gzipped |
| **tw-animate-css** | Already in project — skeletons, simple utility fades | *(installed)* | Minimal |
| **Lenis** *(optional, phase 2)* | Smooth inertial scroll — premium feel; pair with GSAP | `lenis` | Small; add only if explicitly required |

**GSAP licensing:** GSAP and ScrollTrigger (and former Club plugins) are **free** as of April 2025 — no licensing blocker.

**If only one library:** choose **GSAP + ScrollTrigger** — motion is central to this brand landing page, not just UI polish.

### Animation needs by section

| Section / component | Animation type | Library |
| --- | --- | --- |
| Header (transparent → solid) | Scroll-linked background/blur | Motion or CSS + scroll listener |
| Hero headline + scroll cue | Entrance stagger, subtle loop on cue | GSAP or Motion |
| Hero thumbnail strip | Horizontal carousel, snap | **Embla** |
| Brand Story, Relationship, Features | Scroll-triggered fade/slide up | **GSAP ScrollTrigger** |
| Large display headlines (120px) | Staggered word/line reveal | **GSAP ScrollTrigger** |
| Product Collection rows | Scroll reveal + optional image parallax | **GSAP ScrollTrigger** |
| Product Gallery (desktop) | Staggered card entrance, ±16.59° rotation | **GSAP** |
| Product Gallery (mobile) | Horizontal swipe | **Embla** |
| Donation section | Fade-in, optional parallax on graphic | **GSAP ScrollTrigger** |
| FAQ accordion | Height/opacity expand, chevron rotate | **Motion** (`AnimatePresence`) |
| Footer newsletter / buttons | Hover, focus states | **Motion** or CSS |
| Loading / skeletons | Pulse, fade | **tw-animate-css** (existing) |

### Packages (pnpm)

```bash
pnpm add gsap @gsap/react motion embla-carousel embla-carousel-react

# Optional — smooth scroll polish after MVP:
pnpm add lenis
```

### Next.js conventions

- Mark animation components with `'use client'`.
- Register ScrollTrigger once per app: `gsap.registerPlugin(ScrollTrigger)`.
- Prefer **`useGSAP`** from `@gsap/react` with a scoped container ref (cleanup on unmount).
- Lazy-load heavy animation modules where helpful: `dynamic(..., { ssr: false })` for scroll-only providers.
- Call **`ScrollTrigger.refresh()`** after fonts load, route changes, and below-the-fold images settle.
- Use **Embla** via shadcn Carousel pattern if/when the Carousel primitive is added to the project.

Suggested file layout:

```text
src/components/landing/          # section components
src/lib/motion/                    # prefers-reduced-motion helper, shared variants
src/components/providers/          # optional LenisProvider (phase 2)
```

### GSAP vs Motion (quick reference)

| | GSAP + ScrollTrigger | Motion |
| --- | --- | --- |
| Scroll storytelling on long pages | Excellent | Good; not best-in-class |
| React / Next ergonomics | Good with `@gsap/react` | Excellent |
| FAQ, header, micro-interactions | Verbose | Natural |
| Carousels | Wrong tool | Wrong tool → use Embla |
| Typical bundle | ~42 KB w/ ScrollTrigger | ~17–20 KB |

Many production sites use **both**: GSAP for scroll choreography, Motion for React UI state.

### MVP animation order

1. **Motion** — sticky header opacity/blur on scroll
2. **GSAP ScrollTrigger** — section fade-up reveals (Brand Story, Collection, Features)
3. **Embla** — hero thumbnail strip
4. **Motion** — FAQ accordion expand/collapse
5. **GSAP** — gallery stagger + rotated cards
6. **Lenis** — only if smooth scroll is an explicit design requirement

### Accessibility and performance

- **Respect `prefers-reduced-motion`:** disable Lenis; skip or shorten GSAP timelines; use instant CSS state for FAQ/header.
- **Animate only `transform` and `opacity`** where possible — avoids layout thrash and keeps 60fps.
- **Lazy-load images** below the fold on this ~16k px page; refresh ScrollTrigger after load.
- **Do not** animate full-page scroll on every interaction — keep motion purposeful and editorial, matching the premium brand tone.
- Test **Core Web Vitals** (LCP, INP) after adding Lenis or heavy ScrollTrigger scenes.

### References

- [GSAP vs Framer Motion (2026)](https://www.hontran.dev/blog/gsap-vs-framer-motion)
- [Motion for React docs](https://motion.dev/docs/react)
- [Embla vs Swiper vs Splide (2026)](https://www.pkgpulse.com/guides/embla-carousel-vs-swiper-vs-splide-2026)
- [Next.js smooth scroll with GSAP & Lenis](https://www.hontran.dev/blog/nextjs-smooth-scroll-gsap-lenis)

---

## Integration with existing codebase

| Design element | Existing FE hook |
| --- | --- |
| Products | `listProducts()` + `ProductGrid` / product detail pages |
| Bag `(0)` | Extend `SiteHeader` + `useCartTotalItems()` from `cart-store` |
| BUY NOW | `AddToCartButton` or direct checkout flow |
| TRACK ORDER | New route (not built yet) |
| Language flag | Extend `LanguageSwitcher` (en/ko) |
| All copy | i18n keys in `src/messages/en.json` and `src/messages/ko.json` |

---

## Gaps & open decisions

1. **No mobile frame** — only 1920px desktop. Plan responsive breakpoints from gallery notes (swipe vs thumbnails) and stack product rows vertically on small screens.
2. **No Figma variables** — tokens must be defined manually in Tailwind/CSS.
3. **Heavy image assets** — many photos; plan CDN/static paths and lazy loading for ~16k px page height.
4. **FAQ content** — questions only in Figma; answers need CMS, hardcoded copy, or backend.
5. **Newsletter** — UI only; needs API/email provider.
6. **Stock display** — “20.00 stocks” may come from inventory API or be static marketing copy — confirm with product/backend team.
7. **Figma layout is absolute** — implement with **flex/grid + semantic sections**, not absolute positioning from MCP reference code.

---

## Recommended build order

1. Design tokens (fonts, colors, spacing) + section shell layout
2. Header + Hero (sets visual tone)
3. Product Collection (highest commerce value, API-connected)
4. Brand Story + Relationship (mostly static)
5. Features + Gallery (image-heavy)
6. Donation + FAQ + Footer
7. Responsive pass + anchor scroll + animations (see [Animation stack](#animation-stack))

---

## Figma reference

- **File key:** `nJMD4pVmkKVBI0uWEq0EBR`
- **Node ID:** `139:12` (`139-12` in URL)
- **Frame name:** `Landing Page`
