/**
 * components/hero/WireframeAnimation.tsx — Bold 2D animated website wireframe.
 *
 * GSAP-driven, pixel-perfect 2D wireframe that IS the hero visual.
 * Not background decoration. The wireframe is the proof of craft.
 *
 * Animation sequence:
 * 1. Browser frame draws itself (border animation)
 * 2. Chrome elements appear (address bar, dots, nav)
 * 3. Content blocks cascade in from top to bottom
 * 4. Hold for 4s, then morph to next layout
 * 5. Cycle through 4 website layouts
 *
 * Uses GSAP for sequenced, professional-grade motion.
 * Pure CSS/DOM, no WebGL, perfect 90-degree corners.
 */
'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import gsap from 'gsap'

interface WireEl {
  id: string
  x: number; y: number; w: number; h: number
  type: 'bar' | 'image' | 'text' | 'button' | 'card' | 'nav' | 'dot'
  delay?: number // build stagger group (0 = chrome, 1 = primary, 2 = secondary, 3 = detail)
}

// ── Layout definitions (percentages) ──
const chrome: WireEl[] = [
  { id: 'addr', x: 0, y: 0, w: 100, h: 4.5, type: 'bar', delay: 0 },
  { id: 'dot1', x: 1.5, y: 1.2, w: 1, h: 2, type: 'dot', delay: 0 },
  { id: 'dot2', x: 3.2, y: 1.2, w: 1, h: 2, type: 'dot', delay: 0 },
  { id: 'dot3', x: 4.9, y: 1.2, w: 1, h: 2, type: 'dot', delay: 0 },
  { id: 'url', x: 30, y: 1.5, w: 20, h: 1.2, type: 'text', delay: 0 },
  { id: 'logo', x: 1.5, y: 6.5, w: 8, h: 2.2, type: 'bar', delay: 0 },
  { id: 'nav1', x: 62, y: 6.8, w: 5.5, h: 1.8, type: 'nav', delay: 0 },
  { id: 'nav2', x: 69, y: 6.8, w: 5.5, h: 1.8, type: 'nav', delay: 0 },
  { id: 'nav3', x: 76, y: 6.8, w: 5.5, h: 1.8, type: 'nav', delay: 0 },
  { id: 'nav4', x: 83, y: 6.8, w: 5.5, h: 1.8, type: 'nav', delay: 0 },
  { id: 'navcta', x: 91, y: 6.2, w: 7.5, h: 3, type: 'button', delay: 0 },
]

const layouts: WireEl[][] = [
  [ // Landing
    { id: 'hero', x: 2, y: 11, w: 96, h: 20, type: 'image', delay: 1 },
    { id: 'h1', x: 8, y: 34, w: 40, h: 2.5, type: 'text', delay: 1 },
    { id: 'h2', x: 8, y: 38, w: 30, h: 1.5, type: 'text', delay: 1 },
    { id: 'cL', x: 2, y: 44, w: 47, h: 18, type: 'card', delay: 2 },
    { id: 'cR', x: 51, y: 44, w: 47, h: 18, type: 'card', delay: 2 },
    { id: 'tL1', x: 5, y: 47, w: 38, h: 1, type: 'text', delay: 2 },
    { id: 'tL2', x: 5, y: 49.5, w: 32, h: 1, type: 'text', delay: 2 },
    { id: 'tL3', x: 5, y: 52, w: 35, h: 1, type: 'text', delay: 2 },
    { id: 'tR1', x: 54, y: 47, w: 38, h: 1, type: 'text', delay: 2 },
    { id: 'tR2', x: 54, y: 49.5, w: 32, h: 1, type: 'text', delay: 2 },
    { id: 'tR3', x: 54, y: 52, w: 35, h: 1, type: 'text', delay: 2 },
    { id: 'cta', x: 35, y: 66, w: 14, h: 4, type: 'button', delay: 2 },
    { id: 'cta2', x: 51, y: 66, w: 11, h: 4, type: 'bar', delay: 2 },
    { id: 'f1', x: 2, y: 74, w: 31, h: 18, type: 'card', delay: 3 },
    { id: 'f2', x: 35, y: 74, w: 31, h: 18, type: 'card', delay: 3 },
    { id: 'f3', x: 68, y: 74, w: 30, h: 18, type: 'card', delay: 3 },
    { id: 'ft', x: 0, y: 95, w: 100, h: 5, type: 'bar', delay: 3 },
  ],
  [ // Sidebar
    { id: 'hero', x: 1.5, y: 11, w: 20, h: 84, type: 'card', delay: 1 },
    { id: 'h1', x: 4, y: 14, w: 14, h: 1.2, type: 'text', delay: 1 },
    { id: 'h2', x: 4, y: 17, w: 11, h: 1.2, type: 'text', delay: 1 },
    { id: 'cL', x: 24, y: 11, w: 74, h: 26, type: 'image', delay: 1 },
    { id: 'cR', x: 24, y: 40, w: 74, h: 1.2, type: 'text', delay: 2 },
    { id: 'tL1', x: 24, y: 43, w: 60, h: 1, type: 'text', delay: 2 },
    { id: 'tL2', x: 24, y: 45.5, w: 50, h: 1, type: 'text', delay: 2 },
    { id: 'tL3', x: 24, y: 48, w: 55, h: 1, type: 'text', delay: 2 },
    { id: 'tR1', x: 4, y: 22, w: 14, h: 1.2, type: 'text', delay: 2 },
    { id: 'tR2', x: 4, y: 25, w: 12, h: 1.2, type: 'text', delay: 2 },
    { id: 'tR3', x: 4, y: 28, w: 14, h: 1.2, type: 'text', delay: 2 },
    { id: 'cta', x: 24, y: 54, w: 15, h: 3.5, type: 'button', delay: 2 },
    { id: 'cta2', x: 4, y: 31, w: 14, h: 1.2, type: 'text', delay: 2 },
    { id: 'f1', x: 24, y: 62, w: 36, h: 22, type: 'card', delay: 3 },
    { id: 'f2', x: 62, y: 62, w: 36, h: 22, type: 'card', delay: 3 },
    { id: 'f3', x: 24, y: 87, w: 74, h: 3, type: 'bar', delay: 3 },
    { id: 'ft', x: 0, y: 95, w: 100, h: 5, type: 'bar', delay: 3 },
  ],
  [ // Card Grid
    { id: 'hero', x: 25, y: 12, w: 50, h: 3, type: 'text', delay: 1 },
    { id: 'h1', x: 30, y: 17, w: 40, h: 1.5, type: 'text', delay: 1 },
    { id: 'h2', x: 35, y: 20, w: 30, h: 1, type: 'text', delay: 1 },
    { id: 'cL', x: 2, y: 26, w: 31, h: 30, type: 'card', delay: 2 },
    { id: 'cR', x: 35, y: 26, w: 31, h: 30, type: 'card', delay: 2 },
    { id: 'tL1', x: 4, y: 29, w: 26, h: 12, type: 'image', delay: 2 },
    { id: 'tL2', x: 4, y: 44, w: 22, h: 1, type: 'text', delay: 2 },
    { id: 'tL3', x: 4, y: 47, w: 18, h: 1, type: 'text', delay: 2 },
    { id: 'tR1', x: 37, y: 29, w: 26, h: 12, type: 'image', delay: 2 },
    { id: 'tR2', x: 37, y: 44, w: 22, h: 1, type: 'text', delay: 2 },
    { id: 'tR3', x: 37, y: 47, w: 18, h: 1, type: 'text', delay: 2 },
    { id: 'cta', x: 68, y: 26, w: 30, h: 30, type: 'card', delay: 2 },
    { id: 'cta2', x: 70, y: 29, w: 26, h: 12, type: 'image', delay: 2 },
    { id: 'f1', x: 2, y: 60, w: 31, h: 30, type: 'card', delay: 3 },
    { id: 'f2', x: 35, y: 60, w: 31, h: 30, type: 'card', delay: 3 },
    { id: 'f3', x: 68, y: 60, w: 30, h: 30, type: 'card', delay: 3 },
    { id: 'ft', x: 0, y: 95, w: 100, h: 5, type: 'bar', delay: 3 },
  ],
  [ // Editorial
    { id: 'hero', x: 1.5, y: 11, w: 97, h: 32, type: 'image', delay: 1 },
    { id: 'h1', x: 18, y: 46, w: 64, h: 3, type: 'text', delay: 1 },
    { id: 'h2', x: 22, y: 51, w: 56, h: 1.5, type: 'text', delay: 1 },
    { id: 'cL', x: 12, y: 56, w: 76, h: 1, type: 'text', delay: 2 },
    { id: 'cR', x: 12, y: 58.5, w: 68, h: 1, type: 'text', delay: 2 },
    { id: 'tL1', x: 12, y: 61, w: 72, h: 1, type: 'text', delay: 2 },
    { id: 'tL2', x: 12, y: 63.5, w: 60, h: 1, type: 'text', delay: 2 },
    { id: 'tL3', x: 12, y: 66, w: 65, h: 1, type: 'text', delay: 2 },
    { id: 'tR1', x: 25, y: 70, w: 50, h: 7, type: 'card', delay: 2 },
    { id: 'tR2', x: 38, y: 79, w: 5, h: 5, type: 'dot', delay: 2 },
    { id: 'tR3', x: 45, y: 80, w: 14, h: 1, type: 'text', delay: 2 },
    { id: 'cta', x: 45, y: 83, w: 10, h: 1, type: 'text', delay: 2 },
    { id: 'cta2', x: 12, y: 87, w: 76, h: 0.3, type: 'text', delay: 3 },
    { id: 'f1', x: 2, y: 89, w: 31, h: 6, type: 'card', delay: 3 },
    { id: 'f2', x: 35, y: 89, w: 31, h: 6, type: 'card', delay: 3 },
    { id: 'f3', x: 68, y: 89, w: 30, h: 6, type: 'card', delay: 3 },
    { id: 'ft', x: 0, y: 95, w: 100, h: 5, type: 'bar', delay: 3 },
  ],
]

function getStyle(type: WireEl['type']): React.CSSProperties {
  const base: React.CSSProperties = { position: 'absolute' }
  switch (type) {
    case 'bar':
      return { ...base, border: '1px solid var(--color-primary)', opacity: 0.18, background: 'color-mix(in srgb, var(--color-primary) 3%, transparent)' }
    case 'image':
      return { ...base, border: '1px solid var(--color-primary)', opacity: 0.16,
        background: `linear-gradient(to top right, transparent calc(50% - 0.5px), var(--color-primary) calc(50% - 0.5px), var(--color-primary) calc(50% + 0.5px), transparent calc(50% + 0.5px)),
                      linear-gradient(to bottom right, transparent calc(50% - 0.5px), var(--color-primary) calc(50% - 0.5px), var(--color-primary) calc(50% + 0.5px), transparent calc(50% + 0.5px))`,
        backgroundSize: '100% 100%', backgroundBlendMode: 'multiply',
      }
    case 'text':
      return { ...base, background: 'var(--color-primary)', opacity: 0.09 }
    case 'button':
      return { ...base, border: '1.5px solid var(--color-accent)', opacity: 0.35, background: 'color-mix(in srgb, var(--color-accent) 5%, transparent)' }
    case 'card':
      return { ...base, border: '1px solid var(--color-primary)', opacity: 0.12, background: 'color-mix(in srgb, var(--color-primary) 2%, transparent)' }
    case 'nav':
      return { ...base, background: 'var(--color-primary)', opacity: 0.08 }
    case 'dot':
      return { ...base, background: 'var(--color-primary)', opacity: 0.2, borderRadius: '50%' }
  }
}

export function WireframeAnimation() {
  const containerRef = useRef<HTMLDivElement>(null)
  const elementsRef = useRef<Map<string, HTMLDivElement>>(new Map())
  const frameRef = useRef<HTMLDivElement>(null)
  const [layoutIdx, setLayoutIdx] = useState(0)
  const [built, setBuilt] = useState(false)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)

  const allElements = [...chrome, ...layouts[layoutIdx]]

  const setRef = useCallback((id: string) => (el: HTMLDivElement | null) => {
    if (el) elementsRef.current.set(id, el)
    else elementsRef.current.delete(id)
  }, [])

  // Initial build animation
  useEffect(() => {
    if (built) return
    const timer = setTimeout(() => {
      const tl = gsap.timeline()

      // Frame draws in
      if (frameRef.current) {
        tl.fromTo(frameRef.current,
          { clipPath: 'inset(50% 50% 50% 50%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'power3.out' },
          0
        )
      }

      // Elements cascade by delay group
      for (let group = 0; group <= 3; group++) {
        const els = allElements
          .filter(el => (el.delay ?? 0) === group)
          .map(el => elementsRef.current.get(el.id))
          .filter(Boolean)

        if (els.length > 0) {
          tl.fromTo(els,
            { opacity: 0, scale: 0.92, y: 8 },
            {
              opacity: (i: number) => {
                const el = allElements.filter(e => (e.delay ?? 0) === group)[i]
                const s = getStyle(el?.type ?? 'bar')
                return typeof s.opacity === 'number' ? s.opacity : 0.15
              },
              scale: 1, y: 0,
              duration: 0.5,
              stagger: 0.04,
              ease: 'power2.out',
            },
            0.3 + group * 0.25
          )
        }
      }

      timelineRef.current = tl
      tl.then(() => setBuilt(true))
    }, 600)

    return () => clearTimeout(timer)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Layout cycling after build
  useEffect(() => {
    if (!built) return
    const interval = setInterval(() => {
      setLayoutIdx(i => (i + 1) % layouts.length)
    }, 4500)
    return () => clearInterval(interval)
  }, [built])

  // Morph animation on layout change
  useEffect(() => {
    if (!built) return
    const currentLayout = layouts[layoutIdx]
    const tl = gsap.timeline()

    // Blue sweep pulse
    if (containerRef.current) {
      const sweep = containerRef.current.querySelector('[data-sweep]')
      if (sweep) {
        tl.fromTo(sweep,
          { x: '-100%', opacity: 0.06 },
          { x: '100%', opacity: 0, duration: 1, ease: 'power2.inOut' },
          0
        )
      }
    }

    // Morph each element to new position
    currentLayout.forEach(el => {
      const dom = elementsRef.current.get(el.id)
      if (!dom) return
      tl.to(dom, {
        left: `${el.x}%`,
        top: `${el.y}%`,
        width: `${el.w}%`,
        height: `${el.h}%`,
        duration: 0.9,
        ease: 'power3.inOut',
      }, 0.05)
    })

    return () => { tl.kill() }
  }, [layoutIdx, built])

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[720px] mx-auto"
      style={{ aspectRatio: '16 / 11' }}
    >
      {/* Browser frame */}
      <div
        ref={frameRef}
        className="absolute inset-0 border border-primary/30"
        style={{ clipPath: 'inset(50% 50% 50% 50%)' }}
      />

      {/* Wireframe elements */}
      {allElements.map(el => (
        <div
          key={el.id}
          ref={setRef(el.id)}
          data-type={el.type}
          style={{
            ...getStyle(el.type),
            left: `${el.x}%`,
            top: `${el.y}%`,
            width: `${el.w}%`,
            height: `${el.h}%`,
            opacity: 0, // GSAP will animate this
          }}
        />
      ))}

      {/* Blue accent sweep on morph */}
      <div
        data-sweep
        className="absolute inset-y-0 w-[30%] pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent, var(--color-accent), transparent)',
          opacity: 0,
          transform: 'translateX(-100%)',
        }}
      />
    </div>
  )
}
