---
phase: 06-seo-layer-programmatic-pages
plan: "03"
subsystem: seo
tags: [seo, deploy, vercel, hreflang, sitemap, json-ld, phase-gate]

# Dependency graph
requires:
  - phase: 06-02
    provides: "50 seoPage docs imported, full sitemap, homepage/section JSON-LD, 12/12 seo tests green"
provides:
  - "Public Vercel production deploy of v2 with the full bilingual SEO layer"
  - "SC #2/#3/#4 verified on the real deployed HTML (Google Rich Results + sitemap validator + curl hreflang)"
  - "Phase 6 gate closed — the site is launchable"
affects: [phase-07, launch]

# Actuals
actuals:
  tokens: 0        # no code written — this plan is files_modified: [] (deploy + human verification gate)
  tasks: 2
  commits: 0

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "CLI deploys (`vercel --prod`) are the working path — the GitHub→Vercel git integration builds STALE v1 and must not be relied on"

key-files:
  created:
    - .planning/phases/06-seo-layer-programmatic-pages/06-03-SUMMARY.md
    - .vercel/project.json  # gitignored (.vercel) — CLI link for brightbyteberlin-homepage
  modified: []

key-decisions:
  - "Switched from git-integration deploys to `vercel --prod` CLI deploys — the GitHub integration was building 90 days of stale v1 (globals.scss/Prism.tsx that do not exist in v2)"
  - "Deployment Protection (SSO) disabled so external validators (Google Rich Results Test) can reach the deploy"
  - "v2 repo made public on github.com to clear the Hobby-plan private-repo build-dispatch restriction"
  - "hreflang attribute is emitted camelCase (`hrefLang`) by Next.js — grep `rel=\"alternate\"`, not `hreflang=`"

requirements-completed: [SEO-01, SEO-02, SEO-03]

coverage:
  - id: SC1
    description: "All /s/[slug] render in both locales, no 404"
    requirement: SEO-01
    verification:
      - kind: integration
        ref: "curl DE tracer + EN counterpart on preview → 200, real content"
        status: pass
  - id: SC2
    description: "Valid JSON-LD per page type via Google Rich Results Test (0 errors)"
    requirement: SEO-02
    verification:
      - kind: manual
        ref: "Task 2 human-verify: Rich Results Test on DE/EN tracer (WebPage+FAQPage+BreadcrumbList), homepage (ProfessionalService), section (WebPage)"
        status: pass
  - id: SC3
    description: "Sitemap + robots validate; all 50 SEO URLs + alternates parse"
    requirement: SEO-03
    verification:
      - kind: integration
        ref: "curl sitemap.xml → 50 SEO <loc> (25 DE + 25 EN), 52 total; robots.txt 200 + sitemap ref"
        status: pass
      - kind: manual
        ref: "Task 2 human-verify: sitemap submitted to validator"
        status: pass
  - id: SC4
    description: "Bidirectional hreflang, x-default → /de"
    requirement: SEO-01
    verification:
      - kind: integration
        ref: "curl DE + EN pages → de/en/x-default present, x-default → /de URL, reciprocal DE↔EN"
        status: pass

metrics:
  duration: multi-session (deploy blockers resolved across sessions)
  completed: 2026-09-09
---

# Phase 6 Plan 03: Deployed SEO Verification — Phase Gate Summary

The phase gate. Deployed v2 to a **public Vercel production URL** and verified all four ROADMAP success criteria on the real deployed HTML — the way Google sees it — closing Phase 6. No code was written (`files_modified: []`); this plan is deploy + verification only.

**Working production deploy:** `https://brightbyteberlin-homepage-kp48wychx-daniel-jin-wodkes-projects.vercel.app`
(canonical domain in the HTML: `https://brightbyte.berlin`)

## Task 1 — Deploy + automated curl cross-check (PASS)

| Check | Result |
|-------|--------|
| DE tracer `/de/s/webentwickler-berlin` | 200, real content (`<title>Webentwickler Berlin \| BrightByte</title>`) |
| EN tracer `/en/s/web-developer-berlin` | 200, real content |
| hreflang (DE page) | `de`, `en`, `x-default` present; **x-default → the /de URL**; reciprocal DE↔EN |
| `/sitemap.xml` | 200; **50 SEO `<loc>`** (25 DE + 25 EN), 52 total incl. locale roots; paired alternates parse |
| `/robots.txt` | 200; `User-Agent: *`, `Allow: /`, absolute `Sitemap:` reference |

Notes:
- The hreflang attribute is emitted camelCase (`hrefLang`) by Next.js — an early grep for `hreflang="` returned empty; grepping `rel="alternate"` surfaced all three tags.
- An early sitemap count of `47` was a grep artifact (`grep -oE '/s/…' | sort -u` collapsed slug substrings). Anchoring on `<loc>…</loc>` gives the correct **50**.

## Task 2 — Human verification of SC #2/#3/#4 (PASS)

User ran the blocking verification gate and typed the approval signal. Google Rich Results Test (WebPage + FAQPage + BreadcrumbList on SEO pages, ProfessionalService/LocalBusiness on the homepage, WebPage on a section page), sitemap validation, and hreflang spot-check all passed on the live deploy.

## Deploy blockers resolved (multi-session)

Getting a working public deploy required clearing three layered blockers (none are code defects):

1. **GitHub→Vercel git integration built stale v1.** 90 days of `● Error` deploys referenced `globals.scss`/`Prism.tsx` that do not exist in v2. **Fix:** switched to CLI deploys (`vercel --prod`) after `vercel link`. The git integration remains broken — carry-over.
2. **Deployment Protection (SSO)** redirected the deploy to `vercel.com/login`, blocking external validators. **Fix:** user disabled protection.
3. **Hobby-plan private-repo restriction** stalled builds at `Builds: . [0ms]` (no build machine dispatched). **Fix:** user made the v2 repo public on github.com → next deploy went Building → Ready.

## Known Stubs

None. All content renders from Sanity production.

## Carry-over (not phase-gating)

- **GitHub→Vercel git integration builds stale v1** — deploy via `vercel --prod` CLI until fixed.
- **Deployment Protection is off** — acceptable for a public launch; re-enable only if a gated preview is ever needed.
- Pre-launch TODOs from prior phases still open: rotate the exposed Resend API key; author real DSGVO Datenschutz copy (DE+EN) in Studio; confirm `SANITY_API_READ_TOKEN` is in the Vercel env for all environments (build succeeded, so it is present for production).

## Self-Check: PASSED

All four success criteria verified on the live public deploy (SC #1/#4 via curl, SC #2/#3 via human validators). Phase 6 is complete — the site is launchable.
