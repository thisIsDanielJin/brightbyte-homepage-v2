---
quick_id: 260912-194
slug: hero-lattice
status: complete
executor_model: opus
date: 2026-09-12
build: clean (Node 22.22.0)
invariants: pass (no-canvas-server-bundle, no-raw-hex)
draw_calls: ~2 (lineSegments + pulse mesh)
---

# Summary: Hero "Bright Lattice" redesign

Replaced the frosted-glass 3D hero (MeshTransmissionMaterial) with a Bright Lattice — a slowly
rotating wireframe icosahedron whose edges are the object, plus a single accent-colored pulse
sphere traveling the edge network. Inverts the D-12 mobile-LCP tradeoff: lines need no
transmission buffer, so the scene is crisp at any dpr and issues ~2 draw calls.

## Changes per file

### constants.ts (refactor)
- Deleted GLASS_IOR/ROUGHNESS/THICKNESS/SAMPLES/RESOLUTION/DETAIL + mobile variants.
- Added LATTICE_DETAIL=1, LATTICE_LINE_HEX='#A1A1AA' (from --color-muted, source-token comment),
  PULSE_SPEED=0.01, PULSE_SIZE=0.028, TILT_SPEED=0.0008.
- Renamed GLASS_POSITION/SCALE/BREAKPOINT_* -> LATTICE_* (values unchanged).
- Kept ROTATION_SPEED, CAMERA_*, HERO_FADE_MS, HERO_IDLE_FALLBACK_MS. IDENT-01 comments intact.

### GlassMesh.tsx -> LatticeMesh.tsx (rewrite + rename)
- IcosahedronGeometry(1,1) -> EdgesGeometry -> <lineSegments> unlit LineBasicMaterial (muted,
  opacity 0.85). Detail 1 = clean readable edge network.
- Pulse: ordered edge vertex-pair list built from EdgesGeometry position attribute; useFrame lerps
  an accent meshBasicMaterial sphere a->b by t at PULSE_SPEED, wraps to next edge at t>=1. Pulse is
  a child of the rotating group so it rides the wireframe. Progress/index in refs (no re-render).
- Slow Y rotation + whisper X tilt. Deleted the 3 lights (unlit materials).
- Responsive placement reused via useThree width + LATTICE_BREAKPOINT_PX.
- Optional depth layer: left OUT (default; no gold-plating).

### HeroScene.tsx (edit)
- <GlassMesh degraded> -> <LatticeMesh />. Removed degraded state, PerformanceMonitor, AdaptiveDpr.
- Enabled antialias:true (was false) for crisp thin lines. Kept DebugHook, D-05 frameloop pause,
  onCreated/onReady cross-fade.

### HeroFallback.tsx (rewrite)
- Static inline SVG icosahedron-ish wireframe over the existing .hero-backdrop gradient.
  Reduced-motion/no-WebGL/pre-hydration users get gradient + frozen signature. Stroke #A1A1AA.
  absolute inset-0, CLS 0, no 'use client', no hooks, aria-hidden.

### HeroCanvas.tsx — untouched (as instructed).

## Draw-call reasoning
<group> -> <lineSegments> (1 draw call, one buffer) + pulse <mesh> (1) = ~2. Far under the perf
gate's <~10 and the DebugHook <200 assertion. No offscreen transmission buffer, no bloom/postprocess.
Strictly cheaper than the glass. window.__r3f_hero.calls() still compiles/exposed (DebugHook kept).

## Verification results
- Build: npm run build clean under Node 22.22.0 (compiled 8.4s, TS passed, 63 pages, no hydration
  errors). Repo requires Node >=22.12 for sanity typegen prebuild; shell default was v20.17.0 -> used
  nvm v22.22.0. Pre-existing env constraint, not introduced here.
- Invariants: no-canvas-server-bundle.sh PASS [HERO-01]; no-raw-hex.sh PASS [IDENT-01].
- Grep-clean: no dangling GlassMesh/GLASS_ imports; only one explanatory comment in constants.ts.

## Open micro-decisions for screenshot review
1. Depth layer (second fainter counter-rotating lattice): left OUT. Add if single lattice too sparse.
2. Pulse glow: plain accent sphere now; a soft additive sprite could fake glow (no bloom) if flat.
3. AdaptiveDpr: dropped. Re-add only if a real low-end device shows dpr strain.
4. Line tone/opacity: --color-muted @ 0.85 on the light backdrop; may want contrast tuning.
5. antialias: enabled for crisp lines; confirm no measurable mobile cost.

## Deviations from Plan
- [Rule 1] Line tone token choice: plan said "near-white on dark backdrop" but .hero-backdrop is a
  LIGHT gradient; near-white would be invisible. Used --color-muted (#A1A1AA) decorative token. Flag
  for visual confirmation (open decision 4).
- [Rule 3] Node version: build blocked on prebuild (sanity typegen needs Node >=22.12; shell was
  v20.17.0). Resolved via nvm v22.22.0. No code change.

## Self-Check: PASSED
- LatticeMesh.tsx exists; GlassMesh.tsx removed. constants/HeroScene/HeroFallback updated.
- Commits: 8e98a64 (constants), 16c1d3b (LatticeMesh), fa0966f (HeroScene + HeroFallback).

## NEXT DIRECTION (decided 2026-09-13 — NOT yet built)

User reviewed the shipped lattice + the 54-agent hero-3d research (workflow wf_deb6fd42-a57).
Verdict from research was "keep the lattice," but user chose to pursue research Rec #2 instead:
the geometric-shape-with-a-dot "has no meaning." Replace it with a **point cloud that means
something**.

**LOCKED concept:** data grid / node field + sweeping wave of light.
- Form: points arranged as a loose 3D GRID / node field (not the icosahedron surface) — reads
  as "structured data / the web, organized." Meaning tied to brand: bright / byte / web presence.
- Identity motion: a soft accent-blue WAVE sweeps across the cloud by position — points light up
  as it passes, fade behind. This carries the studio's "current through the network" pulse
  signature forward, now dissolved across the cloud (not a single wandering sphere).

**LOCKED design constraints (from research perf + light-backdrop warnings):**
- NORMAL blending, never additive (additive washes to white on the light .hero-backdrop).
- Ink/muted dots at low opacity; ~5% tinted accent #1C39BB that the wave lights up as it passes.
- ~3-4k points cap; gl_PointSize tuned so dots read as intentional NODES, not noise
  (dots-on-light = the exact v1 "reads as noise / no identity" failure mode — the make-or-break).
- ONE draw call (THREE.Points + custom ShaderMaterial). Drift + wave BOTH in-shader off one
  uTime uniform → zero per-frame CPU beyond a uniform write. ACCEPTABLE-not-cheap: watch
  fragment-stage OVERDRAW at high dpr; verify on throttled Android vs the Phase-5 perf gate.
- Carry over: D-05 offscreen frameloop pause, reduced-motion freeze, D-11 idle mount + cross-fade
  CLS=0, HERO-01 isolation (three.js only via dynamic ssr:false).
- Static fallback: needs its own SVG treatment (a static node-grid), same contract as HeroFallback.

**Build plan for next session:** write a fresh quick-task PLAN capturing the above FIRST (so it
survives), then build the point cloud as a drop-in replacement for <LatticeMesh> (same scene
wiring in HeroScene, same HeroCanvas/fallback contract). MANDATORY: eyeball the real ANIMATION in
a browser — headless Playwright screenshots freeze one frame and will not reveal the wave or the
noise-vs-nodes legibility call. Lattice is 4 clean commits back if the point cloud does not land.
