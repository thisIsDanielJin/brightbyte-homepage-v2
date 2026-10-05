/**
 * components/hero/WireframeScene.tsx — Detailed animated website wireframe.
 *
 * Renders a realistic wireframe inside a browser-frame boundary:
 * - Rectangles for layout blocks
 * - Diagonal crosses for image placeholders
 * - Thin lines for text placeholders
 * - Nav item pills
 * - Button outlines
 * - Blue accent crosses (+) at structural corners
 *
 * Builds outward from center, morphs between 4 layouts every 5s.
 * Mouse-driven perspective tilt. Contained, doesn't reach hero edges.
 */
'use client'

import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { LAYOUTS, MAX_ELEMENTS, type WireframeElement } from './WireframeLayouts'

const MORPH_DURATION = 1.5
const HOLD_DURATION = 5
const BUILD_START = 1.0
const BUILD_STAGGER = 0.06
const CROSS_SIZE = 0.04
const LINE_COLOR = '#18181B'
const LINE_OPACITY = 0.3
const FRAME_OPACITY = 0.65
const ADDRESSBAR_OPACITY = 0.45
const ACCENT_COLOR = '#1C39BB'

function easeOutCubic(t: number) { return 1 - Math.pow(1 - t, 3) }
function easeInOutCubic(t: number) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2 }

/** Create a THREE.Line from a list of [x,y] points */
function makeLine(points: [number, number][], color: string, opacity: number): THREE.Line {
  const geo = new THREE.BufferGeometry()
  const positions = new Float32Array(points.length * 3)
  points.forEach(([x, y], i) => { positions[i * 3] = x; positions[i * 3 + 1] = y; positions[i * 3 + 2] = 0 })
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity })
  return new THREE.Line(geo, mat)
}

/** Build geometry for a single wireframe element */
function buildElementLines(el: WireframeElement): THREE.Line[] {
  const hw = el.w / 2, hh = el.h / 2
  const x = el.x, y = el.y
  const lines: THREE.Line[] = []
  const opacity = el.type === 'frame' ? FRAME_OPACITY : LINE_OPACITY
  const color = LINE_COLOR

  switch (el.type) {
    case 'address-bar':
      // Address bar with slightly more presence
      lines.push(makeLine([
        [x - hw, y - hh], [x + hw, y - hh], [x + hw, y + hh], [x - hw, y + hh], [x - hw, y - hh],
      ], color, ADDRESSBAR_OPACITY))
      break

    case 'frame':
    case 'rect':
    case 'button':
    case 'nav-item':
      // Closed rectangle
      lines.push(makeLine([
        [x - hw, y - hh], [x + hw, y - hh], [x + hw, y + hh], [x - hw, y + hh], [x - hw, y - hh],
      ], color, opacity))
      break

    case 'image':
      // Rectangle + diagonal crosses (the classic wireframe image placeholder)
      lines.push(makeLine([
        [x - hw, y - hh], [x + hw, y - hh], [x + hw, y + hh], [x - hw, y + hh], [x - hw, y - hh],
      ], color, opacity))
      lines.push(makeLine([[x - hw, y - hh], [x + hw, y + hh]], color, opacity * 0.5))
      lines.push(makeLine([[x + hw, y - hh], [x - hw, y + hh]], color, opacity * 0.5))
      break

    case 'text-line':
      // Single horizontal line
      lines.push(makeLine([[x - hw, y], [x + hw, y]], color, opacity * 0.7))
      break
  }

  return lines
}

/** A single animated wireframe element */
function AnimatedElement({
  index,
  currentEl,
  prevEl,
  morphProgress,
  buildDelay,
}: {
  index: number
  currentEl: WireframeElement | null
  prevEl: WireframeElement | null
  morphProgress: number
  buildDelay: number
}) {
  const groupRef = useRef<THREE.Group>(null)
  const linesRef = useRef<THREE.Line[]>([])

  // Build lines for the current element type
  const lines = useMemo(() => {
    const el = currentEl || prevEl
    if (!el) return []
    // Build at origin, we'll position via the group
    const centered = { ...el, x: 0, y: 0 }
    return buildElementLines(centered)
  }, [currentEl?.type, prevEl?.type])

  // Add lines to group on mount
  useEffect(() => {
    const group = groupRef.current
    if (!group) return
    // Clear old
    linesRef.current.forEach((l) => group.remove(l))
    linesRef.current = []
    // Add new
    lines.forEach((l) => {
      group.add(l)
      linesRef.current.push(l)
    })
    return () => {
      linesRef.current.forEach((l) => group.remove(l))
      linesRef.current = []
    }
  }, [lines])

  useFrame((state) => {
    if (!groupRef.current) return

    const buildT = Math.max(0, Math.min(1, (state.clock.elapsedTime - buildDelay) * 1.5))
    const buildEase = easeOutCubic(buildT)
    const morphT = easeInOutCubic(morphProgress)

    // Interpolate position and size
    let el: WireframeElement | null = null
    if (prevEl && currentEl) {
      el = {
        x: THREE.MathUtils.lerp(prevEl.x, currentEl.x, morphT),
        y: THREE.MathUtils.lerp(prevEl.y, currentEl.y, morphT),
        w: THREE.MathUtils.lerp(prevEl.w, currentEl.w, morphT),
        h: THREE.MathUtils.lerp(prevEl.h, currentEl.h, morphT),
        type: currentEl.type,
      }
    } else if (currentEl) {
      el = currentEl
    } else if (prevEl) {
      el = prevEl
    }

    if (!el || buildEase <= 0) {
      groupRef.current.visible = false
      return
    }

    groupRef.current.visible = true

    // Position from center (build animation scales outward)
    groupRef.current.position.set(el.x * buildEase, el.y * buildEase, 0)

    // Scale for build animation
    const scaleX = (el.w / (currentEl?.w || prevEl?.w || 1)) * buildEase
    const scaleY = (el.h / (currentEl?.h || prevEl?.h || 1)) * buildEase
    groupRef.current.scale.set(scaleX || buildEase, scaleY || buildEase, 1)

    // Opacity
    const targetOpacity = currentEl ? buildEase : (1 - morphT)
    linesRef.current.forEach((l) => {
      const baseMat = l.material as THREE.LineBasicMaterial
      baseMat.opacity = baseMat.opacity > 0 ? targetOpacity * (el!.type === 'frame' ? FRAME_OPACITY : LINE_OPACITY) : 0
    })
  })

  return <group ref={groupRef} />
}

/** Construction crosshair from center */
function ConstructionCross() {
  const hLine = useMemo(() => makeLine([[-3, 0], [3, 0]], LINE_COLOR, 0), [])
  const vLine = useMemo(() => makeLine([[0, -2.5], [0, 2.5]], LINE_COLOR, 0), [])

  useFrame((state) => {
    const t = Math.max(0, Math.min(1, (state.clock.elapsedTime - 0.8) * 1.5))
    const ease = easeOutCubic(t)
    hLine.scale.x = ease
    ;(hLine.material as THREE.LineBasicMaterial).opacity = ease * 0.035
    vLine.scale.y = ease
    ;(vLine.material as THREE.LineBasicMaterial).opacity = ease * 0.035
  })

  return (
    <>
      <primitive object={hLine} />
      <primitive object={vLine} />
    </>
  )
}

/** Blue accent cross (+) at a corner */
function AccentCross({ el, buildDelay, morphProgress, prevEl }: {
  el: WireframeElement | null
  prevEl: WireframeElement | null
  buildDelay: number
  morphProgress: number
}) {
  const groupRef = useRef<THREE.Group>(null)
  const s = CROSS_SIZE
  const hLine = useMemo(() => makeLine([[-s, 0], [s, 0]], ACCENT_COLOR, 0.5), [])
  const vLine = useMemo(() => makeLine([[0, -s], [0, s]], ACCENT_COLOR, 0.5), [])

  useFrame((state) => {
    if (!groupRef.current) return
    const buildT = Math.max(0, Math.min(1, (state.clock.elapsedTime - buildDelay - 0.2) * 2))
    const morphT = easeInOutCubic(morphProgress)

    const target = (prevEl && el)
      ? { x: THREE.MathUtils.lerp(prevEl.x, el.x, morphT), y: THREE.MathUtils.lerp(prevEl.y, el.y, morphT), w: THREE.MathUtils.lerp(prevEl.w, el.w, morphT), h: THREE.MathUtils.lerp(prevEl.h, el.h, morphT) }
      : el || prevEl

    if (!target || buildT <= 0) { groupRef.current.visible = false; return }
    groupRef.current.visible = true
    const be = easeOutCubic(buildT)
    groupRef.current.position.set((target.x + target.w / 2) * be, (target.y + target.h / 2) * be, 0)
    groupRef.current.scale.setScalar(be)
  })

  return (
    <group ref={groupRef} visible={false}>
      <primitive object={hLine} />
      <primitive object={vLine} />
    </group>
  )
}

/** Mouse perspective tilt */
function MousePerspective({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (!groupRef.current) return
    const targetY = state.pointer.x * 0.04
    const targetX = -state.pointer.y * 0.025 + 0.04
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetY, 0.04)
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetX, 0.04)
  })
  return <group ref={groupRef}>{children}</group>
}

/** Main scene */
function SceneContent() {
  const [layoutIdx, setLayoutIdx] = useState(0)
  const [prevIdx, setPrevIdx] = useState(0)
  const [morphing, setMorphing] = useState(false)
  const morphStartRef = useRef(0)
  const [morphProgress, setMorphProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setPrevIdx(layoutIdx)
      setLayoutIdx((i) => (i + 1) % LAYOUTS.length)
      setMorphing(true)
      morphStartRef.current = performance.now()
    }, (HOLD_DURATION + MORPH_DURATION) * 1000)
    return () => clearInterval(interval)
  }, [layoutIdx])

  useFrame(() => {
    if (morphing) {
      const elapsed = (performance.now() - morphStartRef.current) / 1000
      const p = Math.min(1, elapsed / MORPH_DURATION)
      setMorphProgress(p)
      if (p >= 1) { setMorphing(false); setMorphProgress(0); setPrevIdx(layoutIdx) }
    }
  })

  const currentEls = LAYOUTS[layoutIdx].elements
  const prevEls = LAYOUTS[prevIdx].elements

  const padded = (arr: WireframeElement[]) => {
    const result: (WireframeElement | null)[] = [...arr]
    while (result.length < MAX_ELEMENTS) result.push(null)
    return result
  }

  const paddedCurrent = useMemo(() => padded(currentEls), [currentEls])
  const paddedPrev = useMemo(() => padded(prevEls), [prevEls])

  // Pick elements for accent crosses: frame corners (skip frame itself and text-lines)
  const crossIndices = useMemo(() => {
    return currentEls
      .map((el, i) => ({ el, i }))
      .filter(({ el }) => el.type === 'rect' || el.type === 'image')
      .slice(0, 4)
      .map(({ i }) => i)
  }, [currentEls])

  return (
    <MousePerspective>
      <ConstructionCross />
      {paddedCurrent.map((_, i) => (
        <AnimatedElement
          key={i}
          index={i}
          currentEl={paddedCurrent[i]}
          prevEl={paddedPrev[i]}
          morphProgress={morphing ? morphProgress : 0}
          buildDelay={BUILD_START + i * BUILD_STAGGER}
        />
      ))}
      {crossIndices.map((idx) => (
        <AccentCross
          key={`cross-${idx}`}
          el={paddedCurrent[idx]}
          prevEl={paddedPrev[idx]}
          buildDelay={BUILD_START + idx * BUILD_STAGGER}
          morphProgress={morphing ? morphProgress : 0}
        />
      ))}
    </MousePerspective>
  )
}

export function WireframeCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6.2], fov: 36 }}
      gl={{ antialias: true, alpha: true }}
      style={{ position: 'absolute', inset: 0, background: 'transparent' }}
      dpr={[1, 2]}
    >
      <SceneContent />
    </Canvas>
  )
}
