/**
 * components/hero/HeroCanvas.tsx — Client island: reduced-motion + WebGL gate,
 * ssr:false dynamic import of the R3F scene, and the cross-fade wrapper.
 *
 * Isolation chain (HERO-01, ROADMAP SC #1):
 *   page.tsx (Server) → HeroSection ('use client') → HeroCanvas ('use client')
 *     → dynamic(() => import('./HeroScene'), { ssr:false })
 * The dynamic() call is at MODULE TOP LEVEL (Next.js requirement — never inside
 * render; verified node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md:66-68).
 * HeroScene's three.js imports therefore never reach the server bundle.
 *
 * Reduced-motion gate (D-06, HERO-02 — one-way locked accessibility contract):
 * useReducedMotion() true → return <HeroFallback /> BEFORE any Canvas. No Canvas
 * element is mounted at all — not merely paused. canUseWebGL() false → same
 * fallback (no-WebGL / headless), so a WebGL failure is invisible to the user.
 *
 * Fade-in (D-11): the wrapper starts opacity-0 and transitions to opacity-100 when
 * data-ready="true" is set from R3F's onCreated (via onReady). The .hero-backdrop
 * gradient stays painted underneath via HeroSection (never removed) — Canvas fades
 * IN OVER it, so there is no pop-in and CLS = 0. Duration 500ms / ease-out
 * (--duration-entrance / --ease-out; see HERO_FADE_MS in constants.ts).
 *
 * Source: 05-PATTERNS.md §"HeroCanvas.tsx"; 05-UI-SPEC.md Reduced-Motion + Fade-in Contracts.
 */
'use client'

import dynamic from 'next/dynamic'
import { useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { HeroFallback } from './HeroFallback'

// Module-level dynamic() — Next.js requires this at module scope, never inside
// render, and ssr:false must live in a Client Component (this file has 'use client').
// HeroScene is a NAMED export, so resolve it from the module (Next docs
// "Importing Named Exports", lazy-loading.md:155-173).
const HeroScene = dynamic(() => import('./HeroScene').then((m) => m.HeroScene), {
  ssr: false,
})

// Lightweight WebGL capability probe (UI-SPEC §L299-311). Returns false on
// headless/unsupported environments so we fall back rather than mount a blank canvas.
function canUseWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')
    )
  } catch {
    return false
  }
}

export function HeroCanvas() {
  const prefersReduced = useReducedMotion()
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Reduced-motion / no-WebGL gate: no Canvas rendered at all (D-06, HERO-02).
  if (prefersReduced || !canUseWebGL()) return <HeroFallback />

  return (
    <div
      ref={wrapperRef}
      className="absolute inset-0 opacity-0 [transition:opacity_500ms_cubic-bezier(0,0,0.2,1)] data-[ready=true]:opacity-100"
      aria-hidden="true"
    >
      <HeroScene
        onReady={() => {
          if (wrapperRef.current) wrapperRef.current.dataset.ready = 'true'
        }}
      />
    </div>
  )
}
