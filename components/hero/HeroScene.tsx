/**
 * components/hero/HeroScene.tsx — R3F Canvas root (Plan 02: full glass scene).
 *
 * Expands the Plan 01 tracer into the real centerpiece:
 *   - IntersectionObserver → `isVisible` drives `frameloop={isVisible ? 'always' : 'never'}`
 *     on the SAME <Canvas> (prop change, NOT a remount — 05-RESEARCH Pattern 2 / Pitfall 5).
 *     The loop pauses within a frame of the hero leaving the viewport (D-05) and resumes
 *     on re-entry with no Canvas flash.
 *   - <PerformanceMonitor> + <AdaptiveDpr /> wrap the scene: AdaptiveDpr auto-scales dpr
 *     within the [1,2] range from state.performance.current; the DPR floor stays 1.0
 *     (UI-SPEC — never lower). onDecline/onIncline toggle `degraded`, which the LOCKED
 *     tier1-first strategy uses to reduce transmission cost IN PLACE on GlassMesh
 *     (samples/resolution ↓, transmissionSampler on) — one material path everywhere (D-12).
 *   - <GlassMesh degraded={degraded} /> is the single rounded solid + MeshTransmissionMaterial.
 *
 * Loaded EXCLUSIVELY via next/dynamic({ ssr:false }) from HeroCanvas — never imported
 * by a Server Component (HERO-01). The three.js/@react-three imports here must never
 * reach the server bundle (tests/invariants/no-canvas-server-bundle.sh).
 *
 * `onReady` fires from R3F's onCreated so HeroCanvas cross-fades the Canvas in over the
 * always-painted gradient fallback (~500ms ease-out, D-11 — implemented in HeroCanvas,
 * NOT re-implemented here; no pop-in, no spinner).
 *
 * The `style` prop on <Canvas> is the ONE permitted inline style in the codebase:
 * R3F requires position:absolute directly on its inner canvas element to fill the
 * container (documented R3F API usage, 05-PATTERNS.md §L172-178 — not a violation).
 *
 * Source: 05-RESEARCH.md Pattern 2/3/4; 05-UI-SPEC.md Scene Motion Contract.
 */
'use client'

import { useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor, AdaptiveDpr } from '@react-three/drei'
import { CAMERA_FOV, CAMERA_Z } from './constants'
import { GlassMesh } from './GlassMesh'

export function HeroScene({ onReady }: { onReady?: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  // Start visible: the hero is above the fold on first paint. IntersectionObserver
  // corrects this immediately if it is scrolled out (D-05 offscreen pause).
  const [isVisible, setIsVisible] = useState(true)
  // PerformanceMonitor.onDecline → tier1-first degraded transmission (D-12).
  const [degraded, setDegraded] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="absolute inset-0">
      <Canvas
        frameloop={isVisible ? 'always' : 'never'}
        dpr={[1, 2]}
        camera={{ fov: CAMERA_FOV, position: [0, 0, CAMERA_Z] }}
        gl={{ antialias: false }}
        onCreated={onReady}
        style={{ position: 'absolute', inset: 0 }}
      >
        <PerformanceMonitor
          onDecline={() => setDegraded(true)}
          onIncline={() => setDegraded(false)}
        >
          <AdaptiveDpr />
          <GlassMesh degraded={degraded} />
        </PerformanceMonitor>
      </Canvas>
    </div>
  )
}
