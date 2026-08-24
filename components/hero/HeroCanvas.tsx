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
 * Idle-mount (D-12, 05-04): the three.js import + Canvas creation are the ~1.45s of
 * main-thread bootup (TBT) that Lighthouse's lantern model attributed to the simulated
 * LCP (4.5s) even though observed LCP was 1.29s. To take that cost OFF the LCP critical
 * path, the <HeroScene> child mount is gated behind a browser-idle signal
 * (requestIdleCallback, setTimeout(IDLE_MOUNT_TIMEOUT_MS) fallback) that runs AFTER the
 * D-06 early return. The absolute inset-0 wrapper is rendered UNCONDITIONALLY (identical
 * geometry always → CLS = 0); only the child is deferred. The glass fades in over the
 * gradient exactly as before. This cut TBT 1450ms → ~184ms; note that the LCP element is
 * the <h1> headline (paints ~370ms), not the gradient, so deferral alone does not close
 * the lantern-simulated LCP gate — see 05-04-SUMMARY / the 05-05 base-page critical-path
 * plan for that.
 *
 * Source: 05-PATTERNS.md §"HeroCanvas.tsx"; 05-UI-SPEC.md Reduced-Motion + Fade-in Contracts.
 */
'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { HeroFallback } from './HeroFallback'
import { IDLE_MOUNT_TIMEOUT_MS } from './constants'

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
  // Idle gate: defer the three.js import + Canvas creation to browser idle (post-LCP)
  // so their ~1.45s main-thread cost is off the LCP critical path (D-12, 05-04).
  const [shouldMount, setShouldMount] = useState(false)

  // Schedule the HeroScene mount for browser idle. Hooks must run unconditionally
  // before the D-06 early return, so this effect also runs for reduced-motion /
  // no-WebGL users — but that is harmless: those users render <HeroFallback /> below
  // regardless of shouldMount, so NO Canvas ever mounts for them (D-06 preserved).
  // requestIdleCallback is primary; setTimeout(IDLE_MOUNT_TIMEOUT_MS) is the fallback
  // for browsers without rIC (older Safari) so the glass ALWAYS eventually mounts. The
  // pending handle is cleaned up on unmount so nothing fires after teardown.
  useEffect(() => {
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(() => setShouldMount(true))
      return () => window.cancelIdleCallback?.(id)
    }
    const id = window.setTimeout(() => setShouldMount(true), IDLE_MOUNT_TIMEOUT_MS)
    return () => window.clearTimeout(id)
  }, [])

  // Reduced-motion / no-WebGL gate: no Canvas rendered at all (D-06, HERO-02).
  // MUST stay BEFORE the idle gate so these users never enter the idle path.
  if (prefersReduced || !canUseWebGL()) return <HeroFallback />

  return (
    <div
      ref={wrapperRef}
      className="absolute inset-0 opacity-0 [transition:opacity_500ms_cubic-bezier(0,0,0.2,1)] data-[ready=true]:opacity-100"
      aria-hidden="true"
    >
      {/* Wrapper geometry is identical whether or not HeroScene has mounted (CLS = 0);
          only the child is idle-gated. The .hero-backdrop gradient painted by
          HeroSection stays underneath, so the glass fades IN OVER it (D-11, D-12). */}
      {shouldMount ? (
        <HeroScene
          onReady={() => {
            if (wrapperRef.current) wrapperRef.current.dataset.ready = 'true'
          }}
        />
      ) : null}
    </div>
  )
}
