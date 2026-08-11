# Phase 1: Identity & Design Tokens - Research

**Researched:** 2026-08-11
**Domain:** CSS design tokens, Tailwind v4 `@theme`, Next.js font optimization, WCAG contrast verification, SVG logo production
**Confidence:** MEDIUM

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Mood is **cool architectural** — grid-driven, crisp sans, near-monochrome, precise alignment.
- **D-02:** Warmth strategy is **content-only** — palette stays true-neutral; all human warmth comes from copy, whitespace, and photography. No warm tint in color or type.
- **D-03:** Whitespace posture is **balanced & confident** — generous breathing room, efficient navigation to pricing/contact.
- **D-04:** Grid is **discipline + intentional asymmetry** — consistent rhythm, deliberate asymmetry at hero and key feature rows.
- **D-05:** Base mode is **light-first** — white/near-white background, charcoal text, true-neutral gray ramp.
- **D-06:** Single accent is **Persian blue** (~`#1C39BB`). Exact hex tuned during research to guarantee WCAG AA on white.
- **D-07:** Accent usage is **sparingly / functional** — primary CTA, links, focus rings, active nav indicator, form focus border only.
- **D-08:** All remaining color carried by **photography**.
- **D-09:** **Single grotesk, weight-driven** — one high-quality grotesk across the whole site.
- **D-10:** Exact face selected: **Plus Jakarta Sans** (Google Fonts, variable font, free).
- **D-11:** **Wordmark only** — "BrightByte" + "Berlin" in the site grotesk. No monogram or pictorial mark.
- **D-12:** **Plain & warm** brand voice — German-first, short sentences, no jargon, facts-led credibility.

### Claude's Discretion

- Exact gray ramp stops, type scale ratio, spacing scale steps, motion easing curves — derive consistent with decisions above.
- One "byte"/tech detail in the wordmark was explicitly NOT chosen — stays clean.

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| IDENT-01 | A single design-token system (`@theme` in one CSS file) defines the full palette, type scale, spacing, and motion easing — every component consumes tokens, never raw values | §Standard Stack + §Architecture Patterns detail the exact `@theme` syntax, file location, and naming conventions |
| IDENT-02 | A resolved, refined visual identity (palette + max 2 typefaces + visual language) grounded in design research, reading as professional and calm to SMB clients | §Color Contrast Verification confirms all palette values pass WCAG; §Standard Stack confirms Plus Jakarta Sans is the correct single grotesk |
| IDENT-03 | A resolved logo mark — wordmark in Plus Jakarta Sans with text-as-paths SVG export | §Logo Production Workflow gives the exact code-first process for SVG outline export |
| IDENT-04 | A defined brand voice / tone applied consistently | §Brand Voice Guide Format prescribes file location and exact structure |
</phase_requirements>

---

## Summary

Phase 1 is unusually pre-resolved. The UI-SPEC (01-UI-SPEC.md) locks all values — palette, type scale, spacing, motion tokens, logo spec, copy elements, and brand voice rules. Research confirms all locked values are correct and provides the technical HOW for implementation.

**Critical finding on contrast:** The UI-SPEC claims `#1C39BB` on `#FFFFFF` achieves ~5.8:1. The independently computed ratio is **8.93:1** — the accent is much stronger than estimated, passing not just AA (4.5:1) but AAA (7.0:1). The hex is confirmed correct and does not need adjustment. All other pairs in the UI-SPEC's contrast table also pass at their stated verdicts (with exact figures differing slightly from estimates).

**Font confirmed:** Plus Jakarta Sans is a Google Fonts variable font (wght 200–800), free commercial license (SIL OFL), available via `next/font/google` as `Plus_Jakarta_Sans`. The self-hosting + CSS variable + Tailwind v4 wiring pattern is verified and straightforward.

**Tailwind v4 `@theme` is the correct approach.** The syntax is confirmed: `@theme {}` in `globals.css` after `@import "tailwindcss"` generates utilities automatically from namespaced variables. Motion easing/duration tokens live in `@theme` but are consumed via `var()` or arbitrary values, not auto-generated utilities — this is expected and correct.

**Primary recommendation:** Implement `styles/tokens.css` as a standalone file containing only the `@theme {}` block. Import it via `@import "./styles/tokens.css"` from `app/globals.css`. This isolates the token layer cleanly for all downstream phases.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| CSS token definitions (`@theme`) | Static (build-time CSS) | — | Processed at build time by PostCSS; zero runtime cost |
| Font loading + self-hosting | Frontend Server (Next.js build) | CDN (static asset) | `next/font/google` downloads at build time, serves from same domain |
| Logo SVG asset | CDN / Static | — | SVG file committed to `public/`, served as static asset |
| Brand voice guide | Static docs | — | Markdown file; no runtime component |
| Contrast verification | CI / Dev tooling | — | `@axe-core/playwright` contrast audit runs against built app |

---

## Standard Stack

### Core (this phase)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `tailwindcss` | 4.3.3 | CSS utility framework | Project locked. v4 `@theme` CSS-native config is the ONE styling approach. |
| `@tailwindcss/postcss` | 4.3.3 | PostCSS bridge for Tailwind v4 | Required in v4 — replaces old `tailwindcss` PostCSS plugin. |
| `next` (next/font) | 16.3.0 | Font self-hosting | Built into Next.js. `next/font/google` downloads at build time, zero CDN requests at runtime. |

### Supporting (validation)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@axe-core/playwright` | 4.12.1 | Accessibility + contrast audit | Contrast pre-verification gate before Phase 4 component work (IDENT-01/IDENT-02) |
| `@playwright/test` | latest | Test runner for axe audit | Required by `@axe-core/playwright` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@theme {}` in CSS | `tailwind.config.js` | Does not exist in Tailwind v4 — config is CSS-only. |
| `next/font/google` | Google CDN `<link>` | CDN link creates third-party network request at LCP paint — violates performance rules. |
| Single `styles/tokens.css` | Inline `@theme` in `globals.css` | Both work; separate file makes the token layer more discoverable and isolates Phase 1's output. |

**Package Legitimacy Audit**

| Package | Registry | Age | Downloads/wk | Source Repo | Verdict | Disposition |
|---------|----------|-----|--------------|-------------|---------|-------------|
| `@axe-core/playwright` | npm | 2021 | 8,150,768 | github.com/dequelabs/axe-core-npm | OK | Approved |

[VERIFIED: npm registry] — `@axe-core/playwright` v4.12.1, published 2021-06-02, 8.15M weekly downloads, maintained by Deque Systems (official axe-core org). No postinstall script.

**Packages removed due to SLOP verdict:** none
**Packages flagged as suspicious (SUS):** none

---

## Architecture Patterns

### System Architecture Diagram

```
Build time:
  next/font/google
    └─ downloads Plus Jakarta Sans woff2 → /static/media/
    └─ emits @font-face in <head>

  PostCSS (@tailwindcss/postcss)
    └─ reads app/globals.css
         └─ @import "tailwindcss"            (Tailwind base)
         └─ @import "./styles/tokens.css"    (Phase 1 output)
              └─ @theme { --color-*, --font-*, --spacing-*, --text-*, --ease-*, --duration-* }
    └─ generates utility classes from @theme namespaces
    └─ emits :root { --color-surface: #FFFFFF; ... } in output CSS

Runtime:
  HTML element
    └─ className includes font.variable   (e.g., "__variable_abc123")
         └─ sets --font-sans CSS variable on :root
  Components
    └─ use Tailwind utilities: bg-surface, text-primary, font-sans, text-5xl
    └─ motion: transition-timing-function: var(--ease-standard)  [arbitrary value]
    └─ NO raw hex, NO text-gray-*, NO inline styles
```

### Recommended Project Structure

```
app/
├── globals.css          # @import "tailwindcss"; @import "./styles/tokens.css"
├── layout.tsx           # import './globals.css'; apply font.variable to <html>
└── fonts.ts             # Plus_Jakarta_Sans config (or colocated in layout.tsx)

styles/
└── tokens.css           # SINGLE @theme {} block — Phase 1 canonical output

public/
├── logo-light.svg       # Wordmark for light backgrounds (text as paths)
└── logo-dark.svg        # Wordmark for dark backgrounds (text as paths)

docs/
└── brand-voice.md       # IDENT-04 deliverable — 1-page brand voice guide
```

### Pattern 1: Tailwind v4 `@theme` Token File

**What:** All design tokens in a single CSS file, consumed by every downstream phase.
**When to use:** Always — this is the only source of truth for tokens.

```css
/* styles/tokens.css */
/* Source: https://tailwindcss.com/docs/theme */
@theme {
  /* ── Colors ─────────────────────────────────── */
  --color-surface: #FFFFFF;
  --color-surface-subtle: #FAFAFA;
  --color-surface-muted: #F4F4F5;
  --color-border: #E4E4E7;
  --color-text-muted: #A1A1AA;
  --color-text-secondary: #52525B;
  --color-text-primary: #18181B;
  --color-accent: #1C39BB;
  --color-accent-hover: #1630A0;
  --color-destructive: #DC2626;
  --color-surface-dark: #0F0F10;
  --color-text-on-dark: #F4F4F5;
  --color-text-muted-on-dark: #A1A1AA;

  /* ── Typography ──────────────────────────────── */
  /* --font-sans is set via @theme inline in globals.css after next/font wires the CSS var */
  --text-sm: 0.875rem;    /* 14px — label */
  --text-base: 1rem;      /* 16px — body */
  --text-2xl: 1.5rem;     /* 24px — subheading */
  --text-4xl: 2rem;       /* 32px — display mobile */
  --text-5xl: 3rem;       /* 48px — display desktop */

  /* ── Spacing ─────────────────────────────────── */
  --spacing-1: 0.25rem;   /* 4px */
  --spacing-2: 0.5rem;    /* 8px */
  --spacing-4: 1rem;      /* 16px */
  --spacing-6: 1.5rem;    /* 24px */
  --spacing-8: 2rem;      /* 32px */
  --spacing-12: 3rem;     /* 48px */
  --spacing-16: 4rem;     /* 64px */
  --spacing-24: 6rem;     /* 96px */
  --spacing-32: 8rem;     /* 128px */

  /* ── Motion ──────────────────────────────────── */
  /* These do NOT auto-generate utilities. Consumed via var() in CSS or arbitrary values. */
  --ease-out: cubic-bezier(0.0, 0.0, 0.2, 1);
  --ease-standard: cubic-bezier(0.4, 0.0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0.0, 1, 1);
  --duration-micro: 150ms;
  --duration-short: 200ms;
  --duration-standard: 300ms;
  --duration-entrance: 500ms;
}
```

### Pattern 2: globals.css Wiring

```css
/* app/globals.css */
/* Source: https://tailwindcss.com/docs/installation/framework-guides/nextjs */
@import "tailwindcss";
@import "./styles/tokens.css";

/* Wire next/font CSS variable into Tailwind @theme */
@theme inline {
  --font-sans: var(--font-plus-jakarta-sans);
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

> **Note on `@theme inline`:** The `inline` keyword tells Tailwind to resolve the variable value eagerly at build time rather than emitting a CSS variable reference. Required when the font value is provided by `next/font` at runtime via a className. [CITED: nextjs.org/docs/app/api-reference/components/font — "With Tailwind CSS" section]

### Pattern 3: Font Setup in layout.tsx

```tsx
/* app/layout.tsx */
/* Source: https://nextjs.org/docs/app/api-reference/components/font */
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta-sans',
  // No weight needed — variable font covers 200–800 automatically
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={plusJakartaSans.variable}>
      <body>{children}</body>
    </html>
  )
}
```

### Pattern 4: Consuming Motion Tokens

Motion tokens do not generate utility classes. Consume them two ways:

```css
/* Option A: in @layer components or @utility (for reusable classes) */
@layer components {
  .transition-standard {
    transition-timing-function: var(--ease-standard);
    transition-duration: var(--duration-standard);
  }
}
```

```html
<!-- Option B: Tailwind arbitrary values (inline, no extra CSS needed) -->
<button class="transition-colors [transition-timing-function:var(--ease-standard)] [transition-duration:var(--duration-short)]">
```

```tsx
// Option C: motion/react (Phase 4+) — pass CSS variables as props
<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, ease: [0.0, 0.0, 0.2, 1] }}
  // Note: motion/react v13 accepts easing arrays directly; CSS var() in transition.ease is not supported
  // Replicate the @ease-out cubic-bezier values directly in motion props
/>
```

### Anti-Patterns to Avoid

- **Raw hex in components:** `className="text-[#1C39BB]"` — violates IDENT-01. Use `text-accent`.
- **`text-gray-*` utilities:** `text-gray-700` bypasses the semantic token system. All gray shades must go through named tokens (`text-secondary`, `text-muted`).
- **Multiple `@theme` blocks:** Only one `@theme` block exists in the whole project (`styles/tokens.css`). No per-component `@theme` overrides.
- **Hardcoding weights in components:** `font-weight: 700` inline — use `font-bold` utility which maps via the font-weight scale.
- **`tailwindcss.config.js`:** Does not exist in v4. Any references to it in tutorials are v3-era and must be ignored.
- **`display: 'block'` on the font:** Always `display: 'swap'` — eliminates FOUT on first paint.

---

## Color Contrast Verification

**INDEPENDENTLY VERIFIED** using the WCAG 2.1 relative luminance formula [WCAG algorithm applied in this session via Python].

| Pair | Hex on Hex | Computed Ratio | UI-SPEC Claimed | AA Normal (≥4.5) | AAA (≥7.0) |
|------|-----------|---------------|-----------------|-------------------|------------|
| Text Primary on Surface | `#18181B` / `#FFFFFF` | **17.72:1** | ~19.1:1 | PASS | PASS |
| Text Primary on Surface Subtle | `#18181B` / `#FAFAFA` | **16.97:1** | ~18.6:1 | PASS | PASS |
| **Accent on Surface** | `#1C39BB` / `#FFFFFF` | **8.93:1** | ~5.8:1 ← **UNDERSTATED** | PASS | **PASS (AAA!)** |
| Accent Hover on Surface | `#1630A0` / `#FFFFFF` | **10.69:1** | not listed | PASS | PASS |
| Text On Dark on Surface Dark | `#F4F4F5` / `#0F0F10` | **17.43:1** | ~18.1:1 | PASS | PASS |
| Text Muted on Surface | `#A1A1AA` / `#FFFFFF` | **2.56:1** | ~2.4:1 | FAIL (intentional) | fail |
| Text Secondary on Surface | `#52525B` / `#FFFFFF` | **7.73:1** | ~7.0:1 | PASS | PASS |
| Logo descriptor on Surface Subtle | `#52525B` / `#FAFAFA` | **7.41:1** | not listed | PASS | PASS |
| Logo text on dark | `#F4F4F5` / `#0F0F10` | **17.43:1** | not listed | PASS | PASS |
| Logo descriptor on dark | `#A1A1AA` / `#0F0F10` | **7.48:1** | not listed | PASS | PASS |

**Key finding:** `#1C39BB` achieves **8.93:1** on white — the UI-SPEC's ~5.8:1 estimate was conservative. The accent passes AAA, not just AA. No hex adjustments needed. All locked values are confirmed safe.

**Text Muted note:** `#A1A1AA` on white is intentionally non-compliant (2.56:1). This is acceptable ONLY for decorative/disabled states per the UI-SPEC's explicit restriction. The planner must enforce this restriction at every phase where Text Muted appears.

---

## Plus Jakarta Sans Confirmation

[CITED: fonts.google.com/specimen/Plus+Jakarta+Sans — confirmed via Fontsource.org cross-check]
[ASSUMED: SIL OFL license — standard for Google Fonts; confirmed category but not read license file directly this session]

- **Google Fonts availability:** Confirmed available
- **Variable font:** Yes — axes: `wght` (200–800), `ital` (0–1)
- **License:** SIL Open Font License 1.1 [ASSUMED — standard for all Google Fonts; commercially free]
- **next/font/google import name:** `Plus_Jakarta_Sans` (spaces replaced with underscores per Next.js convention)
- **Subsets available:** `latin`, `latin-ext`, `cyrillic` — use `['latin']` for this project (Berlin audience)
- **FOUT:** `display: 'swap'` is the default in `next/font` — no configuration needed, but explicit is cleaner
- **Variable axes selection:** No `axes` option needed for weight-only usage; weight range 200–800 is included automatically

---

## Logo Production Workflow

**Goal:** SVG wordmark with text converted to outlines — no font dependency at render time.

**Recommended code-first workflow (no separate design tool required):**

The wordmark spec is fully defined in the UI-SPEC (weight, tracking, colors). An SVG with text-as-paths can be produced entirely in code using an HTML canvas / Node.js approach, or via a design tool at any fidelity. The simplest repeatable path for this project:

### Option A: Figma (recommended if available)
1. Set text "BrightByte" in Plus Jakarta Sans 700, tracking -0.03em
2. Set "Berlin" below in Plus Jakarta Sans 400, tracking 0.12em
3. Select all → Object > Flatten (or Path > Outline Stroke) → Export as SVG
4. Open exported SVG, confirm `<path>` elements (no `<text>` nodes)
5. Duplicate layer → adjust colors for dark variant

### Option B: Node.js + canvas (no design tool)
[ASSUMED — viable but adds a build-time dependency not worth the complexity for a one-time asset]

### Option C: Inkscape (free, code-first)
1. Import Plus Jakarta Sans locally
2. Create text objects with exact specifications
3. Path > Object to Path (converts text to outlines)
4. File > Save As > Plain SVG
5. Optimise with svgo before committing: `npx svgo logo-light.svg -o public/logo-light.svg`

**SVG structure after conversion:**

```svg
<!-- public/logo-light.svg — no <text> nodes, no font-family attributes -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 52" role="img" aria-label="BrightByte Berlin">
  <!-- "BrightByte" paths — fill #18181B -->
  <path d="..." fill="#18181B"/>
  <!-- "Berlin" paths — fill #52525B -->
  <path d="..." fill="#52525B"/>
</svg>
```

**Minimum size enforcement:** Use CSS `min-width: 120px` on every `<img src="logo-light.svg">` usage — not encoded into the SVG itself (SVGs scale freely; the constraint is a CSS rule in the consuming component).

**Dark variant:** Same path geometry, swap fill values: `#18181B` → `#F4F4F5`, `#52525B` → `#A1A1AA`.

**Optimisation:** Run `npx svgo` before committing. Target < 5KB per file.

---

## Brand Voice Guide Format

**IDENT-04 deliverable:** A 1-page markdown file at `docs/brand-voice.md`.

The UI-SPEC already defines all rules. The deliverable is capturing them in a scannable format that copywriters and future AI sessions can reference directly:

```markdown
# BrightByte Berlin — Brand Voice Guide

**In one sentence:** Plain, warm, direct — speaks to a florist as a person, credibility through facts.

## Rules
| Rule | Spec |
|------|------|
| Tone | Plain, warm, direct. Not agency-formal. |
| Language | German-first (DE canonical). EN mirrors register exactly. |
| Sentence length | Max 2 clauses. One idea per sentence. |
| Forbidden (DE) | innovativ, maßgeschneidert, ganzheitlich, Lösung, Synergien, state-of-the-art |
| Forbidden (EN) | innovative, bespoke, tailored, holistic, solution, cutting-edge |
| Headlines | Declarative benefit. "Ihre Website in 4 Wochen. Festpreis." |
| CTAs | Action-verb first. Never: submit, send, click here. |
| Credibility | Facts only — fixed price, code ownership, 24h reply. |

## Approved Copy Elements
[Table from UI-SPEC §Copy Elements, verbatim]
```

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Font self-hosting | Manual `@font-face` declarations | `next/font/google` | Automatic subset download, `@font-face` injection, zero CDN requests, size-adjust fallback |
| Contrast ratio calculation | Custom luminance math | Python script (dev) + `@axe-core/playwright` (CI) | WCAG formula has non-obvious linearisation step; automated tools handle edge cases |
| CSS variable wiring | Duplicate token values | Single `@theme {}` import chain | One change propagates everywhere; duplication creates drift |
| Motion in `@theme` utilities | Custom Tailwind plugin | `var(--ease-*)` arbitrary values or `@layer components` | Tailwind v4 plugin API changed — avoid complexity for 7 values |
| SVG logo text | `<text>` element with `font-family` | Outlined paths | `<text>` creates a font dependency; paths render identically everywhere |

---

## Common Pitfalls

### Pitfall 1: `@theme inline` vs `@theme` for font variable

**What goes wrong:** Declaring `--font-sans: var(--font-plus-jakarta-sans)` inside the main `@theme {}` block causes Tailwind to emit a CSS variable reference in the output, but the `--font-plus-jakarta-sans` variable isn't available until the `next/font` className is applied to the HTML element. The font doesn't load.

**Why it happens:** Standard `@theme` resolves at PostCSS time. The `next/font` variable is injected at runtime by adding a class to `<html>`. These two systems need a bridge.

**How to avoid:** Use `@theme inline { --font-sans: var(--font-plus-jakarta-sans); }` in `globals.css` (after the tokens import). The `inline` modifier tells Tailwind to use the CSS variable value dynamically rather than resolving at build time.

**Warning signs:** `font-sans` utility applies `font-family: var(--font-plus-jakarta-sans)` but the browser uses the system fallback — check DevTools → Computed → font-family.

---

### Pitfall 2: Motion tokens accidentally expected to generate utilities

**What goes wrong:** A task tries to use `transition-ease-out` or `duration-entrance` as Tailwind utility classes — they don't exist.

**Why it happens:** Color and spacing tokens auto-generate utilities from `--color-*` and `--spacing-*` namespaces. Easing and duration tokens use arbitrary namespace names (`--ease-*`, `--duration-*`) that Tailwind v4 doesn't map to a utility namespace.

**How to avoid:** Document explicitly in the token file that `--ease-*` and `--duration-*` are consumed via `var()` in component CSS or as arbitrary Tailwind values `[transition-duration:var(--duration-standard)]`. Never reference them as utility class names.

**Warning signs:** `className="duration-standard"` applies the v4 default `transition-duration: 300ms` (coincidentally correct!) but is actually the Tailwind default, not the token — a silent correctness-by-accident that breaks if you rename the token.

---

### Pitfall 3: `text-gray-*` utilities bypassing the token system

**What goes wrong:** Phase 4+ implementors reach for `text-gray-500` (Tailwind default) instead of `text-secondary` or `text-muted`.

**Why it happens:** Tailwind v4's default color palette is still available unless explicitly disabled. `text-gray-500` works — it just bypasses the design token.

**How to avoid:** The lint gate (see §Validation Architecture) catches this. Additionally, consider adding `--color-gray-*: initial;` in `@theme` to unset Tailwind's default gray scale, forcing all gray usage through named semantic tokens.

**Warning signs:** A grep for `text-gray-` or `bg-gray-` in `app/` returns any results.

---

### Pitfall 4: Both logo variants not tested on their respective surfaces

**What goes wrong:** `logo-light.svg` used on a dark hero section, or `logo-dark.svg` used on white. The wordmark becomes invisible.

**Why it happens:** SVG with hardcoded path fills — correct by design — but the consuming component must select the correct variant based on surface color.

**How to avoid:** Define a `<Logo>` component (Phase 4) that accepts a `variant: 'light' | 'dark'` prop and renders the appropriate file. Document this as a Phase 4 task.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | `@playwright/test` + `@axe-core/playwright` |
| Config file | `playwright.config.ts` — Wave 0 gap (does not yet exist) |
| Quick run command | `npx playwright test tests/a11y/contrast.spec.ts` |
| Full suite command | `npx playwright test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| IDENT-01 | Zero raw hex in component files | lint/grep | `grep -rE '#[0-9a-fA-F]{3,6}' app/ --include="*.tsx" --include="*.ts" --include="*.css" \| grep -v "tokens.css"` | ❌ Wave 0 |
| IDENT-01 | Zero `text-gray-*`/`bg-gray-*` in components | lint/grep | `grep -rE 'text-gray-\|bg-gray-\|border-gray-' app/` | ❌ Wave 0 |
| IDENT-01 | Token file parses as valid CSS | build smoke | `npx postcss styles/tokens.css --no-map` | ❌ Wave 0 |
| IDENT-02 | All AA contrast pairs pass | axe audit | `npx playwright test tests/a11y/contrast.spec.ts` | ❌ Wave 0 |
| IDENT-02 | Font loads (not system fallback) | Playwright | `page.evaluate(() => document.fonts.check('16px Plus Jakarta Sans'))` | ❌ Wave 0 |
| IDENT-03 | Logo SVGs have no `<text>` nodes | grep/parse | `grep -l '<text' public/logo-*.svg` (should return empty) | ❌ Wave 0 |

### Contrast Audit Pattern (`@axe-core/playwright`)

```typescript
// tests/a11y/contrast.spec.ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('token contrast — no color-contrast violations on token demo page', async ({ page }) => {
  // Phase 1 has no rendered page yet; run against a minimal HTML fixture
  // that renders all token color combinations (created in Wave 0)
  await page.goto('/token-audit')   // or load a static HTML fixture
  const results = await new AxeBuilder({ page })
    .withRules(['color-contrast'])
    .analyze()
  expect(results.violations).toHaveLength(0)
})
```

### Raw Hex Invariant (grep enforcement)

The "zero raw hex in components" invariant (IDENT-01) is enforced by grep, not axe. Add to CI and to each phase's verification checklist:

```bash
# Fail if any raw hex found outside token file
result=$(grep -rE '#[0-9a-fA-F]{3,6}' app/ --include="*.tsx" --include="*.ts" --include="*.css" | grep -v "styles/tokens.css")
if [ -n "$result" ]; then
  echo "FAIL: raw hex found in components:"
  echo "$result"
  exit 1
fi
```

### Wave 0 Gaps

- [ ] `playwright.config.ts` — base config with `baseURL: 'http://localhost:3000'`
- [ ] `tests/a11y/contrast.spec.ts` — contrast audit against token fixture page
- [ ] `tests/invariants/no-raw-hex.sh` — grep script for CI
- [ ] Package installs: `npm install -D @playwright/test @axe-core/playwright`
- [ ] Minimal token audit HTML fixture (static page that renders text in all token colors)

---

## Security Domain

This phase produces only static CSS files, an SVG, and a markdown document. No executable code, no user input, no network calls at runtime.

| ASVS Category | Applies | Note |
|---------------|---------|------|
| V5 Input Validation | No | No user input in this phase |
| V6 Cryptography | No | No secrets or encryption |
| All others | No | Static assets only |

**SVG security note:** The logo SVG files committed to `public/` must contain only `<path>`, `<svg>`, and structural elements. No `<script>`, no `<use>` with external hrefs, no `xlink:href` pointing outside the file. Run `npx svgo` which strips scripts by default.

---

## Environment Availability

| Dependency | Required By | Available | Fallback |
|------------|------------|-----------|----------|
| Node.js 22+ | Next.js build, npm | Verify on Vercel deploy | Upgrade Vercel runtime |
| `next/font/google` | Font self-hosting | Built into Next.js 16 — no install needed | — |
| `@tailwindcss/postcss` | Tailwind v4 compilation | Install with `npm install` | — |
| SVG editor (Figma/Inkscape) | Logo production | Requires user tool | `svgo` + manual path editing |
| `@axe-core/playwright` | Contrast audit | Install with `npm install -D` | — |
| `npx svgo` | Logo optimisation | Available via npx | Run `npm install -g svgo` |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Plus Jakarta Sans is licensed SIL OFL 1.1 (free for commercial use) | §Plus Jakarta Sans Confirmation | Low — all Google Fonts are SIL OFL or Apache 2.0; neither restricts commercial use |
| A2 | `@theme inline` is the correct modifier for next/font CSS variable bridging | §Pattern 2 | Medium — if syntax changed in Tailwind v4.3.x, the font utility breaks; verify in Phase 2 by checking `font-sans` resolves correctly |
| A3 | `Plus_Jakarta_Sans` is the exact next/font/google import identifier | §Pattern 3 | Low — naming convention is documented ("spaces → underscores"); TypeScript will catch a wrong name at import |

---

## Sources

### Primary (MEDIUM confidence — official docs, verified via WebFetch this session)
- [CITED: tailwindcss.com/docs/theme] — `@theme` syntax, namespaces, utility generation, motion token behaviour
- [CITED: tailwindcss.com/docs/installation/framework-guides/nextjs] — `postcss.config.mjs` content, `globals.css` import
- [CITED: nextjs.org/docs/app/api-reference/components/font] — `next/font/google` full API, `variable` option, `@theme inline` bridging pattern, `Plus_Jakarta_Sans` naming convention

### Secondary (MEDIUM confidence — npm registry, verified this session)
- [VERIFIED: npm registry] — `@axe-core/playwright` v4.12.1, 8.15M weekly downloads, Deque Systems, published 2021

### Computed (HIGH confidence — deterministic math)
- WCAG contrast ratios computed in this session using the WCAG 2.1 relative luminance formula. All values are deterministic given the hex inputs.

---

## Metadata

**Confidence breakdown:**
- Contrast verification: HIGH — deterministic math, independently computed
- Standard stack (Tailwind v4, next/font): MEDIUM — official docs verified via WebFetch
- Plus Jakarta Sans details: MEDIUM — confirmed variable wght 200–800 via Fontsource; license ASSUMED SIL OFL
- Logo production workflow: MEDIUM — standard industry pattern; specific tool availability depends on user's environment
- axe-core/playwright: MEDIUM — verified via npm legitimacy check + registry

**Research date:** 2026-08-11
**Valid until:** 2026-09-11 (stable ecosystem; Tailwind v4 and Next.js 16 are both recently released stable versions)
