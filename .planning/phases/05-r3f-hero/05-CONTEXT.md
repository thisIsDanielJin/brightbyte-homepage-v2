# Phase 5: R3F Hero - Context

**Gathered:** 2026-08-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Add one elegant, performance-budgeted three.js / @react-three/fiber 3D hero centerpiece — a single frosted-glass rounded solid, slowly rotating, sitting behind the existing hero text. It must be **fully isolated** via `next/dynamic({ ssr: false })` (importing it from any Server Component is a build error that must be confirmed absent), swapped into the hero's existing `absolute inset-0 .hero-backdrop` layer with **zero CLS**, and it must **not render any Canvas** when `prefers-reduced-motion: reduce` is set — the static CSS-gradient fallback shows instead. Mobile Core Web Vitals budget must be met (LCP < 2.5s, CLS = 0), draw calls < 200, and `PerformanceMonitor` adaptive DPR active and verified on a throttled connection.

Requirements: HERO-01, HERO-02 (2 total).

**In scope:** installing the 3D stack (three / @react-three/fiber / @react-three/drei — NONE are in `package.json` yet; motion is also not yet installed but is not needed for the Canvas), building the isolated Canvas + glass scene, the `HeroFallback`, the dynamic-import boundary, the reduced-motion gate, and meeting/verifying the perf budgets.
**Not in scope:** any 3D beyond this single hero moment (explicit anti-feature — see PROJECT.md Out of Scope); changing the hero copy source (stays Sanity siteSettings, Phase 4) or the hero layout/text column; programmatic SEO pages + JSON-LD (Phase 6); FAQ/process/case studies (Phase 7). The 2D hero shell, its container, and the gradient backdrop already exist and ship today — this phase only swaps the backdrop layer for the Canvas.
</domain>

<decisions>
## Implementation Decisions

### Scene Concept (the "what")
- **D-01:** The hero is a **material / light study**, not a shape study — the appeal is the quality of the material catching light, deliberately "tasteful, not a tech demo." This is the concrete definition of the ROADMAP "elegant / not a tech demo" bar.
- **D-02:** Material direction: **frosted glass / refraction** — light bends through a soft translucent solid (candidate: drei `MeshTransmissionMaterial` or transmission on a physical material). This is the MOST performance-sensitive choice (transmission is a multi-pass render) — the perf budget below is the governing constraint, and mobile/low-end will likely need a simplified or disabled transmission path. — **Reversibility:** costly — the material choice drives lighting, environment, and the entire perf/degradation strategy; swapping to a cheaper material later reworks the scene and its budget verification.
- **D-03:** Form: a **single soft rounded solid** (e.g. smooth blob / lens / rounded icosahedron). One mesh, one material — the cleanest path to the <200 draw-call budget and the calmest read. The glass material is the whole story.

### Motion & Interaction
- **D-04:** **Slow autonomous single-axis rotation** — a gentle, meditative continuous spin; the light sweeping across the glass as it turns is the point. No mouse/scroll interaction, no user input. This implies `frameloop="always"` (NOT `"demand"`), which raises battery/CPU stakes — mitigations below are mandatory. — **Reversibility:** reversible — rotation speed/axis is a tuning value; `frameloop` mode can change with the motion decision.
- **D-05:** Because the loop runs continuously: the render loop MUST pause when the hero is scrolled out of the viewport (IntersectionObserver-gated), and `PerformanceMonitor` adaptive DPR scaling must be active (also a ROADMAP success criterion #4). RESEARCH FLAG: confirm the cleanest R3F pattern to pause `frameloop="always"` on offscreen without remounting the Canvas.
- **D-06:** Reduced-motion is absolute: when `prefers-reduced-motion: reduce`, **no Canvas is rendered at all** (not merely a paused loop) — the static fallback shows. This is ROADMAP success criterion #3 and HERO-02. — **Reversibility:** one-way — this is a locked accessibility contract and a graded success criterion; it does not get "reconsidered."

### Composition & Palette
- **D-07:** The glass solid sits **roughly centered, behind the hero text** (text/CTA stay at `z-10` above the Canvas, as the existing shell already layers them). The glass must be kept **soft/faint behind the copy** so the headline/subline/CTA remain legible. — **Reversibility:** reversible — placement/scale is a composition value within the existing container; the container contract (min-h-svh, absolute-inset Canvas) is the durable part.
- **D-08:** **WCAG AA of the headline, subline, and CTA is verified against the ACTUAL RENDERED glass background** — a hard QA gate, mirroring the Phase 4 rule that contrast is checked against real rendered backgrounds, not assumed. If AA can't hold with the glass centered behind text, dim/blur the glass region behind the copy or shift the focal mass off the text — legibility wins over the visual.
- **D-09:** Lighting + glass tint are **driven by Phase-1 tokens** (surface / surface-dark base, `accent` as key light or subtle glass tint) so the hero reads unmistakably BrightByte, never generic three.js chrome. IDENT-01 still applies (no raw hex in component/token files). RESEARCH FLAG: transmission/glass materials sample the **scene environment** — the researcher must determine how to feed token-derived colors into the lighting/Environment (a lightweight programmatically-built environment or colored lights vs. an external HDRI) WITHOUT adding a heavy asset that hurts LCP.

### Fallback & Loading
- **D-10:** `HeroFallback` = the **existing `.hero-backdrop` CSS radial-gradient** (already built in Phase 4 as the documented swap target). It is the reduced-motion state, the no-WebGL state, and the pre-hydration state. Zero new asset, guaranteed identical container dimensions → CLS = 0, fully token-based. The fallback IS the currently-shipped hero. — **Reversibility:** reversible — but reusing the existing gradient is the low-risk default; a bespoke fallback would be new design work.
- **D-11:** Loading transition: **gradient → fade in glass**. The gradient paints immediately and is the LCP element (guaranteeing LCP < 2.5s regardless of 3D load timing); the Canvas mounts lazily via `next/dynamic({ ssr: false })` + Suspense behind it; the glass **cross-fades in over ~300–500ms** once ready. No drei `Loader`, no spinner, no pop-in.

### Perf Budget (governing constraint — from ROADMAP success criteria, not re-litigated)
- **D-12:** Non-negotiable, verified in a PRODUCTION build (not dev): LCP < 2.5s on mobile Lighthouse (Moto G4 profile) **with the hero mounted**; CLS = 0; draw calls < 200; `PerformanceMonitor` adaptive DPR active and verified on a throttled connection; the R3F hero renders with **no hydration errors** in production. Given the transmission material (D-02) + continuous frameloop (D-04), these budgets are the primary risk and the main thing research must de-risk.

### Claude's Discretion
- Exact solid geometry (blob vs lens vs rounded icosahedron), rotation speed/axis, glass roughness/thickness/IOR, camera FOV/position, and the precise environment/lighting rig — bounded by D-01…D-12, the perf budget, and the calm-editorial identity. Planner / research decide within these guardrails.
- The exact mobile degradation strategy (simplified material, lower DPR floor, or capability-gated Canvas) — research recommends, planner locks.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase inputs (this phase)
- `.planning/ROADMAP.md` §"Phase 5: R3F Hero" — goal + 4 success criteria (the verification target: dynamic-ssr-false isolation, LCP<2.5s/CLS=0, reduced-motion no-Canvas fallback, <200 draw calls + PerformanceMonitor)
- `.planning/REQUIREMENTS.md` — HERO-01 (isolated performance-budgeted R3F hero, tasteful not a tech demo), HERO-02 (reduced-motion static fallback + mobile CWV budget); Out-of-Scope + anti-features list (no heavy/flashy 3D, no cursor particles, no auto-playing video)
- `.planning/PROJECT.md` — core value (refined, quietly stunning first impression), audience fit (never startup-flashy to an SMB owner), the three.js-over-OGL decision

### Prior-phase contracts (hard dependencies)
- `components/sections/HeroSection.tsx` — THE swap container: `<section id="hero" className="relative min-h-svh …">` with `<div className="absolute inset-0 hero-backdrop" aria-hidden>` as the documented Canvas swap target and text at `relative z-10`. `'use client'`. Preserve the container + text column; swap only the backdrop layer.
- `app/globals.css` — the `.hero-backdrop` utility class (token-based radial gradient) that becomes `HeroFallback`
- `styles/tokens.css` — single `@theme` token source (surface / surface-dark / on-dark / `accent` / motion easing+duration); IDENT-01 invariant: zero raw hex, no `text-gray-*`/`bg-gray-*`/`border-gray-*` in component files
- `app/[locale]/page.tsx` — where HeroSection mounts; hero headline/subline still sourced from Sanity siteSettings (Phase 4 D-07), unchanged
- `components/ui/MotionSection.tsx` — the existing thin `motion/react` wrapper the hero is wrapped in (reduced-motion already honored at the section-entrance level; the Canvas gate is separate and stricter)

### Stack rules & standards (MANDATORY)
- `AGENTS.md` (repo root) — "This is NOT the Next.js you know": **read `node_modules/next/dist/docs/` for Next 16 APIs before writing code**; Tailwind v4 `@theme` only (no tailwind.config.js); ESM-only
- `.claude/CLAUDE.md` (project) — the Technology Stack table pins versions to install: **three 0.185.1, @react-three/fiber 9.7.0 (bundles own reconciler for React 19.2), @react-three/drei 10.7.8 (named imports only — no barrel)**; and the "What NOT to Use" rules that directly bind this phase: Canvas MUST be behind `dynamic(() => import(...), { ssr:false })` in a `'use client'` wrapper; `frameloop="demand"` for static heroes (NOTE: D-04 chose continuous rotation → `frameloop="always"` with offscreen-pause + PerformanceMonitor instead — an intentional, budgeted deviation); drei named imports only
- `~/Documents/claude-contexts/freelancer.md` — BrightByte performance rules for the portfolio site
- ui-skills CLI — `npx ui-skills start` → `categories` → `list --category <c>` → `get <slug>` (apply the smallest relevant skill; the hero still passes a Playwright screenshot-critique loop like Phase 4 sections)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `components/sections/HeroSection.tsx`: the finished 2D shell with the exact swap contract already documented in its header comment ("Phase 5 inserts `<Canvas position:absolute inset-0>` here"). The Canvas island mounts into the `absolute inset-0` layer; text stays untouched at `z-10`.
- `app/globals.css` `.hero-backdrop`: the token-based gradient — reuse verbatim as `HeroFallback`, no new asset.
- `styles/tokens.css`: `accent`, `surface`, `surface-dark`, `on-dark` + motion tokens available to drive lighting/tint and the fade-in timing (D-09, D-11).

### Established Patterns
- Single styling approach: Tailwind v4 utilities consuming `@theme` tokens; no inline styles, no CSS-in-JS, no raw hex (IDENT-01, CI-guarded via `tests/invariants/*.sh`).
- Locale from URL segment only; Server Components fetch content with `stega:false` (do not regress) — the hero copy path is already correct and is NOT touched by this phase.
- Reduced-motion is already honored for section-entrance fades via `MotionSection`; this phase adds a STRICTER gate (no Canvas at all) for the 3D layer.

### Integration Points
- New client island: a `'use client'` wrapper that does `dynamic(() => import('./HeroScene'), { ssr:false })`, gated on a reduced-motion + capability check, rendered inside HeroSection's backdrop layer.
- New deps to add to `package.json`: three 0.185.1, @react-three/fiber 9.7.0, @react-three/drei 10.7.8 (verify against `.claude/CLAUDE.md` version matrix; confirm React 19.2 compat — R3F 9 bundles its own reconciler).
- Regression gate to keep green: `tsc --noEmit`, `test:invariants`, `test:content`, plus the existing Playwright suite (the accepted pre-existing mobile-375 switcher failure remains accepted). Add hero-specific checks: dynamic-ssr-false isolation (build error if imported server-side is ABSENT), reduced-motion → no `<canvas>` in DOM, CLS=0/LCP measurement.

</code_context>

<specifics>
## Specific Ideas

- "Tasteful, not a tech demo" is concretely defined this phase as: ONE frosted-glass rounded solid, slow single-axis rotation, brand-token lighting — the material quality is the whole appeal, no particles, no interaction, no chrome.
- The gradient must remain the LCP element so the perf budget is protected independent of 3D load timing; the glass is a progressive enhancement that fades in.
- Glass centered behind text is the chosen composition BUT legibility (WCAG AA against the rendered glass) is the hard constraint that overrides the visual if they conflict.

</specifics>

<deferred>
## Deferred Ideas

- **Mouse-parallax / scroll interaction on the hero:** considered and rejected for this phase — chose slow autonomous rotation for calm. If added later it needs pointer handling + touch/reduced-motion gating and re-verification of the perf budget.
- **Multiple glass panes / brand-shape-as-glass:** considered for the form; rejected in favor of a single rounded solid for calm + draw-call budget. A brand-mark-in-glass could be revisited as a variant later but risks reading heavy-handed.
- **Studio HDRI environment:** considered for material realism; deferred in favor of token-driven lighting to protect LCP (an HDRI is a loaded asset). Revisit only if programmatic lighting can't achieve the desired glass quality — research decides.
- **Still-frame poster fallback:** considered; rejected in favor of reusing the CSS gradient (zero asset, guaranteed CLS=0). Revisit only if the plain gradient reads too bare next to the live scene.

</deferred>

---

*Phase: 5-r3f-hero*
*Context gathered: 2026-08-19*
