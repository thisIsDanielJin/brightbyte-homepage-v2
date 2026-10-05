# BrightByte Landing Page Redesign Plan

## Design Direction

**Feeling:** Premium, worth the money, every detail considered.
**Visual signature:** Silk shader as the recurring material. Deep Persian blue (#1C39BB) fabric that appears at key emotional moments, connecting the page into one authored experience.
**Anti-generic mandate (impeccable craft-floor):** No eyebrows, no identical card grids, no scattered fade-ins, no decorative checkmarks, no template layouts.

---

## New Section Order

```
1. HERO              — 2-col, Silk card right (current)
2. SERVICES          — What I build (mixed hierarchy grid)
3. WORK + IMPACT     — Combined projects + testimonials (NEW)
4. ABOUT             — Prominent personal section (redesigned)
5. PRICING           — Dark surface, clear prices
6. GUARANTEE         — "You own the code" (redesigned with Silk accent)
7. FAQ               — 2-col layout
8. CONTACT           — Dark surface, form + process steps
9. FOOTER            — Dark, minimal
```

Changes from current: Work moves up (credibility before price). Testimonials merged into Work. About gets more prominence (moved before pricing).

---

## Section-by-Section Plan

### 1. HERO (keep + polish)
- 2-col: headline left, Silk card right
- Silk config: `speed=3, scale=1, color=#1C39BB, noiseIntensity=2, rotation=0`
- Staggered reveal on copy (the one authored moment)
- No changes needed beyond what's done

### 2. SERVICES (keep current mixed grid)
- 2 featured + 4 compact, divider grid
- Clean, no icons, hover reveals CTA
- bg-surface-subtle

### 3. WORK + IMPACT (NEW, replaces Work + Testimonials)

**The concept:** Each project is a full-width horizontal row, not a card in a grid. One project visible at a time with generous space. Each row contains:

- Left: large project image (stock for now, aspect 16:10)
- Right: project name, one-line outcome ("Learnstep: 92% performance score"), the client quote inline below it, and the client attribution

This is NOT a card grid. It's an editorial case-study layout where each project gets the space to breathe. 2-3 projects, stacked vertically, separated by a thin border. The section sits on `bg-surface`.

**Why this is better:** Projects and testimonials currently look like two separate template sections with identical card grids. Merging them into one editorial layout is specific to this site, not interchangeable.

**Content (placeholder):**
- Blumenspiess: +200% revenue, "After the relaunch we received noticeably more enquiries"
- Learnstep: 92% performance, "The new site loads fast and feels professional"
- Lumo: +47% conversion, "The presentation measurably improved our conversion"

### 4. ABOUT (redesign, more prominent)

**The concept:** Full-width section with a dark surface (`bg-surface-dark`). Photo on left (larger, 300px+), name + subline + body on right. Below the text: the skills strip. A subtle Silk accent (different params: slower, darker, lower opacity) sits behind the photo as an atmospheric element.

This makes About feel like a dedicated "meet the person" moment, not a footnote. The dark surface creates visual weight and breaks the white rhythm.

### 5. PRICING (keep, already strong)
- Dark surface, 2-col card layout
- SVG checkmarks, clear prices
- No changes needed

### 6. GUARANTEE (redesign with Silk)

**The concept:** Instead of a plain muted box, the Guarantee section gets a contained Silk strip as background (very low opacity, slow speed, different color tint). The text sits over it. This creates the third Silk moment:
- Hero: full intensity, contained card
- About: subtle atmospheric accent
- Guarantee: background strip, barely-there movement

The Silk here uses: `speed=1, scale=2, color=#1630A0, noiseIntensity=0.8, rotation=45` (slower, zoomed out, rotated for variety).

Trust points stay as the horizontal 2-col with SVG icons.

### 7. FAQ (keep current 2-col)
- Heading left, accordion right
- bg-surface

### 8. CONTACT (keep, already strong)
- Dark surface, 2-col
- Process steps + form

### 9. FOOTER (keep)
- Dark, minimal

---

## Silk Variation Matrix (test with Playwright)

| Location     | speed | scale | color   | noiseIntensity | rotation | opacity/treatment          |
|-------------|-------|-------|---------|---------------|----------|---------------------------|
| Hero card   | 3     | 1     | #1C39BB | 2.0           | 0        | Full, contained in dark card |
| About bg    | 1.5   | 1.5   | #0F1F6B | 1.0           | 20       | Behind photo, clipped, 30% opacity overlay |
| Guarantee   | 1     | 2     | #1630A0 | 0.8           | 45       | Full-width strip, dark scrim over it |

---

## Playwright Visual Testing Plan

1. Screenshot each Silk variation at desktop (1440px) and mobile (375px)
2. Screenshot the full page flow at both breakpoints
3. Compare the three Silk moments side-by-side to ensure they read as one family but not identical

---

## Stock Images (temporary)

For the Work section project images, use high-quality stock website/laptop mockup photos. These will be replaced with real Learnstep and Lumo screenshots once those projects deploy.

---

## Implementation Order

1. Combine Work + Testimonials into new editorial section
2. Redesign About (dark, prominent, Silk accent)
3. Redesign Guarantee (Silk background strip)
4. Reorder sections in page.tsx
5. Playwright screenshot testing of all Silk variations
6. Full-page screenshot review at desktop + mobile
