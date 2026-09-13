/**
 * components/hero/PointCloud.tsx — Point-cloud hero: a loose 3D grid / node field
 * (~3.5k points) with a soft accent-blue WAVE of light sweeping across it. Replaces
 * the Bright Lattice as the hero centerpiece.
 *
 * SCENE CONTRACT:
 *   - Geometry: a JITTERED GRID. A regular COLS×ROWS×DEPTH lattice of points, each
 *     nudged by a small per-point random offset — reads as "structured data / the web,
 *     organized" (the brand meaning) without looking like a stiff spreadsheet. Built
 *     ONCE in useMemo into a BufferGeometry with two attributes: `position` (the jittered
 *     grid node) and `aSeed` (a per-point random scalar the shader uses to decorrelate
 *     drift phase). ~3456 points at the default dims — inside the 3-4k cap.
 *   - Material: ONE custom ShaderMaterial → the whole cloud is ONE draw call (THREE.Points).
 *     Drift AND wave are BOTH computed in-shader off a single `uTime` uniform, so the
 *     per-frame CPU cost is a single uniform write (see useFrame below) — no React state,
 *     no geometry re-upload (D-05 keeps the frameloop lean).
 *   - Blending: NORMAL, never additive. The light .hero-backdrop washes additive blending
 *     to white (the locked constraint from the light-backdrop warning). depthWrite:false +
 *     transparent so overlapping soft points composite correctly without z-fighting.
 *   - Vertex shader: applies a gentle breathing drift (POINTCLOUD_DRIFT_*), computes the
 *     wave "lit" amount from the point's world-X vs a sweeping front (uWaveX), and outputs
 *     `vLit` [0,1]. gl_PointSize interpolates BASE→LIT by vLit, with 1/-z size attenuation
 *     so nearer nodes are larger (depth read).
 *   - Fragment shader: draws a ROUND SOFT point (discard outside a centered radius — this
 *     also bounds fragment-stage OVERDRAW at high dpr, the flagged risk), mixes base tone →
 *     ACCENT by vLit, and mixes BASE_OPACITY → LIT_OPACITY by vLit. Base tone = --color-muted
 *     (same family as the lattice edges); the wave is the single bold accent moment.
 *   - Responsive placement/scale: reuse the SAME desktop/mobile split as the lattice
 *     (LATTICE_* placement consts) — the point cloud occupies the same focal slot.
 *
 * DRAW-CALL BUDGET (D-12): ONE draw call (single THREE.Points). Verified via
 * window.__r3f_hero.calls() at the perf gate. ACCEPTABLE-not-cheap note: the cost here is
 * fragment-stage overdraw from thousands of overlapping soft sprites at high dpr, not draw
 * calls — the round-discard keeps each sprite's shaded area minimal. Verify on throttled
 * Android vs the Phase-5 perf gate.
 *
 * IDENT-01: all hex via named constants from constants.ts; no raw hex here.
 *
 * Source: 260913-point-cloud-hero/PLAN.md; 260912-hero-lattice/SUMMARY.md NEXT DIRECTION.
 */
'use client'

import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  NormalBlending,
  ShaderMaterial,
} from 'three'
import type { Points } from 'three'
import {
  ACCENT_HEX,
  LATTICE_LINE_HEX,
  POINTCLOUD_GRID_COLS,
  POINTCLOUD_GRID_ROWS,
  POINTCLOUD_GRID_DEPTH,
  POINTCLOUD_SPACING,
  POINTCLOUD_JITTER,
  POINTCLOUD_BASE_SIZE,
  POINTCLOUD_LIT_SIZE,
  POINTCLOUD_BASE_OPACITY,
  POINTCLOUD_LIT_OPACITY,
  POINTCLOUD_DRIFT_AMP,
  POINTCLOUD_DRIFT_SPEED,
  WAVE_SPEED,
  WAVE_WIDTH,
  LATTICE_BREAKPOINT_PX,
  POINTCLOUD_POSITION_DESKTOP,
  POINTCLOUD_POSITION_MOBILE,
  POINTCLOUD_SCALE_DESKTOP,
  POINTCLOUD_SCALE_MOBILE,
} from './constants'

// GLSL is authored inline (no external .glsl loader in the pipeline). Kept small and
// commented so the drift/wave math is auditable alongside the constants that feed it.
const VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uWaveX;      // current X position of the wavefront (world space)
  uniform float uWaveWidth;  // half-width of the lit band
  uniform float uBaseSize;
  uniform float uLitSize;
  uniform float uDriftAmp;
  uniform float uDriftSpeed;
  attribute float aSeed;     // per-point random [0,1) to decorrelate drift phase
  varying float vLit;

  void main() {
    vec3 p = position;

    // Gentle breathing drift: each axis offset by a sine keyed to uTime + the point's
    // own seed so the field shimmers instead of pulsing in lockstep. Tiny amplitude (D-04).
    float ph = aSeed * 6.2831853; // seed → phase in [0, 2π)
    p.x += sin(uTime * uDriftSpeed + ph) * uDriftAmp;
    p.y += cos(uTime * uDriftSpeed * 0.9 + ph) * uDriftAmp;
    p.z += sin(uTime * uDriftSpeed * 1.1 + ph * 1.3) * uDriftAmp;

    // Wave: how close is this point's X to the sweeping front? A smooth band around
    // uWaveX. dist=0 at the front → lit=1; beyond uWaveWidth → lit=0. smoothstep gives
    // the soft falloff so points "fade behind" the front rather than snapping off.
    float dist = abs(p.x - uWaveX);
    vLit = 1.0 - smoothstep(0.0, uWaveWidth, dist);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    // Size grows when lit; attenuate by depth (-mv.z) so nearer nodes read larger.
    float size = mix(uBaseSize, uLitSize, vLit);
    gl_PointSize = size * (1.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`

const FRAGMENT_SHADER = /* glsl */ `
  precision mediump float;
  uniform vec3 uBaseColor;
  uniform vec3 uAccentColor;
  uniform float uBaseOpacity;
  uniform float uLitOpacity;
  varying float vLit;

  void main() {
    // Round soft point: gl_PointCoord is [0,1] across the sprite; distance from its
    // center. discard outside 0.5 → circular dots (not squares) AND bounds overdraw.
    vec2 c = gl_PointCoord - vec2(0.5);
    float d = length(c);
    if (d > 0.5) discard;
    // Soft edge: fade the last ~20% of the radius so dots are not hard-edged aliased discs.
    float edge = 1.0 - smoothstep(0.35, 0.5, d);

    vec3 color = mix(uBaseColor, uAccentColor, vLit);
    float alpha = mix(uBaseOpacity, uLitOpacity, vLit) * edge;
    gl_FragColor = vec4(color, alpha);
  }
`

export function PointCloud() {
  const pointsRef = useRef<Points>(null)
  const matRef = useRef<ShaderMaterial>(null)

  // Build the jittered grid + per-point seed ONCE. Positions are centered on the origin
  // so the group's placement/scale (below) frames the whole cloud in the focal slot.
  const { geometry, waveMinX, waveSpanX } = useMemo(() => {
    const cols = POINTCLOUD_GRID_COLS
    const rows = POINTCLOUD_GRID_ROWS
    const depth = POINTCLOUD_GRID_DEPTH
    const count = cols * rows * depth
    const positions = new Float32Array(count * 3)
    const seeds = new Float32Array(count)

    // Center offsets so the grid straddles the origin on each axis.
    const cx = ((cols - 1) * POINTCLOUD_SPACING) / 2
    const cy = ((rows - 1) * POINTCLOUD_SPACING) / 2
    const cz = ((depth - 1) * POINTCLOUD_SPACING) / 2

    // Deterministic-ish pseudo-random from the index — no need for Math.random (and the
    // harness forbids it); a hashed index gives stable, well-spread jitter + seeds.
    const rand = (n: number) => {
      const s = Math.sin(n * 127.1 + 311.7) * 43758.5453
      return s - Math.floor(s) // fract → [0,1)
    }

    let i = 0
    for (let z = 0; z < depth; z++) {
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const jx = (rand(i * 3 + 0) - 0.5) * 2 * POINTCLOUD_JITTER
          const jy = (rand(i * 3 + 1) - 0.5) * 2 * POINTCLOUD_JITTER
          const jz = (rand(i * 3 + 2) - 0.5) * 2 * POINTCLOUD_JITTER
          positions[i * 3 + 0] = x * POINTCLOUD_SPACING - cx + jx
          positions[i * 3 + 1] = y * POINTCLOUD_SPACING - cy + jy
          positions[i * 3 + 2] = z * POINTCLOUD_SPACING - cz + jz
          seeds[i] = rand(i * 7 + 13)
          i++
        }
      }
    }

    const geo = new BufferGeometry()
    geo.setAttribute('position', new BufferAttribute(positions, 3))
    geo.setAttribute('aSeed', new BufferAttribute(seeds, 1))

    // The wave sweeps across the X extent. Give it a little margin past each edge so the
    // front fully enters and fully exits (no point permanently half-lit at the ends).
    const halfX = cx + POINTCLOUD_JITTER
    const margin = WAVE_WIDTH
    return {
      geometry: geo,
      waveMinX: -halfX - margin,
      waveSpanX: (halfX + margin) * 2,
    }
  }, [])

  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uWaveX: { value: 0 },
          uWaveWidth: { value: WAVE_WIDTH },
          uBaseSize: { value: POINTCLOUD_BASE_SIZE },
          uLitSize: { value: POINTCLOUD_LIT_SIZE },
          uDriftAmp: { value: POINTCLOUD_DRIFT_AMP },
          uDriftSpeed: { value: POINTCLOUD_DRIFT_SPEED },
          uBaseColor: { value: new Color(LATTICE_LINE_HEX) },
          uAccentColor: { value: new Color(ACCENT_HEX) },
          uBaseOpacity: { value: POINTCLOUD_BASE_OPACITY },
          uLitOpacity: { value: POINTCLOUD_LIT_OPACITY },
        },
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
        depthWrite: false,
        blending: NormalBlending, // NEVER AdditiveBlending — washes to white on light bg
      }),
    []
  )

  // Responsive: full-width BACKGROUND placement (centered + scaled to fill the hero),
  // not the lattice's right-of-center focal slot.
  const width = useThree((s) => s.size.width)
  const isMobile = width < LATTICE_BREAKPOINT_PX
  const position = isMobile ? POINTCLOUD_POSITION_MOBILE : POINTCLOUD_POSITION_DESKTOP
  const scale = isMobile ? POINTCLOUD_SCALE_MOBILE : POINTCLOUD_SCALE_DESKTOP

  useFrame((_, delta) => {
    const mat = matRef.current
    if (!mat) return
    // The ONLY per-frame work: advance time, then sweep the wavefront across X and wrap.
    // delta-based so speed is frame-rate independent. No React state, no geometry touch.
    mat.uniforms.uTime.value += delta
    const t = (mat.uniforms.uTime.value * WAVE_SPEED) % waveSpanX
    mat.uniforms.uWaveX.value = waveMinX + t
  })

  return (
    <points ref={pointsRef} geometry={geometry} position={position} scale={scale}>
      <primitive ref={matRef} object={material} attach="material" />
    </points>
  )
}
