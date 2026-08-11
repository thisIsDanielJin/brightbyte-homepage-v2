# Phase 2: i18n Shell & Routing - Context

**Gathered:** 2026-08-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Lay the path-based `/de`/`/en` locale routing foundation so every page and link built afterwards is locale-correct from the start. Deliverables: next-intl middleware, a `[locale]` layout shell, a minimal dictionary loader, a per-URL hreflang utility, and a sitemap skeleton. DE is the default; the active locale is derived from the URL segment only — never from client-side state or localStorage.

Delivers requirements **I18N-01** (path-based `/de`/`/en`, DE default, locale from URL only), **I18N-02** (per-URL bidirectional hreflang incl. `x-default` → `/de`, in `<head>` and sitemap), **I18N-03** (path-aware `<Link>`-based language switcher preserving the current path).

**In scope:** the routing shell only — the plumbing every later phase depends on.
**Out of scope:** real header/footer/nav sections (Phase 4), editorial/marketing copy (Phase 3 → Sanity), the ~30 programmatic SEO pages (Phase 6). This phase builds the extensible skeleton those phases plug into, not their content.

</domain>

<decisions>
## Implementation Decisions

### Dictionary / Message Strategy
- **D-01:** Use **next-intl's built-in message files** (`messages/de.json`, `messages/en.json`) with `NextIntlClientProvider` and `useTranslations`/`getTranslations`. This is the idiomatic path for the locked stack (next-intl 4.13.6) — typed keys, validation, whole ecosystem — and honors the project's anti-sprawl / single-approach principle. No hand-rolled custom loader. — **Reversibility:** costly — the provider and translation hooks thread through the `[locale]` layout and every component that renders a UI string; swapping the message system later touches all of them.
- **D-02:** Message files are **minimal, shell-only** in Phase 2 — only strings the shell actually renders (language-switcher label, a nav/footer stub, a 404/error string). No speculative namespace pre-seeding; the tree grows per phase as sections are built. Rationale: editorial/marketing copy lives in Sanity from Phase 3, so this dictionary is strictly for static UI chrome, and pre-seeding invites stale/unused-key drift and guessing structure before sections exist.

### Root & Unknown-Path Behavior
- **D-03:** `localePrefix` is **`always`** — every locale is visible in the URL (`/de/...`, `/en/...`). `/` redirects to `/de`. Cleanest for SEO + hreflang correctness, zero root-path locale ambiguity, and matches the success criterion literally ("navigating to `/` redirects to `/de`"). Rejected `as-needed` (hiding the `/de` prefix) because a locale-less root fights the "locale from URL only" rule and complicates `x-default`. — **Reversibility:** costly — the prefix mode is baked into middleware, every internal `<Link>`, the switcher, hreflang alternates, and the sitemap; changing it is a site-wide URL-shape change.
- **D-04:** A path with **no locale prefix** (e.g. a user types `/kontakt`, or an old link) → middleware **prepends the default locale** (`/de/kontakt`), then Next resolves that route (renders or 404s the DE route). Standard next-intl behavior; keeps every URL locale-prefixed. Rejected immediate-404 as non-idiomatic and hostile to bare-path deep links.
- **D-05:** The `/` (and non-prefixed) redirect target is **always DE**, regardless of `Accept-Language`. Deterministic, trivially smoke-testable, keeps `x-default` → `/de` consistent, and fits the German-first local Berlin SMB audience. `Accept-Language` browser detection was explicitly rejected as non-deterministic and unnecessary for this audience.

### Layout Shell Scope
- **D-06:** The `[locale]` layout is **provider + minimal switcher only**: `<html lang={locale}>` + `NextIntlClientProvider` + `children`, plus a **minimal, unstyled header holding ONLY the language switcher** (required this phase by I18N-03). No footer/nav chrome yet — those are Phase 4 sections built to the ui-skills UX bar. The switcher's job here is to prove the routing works end-to-end; its final visual home is decided in Phase 4. Rejected "full chrome stubs" (risks designing header/footer before the identity-driven Phase 4 section work) and "bare, switcher on page body" (switcher has no natural home).

### hreflang & Metadata Plumbing
- **D-07:** hreflang is generated via a **shared `generateMetadata` helper** (e.g. `lib/i18n/metadata.ts`) that every page calls, producing `alternates.languages` = `{ de, en, 'x-default': /de }` for the current path; Next emits the `<link rel="alternate" hreflang="...">` tags. Explicit, testable, and reused by Phase 6's ~30 programmatic pages. Rejected relying purely on next-intl auto-alternates — less explicit control over `x-default` and harder to extend for programmatic pages. — **Reversibility:** reversible — a single shared helper; its call sites are uniform.
- **D-08:** The **sitemap (`sitemap.ts`) emits just the locale roots** (`/de`, `/en`) in Phase 2, but is structured as a **reusable route → alternates mapper** so Phase 6 plugs in the ~30 programmatic slugs without a rewrite. Both the sitemap and page `<head>` must carry the same bidirectional hreflang (I18N-02).
- **D-09:** A **full CI smoke test** guards success criterion 4 (no client-side locale leak): assert `<html lang>` per route, bidirectional hreflang tags present (each locale lists the other + itself + `x-default` → `/de`), `/` → `/de` redirect, and a **grep/static guard that no `localStorage` or component state derives the locale** — locale comes from the URL only. Rejected the minimal check (redirect + lang attr only) as too weak to catch client-side leaks.

### Claude's Discretion (locked to direction, tuned in research/planning)
- Exact next-intl config surface: `i18n/routing.ts` vs `i18n/request.ts` split, middleware matcher regex, and where `NextIntlClientProvider` is mounted — derive per next-intl 4.13.6 docs (ESM-only, App Router).
- Exact message-file namespace shape for the minimal shell strings (D-02) — keep flat and small.
- Exact switcher markup/interaction (must be `<Link>`-based, no client-side state mutation per I18N-03) and where the `usePathname`/`Link` come from next-intl's `createNavigation`.
- Whether the `[locale]` segment uses `generateStaticParams` for `de`/`en` now — recommended for static generation but a planning detail.
- The `setRequestLocale`/`unstable_setRequestLocale` pattern for static rendering — apply per current next-intl guidance.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### THE breaking-changes rule (read FIRST — non-negotiable)
- `AGENTS.md` (project root) — "This is NOT the Next.js you know." Next.js 16 has breaking changes vs training data. **Read the relevant guide in `node_modules/next/dist/docs/` before writing any code** — especially `node_modules/next/dist/docs/01-app/` for App Router routing, layouts, `generateMetadata`, `middleware`, and `sitemap`. Heed deprecation notices.
- `node_modules/next/dist/docs/01-app/` — the authoritative, version-matched Next.js 16.3.0 App Router docs (routing, dynamic segments, middleware, metadata/hreflang, sitemap). Prefer over any remembered API.

### Tech stack lock (versions + rationale)
- `.claude/CLAUDE.md` (project) §"i18n" — **next-intl 4.13.6** is locked: `createMiddleware` for `/de`/`/en` prefix detection, `createNavigation` wraps nav APIs, hreflang via `alternates.languages` + `sitemap()`. v4 is **ESM-only, TypeScript 5+, strict locale types**. Preferred over next-i18next (Pages Router only) and raw i18next.
- `.claude/CLAUDE.md` (project) §"Integration Patterns → Next.js App Router + next-intl" and §"Version Compatibility Matrix" (next-intl 4.13.6 ↔ Next 15+ ↔ TS 5+; ESM-only, no CJS).
- `.claude/CLAUDE.md` (project) §"What NOT to Use" — no `?lang=`/localStorage i18n (v1's approach, zero SEO value); path-based only.

### next-intl official docs (verify current API — installed during this phase)
- `https://next-intl.dev/docs/routing/middleware` — `createMiddleware`, locale prefix detection, matcher config.
- `https://next-intl.dev/docs/routing/navigation` — `createNavigation` (Link, usePathname, redirect) for the path-preserving switcher.
- `https://next-intl.dev/blog/next-intl-4-0` — v4 breaking changes (ESM-only, TS 5+, `NextIntlClientProvider` requirement).

### Requirements, roadmap & project rulebook
- `.planning/REQUIREMENTS.md` §"Internationalization" — I18N-01/02/03 exact wording.
- `.planning/ROADMAP.md` §"Phase 2: i18n Shell & Routing" — goal + 4 success criteria (`/`→`/de` + correct `<html lang>`; bidirectional hreflang + `x-default`→`/de` verified via `curl`; `<Link>` switcher preserving path with no client state; CI smoke test for client-side locale leak).
- `~/Documents/claude-contexts/freelancer.md` — BrightByte identity + the design/quality standard and Playwright verify-at-every-stage rule.

### Design tooling (mandatory on UI phases — applies to the switcher's later styling in Phase 4, minimal here)
- ui-skills CLI — `npx ui-skills start` → `categories` → `list --category <c>` → `get <slug>`. Not a driver this phase (shell is unstyled), noted for continuity.

### Existing code (Phase 1 output — the shell this phase restructures)
- `app/layout.tsx` — current flat root layout with hardcoded `lang="de"`, Plus Jakarta Sans font bridge, `bg-surface text-primary font-sans` on `<body>`. Must be split so locale drives `<html lang>` via the `[locale]` segment; **preserve the font bridge and token classes** (Phase 1 IDENT-01 tokens are the single source of truth).
- `styles/tokens.css` — the locked `@theme` token system (do not touch; consume only).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/layout.tsx`: the Plus Jakarta Sans `next/font/google` bridge (`--font-plus-jakarta-sans` → `--font-sans`) and the `bg-surface text-primary font-sans antialiased` body classes must be carried forward into the restructured locale-aware layout. The `metadata` export currently hardcodes DE title/description — this becomes locale-derived via the shared `generateMetadata` helper (D-07).
- `styles/tokens.css` + `app/globals.css`: Phase 1's `@theme` token system — consumed as-is; the switcher and any shell chrome use token utilities, no raw hex / `text-gray-*` (IDENT-01 invariant still enforced).

### Established Patterns
- **Tailwind v4 `@theme` token-first, single styling approach** (project CLAUDE.md) — the switcher and shell use utility classes consuming tokens; no SCSS, inline styles, or styled-components.
- **Zero raw hex / `text-gray-*` invariant** from Phase 1 — any shell markup added this phase must honor it.

### Integration Points
- The `[locale]` layout + `NextIntlClientProvider` become the mount point every Phase 4 section and Phase 6 page renders inside.
- The shared `generateMetadata` hreflang helper (D-07) and the extensible `sitemap.ts` mapper (D-08) are the integration seams Phase 6 extends for the ~30 programmatic `/s/[slug]` pages.
- `middleware.ts` (new) is the first request-path code in the project — establishes the matcher that all later routes live under.
- Greenfield otherwise: no i18n code, no `middleware.ts`, no `[locale]` segment yet; `app/page.tsx` is a placeholder "Coming soon" that moves under `[locale]`.

</code_context>

<specifics>
## Specific Ideas

- "Locale from the URL only, never localStorage or component state" — explicitly the anti-pattern from v1 being corrected; the CI smoke test (D-09) exists to enforce this structurally.
- `x-default` → `/de` (not `/en`) — German-first, consistent with the always-DE root redirect (D-05).
- Switcher must preserve the current path segment when swapping `/de/...` ↔ `/en/...` (I18N-03) and be pure `<Link>` navigation — no state mutation.
- Sitemap + hreflang are built now as an **extensible skeleton** specifically so Phase 6 (SEO) plugs in without a rewrite — a deliberate "build the seam early" decision.

</specifics>

<deferred>
## Deferred Ideas

- **Full header / footer / nav chrome** → Phase 4 (2D Marketing Sections), built to the ui-skills UX bar. Phase 2 ships only the minimal switcher-holding header.
- **Editorial / marketing copy** (nav labels beyond stubs, real section text) → Phase 3 (Sanity content architecture) as the single source of truth; Phase 2 messages are static UI chrome only.
- **The ~30 programmatic `/s/[slug]` SEO pages + JSON-LD** → Phase 6; Phase 2 only builds the extensible sitemap/hreflang seam they'll use.
- **Accept-Language browser detection for the root redirect** → explicitly rejected for this milestone (always-DE chosen); noted in case a future international push reconsiders it.

</deferred>

---

*Phase: 2-i18n-shell-routing*
*Context gathered: 2026-08-11*
