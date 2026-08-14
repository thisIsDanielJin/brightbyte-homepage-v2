---
phase: 04-2d-marketing-sections
plan: "03"
subsystem: contact-form
status: complete
tags: [contact, resend, zod, route-handler, spam-defense, client-island, i18n, a11y, playwright]
completed: 2026-08-14

requires:
  - 04-01-SUMMARY.md  # MotionSection wrapper + playwright config + a11y/axe spec
  - 04-02-SUMMARY.md  # page.tsx section composition (Contact was a placeholder anchor)

provides:
  - lib/contact/schema.ts                     # ONE shared Zod schema (client-preview + server)
  - app/api/contact/route.ts                  # Resend Route Handler (Zod + honeypot/timing/rate-limit)
  - components/sections/ContactSection.tsx    # the only 'use client' island of Phase 4
  - tests/contact/submit-success.spec.ts
  - tests/contact/validation.spec.ts

affects:
  - app/[locale]/page.tsx   # placeholder #contact section replaced with <ContactSection />
  - messages/de.json        # Contact namespace added
  - messages/en.json        # Contact namespace added

tech-stack:
  added:
    - (none — resend ^6.19.0 + zod 4.4.3 already installed in Wave 0)
  patterns:
    - "ONE shared Zod schema in lib/contact/ imported by both client (preview) and server (authoritative safeParse)"
    - "Route Handler Result pattern: const { data, error } = await resend.emails.send(...) then branch — never try/catch (D-09)"
    - "Layered spam defense: honeypot (200 silent) + time-to-submit <3s (200 silent) + per-IP in-memory rate limit (429) — honeypot/timing never signal detection (D-10)"
    - "ContactSection thin client island using next-intl useTranslations (I18N-01) + MotionSection entrance wrapper; useState(() => Date.now()) mount timestamp (Pitfall 8)"
    - "RESEND_API_KEY read only in app/api/contact/route.ts via process.env — never in a client component (T-04-07)"

key-files:
  created:
    - lib/contact/schema.ts
    - app/api/contact/route.ts
    - components/sections/ContactSection.tsx
    - tests/contact/submit-success.spec.ts
    - tests/contact/validation.spec.ts
  modified:
    - app/[locale]/page.tsx
    - messages/de.json
    - messages/en.json

decisions:
  - "Shared schema split into contactSchema (full, server) + contactVisibleSchema (3 fields, client preview) in one file — client validates the 3 visible fields, server re-validates the full payload including honeypot + _timestamp (never trust the client)"
  - "from: 'BrightByte Contact <noreply@brightbyte-berlin.com>' (verified Resend domain from Task 1); to: process.env.CONTACT_EMAIL ?? 'hello@brightbyte-berlin.com'; replyTo set to the submitter's email so replies go to the sender"
  - "Malformed JSON body wrapped in try/catch ONLY around req.json() (the parse), returning 400 'invalid' — this is NOT the resend send (D-09 forbids try/catch on the send, which stays a { data, error } branch)"
  - "Honeypot field kept in the DOM (className='hidden', tabIndex={-1}, aria-hidden) with a controlled value so a real submit always sends website:'' — bots that autofill it trigger the silent 200"
  - "Client sends _timestamp = form mount time; server computes now - _timestamp and treats <3000ms as a silent bot pass (D-10)"

requirements-completed: [SEC-07, SEC-10, SEC-11, QA-01, QA-03]

coverage:
  - deliverable: "Resend Route Handler validates via Zod and branches on { data, error }"
    verification:
      - kind: test
        ref: "tests/contact/submit-success.spec.ts#valid submit posts and shows inline success (no reload)"
        status: pass
      - kind: test
        ref: "tests/contact/submit-success.spec.ts#server failure surfaces inline error and re-enables the form (no reload)"
        status: pass
    human_judgment: false
  - deliverable: "Client-side per-field validation blocks submit and shows inline errors with no POST"
    verification:
      - kind: test
        ref: "tests/contact/validation.spec.ts#empty submit shows inline errors and fires no request"
        status: pass
      - kind: test
        ref: "tests/contact/validation.spec.ts#bad email shows inline email error and fires no request"
        status: pass
    human_judgment: false
  - deliverable: "Contact section: zero axe violations, DE+EN at 375px+1440px, whisper-quiet entrance"
    verification:
      - kind: test
        ref: "tests/a11y/axe.spec.ts#home /de — zero WCAG AA axe violations"
        status: pass
      - kind: test
        ref: "tests/a11y/axe.spec.ts#home /en — zero WCAG AA axe violations"
        status: pass
    human_judgment: false
  - deliverable: "RESEND_API_KEY stays server-side (never in the client bundle)"
    verification:
      - kind: command
        ref: "grep -rn RESEND_API_KEY app components lib → only app/api/contact/route.ts uses process.env.RESEND_API_KEY (ContactSection hit is a comment)"
        status: pass
    human_judgment: false
  - deliverable: "Spam defense enforced end-to-end (honeypot 200-silent + timing 200-silent + per-IP 429) against a real email send"
    human_judgment: true
    rationale: "The 200-silent honeypot/timing paths and the 429 rate limit are exercised by the Route Handler logic, but a full end-to-end assertion against live Resend (a real message arriving in the studio inbox) is the human dev-send test QA-02 defers. The Playwright specs mock /api/contact, so live delivery + spam-path behavior against the real SDK is human-verified."
  - deliverable: "QA-02 ui-skills design critique of the Contact form (desktop+mobile, de+en) reads as low-friction and calm"
    human_judgment: true
    rationale: "Design-adequacy judgment; no automated test asserts subjective low-friction feel. Screenshots captured in tests/screenshots/contact-{de,en}-{375,1440}px.png for the deferred ui-skills critique."

metrics:
  duration_minutes: 12
  completed_date: 2026-08-14
  tasks_completed: 2
  commits: 1
  files: 8

estimate:
  tokens: 80000
  raw_tokens: 40000

actuals:
  tokens: 24000
  tasks: 2
  commits: 1
---

# Phase 04 Plan 03: Contact Form Summary

**One-liner:** Zod-validated Resend Route Handler with layered spam defense (honeypot + time-to-submit + per-IP rate limit) and a single `'use client'` ContactSection island — 3-field form POSTs JSON, shows inline success/error with no reload; 20/20 contact + axe Playwright tests green across DE/EN at 375px + 1440px.

---

## What Was Built

The one interactive vertical of Phase 4: a contact form client island plus the API route that emails the studio, wired as the final section of the home page (D-05 order, after About).

### Files Created

| File | Role | Key Traits |
|------|------|-----------|
| `lib/contact/schema.ts` | ONE shared Zod schema | `contactSchema` (full — name/email/message + `website` honeypot `max(0)` + `_timestamp` number) for the server; `contactVisibleSchema` (3 visible fields) for client preview |
| `app/api/contact/route.ts` | Resend Route Handler (POST) | per-IP in-memory rate limit → 429; `safeParse` → 400; honeypot populated → 200 silent; `now - _timestamp < 3000ms` → 200 silent; `const { data, error } = await resend.emails.send(...)` → 500 on error else 200 `{ ok, id }`. NEVER try/catch on the send (D-09) |
| `components/sections/ContactSection.tsx` | The only `'use client'` island | 3 fields + hidden honeypot; `useState(() => Date.now())` mount timestamp (Pitfall 8); per-field validation via shared schema; inline loading (16px SVG spinner) / success (checkmark) / error states; no reload; MotionSection entrance; next-intl strings only (I18N-01) |
| `tests/contact/submit-success.spec.ts` | SEC-07 happy + error path | intercepts `/api/contact`; asserts payload shape, inline success (no navigation), and 500 → inline error + form re-enabled |
| `tests/contact/validation.spec.ts` | SEC-07 validation path | empty submit → inline errors + no POST fired; bad email → inline email error + no POST |

### Integration

- `app/[locale]/page.tsx`: the placeholder `#contact` section replaced with `<ContactSection />` as the final section.
- `messages/de.json` + `messages/en.json`: `Contact` namespace (heading, subline, 3 labels + placeholders, submit idle/loading, success heading/body, generic error with the studio email, validation required/email).

### Verified Addresses (Task 1, pre-approved)

- **from:** `BrightByte Contact <noreply@brightbyte-berlin.com>` (verified brightbyte-berlin.com Resend domain)
- **to:** `hello@brightbyte-berlin.com` (studio inbox — `CONTACT_EMAIL`), with `replyTo` set to the submitter's email.

---

## Gate Status

| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | PASS |
| `npm run test:invariants` (no-raw-hex / no-locale-from-state / sanity-single-client / no-stega) | PASS 4/4 |
| `npx playwright test tests/contact/*.spec.ts tests/a11y/axe.spec.ts` | PASS 20/20 |
| axe zero WCAG AA violations on /de and /en | PASS |
| `npm run build` | PASS (`/api/contact` compiled as a dynamic route) |
| T-04-07 grep — `RESEND_API_KEY` outside the Route Handler | PASS (only `process.env.RESEND_API_KEY` in `app/api/contact/route.ts`; the ContactSection hit is a comment) |

**Deferred to human (QA-02 + real send):** the interactive `npx ui-skills start` design critique of the Contact form and a real dev email-send test (submit once, confirm an email arrives via Resend) were NOT run by the executor — they require the user. Screenshots for the critique are in `tests/screenshots/contact-{de,en}-{375,1440}px.png`.

---

## Deviations from Plan

None of substance — plan executed as written. Two minor implementation refinements, neither changing the contract:

1. **[Refinement] `req.json()` wrapped in a narrow try/catch for malformed-body → 400.** The plan's Pattern 4 called `await req.json()` unguarded; a non-JSON body would throw before validation. Added a try/catch **around the parse only** (returning 400 `'invalid'`, matching the invalid-payload contract). The Resend send remains a `{ data, error }` branch with no try/catch — D-09 is fully honored (it forbids try/catch on the send, not on JSON parsing).
2. **[Refinement] `replyTo` set to the submitter's email** so studio replies go to the enquirer rather than to `noreply@`. Additive, no contract change.

**Total deviations:** 0 bugs / 0 blocking. 2 additive refinements. **Impact:** none on the plan's behavior contract.

---

## Known Stubs

None — the Route Handler performs a real Resend send (gated on the verified `RESEND_API_KEY`), and the ContactSection renders live localized copy. No placeholder text or mock data in production paths.

---

## Threat Surface Scan

Matches the plan's `<threat_model>` — no new surface beyond it:
- **T-04-07 (RESEND_API_KEY disclosure):** mitigated — key read only in the Route Handler via `process.env`; grep-verified absent from client code.
- **T-04-08 (form flood DoS):** mitigated — honeypot + time-to-submit + per-IP rate limit (A6 in-memory, low-volume solo studio).
- **T-04-09 (XSS via input):** mitigated — Zod validates shape; React escapes rendered strings; email body is plain `text`, not HTML-interpolated.
- **T-04-10 (bot passing honeypot):** mitigated — time-to-submit is the second layer, rate limit the third.
- **T-04-11 (malformed/oversized payload):** mitigated — `safeParse` → 400 before any send; malformed JSON → 400.

No un-modeled endpoints, auth paths, or trust-boundary changes introduced.

---

## Self-Check: PASSED

Files verified to exist:
- `lib/contact/schema.ts` ✓
- `app/api/contact/route.ts` ✓
- `components/sections/ContactSection.tsx` ✓
- `tests/contact/submit-success.spec.ts` ✓
- `tests/contact/validation.spec.ts` ✓

Commit verified:
- `1dd00a1` — feat(04-03): contact form Route Handler + ContactSection + specs
