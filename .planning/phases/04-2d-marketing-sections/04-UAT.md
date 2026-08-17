---
status: complete
phase: 04-2d-marketing-sections
source: [04-01-SUMMARY.md, 04-02-SUMMARY.md, 04-03-SUMMARY.md, 04-04-SUMMARY.md]
started: 2026-08-17T00:00:00Z
updated: 2026-08-17T00:30:00Z
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

[testing complete]

## Tests

### 1. Cold-start — live content renders (not empty states)
expected: On a fresh production server, /de shows real Sanity content in Hero, Services, Pricing, Work, Testimonials, About — not empty/"coming soon" states.
result: pass

### 2. Section order + anchor navigation
expected: Sections appear in D-05 order (Hero → Services → Pricing → Work → Testimonials → About → Contact). Header nav links jump to each section, landing below the sticky header (scroll-margin). No horizontal overflow or layout shift at 375px or 1440px.
result: pass

### 3. Footer dark-surface moment + legal links
expected: Footer renders on the dark surface (the intended dark-accent moment) on every page. Its legal links reach /impressum and /datenschutz in the current locale.
result: pass

### 4. Legal pages render (Impressum + Datenschutz)
expected: /de/impressum + /en/impressum show address/Steuernummer/§19 note; /de/datenschutz + /en/datenschutz show the privacy body in a clean ~720px column, wrapped by header/footer. Placeholder [PLATZHALTER]/[PLACEHOLDER] copy is expected for now.
result: pass

### 5. Bilingual DE/EN parity
expected: Switching between /de and /en shows fully translated copy across every section (no missing keys, no fallback English on the German page or vice-versa). Locale comes from the URL only.
result: pass

### 6. Contact form — real email send
expected: Submitting a valid message on the contact form shows an inline success confirmation with no page reload, AND a real email arrives at hello@brightbyte-berlin.com. (Deferred human send test from Wave 3.)
result: pass

### 7. Contact form — validation & spam defense
expected: automated — Zod validation (empty/bad email → inline errors, no POST), honeypot + timing 200-silent, per-IP rate-limit 429, { data, error } branching. Covered by tests/contact/*.spec.ts (20/20 green) + Route Handler review.
result: pass
source: automated

### 8. Accessibility — axe zero violations + focus-visible
expected: automated + walkthrough — axe reports zero WCAG AA violations on /de, /en, /de/impressum, /de/datenschutz (+EN); every interactive element shows a :focus-visible ring. Covered by tests/a11y/axe.spec.ts + human tab-through.
result: pass
source: automated

### 9. Reduced-motion honored
expected: automated — no entrance animation runs under prefers-reduced-motion across sections + legal pages. Covered by tests/motion/reduced.spec.ts (green against production server).
result: pass
source: automated

### 10. RESEND_API_KEY / read token stay server-side
expected: automated — RESEND_API_KEY only in app/api/contact/route.ts; SANITY_API_READ_TOKEN browser-guarded, absent from .next/static bundle. Covered by grep review + invariants (sanity-single-client, no-stega) 4/4 green.
result: pass
source: automated

## Summary

total: 10
passed: 10
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none yet]
