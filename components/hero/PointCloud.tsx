/**
 * components/hero/PointCloud.tsx — Point-cloud hero: a jittered 3D grid of dots
 * where each dot breathes independently, occasionally blooming bright and large.
 *
 * SCENE CONTRACT:
 *   - Geometry: JITTERED GRID (COLS×ROWS×DEPTH). Each point nudged by a small
 *     per-point random offset. Built ONCE in useMemo with two attributes:
 *     `position` and `aSeed` (per-point random scalar for phase decorrelation).
 *   - Material: ONE ShaderMaterial → ONE draw call (THREE.Points).
 *     All animation computed in-shader off a single `uTime` uniform — the ONLY
 *     per-frame CPU cost is a single uniform write (D-05 lean frameloop).
 *   - Blending: NORMAL, never additive. Light backdrop washes additive to white.
 *     depthWrite:false + transparent so soft overlapping sprites composite cleanly.
 *   - Vertex shader: applies gentle drift, then computes per-dot bloom (vLit) from
 *     an independent sine cycle. pow() sharpens the sine so dots spend most of the
 *     cycle near zero and only briefly peak — the "occasional intense spot" feel.
 *     gl_PointSize interpolates BASE→LIT by vLit with depth attenuation.
 *     Vertical center boost stacks on top (center dots larger).
 *   - Fragment shader: round soft sprite (discard outside radius bounds overdraw),
 *     mixes base tone → accent by vLit, base opacity → lit opacity by vLit.
 *
 * DRAW-CALL BUDGET (D-12): ONE draw call. Perf risk is fragment overdraw from
 * thousands of overlapping soft sprites at high dpr; round-discard mitigates this.
 *
 * IDENT-01: all hex via named constants from constants.ts; no raw hex here.
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
  POINTCLOUD_CENTER_BOOST,
  POINTCLOUD_DRIFT_AMP,
  POINTCLOUD_DRIFT_SPEED,
  POINTCLOUD_PULSE_SPEED,
  POINTCLOUD_PULSE_CONTRAST,
  POINTCLOUD_PHASE_SPREAD,
  LATTICE_BREAKPOINT_PX,
  POINTCLOUD_POSITION_DESKTOP,
  POINTCLOUD_POSITION_MOBILE,
  POINTCLOUD_SCALE_DESKTOP,
  POINTCLOUD_SCALE_MOBILE,
} from './constants'

const VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uBaseSize;
  uniform float uLitSize;
  uniform float uDriftAmp;
  uniform float uDriftSpeed;
  uniform float uPulseSpeed;    // sine cycles per second for the bloom pulse
  uniform float uPulseContrast; // pow() exponent — higher = sharper, briefer blooms
  uniform float uPhaseSpread;   // multiplier on aSeed for phase diversity across the field
  uniform float uCenterBoost;   // max size multiplier for dots at vertical center (y=0)
  uniform float uHalfY;         // half grid height — normalises the Y falloff
  attribute float aSeed;        // per-point random [0,1) to decorrelate pulse phase
  varying float vLit;

  void main() {
    vec3 p = position;

    // Gentle positional drift: each axis offset by a slow sine keyed to uTime + seed
    // phase so the field shimmers without pulsing in lockstep.
    float ph = aSeed * 6.2831853; // seed → phase in [0, 2π)
    p.x += sin(uTime * uDriftSpeed + ph) * uDriftAmp;
    p.y += cos(uTime * uDriftSpeed * 0.9 + ph) * uDriftAmp;
    p.z += sin(uTime * uDriftSpeed * 1.1 + ph * 1.3) * uDriftAmp;

    // Per-dot bloom: independent sine cycle per point. The seed-scaled phase offset
    // (uPhaseSpread controls diversity) ensures blooms are spatially uncorrelated —
    // "occasional spots" rather than the whole field pulsing in sync.
    // pow() sharpens the [0,1] sine output so dots are dim most of the time and
    // only briefly peak bright — the "sometimes more intense" feel.
    float rawPulse = sin(uTime * uPulseSpeed * 6.2831853 + aSeed * uPhaseSpread) * 0.5 + 0.5;
    vLit = pow(rawPulse, uPulseContrast);

    // Vertical center boost: smooth full-height weight — 1.0 at y=0, 0.0 at edges.
    float centerWeight = 1.0 - smoothstep(0.0, uHalfY, abs(p.y));
    float centerMult = mix(1.0, uCenterBoost, centerWeight);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    // Size grows when bloomed; depth attenuation makes nearer dots larger.
    // Center boost stacks: center dots are larger in both resting and bloomed states.
    float size = mix(uBaseSize, uLitSize, vLit) * centerMult;
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
    // Round soft sprite: discard outside radius → circular dots AND bounds overdraw.
    vec2 c = gl_PointCoord - vec2(0.5);
    float d = length(c);
    if (d > 0.5) discard;
    // Soft edge: fade the outer ~20% of the radius so dots are not hard-aliased discs.
    float edge = 1.0 - smoothstep(0.35, 0.5, d);

    vec3 color = mix(uBaseColor, uAccentColor, vLit);
    float alpha = mix(uBaseOpacity, uLitOpacity, vLit) * edge;
    gl_FragColor = vec4(color, alpha);
  }
`

export function PointCloud() {
  const pointsRef = useRef<Points>(null)
  const matRef = useRef<ShaderMaterial>(null)

  const { geometry, halfY } = useMemo(() => {
    const cols = POINTCLOUD_GRID_COLS
    const rows = POINTCLOUD_GRID_ROWS
    const depth = POINTCLOUD_GRID_DEPTH
    const count = cols * rows * depth
    const positions = new Float32Array(count * 3)
    const seeds = new Float32Array(count)

    const cx = ((cols - 1) * POINTCLOUD_SPACING) / 2
    const cy = ((rows - 1) * POINTCLOUD_SPACING) / 2
    const cz = ((depth - 1) * POINTCLOUD_SPACING) / 2

    // Deterministic pseudo-random — harness forbids Math.random(); hashed index
    // gives stable, well-spread jitter + seeds across the full grid.
    const rand = (n: number) => {
      const s = Math.sin(n * 127.1 + 311.7) * 43758.5453
      return s - Math.floor(s)
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

    return { geometry: geo, halfY: cy + POINTCLOUD_JITTER }
  }, [])

  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uBaseSize: { value: POINTCLOUD_BASE_SIZE },
          uLitSize: { value: POINTCLOUD_LIT_SIZE },
          uDriftAmp: { value: POINTCLOUD_DRIFT_AMP },
          uDriftSpeed: { value: POINTCLOUD_DRIFT_SPEED },
          uPulseSpeed: { value: POINTCLOUD_PULSE_SPEED },
          uPulseContrast: { value: POINTCLOUD_PULSE_CONTRAST },
          uPhaseSpread: { value: POINTCLOUD_PHASE_SPREAD },
          uCenterBoost: { value: POINTCLOUD_CENTER_BOOST },
          uHalfY: { value: halfY },
          uBaseColor: { value: new Color(LATTICE_LINE_HEX) },
          uAccentColor: { value: new Color(ACCENT_HEX) },
          uBaseOpacity: { value: POINTCLOUD_BASE_OPACITY },
          uLitOpacity: { value: POINTCLOUD_LIT_OPACITY },
        },
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
        depthWrite: false,
        blending: NormalBlending,
      }),
    [halfY]
  )

  const width = useThree((s) => s.size.width)
  const isMobile = width < LATTICE_BREAKPOINT_PX
  const position = isMobile ? POINTCLOUD_POSITION_MOBILE : POINTCLOUD_POSITION_DESKTOP
  const scale = isMobile ? POINTCLOUD_SCALE_MOBILE : POINTCLOUD_SCALE_DESKTOP

  useFrame((_, delta) => {
    const mat = matRef.current
    if (!mat) return
    // Only per-frame work: advance time. All bloom + drift computed in-shader.
    mat.uniforms.uTime.value += delta
  })

  return (
    <points ref={pointsRef} geometry={geometry} position={position} scale={scale}>
      <primitive ref={matRef} object={material} attach="material" />
    </points>
  )
}
