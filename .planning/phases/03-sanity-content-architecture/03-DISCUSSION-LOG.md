# Phase 3: Sanity Content Architecture - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-12
**Phase:** 3-sanity-content-architecture
**Areas discussed:** Studio scaffold & hosting, Schema field shapes, Document-level i18n mechanics

---

## Studio Scaffold & Hosting

| Option | Description | Selected |
|--------|-------------|----------|
| Embedded /studio | Studio inside this Next app, one repo/deploy/env | ✓ |
| Standalone Studio app | Own package/deploy | |

| Option | Description | Selected |
|--------|-------------|----------|
| Ship /studio to prod | Available in prod, Sanity-auth-gated | ✓ |
| Dev-only Studio | Excluded from prod build | |

| Option | Description | Selected |
|--------|-------------|----------|
| Static published content | Build-time GROQ, stega:false, no live editing | ✓ |
| Live + Visual Editing now | defineLive + VisualEditing + Draft Mode | |

**Notes:** Static-published chosen to match the marketing-site nature + CWV budget and minimize the stega:false enforcement surface. Live editing explicitly deferred, not rejected.

---

## Schema Field Shapes

| Option | Description | Selected |
|--------|-------------|----------|
| Plain strings, PT only where needed | Short copy = strings; Portable Text only for longer/formatted bodies | ✓ |
| Portable Text everywhere | All editorial copy as PT | |

| Option | Description | Selected |
|--------|-------------|----------|
| Structured price fields | numeric + currency + label + includes list | ✓ |
| Free-text price string | single string per service | |

| Option | Description | Selected |
|--------|-------------|----------|
| Structured outcome fields | quote/author/company + separate metric value+label | ✓ |
| Metric inside quote text | metric baked into quote | |

| Option | Description | Selected |
|--------|-------------|----------|
| Singleton siteSettings | one enforced document via structure builder | ✓ |
| Regular document type | ordinary type | |

**Notes:** Prices modeled as data (JSON-LD-ready for Phase 6); testimonial outcome number is first-class for distinct styling.

---

## Document-level i18n Mechanics

| Option | Description | Selected |
|--------|-------------|----------|
| All editorial + siteSettings | every editable type gets DE/EN pairs | ✓ |
| Editorial types only | siteSettings excluded | |

| Option | Description | Selected |
|--------|-------------|----------|
| DE base, EN translation | DE reference language | ✓ |
| EN base | EN reference language | |

| Option | Description | Selected |
|--------|-------------|----------|
| Filter by $locale param | queries filter on language field | ✓ |
| Resolve via translation refs | follow translation metadata | |

| Option | Description | Selected |
|--------|-------------|----------|
| Per-locale slugs | each locale doc owns its slug | ✓ |
| Shared slug | one slug across the pair | |

**Notes:** DE base aligns with Phase 2 always-DE root + x-default → /de. $locale filter is the contract Phase 4 imports. Per-locale slugs feed Phase 6's /s/[slug].

---

## Claude's Discretion

- Typed GROQ mechanism (`sanity typegen` vs hand-authored) — must end typed + centralized (CMS-03).
- Content migration mechanism (manual authoring vs seed/import script).
- Authoritative content source: `~/Documents/claude-contexts/freelancer.md` + ROADMAP copy; reconcile pricing conflict during planning.
- Exact field names, validation, previews, Studio structure layout; `@sanity/image-url` setup; env/config surface.

## Deferred Ideas

- Live / Visual Editing (defineLive, VisualEditing, Draft Mode) — deferred, foundation supports adding later.
- Rendering content into sections → Phase 4.
- Programmatic /s/[slug] pages + JSON-LD → Phase 6 (seam shaped here).
- FAQ / About-body Portable Text depth — only add PT where a real formatting need exists.
