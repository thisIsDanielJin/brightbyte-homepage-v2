---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
current_phase: 5
current_phase_name: R3F Hero
status: planning
stopped_at: Phase 5 context gathered
last_updated: "2026-08-19T13:47:15.953Z"
last_activity: 2026-08-18
last_activity_desc: Phase 04 complete, transitioned to Phase 5
progress:
  total_phases: 5
  completed_phases: 4
  total_plans: 12
  completed_plans: 12
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-08-18)

**Core value:** The site must feel refined, modern, and quietly stunning on first impression — calm, confident visual identity — so a local SMB owner immediately trusts the craft.
**Current focus:** Phase 05 — R3F Hero

## Current Position

Phase: 5 — R3F Hero
Plan: Not started
Status: Ready to plan
Last activity: 2026-08-18 — Phase 04 complete, transitioned to Phase 5

Progress: [█████▌────] 57% (4/7 phases)

## Performance Metrics

**Velocity:**

- Total plans completed: 12
- Average duration: —
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 | 2 | - | - |
| 02 | 3 | - | - |
| 3 | 3 | - | - |
| 04 | 4 | - | - |

**Recent Trend:**

- Last 5 plans: —
- Trend: —

*Updated after each plan completion*
**Per-Plan Metrics:**

| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| Phase 01-identity-design-tokens P01 | 23min | 3 tasks | 15 files |
| Phase 01 P02 | 6min | 2 tasks | 5 files |
| Phase 03 P02 | ~15m | 7 tasks | 11 files |
| Phase 03 P03 | ~40m | 5 tasks | 5 files |
| Phase 04-2d-marketing-sections P01 | 30 | 5 tasks | 22 files |
| Phase 04-2d-marketing-sections P02 | 32 | 3 tasks | 16 files |
| Phase 04 P03 | 12 min | 2 tasks | 8 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Roadmap: Identity-first hard gate — Phase 1 COMPLETE before any component work (prevents v1's root cause)
- Roadmap: Sanity i18n strategy locked in Phase 3 (document-level) before any frontend wiring
- Roadmap: Phase 6 depends on Phase 3 (not Phase 5) — SEO pages need schema + routing but not the hero
- Phase 1: Token variable naming: --color-primary not --color-text-primary avoids Tailwind v4 double-prefix antipattern
- Phase 1: styles/tokens.css is established single @theme source of truth for all phases
- Phase 1: SVG path generation via fontTools instancer from .next woff2 — no extra font download needed
- Phase 1: svgo config: convertColors:false + keepRoleAttr:true preserves token hex values and role=img
- [Phase ?]: D-10 $locale-filter query contract confirmed as-is; typed SERVICES_QUERY via defineQuery + getServices(locale)
- [Phase ?]: sanity typegen wired via sanity-typegen.json path glob (no src/ dir); schema.json gitignored, sanity.types.ts committed
- [Phase ?]: Studio metadata moved to server layout.tsx (Next 16 forbids metadata export from 'use client')
- [Phase ?]: Added required readOnly 'language' field to all 5 doc-i18n types (plugin mandates declaration; Wave 1 assumed injection) — Rule 2 fix
- [Phase ?]: Content-presence check reads via authenticated Sanity CLI (documents query) — anonymous reads still return [] pending public-read toggle (03-01 D4); no token committed
- [Phase ?]: Stega build guard uses Perl -CSD codepoint scan, not grep -P (BSD grep lacks -P; GNU grep -P is locale-fragile)
- [Phase ?]: MotionSection thin 'use client' wrapper — RSC sections remain async and pass children to motion.section to avoid pushing client boundary too high (Pitfall 4)
- [Phase ?]: proxy.ts matcher extended to exclude static file extensions — SVG logos were being 301-redirected to locale-prefixed URLs by next-intl middleware
- [Phase ?]: Pricing sourced exclusively from Sanity price object — no hardcoded figures (T-04-04 mitigated)
- [Phase ?]: aboutPhoto optional field added to siteSettings — initials DJ fallback ships now, real photo uploads with no code change
- [Phase ?]: WorkSection always renders empty state; Services/Pricing/Testimonials return null on 0 data

### Pending Todos

None yet.

### Blockers/Concerns

- Phase 5: 3D hero concept (scene geometry, lighting, draw call budget) is undefined; needs research during Phase 5 planning
- General: Verify Vercel project Node runtime is 22.12+ before deploy (Sanity v6 requirement)
- Pre-deploy (not code-gating): add SANITY_API_READ_TOKEN to Vercel env (all environments); rotate the exposed Resend API key; author real DSGVO Datenschutz copy (DE+EN) in Studio.

## Deferred Items

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| P2 scope | Case studies, FAQ, Process, Guarantee | Phase 7 | Roadmap creation |
| Legal content | Author real DSGVO Datenschutz + review Impressum copy (DE+EN) in Studio — currently PLACEHOLDER | Before public launch | Phase 04 (D-12) |
| Test | mobile-375 language-switcher smoke (tests/i18n/smoke.spec.ts:63) — switcher inside collapsed hamburger; accepted pre-existing | Later phase | Phase 04 gate |
| QA-02 | ui-skills interactive design critique of legal pages + contact form (screenshots in tests/screenshots/) | Post-phase | Phase 04 |
| Verify | Real dev email-send test for contact form | ✓ Done — UAT Test 6 confirmed real delivery to hello@brightbyte-berlin.com (2026-08-18) | Phase 03/04 |
| Deploy | Add SANITY_API_READ_TOKEN to Vercel env (all environments) | Before deploy | Phase 04 |

## Session Continuity

Last session: 2026-08-19T13:47:15.873Z
Stopped at: Phase 5 context gathered
Resume file: .planning/phases/05-r3f-hero/05-CONTEXT.md
