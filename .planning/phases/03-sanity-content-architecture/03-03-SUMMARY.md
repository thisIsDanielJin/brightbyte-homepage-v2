---
phase: 03-sanity-content-architecture
plan: 03
subsystem: cms
tags: [sanity, content-seed, ndjson, invariants, stega, groq, i18n, verification]

# Dependency graph
requires:
  - phase: 03-sanity-content-architecture
    plan: 02
    provides: five doc-i18n types, single stega:false client, full typed $locale query set, embedded /studio, typegen wiring
provides:
  - Canonical BrightByte content authored into ddrca30s/production as published DE/EN pairs for all five types (CMS-02) — Sanity is the single source of truth
  - content/brightbyte.ndjson canonical seed (idempotent import via --replace)
  - tests/invariants/sanity-single-client.sh — one stega:false + perspective:'published' createClient guard (CMS-03)
  - tests/invariants/no-stega-in-build.sh — build-output stega Unicode (U+E0000–U+E007F) guard (CMS-03, T-03-08)
  - tests/sanity/content-presence.mjs + test:content script — DE/EN parity + D-05 pricing + D-06 outcomes (CMS-02)
  - Phase gate green: build + 4 invariants + content + tsc
affects: [04-content-sections, 06-seo-programmatic-pages]

# Actuals
actuals:
  tokens: 21000
  tasks: 5
  commits: 4

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Idempotent content seed: sanity dataset import --replace supersedes prior docs by fixed _id (no duplicate rows)"
    - "Invariant grep-guard strip filter must be grep -rn prefix-aware (^([^:]*:[0-9]+:)?\\s*(//|/\\*|...)) — the path:num: prefix defeats a plain ^\\s* anchor"
    - "Stega codepoint detection uses Perl -CSD, NOT grep -P: macOS BSD grep has no -P and GNU grep -P codepoint matching is locale-fragile (both silently false-pass)"
    - "Content-presence reads via authenticated `sanity documents query` CLI, not lib/sanity/client.ts — anonymous reads on this dataset still return [] (D4 open); no token committed"

key-files:
  created:
    - content/brightbyte.ndjson
    - tests/invariants/sanity-single-client.sh
    - tests/invariants/no-stega-in-build.sh
    - tests/sanity/content-presence.mjs
  modified:
    - package.json

decisions:
  - "Task 5 is a verify task — no code commit (phase gate execution only)."
  - "content/brightbyte.ndjson re-authors the two tracer service pairs (same _ids) so the single seed file is the complete canonical source; --replace makes re-import idempotent."
  - "Content-presence check reads through the authenticated Sanity CLI (documents query), a documented consequence of the still-open anonymous-read toggle (03-01 coverage D4). Verifies content EXISTS (CMS-02) independent of that toggle; no read token added to the repo."

metrics:
  duration: ~40m
  completed: 2026-08-12

status: complete
requirements-completed: [CMS-02, CMS-03]
---

# Phase 3 Plan 3: Canonical content seed + structural guards + build verification Summary

Authored the canonical BrightByte content into `ddrca30s/production` as published DE/EN pairs for all five document types (service, testimonial, project, siteSettings, plus their translation.metadata links) — making Sanity the single source of truth (CMS-02) — and locked the CMS-03 structural guarantees with two new bash invariant guards (one `stega:false`/`perspective:'published'` client; no stega Unicode in build output) plus a `content-presence.mjs` GROQ check asserting DE/EN parity, D-05 pricing-as-data, and the three D-06 outcome metrics. The full phase gate is green: `npm run build`, four invariant guards, `test:content`, and `tsc --noEmit` all pass.

## What was built

- **content/brightbyte.ndjson** — the canonical seed (27 docs): 2 service pairs, 3 testimonial pairs, 3 project pairs, the siteSettings singleton (DE base id `siteSettings` + EN), and 9 `translation.metadata` link docs. Imported with `sanity dataset import --replace` (idempotent — supersedes the Wave 1 tracer's service docs by matching `_id`).
  - **D-05 pricing as data:** landing tier `price.amount=1500 / currency=EUR / priceFrom=true / label "ab €1.500" / priceOnRequest=false`; full-site tier `priceOnRequest=true`, `price.amount` absent (null). No old €35/h or €450 figures anywhere.
  - **D-06 testimonials:** Blumenspiess `+200%`/Umsatz, Learnstep `92%`, Lumo `+47%` — the metric is a separate `outcomeValue`/`outcomeLabel`, not baked into the quote.
  - **siteSettings (D-07):** `hello@brightbyte-berlin.com`, Karl-Marx-Allee 118 / 10243 Berlin, Steuernummer 14/596/01847, §19 UStG note, nav/footer copy, default SEO — DE + EN.
- **tests/invariants/sanity-single-client.sh** — asserts exactly one `createClient(` across `lib/`+`sanity/` and that it declares both `stega: false` and `perspective: 'published'` (CMS-03). Chained into `test:invariants`.
- **tests/invariants/no-stega-in-build.sh** — scans `.next` build output for stega tag codepoints U+E0000–U+E007F; any hit = FAIL (CMS-03, T-03-08). Self-contained (builds if `.next/server` absent).
- **tests/sanity/content-presence.mjs** + **`test:content`** — DE/EN pair parity per type, the two pricing tiers, the three outcome values, and the siteSettings contact email (CMS-02).

## Deviations from Plan

### Auto-fixed issues

**1. [Rule 1 - Bug] Invariant grep strip filter was not `grep -rn`-prefix aware**
- **Found during:** Task 03-03-02 (sanity-single-client.sh negative testing).
- **Issue:** The comment-strip filter `^\s*(//|/\*|\*|<!--)` (copied from the Phase 2 guard idiom) never matched JSDoc lines, because `grep -rn` prefixes each hit with `path:linenum:`, so the comment marker is not at the true line start. JSDoc mentions of `stega: false` therefore counted as real config, and removing the actual code line still passed.
- **Fix:** Changed `strip_comments` to `^([^:]*:[0-9]+:)?\s*(//|/\*|\*|<!--)` (optional path:num prefix). Negative tests then correctly trip (2nd createClient → exit 1; removed stega → exit 1).
- **Files modified:** tests/invariants/sanity-single-client.sh
- **Commit:** 9841c8a

**2. [Rule 1 - Bug] Stega build guard relied on `grep -P`, which is unavailable/locale-fragile**
- **Found during:** Task 03-03-03 (no-stega-in-build.sh negative testing).
- **Issue:** The first implementation used `grep -rlP '[\x{E0000}-\x{E007F}]'`. macOS BSD grep has NO `-P` option (exits 2 "invalid option"), and the interactive shell's ugrep shim masked this. With `2>/dev/null || true`, the failing grep produced empty output → the guard silently PASSED even with an injected stega codepoint (a false-negative that would let real stega corruption ship).
- **Fix:** Rewrote detection with `find ... -print0 | perl -CSD -0 -ne '... =~ /[\x{E0000}-\x{E007F}]/'`. Perl is present on macOS + Linux CI and decodes UTF-8 codepoints deterministically regardless of locale. Also force `LC_ALL/LANG=C.UTF-8` in the guard. Negative test now trips (exit 1) even under `LC_ALL=C`.
- **Files modified:** tests/invariants/no-stega-in-build.sh
- **Commit:** 52a89e4

### Documented approach (not a deviation)

- **Content-presence reads via the authenticated Sanity CLI, not the app client.** The tracer (03-01 coverage D4) established that anonymous/tokenless reads of `ddrca30s/production` return `[]` pending a dashboard public-read toggle. `content-presence.mjs` therefore runs its GROQ through `sanity documents query` (local CLI auth) so it verifies content EXISTS (CMS-02) today, independent of that open toggle, with no read token committed to the repo. This follows the plan's task-04 spec ("or a read-only client from env") and the pre-brief instruction to use the authenticated CLI path rather than fake a pass.

## Threat model outcome

- **T-03-08** (stega tokens reach production metadata) — mitigated: `sanity-single-client.sh` (config guard) + `no-stega-in-build.sh` (build-output guard), both passing; no unmitigated high remains.
- **T-03-09** (import/write token committed) — mitigated: seed uses `sanity dataset import` with local CLI auth; `content/brightbyte.ndjson` contains content only; no token in any committed file. Verified `git grep` for old-pricing/secret patterns clean.
- **T-03-10** (parallel content store reintroduced) — mitigated: phase-gate check confirms no `data/content.ts`, no `dictionaries/`, no inline editorial `.tsx`; `git status` shows only pre-existing/unrelated files.

## Verification

- `npm run build` → exit 0 (prebuild typegen ran; 7 routes incl. /studio). PASS.
- `npm run test:invariants` → 4 guards PASS (no-raw-hex, no-locale-from-state, sanity-single-client, no-stega-in-build).
- `npm run test:content` → 9/9 checks PASS (rc=0): service/testimonial/project/siteSettings parity, both pricing tiers, three outcomes, contact email.
- `npx tsc --noEmit` → rc=0.
- `sanity documents query` counts: services=4, testimonials=6, projects=6, siteSettings=2; landing price.amount=1500/priceFrom, full-site no amount/priceOnRequest.
- No old pricing (€35/h, €450, Freundespreis) in content/ lib/ sanity/ app/.
- No parallel content store (data/content.ts, dictionaries/) present.

## Known Stubs

None. All authored content is real canonical copy wired to the live schema; all guards and the content check are functional (negative-tested).

## Self-Check: PASSED
