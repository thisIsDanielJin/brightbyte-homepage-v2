/**
 * components/hero/HeroVisualSwitcher.tsx — Carousel to preview hero visual options.
 *
 * Silk-first, then similar organic/flowing alternatives.
 * Arrow buttons cycle through options. Label shows the current component name.
 */
'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'

const SilkVisual = dynamic(() => import('./options/Silk'), { ssr: false })
const StrandsVisual = dynamic(() => import('./Strands'), { ssr: false })
const LiquidChromeVisual = dynamic(() => import('./options/LiquidChrome').then((m) => ({ default: m.LiquidChrome })), { ssr: false })
const PlasmaVisual = dynamic(() => import('./options/Plasma').then((m) => ({ default: m.Plasma })), { ssr: false })
const OrbVisual = dynamic(() => import('./options/Orb'), { ssr: false })
const ThreadsVisual = dynamic(() => import('./options/Threads'), { ssr: false })
const WavesVisual = dynamic(() => import('./options/Waves'), { ssr: false })

interface VisualOption {
  name: string
  desc: string
  render: () => React.ReactNode
}

const OPTIONS: VisualOption[] = [
  {
    name: 'Silk',
    desc: 'Flowing fabric, organic and premium',
    render: () => (
      <SilkVisual speed={3} scale={1} color="#1C39BB" noiseIntensity={2} rotation={0} />
    ),
  },
  {
    name: 'Silk (darker)',
    desc: 'Deeper blue, slower motion',
    render: () => (
      <SilkVisual speed={2} scale={1.2} color="#0F1F6B" noiseIntensity={1.8} rotation={15} />
    ),
  },
  {
    name: 'Silk (light)',
    desc: 'Lighter, more ethereal',
    render: () => (
      <SilkVisual speed={2.5} scale={0.8} color="#3B5BDB" noiseIntensity={2.5} rotation={-10} />
    ),
  },
  {
    name: 'Liquid Chrome',
    desc: 'Reflective metallic surface',
    render: () => (
      <LiquidChromeVisual
        baseColor={[0.1, 0.15, 0.4]}
        speed={0.15}
        amplitude={0.4}
        frequencyX={3}
        frequencyY={2}
        interactive={false}
      />
    ),
  },
  {
    name: 'Plasma',
    desc: 'Glowing energy field',
    render: () => (
      <PlasmaVisual color="#1C39BB" speed={3} scale={0.8} />
    ),
  },
  {
    name: 'Orb',
    desc: 'Luminous sphere, mouse-reactive',
    render: () => (
      <OrbVisual hue={230} hoverIntensity={0.3} rotateOnHover={false} forceHoverState={false} />
    ),
  },
  {
    name: 'Strands',
    desc: 'Luminous flowing strands',
    render: () => (
      <StrandsVisual
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
    ),
  },
  {
    name: 'Threads',
    desc: 'Geometric thread lines',
    render: () => (
      <ThreadsVisual color={[0.11, 0.22, 0.73]} amplitude={1.2} distance={0.8} />
    ),
  },
  {
    name: 'Waves',
    desc: 'Flowing line waves',
    render: () => (
      <WavesVisual
        lineColor="rgba(28, 57, 187, 0.35)"
        backgroundColor="#0F0F10"
        waveSpeedX={0.015}
        waveSpeedY={0.005}
        waveAmpX={40}
        waveAmpY={20}
        xGap={14}
        yGap={18}
      />
    ),
  },
]

export function HeroVisualSwitcher() {
  const [idx, setIdx] = useState(0)
  const option = OPTIONS[idx]

  const prev = useCallback(() => setIdx((i) => (i - 1 + OPTIONS.length) % OPTIONS.length), [])
  const next = useCallback(() => setIdx((i) => (i + 1) % OPTIONS.length), [])

  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface-dark md:aspect-[4/5] lg:aspect-square">
      {/* Active visual */}
      <div key={idx} className="absolute inset-0">
        {option.render()}
      </div>

      {/* Controls overlay */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between px-5 py-4 bg-gradient-to-t from-[rgba(0,0,0,0.6)] to-transparent pointer-events-none">
        <button
          onClick={prev}
          className="text-on-dark/70 hover:text-on-dark p-2 transition-colors pointer-events-auto"
          aria-label="Previous option"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div className="text-center">
          <p className="text-[10px] font-medium text-on-dark/50 uppercase tracking-[0.15em]">
            {idx + 1} / {OPTIONS.length}
          </p>
          <p className="text-sm font-medium text-on-dark">
            {option.name}
          </p>
          <p className="text-[11px] text-on-dark/50 mt-0.5">
            {option.desc}
          </p>
        </div>

        <button
          onClick={next}
          className="text-on-dark/70 hover:text-on-dark p-2 transition-colors pointer-events-auto"
          aria-label="Next option"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  )
}
