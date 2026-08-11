---
phase: 02
slug: i18n-shell-routing
status: verified
# threats_open = count of OPEN threats at or above workflow.security_block_on severity (the blocking gate)
threats_open: 0
asvs_level: 1
created: 2026-08-11
---

# Phase 02 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

Register origin: authored at plan time (all 3 PLAN.md files carried `<threat_model>` blocks). ASVS Level 1 · block on: high. Verified L1 grep-depth per short-circuit rule (`threats_open: 0 AND register_authored_at_plan_time: true AND asvs_level == 1`).

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| client → proxy.ts | Untrusted request URL (arbitrary/locale-shaped path segments) crosses into locale detection + redirect construction | Request URL / path segment |
| URL segment → i18n/request.ts | The `[locale]` path segment becomes the key for message-file dynamic import and `<html lang>` | Locale key (string) |
| build/request → generateMetadata + sitemap | Path values flow into hreflang URL construction; base URL from env | Route path, base URL |
| browser → client LocaleSwitcher | User click triggers `<Link>` navigation; pathname read from router context (URL), not stored state | Pathname (URL-derived) |

---

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-2-01 | Spoofing/Tampering | proxy.ts + i18n/request.ts locale param | high | mitigate | `hasLocale(routing.locales, locale)` allowlist check + `notFound()` on invalid (i18n/request.ts:37-38) — no attacker-controlled value reaches redirect target or dynamic `messages/${locale}.json` import (blocks open redirect + path traversal) | closed |
| T-2-02 | Tampering | Accept-Language header | low | accept | `localeDetection: false` (i18n/routing.ts:16) — header never consulted; root redirect always `/de`. No code path consumes the header. | closed |
| T-2-03 | Information Disclosure | rendered `<html lang>` | low | accept | Locale derived from URL segment only; no cookie/localStorage locale state to leak. Structurally enforced by tests/invariants/no-locale-from-state.sh. | closed |
| T-2-04 | Tampering | buildHreflangAlternates path arg | low | mitigate | Path normalized to leading slash; only called with in-app literal routes ('/'). Base URL from trusted env var with fixed production default. | closed |
| T-2-05 | Information Disclosure | sitemap.xml exposure | low | accept | Sitemap intentionally exposes public locale roots only (D-08); no private routes in Phase 2. | closed |
| T-2-06 | Information Disclosure/Tampering | LocaleSwitcher locale source | medium | mitigate | Locale read via `useLocale()` (URL-derived, LocaleSwitcher.tsx:36); navigation is pure `<Link>` — no localStorage/state holds locale (grep confirms zero localStorage refs). Enforced by tests/invariants/no-locale-from-state.sh (D-09). | closed |
| T-2-07 | Tampering | usePathname source | low | mitigate | `usePathname` from `@/i18n/navigation` (LocaleSwitcher.tsx:23) returns locale-stripped path; `<Link locale>` re-prefixes exactly once — no `/de/de/` double-prefix traversal (Pitfall 4). | closed |
| T-2-SC | Tampering | npm install next-intl | high | mitigate | Package-legitimacy gate: blocking human-verify checkpoint preceded install; next-intl verified legitimate at npmjs.com (5-yr, 5M weekly downloads; [SUS] was a too-new-version false positive). | closed |

*Status: open · closed · open — below high threshold (non-blocking)*
*Severity: critical > high > medium > low — only open threats at or above `high` count toward threats_open*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-2-01 | T-2-02 | Accept-Language deliberately rejected (D-05, German-first); root redirect always `/de` — no locale-selection surface for header injection | Daniel Jin Wodke | 2026-08-11 |
| AR-2-02 | T-2-03 | `<html lang>` reflects URL segment only; no hidden locale state exists to leak | Daniel Jin Wodke | 2026-08-11 |
| AR-2-03 | T-2-05 | Sitemap exposes public locale roots only by design (D-08); no private routes in scope | Daniel Jin Wodke | 2026-08-11 |

*Accepted risks do not resurface in future audit runs.*

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-08-11 | 8 | 8 | 0 | secure-phase (L1 grep verification) |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-08-11
