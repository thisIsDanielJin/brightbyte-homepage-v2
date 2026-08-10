# Pitfalls Research

**Domain:** Bilingual (DE/EN) freelance studio marketing site — Next.js App Router + R3F hero + Sanity CMS + path-based i18n + programmatic SEO
**Researched:** 2026-08-10
**Confidence:** MEDIUM (official docs verified via WebFetch; R3F internals via library docs; design/CMS pitfalls from domain expertise cross-checked against v1 post-mortem)

---

## Critical Pitfalls

### Pitfall 1: R3F Canvas Loaded Server-Side → Hydration Mismatch + Blocked LCP

**What goes wrong:**
Importing the R3F `<Canvas>` component in a standard Next.js Server Component or without `ssr: false` causes a hydration mismatch error at runtime — three.js reads `window` and `WebGLRenderingContext` during module evaluation, which don't exist in the Node environment. Even when the mismatch is suppressed, the WebGL context initialization on the client blocks the main thread during page load, directly delaying LCP on mobile (3G/4G networks, mid-range Android devices).

**Why it happens:**
Next.js App Router prerenders all components by default. Developers add R3F without reading the SSR caveat, or use a `'use client'` directive alone thinking that's sufficient — it is not. The `'use client'` boundary defers execution to the client but doesn't defer the *module import* on the server during static generation.

**How to avoid:**
Always load the hero canvas component with `dynamic()` and `{ ssr: false }`:

```tsx
const HeroCanvas = dynamic(() => import('@/components/HeroCanvas'), { ssr: false })
```

Additionally, wrap it in a `<Suspense>` boundary with a CSS-matched placeholder (same background colour and aspect ratio as the canvas) so the layout slot is reserved and CLS is prevented. The placeholder itself becomes the LCP element — make it load within 2.5 s.

**Warning signs:**
- `ReferenceError: window is not defined` during `next build`
- Flickering or white flash on hero section on first load
- Lighthouse LCP score degrading specifically on mobile throttled tests
- `hydration mismatch` React error in browser console

**Phase to address:** Identity & Design Tokens phase (before any hero implementation). The canvas wrapper pattern must be defined before the hero component is built.

---

### Pitfall 2: hreflang Tags Silently Ignored by Google

**What goes wrong:**
Google ignores hreflang entirely if the bidirectional linking contract is broken: every locale variant must reference every other variant *and itself*. A `/de` page that lists `/en` but where `/en` doesn't reciprocally list `/de` results in both sets of tags being discarded — the pages compete in search results rather than being recognised as equivalents. This is the single most common international SEO failure and has no visible error; it silently wastes the entire programmatic SEO investment.

**Why it happens:**
Developers add hreflang to the "default" locale page and forget to replicate the full alternates object on the other locale pages. With programmatic SEO pages (`/s/[slug]`), it's easy to add hreflang to the DE variant but omit the EN variant — or vice versa. Relative URLs in `alternates.languages` also silently fail if `metadataBase` is missing from `app/[lang]/layout.tsx`.

**How to avoid:**
- Set `metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL)` in the root layout — this is required for Next.js to resolve relative alternate URLs to fully-qualified ones.
- Create a shared `buildAlternates(slug, lang)` utility that always returns the full symmetric set: `{ de: 'https://...', en: 'https://...', 'x-default': 'https://.../de' }`.
- Call that utility from `generateMetadata` on *every* locale variant of every page, including programmatic SEO pages.
- Set `x-default` to the DE (primary) URL, not the root `/` — the DE locale is the business default for a Berlin studio targeting local clients.
- Include sitemap `<xhtml:link>` children for every variant on programmatic pages.

**Warning signs:**
- Google Search Console "Alternate page with proper canonical tag" for locale pages that should be indexed independently
- Both `/de` and `/en` versions of the same page appearing independently in SERPs for the same query
- `next build` output showing hreflang with `https://localhost` or relative paths (missing metadataBase)

**Phase to address:** i18n Routing & SEO Foundation phase. Must be verified with a post-deploy GSC inspection before considering the phase done.

---

### Pitfall 3: Design Incoherence — the "AI-Generated" Look

**What goes wrong:**
Sections are built sequentially by different prompts/sessions, each making local type, spacing, and colour decisions that seem fine in isolation but produce a fragmented visual language at page scroll. The site reads as assembled rather than designed. Specific symptoms from the v1 post-mortem that recur in rebuilds: multiple font families serving overlapping roles, inline hardcoded colours that bypass the token system, card and section templates that are generic rather than expressing a specific visual personality, and spacing that doesn't follow a consistent scale.

**Why it happens:**
No identity anchor exists before components are built, so each component becomes a design decision point. Tailwind makes this worse — it's easy to reach for `text-2xl font-semibold text-gray-900` instead of a semantic token, and that one-off decision multiplies across 8–10 sections. Palette tokens defined in `tailwind.config` get re-stated as hardcoded values the moment someone is in a hurry.

**How to avoid:**
- Complete the full brand identity (palette, type scale, spacing, motion) and document it as a design token manifest *before writing a single component*. The identity phase is a hard gate.
- Use Tailwind semantic aliases — `text-primary`, `bg-surface`, `text-heading` — so there are no raw colour values in component files. Lint rule: forbid `text-gray-*`, `text-zinc-*`, `bg-white`, `bg-black` in component files.
- Establish a type hierarchy with exactly two typefaces maximum (one for display, one for body) and a named scale (`--text-sm`, `--text-base`, `--text-lg`, `--text-xl`, `--text-2xl`). Never use raw `rem` values outside the token file.
- After each section is built, run a Playwright screenshot and compare it against the identity reference before moving to the next section. Divergences are fixed immediately, not accumulated.
- The "AI-generated" look checklist: more than 2 font families → fail; any hardcoded hex → fail; card components with generic title/body/CTA layout appearing 3+ times with no visual differentiation → fail; section background colours that don't come from the token set → fail.

**Warning signs:**
- `grep -r '#[0-9a-fA-F]\{3,6\}' src/` returns hits in component files
- Tailwind class audit shows `text-gray-`, `text-zinc-`, `text-slate-` classes in components
- Playwright screenshot comparison reveals different heading weights between sections
- The hero section and the services section feel like they're from different sites

**Phase to address:** Identity & Design Tokens phase (the output of this phase is the contract all subsequent phases must follow). Then enforced per-section in every UI phase via Playwright screenshot gate.

---

### Pitfall 4: Sanity Locale Strategy Chosen Wrong / Changed Mid-Project

**What goes wrong:**
Sanity offers two fundamentally different i18n strategies: field-level (one document, locale fields as arrays) and document-level (separate documents per locale linked by a translation reference). Choosing one and then migrating to the other mid-project is a dataset migration — every document must be transformed, every GROQ query updated, and every frontend component that reads locale data rewritten. This is a 2–3 day rewrite risk.

The secondary failure mode: querying without locale filter. `doc.title` on a field-level localised title returns the entire array `[{language: 'de', value: '...'}, {language: 'en', value: '...'}]`, not a string — this silently renders as `[object Object]` until noticed.

**Why it happens:**
Developers pick whichever strategy looks simpler for the first document type without thinking through the publishing workflow. For a studio site where a Berlin-based non-technical owner edits content, field-level (one document to edit, both languages visible simultaneously) is usually right — but document-level is chosen because it looks cleaner in the schema.

**How to avoid:**
- Use **document-level** translation (`@sanity/document-internationalization` plugin) for types where a non-technical client edits content: `project`, `testimonial`, `service`. Documents are clearly labelled DE/EN in the Studio, no locale-array confusion.
- Use **field-level** for types where content is identical except for the text: `siteSettings`, `navItem`, `footerLink`. One document, locale-keyed text fields.
- Write the GROQ filter utility once: `localeField(field, $lang)` → `coalesce(field[language == $lang][0].value, field[language == "de"][0].value, "")`. Use it everywhere; never inline the filter.
- Copy data for existing v1 content into the new schema during a single dedicated migration phase — not incrementally across UI phases.

**Warning signs:**
- A component renders `[object Object]` for a title or body field
- Studio editors see a confusing mix of some documents with locale tabs and some with locale arrays
- GROQ queries in components have inline `[language == 'de'][0]` scattered without a shared utility
- Any `_key`-based GROQ filter on locale fields (breaks with `internationalized-array` v5+)

**Phase to address:** Content Architecture phase (before any Sanity Studio schema work). The migration of v1 content should happen in a dedicated sub-phase before frontend components are built.

---

### Pitfall 5: R3F Hero Killing Mobile Performance / Core Web Vitals

**What goes wrong:**
Even with `ssr: false`, the R3F Canvas on mobile causes: (a) high LCP — the browser can't render above-the-fold text until the WebGL context allocates, (b) high INP — useFrame callbacks, even idle ones, consume main-thread budget, (c) CLS if the canvas placeholder has different dimensions from the rendered canvas, and (d) battery drain / fan noise on low-end devices, which users associate with the site's quality.

**Why it happens:**
The hero canvas is treated as a visual flourish and added without a performance budget. `frameloop="demand"` is not set on idle scenes. Textures are loaded without caching. The canvas has no explicit aspect-ratio container, causing a layout shift when it mounts.

**How to avoid:**
- Set a hard performance budget: hero 3D scene must not prevent LCP text content from painting within 2.5 s on a Moto G4 (simulated in Lighthouse).
- Set `frameloop="demand"` unless the scene is continuously animated. For a subtle ambient 3D object this means the frame loop only runs when props change.
- Use `<PerformanceMonitor>` to detect low-frame-rate devices and call `regress()` to drop resolution/effects.
- Wrap the Canvas in a CSS container with explicit `aspect-ratio` (e.g. `aspect-ratio: 16/9`) so the layout slot is always reserved — this zeroes CLS.
- Respect `prefers-reduced-motion`: if the user has enabled this OS preference, render a static fallback (a CSS gradient or static image) with no R3F Canvas at all.
- Keep the draw call count under 200 for the hero. If the scene needs more than ~5 meshes it's probably too complex for a marketing hero.

**Warning signs:**
- Lighthouse mobile LCP > 2.5 s on any page with the hero
- CLS score > 0.1 (canvas height changes after mount)
- Playwright mobile screenshot shows layout shift between first paint and settled state
- Profiler shows continuous 60fps frame loop even when nothing is moving

**Phase to address:** Hero Implementation phase. LCP must be measured on mobile before the phase is considered complete — Playwright + Lighthouse CI is the acceptance criterion.

---

### Pitfall 6: Client-Side i18n Leaking Back In (SEO Regression)

**What goes wrong:**
The v1 used `?lang=` query params and localStorage to switch language, which meant both DE and EN versions of a page had the same URL — Googlebot only saw one version, and the DE and EN text competed for the same URL's indexation signal. Rebuilding with path-based routing (`/de`, `/en`) fixes this, but the regression risk is: a developer adds a language toggle that reads from `localStorage` or a React context and updates the DOM client-side, effectively re-creating the v1 anti-pattern even though the URL structure looks correct.

**Why it happens:**
It's tempting to add a client-side language switcher that "previews" the other language without navigating — this is a product UX decision that silently breaks the SEO contract. It also happens when a developer adds a `useTranslations()` hook from next-intl in a Client Component without the locale coming from the URL segment — the locale falls back to a default, producing wrong-locale content at the correct URL.

**How to avoid:**
- The language switcher must be a `<Link href="/en/...">` navigation, not a state mutation. No `onClick(() => setLocale('en'))` anywhere.
- In next-intl, locale always comes from the `[lang]` URL segment. Never read locale from cookies or localStorage in components — only from `useLocale()` which derives from the segment.
- Add a smoke test: visit `/de` in a headless browser, assert `<html lang="de">` and German copy. Visit `/en`, assert English copy. This test catches regression immediately.

**Warning signs:**
- A `useLocale` hook with a default value fallback not derived from params
- Any component file containing `localStorage.getItem('lang')` or `Cookies.get('locale')`
- Language switcher uses `onClick` + state instead of `<Link>`
- Google Search Console shows `/de` being indexed with English content

**Phase to address:** i18n Routing & SEO Foundation phase. The smoke test should be part of the phase acceptance criteria.

---

### Pitfall 7: Accessibility Failure on a Site Whose Value Prop Is Craft

**What goes wrong:**
The site's entire pitch is high-quality work. An SMB client who notices the site is inaccessible — or a client who uses a screen reader, keyboard navigation, or has a vestibular disorder and gets nauseated by the 3D hero — directly contradicts the studio's credibility claim. Specific failure modes: 3D animation triggering vestibular reactions in users with motion sensitivity, keyboard focus not visible on the dark hero overlay, hero text lacking sufficient contrast against the 3D background, and missing `lang` attribute on `<html>`.

**Why it happens:**
Accessibility is treated as a checklist at the end rather than a constraint during design. The 3D hero is aesthetically driven without considering `prefers-reduced-motion`. Contrast ratios on overlaid text are eyeballed rather than measured against WCAG AA (4.5:1 for body, 3:1 for large text).

**How to avoid:**
- `prefers-reduced-motion`: if true, the R3F Canvas must not render — use a static gradient/image fallback. Implement this as a CSS media query on the canvas wrapper and as a React hook that conditionally mounts the Canvas component.
- Text contrast on hero: measure with a contrast checker against the actual background colours produced by the 3D scene at rest. Target WCAG AA minimum; AA+ preferred for a "craft" brand signal.
- `<html lang={locale}>` must be set dynamically from the route segment in the root layout — not hardcoded.
- Keyboard navigation: all interactive elements (nav, CTA buttons, contact form) must have visible `:focus-visible` styles. The hero CTA is the first interactive element — it cannot rely on `outline: none`.
- Playwright accessibility scan (`axe-playwright`) as part of the per-section review gate.

**Warning signs:**
- Lighthouse accessibility score below 95
- `axe` reports missing label, insufficient contrast, or missing lang attribute
- On macOS VoiceOver, the 3D canvas region is announced as an unlabelled landmark
- Any CSS file containing `outline: none` or `outline: 0` without a `:focus-visible` replacement

**Phase to address:** Identity & Design Tokens phase (contrast ratios baked into token definitions). Hero Implementation phase (reduced-motion fallback). Each subsequent UI section phase (axe scan gate).

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcode `#1a1a2e` instead of `var(--color-surface)` | Faster to write | Every palette update requires grep-and-replace across components; breaks dark mode | Never — add the token first |
| Use `text-gray-700` instead of `text-body` | No token setup required | Token system exists but is bypassed; next developer follows the wrong pattern | Never in components |
| Skip `ssr: false` on R3F during development (SSR works locally) | Faster iteration | Build fails on Vercel or produces hydration mismatch in production | Never |
| Set `generateStaticParams` only on DE locale pages | Saves setup time | EN locale pages become dynamic routes, bypassing static caching and LCP gains | Never — both locales must be statically generated |
| Write hreflang only on the default locale layout | Reduces boilerplate | hreflang tags are silently ignored by Google; zero SEO benefit from bilingual pages | Never |
| Use `Promise.all([fetchDE(), fetchEN()])` in a single page component | Single data fetch point | Over-fetches — the page only needs one locale's data | Never; pass locale param and fetch one |
| Field-level Sanity i18n for `project` documents | One document to edit | Editors see complex locale arrays; simultaneous publish required; harder to manage per-language review | Acceptable only for simple site settings, not for editorial content |
| Disable `frameloop="demand"` for "simplicity" | No conditional logic | Continuous 60fps render loop drains battery on all devices even on idle pages | Never for a static/near-static 3D object |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| next-intl + Vercel Analytics | Middleware matcher excludes dots for static file skipping, silently swallowing `/_vercel/insights/view` | Explicitly add `/_vercel/(.*)` to the excluded matcher patterns in `middleware.ts` |
| Sanity + next-intl locale | Fetching Sanity content using a hardcoded locale string | Pass `locale` from `useLocale()` or the `[lang]` param into all GROQ queries as `$lang` variable |
| R3F + Next.js Image | Using a Three.js `TextureLoader` with a path from `next/image` | Use `useLoader(TextureLoader, '/textures/...')` with raw public/ paths — three.js bypasses Next.js image optimisation pipeline entirely |
| Sanity + programmatic SEO pages | Building `/s/[slug]` pages without locale variants | Every programmatic page must exist at both `/de/s/[slug]` and `/en/s/[slug]` with symmetric hreflang |
| next-intl + App Router params | Accessing locale in a Client Component via `useLocale()` without an `<IntlProvider>` ancestor | Wrap the root layout in `<NextIntlClientProvider>` with messages loaded server-side; never derive locale from a cookie in a Client Component |
| Resend contact form + locale | Contact form sends hardcoded DE copy regardless of UI language | Template the email body using the `locale` passed from the form submission |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| R3F Canvas without explicit container dimensions | CLS on hero mount; layout shift score > 0.1 | Wrap Canvas in a div with explicit `aspect-ratio` and `width: 100%` | Every page load on first paint |
| `useFrame` with per-frame object creation (`new THREE.Vector3()`) | Memory usage climbs over session; GC pauses cause frame drops | Pre-allocate vectors outside the callback; mutate rather than recreate | Immediately on any device; worse on mobile |
| Sanity GROQ query without locale filter returning full array | Component renders `[object Object]` silently | Always filter: `title[language == $lang][0].value` | Every page render until caught |
| `generateMetadata` with dynamic Sanity fetch that isn't `use cache`-tagged | Metadata blocks static generation; pages become dynamic routes | Tag the Sanity fetch with `use cache` or cache at the fetch level | At scale / build time on Vercel |
| Missing `generateStaticParams` on `/[lang]/s/[slug]` | ~30 programmatic SEO pages are server-rendered on demand instead of statically generated; TTFB degrades | Export `generateStaticParams` that returns all `{lang, slug}` combinations | Visible when Googlebot crawls; degrades under modest traffic |
| Mounting/unmounting R3F components conditionally | Stutters on section visibility changes; material recompilation spikes | Use visibility toggling (render always, `visible={false}` when hidden) not conditional rendering | Every section scroll interaction |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| 3D hero with no reduced-motion fallback | Users with vestibular disorders (migraine, BPPV) experience nausea; they immediately leave and the brand signal backfires | CSS `prefers-reduced-motion: reduce` → render static gradient placeholder instead of Canvas |
| Language switcher that doesn't preserve the current page path | User on `/en/projekte/blumenspiess` clicks "DE" and lands on `/de` homepage, losing context | Language switcher links must be path-aware: `/de/projekte/blumenspiess` |
| Hero CTA button below the 3D canvas with no visible focus ring | Keyboard users cannot navigate past the decorative canvas without tabbing through invisible elements | Add `aria-label="decorative"` to canvas wrapper, set `tabIndex={-1}`, ensure CTA has `:focus-visible` styles |
| Contact form without locale-specific field labels | DE-speaking user sees EN placeholder copy in a form — breaks the trust signal | All form copy (labels, placeholders, validation messages) must come from the i18n dictionary |
| Programmatic SEO pages with thin copy | Google devalues thin pages; pages rank poorly and damage domain authority | Each `/s/[slug]` page must have at least 200 words of unique locale-specific copy plus a relevant CTA |

---

## "Looks Done But Isn't" Checklist

- [ ] **hreflang bidirectionality:** Every locale variant lists all other variants + itself. Verify with `curl https://domain/de | grep hreflang` and `curl https://domain/en | grep hreflang` — both must contain identical sets pointing to both URLs.
- [ ] **metadataBase set:** `next build` output shows fully-qualified `https://brightbyte.berlin/...` in alternate links — not relative paths or `https://localhost`.
- [ ] **x-default set:** `<link rel="alternate" hreflang="x-default" href="https://brightbyte.berlin/de">` present on every page.
- [ ] **R3F dynamic import:** `HeroCanvas` component is loaded via `dynamic(..., { ssr: false })` — verify with `next build` — no `window is not defined` build error.
- [ ] **Canvas CLS:** Run Lighthouse on mobile; CLS score is 0. Canvas placeholder matches canvas rendered dimensions exactly.
- [ ] **prefers-reduced-motion:** Enable in macOS System Settings → Accessibility → Reduce Motion. Hero renders a static fallback with no animation.
- [ ] **Sanity GROQ locale filter:** Every GROQ query that reads a localised field uses `[language == $lang][0].value` or the shared `localeField()` utility — no bare field references.
- [ ] **Token audit:** `grep -r 'text-gray\|text-zinc\|text-slate\|#[0-9a-fA-F]' src/components/` returns zero results.
- [ ] **html lang attribute:** `<html>` element has `lang="de"` on DE pages and `lang="en"` on EN pages — not hardcoded, derived from route segment.
- [ ] **Language switcher navigation:** All language toggle elements are `<Link>` elements that navigate to the same page in the other locale — no `onClick` locale state mutations.
- [ ] **Programmatic SEO pages both locales:** `curl https://brightbyte.berlin/de/s/webdesign-berlin` returns 200. `curl https://brightbyte.berlin/en/s/web-design-berlin` returns 200.
- [ ] **Accessibility scan:** `axe-playwright` run on homepage returns zero violations at WCAG AA level.

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Hydration mismatch from R3F without ssr:false | LOW | Wrap import in `dynamic(..., { ssr: false })`; 1 hour fix |
| hreflang bidirectionality broken post-launch | LOW-MEDIUM | Fix `buildAlternates` utility and redeploy; Google re-crawls within days; no ranking penalty if fixed quickly |
| Wrong Sanity i18n strategy (field vs document level) | HIGH | Full dataset migration script + GROQ query audit + frontend component rewrite; plan 2–3 days |
| Design incoherence discovered after 5+ sections built | HIGH | Retrofit tokens across all components; each section needs visual QA; plan 1–2 days minimum |
| Programmatic SEO pages missing from one locale | MEDIUM | Add missing locale slug generation to `generateStaticParams`; redeploy; resubmit sitemap to GSC |
| Client-side locale leak re-introduced | MEDIUM | Audit all `useLocale()` / localStorage usages; add the smoke test to CI to prevent regression |
| CLS on hero canvas | LOW | Add explicit `aspect-ratio` container; 1 hour fix |
| Missing reduced-motion fallback | LOW | Add `useReducedMotion()` hook to canvas mount condition; 2 hours including fallback design |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Design incoherence / AI-generated look | Identity & Design Tokens (Phase 1) | Playwright screenshot + token audit before any UI phase begins |
| Sanity wrong i18n strategy | Content Architecture (Phase 2) | Schema review with both DE and EN document creation tested in Studio |
| hreflang bidirectionality + metadataBase | i18n Routing & SEO Foundation (Phase 3) | Post-deploy GSC inspection + curl hreflang verification on both locales |
| Client-side locale leak regression | i18n Routing & SEO Foundation (Phase 3) | Automated smoke test: `/de` returns `lang="de"`, `/en` returns `lang="en"` |
| R3F hydration mismatch | Hero Implementation (Phase 4) | `next build` clean; no `window is not defined` errors |
| R3F mobile LCP / CLS | Hero Implementation (Phase 4) | Lighthouse mobile: LCP < 2.5 s, CLS = 0 |
| Missing reduced-motion fallback | Hero Implementation (Phase 4) | Test with `prefers-reduced-motion: reduce` enabled; canvas must not render |
| Sanity GROQ locale filter missing | Content Integration (Phase 5) | Each content-fed component renders correct locale copy; no `[object Object]` |
| Programmatic SEO pages missing EN locale | Programmatic SEO (Phase 6) | Both `/de/s/[slug]` and `/en/s/[slug]` return 200; symmetric hreflang confirmed |
| Accessibility failures (contrast, focus, lang) | Per-section UI phases + final audit | axe-playwright zero violations; Lighthouse accessibility = 100 |

---

## Sources

- Next.js App Router i18n documentation (nextjs.org/docs, verified 2026-08-10, version 16.3.0)
- Next.js generateMetadata API reference — `alternates.languages` and `metadataBase` behaviour (nextjs.org/docs, 2026-08-10)
- next-intl middleware routing documentation (next-intl.dev, 2026-08-10)
- Google Search Console: Localized versions guide — hreflang bidirectionality, x-default, URL requirements (developers.google.com, 2026-08-10)
- react-three-fiber Pitfalls documentation (r3f.docs.pmnd.rs/advanced/pitfalls, 2026-08-10)
- react-three-fiber Scaling Performance documentation (r3f.docs.pmnd.rs/advanced/scaling-performance, 2026-08-10)
- Sanity CMS Localization documentation (sanity.io/docs/localization, 2026-08-10)
- WCAG 2.3.3 Animation from Interactions (w3.org, 2026-08-10)
- v1 post-mortem: brightbyte-homepage (daniel-jin-studio-homepage) — direct diagnosis of mixed design directions, token drift, and content duplication

---
*Pitfalls research for: bilingual Next.js marketing site with R3F 3D hero + Sanity CMS + programmatic SEO*
*Researched: 2026-08-10*
