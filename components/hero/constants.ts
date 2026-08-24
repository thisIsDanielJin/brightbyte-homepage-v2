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
export const GLASS_SAMPLES = 6
export const GLASS_RESOLUTION = 256
// Mobile degradation thresholds (PerformanceMonitor.onDecline)
export const GLASS_SAMPLES_MOBILE = 2
export const GLASS_RESOLUTION_MOBILE = 32

// ── Scene / camera parameters ─────────────────────────────────────────────────
export const ROTATION_SPEED = 0.003 // radians/frame at 60fps (~35s/revolution)
export const CAMERA_FOV = 45
export const CAMERA_Z = 5

// ── Transition timing (from --duration-entrance: 500ms) ───────────────────────
// No exact 400ms token exists. Use 500ms (--duration-entrance) as the conservative
// pick within the D-11 "300–500ms" window. Do NOT add a new token to tokens.css.
export const HERO_FADE_MS = 500 // from --duration-entrance
