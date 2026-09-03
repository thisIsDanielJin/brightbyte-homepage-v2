---
phase: 05-r3f-hero
reviewed: 2026-09-03T00:00:00Z
depth: standard
files_reviewed: 10
files_reviewed_list:
  - components/hero/GlassMesh.tsx
  - components/hero/HeroCanvas.tsx
  - components/hero/HeroFallback.tsx
  - components/hero/HeroScene.tsx
  - components/hero/constants.ts
  - components/sections/HeroSection.tsx
  - next.config.ts
  - tests/invariants/no-canvas-server-bundle.sh
  - tests/motion/reduced.spec.ts
  - tests/sections/hero.spec.ts
findings:
  critical: 1
  warning: 3
  info: 2
  total: 6
status: issues_found
---

# Phase 05: Code Review Report

**Reviewed:** 2026-09-03T00:00:00Z
**Depth:** standard
**Files Reviewed:** 10
**Status:** issues_found

## Summary

Reviewed the R3F hero implementation: five source files (GlassMesh, HeroCanvas, HeroFallback, HeroScene, constants), HeroSection, next.config.ts, the server-bundle invariant shell script, and two Playwright test files. The isolation chain (ssr:false, `'use client'` boundaries) is structurally sound. The frameloop contract is correctly satisfied — `'always'/'never'` driven by IntersectionObserver, not a static `'always'`. Named drei imports only. No raw hex in app/ components.

One critical correctness bug exists in the test suite: a division-by-zero in `sampleMeanColor` that will throw and crash the WCAG contrast gate when a zero-height bounding box is extracted. Three warnings cover a stale comment that will mislead future debuggers, a React rules-of-hooks violation risk in HeroCanvas (conditional `canUseWebGL()` call after hook reads), and two unexported dead constants in constants.ts. Two info items cover `HERO_FADE_MS` being exported but never imported, and a minor type-narrowing gap in the sharp pixel sampler.

---

## Critical Issues

### CR-01: Division-by-zero crash in `sampleMeanColor` when extracted region has zero pixels

**File:** `tests/sections/hero.spec.ts:72`

**Issue:** `n` is initialised to `0` and incremented once per pixel in the loop. If `sharp().extract()` returns a zero-byte buffer (possible when the bounding box rounds to zero width or height — `Math.max(1, ...)` guards `width`/`height` on lines 55-56 but a box whose `width` or `height` was already `0` before rounding can still produce `channels === 0` or `data.length === 0` in some sharp versions), `n` stays `0` and the final `return` divides by zero:

```ts
return [Math.round(r / n), Math.round(g / n), Math.round(b / n)]
// → [NaN, NaN, NaN]  when n === 0
```

`NaN` propagates silently through `relLuminance` and `contrastRatio`, causing `contrastRatio()` to return `NaN`. The `toBeGreaterThanOrEqual(4.5)` assertion then passes vacuously (Playwright/Jest: `NaN >= 4.5` is `false`, which means the contrast gate **fails at runtime** with a confusing numeric matcher error rather than a meaningful "could not sample pixels" message). In edge cases where Jest/Playwright flushes the comparison differently the gate can emit a false-pass.

**Fix:** Guard before the division and throw a descriptive error:

```ts
if (n === 0) {
  throw new Error(
    `sampleMeanColor: extracted region produced 0 pixels ` +
    `(box=${JSON.stringify(box)}, dpr=${dpr}, img=${imgW}x${imgH})`
  )
}
return [Math.round(r / n), Math.round(g / n), Math.round(b / n)]
```

---

## Warnings

### WR-01: Stale comment in `hero.spec.ts` references the reverted 3000ms interaction-floor trigger

**File:** `tests/sections/hero.spec.ts:116-118`

**Issue:** The comment block inside the `webglAvailable` branch reads:

```
// The post-LCP mount trigger (interaction-or-3000ms-floor) means headless
// Playwright must wait for the setTimeout floor before the canvas appears.
// Give it a generous timeout well past the 3000ms floor + render time.
```

The 3000ms interaction-floor trigger was explicitly reverted to the idle-mount strategy (user decision 2026-09-02, documented in HeroCanvas.tsx header and constants.ts). The `HERO_IDLE_FALLBACK_MS` is now 200ms. The comment is factually wrong and will mislead anyone debugging a slow CI run or adjusting the timeout — they will look for a 3000ms floor that no longer exists.

**Fix:** Replace with the accurate description:

```ts
// Idle-mount gate: HeroCanvas defers the three.js Canvas to requestIdleCallback
// (200ms setTimeout fallback). Give Playwright enough time for idle + render.
await expect(canvas).toBeVisible({ timeout: 8000 })
```

The 8000ms timeout itself is fine as headroom; only the comment needs updating.

---

### WR-02: `canUseWebGL()` called after hook reads — conditional early return ordering is fragile

**File:** `components/hero/HeroCanvas.tsx:99`

**Issue:** The component reads a hook (`useReducedMotion()`) at line 72, runs a `useEffect` at line 85, then evaluates:

```ts
if (prefersReduced || !canUseWebGL()) return <HeroFallback />
```

`canUseWebGL()` is a plain function (not a hook), so calling it here is not itself a Rules-of-Hooks violation. However, the short-circuit evaluation means `canUseWebGL()` — which calls `document.createElement('canvas')` — is only executed when `prefersReduced` is falsy. This is fine at runtime. The risk is structural: if a future maintainer moves `useReducedMotion()` below the early return, or adds a second hook above the guard line (perhaps `useRef` for the fallback), it becomes a real violation. The comment at line 97-98 says "MUST stay BEFORE the idle gate so these users never enter the idle path" but does not explain the additional React constraint that hooks must precede all conditional returns.

More concretely, `canUseWebGL()` calls `document.createElement` synchronously during render. On a server-side prerender (if `'use client'` were ever accidentally dropped or the isolation chain broke), this would throw `ReferenceError: document is not defined`. The ssr:false chain currently prevents this, but the guard inside `canUseWebGL()` is a `try/catch` that only catches the `getContext` call, not the `document.createElement` itself (line 60). A server context would throw before reaching the try block.

**Fix:** Add a `typeof document === 'undefined'` guard at the top of `canUseWebGL`:

```ts
function canUseWebGL(): boolean {
  if (typeof document === 'undefined') return false   // SSR safety
  try {
    const canvas = document.createElement('canvas')
    return !!(
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')
    )
  } catch {
    return false
  }
}
```

---

### WR-03: `frameloop="always"` fires continuously while the hero is visible — no demand-based pause when the scene is static between frames

**File:** `components/hero/HeroScene.tsx:90`

**Issue:** `frameloop={isVisible ? 'always' : 'never'}` correctly pauses the loop when the hero leaves the viewport (D-05). While visible, however, `frameloop="always"` renders at ~60fps indefinitely. The only per-frame work is the constant-velocity Y rotation in `GlassMesh.useFrame`. The CLAUDE.md convention (from AGENTS.md technology stack notes) explicitly flags `frameloop="always"` on a static hero as wasteful: "Renders at 60fps indefinitely even when nothing moves; wastes CPU/battery — use `frameloop='demand'`." Although the scene is not fully static (it rotates), the rotation is unconditional and does not depend on any external state change — R3F's `frameloop="demand"` only re-renders when `invalidate()` is called, so it would not fire automatically for the useFrame animation.

The correct resolution per the R3F docs is to keep `"always"` for a continuously-animating scene and let IntersectionObserver handle the offscreen case — which is exactly what the code does. **The convention warning in AGENTS.md specifically targets truly static scenes.** This is therefore a borderline case, but the code comment and the AGENTS.md entry are in tension and will cause confusion. The issue is primarily documentation clarity, not a runtime bug.

**Fix:** Add a comment at the `frameloop` prop that explains why `"always"` is correct here despite the AGENTS.md guidance:

```tsx
// frameloop="always" while visible: the scene animates every frame (continuous
// Y rotation in GlassMesh.useFrame). "demand" would require calling invalidate()
// per frame, which is identical cost. IntersectionObserver sets "never" offscreen.
frameloop={isVisible ? 'always' : 'never'}
```

---

## Info

### IN-01: `HERO_FADE_MS` is exported from `constants.ts` but never imported by any reviewed file

**File:** `components/hero/constants.ts:63`

**Issue:** `export const HERO_FADE_MS = 500` is documented as driving the 500ms CSS transition in HeroCanvas, but HeroCanvas hard-codes the duration directly in the Tailwind class `[transition:opacity_500ms_cubic-bezier(0,0,0.2,1)]` (line 104 of HeroCanvas.tsx) and never imports `HERO_FADE_MS`. The constant exists purely as documentation — the class string and the constant can silently diverge.

**Fix:** Either consume the constant to keep them in sync:

```tsx
// In HeroCanvas.tsx — build the transition value from the constant
style={{ transition: `opacity ${HERO_FADE_MS}ms cubic-bezier(0,0,0.2,1)` }}
```

Or, if the Tailwind class is intentional, mark the constant `@internal` in its JSDoc and add a note that it must be kept manually in sync with the class string.

---

### IN-02: `SURFACE_SUBTLE` and `SURFACE_DARK_HEX` are exported from `constants.ts` but unused in any reviewed file

**File:** `components/hero/constants.ts:23-24`

**Issue:** Neither `SURFACE_SUBTLE` (`#FAFAFA`) nor `SURFACE_DARK_HEX` (`#0F0F10`) are imported by `GlassMesh.tsx`, `HeroScene.tsx`, `HeroCanvas.tsx`, or `HeroSection.tsx`. They were likely declared speculatively for the lighting design but the final scene only uses `ACCENT_HEX` and `SURFACE_HEX`. Dead exports in a file that has an explicit "these are the ONLY raw hex values permitted" comment create ambiguity about what is actually in use.

**Fix:** Remove the two unused constants, or add a comment indicating they are reserved for a future phase (e.g., if a dark-mode variant of the scene is planned).

---

_Reviewed: 2026-09-03T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
