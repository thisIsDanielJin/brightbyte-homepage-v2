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
 * Scene material params (line width, pulse speed, etc.) are NOT design tokens —
 * they are pure R3F parameters declared here for discoverability and tuning.
 *
 * Source: 05-PATTERNS.md §"constants.ts"; 260912-hero-lattice/PLAN.md §Scope.
 */

// ── Color constants (derived from styles/tokens.css @theme block) ─────────────
export const ACCENT_HEX = '#1C39BB' // from --color-accent
export const SURFACE_HEX = '#FFFFFF' // from --color-surface
export const SURFACE_SUBTLE = '#FAFAFA' // from --color-surface-subtle
export const SURFACE_DARK_HEX = '#0F0F10' // from --color-surface-dark

// Lattice edge tone — a muted decorative gray that reads quietly on the light
// .hero-backdrop gradient (surface-muted → surface). The edge network is the
// quiet element; the accent pulse is the single bold note. Uses the token
// intended for decorative/non-text marks, not a text foreground token.
export const LATTICE_LINE_HEX = '#A1A1AA' // from --color-muted (decorative-only token)

// ── Lattice geometry / pulse parameters (pure R3F params, not design tokens) ──
// Detail 1 (NOT 2): an icosahedron subdivided once yields a clean, readable edge
// network. Detail 2 crowds the wireframe into visual noise. This is the whole
// crispness win over the glass (lines need no transmission buffer → crisp at any dpr).
export const LATTICE_DETAIL = 1
// Pulse: a small accent sphere traveling edge-to-edge. Speed is fraction of an
// edge traversed per frame at 60fps (≈ 1.7s per edge at 0.01).
export const PULSE_SPEED = 0.01
export const PULSE_SIZE = 0.028 // world-space radius of the traveling pulse sphere

// ── Scene / camera parameters ─────────────────────────────────────────────────
export const ROTATION_SPEED = 0.003 // radians/frame at 60fps (~35s/revolution)
export const TILT_SPEED = 0.0008 // whisper of X-axis tilt so the spin is not flat
export const CAMERA_FOV = 45
export const CAMERA_Z = 5

// ── Lattice placement (UI-SPEC Responsive Behavior Contract) ──────────────────
// Local scene layout constants (NOT design tokens — pure R3F world-space values).
// Desktop: focal mass right-of-center (~65-70% horizontal) opposite the left text
// column (Option A scrim strategy). Mobile: centered + pushed back so it does not
// crowd the full-width text column at narrow widths. Breakpoint mirrors the 375px
// mobile baseline vs the 1440px desktop baseline.
// Values carried forward unchanged from the glass placement (rename GLASS_* → LATTICE_*).
export const LATTICE_BREAKPOINT_PX = 768 // < this width → mobile placement
export const LATTICE_POSITION_DESKTOP: [number, number, number] = [0.9, 0, 0] // ~65-70% horizontal
export const LATTICE_POSITION_MOBILE: [number, number, number] = [0, 0.15, -0.6] // centered, pushed back
export const LATTICE_SCALE_DESKTOP = 1.25
export const LATTICE_SCALE_MOBILE = 0.95

// ── Point-cloud geometry / wave parameters (pure R3F params, not design tokens) ──
// The point cloud replaces the lattice: a loose 3D grid / node field ("structured
// data / the web, organized") with an accent-blue wave of light sweeping across it.
// Base dots use the SAME muted decorative tone as the lattice edges (LATTICE_LINE_HEX
// = --color-muted) so the two heroes share a family; the wave lifts each point toward
// ACCENT_HEX as it passes. ONE draw call (THREE.Points + custom ShaderMaterial); drift
// + wave are BOTH computed in-shader off a single uTime uniform.
//
// Layout = JITTERED GRID (decision 2026-09-13): a regular lattice of points with a
// small per-point random offset — regular enough to read "structured," jittered enough
// to not look like a stiff spreadsheet. Grid dims chosen so cols*rows*depth ≈ 3.5k,
// inside the ~3-4k cap.
// Grid dims widened so the field spans the FULL hero width as a background (not a
// right-of-center focal mass). More columns than rows → a landscape field that fills
// edge to edge. 32*18*8 = 4608 points — at the top of the 3-4k cap, still 1 draw call.
export const POINTCLOUD_GRID_COLS = 32 // X points (widened for full-width background)
export const POINTCLOUD_GRID_ROWS = 18 // Y points
export const POINTCLOUD_GRID_DEPTH = 8 // Z points  → 32*18*8 = 4608 points, ~1 draw call
export const POINTCLOUD_SPACING = 0.16 // world-space gap between grid nodes
export const POINTCLOUD_JITTER = 0.05 // max per-point random offset (fraction of world space)
// Base (unlit) dot appearance. As a background the resting field stays quiet on the light
// backdrop — the wave is the only bold moment. Sizes bumped so dots read clearly as a
// texture behind the content (user: "make the dots even bigger to see").
export const POINTCLOUD_BASE_SIZE = 20.0 // gl_PointSize in px for a resting node (pre-attenuation)
export const POINTCLOUD_LIT_SIZE = 34.0 // gl_PointSize in px for a fully wave-lit node
export const POINTCLOUD_BASE_OPACITY = 0.32 // resting dot opacity (quiet, reads as node not noise)
export const POINTCLOUD_LIT_OPACITY = 0.95 // wave-lit dot opacity
// Drift: a slow in-shader breathing so the resting field is not dead-static (D-04),
// far gentler than the lattice spin. Amplitude in world space, speed scales uTime.
export const POINTCLOUD_DRIFT_AMP = 0.03
export const POINTCLOUD_DRIFT_SPEED = 0.6

// ── Wave-of-light parameters (the identity motion — "current through the network") ──
// A soft front sweeps along +X across the cloud. A point's "lit" amount is a smooth
// band around the front's current X: bright at the front, fading behind. WAVE_SPEED is
// world-X units per second; the front wraps across the grid's X extent. WAVE_WIDTH is
// the half-width of the lit band in world X (wider = softer, more points lit at once).
export const WAVE_SPEED = 0.4 // world-X units/sec the wavefront travels (slower, calmer sweep)
export const WAVE_WIDTH = 0.9 // half-width of the lit band in world X (wider = more points lit at once)
// Wrap-margin scale (< 1 = more frequent passes). "Increase frequency" = the front
// should recur sooner (user-confirmed 2026-09-13). The front always travels the full
// grid width (every column lights → full-section), plus a small OFF-SCREEN idle margin
// past each edge. This factor scales ONLY that idle margin (as a fraction of WAVE_WIDTH):
// shrinking it shortens the dead time between passes so the wave recurs more often,
// WITHOUT reducing coverage or touching dot placement. Combined with the wider WAVE_WIDTH
// band this reads as "more of the field lit, more often" — kept > 0 so the front still
// fully exits before wrapping (never becomes "always lit" / never stuck half-lit).
export const WAVE_SPAN_SCALE = 0.6

// ── Point-cloud placement (FULL-WIDTH BACKGROUND, not a focal element) ─────────
// The point cloud is now the hero BACKGROUND spanning the full width behind the
// content (user decision 2026-09-13: "background for the entire hero", "better for
// background instead of being the main attraction"). Unlike the lattice's right-of-
// center focal placement (LATTICE_POSITION_DESKTOP = [0.9,…]), the cloud is CENTERED
// (x=0) and scaled up so the field + wave read edge-to-edge. A future right-side
// element will sit ON TOP of this background in its own focal slot.
export const POINTCLOUD_POSITION_DESKTOP: [number, number, number] = [0, 0, -0.5] // centered, pushed back
export const POINTCLOUD_POSITION_MOBILE: [number, number, number] = [0, 0, -0.8] // centered, further back
export const POINTCLOUD_SCALE_DESKTOP = 1.9 // fills the full hero width as a backdrop
export const POINTCLOUD_SCALE_MOBILE = 1.4

// ── Transition timing (from --duration-entrance: 500ms) ───────────────────────
// No exact 400ms token exists. Use 500ms (--duration-entrance) as the conservative
// pick within the D-11 "300–500ms" window. Do NOT add a new token to tokens.css.
export const HERO_FADE_MS = 500 // from --duration-entrance

// ── Idle-mount fallback timeout (05-06 UX fix) ───────────────────────────────
// The HeroScene mount is gated behind requestIdleCallback so the three.js import +
// Canvas creation happen once the main thread is free post-hydration — the hero then
// fades in gracefully on load (D-11), no blank wait, no click-to-summon.
// This constant is only the FALLBACK for browsers without requestIdleCallback
// (older Safari): a short setTimeout so the mount still happens promptly.
//
// History: 05-05 set this to a 3000ms floor as an interaction-or-timeout trigger to
// push three.js boot past Lantern's simulated-LCP window. That produced a visible
// 3s blank-then-pop-in. Since D-12 was reconciled to observed LCP (2026-08-26), the
// simulated metric no longer gates the phase, so the UX cost bought nothing —
// reverted to a graceful idle mount (user decision 2026-09-02). NOT a design token.
export const HERO_IDLE_FALLBACK_MS = 200
