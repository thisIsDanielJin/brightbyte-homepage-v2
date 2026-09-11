/**
 * components/hero/LatticeMesh.tsx — Bright Lattice: a wireframe icosahedron whose
 * EDGES are the object, with a single accent-colored pulse traveling the edge network.
 *
 * SCENE CONTRACT:
 *   - Geometry: IcosahedronGeometry(1, LATTICE_DETAIL) → EdgesGeometry → <lineSegments>
 *     with LineBasicMaterial (unlit). Detail 1 = a clean, readable edge network.
 *   - Line tone: LATTICE_LINE_HEX (muted decorative gray from --color-muted) — quiet.
 *   - The pulse (the ONE bold element): a small accent-colored sphere <mesh> that walks
 *     the ordered edge list. EdgesGeometry emits its position attribute as consecutive
 *     vertex PAIRS (a,b, a,b, …) — one pair per visible edge. In useFrame the sphere
 *     lerps from a→b by `t` advanced at PULSE_SPEED; at t≥1 it wraps to the next edge
 *     (modulo edge count) and resets t. Accent color from ACCENT_HEX, unlit MeshBasicMaterial.
 *   - Motion: slow single-axis Y rotation (ROTATION_SPEED) + a whisper of X tilt
 *     (TILT_SPEED) so it is not a flat spin (D-04).
 *   - NO lights: LineBasicMaterial and MeshBasicMaterial are unlit by design. The three
 *     ambient/directional/point lights from the glass scene are removed (nothing to light).
 *   - NO postprocess/bloom pass (D-12 budget). The pulse reads bold from color + saturation
 *     alone; a soft-glow sprite could be added later but is intentionally omitted for now.
 *   - Responsive placement (UI-SPEC): desktop focal mass right-of-center (~65-70%);
 *     mobile centered + pushed back. Picked from the live canvas width via useThree.
 *
 * DRAW-CALL BUDGET (D-12): this scene issues ~2 draw calls — one for the <lineSegments>
 * wireframe and one for the pulse <mesh>. That is far under the perf-gate's < ~10 target
 * and dramatically cheaper than the glass it replaces (which ran per-frame transmission
 * passes into an offscreen buffer). Crisp at any dpr because lines need no buffer.
 *
 * IDENT-01: All hex values are named constants from constants.ts. No raw hex here.
 *
 * Source: 260912-hero-lattice/PLAN.md §Scope + §Notes; 05-UI-SPEC.md Responsive Contract.
 */
'use client'

import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { EdgesGeometry, IcosahedronGeometry, Vector3 } from 'three'
import type { Group, Mesh } from 'three'
import {
  ACCENT_HEX,
  LATTICE_LINE_HEX,
  LATTICE_DETAIL,
  PULSE_SPEED,
  PULSE_SIZE,
  ROTATION_SPEED,
  TILT_SPEED,
  LATTICE_BREAKPOINT_PX,
  LATTICE_POSITION_DESKTOP,
  LATTICE_POSITION_MOBILE,
  LATTICE_SCALE_DESKTOP,
  LATTICE_SCALE_MOBILE,
} from './constants'

export function LatticeMesh() {
  const groupRef = useRef<Group>(null)
  const pulseRef = useRef<Mesh>(null)
  // Progress along the current edge [0,1) and the index into the edge list. Kept in a
  // ref (not state) so advancing the pulse never triggers a React re-render (D-05 keeps
  // the frameloop lean; per-move handlers must do no React work).
  const progress = useRef(0)
  const edgeIndex = useRef(0)

  // Build the wireframe geometry once and derive the ordered edge vertex-pair list from
  // its position attribute. EdgesGeometry stores each edge as two consecutive vertices,
  // so positions come in groups of 6 floats (a.xyz, b.xyz) → one [a,b] pair per edge.
  const { edgesGeometry, edges } = useMemo(() => {
    const base = new IcosahedronGeometry(1, LATTICE_DETAIL)
    const eg = new EdgesGeometry(base)
    base.dispose() // the solid geometry is only a scaffold for the edge extraction
    const pos = eg.attributes.position
    const pairs: Array<[Vector3, Vector3]> = []
    for (let i = 0; i < pos.count; i += 2) {
      pairs.push([
        new Vector3(pos.getX(i), pos.getY(i), pos.getZ(i)),
        new Vector3(pos.getX(i + 1), pos.getY(i + 1), pos.getZ(i + 1)),
      ])
    }
    return { edgesGeometry: eg, edges: pairs }
  }, [])

  // Read the live canvas width to pick desktop vs mobile placement. LATTICE_BREAKPOINT_PX
  // only splits the two placement guardrails; scale responds to the chosen guardrail.
  const width = useThree((s) => s.size.width)
  const isMobile = width < LATTICE_BREAKPOINT_PX
  const position = isMobile ? LATTICE_POSITION_MOBILE : LATTICE_POSITION_DESKTOP
  const scale = isMobile ? LATTICE_SCALE_MOBILE : LATTICE_SCALE_DESKTOP

  useFrame(() => {
    // Slow rotation (D-04) with a whisper of X tilt so the spin is not flat.
    if (groupRef.current) {
      groupRef.current.rotation.y += ROTATION_SPEED
      groupRef.current.rotation.x += TILT_SPEED
    }

    // Advance the pulse along the current edge; wrap to the next edge at t≥1.
    if (pulseRef.current && edges.length > 0) {
      progress.current += PULSE_SPEED
      if (progress.current >= 1) {
        progress.current -= 1
        edgeIndex.current = (edgeIndex.current + 1) % edges.length
      }
      const [a, b] = edges[edgeIndex.current]
      // pulse is a child of the rotating group, so lerping in the group's local space
      // makes it ride the wireframe as the whole lattice rotates.
      pulseRef.current.position.lerpVectors(a, b, progress.current)
    }
  })

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* The edge network — the object itself. Unlit LineBasicMaterial, muted tone. */}
      <lineSegments geometry={edgesGeometry}>
        <lineBasicMaterial color={LATTICE_LINE_HEX} transparent opacity={0.85} />
      </lineSegments>

      {/* The pulse — the single bold accent element. Unlit basic material (no lights). */}
      <mesh ref={pulseRef}>
        <sphereGeometry args={[PULSE_SIZE, 12, 12]} />
        <meshBasicMaterial color={ACCENT_HEX} />
      </mesh>
    </group>
  )
}
