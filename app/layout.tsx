import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

/**
 * Plus Jakarta Sans — single variable font covering weights 200–800.
 * Self-hosted via next/font/google: downloaded at build time, served from
 * the same domain with no runtime CDN requests (performance rule).
 *
 * The `variable` option emits a CSS custom property (--font-plus-jakarta-sans)
 * on the element that receives the font's className. Wired into Tailwind via
 * `@theme inline { --font-sans: var(--font-plus-jakarta-sans) }` in globals.css.
 * This is the runtime half of the font bridge (RESEARCH §Pattern 3, §Pitfall 1).
 */
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta-sans',
  // No `weight` needed — variable font covers 200–800 automatically.
  // No `axes` needed — wght is included by default for variable fonts.
})

export const metadata = {
  title: 'BrightByte Berlin — Webdesign für kleine Unternehmen',
  description: 'Professionelles Webdesign für Berliner Gewerbebetriebe. Festpreis, 4 Wochen, Sie behalten den Code.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" className={plusJakartaSans.variable}>
      <body className="bg-surface text-primary font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
