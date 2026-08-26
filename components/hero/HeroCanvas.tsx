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
 * Post-LCP mount (D-12, 05-04→05-05): the <HeroScene> child mount is gated behind a
 * trigger that is ORDERING-GUARANTEED-AFTER-LCP: first user interaction (pointerdown /
 * scroll / keydown, each {once,passive}) OR a setTimeout(HERO_MOUNT_DELAY_MS=3000)
 * floor, whichever fires first. The floor (3000ms) is set well past the ~2811ms
 * observed-LCP mark so the three.js chunk fetch + ~747ms bootup land in Lantern's
 * POST-LCP task graph and no longer inflate the simulated LCP. 05-04 replaced the bare
 * requestIdleCallback (which fired ~2.3s post-hydration, BEFORE observed LCP under 4x
 * throttle) with this interaction-or-timeout trigger that is provably post-LCP.
 * The absolute inset-0 wrapper is rendered UNCONDITIONALLY (identical geometry always →
 * CLS = 0); only the child is deferred. The glass fades in over the gradient as before.
 * Cut TBT 1450ms → ~184ms (05-04); 05-05 adds experimental.inlineCss:true to remove
 * the render-blocking CSS chunk from the LCP critical path (Lever 2).
 *
 * Source: 05-PATTERNS.md §"HeroCanvas.tsx"; 05-UI-SPEC.md Reduced-Motion + Fade-in Contracts.
 */
'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { HeroFallback } from './HeroFallback'
import { HERO_MOUNT_DELAY_MS } from './constants'

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

  // Post-LCP mount trigger (05-05, Lever 1): fire AFTER LCP, not before.
  // The bare requestIdleCallback fired ~2.3s post-hydration — BEFORE observed LCP
  // (~2811ms) under 4x CPU throttle — pulling three.js bootup into Lantern's pre-LCP
  // task graph. Replace with interaction-or-timeout-floor:
  //   • First user interaction (pointerdown / scroll / keydown) fires immediately on
  //     any real interaction, cannot occur during the headless Lighthouse LCP window.
  //   • setTimeout(HERO_MOUNT_DELAY_MS) floor guarantees the canvas ALWAYS eventually
  //     mounts (headless Playwright, Lighthouse never interact), set at 3000ms — well
  //     past the ~2811ms observed-LCP mark so three.js bootup lands post-LCP.
  // The handler is idempotent: once one signal fires it marks mounted and no-ops the
  // rest. Cleanup removes all listeners + clears the timeout on unmount.
  // Hooks must run unconditionally before the D-06 early return below — harmless for
  // reduced-motion/no-WebGL users since they never reach the mount path.
  useEffect(() => {
    let mounted = false
    const trigger = () => {
      if (mounted) return
      mounted = true
      setShouldMount(true)
    }

    window.addEventListener('pointerdown', trigger, { once: true, passive: true })
    window.addEventListener('scroll', trigger, { once: true, passive: true })
    window.addEventListener('keydown', trigger, { once: true, passive: true })
    const timerId = window.setTimeout(trigger, HERO_MOUNT_DELAY_MS)

    return () => {
      window.removeEventListener('pointerdown', trigger)
      window.removeEventListener('scroll', trigger)
      window.removeEventListener('keydown', trigger)
      window.clearTimeout(timerId)
    }
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
          only the child is gated behind the post-LCP mount trigger. The .hero-backdrop
          gradient painted by HeroSection stays underneath, so the glass fades IN OVER
          it (D-11, D-12). */}
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
