/**
 * components/hero/HeroScene.tsx — R3F Canvas root (TRACER: minimal single mesh).
 *
 * Phase 5 Plan 01 (tracer): the thinnest possible scene that proves the Canvas
 * mounts through the ssr:false isolation chain — one icosahedron, a plain
 * standard material, one ambient + one directional light. NO MeshTransmissionMaterial,
 * NO PerformanceMonitor, NO rotation, NO IntersectionObserver — those land in Plan 02.
 *
 * Loaded EXCLUSIVELY via next/dynamic({ ssr:false }) from HeroCanvas — never
 * imported by a Server Component (HERO-01). The three.js/@react-three imports in
 * this file must never reach the server bundle (no-canvas-server-bundle.sh).
 *
 * `onReady` fires from R3F's onCreated so HeroCanvas can cross-fade the Canvas
 * in over the always-painted gradient fallback (D-11, no pop-in).
 *
 * The `style` prop on <Canvas> is the ONE permitted inline style in the codebase:
 * R3F requires position:absolute directly on the canvas element to fill its
 * container — there is no Tailwind utility for the R3F-created inner canvas
 * (documented R3F API usage, per 05-PATTERNS.md §L172-178, not an inline-style violation).
 *
 * Source: 05-PATTERNS.md §"HeroScene.tsx"; 05-UI-SPEC.md Canvas Layer Contract.
 */
'use client'

import { Canvas } from '@react-three/fiber'
import { CAMERA_FOV, CAMERA_Z } from './constants'

export function HeroScene({ onReady }: { onReady?: () => void }) {
  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={[1, 2]}
        camera={{ fov: CAMERA_FOV, position: [0, 0, CAMERA_Z] }}
        gl={{ antialias: false }}
        onCreated={onReady}
        style={{ position: 'absolute', inset: 0 }}
      >
        <ambientLight />
        <directionalLight position={[2, 3, 4]} />
        <mesh>
          <icosahedronGeometry args={[1, 4]} />
          <meshStandardMaterial />
        </mesh>
      </Canvas>
    </div>
  )
}
