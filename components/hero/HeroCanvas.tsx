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
 * Idle mount (D-11, 05-06): the <HeroScene> child mount is deferred to browser idle
 * via requestIdleCallback (with a setTimeout(HERO_IDLE_FALLBACK_MS) fallback for
 * browsers without rIC, e.g. older Safari). This keeps the ~747ms three.js bootup off
 * the initial hydration critical path while still mounting promptly once the main
 * thread is free — the glass fades in over the gradient on load (no blank wait, no
 * click-to-summon). The absolute inset-0 wrapper is rendered UNCONDITIONALLY (identical
 * geometry always → CLS = 0); only the child is deferred.
 *
 * History: 05-05 gated the mount behind an interaction-or-3000ms-floor trigger to push
 * three.js boot past Lantern's simulated-LCP window. That produced a visible 3s
 * blank-then-pop-in. Since D-12 was reconciled to observed LCP (2026-08-26), the
 * simulated metric no longer gates the phase, so the trigger was reverted to a graceful
 * idle mount (user decision 2026-09-02). TBT stays low (three.js still off the initial
 * critical path); 05-05's experimental.inlineCss:true is retained.
 *
 * Source: 05-PATTERNS.md §"HeroCanvas.tsx"; 05-UI-SPEC.md Reduced-Motion + Fade-in Contracts.
 */
'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { HeroFallback } from './HeroFallback'
import { HERO_IDLE_FALLBACK_MS } from './constants'

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
  // Idle gate: defer the three.js import + Canvas creation to browser idle so their
  // ~747ms main-thread cost stays off the initial hydration critical path while the
  // hero still fades in promptly on load (D-11, 05-06).
  const [shouldMount, setShouldMount] = useState(false)

  // Idle mount (05-06): mount at the first browser idle window post-hydration via
  // requestIdleCallback, with a short setTimeout(HERO_IDLE_FALLBACK_MS) fallback for
  // browsers without rIC (older Safari). No interaction required — the glass fades in
  // over the gradient on load. Cleanup cancels whichever primitive is pending.
  // Hooks must run unconditionally before the D-06 early return below — harmless for
  // reduced-motion/no-WebGL users since they never reach the mount path.
  useEffect(() => {
    const mount = () => setShouldMount(true)

    if (typeof window.requestIdleCallback === 'function') {
      const idleId = window.requestIdleCallback(mount)
      return () => window.cancelIdleCallback(idleId)
    }

    const timerId = window.setTimeout(mount, HERO_IDLE_FALLBACK_MS)
    return () => window.clearTimeout(timerId)
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
          only the child is gated behind the idle mount. The .hero-backdrop gradient
          painted by HeroSection stays underneath, so the glass fades IN OVER it (D-11). */}
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
