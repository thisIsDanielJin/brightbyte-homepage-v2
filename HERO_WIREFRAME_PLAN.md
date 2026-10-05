# Hero Wireframe: Deep Implementation Plan

## Direction: Layout A (Text centered, wireframe builds outward)

### Concept
The headline sits dead center of the viewport. On load, a wireframe website structure
constructs itself outward from the headline, component by component: first a crosshair at
center, then the nav bar above, content blocks to the sides, cards below. Once assembled,
the wireframe smoothly morphs between 3-4 different website layouts (landing page, sidebar,
card grid, blog), showing versatility. The wireframe is black lines on a light surface with
subtle 3D perspective tilt that responds to mouse movement.

---

## Questions for you before building

1. **Line style**: The current prototype uses thin 1px lines. Should the wireframe
   feel more like an architectural blueprint (precise, thin, technical) or more like
   a pen sketch (slightly thicker, more presence)? I'm leaning blueprint.

2. **The blue dots**: You mentioned you're unsure about them. Options:
   - Remove entirely (cleanest)
   - Keep but only at the 4 corners of the outer frame (structural, not decorative)
   - Replace with tiny crosses (+) instead of dots (more architectural)

3. **Morph speed**: How long should each layout hold before morphing to the next?
   Current is 5 seconds. Faster (3s) feels more dynamic. Slower (7s) feels calmer.

4. **Background color**: Pure white (#FFFFFF), or a very subtle warm/cool tint?
   Options:
   - Pure white (current, clean)
   - `#FAFAFA` (surface-subtle, very slightly gray, adds depth)
   - A very faint blue tint (ties to the accent, more premium)

5. **On mobile**: The wireframe won't have the same spatial impact on small screens.
   Options:
   - Wireframe above/below the text (stacked)
   - Wireframe as a very subtle background texture (reduced to just the lines, barely visible)
   - Skip the wireframe on mobile entirely, rely on the text and CTA

---

## Technical Architecture

### Approach: Hybrid R3F + setDrawRange

**Why R3F over SVG:**
- Mouse-driven perspective tilt gives the wireframe physical presence
- `setDrawRange()` on BufferGeometry enables smooth progressive line reveal
- Three.js line rendering is GPU-accelerated, no DOM overhead for 30+ line segments
- We already have R3F + drei installed

**Line drawing technique:**
Each wireframe rectangle is a single BufferGeometry with enough vertices to form
a closed rectangle. We use `geometry.setDrawRange(0, currentCount)` and increment
`currentCount` each frame to progressively reveal the line, creating the "drawing"
effect. This is smoother than opacity fades and feels like the line is being drawn
by hand.

**Layout morphing technique:**
Define 3-4 layout configurations as arrays of `{ x, y, w, h }` rectangles. When
transitioning between layouts, lerp each rectangle's position and size from current
to target over ~1.5 seconds using an ease-in-out curve. Rectangles that exist in
one layout but not the next fade out (opacity → 0). New rectangles fade in. This
gives a smooth, organic morph between completely different website structures.

### Component tree

```
HeroSection (client component)
├── <Canvas> (R3F, transparent background)
│   ├── <WireframeController>  (manages layout cycling + morph state)
│   │   ├── <ConstructionLines>  (center crosshair, extends first)
│   │   ├── <WireRect> × N  (one per layout element, animates draw + position)
│   │   └── <AccentDots> × N  (optional, at structural intersections)
│   └── <MousePerspective>  (subtle orbit from mouse position)
├── <div> centered text overlay (headline, subline, CTAs)
└── <div> trust proof line
```

### Animation timeline

```
t=0.0s  Page loads. White surface. Text invisible.
t=0.2s  Headline fades in (Reveal component, opacity + y).
t=0.5s  Subline fades in.
t=0.8s  CTAs fade in.
t=1.0s  Center crosshair lines begin drawing outward from center.
t=1.2s  First wireframe element starts drawing (nav bar, closest to center).
t=1.4s  Second element (hero area below nav).
t=1.6s  Content blocks left and right.
t=1.8s  More elements, expanding outward.
t=2.2s  Footer / outermost elements finish drawing. Full wireframe visible.
t=2.5s  Brief pause. The first layout is complete.
t=5.0s  Morph begins to layout 2 (sidebar layout). ~1.5s transition.
t=6.5s  Layout 2 stable.
t=10.0s Morph to layout 3 (card grid). ~1.5s transition.
t=11.5s Layout 3 stable.
t=15.0s Morph to layout 4 (blog). Then cycle back to layout 1.
```

### Layout definitions (4 wireframe website types)

**Layout 1: Landing page**
- Nav bar (full width, top)
- Hero banner (wide, center-upper)
- Two text columns (side by side, mid)
- CTA button (center)
- Two feature blocks (side by side, lower)
- Footer (full width, bottom)

**Layout 2: Sidebar layout**
- Nav bar (full width, top)
- Sidebar (tall, left 25%)
- Main content (right 75%, upper)
- Content rows (stacked in main area)
- Footer (full width, bottom)

**Layout 3: Card grid**
- Nav bar
- Headline area (wide)
- 3×2 card grid (6 equal rectangles)
- Footer

**Layout 4: Blog/editorial**
- Nav bar
- Wide featured image (top)
- Narrow text column (centered, 50% width)
- Three text line placeholders
- Two-column footer

### Mouse interaction

Using drei's `useThree` + pointer events on the canvas. Mouse position maps to a
subtle rotation of the entire wireframe group:
- X movement → Y rotation (±3 degrees max)
- Y movement → X rotation (±2 degrees max)
- Smooth lerp toward target rotation (no snapping)
- On mobile: gentle auto-rotation instead of mouse tracking

### Performance budget

- Total line segments: ~30-40 per layout (lightweight)
- One R3F Canvas, one render loop
- `frameloop="demand"` or "always" with a manual dirty flag
- Offscreen: IntersectionObserver pauses the render loop
- Reduced motion: show the fully assembled first layout statically (no animation)

### Colors (from token system)

| Element | Value | Token |
|---------|-------|-------|
| Background | #FFFFFF or #FAFAFA | surface / surface-subtle |
| Wireframe lines | #18181B | primary |
| Accent dots (if kept) | #1C39BB | accent |
| Headline | #18181B | primary |
| Subline | #52525B | secondary |
| CTA fill | #1C39BB | accent |

---

## Files to create/modify

| File | Action |
|------|--------|
| `components/hero/WireframeScene.tsx` | NEW: R3F scene with all wireframe logic |
| `components/hero/WireframeLayouts.ts` | NEW: Layout definitions (pure data) |
| `components/hero/WireRect.tsx` | NEW: Single animated wireframe rectangle |
| `components/sections/HeroSection.tsx` | REWRITE: Layout A composition |
| `components/hero/HeroVisual.tsx` | DELETE: no longer needed (was Silk) |
| `components/hero/StrandsCard.tsx` | DELETE: no longer needed |

---

## Implementation order

1. Create `WireframeLayouts.ts` (pure data, no React)
2. Create `WireRect.tsx` (single rectangle with draw + morph animation)
3. Create `WireframeScene.tsx` (full scene: construction lines, rects, mouse tracking, layout cycling)
4. Rewrite `HeroSection.tsx` (Layout A: centered text + full-viewport Canvas behind)
5. Playwright screenshots at each stage
6. Mobile handling
7. Reduced-motion fallback
8. Performance tuning (IntersectionObserver pause, frameloop)
