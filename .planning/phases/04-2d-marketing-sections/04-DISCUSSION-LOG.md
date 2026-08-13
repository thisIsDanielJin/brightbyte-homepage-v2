# Phase 4: 2D Marketing Sections - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-13
**Phase:** 4-2d-marketing-sections
**Areas discussed:** Phase slicing / scope, Page layout & section order, Hero shell (pre-3D), Contact form UX, Work grid interaction, Footer + legal pages, Motion intensity

---

## Phase Slicing / Scope

| Option | Description | Selected |
|--------|-------------|----------|
| One phase, multiple plans | Keep all 14 requirements in Phase 4; planner slices into ~4-5 sequential plans; one verification gate | ✓ |
| Split into 4a / 4b | Formally split into two roadmap phases with two gates | |
| Let me describe it | User-defined breakup | |

**User's choice:** One phase, multiple plans
**Notes:** —

### QA rigor (follow-up)

| Option | Description | Selected |
|--------|-------------|----------|
| Full loop per section | Playwright critique + ui-skills + axe on every section | ✓ |
| Full on key sections, light on rest | Heavy on hero-impression sections, automated-only elsewhere | |
| Build first, QA sweep at end | One consolidated QA sweep after all sections built | |

**User's choice:** Full loop per section
**Notes:** Matches ROADMAP success criteria; accepts slower cadence.

### D4 Sanity read (follow-up)

| Option | Description | Selected |
|--------|-------------|----------|
| Enable public read | Flip dataset visibility to Public; tokenless, no code change | ✓ |
| Server-only read token | Add SANITY_API_READ_TOKEN, keep dataset private | |
| Defer to planner | Planner researches both | |

**User's choice:** Enable public read
**Notes:** Content is public marketing copy; preserves the tokenless single-client design. USER ACTION before build-time reads.

---

## Page Layout & Section Order

| Option | Description | Selected |
|--------|-------------|----------|
| Single-page scroll + anchor nav | All sections on /de /en; header links are anchor jumps | ✓ |
| Multi-page (separate routes) | Services/work/about get own routes | |
| Let me describe it | User-defined | |

**User's choice:** Single-page scroll + anchor nav
**Notes:** —

### Section order (follow-up)

| Option | Description | Selected |
|--------|-------------|----------|
| Services→Pricing→Work→Proof | Hero → Services → Pricing → Work → Testimonials → About → Contact | ✓ |
| Work-first | Hero → Work → Testimonials → Services → Pricing → About → Contact | |
| Let me describe it | User-defined | |

**User's choice:** Services→Pricing→Work→Proof
**Notes:** Trust-building funnel; pricing early answers the SMB owner's first question.

---

## Hero Shell (pre-3D)

| Option | Description | Selected |
|--------|-------------|----------|
| Static backdrop placeholder | Text/CTA over static token backdrop in fixed-height container; R3F swaps into same container in Phase 5 (zero CLS) | ✓ |
| Reserved empty region | Container reserved but visually near-empty until Phase 5 | |
| Let me describe it | User-defined | |

**User's choice:** Static backdrop placeholder
**Notes:** Must look finished on its own and ship now.

### Hero copy source (follow-up)

| Option | Description | Selected |
|--------|-------------|----------|
| Pull from Sanity CMS | Headline/subline from siteSettings / service.blurb | ✓ |
| New copy in i18n messages | Fresh copy hardcoded via next-intl | |
| Let me write it | User provides exact copy | |

**User's choice:** Pull from Sanity CMS
**Notes:** Research flag — siteSettings may need dedicated hero fields added.

---

## Contact Form UX

| Option | Description | Selected |
|--------|-------------|----------|
| Name, Email, Message | 3 fields, lowest friction | ✓ |
| Add project-type / phone | 4-5 fields, richer leads | |
| Let me describe it | User-defined | |

**User's choice:** Name, Email, Message

### Delivery (follow-up)

| Option | Description | Selected |
|--------|-------------|----------|
| Resend via Route Handler | app/api/contact/route.ts, Zod, {data,error}, inline no-reload feedback | ✓ |
| Server Action | React 19 Server Action + useActionState | |

**User's choice:** Resend via Route Handler
**Notes:** Per AGENTS.md — debuggable, rate-limitable, curl-testable.

### Spam defense (follow-up)

| Option | Description | Selected |
|--------|-------------|----------|
| Honeypot + rate limit | Honeypot field + time-check + per-IP rate limit | ✓ |
| CAPTCHA service | Turnstile / hCaptcha | |
| None (Zod only) | No spam protection | |

**User's choice:** Honeypot + rate limit
**Notes:** No third-party dependency, no GDPR concern.

---

## Work Grid Interaction

| Option | Description | Selected |
|--------|-------------|----------|
| Static cards w/ outcome note | Image + name + one-line outcome; hover lift; no links | ✓ |
| Cards link to live client sites | Each card links to external client URL | |
| Let me describe it | User-defined | |

**User's choice:** Static cards w/ outcome note
**Notes:** Deep case studies are Phase 7; nothing to link to yet.

---

## Footer + Legal Pages

| Option | Description | Selected |
|--------|-------------|----------|
| Separate routes from Sanity | /de/impressum + /de/datenschutz (+ /en); text from siteSettings | ✓ |
| Hardcoded in i18n messages | Legal text outside CMS | |
| Let me describe it | User-defined | |

**User's choice:** Separate routes from Sanity
**Notes:** Research flag — Datenschutz body field may need adding; Impressum data already seeded.

### Footer contents (follow-up)

| Option | Description | Selected |
|--------|-------------|----------|
| Contact + nav + legal, dark surface | Uses surface-dark token (the dark accent moment); no socials | ✓ |
| Same links, light surface | Uniform light footer | |
| Let me describe it | User-defined | |

**User's choice:** Contact + nav + legal, dark surface
**Notes:** —

---

## Motion Intensity

| Option | Description | Selected |
|--------|-------------|----------|
| Whisper-quiet fades only | Fade + 8-12px translate, once, Phase 1 easing; no parallax/stagger; off under reduced-motion | ✓ |
| Staggered reveals + light parallax | More expressive; risks startup-flashy | |
| Let me describe it | User-defined | |

**User's choice:** Whisper-quiet fades only
**Notes:** "Confidence through restraint" — matches calm SMB identity.

---

## Claude's Discretion

- Exact grid/column counts, spacing rhythm, typographic scale per section (bounded by ui-skills + Phase 1 tokens).
- Header sticky vs. static behavior, CTA placement/label, pricing-tier visual presentation.

## Deferred Ideas

- About-section real photo — design to work with/without a photo until an asset exists.
- Cards linking to live client sites / deep case studies — Phase 7 (needs project URL field).
- CAPTCHA / Turnstile — only if spam volume warrants.
- Staggered reveals / parallax motion — rejected for calm identity.
