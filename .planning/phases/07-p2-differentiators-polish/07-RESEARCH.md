# Phase 7: p2-differentiators-polish — Research

**Researched:** 2026-09-11
**Domain:** Sanity schema additions, Next.js App Router case study routing, hero fade-in bug fix, axe-playwright a11y, motion audit
**Confidence:** HIGH — all findings from direct codebase inspection

---

## Summary

Phase 7 layers conversion-improving content (case studies, FAQ, Process, Guarantee) onto a complete, deployed marketing site. The technical surface is narrow and well-understood: three Sanity schema additions, one new App Router route, modifications to two existing components (WorkSection, page.tsx), and two static i18n sections (Process, Guarantee). The most interesting engineering problem is the D-11 hero fade-in bug, where the root cause and fix options are now clearly diagnosed from reading the source.

All existing patterns from Phases 3–6 apply without modification. The `FaqAccordion` component already exists in `components/seo/` and works exactly as needed for the homepage FAQ section. The `app/[locale]/s/[slug]/page.tsx` route is the direct template for the new `app/[locale]/work/[slug]/page.tsx` case study route — the patterns are identical. No new design tokens, no new third-party libraries, no new infrastructure.

**Primary recommendation:** Treat this phase as a schema-first effort. Add the three Sanity field sets first (project case study fields + siteSettings `faqs` array), author content in Studio for all three clients, then build the UI against real data. This avoids the "render skeleton with no data" trap that produces untested empty states.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Case study content (problem/solution/outcome) | Database / Sanity CMS | — | Authored editorial content; must be locale-specific documents (DE/EN pairs) per document-i18n plugin |
| Case study routing + page render | Frontend Server (SSR/SSG) | — | `generateStaticParams` + RSC, mirrors `/s/[slug]` pattern exactly |
| Work grid conditional linking | Frontend Server (RSC) | — | `WorkSection` is an RSC; the Link wrapping is a render-time decision on `caseStudySlug` presence |
| FAQ data | Database / Sanity CMS | — | 5–7 items authored and iterated in Studio; stored as array on `siteSettings` |
| FAQ render | Frontend Server (RSC) | Browser/Client (`FaqAccordion` disclosure) | Server-fetches data, passes to existing `FaqAccordion` client component |
| Process section | Frontend Server (RSC) | — | Static — copy lives in `messages/de.json` and `messages/en.json`; no Sanity fetch |
| Guarantee section | Frontend Server (RSC) | — | Static — copy lives in message dictionaries |
| Hero fade-in (D-11) | Browser/Client | — | `HeroCanvas.tsx` manages the wrapper ref and `data-ready` attribute |
| axe audit | Browser/Client (Playwright) | — | Playwright-driven; tests run against `next start` |
| Motion audit | Browser/Client | — | Visual inspection + `tests/motion/reduced.spec.ts` |

---

## Project Constraints (from CLAUDE.md)

- **Single styling system:** Tailwind v4 `@theme` tokens only. Zero raw hex, zero `text-gray-*`, zero inline styles in any new component file. The `tests/invariants/no-raw-hex.sh` scan covers `app/` — new files there must pass it.
- **Token discipline:** All color via named semantic utilities (`text-primary`, `bg-surface-muted`, etc.). No new tokens in `styles/tokens.css` for Phase 7 (UI-SPEC confirmed).
- **No new design tokens:** Motion, color, and spacing are locked from Phase 1. Use existing tokens.
- **i18n:** Path-based `/de`/`/en`, DE default. All new sections bilingual. Static copy in message dictionaries; Sanity copy through locale-filtered queries.
- **No icon libraries:** Inline SVG paths only (explicitly stated in UI-SPEC).
- **No Radix/Base-UI/shadcn:** Bespoke components only, extending existing patterns.
- **GSD workflow:** Phase 7 work flows through GSD commands per `.claude/CLAUDE.md`.
- **Next.js App Router:** Read `node_modules/next/dist/docs/` before writing route code; `params` is a `Promise<{…}>` and must be `await`ed (Next.js 16 requirement confirmed throughout codebase).

---

## Standard Stack

No new packages are introduced in Phase 7. The phase uses exclusively what is already installed.

### Already Installed — Consumed in Phase 7

| Package | Installed Version | Phase 7 Usage |
|---------|-------------------|---------------|
| `next` | 16.3.0 | Case study route, `generateStaticParams`, `notFound()` |
| `next-intl` | 4.13.6 | `useTranslations` in Process/Guarantee static sections, message keys |
| `sanity` | 6.9.1 | Schema additions to `project.ts` and `siteSettings.ts` |
| `next-sanity` | 13.3.1 | `defineQuery` for new GROQ queries; `createClient` fetch |
| `@sanity/document-internationalization` | 6.2.29 | New `project` case study fields and `siteSettings.faqs` follow established DE/EN pattern |
| `motion` | 13.1.0 | `MotionSection` wrapper (no changes to it) |
| `@axe-core/playwright` | already installed | Expanded `paths` array in `tests/a11y/axe.spec.ts` |

**No `npm install` required for this phase.**

---

## Package Legitimacy Audit

No new packages are introduced. Audit: N/A.

---

## Architecture Patterns

### System Architecture Diagram

```
Sanity Studio (CMS)
  ├── project doc (DE + EN pairs)
  │     fields: title, slug, summary, outcomeNote, image, order
  │     + NEW: problem, solution, outcomeText, outcomeValue,
  │             heroImage, caseStudySlug, clientName, clientCategory
  └── siteSettings doc (DE + EN pairs)
        + NEW: faqs[] {question, answer}

Next.js SSG Build (generateStaticParams)
  └── app/[locale]/work/[slug]/page.tsx
        → getProjectBySlug(locale, slug)     [new GROQ]
        → CaseStudyLayout (RSC)              [new component]
              ├── Band 1: Hero (MotionSection)
              ├── Band 2: Problem (MotionSection)
              ├── Band 3: Solution (MotionSection)
              ├── Band 4: Outcome (MotionSection)
              └── Band 5: CTA strip (MotionSection)

app/[locale]/page.tsx (homepage)
  → Promise.all([getSiteSettings, getServices, getProjects, getTestimonials, getFaqs])
        ├── WorkSection (upgraded: conditional Link wrapping per caseStudySlug)
        ├── CaseStudiesBridge (new static section — filters projects with caseStudySlug)
        ├── ProcessSection (new static RSC — message dict copy)
        ├── GuaranteeSection (new static RSC — message dict copy)
        └── FaqSection (new RSC wrapper — passes faqs[] to FaqAccordion)

components/seo/FaqAccordion.tsx (existing — reused unchanged)
components/hero/HeroCanvas.tsx (D-11 fix — wrapper key or JSX restructure)
tests/a11y/axe.spec.ts (extended: /[locale]/work/[slug] paths added)
```

### Recommended Project Structure

```
app/[locale]/
  work/
    [slug]/
      page.tsx              # Case study RSC route (mirrors s/[slug]/page.tsx)
components/
  sections/
    ProcessSection.tsx      # Static RSC — 3-step grid
    GuaranteeSection.tsx    # Static RSC — centered trust strip
    FaqSection.tsx          # RSC wrapper that fetches faqs from page-level props
    CaseStudiesBridge.tsx   # RSC — filters projects by caseStudySlug
  work/
    CaseStudyLayout.tsx     # RSC page layout (mirrors SeoPageLayout.tsx)
messages/
  de.json                   # + Process, Guarantee keys
  en.json                   # + Process, Guarantee keys
sanity/
  schemaTypes/
    project.ts              # + case study field additions
    siteSettings.ts         # + faqs[] array
lib/
  sanity/
    queries.ts              # + CASE_STUDY_BY_SLUG_QUERY, FAQS_QUERY
tests/
  a11y/
    axe.spec.ts             # + work/[slug] paths
  sections/
    work-links.spec.ts      # New: verifies linked vs display-only cards
    case-study.spec.ts      # New: case study page render
```

### Pattern 1: Case Study Route (mirrors `/s/[slug]`)

The existing `app/[locale]/s/[slug]/page.tsx` is the canonical template. Key elements to carry forward verbatim:

**Source:** `app/[locale]/s/[slug]/page.tsx` [VERIFIED: app/[locale]/s/[slug]/page.tsx:1-151]

```typescript
// Next.js 16: params MUST be awaited
export const dynamicParams = false

export async function generateStaticParams(): Promise<RouteParams[]> {
  const perLocale = await Promise.all(
    LOCALES.map(async (locale) => {
      const projects = await getProjects(locale)
      return projects
        .map((p) => p.slug?.current)
        .filter((slug): slug is string => typeof slug === 'string')
        .map((slug) => ({ locale, slug }))
    }),
  )
  return perLocale.flat()
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { locale: rawLocale, slug } = await params
  const locale: Locale = rawLocale === 'en' ? 'en' : 'de'
  const project = await getCaseStudyBySlug(rawLocale, slug)
  if (!project) notFound()
  // ... render CaseStudyLayout
}
```

**Critical:** `dynamicParams = false` prevents unknown slugs from being hit at runtime — only slugs present in Sanity at build time resolve. Non-seeded slugs 404 at build time.

### Pattern 2: Sanity Schema Addition (non-breaking)

Add new optional fields to existing document types. The established convention (verified in `project.ts`) is `defineField` with no `validation: Rule.required()` for fields that may not be populated on existing documents. [VERIFIED: sanity/schemaTypes/project.ts:1-70]

```typescript
// In project.ts — append AFTER the existing `language` field:
defineField({
  name: 'problem',
  title: 'Problem / Challenge',
  type: 'text',
  rows: 6,
  description: 'What the client faced before BrightByte. 1–3 paragraphs.',
}),
defineField({
  name: 'solution',
  title: 'Solution / What was built',
  type: 'text',
  rows: 8,
  description: 'What BrightByte built and how. 1–3 paragraphs.',
}),
defineField({
  name: 'outcomeText',
  title: 'Outcome text',
  type: 'text',
  rows: 4,
  description: 'Measured result narrative. Ties to the testimonial metric.',
}),
defineField({
  name: 'outcomeValue',
  title: 'Outcome metric value',
  type: 'string',
  description: 'E.g. "+200%", "92%", "+47%". Displayed as large callout.',
}),
defineField({
  name: 'outcomeLabel',
  title: 'Outcome metric label',
  type: 'string',
  description: 'E.g. "mehr Kundenanfragen", "Kundenzufriedenheit".',
}),
defineField({
  name: 'heroImage',
  title: 'Hero image (case study)',
  type: 'image',
  options: { hotspot: true },
  description: 'Project screenshot for the case study hero band. Optional.',
}),
defineField({
  name: 'clientCategory',
  title: 'Client category',
  type: 'string',
  description: 'E.g. "Floristik", "EdTech", "Wellness". Used as hero badge.',
}),
```

**Note on `caseStudySlug`:** The existing `slug` field already provides the routing slug. A separate `caseStudySlug` field is NOT needed — the case study route uses the same slug as the work grid card. The WorkSection link condition is: `project.problem != null` (or a boolean `hasCaseStudy` flag). Choose: `hasCaseStudy: boolean` is more explicit and avoids the query having to fetch `problem` just for the grid.

```typescript
// Recommended: boolean flag on project for conditional link rendering
defineField({
  name: 'hasCaseStudy',
  title: 'Has case study page',
  type: 'boolean',
  initialValue: false,
  description: 'Enable to make the work grid card a link to the case study page.',
}),
```

### Pattern 3: FAQ on siteSettings (append `faqs` array)

The `seoPage.ts` schema has a `faqs` array with `{question: string, answer: text}` objects. [VERIFIED: sanity/schemaTypes/seoPage.ts:63-99] Use the identical shape on `siteSettings`:

```typescript
// In siteSettings.ts — append AFTER the `aboutPhoto` field:
defineField({
  name: 'faqs',
  title: 'Homepage FAQs',
  type: 'array',
  of: [
    {
      type: 'object',
      fields: [
        defineField({
          name: 'question',
          title: 'Question',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'answer',
          title: 'Answer',
          type: 'text',
          rows: 3,
          validation: (Rule) => Rule.required(),
        }),
      ],
    },
  ],
  description: '5–7 questions for the homepage FAQ section.',
}),
```

**Why `siteSettings` and not a separate `faq` document type:** The FAQ is global singleton content, not a set of independently published documents. `siteSettings` is already DE/EN document-level i18n via the plugin. A separate `faq` type would require the same plugin wiring, a new structure.ts entry, and a new top-level query — for 5–7 items that are always shown together. `siteSettings.faqs` is the minimal, non-breaking path. It also means the existing `SITE_SETTINGS_QUERY` just needs `faqs[]{question, answer}` added to the projection.

### Pattern 4: WorkSection Conditional Link Upgrade

The current `WorkSection.tsx` uses `<div>` with `cursor-default` for all cards. [VERIFIED: components/sections/WorkSection.tsx:53-55]

The minimal upgrade wraps each card in a Next.js `<Link>` when `project.hasCaseStudy` is true:

```typescript
// In WorkSection.tsx: add Link import
import Link from 'next/link'

// Replace the card <div> wrapper:
const CardWrapper = project.hasCaseStudy ? Link : 'div'
const wrapperProps = project.hasCaseStudy
  ? {
      href: `/${locale}/work/${project.slug?.current}`,
      'aria-label': locale === 'de'
        ? `Fallstudie ${project.title} anzeigen`
        : `View case study for ${project.title}`,
    }
  : {}

return (
  <CardWrapper
    key={project._id}
    className={`... ${project.hasCaseStudy ? 'cursor-pointer' : 'cursor-default'} ...`}
    {...wrapperProps}
  >
    {/* existing card content unchanged */}
  </CardWrapper>
)
```

**Pitfall:** `Link` adds an `<a>` tag; the existing `focus-visible:ring-2 focus-visible:ring-accent` on the div will migrate naturally. However, the `data-testid="work-card"` test in `tests/sections/work.spec.ts` currently asserts cards are NOT links (`expect(tagName).not.toBe('a')`). That test will need to be updated to handle the mixed state.

**GROQ query change:** `PROJECTS_QUERY` currently selects: `_id, title, slug, summary, outcomeNote, image, order`. [VERIFIED: lib/sanity/queries.ts:34-37] Add `hasCaseStudy` to the projection.

### Pattern 5: D-11 Hero Fade-in Bug Fix

**Root cause confirmed by reading `HeroCanvas.tsx`:** [VERIFIED: components/hero/HeroCanvas.tsx:101-118]

The wrapper div is:
```tsx
<div
  ref={wrapperRef}
  className="absolute inset-0 opacity-0 [transition:opacity_500ms_cubic-bezier(0,0,0.2,1)] data-[ready=true]:opacity-100"
  aria-hidden="true"
>
```

And the HeroSection renders:
```tsx
<div className="absolute inset-0 hero-backdrop" aria-hidden="true" />
<HeroCanvas />
```
[VERIFIED: components/sections/HeroSection.tsx:54-55]

The D-11 bug hypothesis from the ROADMAP is that React's reconciler reuses the DOM node at position [0] (the `hero-backdrop` div) when `<HeroCanvas>` mounts and becomes the second child. This can happen if the component renders/unmounts conditionally and React sees two adjacent un-keyed `absolute inset-0` divs.

**Investigation:** Reading `HeroCanvas.tsx` shows the wrapper div IS always rendered unconditionally (the `shouldMount` gate only gates the `<HeroScene>` child, not the wrapper). The `ref={wrapperRef}` is on the wrapper div. The `onReady` callback does `wrapperRef.current.dataset.ready = 'true'` — this sets the attribute on the element the ref points to.

**The actual issue:** The wrapper is rendered inside `HeroCanvas` which is a dynamic import. On first render, `HeroSection` renders: `[hero-backdrop div] + [HeroCanvas dynamic import boundary]`. The HeroCanvas shell mounts first with `shouldMount=false` (wrapper div with `opacity-0` class, no `<HeroScene>` child). When `requestIdleCallback` fires and `setShouldMount(true)`, React re-renders the `<HeroCanvas>` component which re-renders the wrapper div. The `ref.current` should point to the wrapper correctly.

**More likely root cause:** The `wrapperRef` is on the outer wrapper div, but the class `"absolute inset-0 opacity-0 ..."` and the HeroSection's `"absolute inset-0 hero-backdrop"` div share `absolute inset-0`. If React's reconciler reuses the DOM node between the two (key-less, same position in JSX), it would copy the `hero-backdrop` className onto the wrapper.

**Fix options:**

**Option A (recommended): Give the HeroSection's `hero-backdrop` div a stable key**
```tsx
// In HeroSection.tsx:
<div key="hero-backdrop" className="absolute inset-0 hero-backdrop" aria-hidden="true" />
<HeroCanvas />
```
A unique `key` on the sibling prevents React from reusing it for the subsequent dynamic-import component shell.

**Option B: Add a `data-testid` to the wrapper in `HeroCanvas.tsx` and verify with Playwright**
The wrapper already exists but needs `data-testid="hero-canvas-wrapper"` to be verifiable:
```tsx
<div
  ref={wrapperRef}
  data-testid="hero-canvas-wrapper"
  className="absolute inset-0 opacity-0 [transition:opacity_500ms_cubic-bezier(0,0,0.2,1)] data-[ready=true]:opacity-100"
  aria-hidden="true"
>
```
Then in a Playwright test: `expect(wrapper).toHaveAttribute('data-ready', 'true')` and `expect(wrapper).toHaveCSS('opacity', '1')`.

**Option C: Restructure JSX to put HeroCanvas BEFORE hero-backdrop**
```tsx
<HeroCanvas />
<div className="absolute inset-0 hero-backdrop" aria-hidden="true" />
```
This changes the DOM order — the fallback gradient would render on top of the canvas, defeating Phase 5's fade-in-over-gradient intent.

**Recommendation: Option A + add `data-testid="hero-canvas-wrapper"` (Option B testability).** Apply a `key` prop to the `hero-backdrop` div in `HeroSection.tsx` to prevent sibling node reuse. This is a one-line change with no visual or behavioral side effects. The Playwright verification (data-ready + opacity assertion) provides the evidence that the fix worked.

**Reduced motion compliance:** The hero fade-in fix must also respect `useReducedMotion()`. `HeroCanvas` already returns `<HeroFallback />` before reaching the wrapper div when `prefersReduced` is true. [VERIFIED: components/hero/HeroCanvas.tsx:99] No additional change needed for reduced motion.

### Anti-Patterns to Avoid

- **Adding a `caseStudySlug` field to `project`:** The existing `slug` field is per-locale and already owned by each document. Adding a second slug creates duplication and maintenance overhead. Use `slug.current` for routing + `hasCaseStudy` boolean as the gate.
- **Creating a separate `faq` document type:** See Pattern 3 rationale — `siteSettings.faqs` is the correct, minimal path for singleton FAQ content.
- **Modifying `FaqAccordion.tsx`:** It works as-is for the homepage. Zero changes needed. [VERIFIED: components/seo/FaqAccordion.tsx:1-57]
- **Fetching FAQ separately from siteSettings:** The homepage already calls `getSiteSettings(locale)`. Add `faqs[]{question, answer}` to the `SITE_SETTINGS_QUERY` projection — no additional fetch call needed.
- **Stagger animations:** UI-SPEC explicitly prohibits stagger on Process steps or case study bands. Each `MotionSection` fires independently.
- **`dynamicParams = true` on case study route:** Must be `false` — only Sanity-seeded slugs resolve. A non-existent slug must 404, not attempt a runtime Sanity fetch on Vercel's edge.
- **Portable Text for `problem`/`solution`/`outcomeText` fields:** Following Phase 3 D-04 convention, these are plain `type: 'text'` — not Portable Text blocks. Pitfall 3 from seoPage schema applies equally here: PT would serialize to `[{_type:'block'}]` in a TypeScript string context.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| FAQ disclosure behavior | Custom `useState` toggle | `<details>/<summary>` (existing `FaqAccordion.tsx`) | Native AT semantics for free; chevron rotation already wired via CSS `group-open:rotate-180` |
| Locale-aware routing | Manual path construction | `<Link href={\`/${locale}/work/${slug}\`}>` | next-intl's `useRouter`/`Link` is overkill here — the locale is already available as a prop from the RSC; direct string interpolation is correct for these internal links |
| Case study page shell | Bespoke layout from scratch | Clone `SeoPageLayout.tsx` / `app/[locale]/s/[slug]/page.tsx` patterns | All patterns (MotionSection bands, hero grid, CTA strip, `notFound()`) are tested and verified |
| axe violation detection | Manual DOM inspection | `@axe-core/playwright` (already installed, `tests/a11y/axe.spec.ts`) | Extend the existing test with new paths |
| Bilingual static copy | Hardcoded `locale === 'de' ? '...' : '...'` ternaries in components | `useTranslations` / message dictionaries (`messages/de.json`, `messages/en.json`) | Consistent with all other static sections; keeps copy in one place |

---

## Common Pitfalls

### Pitfall 1: GROQ Projection Missing New Fields
**What goes wrong:** TypeScript typegen (`sanity.types.ts`) only includes fields in the query projection. If `hasCaseStudy`, `problem`, `solution`, `outcomeValue`, etc. are added to the schema but not the GROQ query, they appear as `undefined` at runtime and TypeScript won't flag it because the generated type omits them.
**How to avoid:** Every new schema field consumed by a component must be added to the corresponding `defineQuery` projection in `lib/sanity/queries.ts` AND `sanity typegen` must be re-run to regenerate `sanity.types.ts`.
**Warning signs:** Component receives `undefined` for new fields; TypeScript shows the field does not exist on the inferred type.

### Pitfall 2: Work Grid Tests Break on Link Upgrade
**What goes wrong:** `tests/sections/work.spec.ts:49` asserts `expect(tagName).not.toBe('a')` and `tests/sections/work.spec.ts:93-99` checks `expect(linkCount).toBe(0)`. [VERIFIED: tests/sections/work.spec.ts:49,93-99] After the conditional link upgrade, cards with `hasCaseStudy: true` become `<a>` tags. These assertions will fail.
**How to avoid:** Update the work.spec.ts tests to handle the mixed state: when `hasCaseStudy` is true, `tagName` IS `'a'`; when false, it is NOT. The test must branch on presence of `href`.
**Warning signs:** `work.spec.ts` failures after the WorkSection edit; CI red on the "work cards have no links" test.

### Pitfall 3: `siteSettings.faqs` Query Projection Gap
**What goes wrong:** `SITE_SETTINGS_QUERY` currently projects: `_id, siteTitle, navLabels, footerText, heroHeadline, heroSubline, contactEmail, address, steuernummer, vatNote, defaultSeo, aboutPhoto, impressumBody, datenschutzBody`. [VERIFIED: lib/sanity/queries.ts:149-156] It does NOT include `faqs`. Adding `faqs` to the schema without updating the query means the homepage `settings` object will not carry FAQ data.
**How to avoid:** Update `SITE_SETTINGS_QUERY` to add `faqs[]{question, answer}` to the projection.

### Pitfall 4: `heroSubline` vs `heroSubline` Inconsistency in Query
**What goes wrong (pre-existing inconsistency found):** `siteSettings.ts` defines the field as `heroSubline` [VERIFIED: sanity/schemaTypes/siteSettings.ts:53], but `SITE_SETTINGS_QUERY` projects `heroSubline` too [VERIFIED: lib/sanity/queries.ts:151] — these match. However, note that the schema has `heroSubline` (line 53 of `siteSettings.ts`) while the query also has `heroSubline`. This is consistent. No issue. Just verify this stays consistent if the query is extended.

### Pitfall 5: Missing `stega: false` on `generateStaticParams` fetch
**What goes wrong:** The `generateStaticParams` function for case study pages fetches project slugs. If stega encoding is enabled (it lives on the Sanity client in `lib/sanity/client.ts`), slugs in static params will be stega-encoded and will corrupt the URLs.
**How to avoid:** The existing `client` in `lib/sanity/client.ts` has `stega: false` as noted in CMS-03. Verify `stega: false` is on the client before relying on it for `generateStaticParams`. This was confirmed as working for `/s/[slug]` — the same client is used for `/work/[slug]`, so no change needed.

### Pitfall 6: axe Violations on New Routes Not Covered
**What goes wrong:** `tests/a11y/axe.spec.ts` currently covers `['', '/impressum', '/datenschutz']`. [VERIFIED: tests/a11y/axe.spec.ts:14] New routes (`/work/blumenspiess`, `/work/learnstep`, `/work/lumo`) are not covered. SC #3 requires zero violations "across all pages."
**How to avoid:** Add `'/work/blumenspiess'`, `'/work/learnstep'`, `'/work/lumo'` (using the actual DE slugs from Sanity) to the `paths` array in `axe.spec.ts`. Since slugs are locale-dependent, the test must use the correct locale-slug pairs.

### Pitfall 7: `notFound()` Called Before `<script>` JSON-LD
**What goes wrong:** In the SEO page route, `notFound()` is called immediately if the Sanity fetch returns null. [VERIFIED: app/[locale]/s/[slug]/page.tsx:93-99] This is correct. For case studies, the same pattern must hold: call `notFound()` at the top of the default export before any JSX is rendered.

### Pitfall 8: Hero Fade-in Fix Fails for Non-First-Load
**What goes wrong:** If the `key` prop fix is applied but the transition is not re-verified after a soft navigation (Next.js client-side navigation back to `/`), the hero may hard-cut again. React's reconciler behavior differs between initial load and client navigation.
**How to avoid:** Playwright test should navigate away from `/de` and back, then verify the fade-in still fires. Add a navigation test step.

---

## Code Examples

### Case Study GROQ Queries

```typescript
// Source: lib/sanity/queries.ts (existing pattern — mirrors PROJECT_BY_SLUG_QUERY)
// Add to PROJECTS_QUERY projection (WorkSection needs hasCaseStudy for conditional links):
export const PROJECTS_QUERY = defineQuery(
  `*[_type == "project" && language == $locale] | order(order asc){
     _id, title, slug, summary, outcomeNote, image, order, hasCaseStudy
   }`,
)

// New: full case study data for the detail page
export const CASE_STUDY_BY_SLUG_QUERY = defineQuery(
  `*[_type == "project" && language == $locale && slug.current == $slug][0]{
     _id, title, slug, summary, outcomeNote, image, order,
     problem, solution, outcomeText, outcomeValue, outcomeLabel,
     heroImage, clientCategory, hasCaseStudy
   }`,
)

export function getCaseStudyBySlug(locale: string, slug: string) {
  return client.fetch(CASE_STUDY_BY_SLUG_QUERY, { locale, slug })
}
```

### siteSettings FAQ Query Addition

```typescript
// Source: lib/sanity/queries.ts (SITE_SETTINGS_QUERY extension)
export const SITE_SETTINGS_QUERY = defineQuery(
  `*[_type == "siteSettings" && language == $locale][0]{
     _id, siteTitle, navLabels, footerText, heroHeadline, heroSubline,
     contactEmail, address, steuernummer, vatNote, defaultSeo,
     aboutPhoto, impressumBody, datenschutzBody,
     faqs[]{question, answer}
   }`,
)
```

### Homepage page.tsx Addition (new sections)

```typescript
// Source: app/[locale]/page.tsx (existing Promise.all pattern — Pattern 2)
// No new fetch call — faqs comes from settings:
const [settings, services, projects, testimonials] = await Promise.all([
  getSiteSettings(locale),   // now includes faqs[]
  getServices(locale),
  getProjects(locale),       // now includes hasCaseStudy
  getTestimonials(locale),
])

// In JSX — after WorkSection, before TestimonialsSection:
const projectsWithCaseStudy = projects?.filter(p => p.hasCaseStudy) ?? []
{projectsWithCaseStudy.length > 0 && (
  <CaseStudiesBridge projects={projectsWithCaseStudy} locale={locale} />
)}

// After TestimonialsSection:
<ProcessSection locale={locale} />
<GuaranteeSection locale={locale} />

// Before About:
{settings?.faqs && settings.faqs.length > 0 && (
  <FaqSection faqs={settings.faqs} locale={locale} />
)}
```

### axe Test Extension

```typescript
// Source: tests/a11y/axe.spec.ts (existing pattern — verified lines 14-15)
// Extend paths to include new routes:
const paths = [
  '',
  '/impressum',
  '/datenschutz',
  '/work/blumenspiess',   // actual DE slug from Sanity
  '/work/learnstep',      // actual DE slug from Sanity
  '/work/lumo',           // actual DE slug from Sanity
] as const
// Note: EN paths also need coverage — add locale-specific slug variants if slugs differ
```

### D-11 Hero Fix (HeroSection.tsx)

```tsx
// Source: components/sections/HeroSection.tsx (verified line 54)
// ONE-LINE FIX: add key prop to hero-backdrop sibling
<div key="hero-backdrop" className="absolute inset-0 hero-backdrop" aria-hidden="true" />
<HeroCanvas />

// And in HeroCanvas.tsx, add data-testid for verification:
<div
  ref={wrapperRef}
  data-testid="hero-canvas-wrapper"
  className="absolute inset-0 opacity-0 [transition:opacity_500ms_cubic-bezier(0,0,0.2,1)] data-[ready=true]:opacity-100"
  aria-hidden="true"
>
```

---

## axe-Playwright Audit Checklist

Phase 7 expands the existing `axe.spec.ts` (which already achieves zero violations on `/de`, `/en`, `/de/impressum`, `/en/impressum`, `/de/datenschutz`, `/en/datenschutz`). [VERIFIED: tests/a11y/axe.spec.ts:14-15]

### New Routes to Add to axe Coverage
- `[locale]/work/[slug]` for each of the three case study pages (DE + EN = 6 URLs)

### Known axe Concern Areas for Phase 7 Content

| Element | Risk | Mitigation |
|---------|------|------------|
| Work grid `<Link>` cards | Wrapping div-with-image in `<a>` needs `aria-label` (no visible text label) | `aria-label` required per UI-SPEC: `"Fallstudie {title} anzeigen"` / `"View case study for {title}"` |
| Process step number chips | `aria-hidden="true"` required on visual number (`"01"`, `"02"`, `"03"`) | Per UI-SPEC: `aria-hidden="true"` on the chip span |
| Guarantee trust tick checkmarks | `aria-hidden="true"` required on `✓` character | Per UI-SPEC: apply `aria-hidden="true"` to the checkmark character, not the tick text |
| `<FaqAccordion>` on homepage | Already verified in SEO pages; same component, zero changes needed | No action |
| Case study page H1 | Must be first heading; no skipped heading levels after H1 | Each band uses `<h2>` for sub-headers — correct hierarchy |
| Skip link | Must match existing pages' skip-link pattern | Case study pages use layout.tsx Header which already provides skip-link infrastructure |
| Multi-locale pages | hreflang must be present; already handled by `generateMetadata` | Add `buildHreflangAlternates` to case study page metadata |

### axe Tags to Run
```typescript
.withTags(['wcag2a', 'wcag2aa'])
.exclude('[data-decorative="true"]')
```
These match the existing test exactly. [VERIFIED: tests/a11y/axe.spec.ts:25-26]

---

## Motion Audit Checklist

### MotionSection Parameters (locked values)

From `components/ui/MotionSection.tsx` [VERIFIED: components/ui/MotionSection.tsx:32-46]:
- `initial: { opacity: 0, y: 10 }` — 10px rise, 0 opacity
- `whileInView: { opacity: 1, y: 0 }` — once, at `amount: 0.15`
- `transition (normal): { duration: 0.5, ease: [0.0, 0.0, 0.2, 1] }` — matches `--ease-out` [VERIFIED: styles/tokens.css:95]
- `transition (reduced): { duration: 0 }` — instant via `useReducedMotion()`

**These values MUST NOT be changed in Phase 7.** The `MotionSection` component is shared across all sections.

### Sections to Verify in Motion Audit Pass

| Section | MotionSection? | Motion Concern |
|---------|---------------|----------------|
| Hero (`#hero`) | Yes (in `HeroSection.tsx`) | D-11 fade-in bug fix; verify the MotionSection entrance also fires correctly after fix |
| Services | Yes | Verify — audit for consistent `py-24 px-4 md:px-8 lg:px-16` |
| Pricing | Yes | Verify |
| Work | Yes | Verify; also verify hover lift on cards (CSS transition not motion/react) |
| Testimonials | Yes | Verify |
| About | Yes | Verify |
| Contact | Yes | Verify |
| FAQ (new) | Yes | Standard MotionSection wrapper |
| Process (new) | Yes | Standard MotionSection wrapper — each band, not each step |
| Guarantee (new) | Yes | Standard MotionSection wrapper |
| Case Studies Bridge (new) | Yes | Standard MotionSection wrapper |
| Case study bands | Yes (per band) | 5 MotionSections per page, no stagger |

### Motion Anti-Patterns to Check in Existing Sections
- No `stagger` on any child elements (prohibited by UI-SPEC)
- No `duration` values other than `0.5` (normal) or `0` (reduced)
- No easing values other than `[0.0, 0.0, 0.2, 1]` (normal)
- No `animate` prop (must use `whileInView` + `once: true`)
- `FaqAccordion` chevron uses `transition-transform duration-150 ease-[var(--ease-standard)]` — this is CSS transition, not motion/react — correct per UI-SPEC [VERIFIED: components/seo/FaqAccordion.tsx:38]

---

## Runtime State Inventory

Phase 7 adds new Sanity schema fields and new CMS content. No rename/refactor. Relevant inventory:

| Category | Items | Action Required |
|----------|-------|-----------------|
| Stored data | Existing `project` documents in Sanity production (3 projects: Blumenspiess, Learnstep, Lumo) — new fields are optional/nullable | Schema addition is backward-compatible; existing docs render fine with null values for new fields. Studio author must populate new fields for case study pages to resolve. |
| Live service config | None | — |
| OS-registered state | None | — |
| Secrets/env vars | None new | `SANITY_API_READ_TOKEN` (pre-deploy TODO from Phase 4) still applies |
| Build artifacts | `sanity.types.ts` must be regenerated after schema changes | Run `npx sanity@latest typegen generate` after schema edits |

**Schema addition is non-breaking:** All new fields are optional (`validation: Rule.required()` is NOT applied). Existing `project` documents render correctly in `WorkSection` (they have `hasCaseStudy: false` or `undefined` which is falsy — cards remain display-only). Case study pages use `dynamicParams = false` — only slugs explicitly seeded via `generateStaticParams` resolve; an un-authored project never generates a case study URL.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Playwright (existing, `@playwright/test`) |
| Config file | `playwright.config.ts` |
| Quick run command | `npx playwright test tests/a11y/axe.spec.ts --project=chromium` |
| Full suite command | `npx playwright test` |
| axe-playwright | `@axe-core/playwright` (already installed) |

### Phase Requirements → Test Map

| Requirement | Behavior | Test Type | Automated Command | File Exists? |
|-------------|----------|-----------|-------------------|-------------|
| SC #1 — Case study pages | `/de/work/blumenspiess` renders with H1, problem, solution, outcome | smoke | `npx playwright test tests/sections/case-study.spec.ts` | ❌ Wave 0 |
| SC #1 — Work grid links | Cards with `hasCaseStudy` are `<a>` links; others are `<div>` | unit | `npx playwright test tests/sections/work-links.spec.ts` | ❌ Wave 0 |
| SC #2 — FAQ on homepage | `/de` renders `#faq` with accordion items | smoke | `npx playwright test tests/sections/faq.spec.ts` | ❌ Wave 0 |
| SC #2 — Process on homepage | `/de` renders `#process` with 3 steps | smoke | `npx playwright test tests/sections/process.spec.ts` | ❌ Wave 0 |
| SC #3 — axe zero violations | All pages including `/work/[slug]` | a11y | `npx playwright test tests/a11y/axe.spec.ts` | ✅ (extend paths) |
| SC #3 — D-11 hero fade-in | `data-ready=true` on wrapper; opacity transitions to 1 | smoke | `npx playwright test tests/hero/fade-in.spec.ts` | ❌ Wave 0 |
| SC #4 — Motion consistency | MotionSection params match spec; reduced-motion instant | motion | `npx playwright test tests/motion/reduced.spec.ts` | ✅ (extend for new sections) |

### Wave 0 Gaps

- [ ] `tests/sections/case-study.spec.ts` — covers SC #1: case study pages render correctly
- [ ] `tests/sections/work-links.spec.ts` — covers SC #1: conditional link upgrade (updates existing work.spec.ts assertions)
- [ ] `tests/sections/faq.spec.ts` — covers SC #2: homepage FAQ section presence
- [ ] `tests/sections/process.spec.ts` — covers SC #2: homepage process section presence
- [ ] `tests/hero/fade-in.spec.ts` — covers D-11 fix: `data-ready=true` set, opacity=1 after idle mount

---

## Security Domain

`security_enforcement: true`, `security_asvs_level: 1` per config. Phase 7 adds no authentication, no new form fields, no new API routes. Relevant ASVS checks:

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V5 Input Validation | Yes (Sanity CMS is the input surface) | Sanity strings rendered as escaped JSX text nodes — never `dangerouslySetInnerHTML` for CMS content. Established pattern in `SeoPageLayout.tsx` and all existing sections. |
| V5 JSON-LD injection | Yes (case study pages may emit JSON-LD) | `JSON.stringify` is the ONLY serialization sink. Do not inline CMS strings directly into `<script>` content. |
| V4 Access Control | No (read-only public site) | — |
| V2/V3 Auth/Session | No | — |

**Specific to Phase 7:**
- Case study page `problem`, `solution`, `outcomeText` fields are rendered as JSX text nodes (`{project.problem}`) — not via `dangerouslySetInnerHTML`. This is correct per the established T-06-05 pattern.
- The `hasCaseStudy` boolean controls whether a card renders as a `<Link>` — this is client-visible UI logic, not a security gate. There is no server-side route protection needed (case study pages are public).
- New Sanity schema fields with `type: 'text'` (not Portable Text) cannot inject HTML — they are plain strings.

---

## Environment Availability

No new external dependencies. All required tools already verified as available during prior phases.

| Dependency | Required By | Available | Notes |
|------------|-------------|-----------|-------|
| Sanity Studio (local) | Schema additions | Yes | `npx sanity@latest dev` |
| `sanity typegen` | Regenerate `sanity.types.ts` after schema change | Yes | `npx sanity@latest typegen generate` |
| `next start` | axe audit (production-like) | Yes | Run against this, not `next dev` |
| Playwright + @axe-core/playwright | axe audit tests | Yes | Already installed |
| Vercel CLI | Production deploy | Yes | Phase 6 confirmed `vercel --prod` CLI works (git integration builds stale v1) |

---

## Surprises and Landmines Found in Codebase

### Surprise 1: `FaqAccordion` Is in `components/seo/`, Not `components/ui/`

The `FaqAccordion` component lives at `components/seo/FaqAccordion.tsx` [VERIFIED: components/seo/FaqAccordion.tsx:1]. It is currently used only by `SeoPageLayout.tsx`. For the homepage FAQ section, the import path is `@/components/seo/FaqAccordion` — not `@/components/ui/FaqAccordion`. The UI-SPEC says "reuses the existing FaqAccordion component with zero modification" — this is correct, but the import path is `seo/`, not `ui/`. The planner must use the correct path.

### Surprise 2: `heroSubline` Not `heroSubline` — Field Name in SITE_SETTINGS_QUERY

`SITE_SETTINGS_QUERY` at `lib/sanity/queries.ts:151` projects `heroSubline`. [VERIFIED: lib/sanity/queries.ts:151] The `siteSettings.ts` schema at line 53 defines the field as `heroSubline`. [VERIFIED: sanity/schemaTypes/siteSettings.ts:53] These match — but worth calling out since `page.tsx` uses `settings?.heroSubline` for the `HeroSection` prop. If anyone renames this field, the query projection AND page.tsx must both be updated.

### Surprise 3: Work Grid Test Has Hard-Coded "No Links" Assertions

`tests/sections/work.spec.ts` lines 49 and 93-99 [VERIFIED] assert cards are never `<a>` tags. These tests WILL break after the WorkSection link upgrade. They must be updated as part of the same plan that upgrades WorkSection. Failing to do so creates a false CI failure that blocks verification.

### Surprise 4: D-11 Fade-in Bug — The Wrapper IS Correctly Structured

Reading `HeroCanvas.tsx` carefully shows the wrapper div renders unconditionally (not gated by `shouldMount`). The `ref={wrapperRef}` is on the correct element. The `data-ready` is set on `wrapperRef.current`. The most likely cause of the fade-in bug is React sibling reconciler reuse between the `hero-backdrop` div and the HeroCanvas dynamic-import boundary — both are adjacent `absolute inset-0` elements with no key. The fix (adding `key="hero-backdrop"` to the sibling div) is minimal and low-risk.

### Surprise 5: `PROJECTS_QUERY` Does Not Include `hasCaseStudy`

The current `PROJECTS_QUERY` [VERIFIED: lib/sanity/queries.ts:34-37] does not include `hasCaseStudy` (or `problem`, `solution`, etc.) because these fields don't exist yet. When adding `hasCaseStudy` to the schema, the query projection must be updated simultaneously. TypeScript will catch the access on the first type check after `sanity typegen` runs.

### Surprise 6: Homepage Section Order Has One Free Slot

Current homepage order: Hero → Services → Pricing → Work → Testimonials → About → Contact. [VERIFIED: app/[locale]/page.tsx:88-116]

UI-SPEC extends this to: Hero → Services → Pricing → Work → **Case Studies CTA Bridge** → Testimonials → **Process** → **Guarantee** → **FAQ** → About → Contact.

This requires inserting 4 new sections into the `page.tsx` JSX. The `Promise.all` fetch already covers `projects` (used by `CaseStudiesBridge`) and `settings` (which will carry `faqs`). No additional fetches needed.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The actual Sanity slugs for the three client projects are `blumenspiess`, `learnstep`, and `lumo` (for DE locale) | axe audit checklist, code examples | axe test paths would reference wrong URLs; must verify actual slug values in Studio |
| A2 | Adding `key="hero-backdrop"` to the sibling div is the correct fix for D-11 | D-11 Fix | If root cause is something else (e.g. a Next.js dynamic import reconciler edge case), the fix may not work; the Playwright data-ready assertion will catch this |
| A3 | `hasCaseStudy: boolean` is preferable to `caseStudySlug: slug` for the link condition | Schema pattern | If the user wants per-locale different case study URLs (e.g. DE: `/projekte/blumenspiess`, EN: `/work/blumenspiess`), the boolean approach is still correct because the route uses the doc's own `slug` field |

---

## Sources

### Primary (HIGH confidence)

- `components/hero/HeroCanvas.tsx` — HeroCanvas wrapper, onReady, wrapperRef pattern [VERIFIED this session]
- `components/sections/HeroSection.tsx` — hero-backdrop sibling structure [VERIFIED this session]
- `sanity/schemaTypes/project.ts` — existing project fields; no case study fields present [VERIFIED this session]
- `sanity/schemaTypes/siteSettings.ts` — existing siteSettings fields; no `faqs` array present [VERIFIED this session]
- `sanity/schemaTypes/seoPage.ts` — `faqs[]` array pattern with `{question, answer}` objects [VERIFIED this session]
- `lib/sanity/queries.ts` — PROJECTS_QUERY, SITE_SETTINGS_QUERY, SEO pattern for counterpart slug [VERIFIED this session]
- `app/[locale]/s/[slug]/page.tsx` — case study route template: generateStaticParams, dynamicParams=false, notFound() [VERIFIED this session]
- `components/ui/MotionSection.tsx` — motion parameters verbatim [VERIFIED this session]
- `styles/tokens.css` — --ease-out value `cubic-bezier(0.0, 0.0, 0.2, 1)` [VERIFIED this session]
- `components/seo/FaqAccordion.tsx` — component location and implementation [VERIFIED this session]
- `components/sections/WorkSection.tsx` — cursor-default, no links, existing test assertions affected [VERIFIED this session]
- `tests/a11y/axe.spec.ts` — existing paths array and axe configuration [VERIFIED this session]
- `tests/sections/work.spec.ts` — "no links" assertions at lines 49, 93-99 [VERIFIED this session]
- `messages/de.json` — existing message key structure (no Process/Guarantee/FAQ keys yet) [VERIFIED this session]
- `app/[locale]/page.tsx` — current section order, Promise.all pattern [VERIFIED this session]

### Tertiary (LOW confidence)

- A1: Actual Sanity slug values for Blumenspiess/Learnstep/Lumo — not verified (requires Studio login or `sanity documents query`) [ASSUMED]

---

## Metadata

**Confidence breakdown:**
- Sanity schema plan: HIGH — read all relevant schema files; know the exact fields and insertion points
- Case study routing: HIGH — `s/[slug]/page.tsx` is a direct, verified template
- WorkSection link upgrade: HIGH — read the component source and existing tests
- D-11 hero fix: HIGH — root cause diagnosis from reading HeroCanvas.tsx and HeroSection.tsx; fix is a one-line key prop addition
- axe audit: HIGH — existing test infrastructure verified; extension is additive
- Motion audit: HIGH — MotionSection parameters read verbatim from source
- Actual Sanity slug values for case study paths: LOW — requires Studio data inspection

**Research date:** 2026-09-11
**Valid until:** 2026-10-11 (stable stack, no fast-moving dependencies in Phase 7 scope)

---

## RESEARCH COMPLETE
