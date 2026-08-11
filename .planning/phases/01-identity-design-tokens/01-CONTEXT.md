# Phase 1: Identity & Design Tokens - Context

**Gathered:** 2026-08-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Define the full, resolved visual identity for BrightByte Berlin v2 — palette, typography, logo, brand voice — and express it as a complete CSS `@theme` token system that every subsequent component consumes without exception. This is the identity-first hard gate: no component work begins until this is locked. It prevents v1's root failure (per-section improvisation, 3 fonts across 2 directions, tokens re-hardcoded inline).

Delivers requirements IDENT-01 (single `@theme` token system), IDENT-02 (resolved refined identity), IDENT-03 (resolved logo), IDENT-04 (brand voice guide).

</domain>

<decisions>
## Implementation Decisions

### Visual Direction & Mood
- **D-01:** Mood is **cool architectural** — grid-driven, crisp sans, near-monochrome, precise alignment; reads as senior/principal-designer confident and quiet. — **Reversibility:** costly — every later component's layout and token consumption is built against this direction; changing it after Phase 4 means restyling all sections.
- **D-02:** Warmth strategy is **content-only** — the palette stays true-neutral (no warm tint in the grays); all human warmth comes from copy, generous whitespace, and real photography of Daniel. No "warm editorial" softening in color or type.
- **D-03:** Whitespace posture is **balanced & confident** — generous breathing room and clear hierarchy, but efficient (an SMB owner can reach pricing/contact quickly). Sets the spacing scale tokens.
- **D-04:** Grid is **discipline + intentional asymmetry** — a consistent grid rhythm throughout, with deliberate asymmetry at key moments (hero, a feature row) for editorial interest.

### Color Strategy
- **D-05:** Base mode is **light-first** — white / near-white background (`#FFFFFF` / `#FAFAFA` direction), charcoal text (~`#1A1A1A`), true-neutral gray ramp. — **Reversibility:** costly — the full AA-verified token set and every component's color usage assume light-first; flipping to dark-first is a palette rebuild.
- **D-06:** Single accent is **Persian blue** (~`#1C39BB` / vivid cobalt-ultramarine direction). Exact hex is tuned during research to guarantee WCAG AA on white for body-size text while staying vivid (chosen over safe muted "ink blue" — more confident/distinctive). — **Reversibility:** reversible — one token value.
- **D-07:** Accent usage is **sparingly / functional** — primary CTA, links, focus rings, a single hairline/underline. Everything else is charcoal/neutral. The blue stays precious and high-impact.
- **D-08:** All remaining color is carried by **photography** — no secondary chromatic palette.

### Typography
- **D-09:** **Single grotesk, weight-driven** — one high-quality grotesk across the whole site; personality comes from weight, size, and tracking only. No pairing, maximum coherence (directly counters v1's 3-font failure). Satisfies the ≤2-typeface cap with one.
- **D-10:** Direction is a **modern, slightly characterful grotesk** (not plain Helvetica/Arial). **Exact face selected during research** by comparing candidates rendered at heading + body sizes; licensing/cost must be verified before locking.

### Logo
- **D-11:** **Wordmark only** — "BrightByte" (with "Berlin") set in the site grotesk, refined via tracking/weight/optical adjustments. No separate monogram or pictorial mark. Coheres with the single-grotesk system and cheapest to resolve cleanly (avoids repeating v1's ~14-experiment rabbit hole). Must render correctly on light and dark backgrounds (hero/footer moments may be dark).

### Brand Voice
- **D-12:** **Plain & warm** tone — German-first (EN mirrors it), short sentences, no jargon, speaks to a florist/tradesperson as a person. Prioritizes trust and clarity; never intimidating. Credibility carried by facts (you own the code, fixed price, reply in 24h) rather than crafted "agency" phrasing. Applied to all v2 copy.

### Claude's Discretion
- Exact grotesk face (D-10) and exact Persian-blue hex (D-06) — locked to direction, tuned in research.
- Neutral gray ramp stops, exact type scale ratio, spacing scale steps, and motion easing curves — derive during planning/research consistent with the decisions above (balanced whitespace, cool-architectural).
- The one "byte"/tech detail was explicitly NOT chosen — wordmark stays clean unless research surfaces a compelling restrained option.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Identity, brand & design standard
- `~/Documents/claude-contexts/freelancer.md` — BrightByte identity (contact, address Karl-Marx-Allee 118), the design quality standard ("senior/principal UX designer at a top tech company"), the design-system workflow, and the Playwright verify-at-every-stage rule. Primary brand rulebook.
- `.planning/PROJECT.md` — core value, business context (Berlin SMB audience), v1 root-cause diagnosis, key decisions.
- `.planning/REQUIREMENTS.md` §"Identity & Design System" — IDENT-01…04 exact wording and the token-system mandate.
- `.planning/ROADMAP.md` §"Phase 1" — goal + 5 success criteria (single `@theme` block, resolved logo, ≤2 typefaces, 1-page voice guide, AA contrast verified before any component).

### Design tooling (mandatory on UI phases)
- ui-skills CLI — `npx ui-skills start` → `categories` → `list --category <c>` → `get <slug>`. Load the smallest relevant skill for token/type/color work (QA-02).

### Tech constraints for tokens
- `.claude/CLAUDE.md` (project) — Tailwind v4 `@theme {}` in one CSS file is THE styling approach; no `tailwind.config.js`, no SCSS, no inline styles, no styled-components. Tokens live in `@theme`, consumed via utilities.

### v1 reference (do not reuse styling)
- `~/Documents/daniel-jin-studio-homepage` — v1 project. Reference for what to AVOID (bone+plum, 3 fonts, inline-hardcoded palette) and for salvageable copy/positioning only. Not a design source.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — `brightbyte-homepage-v2` is greenfield (only `.planning/` and `.claude/` exist; no source yet). This phase produces the first code: the token CSS + identity assets.

### Established Patterns
- Tailwind v4 `@theme` token-first (from project CLAUDE.md) — this phase must establish `styles/tokens.css` as the single source of truth all later phases consume.

### Integration Points
- The `@theme` token file is the integration point for every subsequent phase (2–7). Success criterion IDENT-01: zero raw hex or `text-gray-*` in any component file.

</code_context>

<specifics>
## Specific Ideas

- Accent color named explicitly by the user: **Persian blue** (~`#1C39BB`), used sparingly.
- "Cool architectural, warmth via content only" — the guiding tension: architectural discipline in the system, humanity delivered through copy + real photography, not through color/type warmth.
- Wordmark, not a mark — deliberately avoid the v1 ~14-experiment logo spiral.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope. (Motion/easing personality, iconography/imagery rules, and exact spacing-scale specifics were flagged as possible extra gray areas but the user chose to leave them to research/planning discretion under the decisions above, not to expand this discussion.)

</deferred>

---

*Phase: 1-identity-design-tokens*
*Context gathered: 2026-08-11*
