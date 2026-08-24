/**
 * components/hero/GlassMesh.tsx — Single frosted-glass mesh + MeshTransmissionMaterial.
 *
 * SCENE CONTRACT:
 *   - One mesh, one material — glass quality is the visual story (D-01, D-03).
 *   - Single-axis Y rotation at ROTATION_SPEED radians/frame (D-04).
 *   - Token-driven lighting only — ambient/directional/point colors from constants.ts
 *     (derived from styles/tokens.css). NO drei <Environment>, NO HDRI, no loaded
 *     assets (D-09, 05-RESEARCH Pattern 4 — the hero reads as BrightByte, not chrome).
 *   - PerformanceMonitor.onDecline sets `degraded` in HeroScene → the tier1-first path
 *     (samples 6→2, resolution 256→32, transmissionSampler on) keeps the SAME
 *     transmission look everywhere within the D-12 mobile budget (checkpoint LOCKED:
 *     tier1-first — a single material path, no non-transmissive branch).
 *   - transmissionSampler=true on the degraded path ONLY — uses THREE's internal
 *     transmission buffer, which cannot see other transparent siblings. This is safe
 *     because the scene is single-mesh (Pitfall 3); guard if a second transparent
 *     object is ever added.
 *   - Responsive placement (UI-SPEC): desktop focal mass right-of-center (~65-70%);
 *     mobile centered + pushed back. Picked from the live canvas width via useThree.
 *
 * IDENT-01: All hex values are named constants from constants.ts. Raw hex is NOT
 * present in this file — the inline grep gate in 05-02-PLAN.md enforces zero
 * `#RRGGBB` on non-comment lines here.
 *
 * roughness ≤ 0.05 (05-RESEARCH Pitfall 6) — GLASS_ROUGHNESS is 0.05.
 *
 * Source: 05-RESEARCH.md Pattern 4 (token lighting) / GlassMesh example §L520-588;
 * 05-UI-SPEC.md Scene Motion Contract + Responsive Behavior Contract.
 */
'use client'

import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { MeshTransmissionMaterial } from '@react-three/drei'
import type { Mesh } from 'three'
import {
  ACCENT_HEX,
  SURFACE_HEX,
  GLASS_IOR,
  GLASS_ROUGHNESS,
  GLASS_THICKNESS,
  GLASS_SAMPLES,
  GLASS_RESOLUTION,
  GLASS_SAMPLES_MOBILE,
  GLASS_RESOLUTION_MOBILE,
  ROTATION_SPEED,
  GLASS_BREAKPOINT_PX,
  GLASS_POSITION_DESKTOP,
  GLASS_POSITION_MOBILE,
  GLASS_SCALE_DESKTOP,
  GLASS_SCALE_MOBILE,
} from './constants'

/**
 * @param degraded when true, PerformanceMonitor has fired onDecline — reduce the
 *   transmission cost in place (tier1-first): fewer samples, tiny resolution, and
 *   the cheaper internal transmissionSampler buffer. Same look, cheaper frame.
 */
export function GlassMesh({ degraded = false }: { degraded?: boolean }) {
  const meshRef = useRef<Mesh>(null)

  // Read the live canvas width to pick desktop vs mobile placement. The scene
  // scale/centroid responds continuously to canvas size (UI-SPEC "no discrete
  // breakpoint"); GLASS_BREAKPOINT_PX only splits the two placement guardrails.
  const width = useThree((s) => s.size.width)
  const isMobile = width < GLASS_BREAKPOINT_PX
  const position = isMobile ? GLASS_POSITION_MOBILE : GLASS_POSITION_DESKTOP
  const scale = isMobile ? GLASS_SCALE_MOBILE : GLASS_SCALE_DESKTOP

  // Single-axis Y rotation (D-04). Clockwise viewed from above (positive Y).
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += ROTATION_SPEED
    }
  })

  return (
    <>
      {/* Token-driven lighting — no HDRI, no Environment, no loaded assets (D-09). */}
      <ambientLight intensity={0.4} color={SURFACE_HEX} />
      <directionalLight intensity={1.2} position={[2, 3, 4]} color={SURFACE_HEX} />
      <pointLight intensity={0.6} position={[-3, -2, 2]} color={ACCENT_HEX} />

      <mesh ref={meshRef} position={position} scale={scale}>
        {/* icosahedron: smooth, minimal polygons, rounded solid look (D-03). */}
        <icosahedronGeometry args={[1, 4]} />
        <MeshTransmissionMaterial
          color={ACCENT_HEX}
          ior={GLASS_IOR}
          roughness={GLASS_ROUGHNESS}
          thickness={GLASS_THICKNESS}
          transmission={1}
          chromaticAberration={0.05}
          backside={false}
          anisotropicBlur={0}
          samples={degraded ? GLASS_SAMPLES_MOBILE : GLASS_SAMPLES}
          resolution={degraded ? GLASS_RESOLUTION_MOBILE : GLASS_RESOLUTION}
          transmissionSampler={degraded}
        />
      </mesh>
    </>
  )
}
