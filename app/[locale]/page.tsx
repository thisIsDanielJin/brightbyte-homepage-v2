/**
 * app/[locale]/page.tsx — Home placeholder with locale-aware string.
 *
 * Renders ONE real translated shell string (Shell.tagline) from messages/
 * via getTranslations (server component) — proving messages load per-locale.
 * DE and EN values differ: smoke test (4) can distinguish locales.
 *
 * D-02: no speculative namespace pre-seeding; only Shell.tagline rendered here.
 * The full home page section is built in Phase 3+.
 *
 * Source: RESEARCH §Pattern 4, §"Minimal message files (D-02)"
 */
import { getTranslations } from 'next-intl/server'

export default async function HomePage() {
  const t = await getTranslations('Shell')

  return (
    <main className="font-sans min-h-screen flex items-center justify-center bg-surface">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-primary mb-4">BrightByte Berlin</h1>
        <p className="text-base text-secondary">{t('tagline')}</p>
      </div>
    </main>
  )
}
