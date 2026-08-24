/**
 * components/hero/HeroFallback.tsx — Static CSS gradient fallback for the 3D hero.
 *
 * This IS the existing .hero-backdrop div, extracted as a named component.
 * It is the reduced-motion state (D-06), the no-WebGL state, and the
 * pre-hydration state (D-10). Reuses app/globals.css .hero-backdrop verbatim.
 * Zero new CSS, zero new assets, guaranteed CLS = 0.
 *
 * No 'use client' — pure static div, no hooks. Renders correctly in SSR and
 * client contexts alike.
 *
 * Source: HeroSection.tsx:48; app/globals.css .hero-backdrop utility.
 */
export function HeroFallback() {
  return <div className="absolute inset-0 hero-backdrop" aria-hidden="true" />
}
