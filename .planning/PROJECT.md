# BrightByte Berlin — Homepage v2

## What This Is

A complete design overhaul and rebuild of the BrightByte Berlin freelance web-design studio site (studio of Daniel Jin Wodke). It is a bilingual (DE/EN) marketing site for winning local Berlin small-business clients — the studio's own showcase, where the site itself must be the strongest proof of the work. v2 replaces a half-migrated v1 that reads as AI-generated and lacks a clear visual identity.

## Core Value

The site must *feel* refined, modern, and quietly stunning on first impression — a calm, confident visual identity expressed consistently across every section — so that a local SMB owner immediately trusts the craft. If everything else fails, the first-impression aesthetic and clarity cannot.

## Business Context

- **Customer**: Local Berlin small businesses / tradespeople (florists, tree surgeons, coaches, clinics — the Blumenspiess / Lukas Baumpflege type client)
- **Revenue model**: Freelance web-design/build engagements (fixed-price landing pages ~€690, multi-page ~€2,500, web apps quoted)
- **Success metric**: Inbound project inquiries via the contact form
- **Strategy notes**: BrightByte freelance identity & rules in `~/Documents/claude-contexts/freelancer.md`

## Requirements

### Validated

- ✓ Define a real brand identity from scratch: palette, typography, visual language, tone — Phase 1
- ✓ Create a resolved logo (light + dark, text-as-paths SVG), replacing v1's inline SVG + abandoned experiments — Phase 1

### Active

- [ ] Deep design research to land a modern, refined-minimal visual direction that fits the brand and reads as professional to SMB clients
- [ ] One elegant three.js / @react-three/fiber 3D hero centerpiece (tasteful, not a tech demo)
- [ ] Rest of site is clean 2D with subtle, restrained motion — readability first
- [ ] Rearchitect the content/section structure from scratch (v1's 11 sections are reference, not a mandate)
- [ ] Rewrite copy, framing, and texts for v2; consolidate v1's 3 conflicting content sources and fix the two-bios / two-headlines inconsistency
- [ ] Bilingual DE/EN with path-based routing (`/de`, `/en`) and correct per-URL hreflang
- [ ] Keep Sanity CMS for editable content (projects, blog, testimonials)
- [ ] Apply ui-skills.com principles via the `npx ui-skills` CLI on every UI phase (load smallest relevant skill, "impeccable" among favorites)
- [ ] Iterate each section to high-end UX via Playwright screenshot-critique loop (desktop + mobile)
- [ ] Preserve strong v1 SEO assets: German programmatic SEO pages (`/s/[slug]`, ~30 keyword pages), JSON-LD structured data, sitemap/robots

### Out of Scope

- Reusing v1's mid-migration "bone + plum" section styling — cause of the unclear visual language; starting fresh
- v1's client-side `?lang=` + localStorage i18n — replaced by path-based routing for SEO correctness
- Heavy/flashy 3D beyond the single hero moment — would intimidate the SMB audience and hurt UX
- New backend/app functionality beyond the marketing site + contact form — this is a site rebuild, not a product

## Context

- **v1 project**: `~/Documents/daniel-jin-studio-homepage` (Next.js 16, React 19, Tailwind v4, SCSS modules + styled-components + inline styles, Sanity CMS, Resend contact, Vercel, OGL-based shaders). package.json name is `lume-web-studio` but brand is BrightByte Berlin.
- **Root problem diagnosed**: v1 homepage is literally mid-migration — 2 new "editorial" sections vs 9 legacy sections flagged in code "to be reworked"; 3 font families across 2 competing directions (Fraunces editorial vs Bricolage brutalist); palette defined as tokens but re-hardcoded inline per section; copy duplicated across inline `.tsx`, `dictionaries/`, and `data/content.ts`.
- **Worth keeping from v1**: detailed bilingual service/pricing/FAQ copy; the consistent positioning ("you own the code, no lock-in, fixed price, reply in 24h"); German programmatic SEO system; JSON-LD; testimonials (Blumenspiess +200% inquiries, Learnstep 92% bookings, Lumo +47% leads).
- **Design workflow tool**: `npx ui-skills start` → `categories` → `list --category <c>` → `get <slug>` — a working CLI that serves UI skill contexts locally.

## Constraints

- **Tech stack**: Next.js (App Router) + React + Tailwind — carry forward the modern v1 stack; avoid the styling sprawl (pick one styling approach, consume tokens consistently)
- **3D engine**: three.js / @react-three/fiber (user chose over v1's OGL) — hero only, performance-budgeted
- **i18n**: Path-based `/de` `/en` routing, DE default, hreflang per URL
- **CMS**: Sanity (retained)
- **Design standard**: ui-skills CLI skills are the design rulebook; verify visually with Playwright before a section is "done"
- **Audience fit**: refined & minimal — calm, editorial, confidence-through-restraint; must never read as intimidating or "startup-flashy" to a local SMB owner
- **Deploy**: Vercel

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Define identity first, then express across sections | v1's per-section improvisation is the root cause of "unclear visual language" | ✓ Phase 1 — single `styles/tokens.css` `@theme` block; zero raw hex / gray utilities enforced by invariant test |
| Rearchitect content, rewrite copy | Content is fully open; v1 has conflicting duplicated sources | — Pending |
| three.js for hero (over OGL) | User preference; single budgeted 3D moment | — Pending |
| Path-based i18n `/de` `/en` | SEO correctness for bilingual local-market site | — Pending |
| Keep Sanity CMS | Editable projects/blog/testimonials without code changes | — Pending |
| ui-skills CLI + Playwright screenshot-critique loop | Objective, high-end UX bar per section instead of guessing | — Pending |
| No target ship date | Goal is the best possible version; resolve ambiguity up front | — Pending |
| Token naming `--color-primary` (not `--color-text-primary`) | Avoids Tailwind v4 double-prefix antipattern | ✓ Phase 1 |
| Logo as text-as-paths SVG via fontTools instancer from woff2 | No extra font download; svgo strips script/metadata for safe static asset | ✓ Phase 1 |
| Plus Jakarta Sans, weight-driven hierarchy (single typeface) | Calm/editorial read; WCAG AA verified (accent 8.93:1) before any component work | ✓ Phase 1 |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-08-11 after Phase 1*
