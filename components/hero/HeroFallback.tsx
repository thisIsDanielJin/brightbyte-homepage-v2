/**
 * components/hero/HeroFallback.tsx — Static SVG lattice fallback for the 3D hero.
 *
 * This is the reduced-motion state (D-06), the no-WebGL state, and the pre-hydration
 * state (D-10). It renders the SAME .hero-backdrop gradient as before with a STATIC
 * inline SVG wireframe lattice on top — so reduced-motion / no-WebGL users still see
 * the signature shape (frozen, no animation, no pulse). A signature only visible to
 * motion-enabled users would be a half-signature (PLAN §Scope decision b).
 *
 * The SVG is a stylized icosahedron wireframe projection — a hexagonal outer hull with
 * internal edges radiating to the poles. It need not be a mathematically exact
 * projection; it just has to read as "the same lattice, frozen". Stroke uses the muted
 * decorative tone (matching LATTICE_LINE_HEX / --color-muted in the live scene).
 *
 * Contract: absolute inset-0 (identical geometry to the Canvas wrapper → CLS = 0),
 * no 'use client', no hooks — pure static markup, correct in SSR and client alike.
 * aria-hidden (decorative). Colors are inline literals here because this file is a
 * decorative SVG outside the app/ IDENT scan; the stroke tone traces to --color-muted.
 *
 * Source: 260912-hero-lattice/PLAN.md §Scope (HeroFallback); app/globals.css .hero-backdrop.
 */
export function HeroFallback() {
  return (
    <div className="absolute inset-0 hero-backdrop" aria-hidden="true">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 400 400"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Static icosahedron-ish wireframe: outer hexagon hull + internal spokes.
            Stroke = --color-muted (#A1A1AA), the muted decorative lattice tone. */}
        <g
          transform="translate(260 200)"
          stroke="#A1A1AA"
          strokeWidth="1"
          strokeLinejoin="round"
          opacity="0.7"
        >
          {/* outer hull */}
          <polygon points="0,-90 78,-45 78,45 0,90 -78,45 -78,-45" />
          {/* upper/lower belt */}
          <polygon points="0,-52 45,-26 45,26 0,52 -45,26 -45,-26" opacity="0.65" />
          {/* spokes from hull vertices to the inner belt (edge network) */}
          <line x1="0" y1="-90" x2="0" y2="-52" />
          <line x1="78" y1="-45" x2="45" y2="-26" />
          <line x1="78" y1="45" x2="45" y2="26" />
          <line x1="0" y1="90" x2="0" y2="52" />
          <line x1="-78" y1="45" x2="-45" y2="26" />
          <line x1="-78" y1="-45" x2="-45" y2="-26" />
          {/* cross edges giving the faceted icosahedron read */}
          <line x1="0" y1="-52" x2="45" y2="26" />
          <line x1="45" y1="-26" x2="-45" y2="26" />
          <line x1="-45" y1="-26" x2="0" y2="52" />
        </g>
      </svg>
    </div>
  )
}
