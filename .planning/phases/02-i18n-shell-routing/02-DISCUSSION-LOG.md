# Phase 2: i18n Shell & Routing - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-11
**Phase:** 2-i18n-shell-routing
**Areas discussed:** Dictionary strategy, Root & unknown-path behavior, Layout shell scope, hreflang & metadata plumbing

---

## Dictionary Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| next-intl messages | Built-in message files + NextIntlClientProvider + useTranslations/getTranslations; idiomatic for the locked stack | ✓ |
| Custom loader | Hand-rolled tiny dictionary loader; re-implements next-intl, fights the anti-sprawl principle | |

**User's choice:** next-intl messages
**Notes:** Editorial/marketing copy moves to Sanity in Phase 3, so this dictionary is strictly static UI chrome.

### Follow-up — Message scope

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal, shell-only | Only strings the shell renders now (switcher, nav/footer stub, error); grows per phase | ✓ |
| Pre-seed full tree | Full namespace tree now even if unused; risks unused-key drift | |

**User's choice:** Minimal, shell-only

---

## Root & Unknown-Path Behavior

### Prefix mode

| Option | Description | Selected |
|--------|-------------|----------|
| always (/de visible) | Every locale in the URL; `/`→`/de`; cleanest for SEO/hreflang; next-intl default | ✓ |
| as-needed (hide /de) | DE has no prefix; prettier German URLs but complicates hreflang/x-default and "locale from URL only" | |

**User's choice:** always (/de visible)

### Unknown / non-prefixed paths

| Option | Description | Selected |
|--------|-------------|----------|
| Prepend default locale | Non-prefixed path → `/de/...`, then Next resolves; standard next-intl | ✓ |
| 404 non-prefixed | Immediate 404; stricter, breaks bare-path deep links | |

**User's choice:** Prepend default locale

### Root redirect target

| Option | Description | Selected |
|--------|-------------|----------|
| Always DE | `/` always → `/de` regardless of browser; deterministic, matches criterion, fits Berlin-first audience | ✓ |
| Accept-Language detect | Honor browser language; more "correct" globally but non-deterministic / harder to test | |

**User's choice:** Always DE

---

## Layout Shell Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Provider + switcher only | `[locale]` layout = html lang + provider + children + minimal unstyled header with the language switcher | ✓ |
| Full chrome stubs | Placeholder header/nav/footer now; risks designing chrome before Phase 4 identity-driven work | |
| Bare, switcher on page | Bare shell, switcher on page body temporarily; no natural home | |

**User's choice:** Provider + switcher only
**Notes:** Phase 4 builds the real header/footer/nav to the ui-skills UX bar; switcher's job here is to prove routing end-to-end.

---

## hreflang & Metadata Plumbing

### hreflang generation

| Option | Description | Selected |
|--------|-------------|----------|
| Shared generateMetadata helper | Reusable helper producing alternates.languages {de, en, x-default→/de}; explicit, testable, reused by Phase 6 | ✓ |
| next-intl auto-alternates | Rely on next-intl routing; less code but less control over x-default, harder to extend | |

**User's choice:** Shared generateMetadata helper

### Sitemap scope + CI smoke test

| Option | Description | Selected |
|--------|-------------|----------|
| Roots now, extensible + full smoke test | Sitemap emits locale roots via reusable route→alternates mapper; CI asserts lang/hreflang/redirect + grep guard against localStorage/state locale | ✓ |
| Minimal, defer structure | Hardcode /de,/en; minimal CI check; Phase 6 rewrites, weak test misses client-side leaks | |

**User's choice:** Roots now, extensible + full smoke test

---

## Claude's Discretion

- Exact next-intl config surface (`i18n/routing.ts` vs `i18n/request.ts` split, middleware matcher regex, provider mount point).
- Exact message-file namespace shape for minimal shell strings.
- Exact switcher markup/interaction (must be `<Link>`-based, no client-side state per I18N-03).
- Whether `[locale]` uses `generateStaticParams` for `de`/`en`; `setRequestLocale` pattern for static rendering.

## Deferred Ideas

- Full header/footer/nav chrome → Phase 4.
- Editorial/marketing copy → Phase 3 (Sanity).
- ~30 programmatic `/s/[slug]` SEO pages + JSON-LD → Phase 6.
- Accept-Language root redirect detection → explicitly rejected this milestone; noted for a future international push.
