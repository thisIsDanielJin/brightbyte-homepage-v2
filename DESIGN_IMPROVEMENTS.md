# BrightByte Homepage v2 — Design Improvement Plan

> **Status:** Awaiting approval. No changes will be made until you confirm.
> **Scope:** Visual design, UX, content structure. Pricing section untouched (per request).

---

## ✅ DONE: Hero Section — 2-Column Split with Strands

Converted from centered single-column to the editorial 2-column layout:
- **Left (5/12):** Overline, headline, subline, dual CTA with arrow icons, status bar (booking, timezone, response time)
- **Right (7/12):** Strands shader on dark card with art-print caption, BrightByte blue palette (`#1C39BB → #C8D3FB`)
- Reduced-motion fallback (CSS gradient), IntersectionObserver pause, `ssr: false` isolation
- Mobile: stacks naturally (copy above card)

---

## 🔲 PROPOSED IMPROVEMENTS (needs your approval)

### 1. Services Section — Refocus on Service Offerings

**Current:** 2 services (Landing Page, Multi-page Website) with price + includes list. Feels like a pricing preview more than a services showcase.

**Proposed changes:**
- **Add new service categories in Sanity** (or hardcode initially, then migrate):
  - AI Development (chatbots, AI-powered features, LLM integrations)
  - Frontend Development (React, Next.js, performance-first SPAs)
  - Backend Development (APIs, databases, server architecture)
  - Web Design & UX (wireframes, prototypes, design systems)
  - Landing Pages (conversion-focused, SEO-optimized)
  - Full-Stack Websites (multi-page, CMS-integrated)
- **New layout:** Replace the current list-with-price format with a **card grid** (2×3 on desktop, 1-col mobile). Each card: icon/visual, service title, short description, "Learn more" that scrolls to pricing or opens detail.
- **Remove prices from Services section** (they live in Pricing already; duplication creates friction and maintenance burden).
- **Add a subtle icon or illustration per service** for visual rhythm.

### 2. Services Section — Visual Treatment

**Current:** Divider-separated rows on `bg-surface-subtle`. Functional but reads like a spreadsheet.

**Proposed:**
- Switch to distinct cards with `bg-surface` + subtle shadow (matching work cards and testimonial cards for consistency)
- Each card gets a small accent-colored icon (inline SVG, no library) or a 1-line "tag" pill
- Hover lift on cards (same `hover:-translate-y-1` as work cards)
- Section background stays `bg-surface-subtle` for contrast against hero

### 3. About Section — Stronger Personal Brand

**Current:** Photo + eyebrow + name + subline + body text. Clean but a bit plain.

**Proposed:**
- Add a **skills/tools strip** below the body text: small pills or a horizontal list showing tech stack (React, Next.js, TypeScript, Figma, Tailwind, etc.)
- Add a **brief stat line** (e.g., "5+ years building for the web" or "10+ projects shipped") to anchor credibility
- Consider slightly larger photo (200→240px) for more visual weight

### 4. Work Section — Richer Project Cards

**Current:** Image + title + one-line outcome note. The cards without images show a fallback initial or metric.

**Proposed:**
- Add a **tech stack tag row** under each project title (small pills: "Next.js", "Sanity", "Tailwind")
- Bolder outcome metric treatment: if a project has a % improvement, make it a colored accent callout on the card
- Consider a **"Featured" badge** for one or two spotlight projects

### 5. Testimonials Section — More Impactful Layout

**Current:** 3-col card grid, metric above quote. Solid.

**Proposed:**
- Add **subtle quotation mark** decorative element (oversized `"` in accent/10 opacity behind the quote) for editorial flavor
- Consider alternating the first testimonial as a **larger featured card** (spans 2 cols on desktop) if you get a really strong one

### 6. Guarantee Section — Tighter, More Confident

**Current:** Centered heading + body + 3 trust ticks. Reads a bit generic.

**Proposed:**
- Restyle as a **horizontal strip** with the heading on the left and trust ticks on the right (2-col on desktop)
- Replace generic checkmarks with more specific micro-icons (clock for "fast delivery", lock for "you own the code", chat for "direct communication")
- Add a subtle accent border-left or top accent bar for visual punch

### 7. FAQ Section — Polish

**Current:** Centered header + accordion. Works.

**Proposed:**
- Switch to **2-column layout**: heading + intro on the left, accordion on the right (matches the editorial grid of the rest of the page)
- Slightly larger touch targets on mobile accordion items

### 8. Contact Section — Small Refinements

**Current:** 2-col with process steps left, form right. Strong.

**Proposed:**
- Add a **subtle Strands or gradient background element** behind the left column content for visual continuity with the hero (very subtle, low opacity)
- Slightly round the form input corners for warmth (currently sharp rectangles)

### 9. Footer — Minor Polish

**Current:** 4-col grid, dark surface, logo + nav + SEO pages + legal.

**Proposed:**
- Add a subtle **top border accent line** (1-2px in accent color) to create a clear visual break
- Consider a **"Back to top" button** at the bottom-right

### 10. Typography & Spacing Consistency Audit

**Proposed Playwright checks:**
- Verify all section eyebrows use identical styling (`text-xs font-medium text-accent uppercase tracking-[0.2em]`)
- Verify section padding consistency (`py-24 md:py-32` is the standard, but some sections deviate)
- Check heading hierarchy: no skipped heading levels
- Confirm all interactive elements have visible focus states
- Mobile tap target audit (minimum 44px)

### 11. Motion & Micro-interactions

**Current:** MotionSection fade-in on all sections. Hover on cards/buttons.

**Proposed:**
- Add **staggered fade-in** for the hero left-column elements (overline → headline → subline → CTAs → status bar, ~100ms delay each) for a premium entrance feel
- Subtle **parallax** on the Strands card (very gentle, 2-3% movement on scroll)
- Card hover states: ensure all card types (services, work, testimonials) have consistent hover behavior

---

## Priority Order (recommended)

1. **Services content + layout** (biggest impact, defines your offering)
2. **Staggered hero entrance** (premium feel, quick win)
3. **About section enhancements** (skills strip, stats)
4. **Work section tags** (tech stack pills)
5. **Guarantee section restyle** (horizontal strip)
6. **FAQ 2-col layout**
7. **Typography/spacing audit** (Playwright)
8. Remaining polish items

---

**Which items do you want me to implement? All of them, a subset, or want to discuss any further?**
