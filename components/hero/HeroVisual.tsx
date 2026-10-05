/**
 * components/hero/HeroVisual.tsx — Hero visual: Silk shader in a dark card.
 *
 * The Silk component (reactbits) renders a flowing fabric shader using R3F.
 * Loaded via next/dynamic({ ssr: false }) so three.js never reaches the server.
 * Gated on prefers-reduced-motion (static fallback) and IntersectionObserver
 * (pause when off-screen via key unmount).
 *
 * IDENT-01: token colors only.
 */
'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'

const Silk = dynamic(() => import('./options/Silk'), { ssr: false })

function SilkFallback() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          'radial-gradient(ellipse 70% 60% at 50% 50%, color-mix(in srgb, var(--color-accent) 40%, var(--color-surface-dark)), var(--color-surface-dark))',
      }}
      aria-hidden="true"
    />
  )
}

export function HeroVisual() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [mounted, setMounted] = useState(false)
  const prefersReduced = useReducedMotion()

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: '200px', threshold: 0 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const showSilk = mounted && !prefersReduced && isVisible

  return (
    <div
      ref={containerRef}
      className="relative aspect-[4/5] w-full overflow-hidden bg-surface-dark md:aspect-[4/5] lg:aspect-square"
    >
      {showSilk ? (
        <Silk speed={3} scale={1} color="#1C39BB" noiseIntensity={2} rotation={0} />
      ) : (
        <SilkFallback />
      )}
    </div>
  )
}
