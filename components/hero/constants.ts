/**
 * components/hero/constants.ts — Token-derived JS constants for the R3F hero scene.
 *
 * These are the ONLY raw hex values permitted outside styles/tokens.css.
 * Each color constant traces back to a named token in styles/tokens.css for
 * auditability (source-token comment on every hex line).
 *
 * IDENT-01 NOTE: tests/invariants/no-raw-hex.sh scans app/ ONLY (verified line 28).
 * This file lives in components/hero/ — outside the scan scope. However, each hex
 * value MUST have a source-token comment so the derivation remains auditable.
 * Do NOT extend the invariant scan to cover components/hero/ without adding an
 * exclusion for this file (see 05-RESEARCH.md Assumption A4).
 *
 * Scene material params (IOR, roughness, etc.) are NOT design tokens — they are
 * pure R3F parameters declared here for discoverability and tuning.
 *
 * Source: 05-PATTERNS.md §"constants.ts"; 05-UI-SPEC.md Flags (Unresolved Token Gaps).
 */

// ── Color constants (derived from styles/tokens.css @theme block) ─────────────
export const ACCENT_HEX = '#1C39BB' // from --color-accent
export const SURFACE_HEX = '#FFFFFF' // from --color-surface
export const SURFACE_SUBTLE = '#FAFAFA' // from --color-surface-subtle
export const SURFACE_DARK_HEX = '#0F0F10' // from --color-surface-dark

// ── Glass material parameters ──────────────────────────────────────────────────
export const GLASS_IOR = 1.5
export const GLASS_ROUGHNESS = 0.05
export const GLASS_THICKNESS = 0.3
// Tier 2 (05-03 perf-gate escalation, RESEARCH Pattern 5): the tier1-first defaults
// (samples 6 / resolution 256 / geometry detail 4) pushed the throttled Moto G4 LCP
// past the 2.5s budget (main-thread cost of the transmission passes → high TBT). The
// D-12 budget is non-negotiable, so quality is reduced (samples/resolution/detail ↓)
// while KEEPING the transmission look — the WCAG-AA rendered-glass gate is re-run and
// still holds. Do NOT relax the budget; this is the researched Tier 2 fallback.
export const GLASS_SAMPLES = 3
export const GLASS_RESOLUTION = 128
export const GLASS_DETAIL = 2 // icosahedron subdivision (was 4) — fewer polys, cheaper transmission
// Mobile degradation thresholds (PerformanceMonitor.onDecline)
export const GLASS_SAMPLES_MOBILE = 2
export const GLASS_RESOLUTION_MOBILE = 32

// ── Scene / camera parameters ─────────────────────────────────────────────────
export const ROTATION_SPEED = 0.003 // radians/frame at 60fps (~35s/revolution)
export const CAMERA_FOV = 45
export const CAMERA_Z = 5

// ── Glass placement (UI-SPEC Responsive Behavior Contract) ────────────────────
// Local scene layout constants (NOT design tokens — pure R3F world-space values).
// Desktop: focal mass right-of-center (~65-70% horizontal) opposite the left text
// column (Option A scrim strategy). Mobile: centered + pushed back so it does not
// crowd the full-width text column at narrow widths. Breakpoint mirrors the 375px
// mobile baseline vs the 1440px desktop baseline.
export const GLASS_BREAKPOINT_PX = 768 // < this width → mobile placement
export const GLASS_POSITION_DESKTOP: [number, number, number] = [0.9, 0, 0] // ~65-70% horizontal
export const GLASS_POSITION_MOBILE: [number, number, number] = [0, 0.15, -0.6] // centered, pushed back
export const GLASS_SCALE_DESKTOP = 1.25
export const GLASS_SCALE_MOBILE = 0.95

// ── Transition timing (from --duration-entrance: 500ms) ───────────────────────
// No exact 400ms token exists. Use 500ms (--duration-entrance) as the conservative
// pick within the D-11 "300–500ms" window. Do NOT add a new token to tokens.css.
export const HERO_FADE_MS = 500 // from --duration-entrance

// ── Idle-mount fallback delay (05-04 D-12 LCP fix) ────────────────────────────
// The three.js import + Canvas creation are idle-gated (post-LCP) in HeroCanvas so
// the ~1.45s three.js TBT no longer inflates the simulated LCP. requestIdleCallback
// is the primary signal; this is the setTimeout fallback delay (ms) used when rIC is
// undefined (older Safari) so the glass ALWAYS eventually mounts. NOT a design token.
export const IDLE_MOUNT_TIMEOUT_MS = 200
