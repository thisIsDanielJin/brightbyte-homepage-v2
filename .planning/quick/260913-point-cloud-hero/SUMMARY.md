---
type: quick
slug: point-cloud-hero
created: 2026-09-13
completed: 2026-09-13
status: complete
---

# Quick Task Summary: Point-cloud hero

**Result:** Replaced the Bright Lattice hero with a point-cloud hero — a jittered 3D
grid of ~3.5k nodes with an accent-blue wave of light sweeping across it. Built,
verified in a real browser (animation eyeballed, not just screenshotted), committed.

## What shipped

- `components/hero/PointCloud.tsx` (NEW) — jittered COLS×ROWS×DEPTH grid (24×18×8 =
  3456 points) as a single `THREE.Points` with a custom `ShaderMaterial`. Drift + wave
  BOTH in-shader off one `uTime` uniform; `useFrame` writes only `uTime` + `uWaveX`
  (delta-based sweep, wraps across the X extent). NORMAL blending, `depthWrite:false`,
  round soft points via fragment discard (bounds overdraw). vLit varying drives
  color (muted→accent), opacity (0.28→0.95), and gl_PointSize (9→16px, depth-attenuated).
- `components/hero/constants.ts` — added `POINTCLOUD_*` + `WAVE_*` params; base tone
  reuses `LATTICE_LINE_HEX` (--color-muted), wave lifts toward `ACCENT_HEX`.
- `components/hero/HeroScene.tsx` — swapped `<LatticeMesh>` → `<PointCloud>`; header
  doc updated. Frameloop/IO/DebugHook/camera unchanged.
- `components/hero/HeroFallback.tsx` — static icosahedron SVG → static node-grid SVG
  (frozen dot grid, --color-muted). Same contract: absolute inset-0, no hooks, aria-hidden.

## Design decision (locked this session)

Node layout = **jittered grid** (user chose over Fibonacci sphere shell / layered
planes). Regular lattice + small per-point random offset → reads "structured / the web,
organized" without a stiff-spreadsheet look. Wave sweeps along +X.

## Verification

- `npm run build` (Node 22.22) clean — TS passes, 63 pages generated, no errors.
- `tests/invariants/no-canvas-server-bundle.sh` → PASS (HERO-01 isolation intact).
- Browser eyeball (Playwright, `next start`, /de, 1440×900): **draw calls = 1**, dpr 1.
  Two frames 1.2s apart show the accent-blue lit band sweeping clearly left→right — the
  wave is live and legible. Dots read as nodes, not noise. Nothing washes to white.
- Legibility note (honest): the resting field at 0.28 opacity is very faint, near the
  right edge almost vanishes. Judged acceptable — the wave gives clear identity and the
  faintness reads as deliberate restraint (brand: quiet field, one accent). Watch on a
  real throttled Android at the Phase-5 perf gate for the fragment-overdraw cost.

## Commits

- `2bc38d3` feat(hero): add point-cloud constants + wave params
- `bfb12e2` feat(hero): PointCloud mesh (jittered grid + in-shader wave)
- `97d4c27` feat(hero): wire PointCloud into scene + static node-grid fallback

## Revert path

Bright Lattice = last verified state at `a63ffbe` (now further back). LatticeMesh.tsx
is untouched on disk (still imported nowhere), so re-wiring it in HeroScene is a
one-line revert if the point cloud is rejected later.

## Follow-ups (not this task)

- Consider nudging `POINTCLOUD_BASE_OPACITY` up slightly (0.28 → ~0.32) if the resting
  field reads too faint on real displays — one-constant tune.
- `LatticeMesh.tsx` is now dead code (imported nowhere). Leave until the point cloud is
  confirmed to stay, then delete in a cleanup commit.
