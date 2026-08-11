---
phase: 01-identity-design-tokens
plan: 01
subsystem: ui
tags: [tailwind-v4, nextjs, design-tokens, a11y, playwright, axe-core, plus-jakarta-sans, wcag]

requires: []

provides:
  - "styles/tokens.css — single @theme block with full palette, type scale, spacing, motion tokens"
  - "Next.js 16.3.0 + React 19 + Tailwind v4.3.3 project scaffold"
  - "Plus Jakarta Sans font wired via next/font + @theme inline bridge"
  - "/token-audit page rendering all readable token pairs with named-token utilities only"
  - "Wave 0 test infrastructure: Playwright + @axe-core/playwright + raw-hex grep gate"
  - "IDENT-01 invariant gate (no-raw-hex.sh) green against current app/"
  - "IDENT-02 contrast audit green: all readable token pairs pass WCAG AA/AAA"

affects:
  - phases 2-7 (all phases consume styles/tokens.css as single token source)
  - plan 01-02 (logo + brand voice — extends token system)

actuals:
  tokens: 21983
  tasks: 3
  commits: 3

tech-stack:
  added:
    - next@16.3.0
    - react@19.2.x
    - tailwindcss@4.3.3
    - "@tailwindcss/postcss@4.3.3"
    - sharp@0.35.3
    - "@playwright/test@1.49+"
    - "@axe-core/playwright@4.12.1"
    - plus-jakarta-sans (next/font/google, variable wght 200-800)
  patterns:
    - "Single @theme block in styles/tokens.css — imported by app/globals.css, consumed by all phases"
    - "@theme inline bridge in globals.css for next/font CSS variable resolution (Pitfall 1)"
    - "Token naming: --color-<name> generates text-<name>/bg-<name> utilities (NOT --color-text-<name>)"
    - "Gray scale suppressed via --color-gray-*: initial to force semantic token usage"
    - "aria-hidden + data-decorative on known AA-exception regions for axe exclusion"

key-files:
  created:
    - styles/tokens.css
    - app/globals.css
    - app/layout.tsx
    - app/token-audit/page.tsx
    - app/page.tsx
    - package.json
    - postcss.config.mjs
    - next.config.ts
    - tsconfig.json
    - playwright.config.ts
    - tests/a11y/contrast.spec.ts
    - tests/a11y/font-check.spec.ts
    - tests/invariants/no-raw-hex.sh
    - .gitignore
  modified: []

key-decisions:
  - "Token CSS variable naming: --color-<role> not --color-text-<role> to avoid Tailwind v4 double-prefix antipattern (text-text-primary). Short names: --color-primary, --color-secondary, --color-muted, --color-on-dark."
  - "Decorative Text Muted (#A1A1AA) region marked aria-hidden + data-decorative on /token-audit to explicitly exclude from axe contrast scan — intentional AA exception per D-06"
  - "Tailwind default gray scale suppressed via --color-gray-*: initial in @theme to enforce semantic token usage"
  - "playwright.config.ts uses next start (production build) as webServer — requires prior `next build`"

patterns-established:
  - "All color tokens use short suffix: --color-surface, --color-primary, --color-accent, --color-on-dark"
  - "Font bridge: Plus_Jakarta_Sans({ variable: '--font-plus-jakarta-sans' }) on <html> + @theme inline { --font-sans: var(--font-plus-jakarta-sans) } in globals.css"
  - "Import order in globals.css: @import tailwindcss → @import tokens.css → @theme inline font bridge → prefers-reduced-motion"

requirements-completed: [IDENT-01, IDENT-02]

coverage:
  - id: D1
    description: "styles/tokens.css — single @theme block containing full palette, type scale, spacing, and motion tokens per UI-SPEC"
    requirement: IDENT-01
    verification:
      - kind: automated_ui
        ref: "npx next build — compiled without CSS errors"
        status: pass
      - kind: other
        ref: "grep -c '@theme' styles/tokens.css — returns 1"
        status: pass
      - kind: other
        ref: "grep --color-accent: #1C39BB styles/tokens.css"
        status: pass
    human_judgment: false
  - id: D2
    description: "Plus Jakarta Sans loaded via next/font + @theme inline bridge (not system fallback)"
    requirement: IDENT-02
    verification:
      - kind: e2e
        ref: "tests/a11y/contrast.spec.ts#token-audit: Plus Jakarta Sans font loads via @theme inline bridge"
        status: pass
    human_judgment: false
  - id: D3
    description: "/token-audit page renders all readable token pairs using only named-token utilities (zero raw hex, zero gray utilities)"
    requirement: IDENT-01
    verification:
      - kind: other
        ref: "bash tests/invariants/no-raw-hex.sh — exits 0"
        status: pass
    human_judgment: false
  - id: D4
    description: "All readable token pairs pass WCAG AA — accent #1C39BB on #FFFFFF confirmed 8.93:1 (AAA)"
    requirement: IDENT-02
    verification:
      - kind: e2e
        ref: "tests/a11y/contrast.spec.ts#token-audit: zero color-contrast violations on all readable token pairs"
        status: pass
    human_judgment: false
  - id: D5
    description: "Wave 0 test infrastructure: playwright.config.ts, no-raw-hex.sh, contrast.spec.ts operational"
    requirement: IDENT-01
    verification:
      - kind: e2e
        ref: "npx playwright test tests/a11y/contrast.spec.ts — 3 passed"
        status: pass
    human_judgment: false
  - id: D6
    description: "Text at all token sizes reads as calm, editorial, and professional per UI-SPEC typography contract"
    requirement: IDENT-02
    verification: []
    human_judgment: true
    rationale: "Aesthetic judgment — automated tools verify WCAG compliance but cannot assess 'reads as designed, not default'. Requires visual review of /token-audit at all type sizes."

duration: 23min
completed: 2026-08-11
status: complete
---

# Phase 01 Plan 01: Walking Skeleton Summary

**Tailwind v4 @theme token system proven end-to-end: Next.js 16 scaffold + styles/tokens.css (Persian blue palette, Plus Jakarta Sans, 9-stop spacing) + font bridge wired + /token-audit page + Playwright axe contrast audit green (all pairs AAA)**

## Performance

- **Duration:** 23 min
- **Started:** 2026-08-11T11:44:31Z
- **Completed:** 2026-08-11T12:07:38Z
- **Tasks:** 3
- **Files modified:** 15

## Accomplishments

- Greenfield Next.js 16.3.0 + React 19 + Tailwind v4.3.3 scaffold compiles clean with zero CSS errors
- `styles/tokens.css` established as the single `@theme` source of truth: full palette (13 color tokens), type scale (5 sizes), spacing (9 steps), motion (3 easing + 4 duration tokens), gray scale suppressed
- Plus Jakarta Sans self-hosted via `next/font/google` + `@theme inline` bridge confirmed working — `document.fonts.check('16px "Plus Jakarta Sans"')` returns true
- `/token-audit` page renders all readable foreground/background token pairs using named-token utilities only — zero raw hex, zero gray utilities
- Wave 0 test infrastructure operational: `no-raw-hex.sh` exits 0, Playwright contrast audit passes with zero axe color-contrast violations
- All readable token pairs confirmed WCAG AA+ (most AAA): accent `#1C39BB` on white is 8.93:1 AAA (UI-SPEC had estimated ~5.8:1 — actual ratio is stronger)

## Task Commits

1. **Task 1: Scaffold Next.js + tokens.css + font bridge** — `9ac8f2d` (feat — tracer task)
2. **Task 2: Wave 0 — Playwright + raw-hex invariant gate** — `96c26bc` (feat)
3. **Task 3: Contrast audit spec + token naming fix** — `7d51536` (feat)

## Files Created/Modified

- `styles/tokens.css` — Single @theme block: palette, type scale, spacing, motion tokens
- `app/globals.css` — Import chain: tailwindcss → tokens.css → @theme inline font bridge → reduced-motion
- `app/layout.tsx` — Plus_Jakarta_Sans next/font wiring, lang="de", .variable on html
- `app/token-audit/page.tsx` — Token pair fixture: all readable pairs, decorative Text Muted excluded
- `app/page.tsx` — Minimal home page (Coming soon)
- `package.json` — next, react, tailwind, sharp, playwright, axe-core deps + test scripts
- `postcss.config.mjs` — @tailwindcss/postcss plugin (v4 bridge, NOT old tailwindcss plugin)
- `next.config.ts` — Minimal Next.js config
- `tsconfig.json` — Next.js-compatible TypeScript config (jsx: react-jsx set by Next.js)
- `playwright.config.ts` — baseURL:3000, webServer: next start, chromium only, no watch flags
- `tests/a11y/contrast.spec.ts` — axe color-contrast audit + font bridge check + accent presence
- `tests/a11y/font-check.spec.ts` — TDD RED font bridge verification test
- `tests/invariants/no-raw-hex.sh` — IDENT-01 grep gate (executable)
- `.gitignore` — .next/, node_modules/, next-env.d.ts, test-results/

## Decisions Made

- **Token variable naming:** Renamed `--color-text-primary` → `--color-primary` (and similarly for secondary/muted/on-dark). Tailwind v4 strips `--color-` to form utility names, so `--color-text-primary` would generate `text-text-primary` (double prefix). Short names `--color-primary` → `text-primary` are correct and semantically clear.
- **Decorative Text Muted exclusion:** `aria-hidden="true"` + `data-decorative="true"` on the Text Muted region in `/token-audit` explicitly marks the known AA exception (#A1A1AA, 2.56:1) out of the readable-copy axe scan. Required to pass the contrast audit while documenting the exception per D-06.
- **playwright.config.ts webServer:** Uses `npm run start` (next start) so tests run against the production build. Requires `next build` to have been run prior. `reuseExistingServer: true` in dev prevents double-start.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Tailwind v4 token utility naming (double-prefix antipattern)**

- **Found during:** Task 3 (contrast audit spec — test run)
- **Issue:** CSS variables named `--color-text-primary`, `--color-text-on-dark`, `--color-text-muted` etc. generated Tailwind utilities `text-text-primary`, `text-text-on-dark` — NOT `text-primary`, `text-on-dark`. The `app/token-audit/page.tsx` used `text-primary`, `text-on-dark` etc. which didn't map to any token. Axe saw `color: #000000` (browser default currentColor) on those elements, causing contrast violations at 1.09:1 and 2.35:1.
- **Fix:** Renamed the foreground text tokens in `styles/tokens.css` to use short suffixes: `--color-primary`, `--color-secondary`, `--color-muted`, `--color-on-dark`, `--color-muted-on-dark`. Tailwind v4 naming convention: `--color-<name>` → `text-<name>` / `bg-<name>`. All utility names in `app/` already matched the short form.
- **Files modified:** `styles/tokens.css`
- **Verification:** `npx playwright test tests/a11y/contrast.spec.ts` — 3 passed, zero violations
- **Committed in:** `7d51536` (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — bug)
**Impact on plan:** Essential correctness fix. Without it the token system was silently broken — token utilities produced no CSS color values. No scope creep.

## Issues Encountered

- CSS `*/` in comment content (e.g., `bg-gray-*/border-gray-*`) caused Tailwind PostCSS to attempt parsing `*` as a selector — fixed by rewriting comments to avoid glob-style patterns.
- The initial `next build` failed on `bg-gray-*/border-gray-*` in a JSDoc comment in `token-audit/page.tsx` — TypeScript parser treated it as a multiply expression. Fixed by removing glob syntax from JSX comments.

## Known Stubs

None — all token pairs are wired to real CSS values. The `/token-audit` page is a fixture, not production UI.

## Next Phase Readiness

- `styles/tokens.css` is the established single source of truth — all Phase 2-7 plans consume it via `app/globals.css @import`
- Wave 0 test infrastructure is operational — `npm test` runs both invariant gate and contrast audit
- IDENT-01 and IDENT-02 requirements are provably met before any component work begins
- Plan 01-02 (logo + brand voice) can proceed immediately

---
*Phase: 01-identity-design-tokens*
*Completed: 2026-08-11*
