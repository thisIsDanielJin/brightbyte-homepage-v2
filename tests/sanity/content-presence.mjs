#!/usr/bin/env node
/**
 * tests/sanity/content-presence.mjs — CMS-02 content-presence GROQ check.
 *
 * Asserts the canonical BrightByte content is authored into Sanity as published
 * DE/EN pairs (CMS-02) and that the D-05 pricing tiers + D-06 outcome metrics are
 * present. Exits non-zero with a clear message on any failure.
 *
 * READ PATH — why the Sanity CLI, not lib/sanity/client.ts:
 *   The tracer (03-01-SUMMARY, coverage D4) established that ANONYMOUS/tokenless
 *   API reads of ddrca30s/production currently return [] (a dashboard toggle,
 *   pending, is required before Phase 4's tokenless build reads resolve). So a
 *   direct `client.fetch` from lib/sanity/client.ts would read empty and this
 *   check would falsely fail. Instead we run GROQ through `sanity documents query`,
 *   which uses the LOCAL CLI auth session (no token committed, no secret in repo).
 *   This keeps the check green today and correct: it verifies the content EXISTS
 *   in the dataset (CMS-02), independent of the still-open public-read toggle.
 *   When public reads are enabled (Phase 4 prerequisite), the same GROQ shapes
 *   here mirror lib/sanity/queries.ts and can move to the single client.
 *
 * D-08/D-09: DE base + EN translation for every type. D-05 pricing as data.
 * D-06: testimonial outcome metric as a separate field.
 * Source: 03-03-PLAN.md task 03-03-04; queries mirror lib/sanity/queries.ts.
 */
import { execFileSync } from 'node:child_process'

const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'

/** Run a GROQ query through the authenticated Sanity CLI; return parsed JSON. */
function query(groq) {
  const out = execFileSync(
    'npx',
    ['--no-install', 'sanity', 'documents', 'query', groq, '--dataset', DATASET],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
  )
  // The CLI prints the JSON result; parse the first JSON value in the output.
  const trimmed = out.trim()
  return JSON.parse(trimmed)
}

const failures = []
function check(label, condition, detail) {
  if (condition) {
    console.log(`  ✓ ${label}`)
  } else {
    failures.push(`${label}${detail ? ` — ${detail}` : ''}`)
    console.log(`  ✗ ${label}${detail ? ` — ${detail}` : ''}`)
  }
}

console.log(`[content-presence] Querying dataset "${DATASET}" via authenticated Sanity CLI...\n`)

// One round-trip: gather every count/flag the assertions need.
const r = query(`{
  "svcDe": count(*[_type=="service" && language=="de"]),
  "svcEn": count(*[_type=="service" && language=="en"]),
  "tesDe": count(*[_type=="testimonial" && language=="de"]),
  "tesEn": count(*[_type=="testimonial" && language=="en"]),
  "proDe": count(*[_type=="project" && language=="de"]),
  "proEn": count(*[_type=="project" && language=="en"]),
  "setDe": count(*[_type=="siteSettings" && language=="de"]),
  "setEn": count(*[_type=="siteSettings" && language=="en"]),
  "landing": count(*[_type=="service" && price.amount==1500 && priceOnRequest==false]),
  "fullsite": count(*[_type=="service" && priceOnRequest==true && !defined(price.amount)]),
  "outcomesDe": *[_type=="testimonial" && language=="de"].outcomeValue,
  "outcomesEn": *[_type=="testimonial" && language=="en"].outcomeValue,
  "settingsEmailDe": *[_type=="siteSettings" && language=="de"][0].contactEmail
}`)

// ── DE/EN pair parity per type (CMS-02, D-08/D-09) ────────────────────────────
check('service DE/EN parity', r.svcDe === r.svcEn && r.svcDe >= 2, `de=${r.svcDe} en=${r.svcEn}`)
check('testimonial DE/EN parity', r.tesDe === r.tesEn && r.tesDe === 3, `de=${r.tesDe} en=${r.tesEn}`)
check('project DE/EN parity', r.proDe === r.proEn && r.proDe >= 3, `de=${r.proDe} en=${r.proEn}`)
check('siteSettings DE/EN parity', r.setDe === 1 && r.setEn === 1, `de=${r.setDe} en=${r.setEn}`)

// ── Pricing tiers as data (D-05) ──────────────────────────────────────────────
check('landing tier: price.amount==1500 & priceOnRequest==false', r.landing >= 1, `matches=${r.landing}`)
check('full-site tier: priceOnRequest==true & no price.amount', r.fullsite >= 1, `matches=${r.fullsite}`)

// ── Outcome metrics as separate fields (D-06) ─────────────────────────────────
const need = ['+200%', '92%', '+47%']
const deOk = need.every((v) => (r.outcomesDe ?? []).includes(v))
const enOk = need.every((v) => (r.outcomesEn ?? []).includes(v))
check('DE outcome values +200% / 92% / +47% present', deOk, `got=${JSON.stringify(r.outcomesDe)}`)
check('EN outcome values +200% / 92% / +47% present', enOk, `got=${JSON.stringify(r.outcomesEn)}`)

// ── siteSettings contact (D-07) ───────────────────────────────────────────────
check(
  'siteSettings contactEmail hello@brightbyte-berlin.com',
  r.settingsEmailDe === 'hello@brightbyte-berlin.com',
  `got=${r.settingsEmailDe}`,
)

console.log('')
if (failures.length > 0) {
  console.error(`FAIL [CMS-02]: ${failures.length} content-presence check(s) failed:`)
  for (const f of failures) console.error(`  - ${f}`)
  process.exit(1)
}
console.log('PASS [CMS-02]: canonical DE/EN content present with D-05 pricing and D-06 outcomes.')
process.exit(0)
