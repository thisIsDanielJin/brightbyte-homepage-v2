# Phase 4: 2D Marketing Sections - Context

**Gathered:** 2026-08-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Turn the placeholder locale home shell into the full 2D marketing site. Build all 9 P1 sections — hero shell, services, pricing, work grid, testimonials, about, contact form, header/footer/nav, and Impressum/Datenschutz legal pages — bilingual (DE/EN), mobile-responsive (375px + 1440px), accessible (WCAG AA, axe-clean, `:focus-visible`), and animated with restraint. Every section passes a Playwright screenshot-critique loop + ui-skills review + axe pass before it is considered done.

Requirements: SEC-01…SEC-11, QA-01, QA-02, QA-03 (14 total).

**In scope:** the 9 sections listed above, content read live from Sanity, Resend contact form, restrained motion, per-section QA loop.
**Not in scope:** the R3F 3D hero itself (Phase 5 — this phase builds only the 2D shell that reserves its space); deep case-study pages (Phase 7); programmatic `/s/[slug]` SEO pages + JSON-LD + sitemap (Phase 6); FAQ / process / guarantee sections (Phase 7 P2).
</domain>

<decisions>
## Implementation Decisions

### Phase Slicing & QA
- **D-01:** Keep all 14 requirements in a single Phase 4; the planner slices into ~4-5 sequential plans (suggested: shell + header/footer tracer → content sections → contact form → legal + full a11y/mobile/motion sweep). One phase, one verification gate.
- **D-02:** Full QA loop **per section** — Playwright desktop + mobile screenshot critique iterated, ui-skills CLI skill loaded per section, `axe-playwright` zero violations. This is the highest bar and matches the ROADMAP success criteria; accept the slower cadence.
- **D-03:** Resolve the D4 Sanity read blocker by **enabling public (anonymous) dataset read** at sanity.io/manage/project/ddrca30s/datasets → `production` → Public. No token added — preserves the Phase 3 single tokenless `stega:false` client design. The resolution MUST NOT introduce a client-imported read token. — **Reversibility:** reversible — dataset visibility can be toggled back; content is public marketing copy. **USER ACTION required before build-time reads work.**

### Page Layout & Section Order
- **D-04:** Single-page scroll on `/de` and `/en` (all sections on the one locale home route). Header nav links are in-page anchor jumps (`#services`, `#work`, `#contact`), not separate routes. — **Reversibility:** costly — splitting into routes later touches nav, metadata, and section mounting.
- **D-05:** Section order: **Hero → Services → Pricing → Work → Testimonials → About → Contact**, wrapped by header (top) and footer (bottom). Trust-building funnel; pricing appears early to answer the SMB owner's first question.

### Hero Shell (pre-3D)
- **D-06:** Hero renders headline + subline + CTA over a **static token-based backdrop** (subtle gradient or solid surface) inside a **fixed-height container**. Phase 5 swaps the backdrop for the R3F canvas in the SAME container → zero CLS. Must look finished on its own and ship now. — **Reversibility:** reversible — the container contract is the durable part; the backdrop is a swap-in.
- **D-07:** Hero headline + positioning copy come from **Sanity CMS** (siteSettings / service.blurb — the "you own the code, no lock-in, fixed price, reply in 24h" framing). Single source of truth, editable. RESEARCH FLAG: siteSettings may not yet have dedicated hero headline/subline fields — if absent, a small schema addition is needed (still document-i18n, DE/EN).

### Contact Form (SEC-07)
- **D-08:** Fields: **Name, Email, Message** (3 fields). Lowest friction maximizes inbound inquiries (the site's success metric).
- **D-09:** Deliver via a **Route Handler** at `app/api/contact/route.ts` — Zod-validate payload, call `resend.emails.send()`, branch on destructured `{ data, error }` (never try/catch). Client fetches and shows inline success confirmation / inline error — no full-page reload. Per AGENTS.md (Route Handler over Server Action: debuggable, rate-limitable, curl-testable). — **Reversibility:** costly — switching to a Server Action later reworks the client submit path and validation wiring.
- **D-10:** Spam defense: **hidden honeypot field + time-to-submit check + per-IP rate limit** in the route handler. No third-party CAPTCHA → zero user friction, no GDPR/cookie concern. Sufficient for a low-volume solo studio.

### Work Grid (SEC-04)
- **D-11:** Grid of project cards: image + name + one-line outcome note (e.g. "Blumenspiess — +200% Anfragen"). Cards **display only, no links** (deep case-study pages are Phase 7, nothing to link to yet). Add a subtle hover lift for polish. 4-6 projects from Sanity.

### Legal Pages & Footer (SEC-08, SEC-09)
- **D-12:** Impressum + Datenschutz as their **own routes** (`/de/impressum`, `/de/datenschutz` + `/en` equivalents), text pulled from **Sanity siteSettings** (address, Steuernummer, §19 UStG note already seeded in Phase 3). RESEARCH FLAG: a Datenschutz/privacy body field may need adding to the siteSettings (or a dedicated legal) schema — Impressum data already exists.
- **D-13:** Footer on a **dark surface** (uses the Phase 1 `--color-surface-dark` / `--color-on-dark` tokens — the intended "dark accent moment"): contact email + anchor nav links + legal links (Impressum, Datenschutz) + copyright. No social feeds (anti-feature per PROJECT.md).

### Motion (SEC-11, criterion 5)
- **D-14:** **Whisper-quiet fades only** — short fade + small (8-12px) upward translate on section entry, viewport-triggered once, using the Phase 1 easing/duration tokens. No parallax, no scale, no stagger, no continuous motion. "Confidence through restraint." Fully disabled when `prefers-reduced-motion: reduce` is set (no animation plays). Use `motion/react` viewport triggers.

### Claude's Discretion
- Exact grid/column counts, spacing rhythm, and typographic scale per section — bounded by the ui-skills review and Phase 1 tokens.
- Header sticky vs. static behavior, CTA button placement/label, and pricing-tier visual presentation — planner/UI-spec decide within the calm-editorial identity.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase inputs (this phase)
- `.planning/ROADMAP.md` §"Phase 4: 2D Marketing Sections" — goal + 5 success criteria (the verification target)
- `.planning/REQUIREMENTS.md` — SEC-01…SEC-11, QA-01/02/03 definitions (incl. pricing figures ~€690 landing / ~€2,500 multi-page, the 3 outcome-anchored testimonials, anti-features list)
- `.planning/PROJECT.md` — core value, audience fit (refined-minimal, never startup-flashy), constraints, Out of Scope

### Prior-phase contracts (hard dependencies)
- `.planning/phases/03-sanity-content-architecture/03-VERIFICATION.md` — what the CMS delivers; D4 forward dependency (public read) recorded here
- `.planning/phases/03-sanity-content-architecture/03-03-SUMMARY.md` — seeded content shape (2 service tiers incl. D-05 two-tier pricing, 3 D-06 testimonials, 3 projects, siteSettings DE/EN contact/legal)
- `lib/sanity/queries.ts` — the typed `$locale` query layer to consume (getServices/getProjects/getTestimonials/getSiteSettings + BySlug variants)
- `lib/sanity/client.ts` — the ONE tokenless `stega:false` / `perspective:'published'` read client (do not add a second client; do not add a client token)
- `styles/tokens.css` — the single `@theme` token system (colors incl. surface-dark/on-dark, motion easing/duration tokens); IDENT-01 invariant: zero raw hex / no `text-gray-*` in components
- `app/[locale]/layout.tsx` + `app/[locale]/page.tsx` — the shell being built onto (Plus Jakarta Sans bridge, NextIntlClientProvider, minimal switcher-only header to be replaced)

### Stack rules & standards (MANDATORY)
- `AGENTS.md` (repo root) — "This is NOT the Next.js you know" — read `node_modules/next/dist/docs/` for Next 16 APIs before writing code; Tailwind v4 `@theme` only (no tailwind.config.js); Resend `{ data, error }` pattern; motion imported from `motion/react`; `next/image` + sharp; ESM-only
- `~/Documents/claude-contexts/freelancer.md` — BrightByte freelance identity/pricing rules (NEVER author old pricing: €35/h, €450, Freundespreis)
- ui-skills CLI — `npx ui-skills start` → `categories` → `list --category <c>` → `get <slug>` (QA-02: load smallest relevant skill per section)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `lib/sanity/queries.ts`: typed per-locale fetchers ready to call from Server Components — every section reads through these.
- `lib/sanity/image.ts` (`urlFor`): responsive image URL builder for work-grid / about images via `next/image`.
- `styles/tokens.css`: complete palette + motion tokens; surface-dark/on-dark tokens exist specifically for the footer dark moment (D-13).
- `components/LocaleSwitcher.tsx`: existing `<Link>`-based path-preserving switcher — folds into the real header (D-04 nav).
- `lib/i18n/metadata.ts` (`buildHreflangAlternates`, `BASE_URL`): reuse for per-section-route metadata (legal pages).

### Established Patterns
- Server Components fetch content; `stega:false` on all metadata/static-params paths (Phase 3 invariant — do not regress). Guarded by `tests/invariants/*.sh`.
- Locale derived from URL segment only (`params.locale`), never client state (Phase 2 invariant, CI-guarded).
- Single styling approach: Tailwind v4 utilities consuming `@theme` tokens; no SCSS, no inline styles, no CSS-in-JS.

### Integration Points
- New sections mount inside `app/[locale]/page.tsx` (replacing the placeholder), wrapped by a real header/footer added to `app/[locale]/layout.tsx`.
- New route: `app/api/contact/route.ts` (Resend + Zod).
- New routes: `app/[locale]/impressum/page.tsx`, `app/[locale]/datenschutz/page.tsx`.
- Regression gate to keep green: `tsc --noEmit` + `test:invariants` (4 guards) + `test:content` (9 checks).

</code_context>

<specifics>
## Specific Ideas

- Pricing section must present the two seeded tiers as data: landing "ab €1.500"-style priceFrom tier and the price-on-request full-site tier (exact figures live in Sanity — do not hardcode; never reintroduce old v1 pricing).
- Testimonials must surface the metric separately from the quote (Blumenspiess +200%, Learnstep 92%, Lumo +47%) — the outcome value is its own field.
- Footer is the intended place for the Phase 1 dark-surface accent moment.

</specifics>

<deferred>
## Deferred Ideas

- **About-section real photo:** SEC-06 wants a real photo of Daniel. No confirmed asset yet — RESEARCH FLAG: design the About section to work gracefully with OR without a photo (initials mark / illustration fallback) until a real photo exists. Not blocking; capture the asset question during planning.
- **Cards linking to live client sites / deep case studies:** rejected for this phase — case-study pages are Phase 7. If a "visit live site" link is wanted later, it needs a URL field on the project schema.
- **CAPTCHA / Turnstile:** deferred — honeypot + rate limit is sufficient now; revisit only if spam volume warrants.
- **Staggered reveals / parallax motion:** rejected — kept to whisper-quiet fades for the calm SMB identity.

</deferred>

---

*Phase: 4-2d-marketing-sections*
*Context gathered: 2026-08-13*
