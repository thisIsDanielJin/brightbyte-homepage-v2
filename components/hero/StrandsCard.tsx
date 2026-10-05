/**
 * components/hero/StrandsCard.tsx — Hero visual: Strands shader inside a dark
 * framed card, matching the editorial "art piece" aesthetic from the daniel-jin
 * studio homepage.
 *
 * Isolation: loaded via next/dynamic({ ssr: false }) so OGL never reaches
 * the server bundle. Gated on IntersectionObserver (pause when off-screen)
 * and prefers-reduced-motion (static gradient fallback).
 *
 * IDENT-01: token colors only. The dark card background uses --color-surface-dark.
 * Source: daniel-jin-studio HeroEditorial pattern, adapted for BrightByte tokens.
 */
'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'

const Strands = dynamic(() => import('./Strands'), { ssr: false })

/**
 * Static gradient fallback for reduced-motion users and no-WebGL environments.
 * Mimics the strand glow feel with a pure CSS radial gradient.
 */
function StrandsFallback() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          'radial-gradient(ellipse 60% 45% at 50% 55%, color-mix(in srgb, var(--color-accent) 35%, transparent), transparent 70%)',
      }}
      aria-hidden="true"
    />
  )
}

export function StrandsCard() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [mounted, setMounted] = useState(false)
  const prefersReduced = useReducedMotion()

  useEffect(() => setMounted(true), [])

  // IntersectionObserver: only mount shader when card is near viewport
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

  const showStrands = mounted && !prefersReduced && isVisible

  return (
    <div
      ref={containerRef}
      className="relative aspect-[4/5] w-full overflow-hidden bg-surface-dark md:aspect-[4/5] lg:aspect-square"
    >
      {showStrands ? (
        <Strands
          colors={['#1C39BB', '#4A6CF7', '#8DA2F7', '#C8D3FB']}
          count={4}
          speed={0.4}
          amplitude={1}
          waviness={1.1}
          thickness={0.7}
          glow={2.4}
          taper={3.2}
          spread={1}
          intensity={0.7}
          saturation={1.3}
          opacity={1}
          scale={1.5}
          className="absolute inset-0"
          style={{ width: '100%', height: '100%' }}
        />
      ) : (
        <StrandsFallback />
      )}

      {/* Caption label like an art print */}
      <div
        className="absolute bottom-5 left-5 right-5 flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.22em] text-muted-on-dark pointer-events-none"
        aria-hidden="true"
      >
        <span>BrightByte / Studio Strands</span>
        <span>2026 · No 01</span>
      </div>
    </div>
  )
}
