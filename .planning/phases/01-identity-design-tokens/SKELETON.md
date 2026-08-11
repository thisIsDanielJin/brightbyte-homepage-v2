# Walking Skeleton — BrightByte Berlin Homepage v2

**Phase:** 1
**Generated:** 2026-08-11

## Capability Proven End-to-End

> The smallest capability that proves the design-token system works through the full build stack.

The Next.js app compiles `styles/tokens.css` (single Tailwind v4 `@theme` block), loads Plus Jakarta Sans via `next/font` through the `@theme inline` font bridge, renders a `/token-audit` page consuming named tokens (`bg-surface`, `text-accent`, `font-sans`), and the `@axe-core/playwright` contrast audit reports zero violations against that page.

> **No database in this phase.** Phase 1 renders no app UI and has no persistence layer — it produces a CSS `@theme` token file, two logo SVGs, and a brand-voice markdown doc. The "thin end-to-end slice" here is the *token system* proven from source CSS through PostCSS build to a rendered, AA-audited page — not a DB read/write. There is intentionally nothing to persist.

## Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Next.js 16.3.0 (App Router) + React 19.2.x + TypeScript | Locked in project CLAUDE.md; App Router + RSC matches a static-first marketing site |
| Styling | Tailwind CSS v4.3.3 via `@tailwindcss/postcss`; single `@theme {}` in `styles/tokens.css` | THE one styling approach — no tailwind.config.js, no SCSS, no inline styles, no CSS-in-JS (prevents v1's sprawl) |
| Token source of truth | `styles/tokens.css` imported by `app/globals.css` | Single `@theme` block; every later phase consumes named tokens, never raw values (IDENT-01) |
| Font | Plus Jakarta Sans via `next/font/google` (self-hosted at build), bridged with `@theme inline --font-sans` | Zero third-party requests at LCP; the inline bridge resolves the runtime CSS var (RESEARCH Pitfall 1) |
| Data layer | none (Phase 1) | No persistence needed — token/asset phase. Sanity CMS enters at Phase 3 |
| Auth | none | Marketing site; no auth anywhere in the project scope |
| Deployment target | Vercel (verify Node 22.12+ before Phase 3); Phase 1 verified via local `next build` + Playwright | Full-stack proof is the build + contrast audit, not a deploy |
| Directory layout | `app/` (routes, layout, globals), `styles/tokens.css`, `public/` (logos), `docs/` (voice guide), `tests/a11y` + `tests/invariants` | Isolates the token layer; test infra separated by concern |

## Stack Touched in Phase 1

- [x] Project scaffold (Next.js 16, React 19, TypeScript, Tailwind v4, PostCSS, Playwright)
- [x] Routing — one real route (`/token-audit`)
- [ ] Database — N/A (no persistence layer this phase; explicitly out of scope)
- [x] UI — `/token-audit` page consuming named tokens + `font-sans` (the token-consuming interactive-free element)
- [x] Deployment — local full-stack proof: `next build` + `npx playwright test` (contrast audit green). Vercel deploy deferred.

## Out of Scope (Deferred to Later Slices)

- Any React component library / shadcn init → Phase 4 gate
- i18n routing (`/de`, `/en`), middleware, hreflang → Phase 2
- Sanity CMS schema, content, GROQ → Phase 3
- All marketing sections, contact form, motion animations → Phase 4
- R3F 3D hero → Phase 5
- SEO programmatic pages, sitemap → Phase 6
- The `<Logo variant>` component that selects light/dark SVG by surface → Phase 4 (RESEARCH Pitfall 4)

## Subsequent Slice Plan

Each later phase adds one vertical slice on top of these architectural decisions without altering them:

- Phase 2: `/de` and `/en` locale routing (path-based, DE default) with hreflang and language switcher
- Phase 3: Sanity schema + document-level i18n + typed GROQ queries
- Phase 4: All 2D marketing sections consuming the Phase 1 tokens + logo + voice guide
- Phase 5: R3F 3D hero (isolated via `next/dynamic({ ssr: false })`)
- Phase 6: SEO layer + programmatic pages + bilingual sitemap
- Phase 7: P2 differentiators + final a11y/motion audit
