---
phase: 04-2d-marketing-sections
plan: "04"
subsystem: legal-pages-and-phase-gate
status: complete
tags: [legal, impressum, datenschutz, sanity, hreflang, footer-dark-surface, a11y, motion, phase-gate, playwright]
completed: 2026-08-17

requires:
  - 04-01-SUMMARY.md  # Header + Footer shell, MotionSection wrapper, buildHreflangAlternates, a11y/axe + motion specs
  - 04-02-SUMMARY.md  # page.tsx section composition (D-05 order)
  - 04-03-SUMMARY.md  # ContactSection (final section) + contact/axe specs

provides:
  - app/[locale]/impressum/page.tsx           # Impressum RSC (address + Steuernummer + §19 UStG from Sanity)
  - app/[locale]/datenschutz/page.tsx         # Datenschutz RSC (datenschutzBody prose from Sanity)
  - sanity/schemaTypes/siteSettings.ts        # + impressumBody (optional) + datenschutzBody (required)
  - lib/sanity/queries.ts                      # SITE_SETTINGS_QUERY projects impressumBody, datenschutzBody
  - tests/legal/pages.spec.ts

affects:
  - sanity.types.ts   # regenerated via typegen for the two new fields
  - messages/de.json  # impressum/datenschutz page-title keys
  - messages/en.json  # impressum/datenschutz page-title keys

tech-stack:
  added:
    - (none — no new dependencies)
  patterns:
    - "Legal routes are RSC under [locale] shell; locale from awaited params only (I18N-01, no client state)"
    - "generateMetadata returns alternates: buildHreflangAlternates('/impressum'|'/datenschutz') for bidirectional hreflang"
    - "Legal body is plain text (Phase 3 convention — no Portable Text) rendered whitespace-pre-wrap in a max-w-720px editorial column"
    - "Page titles come from next-intl messages, NOT raw Sanity strings — keeps stega tokens out of metadata (T-04-13)"
    - "Single server-only read client reused (SANITY_API_READ_TOKEN); no second client, stega:false intact (CMS-03)"

key-files:
  created:
    - app/[locale]/impressum/page.tsx
    - app/[locale]/datenschutz/page.tsx
    - tests/legal/pages.spec.ts
  modified:
    - sanity/schemaTypes/siteSettings.ts
    - lib/sanity/queries.ts
    - sanity.types.ts
    - messages/de.json
    - messages/en.json

decisions:
  - "D-03 SUPERSEDED: free-tier Sanity cannot make the dataset publicly readable, so reads use a SERVER-ONLY SANITY_API_READ_TOKEN (Viewer role, no NEXT_PUBLIC_ prefix, browser-guarded getReadToken() in sanity/env.ts). Single-client + stega:false invariants stay intact. Commit 8dc010c. Legal-page reads (T-04-12) flow through this same client — no token in the bundle."
  - "impressumBody optional (address/Steuernummer/§19 already structured on siteSettings); datenschutzBody required (the DSGVO prose has no other home)"
  - "Legal copy currently seeded as PLACEHOLDER text ([PLATZHALTER …] DE / [PLACEHOLDER …] EN) pending Daniel's real DSGVO authoring — page renders and passes structural tests; final legal copy is a human content deliverable (D-12)"
  - "Pre-existing mobile-375 language-switcher test failure (tests/i18n/smoke.spec.ts:63) accepted as documented, NOT introduced by Phase 4 — the LocaleSwitcher lives inside the collapsed hamburger at 375px (last touched Phase 02, commit 06bab0a); the test clicks it directly instead of opening the menu first. Logged to Deferred Items."

requirements-completed: [SEC-09, SEC-10, SEC-11, QA-01, QA-02, QA-03]

coverage:
  - deliverable: "Impressum renders address + Steuernummer + §19 UStG from Sanity in DE+EN inside the site shell"
    verification:
      - kind: test
        ref: "tests/legal/pages.spec.ts#impressum shows address + Steuernummer (de/en × 375/1440)"
        status: pass
    human_judgment: false
  - deliverable: "Datenschutz renders the datenschutzBody prose from Sanity in DE+EN inside the site shell"
    verification:
      - kind: test
        ref: "tests/legal/pages.spec.ts#datenschutz shows body wrapped by header/footer"
        status: pass
    human_judgment: false
  - deliverable: "Both legal routes emit correct bidirectional hreflang"
    verification:
      - kind: test
        ref: "tests/legal/pages.spec.ts#hreflang alternates present on /impressum and /datenschutz"
        status: pass
    human_judgment: false
  - deliverable: "Final phase sweep: 9 sections + 2 legal pages, zero axe violations, no reduced-motion animation, focus-visible everywhere"
    verification:
      - kind: test
        ref: "npx playwright test (full suite) — 126 passed against production server; axe zero-violation on /de,/en,/de/impressum,/de/datenschutz + EN; reduced-motion honored"
        status: pass
    human_judgment: false
  - deliverable: "Footer dark-surface moment site-wide + legal links reach the legal routes"
    human_judgment: true
    rationale: "The footer dark-surface (--color-surface-dark/--color-on-dark) and legal-link routing were confirmed by human visual walkthrough at 375px + 1440px in both locales (human-verify gate)."
  - deliverable: "Real DSGVO legal copy authored in Studio (DE+EN)"
    human_judgment: true
    rationale: "Legal content deliverable (D-12) — currently PLACEHOLDER prose so pages render/test; Daniel must author the final DSGVO text before public launch. Not code-gating."
  - deliverable: "QA-02 ui-skills critique of legal pages + deferred contact-form critique"
    human_judgment: true
    rationale: "Design-adequacy judgment; screenshots captured in tests/screenshots/ for the interactive ui-skills critique."

metrics:
  duration_minutes: 25
  completed_date: 2026-08-17
  tasks_completed: 2
  commits: 2
  files: 8

estimate:
  tokens: 85000
  raw_tokens: 42000

actuals:
  tokens: 30000
  tasks: 2
  commits: 2
---

# Phase 04 Plan 04: Legal Pages + Final Phase Gate Summary

**One-liner:** Impressum + Datenschutz routes rendered from Sanity siteSettings (new `impressumBody`/`datenschutzBody` fields) inside the [locale] shell with bidirectional hreflang, plus the phase-level verification gate — full Playwright suite green against the production server except the one accepted pre-existing mobile-375 language-switcher test.

---

## What Was Built

The last requirement of Phase 4 (SEC-09 legal routes) and the single phase verification gate (D-01).

### Files Created

| File | Role | Key Traits |
|------|------|-----------|
| `app/[locale]/impressum/page.tsx` | Impressum RSC | max-w-720px editorial column; address/Steuernummer/§19 UStG from Sanity; title from next-intl; hreflang via `buildHreflangAlternates('/impressum')` |
| `app/[locale]/datenschutz/page.tsx` | Datenschutz RSC | `datenschutzBody` prose, whitespace-pre-wrap; title from next-intl; hreflang via `buildHreflangAlternates('/datenschutz')` |
| `tests/legal/pages.spec.ts` | SEC-09 structural coverage | de/en × 375/1440: address + Steuernummer on Impressum, body on Datenschutz, both wrapped by header/footer |

### Files Modified

| File | Change |
|------|--------|
| `sanity/schemaTypes/siteSettings.ts` | + `impressumBody` (text, optional) + `datenschutzBody` (text, required) |
| `lib/sanity/queries.ts` | `SITE_SETTINGS_QUERY` projects `impressumBody, datenschutzBody` |
| `sanity.types.ts` | regenerated via typegen |
| `messages/{de,en}.json` | Impressum/Datenschutz page-title keys |

---

## Gate Status (Phase Verification Gate — D-01)

| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | PASS |
| `npm run test:invariants` (no-raw-hex / no-locale-from-state / sanity-single-client / no-stega) | PASS 4/4 |
| `npm run test:content` (DE/EN parity, D-05 pricing, D-06 outcomes, contactEmail) | PASS 9/9 |
| `npm run build` | PASS (both legal routes compiled as dynamic `/[locale]/…`) |
| `npx playwright test` (full suite, **production server**) | 126 passed / 1 accepted pre-existing failure |
| axe zero WCAG AA violations on /de, /en, /de/impressum, /de/datenschutz (+ EN) | PASS |
| reduced-motion honored across sections + legal pages | PASS |

**Human-verify gate (D-01): APPROVED** — the user walked through 375px + 1440px in both locales and confirmed: D-05 section order (Hero→Services→Pricing→Work→Testimonials→About→Contact), no overflow/CLS, anchor-nav scroll-margin, footer dark-surface moment + legal-link routing to /impressum and /datenschutz, and :focus-visible on every interactive element. Verdict: "looks good enough."

### Important gate finding — dev-server false failures

The full suite initially showed 7 shifting failures (hero/motion/header). Root cause: Playwright's `webServer` is configured for `next start` with `reuseExistingServer: true`, and a **Turbopack dev server** was still running on port 3000 from the manual walkthrough. Playwright reused the slow dev server, so first-hit route compilation + un-optimized animation timing produced intermittent races (different tests failed each run — the flakiness signature). After killing the dev server and running `next build` + suite against the production server, the flakes vanished: **126 passed, only the 1 accepted pre-existing failure remains.** Lesson: always run the phase gate against `next start`, never a reused dev server.

---

## Deviations from Plan

The plan text (and its threat register T-04-12) still described reads as "tokenless / anonymous / D-03 public read." That assumption is **superseded**: the Sanity free tier cannot make the dataset publicly readable, so reads (including these legal-page reads) now flow through the single **server-only** `SANITY_API_READ_TOKEN` client. The single-client + stega:false invariants are unchanged, so the threat mitigation intent (T-04-12: one stega:false client, no token in the bundle) holds — only the "tokenless" wording is outdated. No behavioral deviation in the routes themselves.

**Total deviations:** 0 bugs / 0 blocking. 1 upstream-assumption correction (D-03 supersession, already committed in 8dc010c).

---

## Known Stubs / Follow-ups

- **Legal copy is PLACEHOLDER.** `datenschutzBody` (and `impressumBody`) are seeded with `[PLATZHALTER …]` / `[PLACEHOLDER …]` prose so the pages render and pass structural tests. **Daniel must author the real DSGVO Datenschutzerklärung (DE+EN) in Studio before public launch** (D-12 — legal content deliverable, not code).
- **Pre-existing mobile-375 language-switcher test** (`tests/i18n/smoke.spec.ts:63`) accepted as documented; the switcher lives inside the collapsed hamburger at 375px. To fix later: open the menu before clicking the switcher.
- **Deferred QA-02 ui-skills critiques** (legal pages + contact form) — screenshots captured in `tests/screenshots/`.
- **Real dev email-send test** (contact form, deferred from Wave 3) — submit one message, confirm delivery to hello@brightbyte-berlin.com.

---

## Threat Surface Scan

Matches the plan's `<threat_model>` with the D-03 supersession noted:
- **T-04-12 (Sanity read client):** mitigated — reuses the single `stega:false` client; token is server-only (not tokenless as originally worded), never in the bundle; `sanity-single-client.sh` + `no-stega-in-build.sh` green.
- **T-04-13 (stega in legal titles):** mitigated — titles from i18n messages, body rendered as escaped text; `no-stega-in-build.sh` green.
- **T-04-14 (locale injection):** mitigated — next-intl constrains locale to ['de','en']; `no-locale-from-state.sh` green.

---

## Self-Check: PASSED

Files verified to exist:
- `app/[locale]/impressum/page.tsx` ✓
- `app/[locale]/datenschutz/page.tsx` ✓
- `tests/legal/pages.spec.ts` ✓
- `sanity/schemaTypes/siteSettings.ts` (impressumBody + datenschutzBody) ✓
- `lib/sanity/queries.ts` (projection) ✓

Commits verified:
- `704a3ec` — feat(04-04): Impressum + Datenschutz routes + legal schema fields (SEC-09)
- `be5ff39` — docs(04-04): log pre-existing i18n mobile smoke failure to deferred-items + windows ledger

**Phase 4 (2D Marketing Sections) is complete — ready for /gsd-verify-work.**
