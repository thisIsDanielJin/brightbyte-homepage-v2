/**
 * components/seo/FaqAccordion.tsx — FAQ accordion for SEO landing pages.
 *
 * `'use client'` because the chevron rotation reacts to the native <details> open
 * state via a group data-attribute. Uses <details>/<summary> (UI-SPEC preferred)
 * so it works with zero JS as a progressive-enhancement baseline; the only client
 * concern is the rotate transition, driven purely by CSS on the open state.
 *
 * Accessibility: <summary> is a native disclosure button (keyboard + AT support
 * for free). Trigger is min-h-[44px] (WCAG 2.5.5 touch target, UI-SPEC exception).
 * focus-visible ring on the summary. Multiple panels may be open simultaneously
 * (no business need for exclusive open — UI-SPEC).
 *
 * Token discipline: named semantic utilities only — zero raw hex, zero text-gray-*,
 * zero inline styles (IDENT-01 / D-06). Content comes from Sanity strings rendered
 * as escaped JSX text nodes (never dangerouslySetInnerHTML).
 *
 * Source: 06-UI-SPEC.md § Band 3 (FAQ Accordion) + Accordion interaction spec.
 */
'use client'

type Faq = { question: string; answer: string }

export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="mx-auto max-w-3xl">
      {faqs.map((faq, i) => (
        <details
          key={i}
          className="group border-b border-border last:border-b-0 open:bg-surface-muted"
        >
          <summary
            className="flex min-h-[44px] w-full cursor-pointer list-none items-center justify-between px-0 py-4 text-left text-base font-medium text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
          >
            <span className="pr-4">{faq.question}</span>
            {/* Chevron rotates 180° when the parent <details> is open. */}
            <svg
              className="h-6 w-6 flex-shrink-0 text-secondary transition-transform duration-150 ease-[var(--ease-standard)] group-open:rotate-180"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </summary>
          <p className="pb-4 pt-1 text-base leading-[1.6] text-secondary">
            {faq.answer}
          </p>
        </details>
      ))}
    </div>
  )
}
