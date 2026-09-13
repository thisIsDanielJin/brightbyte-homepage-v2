/**
 * components/hero/HeroScene.tsx — R3F Canvas root (point-cloud hero scene).
 *
 * Renders the point-cloud centerpiece:
 *   - IntersectionObserver → `isVisible` drives `frameloop={isVisible ? 'always' : 'never'}`
 *     on the SAME <Canvas> (prop change, NOT a remount — 05-RESEARCH Pattern 2 / Pitfall 5).
 *     The loop pauses within a frame of the hero leaving the viewport (D-05) and resumes
 *     on re-entry with no Canvas flash.
 *   - <PointCloud /> is a jittered 3D grid of ~3.5k points with an accent-blue wave of
 *     light sweeping across it. It issues ONE draw call (a single THREE.Points), so the
 *     PerformanceMonitor/AdaptiveDpr degradation machinery from the glass scene is GONE —
 *     there is no per-frame transmission cost to throttle. The remaining cost is
 *     fragment-stage overdraw (bounded by round-discard in the point shader), verified
 *     against the Phase-5 perf gate.
 *   - <DebugHook /> stays: the Phase 5 perf gate reads window.__r3f_hero.calls()/dpr().
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
 * Source: 05-RESEARCH.md Pattern 2/3; 260912-hero-lattice/PLAN.md §Scope.
 */
'use client'

import { useEffect, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { CAMERA_FOV, CAMERA_Z } from './constants'
import { PointCloud } from './PointCloud'

/**
 * Mount-only read-only debug hook for the Phase 5 perf gate (05-03).
 *
 * Exposes exactly two read functions over the already-decorative canvas so the
 * production perf gate can assert draw calls < 200 and observe pixel ratio — with
 * NO new data/input surface (threat register unchanged). It is INTENTIONALLY not
 * production-guarded: the gate runs against `next start`, so the hook must exist in
 * the production bundle. It renders nothing and never touches the scene/material.
 */
declare global {
  interface Window {
    __r3f_hero?: { calls: () => number; dpr: () => number }
  }
}

function DebugHook() {
  const gl = useThree((s) => s.gl)
  useEffect(() => {
    window.__r3f_hero = {
      calls: () => gl.info.render.calls,
      dpr: () => gl.getPixelRatio(),
    }
    return () => {
      delete window.__r3f_hero
    }
  }, [gl])
  return null
}

export function HeroScene({ onReady }: { onReady?: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  // Start visible: the hero is above the fold on first paint. IntersectionObserver
  // corrects this immediately if it is scrolled out (D-05 offscreen pause).
  const [isVisible, setIsVisible] = useState(true)

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
        gl={{ antialias: true }}
        onCreated={onReady}
        style={{ position: 'absolute', inset: 0 }}
      >
        <PointCloud />
        <DebugHook />
      </Canvas>
    </div>
  )
}
