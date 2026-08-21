# Phase 5: R3F Hero - Research

**Researched:** 2026-08-21
**Domain:** React Three Fiber (R3F) 3D hero, WebGL performance, Next.js dynamic isolation
**Confidence:** MEDIUM (stack pinned in CLAUDE.md; R3F APIs verified via official docs; perf strategies LOW due to no Context7 access)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Material/light study — appeal is material quality catching light; "tasteful, not a tech demo"
- **D-02:** Frosted glass / refraction — `MeshTransmissionMaterial` or transmission on physical material; mobile/low-end needs simplified or disabled transmission; perf budget is governing constraint
- **D-03:** Single soft rounded solid (one mesh, one material) — blob / lens / rounded icosahedron
- **D-04:** Slow autonomous single-axis rotation; `frameloop="always"` (continuous loop); no mouse/scroll interaction
- **D-05:** Render loop MUST pause when hero scrolls out of viewport (IntersectionObserver-gated); `PerformanceMonitor` adaptive DPR MUST be active
- **D-06:** `prefers-reduced-motion: reduce` → NO Canvas rendered at all; static fallback shows — one-way, locked accessibility contract
- **D-07:** Glass centered behind hero text; glass kept soft/faint; text/CTA at `z-10` above Canvas
- **D-08:** WCAG AA for headline, subline, CTA verified against ACTUAL rendered glass background — hard QA gate
- **D-09:** Lighting + glass tint driven by Phase-1 tokens (surface / surface-dark / accent); IDENT-01 applies; RESEARCH FLAG — how to feed tokens into lighting without heavy HDRI
- **D-10:** `HeroFallback` = existing `.hero-backdrop` CSS radial-gradient — reduced-motion state, no-WebGL state, pre-hydration state
- **D-11:** Loading transition: gradient → fade in glass (~300–500ms); gradient is LCP element; Canvas fades in via `next/dynamic({ ssr: false })` + Suspense once ready; no drei `Loader`, no spinner
- **D-12:** Perf budget (PRODUCTION build only): LCP < 2.5s Moto G4 profile, CLS = 0, draw calls < 200, PerformanceMonitor active, zero hydration errors

### Claude's Discretion

- Exact solid geometry (blob vs lens vs rounded icosahedron), rotation speed/axis, glass roughness/thickness/IOR, camera FOV/position, lighting rig — bounded by D-01…D-12, perf budget, calm-editorial identity
- Exact mobile degradation strategy (simplified material, lower DPR floor, or capability-gated Canvas) — research recommends, planner locks

### Deferred Ideas (OUT OF SCOPE)

- Mouse-parallax / scroll interaction on the hero
- Multiple glass panes / brand-shape-as-glass
- Studio HDRI environment (deferred in favor of token-driven lighting)
- Still-frame poster fallback (rejected; CSS gradient reused)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| HERO-01 | One elegant, performance-budgeted R3F 3D hero centerpiece (tasteful, not a tech demo), fully isolated via `next/dynamic({ ssr: false })` | Standard Stack section; dynamic isolation pattern; package install; Component Structure |
| HERO-02 | `prefers-reduced-motion` static fallback (no Canvas rendered) and mobile Core Web Vitals budget met (LCP < 2.5s, CLS = 0) | Reduced-motion gate pattern; LCP protection architecture; PerformanceMonitor + AdaptiveDpr pattern; Pitfall 2 |
</phase_requirements>

---

## Summary

Phase 5 adds a single frosted-glass R3F hero behind the existing 2D hero text. All three packages (`three`, `@react-three/fiber`, `@react-three/drei`) are absent from `package.json` and must be installed at pinned versions from `.claude/CLAUDE.md`. The primary technical risk is `MeshTransmissionMaterial`'s multi-pass render cost on mobile: it adds one extra scene render pass per material, making the `samples` and `resolution` props the critical performance levers. On low-end devices (Moto G4), the degradation path must reduce `samples` to 2–3 and `resolution` to 32px, or fall back to non-transmissive `MeshPhysicalMaterial` with `opacity`/`roughness` when `PerformanceMonitor` signals decline.

The isolation architecture is straightforward under Next.js 16: `dynamic(() => import('./HeroScene'), { ssr: false })` placed inside a `'use client'` wrapper (`HeroCanvas.tsx`) produces a confirmed build error if imported server-side — Next.js 16 enforces this at build time with the message "ssr: false is not allowed with next/dynamic in Server Components." The LCP protection strategy is equally clear: the `.hero-backdrop` CSS gradient ships in SSR HTML and is always the LCP element regardless of 3D load timing; the Canvas mounts lazily and fades in over the gradient.

For the frameloop-pause requirement (D-05), R3F v9 exposes `setFrameloop('never' | 'always')` via `useThree()` — the cleanest pattern is a `FrameloopController` child component inside `<Canvas>` that calls `setFrameloop` in response to an IntersectionObserver state prop, or simply pass `frameloop={isVisible ? 'always' : 'never'}` as a prop directly to `<Canvas>`. For token-driven environment lighting without a loaded HDRI, the recommendation is to use colored `directionalLight` / `ambientLight` / `pointLight` elements directly in the scene with hex values declared as named JS constants — no `drei <Environment>` needed, zero extra assets, zero LCP impact.

**Primary recommendation:** One client island (`HeroCanvas.tsx`, `'use client'`) wraps a `dynamic()` call to `HeroScene.tsx`; `HeroScene` contains `<Canvas>` with `PerformanceMonitor` + `AdaptiveDpr` + `GlassMesh`; reduced-motion and WebGL capability gates live in `HeroCanvas`; the IntersectionObserver `frameloop` toggle lives in a `FrameloopController` component inside `<Canvas>`.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| LCP element (gradient backdrop) | Server / SSR HTML | — | Must ship in SSR HTML; zero JS dependency; is the LCP paint |
| Canvas dynamic import + reduced-motion gate | Client (HeroCanvas.tsx, `'use client'`) | — | WebGL/browser API; `ssr:false` enforces client-only |
| R3F scene graph, glass mesh, rotation | Client (HeroScene.tsx, inside Canvas) | — | Three.js requires browser, cannot run server-side |
| IntersectionObserver frameloop pause | Client (FrameloopController inside Canvas) | — | Browser API; reads viewport intersection |
| PerformanceMonitor + AdaptiveDpr | Client (inside Canvas) | — | Reads GPU frame rate via R3F state |
| Fallback (HeroFallback) | Shared (renders in both SSR + client) | — | Pure CSS/div, renders server-side as initial HTML |
| WCAG AA legibility gate | QA / Playwright | — | Verified against rendered composite at 375 + 1440 |

---

## Standard Stack

### Core (pinned in `.claude/CLAUDE.md` — DO NOT change versions)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `three` | 0.185.1 | WebGL engine | Required peer dep for R3F; explicit install needed |
| `@react-three/fiber` | 9.7.0 | React renderer for three.js | Bundles own reconciler for React 19.2 compat; v9 is current stable |
| `@react-three/drei` | 10.7.8 | R3F helper library | `MeshTransmissionMaterial`, `PerformanceMonitor`, `AdaptiveDpr`, `Float`; named imports only |

[VERIFIED: npm registry] — all three at pinned versions confirmed via `npm view <pkg>@<version> version`.

### Supporting (already installed — no new install needed)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `motion` | (in package.json) | Fade-in transition (Path 2 fallback) | Only if CSS transition Path 1 is insufficient |
| `next/dynamic` | (bundled with Next.js 16.3.0) | `ssr:false` lazy import | Required for Canvas isolation |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `MeshTransmissionMaterial` (drei) | `meshPhysicalMaterial` with `transmission` | Built-in THREE.js material; no samples/resolution control; less tunable; use as mobile fallback |
| `directional/ambient lights` | `drei <Environment>` with children | Environment adds off-buffer cube camera cost; colored lights are cheaper and sufficient for a single glass mesh |
| `setFrameloop` prop on Canvas | `useThree().setFrameloop` inside Canvas | Both work; prop approach is simpler (no inner component needed); hook approach allows runtime switching without re-render |

**Installation:**
```bash
npm install three@0.185.1 @react-three/fiber@9.7.0 @react-three/drei@10.7.8
```

---

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| `three` | npm | ~12 yrs | 11.8M/wk | github.com/mrdoob/three.js | OK | Approved |
| `@react-three/fiber` | npm | ~5 yrs | 4.0M/wk | github.com/pmndrs/react-three-fiber | SUS (too-new flag — latest version Jul 2026) | Approved — seam flags v9.7.0 as "too-new" because it was published 2026-07-31, but pinned version 9.7.0 is the current `latest` tag, the package has 4M+ weekly downloads, legitimate source repo, and is explicitly pinned in `.claude/CLAUDE.md` version matrix |
| `@react-three/drei` | npm | ~4 yrs | 3.1M/wk | github.com/pmndrs/drei | SUS (too-new flag — latest version Aug 2026) | Approved — same rationale; 10.7.8 is pinned in `.claude/CLAUDE.md`, 3.1M weekly downloads, legitimate pmndrs org repo |

**Packages removed due to [SLOP] verdict:** none

**Packages flagged as suspicious [SUS]:** `@react-three/fiber@9.7.0` and `@react-three/drei@10.7.8` were flagged `too-new` by the legitimacy seam. Both are from the well-established `pmndrs` organization, have millions of weekly downloads, have legitimate source repositories, and are explicitly locked in `.claude/CLAUDE.md` with confirmed compat notes. The `too-new` signal reflects recent version publication dates, not legitimacy concerns. Proceed with pinned install.

---

## Architecture Patterns

### System Architecture Diagram

```
Server render (SSR)
    │
    ▼
[page.tsx — Server Component]
    └── <HeroSection headline subline>   ← 'use client', preserves text column
            │
            ├── <div.hero-backdrop>      ← LCP element; always in SSR HTML; shows until Canvas ready
            │
            └── <HeroCanvas />           ← 'use client' island
                    │
                    ├── [useReducedMotion() == true?] → return <HeroFallback />
                    ├── [canUseWebGL() == false?]      → return <HeroFallback />
                    │
                    └── <div ref={wrapperRef} className="absolute inset-0 opacity-0 [transition:...]">
                              │
                              └── dynamic(() => import('./HeroScene'), { ssr: false })
                                        │
                                        ▼
                                [HeroScene — client bundle only]
                                    <Canvas frameloop={isVisible ? 'always' : 'never'} dpr={[1,2]}>
                                        ├── <PerformanceMonitor onDecline onIncline>
                                        │       ├── <AdaptiveDpr />
                                        │       ├── <ambientLight />
                                        │       ├── <directionalLight />   ← token-hex constants
                                        │       └── <GlassMesh />
                                        │               ├── <icosahedronGeometry /> (or RoundedBox)
                                        │               └── <MeshTransmissionMaterial />
                                        └── (IntersectionObserver updates isVisible → frameloop prop)
```

### Recommended Project Structure

```
components/
├── sections/
│   └── HeroSection.tsx        # Existing — preserve verbatim; only swap backdrop layer
└── hero/
    ├── HeroCanvas.tsx          # 'use client' — gate (reduced-motion + WebGL check) + dynamic import + fade-in wrapper
    ├── HeroScene.tsx           # R3F scene — Canvas + PerformanceMonitor + AdaptiveDpr + GlassMesh
    ├── GlassMesh.tsx           # Mesh + MeshTransmissionMaterial + useFrame rotation
    ├── HeroFallback.tsx        # <div className="absolute inset-0 hero-backdrop" aria-hidden="true" />
    └── constants.ts            # Named JS constants for scene values (GLASS_IOR, ACCENT_HEX, etc.)
```

### Pattern 1: `next/dynamic({ ssr: false })` Isolation

**What:** The `HeroCanvas` client island wraps a `dynamic()` call so `HeroScene` (which imports three.js + Canvas) never appears in the server bundle.

**When to use:** Any component that imports WebGL/browser-only code.

**Key rule confirmed from `node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md`:**

> "ssr: false option will only work for Client Components, move it into Client Components to ensure the client code-splitting working properly."
> "ssr: false is not allowed with next/dynamic in Server Components. Please move it into a Client Component."

[VERIFIED: node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md:66-68]

```tsx
// components/hero/HeroCanvas.tsx
'use client'

import dynamic from 'next/dynamic'
import { useReducedMotion } from 'motion/react'
import { HeroFallback } from './HeroFallback'

// dynamic() call at module top level — required by Next.js (cannot be inside render)
const HeroScene = dynamic(() => import('./HeroScene'), { ssr: false })

function canUseWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch { return false }
}

export function HeroCanvas() {
  const prefersReduced = useReducedMotion()
  if (prefersReduced || !canUseWebGL()) return <HeroFallback />

  return (
    <div
      ref={wrapperRef}
      className="absolute inset-0 opacity-0 [transition:opacity_500ms_cubic-bezier(0,0,0.2,1)] data-[ready=true]:opacity-100"
      aria-hidden="true"
    >
      <HeroScene onReady={() => { if (wrapperRef.current) wrapperRef.current.dataset.ready = 'true' }} />
    </div>
  )
}
```

**Build-error confirmation:** If `HeroScene` is accidentally imported directly in a Server Component, Next.js 16 throws at build time. The test is: run `next build` and confirm no Canvas/WebGL imports in the server bundle output.

### Pattern 2: Frameloop Pause via `frameloop` Prop (Recommended)

**What:** Pass `frameloop` as a controlled prop from a state variable driven by `IntersectionObserver`. Changing the prop reconfigures the R3F renderer without remounting the Canvas.

**When to use:** `frameloop="always"` scenes that must pause when scrolled off-screen (D-04, D-05).

```tsx
// Inside HeroScene.tsx ('use client', no 'use server')
import { useRef, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor, AdaptiveDpr } from '@react-three/drei'

export function HeroScene({ onReady }: { onReady?: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="absolute inset-0">
      <Canvas
        frameloop={isVisible ? 'always' : 'never'}
        dpr={[1, 2]}
        camera={{ fov: CAMERA_FOV, position: [0, 0, CAMERA_Z] }}
        gl={{ antialias: false }}   // antialias=false saves fill-rate on mobile
        onCreated={onReady}
      >
        <PerformanceMonitor onDecline={() => {/* handled by AdaptiveDpr */}} >
          <AdaptiveDpr />
          <GlassScene />
        </PerformanceMonitor>
      </Canvas>
    </div>
  )
}
```

**Alternative — `useThree().setFrameloop` inside Canvas:** [ASSUMED] A `FrameloopController` child component can call `useThree().setFrameloop('never'/'always')` at runtime. This approach requires an inner child component but avoids re-rendering the Canvas parent on each intersection change. Both patterns are valid; the prop approach is simpler for this use case.

### Pattern 3: PerformanceMonitor + AdaptiveDpr Adaptive DPR

**What:** `PerformanceMonitor` tracks fps and fires `onDecline`/`onIncline`; `AdaptiveDpr` auto-adjusts `dpr` using `state.performance.current * initialDpr`.

[CITED: http://drei.docs.pmnd.rs/performances/performance-monitor]
[CITED: http://drei.docs.pmnd.rs/performances/adaptive-dpr — AdaptiveDpr reads `useThree((s) => s.performance.current)` and calls `setDpr(current * initialDpr)`]

```tsx
// Minimal adaptive DPR pattern — no manual setDpr needed
<Canvas dpr={[1, 2]}>
  <PerformanceMonitor
    ms={250}          // sample window
    iterations={10}   // samples before decision
    onDecline={() => {
      // Optional: also reduce material complexity
      setUseCheapMaterial(true)
    }}
    onIncline={() => setUseCheapMaterial(false)}
  >
    <AdaptiveDpr />   {/* auto-adjusts dpr within Canvas [1,2] range */}
    <GlassScene cheapMaterial={useCheapMaterial} />
  </PerformanceMonitor>
</Canvas>
```

### Pattern 4: Token-Driven Lighting (No HDRI)

**What:** Declare token hex values as named JS constants at the top of the scene file; use them in `<directionalLight>`, `<ambientLight>`, `<pointLight>` color props. No `drei <Environment>`, no loaded assets.

**Why no Environment:** `drei <Environment>` presets load remote HDRI files from GitHub — not acceptable in production (network request, LCP impact). Custom Environment children render an off-buffer cube camera — lighter, but unnecessary for a single glass mesh. Colored lights are sufficient and produce zero asset weight.

[CITED: drei docs — Environment presets "link towards common HDRI Haven assets hosted on github" and "are not meant to be used in production environments"]

```tsx
// components/hero/constants.ts
// Named JS constants derived from styles/tokens.css @theme block.
// These ARE raw hex values — scene files are excluded from the no-raw-hex invariant scan
// (tests/invariants/no-raw-hex.sh scans app/ only, NOT components/).
// Comment on each line documents the source token for auditability.

export const ACCENT_HEX       = '#1C39BB' // from --color-accent
export const SURFACE_DARK_HEX = '#0F0F10' // from --color-surface-dark
export const SURFACE_HEX      = '#FFFFFF' // from --color-surface
export const SURFACE_SUBTLE   = '#FAFAFA' // from --color-surface-subtle

export const GLASS_IOR         = 1.5
export const GLASS_ROUGHNESS   = 0.05
export const GLASS_THICKNESS   = 0.3
export const GLASS_SAMPLES     = 6       // reduce to 2-3 on mobile degradation
export const GLASS_RESOLUTION  = 256     // reduce to 32 on mobile degradation
export const ROTATION_SPEED    = 0.003   // radians/frame at 60fps (~35s/revolution)
export const CAMERA_FOV        = 45
export const CAMERA_Z          = 5
export const HERO_FADE_MS      = 500     // = --duration-entrance token value

// Mobile degradation thresholds (used on PerformanceMonitor.onDecline)
export const GLASS_SAMPLES_MOBILE     = 2
export const GLASS_RESOLUTION_MOBILE  = 32
```

**IDENT-01 note:** The invariant script `tests/invariants/no-raw-hex.sh` scans `app/` only [VERIFIED: tests/invariants/no-raw-hex.sh:18 — `APP_DIR="${REPO_ROOT}/app"`]. The scene file lives in `components/hero/constants.ts` — outside the scanned path. However, per the UI-SPEC FLAG, each constant must have a comment naming its source token so the token derivation remains auditable. The planner must NOT extend the invariant scan to include `components/hero/` without careful exclusions — constants.ts legitimately holds hex values that trace back to tokens.

### Pattern 5: Mobile Degradation Strategy (D-12 — primary risk)

**What:** Two-tier degradation triggered by `PerformanceMonitor.onDecline`.

**Tier 1 (soft degradation — default on mobile):**
- `MeshTransmissionMaterial` with `samples={GLASS_SAMPLES_MOBILE}` (2) + `resolution={GLASS_RESOLUTION_MOBILE}` (32) + `transmissionSampler={true}` (uses THREE.js internal buffer — cheaper, but can't see other transparent objects; fine for a single mesh)
- `dpr` already reduced by `AdaptiveDpr`

**Tier 2 (hard fallback — if Tier 1 still fails budget):**
- Switch to `meshPhysicalMaterial` (built-in THREE.js, no extra render pass) with `roughness={0.1}`, `opacity={0.85}`, `transparent={true}` — a frosted glass look without transmission cost
- Triggered if `PerformanceMonitor.onFallback` fires (after `flipflops` limit reached)

**Draw call budget:** One mesh + one material = 2–3 draw calls baseline. Transmission adds 1 extra render pass (scene re-rendered to texture) but does not add draw calls in the traditional sense. The < 200 draw call budget is comfortably met with a single mesh. The extra render pass is the real cost — mitigated by `resolution=32` on mobile.

[ASSUMED] The exact relationship between `resolution` and render pass cost: lower resolution = faster texture render = less GPU time per frame. This is consistent with the drei docs recommendation to "use a tiny resolution, for instance 32x32 pixels, it will still look good but perform much faster."

### Anti-Patterns to Avoid

- **`drei <Environment preset="...">` in production:** Presets load remote HDRI files from GitHub at runtime — network request, LCP regression. Use colored lights instead.
- **`frameloop="always"` without an offscreen pause:** Continuous GPU/CPU draw even when the hero is scrolled off-screen, draining battery on mobile. Must use IntersectionObserver gate.
- **`dynamic()` called inside render:** The `dynamic()` call must be at module top level (not inside the component function) for Next.js to assign stable chunk IDs.
- **Importing `HeroScene` directly from a Server Component:** Next.js 16 throws a build-time error. The import chain must be: `page.tsx` (Server) → `HeroSection.tsx` (`'use client'`) → `HeroCanvas.tsx` (`'use client'`) → `dynamic(() => import('./HeroScene'), { ssr: false })`.
- **Raw hex inline in component files:** The invariant scans `app/` for raw hex. Named constants in `components/hero/constants.ts` are exempt but MUST have source-token comments.
- **`antialias: true` on Canvas on mobile:** Expensive; `gl={{ antialias: false }}` is the correct default for a performance-budgeted hero.
- **Barrel imports from drei:** `import { ... } from '@react-three/drei'` is a barrel import — always use named imports. `MeshTransmissionMaterial`, `PerformanceMonitor`, `AdaptiveDpr`, `Float` must be imported individually.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Adaptive DPR based on FPS | Custom FPS counter + manual setDpr | `PerformanceMonitor` + `AdaptiveDpr` from drei | drei's PerformanceMonitor handles sampling window, iteration counting, hysteresis (flipflops); AdaptiveDpr wires factor → setDpr automatically |
| Glass material with refraction | Custom shader | `MeshTransmissionMaterial` from drei | Handles buffer texture, samples, resolution, backside, chromaticAberration — months of shader engineering |
| WebGL capability detection | Complex feature detection | Simple `canvas.getContext('webgl2')` sniff | Two-line check is sufficient; browser APIs are stable |
| Fade-in CSS transition | JS animation loop | CSS `data-[ready=true]:opacity-100` with `[transition:opacity_500ms_...]` | Zero JS runtime for a pure visual property |

**Key insight:** The entire scene complexity budget is consumed by the glass material. Everything else (geometry, camera, lighting) should be as simple as possible.

---

## Common Pitfalls

### Pitfall 1: `ssr: false` in a Server Component causes silent build failure (or build error)

**What goes wrong:** If `dynamic(() => import('./HeroScene'), { ssr: false })` is placed in a file without `'use client'`, Next.js 16 throws at build time: `"ssr: false is not allowed with next/dynamic in Server Components."` This is a BUILD ERROR, not a runtime warning — the build fails.

**Why it happens:** `ssr: false` is only valid in Client Components per Next.js 16 App Router rules.

**How to avoid:** `HeroCanvas.tsx` must have `'use client'` at line 1. The `dynamic()` call lives in `HeroCanvas.tsx`. `HeroSection.tsx` already has `'use client'` (confirmed via source read) — it can safely import `HeroCanvas`.

**Warning signs:** Build output shows the error. The SSR isolation test (`next build` + grep for Canvas in server bundle) will catch this.

[VERIFIED: node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md:94-95] — "ssr: false is not allowed with next/dynamic in Server Components. Please move it into a Client Component."

### Pitfall 2: The gradient disappears before Canvas is ready (CLS / LCP regression)

**What goes wrong:** If `HeroFallback` is conditionally removed when `HeroCanvas` mounts (before the Canvas is ready), there's a blank frame. Both LCP and CLS break.

**Why it happens:** Mistakenly treating the mounting of `HeroCanvas` as "ready" rather than the R3F `onCreated` callback.

**How to avoid:** The `.hero-backdrop` fallback div must remain painted at all times. The Canvas wrapper starts at `opacity-0` and fades in OVER the fallback (both are in the DOM simultaneously). The fallback is never explicitly removed — it remains beneath the Canvas. The `onCreated` callback sets `data-ready="true"` to trigger the CSS fade-in.

### Pitfall 3: `transmissionSampler={true}` hides transmissive siblings

**What goes wrong:** `transmissionSampler={true}` uses THREE.js's internal transmission buffer, which cannot render other transparent/transmissive objects — they become invisible in the refraction. For a single glass mesh with no other transparent objects in this scene, this is fine.

**Why it matters:** If a second transparent element (e.g., a glass pane or transparent overlay) is ever added to the scene, `transmissionSampler` must be switched to `false` (custom buffer) or those elements will not appear in the glass refraction.

**How to avoid:** Document in the component that `transmissionSampler={true}` assumes single-mesh-only scene. Fine for this phase; guard against future additions.

### Pitfall 4: Draw call measurement in dev vs production build

**What goes wrong:** Draw calls in `next dev` are higher than in `next build` + `next start` because development mode includes extra React DevTools instrumentation. The D-12 budget MUST be verified in production.

**How to avoid:** Always run `next build && next start`, then use Spector.js browser extension or R3F's built-in `<Stats />` component (in a temporary debug build) to count draw calls. Never report dev-server draw call counts.

### Pitfall 5: `frameloop` prop change causes Canvas remount

**What goes wrong:** In some R3F versions, changing a prop that affects the GL context can cause the Canvas to remount (destroying and recreating the WebGL context). This causes a flash and re-initialization cost.

**How to avoid:** The `frameloop` prop is designed to be changed dynamically without remounting (it reconfigures the animation loop, not the GL context). [ASSUMED — this is documented behavior in R3F]. Verify by observing that IntersectionObserver transitions do not cause a Canvas flash/blank on first test.

### Pitfall 6: `MeshTransmissionMaterial` with `roughness > 0` + full resolution = expensive

**What goes wrong:** Setting `roughness > 0` enables blur on the transmission buffer, which requires the texture at full resolution to look good. At low `resolution` (32px), a rough frosted look degrades to pixelated. At full resolution, it's a large blur pass.

**How to avoid:** For the soft frosted-glass look at low resolution, keep `roughness={0}` or very low (≤ 0.05) and rely on `chromaticAberration={0.05}` for visual richness instead. The "frosted" quality comes from IOR bending + slight tint, not surface roughness blur at low res.

---

## Code Examples

### Complete `HeroCanvas.tsx` — Gate + Dynamic Import + Fade-in

```tsx
// components/hero/HeroCanvas.tsx
// Source: Next.js 16 lazy-loading docs (node_modules/next/dist/docs); UI-SPEC D-11; D-06
'use client'

import dynamic from 'next/dynamic'
import { useRef, useEffect } from 'react'
import { useReducedMotion } from 'motion/react'
import { HeroFallback } from './HeroFallback'
import { HERO_FADE_MS } from './constants'

// Module-level dynamic() — required by Next.js (cannot be inside render)
const HeroScene = dynamic(() => import('./HeroScene'), { ssr: false })

function canUseWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl') || c.getContext('experimental-webgl'))
  } catch { return false }
}

export function HeroCanvas() {
  const prefersReduced = useReducedMotion()
  const wrapperRef = useRef<HTMLDivElement>(null)

  if (prefersReduced || !canUseWebGL()) return <HeroFallback />

  const handleReady = () => {
    if (wrapperRef.current) wrapperRef.current.dataset.ready = 'true'
  }

  return (
    // Path 1: CSS-only fade-in, no JS runtime cost
    // --duration-entrance = 500ms (closest token to 400ms target)
    <div
      ref={wrapperRef}
      className="absolute inset-0 opacity-0 [transition:opacity_500ms_cubic-bezier(0,0,0.2,1)] data-[ready=true]:opacity-100"
      aria-hidden="true"
    >
      <canvas style={{ display: 'block' }} />
      <HeroScene onReady={handleReady} />
    </div>
  )
}
```

### `HeroScene.tsx` — Canvas + IntersectionObserver + PerformanceMonitor

```tsx
// components/hero/HeroScene.tsx
// Source: R3F Canvas API docs; drei PerformanceMonitor + AdaptiveDpr docs
'use client'

import { useRef, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor, AdaptiveDpr } from '@react-three/drei'
import { GlassMesh } from './GlassMesh'
import { CAMERA_FOV, CAMERA_Z } from './constants'

export function HeroScene({ onReady }: { onReady?: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="absolute inset-0">
      <Canvas
        frameloop={isVisible ? 'always' : 'never'}
        dpr={[1, 2]}
        camera={{ fov: CAMERA_FOV, position: [0, 0, CAMERA_Z] }}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        onCreated={onReady}
        style={{ position: 'absolute', inset: 0 }}
      >
        <PerformanceMonitor>
          <AdaptiveDpr />
          <GlassMesh />
        </PerformanceMonitor>
      </Canvas>
    </div>
  )
}
```

### `GlassMesh.tsx` — Rotating Glass with MeshTransmissionMaterial

```tsx
// components/hero/GlassMesh.tsx
// Source: drei MeshTransmissionMaterial docs; R3F useFrame docs
'use client' // implied — lives inside Canvas, which is client-only

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshTransmissionMaterial } from '@react-three/drei'
import type { Mesh } from 'three'
import {
  ACCENT_HEX, SURFACE_HEX, SURFACE_DARK_HEX,
  GLASS_IOR, GLASS_ROUGHNESS, GLASS_THICKNESS,
  GLASS_SAMPLES, GLASS_RESOLUTION,
  GLASS_SAMPLES_MOBILE, GLASS_RESOLUTION_MOBILE,
  ROTATION_SPEED
} from './constants'

export function GlassMesh() {
  const meshRef = useRef<Mesh>(null)
  const [degraded, setDegraded] = useState(false)

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += ROTATION_SPEED
    }
  })

  return (
    <>
      {/* Token-driven lighting — no HDRI, no Environment, no loaded assets */}
      <ambientLight intensity={0.4} color={SURFACE_HEX} />          {/* from --color-surface */}
      <directionalLight
        intensity={1.2}
        position={[2, 3, 4]}
        color={SURFACE_HEX}                                          {/* from --color-surface */}
      />
      <pointLight
        intensity={0.6}
        position={[-3, -2, 2]}
        color={ACCENT_HEX}                                           {/* from --color-accent */}
      />

      <mesh
        ref={meshRef}
        position={[0.8, 0, 0]}  /* offset right: Option A legibility — focal mass at ~65-70% horizontal */
        scale={1.2}
      >
        {/* icosahedronGeometry: smooth, minimal polygons, rounded look */}
        <icosahedronGeometry args={[1, 4]} />
        <MeshTransmissionMaterial
          color={ACCENT_HEX}                    {/* from --color-accent — blue glass tint */}
          ior={GLASS_IOR}
          roughness={GLASS_ROUGHNESS}
          thickness={GLASS_THICKNESS}
          transmission={1}
          samples={degraded ? GLASS_SAMPLES_MOBILE : GLASS_SAMPLES}
          resolution={degraded ? GLASS_RESOLUTION_MOBILE : GLASS_RESOLUTION}
          transmissionSampler={degraded}        {/* cheaper buffer on degraded path */}
          backside={false}
          chromaticAberration={0.05}
          anisotropicBlur={0}
        />
      </mesh>
    </>
  )
}
```

### `HeroFallback.tsx` — Static gradient fallback

```tsx
// components/hero/HeroFallback.tsx
// Source: app/globals.css .hero-backdrop; UI-SPEC HeroFallback specification
export function HeroFallback() {
  return <div className="absolute inset-0 hero-backdrop" aria-hidden="true" />
}
```

---

## Runtime State Inventory

> Not applicable — this is a greenfield client island phase (no rename/refactor, no data migration). No stored data, live service config, OS-registered state, secrets, or build artifacts need updating.

**Nothing found in any category** — confirmed by phase scope (new files only; HeroSection.tsx backdrop layer swapped but no data state involved).

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `frameloop="demand"` for all heroes | `frameloop="always"` + IntersectionObserver pause for animated heroes | R3F v7+ | D-04 chose always-on loop; offscreen pause is now the mandatory companion pattern |
| Manual DPR reduction code | `PerformanceMonitor` + `AdaptiveDpr` (drei) | drei v9+ | Automatic FPS-based DPR adaptation replaces manual device sniffing |
| HDRI files for glass environment | Colored lights or `Environment` with children | drei v9+ | Remote preset HDRIs are dev-only; production uses programmatic lighting |
| `meshPhysicalMaterial` (THREE.js built-in) | `MeshTransmissionMaterial` (drei) | drei v8+ | More tunable (samples, resolution, backside); but more expensive — use with budget control |
| `import { ... } from '@react-three/drei'` barrel | Named imports only | Always the rule; enforced by CLAUDE.md | Prevents bundle bloat from non-tree-shaken barrel import |

**Deprecated/outdated:**
- `framer-motion` package name: replaced by `motion` (same codebase) — already correctly installed in this project as `motion`
- `drei <Loader>` for loading states: rejected by D-11 — the gradient is the loading state

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Changing `frameloop` prop on `<Canvas>` does not remount the Canvas or destroy the GL context | Pitfall 5, HeroScene pattern | Canvas would flash/blank on every viewport intersection — use `setFrameloop` hook pattern instead |
| A2 | `MeshTransmissionMaterial` with `samples=2` + `resolution=32` meets LCP < 2.5s on Moto G4 profile | Pitfall section; Pattern 5 Tier 1 | Would need to fall back to `meshPhysicalMaterial` (Tier 2) on mobile |
| A3 | `icosahedronGeometry` at detail 4 stays well under 200 draw calls when combined with MeshTransmissionMaterial | Don't Hand-Roll | If draw calls exceed budget, switch to lower detail level or `SphereGeometry` |
| A4 | The no-raw-hex invariant scan (`tests/invariants/no-raw-hex.sh`) does NOT scan `components/` — only `app/` | Pattern 4 / constants.ts | If scan is extended to `components/`, `constants.ts` will fail; would need scan exclusion for hero constants file |
| A5 | `drei <Environment>` preset values are loaded from external network at runtime (GitHub-hosted HDRIs) | Pattern 4 | If presets are bundled locally in the npm package, LCP impact would be different — but avoidance is still correct (large file size) |

**A4 is VERIFIED**: `tests/invariants/no-raw-hex.sh` line 18 sets `APP_DIR="${REPO_ROOT}/app"` and all grep commands target `"${APP_DIR}"` only. [VERIFIED: tests/invariants/no-raw-hex.sh:18-26]

---

## Open Questions

1. **Mobile LCP measurement baseline**
   - What we know: The gradient is the LCP element and ships in SSR HTML; Canvas is lazy
   - What's unclear: Whether `next start` on this machine produces results comparable to a Vercel deployment for Lighthouse Moto G4 profiling
   - Recommendation: Run Lighthouse against `next start` with CPU 4x throttle + "Slow 4G" network to approximate Moto G4; record baseline before adding Canvas; record after; delta is the Canvas impact

2. **`transmissionSampler` on R3F v9 / drei v10**
   - What we know: The prop name is documented in drei docs
   - What's unclear: Whether `transmissionSampler` is still the correct prop name in `@react-three/drei@10.7.8` (vs. using the THREE.js built-in buffer differently)
   - Recommendation: After install, verify via TypeScript autocomplete on `MeshTransmissionMaterialProps`

3. **`icosahedronGeometry` vs `SphereGeometry` for the glass mesh**
   - What we know: `icosahedronGeometry` at detail 4 = 320 faces; at detail 6 = 720 faces
   - What's unclear: Visual quality difference for a glass material at hero scale
   - Recommendation: Executor discretion — start with detail 4; the glass material is the visual story, not polygon count

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Package install, build | ✓ | v20.17.0 | — |
| npm | Package install | ✓ | (bundled) | — |
| `three@0.185.1` | R3F peer dep | ✗ (not installed) | — | Must install |
| `@react-three/fiber@9.7.0` | Canvas/R3F | ✗ (not installed) | — | Must install |
| `@react-three/drei@10.7.8` | MeshTransmissionMaterial, PerformanceMonitor, AdaptiveDpr | ✗ (not installed) | — | Must install |
| Lighthouse CLI | LCP/CLS measurement | ✗ | — | `npx lighthouse` (no global install needed) |
| Chrome / Chromium | Lighthouse, Playwright | ✗ system | — | Playwright bundles its own Chromium |
| `next build` + `next start` | Production perf testing | ✓ (via npm scripts) | 16.3.0 | — |

**Missing dependencies with no fallback:** `three`, `@react-three/fiber`, `@react-three/drei` — Wave 0 task must install these before any scene work.

**Missing dependencies with fallback:** `lighthouse` CLI — `npx lighthouse@latest` works without a global install.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Playwright (via `@playwright/test`) |
| Config file | `playwright.config.ts` (exists) |
| Quick run command | `npx playwright test tests/sections/hero.spec.ts --project=mobile-375` |
| Full suite command | `npx playwright test tests/sections/ tests/layout/ tests/motion/ tests/a11y/axe.spec.ts` |

Playwright uses `next start` as the web server (confirmed in `playwright.config.ts` `webServer.command: 'npm run start'`).

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| HERO-01 | R3F hero renders without hydration errors | smoke | `npx playwright test tests/sections/hero.spec.ts` | ✅ (extend existing) |
| HERO-01 | Canvas NOT in server bundle (ssr:false isolation) | build-check | `next build 2>&1 \| grep -i "canvas\|webgl" \| grep -v "found 0"` | ❌ Wave 0 |
| HERO-01 | Canvas visible in DOM (happy path) | e2e | `expect(page.locator('canvas')).toBeVisible()` | ❌ Wave 0 |
| HERO-02 | No `<canvas>` in DOM when `prefers-reduced-motion: reduce` | e2e | `expect(page.locator('canvas')).toHaveCount(0)` | ❌ Wave 0 (extend reduced.spec.ts) |
| HERO-02 | CLS = 0 (no layout shift) | lighthouse | `npx lighthouse http://localhost:3000/de --only-categories=performance` | ❌ manual gate |
| HERO-02 | LCP < 2.5s Moto G4 profile | lighthouse | `npx lighthouse http://localhost:3000/de --preset=perf --emulated-form-factor=mobile` | ❌ manual gate |
| HERO-02 | Draw calls < 200 | manual / Spector.js | Manual browser dev tools inspection | ❌ manual gate |
| HERO-02 | PerformanceMonitor adaptive DPR active | manual | CPU 4x throttle in DevTools, observe DPR change | ❌ manual gate |

### Sampling Rate

- **Per task commit:** `npx playwright test tests/sections/hero.spec.ts tests/motion/reduced.spec.ts --project=mobile-375`
- **Per wave merge:** `npm run test:sections && npm run test:invariants`
- **Phase gate:** Full `npm run test:sections` green + manual Lighthouse Moto G4 LCP/CLS gate + manual draw call count via Spector.js, all against `next start` (not dev)

### Wave 0 Gaps

- [ ] `tests/sections/hero.spec.ts` — extend: add `canvas` visibility check (happy path); add reduced-motion no-canvas assertion (currently in `tests/motion/reduced.spec.ts` but needs canvas-specific assertion)
- [ ] `tests/motion/reduced.spec.ts` — extend: add `expect(page.locator('canvas')).toHaveCount(0)` under `reducedMotion: 'reduce'` context
- [ ] New invariant: `tests/invariants/no-canvas-server-bundle.sh` — `next build` output check that `canvas`/`webgl` imports are absent from server chunk

*(Existing `hero.spec.ts` covers hero visibility and screenshot — a good base; no framework install needed.)*

---

## Security Domain

Security enforcement is enabled (no `false` in config). ASVS Level 1 applies.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | Phase 5 adds no auth |
| V3 Session Management | No | No sessions |
| V4 Access Control | No | Hero is public decorative |
| V5 Input Validation | No | No user input in this phase |
| V6 Cryptography | No | No crypto |
| V7 Error Handling | Yes (partial) | WebGL failure silently falls back — no error detail exposed to user |

### Known Threat Patterns for This Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Canvas fingerprinting | Information Disclosure | Canvas is decorative + aria-hidden; no user data collected; irrelevant for this use case |
| Supply chain (R3F packages) | Tampering | Pinned versions in package.json; npm lockfile; packages from pmndrs org with 3–11M weekly downloads |
| Client-side resource exhaustion (GPU) | Denial of Service | PerformanceMonitor + AdaptiveDpr + frameloop pause + offscreen detection — all mandatory mitigations already in design |

---

## Project Constraints (from CLAUDE.md)

The following directives from `.claude/CLAUDE.md` and `AGENTS.md` directly bind Phase 5:

1. **Stack versions locked:** `three@0.185.1`, `@react-three/fiber@9.7.0`, `@react-three/drei@10.7.8` — do not propose alternatives or different versions
2. **Tailwind v4 `@theme` only:** No `tailwind.config.js`, no SCSS modules, no inline styles — phase 5 adds no new CSS tokens
3. **IDENT-01:** Zero raw hex in `app/` files; zero `text-gray-*`/`bg-gray-*` — scene constants in `components/hero/constants.ts` are exempt from the scan but MUST have source-token comments
4. **drei named imports only:** Never `import { ... } from '@react-three/drei'` as a barrel — always named (`import { MeshTransmissionMaterial } from '@react-three/drei'`)
5. **Canvas must be behind `dynamic(() => import(...), { ssr: false })` in a `'use client'` wrapper** — build error if imported server-side must be ABSENT (i.e. the error must NOT occur, meaning isolation is correct)
6. **`frameloop="demand"` for static heroes** — D-04 chose continuous rotation, which requires `frameloop="always"` + offscreen pause (intentional, budgeted deviation)
7. **Read `node_modules/next/dist/docs/` before any Next.js code** — done: lazy-loading.md and use-client.md read this session
8. **`motion` package:** Import from `motion/react` (not `framer-motion`)
9. **All Tailwind:** Tailwind is the ONLY styling approach — no inline styles in component files
10. **Deploy target:** Vercel — `next build` must pass cleanly; `sharp` already installed

---

## Sources

### Primary (MEDIUM confidence — official docs, verified this session)

- `node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md` — Next.js 16 `dynamic({ ssr: false })` App Router pattern; confirmed `ssr:false` must be in Client Component
- `node_modules/next/dist/docs/01-app/03-api-reference/01-directives/use-client.md` — `'use client'` boundary semantics in Next.js 16
- `http://drei.docs.pmnd.rs/shaders/mesh-transmission-material` — MeshTransmissionMaterial props: samples, resolution, transmissionSampler, extra render pass
- `http://drei.docs.pmnd.rs/performances/performance-monitor` — PerformanceMonitor full prop API including type signatures
- `http://drei.docs.pmnd.rs/performances/adaptive-dpr` — AdaptiveDpr uses `state.performance.current * initialDpr` to call `setDpr`
- `https://r3f.docs.pmnd.rs/api/canvas` — Canvas `frameloop` values: `'always' | 'demand' | 'never'`; confirmed `'never'` is valid
- `https://r3f.docs.pmnd.rs/api/hooks` — `useThree()` exposes `setFrameloop` shortcut; confirmed `'never'` as valid value
- `https://r3f.docs.pmnd.rs/advanced/scaling-performance` — PerformanceMonitor factor × initial DPR pattern
- `https://github.com/pmndrs/drei/blob/master/src/core/AdaptiveDpr.tsx` — AdaptiveDpr source: `useThree((s) => s.performance.current)` + `setDpr(current * initialDpr)`
- `https://drei.docs.pmnd.rs/staging/environment` — Environment presets load remote HDRI from GitHub; "not meant to be used in production"; custom children pattern

### Project Source Files (VERIFIED this session)

- `components/sections/HeroSection.tsx` — exact swap contract, `'use client'` confirmed, `.hero-backdrop` layer at line 48 [VERIFIED: components/sections/HeroSection.tsx:48]
- `app/globals.css` — `.hero-backdrop` CSS utility, exact gradient values [VERIFIED: app/globals.css:61-67]
- `styles/tokens.css` — all color token hex values [VERIFIED: styles/tokens.css:38-51]
- `tests/invariants/no-raw-hex.sh` — scan scope is `app/` only [VERIFIED: tests/invariants/no-raw-hex.sh:18]
- `tests/sections/hero.spec.ts` — existing test structure
- `tests/motion/reduced.spec.ts` — existing reduced-motion test structure
- `playwright.config.ts` — `next start` as web server confirmed
- `package.json` — three/fiber/drei absent confirmed; `motion` present confirmed

### Registry (VERIFIED)

- npm registry — `three@0.185.1`, `@react-three/fiber@9.7.0`, `@react-three/drei@10.7.8` all confirmed via `npm view`

---

## Metadata

**Confidence breakdown:**
- Standard Stack: MEDIUM — pinned versions confirmed on npm registry; package legitimacy seam returned SUS (too-new) for fiber/drei but both are legitimate pmndrs packages with millions of downloads
- Architecture: MEDIUM — patterns verified against Next.js 16 docs and R3F/drei official docs; frameloop prop approach is assumed non-remounting (A1)
- Pitfalls: MEDIUM — Next.js 16 build error for ssr:false in Server Component verified from docs; glass material cost characteristics verified from drei docs

**Research date:** 2026-08-21
**Valid until:** 2026-09-21 (R3F is fast-moving; re-verify drei API if more than 30 days pass)
