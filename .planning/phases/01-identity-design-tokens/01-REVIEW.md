---
phase: 01-identity-design-tokens
reviewed: 2026-08-11T00:00:00Z
depth: standard
files_reviewed: 16
files_reviewed_list:
  - app/globals.css
  - app/layout.tsx
  - app/page.tsx
  - app/token-audit/page.tsx
  - next.config.ts
  - package.json
  - playwright.config.ts
  - postcss.config.mjs
  - public/logo-dark.svg
  - public/logo-light.svg
  - styles/tokens.css
  - svgo.config.mjs
  - tests/a11y/contrast.spec.ts
  - tests/a11y/font-check.spec.ts
  - tests/invariants/no-raw-hex.sh
  - tsconfig.json
findings:
  critical: 2
  warning: 4
  info: 3
  total: 9
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-08-11
**Depth:** standard
**Files Reviewed:** 16
**Status:** issues_found

## Summary

Phase 01 establishes the design-token system, font wiring, token-audit page, wordmark SVGs, and Wave 0 validation infrastructure. The token architecture and font bridge are correctly implemented. However, the IDENT-01 invariant gate (`no-raw-hex.sh`) contains a logic bug that makes its comment-line filter a no-op — the gate will pass code it should catch. The Playwright config targets `npm run start` (production server) which requires a prior build that no CI step ensures, making tests silently fail in cold environments. Four quality issues and three informational items round out the findings.

---

## Critical Issues

### CR-01: Comment-line filter in `no-raw-hex.sh` is a no-op — raw hex in comments passes through

**File:** `tests/invariants/no-raw-hex.sh:40-42`

**Issue:** The script pipes `grep` output into a second `grep -vE '^\s*(//|/\*|\*|<!--)'` to skip comment lines. But `grep` output lines have the format `path/to/file.tsx:42:  content` — the `file:linenum:` prefix means no line ever starts with `//`, `/*`, or `*`. The filter never suppresses anything. Any raw hex value that appears in a commented line inside `app/` (e.g., a JSDoc example or a color comment like `/* #1C39BB */`) will trigger a false-positive FAIL and block CI.

Conversely, if a developer writes `color: #FF0000; // legacy` the regex correctly flags it, but the intent of the filter was to skip lines that are entirely comments — the current implementation fails that intent as well as confirmed by direct testing: `echo "file.css:5:/* color: #FF0000 */" | grep -vE '^\s*(//|/\*|\*|<!--)'` passes through without suppression.

**Fix:** Filter on the content portion of the grep match, not the full output line. Replace the pipe with a grep pattern that anchors to the content after the `file:linenum:` prefix:

```bash
RAW_HEX=$(
  grep -rEn '#[0-9a-fA-F]{3,8}' "${APP_DIR}" \
    --include="*.tsx" \
    --include="*.ts" \
    --include="*.css" \
  | grep -vE ':[0-9]+:\s*(//|/\*|\*|<!--)' \
  || true
)
```

The anchored pattern `:[0-9]+:\s*(//|/\*|\*|<!--)` matches the `linenum:` separator and then checks that the content starts with a comment marker.

---

### CR-02: Playwright `webServer` uses `npm run start` (production server) — tests fail cold without a prior build

**File:** `playwright.config.ts:32`

**Issue:** `command: 'npm run start'` runs `next start`, which serves the production build from `.next/`. If `.next/` does not exist (fresh clone, clean CI runner, post-`git clean`), `next start` exits immediately with an error, the Playwright web server never becomes available, and every test times out. The comment on line 7 says _"starts `next dev` before tests"_ — but the actual command is `next start`, contradicting the comment and the expected behaviour.

In CI the `reuseExistingServer: !process.env.CI` line evaluates to `false`, so CI always launches the server — and always fails cold unless there is an explicit `next build` step before `playwright test` in the CI pipeline. No such build step is visible in the `package.json` test scripts.

**Fix:** Either use `npm run dev` so a build is not required, or add a build step:

```ts
// Option A — use dev server (simpler, no build required):
webServer: {
  command: 'npm run dev',
  url: 'http://localhost:3000',
  reuseExistingServer: !process.env.CI,
  timeout: 120 * 1000,
},

// Option B — build then serve (matches production behaviour):
webServer: {
  command: 'npm run build && npm run start',
  url: 'http://localhost:3000',
  reuseExistingServer: !process.env.CI,
  timeout: 180 * 1000,  // build can take >120s
},
```

Also fix the stale comment on line 7 to match whichever option is chosen.

---

## Warnings

### WR-01: `React` is not imported in `layout.tsx` but `React.ReactNode` is referenced

**File:** `app/layout.tsx:30`

**Issue:** The type annotation uses `React.ReactNode` but `React` is never imported. In React 19 with the `react-jsx` JSX transform (confirmed in `tsconfig.json: "jsx": "react-jsx"`), the JSX transform itself does not require a React import — but the explicit `React.ReactNode` namespace reference does. TypeScript in strict mode will surface this as a type error at build time: `'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.`

**Fix:** Add the React import or switch to the direct type:

```ts
// Option A — import React:
import React from 'react'

// Option B — use the direct type (preferred in React 19 projects):
export default function RootLayout({
  children,
}: {
  children: React.ReactNode  // keep as-is, but add import above
})
```

---

### WR-02: `font-check.spec.ts` is an orphaned test file — excluded from all test scripts

**File:** `tests/a11y/font-check.spec.ts` / `package.json:12`

**Issue:** `tests/a11y/font-check.spec.ts` defines a font-load assertion, but `package.json` only runs `playwright test tests/a11y/contrast.spec.ts` (file-scoped). The font-check file is never executed by `npm test` or `npm run test:a11y`. The identical font check already exists in `contrast.spec.ts` at line 44-53, so this file duplicates that assertion while also being silently ignored.

**Fix:** Either delete `font-check.spec.ts` (the test already exists in `contrast.spec.ts`) or change `test:a11y` to run the full `tests/a11y/` directory:

```json
"test:a11y": "playwright test tests/a11y/"
```

---

### WR-03: Spacing tokens are sparsely defined — many Tailwind spacing utilities used in components map to Tailwind defaults, not project tokens

**File:** `styles/tokens.css:79-88` / `app/token-audit/page.tsx:21`

**Issue:** `tokens.css` defines only `--spacing-1, 2, 4, 6, 8, 12, 16, 24, 32`. The token-audit page (and `app/page.tsx`) use `p-8`, `mb-8`, `mb-4`, `mt-12`, `mb-12`, `space-y-4`, `p-6` — these happen to coincide with the defined tokens (p-8 = spacing-8, p-6 = spacing-6, etc.), so they resolve correctly. However, Tailwind v4's `@theme` overrides only suppress the gray scale tokens explicitly; it does not suppress Tailwind's default spacing scale. Any developer using an undefined spacing value (e.g., `p-5`, `mt-3`, `gap-7`) will silently fall through to Tailwind's default spacing rather than getting a compile error. The token system has a gap that cannot be enforced by the existing `no-raw-hex.sh` gate.

**Fix:** Add a note in `tokens.css` and/or the shell gate documenting that spacing enforcement relies on convention rather than suppression, or suppress the full Tailwind spacing scale as done for grays. If full suppression is too aggressive, at minimum document the gap:

```css
/* NOTE: Tailwind default spacing scale is NOT suppressed.
 * Only the values above are project-canonical.
 * Stick to these values to stay in the design system. */
```

---

### WR-04: SVG wordmarks have hardcoded hex fill values — violates the spirit of IDENT-01 and breaks dark-mode adaptability

**File:** `public/logo-dark.svg:1` / `public/logo-light.svg:1`

**Issue:** Both SVG files hardcode fill colours (`fill="#F4F4F5"` / `fill="#A1A1AA"` in logo-dark; `fill="#18181B"` / `fill="#52525B"` in logo-light). These are not token utilities — they are raw hex values baked into the asset. The `no-raw-hex.sh` gate only scans `app/` `*.tsx|ts|css`, so these pass undetected. If the primary token values ever change (e.g., the brand palette is adjusted), the SVG files will silently diverge from the token system. Additionally, logo variants cannot adapt via CSS `currentColor` or `fill: var(--color-primary)`.

This is specifically flagged as a WARNING rather than BLOCKER because the SVGs live in `public/` (not `app/`), the gate's scope is documented, and the current hardcoded values match the token values. But the risk of silent drift is real.

**Fix:** Where practical, replace fill values with `currentColor` so the logo inherits text colour from its context, eliminating the duplication:

```svg
<path fill="currentColor" d="M32.81 ..."/>
```

If two-colour treatment is required (primary + secondary text), define the fills using CSS custom properties in a `<style>` block inside the SVG referencing the same token variable names used in `tokens.css`.

---

## Info

### IN-01: `next.config.ts` comment claims Turbopack is enabled — it is not

**File:** `next.config.ts:4-6`

**Issue:** The comment reads _"Enable experimental Turbopack for faster dev builds"_ but the config object is empty `{}`. Turbopack in Next.js 16 is enabled via `experimental: { turbopack: true }` or the `--turbo` flag in `package.json` dev script. Neither is present. The comment documents intent that was never implemented and will mislead future developers.

**Fix:** Either add the config option or remove the misleading comment:

```ts
// If Turbopack is desired:
const nextConfig: NextConfig = {
  experimental: {
    turbopack: true,
  },
}

// Or simply remove the comment if it was a placeholder:
const nextConfig: NextConfig = {}
```

---

### IN-02: `tests/a11y/font-check.spec.ts` duplicates the font assertion already in `contrast.spec.ts`

**File:** `tests/a11y/font-check.spec.ts:8-15` vs `tests/a11y/contrast.spec.ts:44-53`

**Issue:** The font load check (`document.fonts.check('16px "Plus Jakarta Sans"')`) is implemented identically in both files. Even if `font-check.spec.ts` is wired up (see WR-02), both tests assert the same thing, creating redundant test coverage with maintenance overhead.

**Fix:** Delete `tests/a11y/font-check.spec.ts` and keep the assertion only in `contrast.spec.ts` where it already lives.

---

### IN-03: `--color-muted-on-dark` token is defined but never used in any component

**File:** `styles/tokens.css:51`

**Issue:** `--color-muted-on-dark: #A1A1AA` is defined, generating a `text-muted-on-dark` / `bg-muted-on-dark` utility, but nothing in `app/` uses it. The token-audit page does not render this pair, meaning it is untested by the Wave 0 contrast audit. If it is a genuine future-use token, it should be noted as such; if it is not needed, removing it keeps the token surface minimal.

**Fix:** Either add a token pair demonstration to `app/token-audit/page.tsx` to include it in the contrast audit, or remove the token until a component actually needs it.

---

_Reviewed: 2026-08-11_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
