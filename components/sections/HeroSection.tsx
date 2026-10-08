/**
 * components/sections/HeroSection.tsx — Hero: 2-col, copy left, animated wireframe right.
 *
 * Left: headline, value props, CTAs on light surface.
 * Right: deep blue gradient with bold stripe texture and an animated
 * white wireframe website that builds on load and morphs between layouts.
 *
 * GSAP drives the wireframe animation. No R3F, no WebGL. Pure DOM + CSS.
 * The wireframe uses the same design language as the rest of the site:
 * clean 1px lines, no rounded corners, accent for interactive elements.
 */
'use client'

import dynamic from 'next/dynamic'
import { useRef, useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import gsap from 'gsap'
import { MotionSection } from '@/components/ui/MotionSection'
import { Reveal } from '@/components/ui/Reveal'

const TechText = dynamic(() => import('@/components/ui/TechText'), { ssr: false })

interface HeroSectionProps {
  headline?: string | null
  subline?: string | null
}

// ── Wireframe layout definitions (percentages of container) ──
interface WireEl {
  id: string
  x: number; y: number; w: number; h: number
  type: 'chrome' | 'image' | 'text' | 'button' | 'card' | 'footer'
  group: number // animation stagger group (0=first, 3=last)
}

const shared: WireEl[] = [
  // Address bar
  { id: 'addr', x: 0, y: 0, w: 100, h: 7, type: 'chrome', group: 0 },
  // Nav row
  { id: 'logo', x: 3, y: 9, w: 10, h: 2, type: 'text', group: 0 },
  { id: 'n1', x: 60, y: 9.5, w: 5, h: 1.5, type: 'text', group: 0 },
  { id: 'n2', x: 67, y: 9.5, w: 5, h: 1.5, type: 'text', group: 0 },
  { id: 'n3', x: 74, y: 9.5, w: 5, h: 1.5, type: 'text', group: 0 },
  { id: 'ncta', x: 82, y: 8.5, w: 14, h: 4, type: 'button', group: 0 },
]

const layouts: WireEl[][] = [
  [ // Landing
    { id: 'hero', x: 3, y: 15, w: 94, h: 22, type: 'image', group: 1 },
    { id: 'h1', x: 3, y: 40, w: 40, h: 2.5, type: 'text', group: 1 },
    { id: 'h2', x: 3, y: 44, w: 30, h: 1.5, type: 'text', group: 1 },
    { id: 'cL', x: 3, y: 50, w: 45, h: 20, type: 'card', group: 2 },
    { id: 'cR', x: 52, y: 50, w: 45, h: 20, type: 'card', group: 2 },
    { id: 't1', x: 6, y: 54, w: 36, h: 1, type: 'text', group: 2 },
    { id: 't2', x: 6, y: 57, w: 28, h: 1, type: 'text', group: 2 },
    { id: 't3', x: 55, y: 54, w: 36, h: 1, type: 'text', group: 2 },
    { id: 't4', x: 55, y: 57, w: 28, h: 1, type: 'text', group: 2 },
    { id: 'cta', x: 3, y: 74, w: 14, h: 4, type: 'button', group: 2 },
    { id: 'f1', x: 3, y: 82, w: 30, h: 8, type: 'card', group: 3 },
    { id: 'f2', x: 35, y: 82, w: 30, h: 8, type: 'card', group: 3 },
    { id: 'f3', x: 67, y: 82, w: 30, h: 8, type: 'card', group: 3 },
    { id: 'ft', x: 0, y: 94, w: 100, h: 6, type: 'footer', group: 3 },
  ],
  [ // Dashboard
    { id: 'hero', x: 2, y: 15, w: 18, h: 79, type: 'card', group: 1 },
    { id: 'h1', x: 5, y: 19, w: 12, h: 1.5, type: 'text', group: 1 },
    { id: 'h2', x: 5, y: 23, w: 10, h: 1.5, type: 'text', group: 1 },
    { id: 'cL', x: 24, y: 15, w: 73, h: 26, type: 'card', group: 1 },
    { id: 'cR', x: 24, y: 44, w: 50, h: 2, type: 'text', group: 2 },
    { id: 't1', x: 24, y: 49, w: 40, h: 1, type: 'text', group: 2 },
    { id: 't2', x: 24, y: 52, w: 32, h: 1, type: 'text', group: 2 },
    { id: 't3', x: 5, y: 28, w: 12, h: 1.5, type: 'text', group: 2 },
    { id: 't4', x: 5, y: 32, w: 10, h: 1.5, type: 'text', group: 2 },
    { id: 'cta', x: 24, y: 57, w: 14, h: 4, type: 'button', group: 2 },
    { id: 'f1', x: 24, y: 65, w: 35, h: 22, type: 'card', group: 3 },
    { id: 'f2', x: 62, y: 65, w: 35, h: 22, type: 'card', group: 3 },
    { id: 'f3', x: 24, y: 90, w: 73, h: 4, type: 'footer', group: 3 },
    { id: 'ft', x: 0, y: 94, w: 100, h: 6, type: 'footer', group: 3 },
  ],
  [ // Portfolio grid
    { id: 'hero', x: 25, y: 16, w: 50, h: 3, type: 'text', group: 1 },
    { id: 'h1', x: 30, y: 21, w: 40, h: 1.5, type: 'text', group: 1 },
    { id: 'h2', x: 34, y: 24, w: 32, h: 1, type: 'text', group: 1 },
    { id: 'cL', x: 3, y: 29, w: 30, h: 26, type: 'card', group: 2 },
    { id: 'cR', x: 36, y: 29, w: 30, h: 26, type: 'card', group: 2 },
    { id: 't1', x: 6, y: 33, w: 24, h: 1, type: 'text', group: 2 },
    { id: 't2', x: 6, y: 36, w: 18, h: 1, type: 'text', group: 2 },
    { id: 't3', x: 39, y: 33, w: 24, h: 1, type: 'text', group: 2 },
    { id: 't4', x: 39, y: 36, w: 18, h: 1, type: 'text', group: 2 },
    { id: 'cta', x: 69, y: 29, w: 28, h: 26, type: 'card', group: 2 },
    { id: 'f1', x: 3, y: 59, w: 30, h: 26, type: 'card', group: 3 },
    { id: 'f2', x: 36, y: 59, w: 30, h: 26, type: 'card', group: 3 },
    { id: 'f3', x: 69, y: 59, w: 28, h: 26, type: 'card', group: 3 },
    { id: 'ft', x: 0, y: 94, w: 100, h: 6, type: 'footer', group: 3 },
  ],
]

// ── Design-tool wireframe styling ──
// Mirrors TechText's dashed-outline + corner-handle vocabulary
function getClass(type: WireEl['type'], id?: string): string {
  const isAccent = id === 'ncta' || id === 'cta'
  switch (type) {
    case 'chrome': return 'border-b border-white/40'
    case 'image': return 'border border-dashed border-white/35'
    case 'text': return 'bg-white/30'
    case 'button': return isAccent
      ? 'border border-dashed border-white/70 bg-white/20'
      : 'border border-dashed border-white/50 bg-white/10'
    case 'card': return 'border border-dashed border-white/35'
    case 'footer': return 'border-t border-dashed border-white/30 bg-white/[0.06]'
  }
}

// Elements eligible for the cycling "selected" overlay
const SELECTABLE_IDS = ['hero', 'cL', 'cR', 'cta', 'f1']

// Corner handle: 5x5 solid white square, centered exactly on the corner
function Handle({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const style: React.CSSProperties = {
    position: 'absolute',
    width: 5, height: 5,
    backgroundColor: 'rgba(255,255,255,0.85)',
    zIndex: 10,
    ...(pos === 'tl' && { top: -3, left: -3 }),
    ...(pos === 'tr' && { top: -3, right: -3 }),
    ...(pos === 'bl' && { bottom: -3, left: -3 }),
    ...(pos === 'br' && { bottom: -3, right: -3 }),
  }
  return <div style={style} />
}

// Dimension label: "W x H" inside the top-left of the element
function DimLabel({ w, h }: { w: number; h: number }) {
  return (
    <div className="absolute top-[4px] left-[6px] whitespace-nowrap pointer-events-none z-10">
      <span className="text-[8px] font-mono text-white tracking-wider">
        {w} x {h}
      </span>
    </div>
  )
}

// Layout labels (Enhancement 5)
const LAYOUT_LABELS = ['Landing Page', 'Dashboard', 'Portfolio']

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="size-5 shrink-0 text-accent mt-0.5" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

function AnimatedWireframe() {
  const containerRef = useRef<HTMLDivElement>(null)
  const outerRef = useRef<HTMLDivElement>(null)
  const refs = useRef<Map<string, HTMLDivElement>>(new Map())
  const [layoutIdx, setLayoutIdx] = useState(0)
  const [ready, setReady] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const morphTlRef = useRef<gsap.core.Timeline | null>(null)

  // Enhancement 2: mouse parallax tilt
  useEffect(() => {
    const outer = outerRef.current
    if (!outer) return
    const onMove = (e: MouseEvent) => {
      const rect = outer.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const rx = ((e.clientY - cy) / rect.height) * -3 // max 3deg
      const ry = ((e.clientX - cx) / rect.width) * 3
      outer.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`
    }
    const onLeave = () => {
      outer.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)'
    }
    outer.addEventListener('mousemove', onMove)
    outer.addEventListener('mouseleave', onLeave)
    return () => {
      outer.removeEventListener('mousemove', onMove)
      outer.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  const setElRef = useCallback((id: string) => (el: HTMLDivElement | null) => {
    if (el) refs.current.set(id, el); else refs.current.delete(id)
  }, [])

  // Use layout 0 for initial render positions, GSAP handles morphing
  const initialEls = [...shared, ...layouts[0]]

  // Initial build animation
  useEffect(() => {
    const timer = setTimeout(() => {
      const tl = gsap.timeline()

      // Window dots animation
      const dots = containerRef.current?.querySelectorAll('[data-dot]')
      if (dots) {
        tl.fromTo(dots, { scale: 0 }, { scale: 1, duration: 0.3, stagger: 0.08, ease: 'back.out(2)' }, 0.4)
      }

      // URL bar
      const url = refs.current.get('url')
      if (url) {
        tl.fromTo(url, { opacity: 0, scaleX: 0 }, { opacity: 1, scaleX: 1, duration: 0.4, ease: 'power2.out' }, 0.6)
      }

      // Build elements by group with stagger
      for (let g = 0; g <= 3; g++) {
        const els = initialEls
          .filter(e => e.group === g)
          .map(e => refs.current.get(e.id))
          .filter(Boolean)
        if (els.length) {
          tl.fromTo(els,
            { opacity: 0, y: 8, scale: 0.95 },
            { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.06, ease: 'power2.out' },
            0.5 + g * 0.35
          )
        }
      }

      tl.then(() => {
        setReady(true)
      })
    }, 800)
    return () => clearTimeout(timer)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Layout morph cycle
  useEffect(() => {
    if (!ready) return
    const interval = setInterval(() => {
      setLayoutIdx(i => (i + 1) % layouts.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [ready])

  // Smooth morph animation when layout changes
  useEffect(() => {
    if (!ready) return

    // Kill any in-progress morph
    if (morphTlRef.current) morphTlRef.current.kill()

    const tl = gsap.timeline()
    morphTlRef.current = tl
    const current = layouts[layoutIdx]

    // Step 1: fade out all content elements briefly
    const contentEls = initialEls
      .filter(e => e.group > 0)
      .map(e => refs.current.get(e.id))
      .filter(Boolean)

    tl.to(contentEls, {
      opacity: 0.3,
      scale: 0.97,
      duration: 0.3,
      ease: 'power2.in',
    }, 0)

    // Step 2: move to new positions
    current.forEach((el, i) => {
      const dom = refs.current.get(el.id)
      if (!dom) return
      tl.to(dom, {
        left: `${el.x}%`,
        top: `${el.y}%`,
        width: `${el.w}%`,
        height: `${el.h}%`,
        duration: 0.7,
        ease: 'power3.inOut',
      }, 0.3 + i * 0.015)
    })

    // Step 3: fade back in
    tl.to(contentEls, {
      opacity: 1,
      scale: 1,
      duration: 0.4,
      ease: 'power2.out',
    }, 0.7)

    return () => { tl.kill() }
  }, [layoutIdx, ready]) // eslint-disable-line react-hooks/exhaustive-deps

  // Cycle through selectable elements with handles + dimension labels
  useEffect(() => {
    if (!ready) return
    let idx = 0
    setSelectedId(SELECTABLE_IDS[0])
    const interval = setInterval(() => {
      idx = (idx + 1) % SELECTABLE_IDS.length
      setSelectedId(SELECTABLE_IDS[idx])
    }, 1800)
    return () => clearInterval(interval)
  }, [ready])

  // Find current selected element's layout data for dimension label
  const currentLayout = layouts[layoutIdx]
  const allEls = [...shared, ...currentLayout]
  const selectedEl = selectedId ? allEls.find(e => e.id === selectedId) : null

  return (
    <div className="relative w-full max-w-[500px] mx-auto">
      {/* Parallax container (Enhancement 2) */}
      <div
        ref={outerRef}
        className="aspect-[4/3] [transition:transform_0.15s_ease-out] will-change-transform"
      >
        <div ref={containerRef} className="relative w-full h-full">
          {/* Browser frame: solid outer border */}
          <div className="absolute inset-0 border border-white/45" />

          {/* Window dots */}
          <div className="absolute left-[3%] top-[2.5%] flex gap-[5px]">
            <div data-dot className="w-[5px] h-[5px] border border-white/60" style={{ transform: 'scale(0)' }} />
            <div data-dot className="w-[5px] h-[5px] border border-white/60" style={{ transform: 'scale(0)' }} />
            <div data-dot className="w-[5px] h-[5px] border border-white/60" style={{ transform: 'scale(0)' }} />
          </div>

          {/* URL bar: solid border */}
          <div className="absolute left-[15%] right-[35%] top-[2.8%] h-[1.5%] border border-white/40" style={{ opacity: 0 }} ref={setElRef('url')} />

          {/* Guide lines: vertical alignment marks */}
          <div className="absolute left-[3%] top-[7%] bottom-0 w-px border-l border-dashed border-white/[0.12]" />
          <div className="absolute left-[97%] top-[7%] bottom-0 w-px border-l border-dashed border-white/[0.12]" />

          {/* Wireframe elements */}
          {initialEls.map(el => {
            const isSelected = el.id === selectedId
            return (
              <div
                key={el.id}
                ref={setElRef(el.id)}
                className={`${getClass(el.type, el.id)} transition-[box-shadow] duration-300`}
                style={{
                  position: 'absolute',
                  left: `${el.x}%`, top: `${el.y}%`, width: `${el.w}%`, height: `${el.h}%`,
                  opacity: 0,
                  boxShadow: isSelected ? '0 0 0 1px rgba(255,255,255,0.8)' : 'none',
                }}
              >
                {/* Corner handles on selected element */}
                {isSelected && (
                  <>
                    <Handle pos="tl" />
                    <Handle pos="tr" />
                    <Handle pos="bl" />
                    <Handle pos="br" />
                    {selectedEl && (
                      <DimLabel w={Math.round(selectedEl.w * 4.8)} h={Math.round(selectedEl.h * 3.6)} />
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Layout label (Enhancement 5) */}
      <div className="text-center mt-4 h-5">
        <p
          key={layoutIdx}
          className="text-xs font-medium text-white/40 tracking-wide uppercase"
          style={{ animation: 'wire-label 5s ease-in-out' }}
        >
          {LAYOUT_LABELS[layoutIdx]}
        </p>
      </div>
    </div>
  )
}

export function HeroSection({ headline, subline }: HeroSectionProps) {
  const t = useTranslations('Hero')
  const headlineText = headline ?? t('headline')
  const techTextHeadline = `${t('headlineLine1')}\n${t('headlineLine2')}`

  return (
    <MotionSection id="hero" className="relative bg-surface-subtle overflow-hidden">
      <div className="relative lg:grid lg:grid-cols-2 lg:min-h-[720px]">

        {/* Left: copy */}
        <div className="flex flex-col justify-center px-6 py-16 md:px-12 lg:px-16 xl:pl-[max(calc((100vw-90rem)/2+4rem),4rem)] xl:pr-16">
          {/* TechText headline: single canvas, two lines, one sweep */}
          <div className="h-[110px] md:h-[140px] lg:h-[160px] max-w-3xl mb-4" aria-hidden="true">
            <TechText
              text={techTextHeadline}
              fontSize={140}
              fontWeight={800}
              letterSpacing={-0.03}
              color="#18181B"
              accentColor="#1C39BB"
              reach={160}
              softness={0.5}
              strokeWidth={1.2}
              lineStyle="dashed"
              reveal="letter"
              selection={true}
              labels={true}
              draggable={false}
              sweep={true}
              specks={8}
              speed={0.6}
            />
          </div>
          {/* Hidden h1 for SEO */}
          <h1 className="sr-only">{headlineText}</h1>
          <Reveal delay={100}>
            <ul className="flex flex-col gap-3.5 mt-8">
              {[t('val1'), t('val2'), t('val3')].map((val) => (
                <li key={val} className="flex items-start gap-3">
                  <CheckIcon />
                  <p className="text-base text-secondary leading-relaxed text-pretty">{val}</p>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={200}>
            <div className="flex flex-wrap items-center gap-3 mt-10">
              <a href="#contact" className="inline-flex items-center justify-center bg-primary text-surface text-[15px] font-medium h-12 px-7 hover:bg-primary/85 [transition-duration:150ms] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">
                {t('cta')}
              </a>
              <a href="#work" className="inline-flex items-center justify-center bg-surface-muted text-primary text-[15px] font-medium h-12 px-7 hover:bg-border/60 [transition-duration:150ms] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">
                {t('ctaSecondary')}
              </a>
            </div>
          </Reveal>
        </div>

        {/* Right: blue field + animated wireframe */}
        <div className="relative max-lg:h-[280px]" aria-hidden="true">
          {/* Gradient layers */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(145deg, var(--color-accent) 0%, #0F1F6B 70%, #0A1445 100%)' }} />
          <div className="absolute inset-0 opacity-50" style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 30%, rgba(255,255,255,0.06) 100%)',
            maskImage: 'repeating-linear-gradient(90deg, black, black 5px, transparent 5px, transparent 11px)',
            WebkitMaskImage: 'repeating-linear-gradient(90deg, black, black 5px, transparent 5px, transparent 11px)',
          }} />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 30% 25%, rgba(74,108,247,0.5), transparent 65%)' }} />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 50% 50% at 75% 80%, rgba(28,57,187,0.3), transparent 60%)' }} />

          {/* Animated wireframe */}
          <div className="absolute inset-0 flex items-center py-10 lg:py-16 px-6 lg:px-0">
            <AnimatedWireframe />
          </div>
        </div>
      </div>
    </MotionSection>
  )
}
