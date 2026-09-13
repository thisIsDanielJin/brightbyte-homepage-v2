/**
 * components/hero/HeroFallback.tsx — Static SVG node-grid fallback for the 3D hero.
 *
 * This is the reduced-motion state (D-06), the no-WebGL state, and the pre-hydration
 * state (D-10). It renders the SAME .hero-backdrop gradient as before with a STATIC
 * inline SVG node grid on top — a frozen version of the point-cloud hero, so
 * reduced-motion / no-WebGL users still see the signature "structured data / node field"
 * shape (frozen, no animation, no wave). A signature only visible to motion-enabled
 * users would be a half-signature (PLAN §Scope decision b, carried from the lattice).
 *
 * The SVG is a loose grid of dots with slight per-dot offset — the static echo of the
 * jittered point cloud. It need not match the live grid dims exactly; it just has to
 * read as "the same node field, frozen." Fill uses the muted decorative tone (matching
 * the point cloud's base tone / LATTICE_LINE_HEX / --color-muted).
 *
 * Contract: absolute inset-0 (identical geometry to the Canvas wrapper → CLS = 0),
 * no 'use client', no hooks — pure static markup, correct in SSR and client alike.
 * aria-hidden (decorative). Colors are inline literals here because this file is a
 * decorative SVG outside the app/ IDENT scan; the fill tone traces to --color-muted.
 *
 * Source: 260913-point-cloud-hero/PLAN.md §Scope (HeroFallback); app/globals.css .hero-backdrop.
 */

// A frozen node grid: a small COLS×ROWS lattice of dots with a deterministic slight
// offset per dot (the static echo of the animated cloud's jitter). Built at module load
// from a hashed-index pseudo-random so the markup is stable across renders — no hooks,
// no Math.random at render time.
const FALLBACK_COLS = 16
const FALLBACK_ROWS = 9
const FALLBACK_SPACING = 26 // SVG user units between grid nodes
const FALLBACK_JITTER = 5 // max per-dot offset in SVG units

const rand = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return s - Math.floor(s)
}

const DOTS: Array<{ cx: number; cy: number; r: number }> = []
{
  // Center the grid within the 400×400 viewBox. As a full-width background the frozen
  // field is centered (mirrors the live cloud's centered background placement), not
  // offset right-of-center.
  const gridW = (FALLBACK_COLS - 1) * FALLBACK_SPACING
  const gridH = (FALLBACK_ROWS - 1) * FALLBACK_SPACING
  const originX = 200 - gridW / 2 // centered
  const originY = 200 - gridH / 2
  let i = 0
  for (let y = 0; y < FALLBACK_ROWS; y++) {
    for (let x = 0; x < FALLBACK_COLS; x++) {
      const jx = (rand(i * 3 + 0) - 0.5) * 2 * FALLBACK_JITTER
      const jy = (rand(i * 3 + 1) - 0.5) * 2 * FALLBACK_JITTER
      // Round to 3 decimals: the raw hashed-random floats differ in their last digits
      // between the Node (SSR) and browser (hydration) JS engines, tripping a React
      // hydration mismatch. Rounding makes both emit an identical string (sub-pixel, so
      // no visual change). D-11 CLS=0 preserved.
      DOTS.push({
        cx: Math.round((originX + x * FALLBACK_SPACING + jx) * 1000) / 1000,
        cy: Math.round((originY + y * FALLBACK_SPACING + jy) * 1000) / 1000,
        r: 3.2,
      })
      i++
    }
  }
}

export function HeroFallback() {
  return (
    <div className="absolute inset-0 hero-backdrop" aria-hidden="true">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 400 400"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Static node grid: the frozen point cloud. Fill = --color-muted (#A1A1AA),
            the muted decorative tone the live cloud uses for resting nodes. Low opacity
            matches the resting field (quiet — the wave is the only bold moment, absent here). */}
        <g fill="#A1A1AA" opacity="0.55">
          {DOTS.map((d, idx) => (
            <circle key={idx} cx={d.cx} cy={d.cy} r={d.r} />
          ))}
        </g>
      </svg>
    </div>
  )
}
