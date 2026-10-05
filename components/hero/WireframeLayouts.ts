/**
 * components/hero/WireframeLayouts.ts — Detailed website wireframe layouts.
 *
 * Key design decisions:
 * - Clear exclusion zone in the center (-0.6 to 0.6 Y range) so headline is readable
 * - Browser frame is the outermost element, prominent
 * - Wireframe shifted slightly down (+0.1 offset) to clear the sticky header
 * - All content elements stay OUTSIDE the center text zone
 * - Image placeholders get diagonal crosses (classic wireframe language)
 */

export interface WireframeElement {
  x: number
  y: number
  w: number
  h: number
  type: 'rect' | 'line' | 'image' | 'nav-item' | 'button' | 'text-line' | 'frame' | 'address-bar'
}

export interface WireframeLayout {
  name: string
  elements: WireframeElement[]
}

// Frame dimensions and vertical offset (pushed down to clear header)
const FW = 5.4, FH = 3.8
const OY = -0.3 // shift down more to clear sticky header

// Center exclusion zone: no wireframe elements between Y = -0.5 and Y = 0.5
// This keeps the headline area clean and readable

function textLines(cx: number, startY: number, width: number, count: number, gap = 0.09): WireframeElement[] {
  return Array.from({ length: count }, (_, i) => ({
    x: cx - (i === count - 1 ? width * 0.12 : 0),
    y: startY - i * gap + OY,
    w: width - (i === count - 1 ? width * 0.25 : 0),
    h: 0.018,
    type: 'text-line' as const,
  }))
}

function navItems(y: number, count: number, spacing = 0.42): WireframeElement[] {
  const totalW = (count - 1) * spacing
  return Array.from({ length: count }, (_, i) => ({
    x: -totalW / 2 + i * spacing + 1.2,
    y: y + OY,
    w: 0.28,
    h: 0.055,
    type: 'nav-item' as const,
  }))
}

// ── Shared top elements (browser chrome) ──
const browserChrome: WireframeElement[] = [
  // Outer browser frame
  { x: 0, y: OY, w: FW, h: FH, type: 'frame' },
  // Address bar
  { x: 0, y: FH / 2 - 0.1 + OY, w: FW - 0.15, h: 0.14, type: 'address-bar' },
  // Three dots (window controls) - represented as tiny rects
  { x: -FW / 2 + 0.22, y: FH / 2 - 0.1 + OY, w: 0.04, h: 0.04, type: 'rect' },
  { x: -FW / 2 + 0.32, y: FH / 2 - 0.1 + OY, w: 0.04, h: 0.04, type: 'rect' },
  { x: -FW / 2 + 0.42, y: FH / 2 - 0.1 + OY, w: 0.04, h: 0.04, type: 'rect' },
  // URL text placeholder
  { x: 0, y: FH / 2 - 0.1 + OY, w: 1.8, h: 0.035, type: 'text-line' },
  // Logo (below address bar, left)
  { x: -FW / 2 + 0.45, y: FH / 2 - 0.34 + OY, w: 0.45, h: 0.07, type: 'rect' },
]

// ── Layout 1: Landing Page ──
const landing: WireframeLayout = {
  name: 'landing',
  elements: [
    ...browserChrome,
    ...navItems(FH / 2 - 0.34, 4),
    // TOP ZONE (above headline)
    { x: -1.2, y: 1.35 + OY, w: 2.1, h: 0.22, type: 'rect' },    // hero block left
    { x: 1.2, y: 1.35 + OY, w: 2.1, h: 0.22, type: 'rect' },     // hero block right
    // BOTTOM ZONE (below center exclusion: Y < -0.6)
    ...textLines(-1.1, -0.85, 1.9, 3),                              // left text column
    ...textLines(1.1, -0.85, 1.9, 3),                               // right text column
    { x: 0, y: -1.15 + OY, w: 0.7, h: 0.13, type: 'button' },   // CTA
    { x: -1.2, y: -1.5 + OY, w: 2.1, h: 0.3, type: 'rect' },    // feature card left
    { x: 1.2, y: -1.5 + OY, w: 2.1, h: 0.3, type: 'rect' },     // feature card right
    ...textLines(-1.2, -1.42, 1.5, 2, 0.07),
    ...textLines(1.2, -1.42, 1.5, 2, 0.07),
    { x: 0, y: -FH / 2 + 0.08 + OY, w: FW - 0.15, h: 0.04, type: 'text-line' }, // footer
  ],
}

// ── Layout 2: Sidebar Layout ──
const sidebar: WireframeLayout = {
  name: 'sidebar',
  elements: [
    ...browserChrome,
    ...navItems(FH / 2 - 0.34, 4),
    // Sidebar (left, full height below nav, OUTSIDE center)
    { x: -1.95, y: -0.15 + OY, w: 1.1, h: 2.8, type: 'rect' },
    // Sidebar items
    ...Array.from({ length: 6 }, (_, i) => ({
      x: -1.95 as number, y: (1.05 - i * 0.2) + OY, w: 0.75, h: 0.04,
      type: 'text-line' as const,
    })),
    // TOP: main content image (stays above center)
    { x: 0.6, y: 1.15 + OY, w: 3.1, h: 0.35, type: 'image' },
    // BOTTOM: content rows (below center)
    ...textLines(0.6, -0.85, 2.8, 4),
    { x: -0.15, y: -1.2 + OY, w: 1.4, h: 0.45, type: 'rect' },    // card 1
    { x: 1.35, y: -1.2 + OY, w: 1.4, h: 0.45, type: 'rect' },     // card 2
    ...textLines(-0.15, -1.08, 1.0, 2, 0.07),
    ...textLines(1.35, -1.08, 1.0, 2, 0.07),
    { x: 0, y: -FH / 2 + 0.08 + OY, w: FW - 0.15, h: 0.04, type: 'text-line' },
  ],
}

// ── Layout 3: Card Grid ──
const grid: WireframeLayout = {
  name: 'grid',
  elements: [
    ...browserChrome,
    ...navItems(FH / 2 - 0.34, 4),
    // TOP: heading (stays above center)
    { x: 0, y: 1.25 + OY, w: 2.2, h: 0.07, type: 'text-line' },
    { x: 0, y: 1.12 + OY, w: 1.6, h: 0.04, type: 'text-line' },
    // BOTTOM: 3x2 card grid (all below center)
    ...[-1.5, 0, 1.5].flatMap((cx) =>
      [-0.0, -0.9].flatMap((cy): WireframeElement[] => [
        { x: cx, y: cy + OY, w: 1.35, h: 0.85, type: 'rect' },
        { x: cx, y: cy + 0.2 + OY, w: 1.15, h: 0.3, type: 'image' },
        ...textLines(cx, cy - 0.18 + OY - OY, 0.95, 2, 0.07),  // undo double OY
      ]),
    ),
    { x: 0, y: -FH / 2 + 0.08 + OY, w: FW - 0.15, h: 0.04, type: 'text-line' },
  ],
}

// ── Layout 4: Blog / Editorial ──
const editorial: WireframeLayout = {
  name: 'editorial',
  elements: [
    ...browserChrome,
    ...navItems(FH / 2 - 0.34, 4),
    // TOP: wide featured image
    { x: 0, y: 1.0 + OY, w: 4.6, h: 0.55, type: 'image' },
    // BOTTOM: narrow article column
    { x: 0, y: 0.5 + OY, w: 2.4, h: 0.07, type: 'text-line' },    // article title
    ...textLines(0, -0.6, 2.8, 5, 0.09),                            // body paragraphs
    { x: 0, y: -1.2 + OY, w: 1.2, h: 0.03, type: 'text-line' },   // divider
    ...textLines(0, -1.35, 2.8, 2, 0.09),                           // more text
    // Author
    { x: -0.25, y: -1.6 + OY, w: 0.12, h: 0.12, type: 'rect' },   // avatar
    { x: 0.15, y: -1.58 + OY, w: 0.6, h: 0.035, type: 'text-line' }, // name
    { x: 0.15, y: -1.65 + OY, w: 0.4, h: 0.025, type: 'text-line' }, // date
    { x: 0, y: -FH / 2 + 0.08 + OY, w: FW - 0.15, h: 0.04, type: 'text-line' },
  ],
}

export const LAYOUTS: WireframeLayout[] = [landing, sidebar, grid, editorial]
export const MAX_ELEMENTS = Math.max(...LAYOUTS.map((l) => l.elements.length))
