/**
 * tests/sections/hero.spec.ts — Hero section render + screenshot QA
 *
 * Covers SEC-01, SEC-10 (hero at 375px + 1440px in DE + EN).
 * Verifies:
 *   - #hero is visible
 *   - Hero headline text node is non-empty (Sanity copy or fallback)
 *   - Screenshot captured per locale × viewport combination
 *
 * Screenshots land in tests/screenshots/ for visual critique (QA-01/QA-02 loop).
 */
import { test, expect } from '@playwright/test'
import * as fs from 'node:fs'
import sharp from 'sharp'

// ── WCAG contrast helpers (D-08 rendered-glass legibility gate) ────────────────
// Text token colors are IMMUTABLE (UI-SPEC — type is fixed). We sample the ACTUAL
// rendered composite background behind each copy element from a screenshot and
// assert the WCAG 2.x contrast ratio ≥ 4.5:1. The threshold is NOT weakened.
const TEXT_PRIMARY: [number, number, number] = [0x18, 0x18, 0x1b] // headline  #18181B
const TEXT_SECONDARY: [number, number, number] = [0x52, 0x52, 0x5b] // subline   #52525B
const TEXT_SURFACE: [number, number, number] = [0xff, 0xff, 0xff] // CTA fg     #FFFFFF
const ACCENT: [number, number, number] = [0x1c, 0x39, 0xbb] // CTA bg     #1C39BB

function srgbToLinear(c: number): number {
  const s = c / 255
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}
function relLuminance([r, g, b]: [number, number, number]): number {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b)
}
function contrastRatio(fg: [number, number, number], bg: [number, number, number]): number {
  const l1 = relLuminance(fg)
  const l2 = relLuminance(bg)
  const [lighter, darker] = l1 >= l2 ? [l1, l2] : [l2, l1]
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Sample the mean rendered pixel color of a screenshot buffer within a device-pixel
 * rectangle (the copy element's bounding box scaled by DPR). Averaging over the box
 * gives the effective composite background the glass produces behind the text — the
 * exact surface WCAG cares about (not a single-pixel spot which could hit a glyph).
 */
async function sampleMeanColor(
  png: Buffer,
  box: { x: number; y: number; width: number; height: number },
  dpr: number
): Promise<[number, number, number]> {
  const meta = await sharp(png).metadata()
  const imgW = meta.width ?? 0
  const imgH = meta.height ?? 0
  const left = Math.max(0, Math.min(imgW - 1, Math.round(box.x * dpr)))
  const top = Math.max(0, Math.min(imgH - 1, Math.round(box.y * dpr)))
  const width = Math.max(1, Math.min(imgW - left, Math.round(box.width * dpr)))
  const height = Math.max(1, Math.min(imgH - top, Math.round(box.height * dpr)))
  const { data, info } = await sharp(png)
    .extract({ left, top, width, height })
    .raw()
    .toBuffer({ resolveWithObject: true })
  const channels = info.channels
  let r = 0
  let g = 0
  let b = 0
  let n = 0
  for (let i = 0; i < data.length; i += channels) {
    r += data[i]
    g += data[i + 1]
    b += data[i + 2]
    n++
  }
  return [Math.round(r / n), Math.round(g / n), Math.round(b / n)]
}

// Ensure screenshot dir exists at test time
const SCREENSHOT_DIR = 'tests/screenshots'
test.beforeAll(() => {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
  }
})

const locales = ['de', 'en'] as const

for (const locale of locales) {
  test.describe(`Hero — ${locale}`, () => {
    test('renders and hero headline is non-empty', async ({ page }) => {
      await page.goto(`/${locale}`)
      await page.waitForLoadState('domcontentloaded')

      // #hero section must be visible
      const hero = page.locator('#hero')
      await expect(hero).toBeVisible()

      // Headline must have non-empty text (Sanity copy or next-intl fallback)
      const headline = hero.locator('h1')
      await expect(headline).toBeVisible()
      const headlineText = await headline.textContent()
      expect(headlineText?.trim().length).toBeGreaterThan(0)

      // ── Phase 5: Canvas visibility (HERO-01) ────────────────────────────────
      // The happy path (Canvas visible) depends on WebGL being available in the
      // headless Chromium — which is NOT guaranteed. Sniff WebGL support in-page
      // on a throwaway probe canvas; only then assert the Canvas branch. When
      // WebGL is absent, production canUseWebGL() returns false and the gradient
      // fallback shows with zero <canvas> — a legitimate green branch (mirrors
      // the real no-WebGL fallback), keeping this suite deterministic.
      const webglAvailable = await page.evaluate(() => {
        const c = document.createElement('canvas')
        return !!(c.getContext('webgl2') || c.getContext('webgl'))
      })

      const canvas = page.locator('#hero canvas')
      if (webglAvailable) {
        // Canvas mounts and fades in over the always-painted gradient fallback.
        // The post-LCP mount trigger (interaction-or-3000ms-floor) means headless
        // Playwright must wait for the setTimeout floor before the canvas appears.
        // Give it a generous timeout well past the 3000ms floor + render time.
        await expect(canvas).toBeVisible({ timeout: 8000 })
        // Canvas is decorative: it sits inside an aria-hidden wrapper div so the
        // 3D scene is not exposed to the accessibility tree. R3F does not forward
        // aria-hidden onto the inner <canvas> element itself — an ancestor carries
        // it (matches UI-SPEC "aria-hidden on wrapper"; the a11y outcome is identical).
        // Assert via closest() so the contract holds regardless of nesting depth.
        const hiddenByAncestor = await canvas.evaluate(
          (el) => el.closest('[aria-hidden="true"]') !== null
        )
        expect(hiddenByAncestor).toBe(true)
      } else {
        // No-WebGL branch: gradient fallback visible, no canvas mounted at all.
        await expect(hero.locator('.hero-backdrop').first()).toBeVisible()
        await expect(canvas).toHaveCount(0)
      }

      // Capture screenshot for manual QA-02 review
      const viewport = page.viewportSize()
      const label = `${viewport?.width ?? 'x'}px`
      await hero.screenshot({
        path: `${SCREENSHOT_DIR}/hero-${locale}-${label}.png`,
      })
    })

    // D-06 / HERO-02: no <canvas> anywhere in #hero under reduced motion.
    test('no canvas in #hero when prefers-reduced-motion: reduce', async ({ browser }) => {
      const context = await browser.newContext({ reducedMotion: 'reduce' })
      const page = await context.newPage()
      await page.goto(`/${locale}`)
      await page.waitForLoadState('domcontentloaded')

      // Canvas is never mounted — HeroCanvas early-returns HeroFallback (D-06).
      await expect(page.locator('#hero canvas')).toHaveCount(0)
      // The static gradient fallback remains the backdrop. Under reduced motion
      // there are TWO .hero-backdrop divs by design — HeroSection's always-painted
      // one plus the HeroFallback that HeroCanvas returns from its early-return
      // gate — both identical, both correct (CLS = 0). Assert the first is visible.
      await expect(page.locator('#hero .hero-backdrop').first()).toBeVisible()

      await context.close()
    })

    // ── D-08: WCAG-AA against the ACTUAL RENDERED glass composite ──────────────
    // At the active viewport (mobile-375 / desktop-1440), after the canvas paints,
    // sample the rendered pixels behind the headline (#18181B) and subline
    // (#52525B) and assert contrast ≥ 4.5:1 against the sampled background. Also
    // assert the CTA (#FFFFFF on #1C39BB ≈ 8.93:1 AAA). Threshold is never weakened.
    test('WCAG AA holds against the rendered glass behind headline + subline', async ({ page }) => {
      await page.goto(`/${locale}`)
      await page.waitForLoadState('domcontentloaded')

      const hero = page.locator('#hero')
      await expect(hero).toBeVisible()

      // Let the glass render at least a frame (or the gradient settle in the
      // no-WebGL fallback branch) before sampling the composite background.
      const webglAvailable = await page.evaluate(() => {
        const c = document.createElement('canvas')
        return !!(c.getContext('webgl2') || c.getContext('webgl'))
      })
      if (webglAvailable) {
        await page.waitForFunction(() => document.querySelector('#hero canvas') !== null)
      }
      await page.waitForTimeout(1200)

      const dpr = await page.evaluate(() => window.devicePixelRatio || 1)
      const png = await page.screenshot({ fullPage: false })

      const h1Box = await page.locator('#hero h1').boundingBox()
      const pBox = await page.locator('#hero p').first().boundingBox()
      expect(h1Box, 'headline bounding box').not.toBeNull()
      expect(pBox, 'subline bounding box').not.toBeNull()

      const headlineBg = await sampleMeanColor(png, h1Box!, dpr)
      const sublineBg = await sampleMeanColor(png, pBox!, dpr)

      const headlineRatio = contrastRatio(TEXT_PRIMARY, headlineBg)
      const sublineRatio = contrastRatio(TEXT_SECONDARY, sublineBg)
      const ctaRatio = contrastRatio(TEXT_SURFACE, ACCENT)

      // Record for the evidence trail (surfaced in the executor SUMMARY).
      // eslint-disable-next-line no-console
      console.log(
        `[hero-contrast] ${locale} @${page.viewportSize()?.width}px ` +
          `headline=${headlineRatio.toFixed(2)}:1 (bg rgb(${headlineBg.join(',')})) ` +
          `subline=${sublineRatio.toFixed(2)}:1 (bg rgb(${sublineBg.join(',')})) ` +
          `cta=${ctaRatio.toFixed(2)}:1`
      )

      expect(headlineRatio, 'headline #18181B vs rendered glass').toBeGreaterThanOrEqual(4.5)
      expect(sublineRatio, 'subline #52525B vs rendered glass').toBeGreaterThanOrEqual(4.5)
      expect(ctaRatio, 'CTA #FFFFFF on #1C39BB').toBeGreaterThanOrEqual(4.5)
    })
  })
}
