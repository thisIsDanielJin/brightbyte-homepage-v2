---
type: quick
slug: point-cloud-hero
created: 2026-09-13
status: in-progress
---

# Quick Task: Point-cloud hero

Replace the shipped Bright Lattice hero (`<LatticeMesh>`) with a **point-cloud hero**:
a loose 3D grid / node field of ~3–4k points with a soft accent-blue wave of light
sweeping across it by position. Drop-in replacement — same scene wiring, same
HeroCanvas/fallback contract. Concept was LOCKED in the pause-work handoff; this PLAN
freezes it plus one new design decision so it survives a context reset.

## Locked concept (from 260912-hero-lattice/SUMMARY.md "NEXT DIRECTION")

- **Form:** points arranged as a loose 3D grid / node field → reads as "structured
  data / the web, organized" (brand: bright / byte / web presence). NOT the icosahedron.
- **Identity motion:** a soft accent-blue WAVE sweeps across the cloud by position —
  points light up as it passes, fade behind. Carries the "current through the network"
  pulse signature forward, dissolved across the whole cloud.

## Design decision made this session (2026-09-13)

- **Node layout = JITTERED GRID** (user choice over sphere shell / layered planes):
  a regular 3D lattice of points with a small per-point random offset. Regular enough
  to read "structured / organized," jittered enough to not look like a stiff spreadsheet.
  Wave sweeps cleanly along one world axis (X).

## Locked constraints

- **NORMAL blending, never additive** — the light `.hero-backdrop` washes additive to white.
- Base dots = muted/ink tone at low opacity; the wave lifts each point toward accent
  `#1C39BB` and up in opacity/size as it passes, then fades behind.
- **~3–4k points, ONE draw call** — `THREE.Points` + custom `ShaderMaterial`. Drift +
  wave BOTH computed in-shader off one `uTime` uniform → zero per-frame CPU beyond a
  uniform write. `useFrame` writes only `uTime`, no React state (D-05 lean loop).
- `gl_PointSize` tuned so dots read as intentional NODES, not noise (the make-or-break;
  dots-on-light = v1's exact "reads as noise / no identity" failure mode).
- **Watch fragment overdraw at high dpr.** Round soft points via distance-to-center
  discard in the fragment shader. Verify draw-call count via `window.__r3f_hero.calls()`.
- **Carry over unchanged:** D-05 offscreen frameloop pause, reduced-motion freeze,
  D-11 idle mount + cross-fade CLS=0, HERO-01 isolation (three.js only via dynamic ssr:false).
- **IDENT-01:** all hex as named constants in `constants.ts` with source-token comments.

## Scope (files)

1. **`components/hero/constants.ts`** — add `POINTCLOUD_*` + `WAVE_*` params. Reuse
   `ACCENT_HEX`. Add a base-dot tone constant traced to a token. Remove nothing yet
   (lattice consts stay until the swap is verified — revert path).
2. **`components/hero/PointCloud.tsx`** — NEW. Jittered-grid geometry built once in
   `useMemo` (positions + per-point random seed attribute). Custom `ShaderMaterial`:
   - vertex: drift (in-shader off `uTime` + per-point seed), compute wave phase from
     world X position vs a sweeping front, output a `vLit` varying [0,1], set
     `gl_PointSize` (bigger when lit), size attenuation by depth.
   - fragment: round soft point (discard outside radius), mix base tone → accent by
     `vLit`, mix base opacity → lit opacity by `vLit`. NORMAL blend, `depthWrite:false`,
     `transparent:true`.
   - `useFrame((_, delta) => { mat.uniforms.uTime.value += delta })` — only a uniform write.
   - Responsive placement/scale: reuse the same desktop/mobile split pattern as Lattice.
3. **`components/hero/HeroScene.tsx`** — swap `<LatticeMesh />` → `<PointCloud />`.
   DebugHook, frameloop, IntersectionObserver, camera all unchanged.
4. **`components/hero/HeroFallback.tsx`** — replace the static icosahedron SVG with a
   static **node-grid** SVG (a frozen dot grid, muted tone) — same contract:
   `absolute inset-0 hero-backdrop`, no `'use client'`, no hooks, `aria-hidden`, CLS=0.

DO NOT TOUCH: `HeroCanvas.tsx` (isolation island).

## Verification (MANDATORY animation eyeball)

- Node ≥22.12: `source ~/.nvm/nvm.sh && nvm use 22` before build.
- `npm run build` clean (typegen prebuild + tsc + next build).
- **Eyeball the real ANIMATION in a browser** (not a screenshot — a frozen frame hides
  the wave AND the noise-vs-nodes legibility call). Confirm: (a) dots read as nodes not
  noise, (b) the accent wave visibly sweeps, (c) nothing washes to white.
- `window.__r3f_hero.calls()` stays low (target < ~10; expect ~1–2).
- Reduced-motion + no-WebGL fall to the new static node-grid fallback, CLS=0.
- Invariants: `tests/invariants/no-canvas-server-bundle.sh` still passes.

## Commits (atomic)

1. `feat(hero): add point-cloud constants + wave params`
2. `feat(hero): PointCloud mesh (jittered grid + in-shader wave)`
3. `feat(hero): wire PointCloud into scene + static node-grid fallback`

## Revert path

Bright Lattice is the last verified state at `a63ffbe` (4 commits back). If the point
cloud does not land visually, `git revert`/reset to there.
