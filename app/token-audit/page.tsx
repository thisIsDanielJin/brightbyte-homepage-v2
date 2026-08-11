/**
 * /token-audit — Design Token Audit Page
 *
 * Purpose:
 *   1. Proves the token system works end-to-end (utilities derived from token variables)
 *   2. Serves as the fixture for the Wave 0 contrast audit (Task 3)
 *
 * Rules (IDENT-01):
 *   - Zero raw hex values — all colors via named-token utilities
 *   - Zero text-gray, bg-gray, border-gray utilities — use semantic tokens
 *   - font-sans utility only (no font-family inline)
 *
 * Token pairs rendered:
 *   All readable foreground/background combinations from UI-SPEC Color WCAG AA table.
 *   The Text Muted region is explicitly labeled as decorative and
 *   excluded from the readable-copy audit per D-06 and UI-SPEC Color Muted note.
 *   It is the known intentional AA exception restricted to decorative/disabled use.
 */
export default function TokenAuditPage() {
  return (
    <main className="font-sans min-h-screen p-8">
      <h1 className="text-2xl font-bold text-primary mb-8">
        Token Audit — BrightByte Berlin v2
      </h1>
      <p className="text-base text-secondary mb-8">
        Every token pair rendered below. Wave 0 contrast audit targets this page.
      </p>

      {/* ── Readable Token Pairs (audited for WCAG AA) ── */}
      <section className="space-y-4 mb-12">
        <h2 className="text-sm font-semibold text-secondary uppercase tracking-widest mb-4">
          Readable Token Pairs — WCAG AA Verified
        </h2>

        {/* Pair 1: text-primary on bg-surface — 17.72:1 AAA */}
        <div className="bg-surface border border-border p-6 rounded">
          <p className="text-base text-primary font-sans">
            text-primary on bg-surface — passes AAA
          </p>
          <p className="text-sm text-primary font-sans">
            Label size: text-primary on bg-surface at text-sm
          </p>
        </div>

        {/* Pair 2: text-primary on bg-surface-subtle — 16.97:1 AAA */}
        <div className="bg-surface-subtle border border-border p-6 rounded">
          <p className="text-base text-primary font-sans">
            text-primary on bg-surface-subtle — passes AAA
          </p>
        </div>

        {/* Pair 3: text-secondary on bg-surface — 7.73:1 AAA */}
        <div className="bg-surface p-6 rounded border border-border">
          <p className="text-base text-secondary font-sans">
            text-secondary on bg-surface — passes AAA
          </p>
        </div>

        {/* Pair 4: text-accent on bg-surface — 8.93:1 AAA (independently verified; passes AAA not just AA) */}
        <div className="bg-surface p-6 rounded border border-border">
          <p className="text-base text-accent font-sans">
            text-accent on bg-surface — passes AAA. Computed ratio stronger than UI-SPEC estimate.
          </p>
          <p className="text-5xl font-bold text-accent font-sans mt-2">
            Aa
          </p>
        </div>

        {/* Pair 5: text-on-dark on bg-surface-dark — 17.43:1 AAA */}
        <div className="bg-surface-dark p-6 rounded">
          <p className="text-base text-on-dark font-sans">
            text-on-dark on bg-surface-dark — passes AAA
          </p>
          <p className="text-5xl font-bold text-on-dark font-sans mt-2">
            BrightByte
          </p>
        </div>

      </section>

      {/* ── Decorative / Non-readable (excluded from axe contrast audit) ── */}
      {/*
        text-muted on bg-surface: intentionally fails AA — restricted to
        decorative and disabled states per UI-SPEC and D-06.
        NEVER used for readable body copy.
        aria-hidden and data-decorative exclude this block from the contrast audit scan.
      */}
      <section
        data-decorative="true"
        aria-hidden="true"
        className="bg-surface-muted p-6 rounded border border-border"
      >
        <p className="text-sm text-secondary font-sans mb-2 font-semibold">
          DECORATIVE — Excluded from contrast audit (aria-hidden)
        </p>
        <p className="text-base text-muted font-sans">
          text-muted on bg-surface — intentional AA exception. Used only for
          captions, placeholders, and disabled states. Never for readable copy.
        </p>
      </section>

      {/* ── Type Scale Demonstration ── */}
      <section className="mt-12 space-y-4">
        <h2 className="text-sm font-semibold text-secondary uppercase tracking-widest mb-4">
          Type Scale — Plus Jakarta Sans
        </h2>
        <p className="text-5xl font-bold text-primary font-sans leading-tight">
          48px Display — Heading
        </p>
        <p className="text-4xl font-bold text-primary font-sans leading-tight">
          32px Display Mobile
        </p>
        <p className="text-2xl font-semibold text-primary font-sans leading-snug">
          24px Subheading
        </p>
        <p className="text-base text-primary font-sans leading-relaxed">
          16px Body — Ihre Website in 4 Wochen. Festpreis. Sie behalten den Code.
        </p>
        <p className="text-sm text-secondary font-medium font-sans">
          14px Label — hello@brightbyte-berlin.com
        </p>
      </section>

      {/* ── Accent Usage Demonstration — D-07 Sparingly/Functional ── */}
      <section className="mt-12 space-y-4">
        <h2 className="text-sm font-semibold text-secondary uppercase tracking-widest mb-4">
          Accent Usage — text-accent
        </h2>
        <p className="text-base text-primary font-sans">
          Accent is reserved for:{' '}
          <a href="#" className="text-accent underline font-sans">
            hyperlinks in body copy
          </a>
          , primary CTAs, focus rings, active nav, form focus borders.
        </p>
        <button
          className="bg-accent text-on-dark font-sans text-base font-semibold px-6 py-3 rounded"
          type="button"
        >
          Projekt anfragen
        </button>
      </section>
    </main>
  )
}
