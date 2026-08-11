---
status: complete
phase: 02-i18n-shell-routing
source: [02-01-SUMMARY.md, 02-02-SUMMARY.md, 02-03-SUMMARY.md]
started: 2026-08-11T15:18:36Z
updated: 2026-08-11T16:25:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Per-locale shell string renders in correct language
expected: On /de the shell tagline renders in German; on /en it renders in English. The two differ, proving per-locale message resolution (not hardcoded).
result: pass

### 2. Language switcher preserves path and updates lang
expected: On any page, clicking the language switcher navigates /de ↔ /en while preserving the current path (no /de/de double-prefix). The <html lang> attribute updates to match, and the active locale is marked (aria-current="page").
result: pass

### 3. Bidirectional hreflang in page <head> (incl. x-default → /de)
expected: With the dev/prod server running, curl or view-source of /de and /en shows <link rel="alternate" hreflang="de" ...>, hreflang="en", and hreflang="x-default" pointing to the /de URL. Each page's rel="canonical" points to its OWN locale URL (/en canonical = .../en, not .../de).
result: pass
verified: "Server on :3000. /de canonical=.../de, /en canonical=.../en (per-locale). Both pages emit hreflang de, en, x-default(→/de)."

### 4. sitemap.xml emits /de and /en roots with hreflang alternates
expected: With the server running, GET /sitemap.xml lists both /de and /en root URLs, each with alternates.languages entries for de, en, AND x-default (→ /de).
result: pass
verified: "GET /sitemap.xml lists /de and /en roots; each has xhtml:link alternates for de, en, x-default(→/de)."

### 5. / redirects to /de (locale from URL only)
expected: Visiting / always redirects to /de independent of Accept-Language.
result: pass
source: automated
coverage_id: D1

### 6. /de serves DE with <html lang="de">
expected: /de serves the German shell with <html lang="de">.
result: pass
source: automated
coverage_id: D2

### 7. /en serves EN with <html lang="en">
expected: /en serves the English shell with <html lang="en">.
result: pass
source: automated
coverage_id: D3

### 8. Locale derived from URL segment only (no localStorage / component state)
expected: No localStorage, useState, or client component state holds the locale — enforced by the no-locale-from-state.sh invariant gate.
result: pass
source: automated
coverage_id: D4

## Summary

total: 8
passed: 8
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none yet]
