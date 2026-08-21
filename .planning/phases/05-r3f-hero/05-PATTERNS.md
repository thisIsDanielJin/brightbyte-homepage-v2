# Phase 5: R3F Hero — Pattern Map

**Mapped:** 2026-08-21
**Files analyzed:** 7 (5 new, 1 modified, 1 package manifest)
**Analogs found:** 7 / 7

---

## File Classification

| New / Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---------------------|------|-----------|----------------|---------------|
| `components/hero/HeroCanvas.tsx` | component (client island) | request-response (gate + lazy load) | `components/sections/ContactSection.tsx` | role-match — both are `'use client'` islands with conditional render branches |
| `components/hero/HeroScene.tsx` | component (R3F scene root) | event-driven (render loop + IntersectionObserver) | `components/ui/MotionSection.tsx` | partial — both gate on a browser API and conditionally suppress output |
| `components/hero/GlassMesh.tsx` | component (R3F mesh) | event-driven (useFrame render loop) | `components/ui/MotionSection.tsx` | partial — closest motion/animation pattern available; no R3F in codebase yet |
| `components/hero/HeroFallback.tsx` | component (static display) | request-response | `components/sections/HeroSection.tsx` (line 48) | exact — verbatim reuse of the existing backdrop `<div>` |
| `components/hero/constants.ts` | utility (scene constants) | transform (token → JS constant) | `styles/tokens.css` (source values) | role-match — constants file derives from the token source file |
| `components/sections/HeroSection.tsx` | component (section shell) | request-response | `components/sections/HeroSection.tsx` itself | self — only the backdrop layer is swapped; the rest is preserved verbatim |
| `package.json` | config (dependency manifest) | — | `package.json` itself | self — add three deps to existing manifest |
| `tests/sections/hero.spec.ts` | test (section + canvas) | — | `tests/sections/hero.spec.ts` (extend) + `tests/motion/reduced.spec.ts` | exact — extend existing files |
| `tests/motion/reduced.spec.ts` | test (reduced-motion gate) | — | `tests/motion/reduced.spec.ts` itself | self — extend with canvas-absence assertion |
| `tests/invariants/no-canvas-server-bundle.sh` | utility (CI invariant gate) | — | `tests/invariants/no-raw-hex.sh` | role-match — same bash invariant gate pattern |

---

## Pattern Assignments

### `components/hero/HeroCanvas.tsx` (client island, gate + lazy load)

**Analog:** `components/sections/ContactSection.tsx`

This is the closest existing `'use client'` island with a conditional render branch. The
ContactSection is the only other Phase 4 client island. HeroCanvas follows the same
structural pattern: `'use client'` at line 1, named export, conditional early return for
the fallback path, then the main render branch.

**Imports pattern** (ContactSection.tsx lines 24–29):
```tsx
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { MotionSection } from '@/components/ui/MotionSection'
```

**For HeroCanvas — adapt to:**
```tsx
'use client'

import dynamic from 'next/dynamic'
import { useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { HeroFallback } from './HeroFallback'
import { HERO_FADE_MS } from './constants'

// Module-level dynamic() — Next.js requires this at module scope, never inside render.
// VERIFIED: node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md:66-68
const HeroScene = dynamic(() => import('./HeroScene'), { ssr: false })
```

**Conditional early-return pattern** (ContactSection.tsx lines 34–46 — `if (state === 'success')` early branch):
```tsx
// ContactSection gate pattern (lines 114–138):
if (state === 'success') {
  return (
    <div role="status" aria-live="polite" ...>
      ...
    </div>
  )
}
// main render continues below
```

**For HeroCanvas — adapt early-return gate to:**
```tsx
export function HeroCanvas() {
  const prefersReduced = useReducedMotion()
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Reduced-motion gate: no Canvas rendered at all (D-06, HERO-02 — one-way locked contract)
  if (prefersReduced || !canUseWebGL()) return <HeroFallback />

  // ... main Canvas branch
}
```

**Named export style** (ContactSection.tsx line 34):
```tsx
export function ContactSection() {
```
All sections and UI components use named exports (no default export). HeroCanvas, HeroScene,
GlassMesh, HeroFallback all follow this convention.

**`aria-hidden` on decorative wrappers** (HeroSection.tsx line 48):
```tsx
<div className="absolute inset-0 hero-backdrop" aria-hidden="true" />
```
The Canvas wrapper div must also carry `aria-hidden="true"` — Canvas is decorative.

---

### `components/hero/HeroScene.tsx` (R3F scene root, event-driven)

**Analog:** `components/ui/MotionSection.tsx`

MotionSection is the closest existing component that (a) is `'use client'`, (b) reads a
browser preference via a hook, and (c) conditionally controls animation behavior. HeroScene
extends this pattern with IntersectionObserver state driving the R3F `frameloop` prop.

**`'use client'` + useRef + useEffect pattern** (MotionSection.tsx lines 18–47):
```tsx
'use client'

import { motion, useReducedMotion } from 'motion/react'

// ... hook reads preference
const prefersReduced = useReducedMotion()

// ... conditional behavior driven by hook result
transition={
  prefersReduced
    ? { duration: 0 }
    : { duration: 0.5, ease: [0.0, 0.0, 0.2, 1] }
}
```

**For HeroScene — adapt to (event-driven IntersectionObserver + frameloop):**
```tsx
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

**Note on `style` prop on Canvas:** This is the ONE permitted inline style in the entire
codebase. R3F's `<Canvas>` element requires `position: absolute` applied directly to the
canvas element to fill its container — there is no Tailwind utility that targets the
inner canvas element created by R3F. The `style` prop on `<Canvas>` is documented R3F
API usage, not a violation of the inline-styles rule. Document it with a comment.

---

### `components/hero/GlassMesh.tsx` (R3F mesh, render loop)

**Analog:** `components/ui/MotionSection.tsx` (animation pattern); `styles/tokens.css`
(token source values for constants import)

No direct R3F mesh analog exists in the codebase. MotionSection provides the closest
animation-loop conceptual pattern (continuous motion driven by a timer/frame). The
constants import pattern is unique to this phase.

**Named import discipline** (CLAUDE.md rule — no barrel import from drei):
```tsx
// CORRECT — named imports per CLAUDE.md "drei named imports only" rule:
import { MeshTransmissionMaterial } from '@react-three/drei'
import { AdaptiveDpr, PerformanceMonitor } from '@react-three/drei'

// WRONG — barrel import (never do this):
// import * as drei from '@react-three/drei'
```

**Constants import pattern:**
```tsx
import {
  ACCENT_HEX, SURFACE_HEX,
  GLASS_IOR, GLASS_ROUGHNESS, GLASS_THICKNESS,
  GLASS_SAMPLES, GLASS_RESOLUTION,
  GLASS_SAMPLES_MOBILE, GLASS_RESOLUTION_MOBILE,
  ROTATION_SPEED
} from './constants'
```

**File header JSDoc pattern** (matching ContactSection.tsx lines 1–23):
```tsx
/**
 * components/hero/GlassMesh.tsx — Single frosted-glass mesh + MeshTransmissionMaterial.
 *
 * SCENE CONTRACT:
 *   - One mesh, one material — glass quality is the visual story (D-01, D-03).
 *   - Single-axis Y rotation at ROTATION_SPEED radians/frame (D-04).
 *   - PerformanceMonitor.onDecline triggers degraded material path (D-12).
 *   - transmissionSampler=true on degraded path ONLY — assumes single-mesh scene.
 *
 * IDENT-01: All hex values are named constants from constants.ts (derived from
 * styles/tokens.css). Raw hex is NOT present in this file — constants.ts is the
 * only file where hex appears, with source-token comments for auditability.
 *
 * Source: 05-RESEARCH.md Pattern 4 (token-driven lighting); 05-UI-SPEC.md Scene Motion Contract.
 */
'use client'
```

---

### `components/hero/HeroFallback.tsx` (static display, verbatim reuse)

**Analog:** `components/sections/HeroSection.tsx` line 48 — the exact markup being extracted.

**Exact source markup** (HeroSection.tsx line 48):
```tsx
<div className="absolute inset-0 hero-backdrop" aria-hidden="true" />
```

**HeroFallback is a direct extraction of this line:**
```tsx
/**
 * components/hero/HeroFallback.tsx — Static CSS gradient fallback for the 3D hero.
 *
 * This IS the existing .hero-backdrop div, extracted as a named component.
 * It is the reduced-motion state (D-06), the no-WebGL state, and the
 * pre-hydration state (D-10). Reuses app/globals.css .hero-backdrop verbatim.
 * Zero new CSS, zero new assets, guaranteed CLS = 0.
 *
 * Source: HeroSection.tsx:48; app/globals.css .hero-backdrop utility.
 */
export function HeroFallback() {
  return <div className="absolute inset-0 hero-backdrop" aria-hidden="true" />
}
```

**No `'use client'` needed** — HeroFallback is a pure static div with no hooks. It renders
correctly in both SSR and client contexts. ContactSection uses `'use client'` because it
has hooks; HeroFallback has none.

---

### `components/hero/constants.ts` (utility, token → JS constants)

**Analog:** `styles/tokens.css` (the source of truth for all hex values)

No existing JS constants file in the codebase. The pattern is unique to this phase because
R3F scene files cannot consume Tailwind utilities. The IDENT-01 invariant (`no-raw-hex.sh`)
scans `app/` only — `components/hero/constants.ts` is outside this scope.

**Token source values** (styles/tokens.css lines 28–49):
```css
--color-accent: #1C39BB;
--color-accent-hover: #1630A0;
--color-surface-dark: #0F0F10;
--color-surface: #FFFFFF;
--color-surface-subtle: #FAFAFA;

--ease-out: cubic-bezier(0.0, 0.0, 0.2, 1);
--duration-entrance: 500ms;
```

**Required constants pattern** — each constant MUST have a trailing source-token comment:
```ts
/**
 * components/hero/constants.ts — Token-derived JS constants for the R3F hero scene.
 *
 * These are the ONLY raw hex values permitted outside styles/tokens.css.
 * Each constant traces back to a named token in styles/tokens.css for auditability.
 *
 * IDENT-01 NOTE: tests/invariants/no-raw-hex.sh scans app/ ONLY (verified line 28).
 * This file lives in components/hero/ — outside the scan scope. However, each hex
 * value MUST have a source-token comment so the derivation remains auditable.
 * Do NOT extend the invariant scan to cover components/hero/ without adding an
 * exclusion for this file (see 05-RESEARCH.md Assumption A4).
 *
 * Scene material params (IOR, roughness, etc.) are NOT design tokens — they are
 * pure R3F parameters declared here for discoverability and tuning.
 */

// ── Color constants (derived from styles/tokens.css @theme block) ─────────────
export const ACCENT_HEX       = '#1C39BB' // from --color-accent
export const SURFACE_HEX      = '#FFFFFF' // from --color-surface
export const SURFACE_SUBTLE   = '#FAFAFA' // from --color-surface-subtle
export const SURFACE_DARK_HEX = '#0F0F10' // from --color-surface-dark

// ── Glass material parameters ──────────────────────────────────────────────────
export const GLASS_IOR        = 1.5
export const GLASS_ROUGHNESS  = 0.05
export const GLASS_THICKNESS  = 0.3
export const GLASS_SAMPLES    = 6
export const GLASS_RESOLUTION = 256
// Mobile degradation thresholds (PerformanceMonitor.onDecline)
export const GLASS_SAMPLES_MOBILE    = 2
export const GLASS_RESOLUTION_MOBILE = 32

// ── Scene / camera parameters ─────────────────────────────────────────────────
export const ROTATION_SPEED = 0.003  // radians/frame at 60fps (~35s/revolution)
export const CAMERA_FOV     = 45
export const CAMERA_Z       = 5

// ── Transition timing (from --duration-entrance: 500ms) ───────────────────────
// No exact 400ms token exists. Use 500ms (--duration-entrance) as the conservative
// pick within the D-11 "300–500ms" window. Do NOT add a new token to tokens.css.
export const HERO_FADE_MS = 500  // from --duration-entrance
```

---

### `components/sections/HeroSection.tsx` (modification — backdrop swap only)

**Analog:** `components/sections/HeroSection.tsx` itself (self-modification)

**Preserve verbatim** (lines 1–46 and 50–69 — everything EXCEPT the backdrop div):
- Header comment block (lines 1–19) — update Phase 5 note
- `'use client'` directive (line 20)
- All imports (lines 22–23)
- Interface and component signature (lines 25–30)
- `useTranslations` and copy resolution (lines 31–34)
- MotionSection wrapper (lines 38–41, 67–69)
- Text column (lines 50–66) — DO NOT TOUCH

**Only change** — replace line 48:
```tsx
// BEFORE (Phase 4 — static backdrop):
<div className="absolute inset-0 hero-backdrop" aria-hidden="true" />

// AFTER (Phase 5 — Canvas island over fallback):
{/* HeroCanvas mounts the R3F Canvas or falls back to HeroFallback (D-06, D-10).
    The HeroFallback (.hero-backdrop) is always painted first (LCP element).
    Canvas fades in over the fallback; fallback is never removed (CLS = 0). */}
<HeroCanvas />
```

**New import to add** (after existing imports, line 24):
```tsx
import { HeroCanvas } from '@/components/hero/HeroCanvas'
```

**Critical preservation check** — the text column `z-10` must remain:
```tsx
// line 51 — DO NOT CHANGE:
<div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 py-32">
```

---

### `package.json` (modification — add R3F deps)

**Self-analog** — add three new dependencies to the `"dependencies"` block.

**Pinned versions from CLAUDE.md:**
```json
"three": "0.185.1",
"@react-three/fiber": "9.7.0",
"@react-three/drei": "10.7.8"
```

**Install command** (not a JSON edit — the install command updates package.json + lockfile):
```bash
npm install three@0.185.1 @react-three/fiber@9.7.0 @react-three/drei@10.7.8
```

**Note on `styled-components`:** `package.json` currently contains `styled-components` in
`dependencies` (not used by any component in the codebase — likely a v1 remnant). Do NOT
remove it in this phase; removing unused deps is out of Phase 5 scope.

---

### `tests/sections/hero.spec.ts` (extension — canvas visibility + happy-path)

**Analog:** `tests/sections/hero.spec.ts` itself (extend existing file)
**Secondary analog:** `tests/sections/about.spec.ts` (locale × viewport loop pattern)

**Existing structure to preserve** (hero.spec.ts lines 1–49):
- SCREENSHOT_DIR setup (lines 16–21)
- `locales` array + `test.describe` loop (lines 23–49)
- `page.goto` + `waitForLoadState` pattern (lines 27–29)
- Section locator + `toBeVisible` assertion (lines 31–33)
- `hero.screenshot()` capture (lines 43–47)

**New assertions to add inside the existing locale loop:**
```ts
// After headline assertion (line 39), before screenshot (line 43):

// Canvas must be visible in happy path (WebGL available in Playwright's Chromium)
const canvas = page.locator('#hero canvas')
await expect(canvas).toBeVisible()

// Canvas must be aria-hidden (decorative — accessibility contract)
await expect(canvas).toHaveAttribute('aria-hidden', 'true')
```

**Reduced-motion canvas-absence block — add as a SEPARATE test in the locale loop:**
```ts
test('no <canvas> in DOM when prefers-reduced-motion: reduce', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' })
  const page = await context.newPage()
  await page.goto(`/${locale}`)
  await page.waitForLoadState('domcontentloaded')

  // D-06 / HERO-02: absolutely no canvas element when reduced motion is active
  const canvas = page.locator('#hero canvas')
  await expect(canvas).toHaveCount(0)

  await context.close()
})
```

---

### `tests/motion/reduced.spec.ts` (extension — canvas-absence assertion)

**Analog:** `tests/motion/reduced.spec.ts` itself (extend existing file)

**Existing structure to preserve** (lines 1–72) — all existing tests remain unchanged.

**New test to ADD at the end of the file:**
```ts
test('no canvas element in DOM under prefers-reduced-motion (D-06 / HERO-02)', async ({ browser }) => {
  const context = await browser.newContext({
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()
  await page.goto('/de')
  await page.waitForLoadState('domcontentloaded')

  // D-06 locked contract: Canvas must not exist at all when reduced motion is active
  // (not merely paused — the element must be absent from the DOM entirely)
  await expect(page.locator('canvas')).toHaveCount(0)

  await context.close()
})
```

---

### `tests/invariants/no-canvas-server-bundle.sh` (new invariant gate)

**Analog:** `tests/invariants/no-raw-hex.sh` (closest structural match — same bash invariant pattern)

**Pattern to replicate from no-raw-hex.sh:**
- `set -euo pipefail` (line 24)
- `SCRIPT_DIR` + `REPO_ROOT` derivation (lines 26–28)
- Single `EXIT_CODE=0` variable (line 30)
- grep scan + conditional FAIL block (lines 35–55)
- Final PASS echo + `exit "${EXIT_CODE}"` (lines 82–86)

**Invariant purpose:** Confirm that `next build` does not include Canvas/WebGL imports in
the server-side bundle. If `HeroScene` is accidentally imported outside the `dynamic()`
boundary, its three.js imports appear in the server chunk.

**New invariant structure:**
```bash
#!/usr/bin/env bash
#
# HERO-01 Invariant Gate — no-canvas-server-bundle.sh
#
# Verifies that Canvas/WebGL code is absent from the Next.js server bundle.
# If HeroScene is accidentally imported server-side (missing 'use client' on
# HeroCanvas or dynamic() call moved inside render), three.js imports appear
# in .next/server/ chunks.
#
# Exit 0 = clean. Exit 1 = canvas/WebGL found in server bundle.
#
# Usage:
#   bash tests/invariants/no-canvas-server-bundle.sh
#
# Ordering: requires a Next build (.next/server). If absent, runs npm run build first.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
BUILD_DIR="${REPO_ROOT}/.next"

EXIT_CODE=0

# Ensure build output exists (mirrors no-stega-in-build.sh pattern)
if [ ! -d "${BUILD_DIR}/server" ]; then
  echo "[no-canvas-server-bundle] No .next/server found — running 'npm run build' first..."
  ( cd "${REPO_ROOT}" && npm run build )
fi

# Scan server chunks for WebGL/Canvas imports
CANVAS_HITS=$(
  grep -rEl "getContext\('webgl|THREE\.|@react-three" "${BUILD_DIR}/server" \
    --include="*.js" \
  || true
)

if [ -n "${CANVAS_HITS}" ]; then
  echo "FAIL [HERO-01]: Canvas/WebGL code found in Next.js server bundle."
  echo "  This means HeroScene is imported server-side — ssr:false dynamic() is broken."
  echo ""
  echo "Offending files:"
  echo "${CANVAS_HITS}"
  echo ""
  echo "Fix: Ensure HeroCanvas.tsx has 'use client' at line 1 AND"
  echo "     dynamic() call is at module top-level (not inside render)."
  EXIT_CODE=1
fi

if [ "${EXIT_CODE}" -eq 0 ]; then
  echo "PASS [HERO-01]: No Canvas/WebGL imports found in server bundle."
fi

exit "${EXIT_CODE}"
```

**Registration in package.json `test:invariants` script:** Add
`bash tests/invariants/no-canvas-server-bundle.sh` to the chain (requires a build, so
run it in the phase gate only — not on every task commit).

---

## Shared Patterns

### `'use client'` boundary placement
**Source:** `components/sections/ContactSection.tsx` line 24; `components/ui/MotionSection.tsx` line 18
**Apply to:** `HeroCanvas.tsx`, `HeroScene.tsx`, `GlassMesh.tsx`

`'use client'` is always the FIRST line of the file, before any imports. JSDoc header
comment goes ABOVE `'use client'` (the project convention — see ContactSection and
HeroSection, which both have their JSDoc comment before the directive).

```tsx
/**
 * components/hero/HeroCanvas.tsx — [description]
 * ...
 */
'use client'

import ...
```

### Named export (no default export)
**Source:** All section and UI components — `export function HeroSection`, `export function MotionSection`, `export function ContactSection`
**Apply to:** All files in `components/hero/`

```tsx
// CORRECT:
export function HeroCanvas() { ... }

// WRONG (not used anywhere in the project):
export default function HeroCanvas() { ... }
```

### `useReducedMotion` from `motion/react`
**Source:** `components/ui/MotionSection.tsx` lines 20, 29
```tsx
import { motion, useReducedMotion } from 'motion/react'
// ...
const prefersReduced = useReducedMotion()
```
**Apply to:** `HeroCanvas.tsx` — same hook, same import path (`motion/react` not `framer-motion`).
`HeroCanvas` only needs `useReducedMotion`, not `motion` itself.

### File header JSDoc comment block
**Source:** All components (`ContactSection.tsx` lines 1–23, `HeroSection.tsx` lines 1–19, `MotionSection.tsx` lines 1–17)
**Apply to:** All new files in `components/hero/`

Convention: JSDoc block describes (a) what the component does, (b) key contracts (e.g. IDENT-01, phase requirement refs), (c) source reference (`Source: 05-RESEARCH.md Pattern N`).

### Tailwind `absolute inset-0` for full-bleed layers
**Source:** `components/sections/HeroSection.tsx` line 48 (`.hero-backdrop`), line 51 (text column uses `relative z-10`)
**Apply to:** `HeroFallback.tsx` (exactly), `HeroCanvas.tsx` wrapper div, `HeroScene.tsx` container div and Canvas

The Canvas and fallback share `absolute inset-0` — this is what guarantees CLS = 0.
Both occupy the exact same box. The text column above at `relative z-10` is untouched.

### `aria-hidden="true"` on decorative/non-interactive wrappers
**Source:** `components/sections/HeroSection.tsx` line 48
**Apply to:** `HeroFallback.tsx`, `HeroCanvas.tsx` wrapper div, the R3F `<Canvas>` element

The convention is established: decorative absolute-positioned background elements get
`aria-hidden="true"`.

### Playwright test loop over locales
**Source:** `tests/sections/hero.spec.ts` lines 23–49; `tests/sections/about.spec.ts` lines 27–84

```ts
const locales = ['de', 'en'] as const

for (const locale of locales) {
  test.describe(`Hero — ${locale}`, () => {
    test('...', async ({ page }) => {
      await page.goto(`/${locale}`)
      await page.waitForLoadState('domcontentloaded')
      // assertions...
    })
  })
}
```

### Browser context with `reducedMotion: 'reduce'`
**Source:** `tests/motion/reduced.spec.ts` lines 14–22
```ts
const context = await browser.newContext({
  reducedMotion: 'reduce',
})
const page = await context.newPage()
// ... test
await context.close()  // always close the context
```
**Apply to:** New reduced-motion canvas-absence tests in both `hero.spec.ts` and `reduced.spec.ts`.

### Bash invariant gate structure
**Source:** `tests/invariants/no-raw-hex.sh` lines 24–86
**Apply to:** `tests/invariants/no-canvas-server-bundle.sh`

Key conventions:
- `set -euo pipefail` first
- `SCRIPT_DIR` + `REPO_ROOT` computed from `${BASH_SOURCE[0]}`
- Single `EXIT_CODE=0` at top
- `grep ... || true` (never let grep exit-1 kill the script)
- FAIL message names the invariant ID in brackets: `FAIL [HERO-01]:`
- Final `PASS` message + `exit "${EXIT_CODE}"`

---

## No Analog Found

No files in Phase 5 are entirely without analogs. All files have at least a role-match
or structural pattern to copy from.

The closest thing to "no analog" is `GlassMesh.tsx` — there is no existing R3F component
in the codebase. However, the structural pattern (file header, `'use client'`, named export,
constants import from a sibling file) is fully covered by existing analogs. The R3F-specific
code (`useFrame`, `MeshTransmissionMaterial`, `<Canvas>`) must follow the RESEARCH.md code
examples directly, which are sourced from official drei/R3F docs.

---

## Metadata

**Analog search scope:**
- `components/sections/` — all 7 section components read
- `components/ui/` — MotionSection read
- `tests/sections/`, `tests/motion/`, `tests/invariants/` — all relevant test and invariant files read
- `app/globals.css`, `styles/tokens.css` — token and utility source
- `package.json` — dependency manifest state

**Files scanned:** 14 source files read in full
**Pattern extraction date:** 2026-08-21

**Key constraint confirmed:** `tests/invariants/no-raw-hex.sh` line 28 sets
`APP_DIR="${REPO_ROOT}/app"` — the scan is `app/` only. `components/hero/constants.ts`
is outside the scan scope and may legitimately contain hex values, provided each has a
source-token comment.

**`motion` package import confirmed:** `motion/react` (not `framer-motion`) — verified
in `components/ui/MotionSection.tsx` line 20.

**No `next/dynamic` in components yet** — `app/studio/layout.tsx` uses the `dynamic`
route export constant (a different concept), not `next/dynamic` the function. HeroCanvas
will be the first use of `import dynamic from 'next/dynamic'` in the components tree.
