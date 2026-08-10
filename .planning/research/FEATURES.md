# Feature Research

**Domain:** Bilingual freelance web-design studio marketing site (DE/EN, Berlin SMB audience)
**Researched:** 2026-08-10
**Confidence:** MEDIUM — sourced from live studio site analysis (Cuberto structure), cross-checked against v1 validated engagement data (testimonial metrics), and domain expertise on SMB psychology. External article sources were unavailable (404/403 at time of research); findings are cross-referenced against first-party evidence in PROJECT.md.

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features an SMB visitor assumes exist. Missing any of these and they leave — or worse, they lose trust in the quality of the work.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Hero with positioning statement** | First 3 seconds decide whether to read on; a vague hero loses the visitor immediately | LOW | One clear headline that says who this is for. "Websites for Berlin businesses" beats "Digital experiences that transcend." Copy must be bilingual DE/EN. |
| **Portfolio / work showcase** | A designer without visible work has no credibility; this is the product demo | MEDIUM | Grid or list of 4–8 projects minimum. Each project needs a title, client type, and brief outcome note. Full case studies for top 3 (see Differentiators). |
| **Services section** | Visitor needs to know what is being sold before they can evaluate fit | LOW | Plain-language descriptions — "Landing page," "Business website," "Web application" — not technical jargon. Brief benefit bullets per service. |
| **Pricing / packages** | SMBs need to know if they can afford it *before* they invest time in a conversation — hiding price signals expensive or evasive | LOW | Fixed-price packages prominently displayed. €690 landing page and ~€2,500 multi-page are concrete anchors. "No hidden costs" statement required. |
| **About / person section** | SMBs hire people, not brands; they need to know who they're calling | LOW | Real photo, name, brief backstory in human terms, and what makes this studio the right fit for a local business. No corporate "we" language. |
| **Testimonials with outcomes** | Social proof from peers (local businesses, not tech companies) is the strongest trust signal for an SMB | LOW | Named, outcome-specific quotes. BrightByte v1 has three verified gold-standard testimonials: +200% inquiries (Blumenspiess), 92% bookings (Learnstep), +47% leads (Lumo). These are the core social proof assets. |
| **Contact form** | The entire site exists to generate this one action; a broken or absent form is fatal | LOW | Short form (name, email, project description, optionally: budget). No more than 5 fields. Must have confirmation feedback. |
| **Navigation** | Visitors need to orient and jump to the section relevant to them; absent or broken nav signals a rushed site | LOW | Max 5 top-level items. Sticky or accessible at all times. Clear CTA button ("Projekt anfragen" / "Start a project") always visible. |
| **Mobile-responsive layout** | Over 60% of first visits to small-business referral links will be on mobile | MEDIUM | Full mobile pass required for every section. Especially critical for hero and contact form. |
| **Bilingual DE/EN** | Berlin SMBs are mixed German/international; German is the default trust language for local trades (florists, tree surgeons, clinics) | MEDIUM | Path-based `/de` and `/en` routing. DE is the default. All content — including meta titles, hero, services, pricing, testimonials — must exist in both languages. |
| **Fast page load (Core Web Vitals pass)** | A slow site contradicts the "I build great websites" brand promise | MEDIUM | Next.js + Vercel gives this largely for free if 3D is contained to the hero and images are optimized. LCP < 2.5s on mobile is the bar. |
| **Legal / Impressum page** | German law requires an Impressum; absence is a trust signal killer for any German SMB evaluating a supplier | LOW | Single page satisfying §5 TMG. Link in footer. Privacy policy (DSGVO) also required. |

---

### Differentiators (Competitive Advantage)

Features that separate a refined craft studio from the generic web-agency mass. Choose to differentiate on 2–4, not all of them.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Case studies with business results** | Transforms "look at this pretty design" into "this made their business measurably better" — the highest-leverage trust asset for an SMB | HIGH | 3 deep case studies: problem → solution → outcome with real metrics. BrightByte has the raw material (Blumenspiess, Learnstep, Lumo). Each case study is a standalone page for SEO value. Requires Sanity CMS content type. |
| **Single hero 3D moment** | Signals craft and technical range in a way a static site cannot — but only if tasteful and performant | HIGH | R3F/three.js, hero section only, lazy-loaded, performance-budgeted. The 3D moment must load cleanly; a slow/janky 3D hero is worse than no 3D. |
| **Outcome-anchored testimonials display** | Most sites show generic quotes; displaying the actual business metric (+200% inquiries) is an outlier move that converts directly | LOW | Pull from verified v1 testimonials. Each card shows: name, business, quote, and the measurable outcome in large type. |
| **Fixed-price transparency with package comparison** | Most studios hide pricing; showing a clear price table with what's included removes the #1 anxiety of the SMB buyer and pre-qualifies leads | LOW | Two tiers clearly named and described. "What's included" checklist per tier. One "custom project" escape hatch for web apps. |
| **"You own the code" guarantee section** | Directly addresses the #1 fear of a small business owner who has been burned by a platform lock-in (Wix, Squarespace dependency) | LOW | Explicit statement: code delivered to client, no monthly platform fee, no lock-in. Part of the services or FAQ section. |
| **FAQ section** | Pre-handles the 5–7 questions every SMB prospect asks before calling: "How long does it take?", "What happens after?", "Do you do maintenance?", "What if I don't like it?" | LOW | 6–10 questions. Reduces friction for timid prospects who won't pick up the phone. Good for SEO (structured data possible). |
| **Blog / Insights** | Builds topical authority for German local SEO queries ("Website für Kleinunternehmen Berlin") and demonstrates ongoing expertise | HIGH | Requires Sanity CMS (already planned). Worth building *only* if committed to 1 post/month minimum; an empty or stale blog signals neglect. Pairs with the programmatic SEO `/s/[slug]` pages already in v1. |
| **Process / How it works section** | Demystifies the engagement for an SMB who has never hired a web designer; "3 steps and you're done" framing reduces perceived risk | LOW | 3–4 step numbered flow: Brief → Design → Build → Launch. Short, confident, visual. |
| **German programmatic SEO pages** | ~30 keyword-targeted landing pages already exist in v1 (`/s/[slug]`) generating organic traffic — a unique traffic moat competitors lack | MEDIUM | Preserve existing routes and content. Improve CMS schema for richer structured data. These pages are a significant existing asset, not something to rebuild from scratch. |
| **Language switcher with path routing** | Correct hreflang per URL is a technical SEO differentiator that most freelancer sites get wrong (they use JS-only i18n with one URL) | MEDIUM | Already specified as a requirement. `/de` default, `/en` alternative. Language toggle in nav. |
| **Client-specific testimonials matched to visitor industry** | If a florist lands on the page and sees a testimonial from another florist, conversion is dramatically higher | LOW | Tag testimonials by industry and optionally surface industry-relevant ones first. Requires Sanity content tags. Deferred to v1.x unless trivial. |

---

### Anti-Features (Deliberately NOT Building)

These seem appealing but would undermine the core "calm, trust-building, non-intimidating" brand promise for Berlin SMB clients.

| Anti-Feature | Why Requested | Why Problematic | Alternative |
|--------------|---------------|-----------------|-------------|
| **3D/WebGL everywhere (multiple sections)** | Signals technical craft; looks impressive in awards galleries | Intimidates SMB visitors who assume the site is expensive to replicate; adds load time; reads as "this designer does experimental stuff, not my business website" | One contained 3D hero moment, performance-budgeted, lazy-loaded. Everything else is clean 2D. |
| **Cursor-following particle effects / generative animation on scroll** | Trendy in the agency/award space; signals "creative" | Distracting during reading, creates motion accessibility issues, incompatible with "calm, editorial" brand promise | Subtle fade/translate transitions on section entry only; typography does the heavy lifting |
| **Auto-playing background video** | Immersive, dynamic, impressive on awards sites | Chews bandwidth (SMBs often on mobile), causes motion sickness for some users, competes with text for attention, signals "startup-flashy" | Hero 3D is the single motion moment; rest of site is static-but-beautiful |
| **Chat widget / live chat** | Seems like low-friction contact option | Adds anxiety of being "watched"; creates support burden for a one-person studio; rarely used by SMBs who prefer async email/form; conflicts with refined aesthetic | Contact form with 24h reply guarantee is the right expectation to set |
| **Social media feed embeds** | Signals activity and social presence | Third-party JS performance cost; content ages poorly; distracts from the core CTA; embeds tend to look visually inconsistent | Link to social profiles in footer only |
| **Portfolio filters / tag cloud** | Seems like a useful UX feature for large portfolios | Adds cognitive load; most studios have 5–12 projects, not enough to need filtering; filter UIs often look unpolished | Simple grid; let the work speak. Add case study pages for depth. |
| **Booking calendar / Calendly embed** | Reduces friction for scheduling calls | Premature for a fixed-price service; creates expectation of immediate consultation; the inquiry form → email → call flow is more appropriate for a studio that crafts proposals | Contact form → 24h reply → scheduled call. Keep the process personal. |
| **Agency "team" section with 3 stock photos of smiling people** | Creates impression of a full team | BrightByte is a solo studio; fake team photos shatter trust if discovered; SMBs often *prefer* solo practitioners (direct access, no account manager middleman) | Honest solo identity. "You work directly with me" is a feature, not a flaw. |
| **Client portal / login** | Appears professional, enterprise-grade | Scope explosion; not needed for 4–8 fixed-price projects per year; zero ROI for this client type | Shared Notion doc or simple email thread is the right process for this price point |
| **Testimonials carousel / slider** | Popular UI pattern | Sliders are skipped; static quote cards with visible content consistently outperform carousels; carousels also hide content from search crawlers | Static testimonial cards, all visible, outcome-focused |
| **"Awards" badge wall** | Signals quality | SMB prospects do not know Awwwards or CSS Design Awards; a wall of badge logos they don't recognize adds noise, not credibility | Outcome metrics from real clients are the credibility signal that resonates with SMBs |
| **Pricing on a "Contact us for a quote" only basis** | Seems sophisticated / bespoke | Kills lead flow from budget-conscious SMBs; they leave without contacting because they assume it's out of reach | Show fixed prices prominently; use a "custom" tier for exceptions |

---

## Feature Dependencies

```
Contact Form (table stakes)
    └──requires──> Legal / Impressum (required for German law)
    └──requires──> Email delivery (Resend integration)
    └──requires──> Confirmation UX feedback

Case Studies (differentiator)
    └──requires──> Portfolio / Work Showcase (table stakes)
    └──requires──> Sanity CMS case study content type
    └──enhances──> Testimonials with outcomes

Bilingual DE/EN (table stakes)
    └──requires──> Path-based routing (/de, /en)
    └──requires──> All content in both languages
    └──enhances──> German programmatic SEO pages
    └──enables──> Correct hreflang per URL

Blog / Insights (differentiator)
    └──requires──> Sanity CMS blog content type
    └──enhances──> German programmatic SEO pages
    └──conflicts──> Stale content (empty blog hurts more than no blog)

German programmatic SEO pages (differentiator)
    └──requires──> Bilingual DE/EN routing
    └──requires──> Sanity CMS
    └──enhances──> Blog / Insights (cross-linking)

FAQ section (differentiator)
    └──enhances──> Services section
    └──enhances──> Pricing / packages
    └──reduces friction for──> Contact Form

Fixed-price transparency (differentiator)
    └──enhances──> FAQ section
    └──enhances──> "You own the code" guarantee
    └──requires──> Clear service descriptions (table stakes)

Single hero 3D moment (differentiator)
    └──requires──> R3F/three.js lazy-loaded bundle
    └──conflicts──> 3D/WebGL everywhere (anti-feature)
    └──requires──> Performance budget discipline
```

### Dependency Notes

- **Case studies require CMS**: Full case study pages (not just portfolio thumbnails) need a Sanity content type with problem/solution/outcome fields. Should be built in the same phase as the Sanity integration.
- **Blog conflicts with stale content**: Blog is a differentiator only if it is actively maintained. An empty or year-old blog signals neglect. Build it only if 1 post/month is a realistic commitment; otherwise omit.
- **3D hero conflicts with 3D everywhere**: The hero 3D moment only lands as "refined" if no other section is animated; if there are also particle cursors and scroll-triggered WebGL effects, the hero loses its impact and the whole site reads as excessive.
- **Pricing transparency enhances FAQ**: Showing prices up front reduces the volume of "how much does it cost" FAQ questions and makes the FAQ more useful (it can focus on process, quality, maintenance instead of price).

---

## MVP Definition

### Launch With

Minimum viable content to go live and start generating inquiries.

- [ ] **Hero with clear positioning** — who this is for, what the outcome is, one CTA
- [ ] **Services section** — 2–3 services in plain language with brief descriptions
- [ ] **Pricing / packages** — €690 landing page, ~€2,500 multi-page, web app "let's talk"
- [ ] **Portfolio grid** — 4–6 projects minimum, each with title + outcome note
- [ ] **Testimonials** — The 3 verified outcome-anchored quotes from v1 (Blumenspiess, Learnstep, Lumo)
- [ ] **About** — Real photo, name, honest one-person studio framing
- [ ] **Contact form** — 5 fields max, confirmation feedback, Resend delivery
- [ ] **Bilingual DE/EN** — Full content in both languages, path-based routing
- [ ] **Impressum + Datenschutz** — Required by German law
- [ ] **Mobile-responsive** — Full pass on all sections

### Add After Launch Validation (v1.x)

- [ ] **Case study pages** — Deep-dive pages for the 3 anchor clients; trigger: first organic inbound that mentions a specific project
- [ ] **FAQ section** — Trigger: recurring pre-inquiry questions appearing in email; expected within first 2–3 months
- [ ] **Process / How it works** — Trigger: prospects asking "how does this work" before committing; add when the question appears 3+ times
- [ ] **German programmatic SEO pages** — Migrate v1's `/s/[slug]` pages; trigger: traffic drop observed post-launch

### Future Consideration

- [ ] **Blog / Insights** — Defer until 1 post/month commitment is realistic; false-starts hurt more than they help
- [ ] **Industry-matched testimonial surfacing** — Tag testimonials by client industry and conditionally surface them; only worthwhile when testimonial count reaches 6+
- [ ] **Structured data for FAQ** — FAQ schema markup for Google rich results; add once FAQ content is stable
- [ ] **More case studies** — After each new completed project becomes a case study candidate

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Hero + positioning | HIGH | LOW | P1 |
| Services + plain-language descriptions | HIGH | LOW | P1 |
| Fixed pricing / packages | HIGH | LOW | P1 |
| Portfolio grid | HIGH | MEDIUM | P1 |
| Testimonials (outcome-anchored) | HIGH | LOW | P1 |
| About / person section | HIGH | LOW | P1 |
| Contact form + Resend | HIGH | LOW | P1 |
| Bilingual DE/EN routing | HIGH | MEDIUM | P1 |
| Impressum / Datenschutz | HIGH | LOW | P1 |
| Mobile-responsive layout | HIGH | MEDIUM | P1 |
| Single hero 3D moment | MEDIUM | HIGH | P2 |
| Case study pages | HIGH | HIGH | P2 |
| FAQ section | MEDIUM | LOW | P2 |
| Process / How it works | MEDIUM | LOW | P2 |
| "You own the code" guarantee | MEDIUM | LOW | P2 |
| German programmatic SEO pages | MEDIUM | MEDIUM | P2 |
| Language switcher / hreflang | MEDIUM | MEDIUM | P2 |
| Blog / Insights | LOW | HIGH | P3 |
| Industry-matched testimonials | LOW | MEDIUM | P3 |
| FAQ structured data | LOW | LOW | P3 |

**Priority key:**
- P1: Must have at launch — site cannot convert without these
- P2: Should have — significantly improves conversion or SEO; add in first post-launch phase
- P3: Nice to have — real ROI but deferrable until core is stable

---

## Competitor / Reference Site Analysis

| Feature | Cuberto (full-service agency) | Generic DE web agency | BrightByte Berlin approach |
|---------|-------------------------------|----------------------|---------------------------|
| Hero positioning | Broad ("beyond the ordinary") | Generic ("we build websites") | Specific audience: Berlin small businesses |
| Pricing visibility | Hidden (contact us) | Usually hidden | Transparent fixed prices — differentiator |
| Portfolio | 10+ case studies with outcome copy | Gallery thumbnails only | 4–8 projects, 3 deep case studies |
| Social proof | Global brand logos (Cisco, IKEA, McDonald's) | Generic testimonials | Named local businesses with measured outcomes |
| Services language | Technical ("Creative Development") | Jargon-heavy | Plain language ("Landing page", "Business website") |
| About section | Studio identity, no individual focus | Team photos | Solo designer, direct relationship framing |
| FAQ | Present, addresses tech and process | Absent or thin | Present, addresses price / turnaround / ownership |
| Blog | 3 recent articles | Rarely maintained | Only if commit to 1+/month; omit otherwise |
| 3D / animation | Extensive across sections | Minimal | One hero moment only; everything else is 2D |

---

## Sources

- Cuberto.com live site structure analysis (webfetch, LOW confidence — verified against expected patterns)
- BrightByte v1 codebase and PROJECT.md (first-party, HIGH confidence) — testimonial metrics, existing German SEO pages, pricing, positioning
- Tobiasahlin.com portfolio structure (webfetch, LOW confidence) — minimal portfolio approach reference
- Domain expertise on SMB psychology and German web market (synthesized, MEDIUM confidence)
- External article sources (Smashing Magazine, CreativeBloq, Webflow blog) unavailable at time of research (HTTP 404/403)

---

*Feature research for: BrightByte Berlin — bilingual freelance web-design studio marketing site*
*Researched: 2026-08-10*
