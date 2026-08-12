---
phase: 3
slug: sanity-content-architecture
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-08-12
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `@playwright/test` ^1.49.0 + bash invariant guards + `sanity` CLI (typegen/schema extract) + node/GROQ scripts |
| **Config file** | `playwright.config.ts` (exists); bash guards under `tests/invariants/`; new node check under `tests/sanity/` |
| **Quick run command** | `npx tsc --noEmit` (fast — catches query/type drift after typegen) |
| **Full suite command** | `npm run build && npm run test:invariants && npm run test:content` |
| **Estimated runtime** | ~60–120 seconds (build-dominated) |

---

## Sampling Rate

- **After every task commit:** `npx tsc --noEmit`
- **After every plan wave:** `npm run build` (the CMS-03 stega + typegen gate)
- **Before `/gsd-verify-work`:** Full suite green (`build` + `test:invariants` + `test:content`)
- **Max feedback latency:** ~120 seconds (build)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 03-01-02 | 01 | 1 | CMS-01/03 | T-03-03 | corrected peer set installed, no token | setup | `npm ls next-sanity @sanity/client styled-components && npx sanity --help` | ✅ post-install | ⬜ pending |
| 03-01-03 | 01 | 1 | CMS-03 | T-03-03 | no token committed; env gitignored | static guard | `git check-ignore .env.local && grep -rn "sk[A-Za-z0-9]" lib/ sanity/ app/` | ✅ | ⬜ pending |
| 03-01-05 | 01 | 1 | CMS-01 | T-03-06 | typed schema, plugin language field | typecheck | `npx tsc --noEmit` | ✅ | ⬜ pending |
| 03-01-08 | 01 | 1 | CMS-01 | T-03-04 | /studio auth-gated, matcher excludes it | integration | `next dev` + `/studio` renders; grep proxy.ts for `studio` | ✅ | ⬜ pending |
| 03-01-10 | 01 | 1 | CMS-03 | T-03-01/02 | single stega:false published client | typecheck | `npx tsc --noEmit` | ✅ | ⬜ pending |
| 03-01-11 | 01 | 1 | CMS-03 | T-03-02 | build green, no stega, locale reads | build | `npm run build` | ✅ | ⬜ pending |
| 03-02-02 | 02 | 2 | CMS-01 | T-03-06 | typed doc types, per-locale slugs | typecheck | `npx tsc --noEmit` | ✅ | ⬜ pending |
| 03-02-04 | 02 | 2 | CMS-01 | T-03-05 | siteSettings singleton locked | integration | `sanity schema extract`; /studio single Site Settings | ✅ | ⬜ pending |
| 03-02-06 | 02 | 2 | CMS-03 | T-03-07 | full typed $locale query set | typecheck | `npm run types:sanity && npx tsc --noEmit` | ✅ | ⬜ pending |
| 03-02-07 | 02 | 2 | CMS-01 | — | 5 types + language field | build | `sanity schema extract && npm run build` | ✅ | ⬜ pending |
| 03-03-01 | 03 | 3 | CMS-02 | T-03-09 | canonical content, no old pricing | data | `sanity dataset import` + Vision/GROQ read | ❌ W0 | ⬜ pending |
| 03-03-02 | 03 | 3 | CMS-03 | T-03-08 | one stega:false published client | static guard | `bash tests/invariants/sanity-single-client.sh` | ❌ W0 | ⬜ pending |
| 03-03-03 | 03 | 3 | CMS-03 | T-03-08 | no stega Unicode in build | build guard | `bash tests/invariants/no-stega-in-build.sh` | ❌ W0 | ⬜ pending |
| 03-03-04 | 03 | 3 | CMS-02 | — | DE/EN parity + required content | data | `npm run test:content` | ❌ W0 | ⬜ pending |
| 03-03-05 | 03 | 3 | CMS-02/03 | T-03-08/10 | full gate green, single source | full suite | `npm run build && npm run test:invariants && npm run test:content` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Note: this phase's "Wave 0" test infra is created inside the execution waves (Plan 03) rather than a separate pre-wave, because every Sanity-specific guard depends on the installed toolchain + authored schema that Waves 1–2 produce. The tracer (Plan 01) is itself the earliest end-to-end verification.*

- [ ] Confirm Node ≥22.12 (Plan 01 task 03-01-01) before any `sanity` CLI runs
- [ ] `sanity typegen` wired into `types:sanity` + `prebuild` (Plan 01 task 03-01-10)
- [ ] `tests/invariants/sanity-single-client.sh` (Plan 03 task 03-03-02)
- [ ] `tests/invariants/no-stega-in-build.sh` (Plan 03 task 03-03-03)
- [ ] `tests/sanity/content-presence.mjs` + `test:content` script (Plan 03 task 03-03-04)

Existing infra (Playwright + no-raw-hex + no-locale-from-state bash guards) carries forward unchanged.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `/studio` renders the editor and shows the schema types with a language field | CMS-01 | Studio is Sanity's own client app behind Sanity auth; no headless assertion in this phase | `next dev`, open `/studio`, log in, confirm the five types appear and each new doc has a language selector; siteSettings shows a single locked entry |
| DE→EN "Create translation" links a document pair | CMS-01 | Plugin UX interaction | In Studio, create a DE doc, click "Create translation" → EN, confirm the pair links |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or a Wave-0/tracer dependency
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify (every task has tsc/build/guard)
- [ ] Wave 0 covers all MISSING references (guards created in Plan 03; typegen in Plan 01)
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter (set by /gsd-validate-phase)

**Approval:** pending
