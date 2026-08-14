# Deferred Items — Phase 04

Out-of-scope discoveries logged during execution (NOT fixed — see gsd-executor scope boundary).

## [04-04] Pre-existing: i18n smoke test (6) fails at mobile-375

- **Discovered during:** Task 2 (full-suite phase gate), 04-04 execution.
- **Test:** `tests/i18n/smoke.spec.ts:63` — "(6) language switcher navigates /de → /en preserving the path".
- **Symptom:** At the `mobile-375` project, `page.locator('a[href*="/en"]').first()` is not visible/clickable — the LocaleSwitcher lives inside the collapsed mobile hamburger menu on the home page, so the EN link is hidden until the menu is opened. Passes at `desktop-1440`.
- **Why out of scope:** 04-04 changed only the legal routes, siteSettings schema, the SITE_SETTINGS_QUERY projection, additive i18n message keys, and test files. It did NOT touch the home page, Header, or LocaleSwitcher. The failure is a pre-existing mobile-menu interaction gap owned by Wave 1/2 (Header / LocaleSwitcher), not introduced by this plan.
- **Suggested fix (for a later plan/owner):** In smoke test (6), open the mobile hamburger before asserting the EN link at 375px (e.g. click the menu toggle when `viewport.width < md`), OR make the LocaleSwitcher reachable without opening the menu. Alternatively scope test (6) to desktop-1440 only if the switcher is intentionally menu-gated on mobile.
- **Status:** open — deferred to Header/i18n owner. Full suite otherwise 127/128 green; axe zero-violation site-wide incl. legal routes; reduced-motion honored.
