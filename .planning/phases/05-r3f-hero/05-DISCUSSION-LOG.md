# Phase 5: R3F Hero - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-19
**Phase:** 5-r3f-hero
**Areas discussed:** Scene concept, Motion & interaction, Composition & palette, Fallback & loading

---

## Scene Concept

### Q1 — What should the 3D hero actually be?

| Option | Description | Selected |
|--------|-------------|----------|
| Abstract form/surface | Single quiet abstract form — undulating plane/ribbon or displaced surface. Cheapest, reads as crafted texture. | |
| Material / light study | Material study on a simple primitive — glass/iridescence/soft-lit solid with Environment. Wow = material, not shape. | ✓ |
| Particle field | Cloud of points / instanced particles. Risks generic/startup-flashy; mobile GPU cost. | |
| Brand mark in 3D | Extruded/beveled logo or letterform. Strong identity tie, risks heavy-handed. | |

**User's choice:** Material / light study
**Notes:** Most on-brand read of "tasteful, not a tech demo" — the appeal is material quality, not geometry.

### Q2 — Which material direction for the light study?

| Option | Description | Selected |
|--------|-------------|----------|
| Frosted glass / refraction | Light bends through translucent solid (MeshTransmissionMaterial). Premium; heaviest (multi-pass), strict mobile perf care. | ✓ |
| Matte + soft sheen | Soft matte solid + subtle iridescence under studio lighting, no transmission. Calm, safer perf. | |
| Subtle metallic / pearl | Near-metal/pearlescent catching slow light. Risks startup-flashy chrome. | |

**User's choice:** Frosted glass / refraction
**Notes:** "Crafted glass." Flagged as the most performance-sensitive choice — perf budget is the governing constraint; mobile likely needs simplified/disabled transmission.

### Q3 — What shape should the frosted glass take?

| Option | Description | Selected |
|--------|-------------|----------|
| One rounded solid | Single smooth blob/lens/rounded-cube. One mesh, cleanest draw-call budget, max calm. | ✓ |
| A few glass panes | 2–4 overlapping shards. More depth, still low draw-call, more composition work. | |
| Glass brand shape | BrightByte mark/letterform as the glass object. Identity tie, risks heavy-handed. | |

**User's choice:** One rounded solid
**Notes:** The glass material is the whole story; single mesh protects the <200 draw-call budget.

---

## Motion & Interaction

### Q1 — How should the glass solid move?

| Option | Description | Selected |
|--------|-------------|----------|
| Slow autonomous drift | Drifts/rotates slowly on its own; frameloop stays running at adaptive DPR. Light catching glass IS the appeal. | ✓ |
| Settle then hold | Near-static, frameloop='demand', best battery. Glass sparkle frozen. | |
| Gentle mouse parallax | Tilts toward cursor + idle drift. Engaging, needs pointer handling; off on touch/reduced-motion. | |

**User's choice:** Slow autonomous drift
**Notes:** Implies `frameloop="always"` → mandatory offscreen-pause (IntersectionObserver) + PerformanceMonitor adaptive DPR.

### Q2 — What character should the drift have?

| Option | Description | Selected |
|--------|-------------|----------|
| Slow rotation | Single-axis gentle spin. Meditative, predictable, easiest to tune. | ✓ |
| Floating bob/wobble | drei Float-style multi-axis bob. Organic, risks toy-like if not subtle. | |
| Rotation + faint float | Both combined. Richest light play, more motion to restrain. | |

**User's choice:** Slow rotation
**Notes:** Steady rhythm; reduced-motion still renders NO Canvas at all (stricter than pausing).

---

## Composition & Palette

### Q1 — Where does the glass solid sit relative to the hero text?

| Option | Description | Selected |
|--------|-------------|----------|
| Right-half focal object | Glass in right half opposite left text. Text fully legible on plain surface. | |
| Centered behind text | Large, roughly centered, text overlaid at z-10. Immersive, legibility risk. | ✓ |
| Full-bleed ambient | Fills whole backdrop, text floats over. Most atmospheric, highest legibility risk. | |

**User's choice:** Centered behind text
**Notes:** Legibility becomes a hard constraint — glass kept soft/faint behind copy; WCAG AA verified against actual rendered background.

### Q2 — What drives the material color & lighting?

| Option | Description | Selected |
|--------|-------------|----------|
| Brand tokens drive it | Environment/tint from Phase-1 tokens (surface/surface-dark base, accent key light). On-brand, avoids generic chrome. | ✓ |
| Neutral + accent glint | Mostly monochrome glass, whisper of accent in refraction. Calmest. | |
| Studio HDRI, graded | Soft HDRI graded toward brand. Best realism, adds asset (LCP cost). | |

**User's choice:** Brand tokens drive it
**Notes:** Research flag — transmission samples the scene environment; determine how to feed token colors in without a heavy HDRI hurting LCP.

---

## Fallback & Loading

### Q1 — What should reduced-motion / no-WebGL / pre-hydration users see?

| Option | Description | Selected |
|--------|-------------|----------|
| Reuse CSS gradient | Existing `.hero-backdrop` gradient as static state. Zero asset, same dims → CLS=0. | ✓ |
| Still-frame poster | Exported PNG/WebP of the scene. Matches 3D, adds asset, needs regen on scene change. | |
| Bespoke static art | Distinct designed static composition. More work; only if gradient too bare. | |

**User's choice:** Reuse CSS gradient
**Notes:** The fallback IS the currently-shipped hero; it's already the documented swap target.

### Q2 — How should the 3D appear once it's ready to render?

| Option | Description | Selected |
|--------|-------------|----------|
| Gradient → fade in glass | Gradient (LCP element) shows immediately, Canvas mounts lazily behind, glass cross-fades in ~300–500ms. No spinner. | ✓ |
| Hold then instant swap | Gradient holds until scene ready, then instant swap. Simpler, visible pop risk. | |
| Loader indicator | drei Loader/progress. Feels app-like/heavy for a marketing hero. | |

**User's choice:** Gradient → fade in glass
**Notes:** Gradient stays the LCP element so LCP < 2.5s is protected regardless of 3D load timing.

---

## Claude's Discretion

- Exact solid geometry (blob vs lens vs rounded icosahedron), rotation speed/axis, glass roughness/thickness/IOR, camera FOV/position, precise environment/lighting rig — bounded by decisions + perf budget + calm identity.
- Exact mobile degradation strategy (simplified material / lower DPR floor / capability-gated Canvas) — research recommends, planner locks.

## Deferred Ideas

- Mouse-parallax / scroll interaction — rejected for calm; revisit needs pointer + touch/reduced-motion gating + perf re-verification.
- Multiple glass panes / brand-shape-as-glass — rejected for single-solid calm + draw-call budget.
- Studio HDRI environment — deferred to protect LCP; revisit only if programmatic lighting can't hit the glass quality.
- Still-frame poster fallback — rejected in favor of reusing the CSS gradient (zero asset, CLS=0).
