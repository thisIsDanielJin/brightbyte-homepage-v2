/**
 * app/api/contact/route.ts — Contact form Route Handler (SEC-07, D-09, D-10).
 *
 * POST /api/contact — Zod-validates the payload, enforces spam defense, and sends
 * the message via Resend using the Result pattern.
 *
 * Behavior contract (04-03-PLAN.md):
 *   - valid payload, _timestamp older than 3s      → resend send → 200 { ok: true, id }
 *   - invalid payload (missing field / bad email)  → 400 { error: 'invalid' } (no send)
 *   - populated honeypot (website)                 → 200 { ok: true } silently (no send, no bot signal)
 *   - submit faster than 3s                        → 200 { ok: true } silently (no send)
 *   - more than LIMIT requests per IP in window    → 429 { error: 'rate_limited' }
 *   - resend error branch                          → 500 { error: 'send_failed' }
 *
 * D-09: destructure `const { data, error } = await resend.emails.send(...)` and branch
 *       on `error`. NEVER wrap the send in try/catch (Pitfall 5).
 * T-04-07: RESEND_API_KEY is read ONLY here — never imported into a client component,
 *          never NEXT_PUBLIC_-prefixed.
 * A6: per-IP in-memory rate limiter (resets on cold start) — accepted for the
 *     low-volume solo studio (D-10).
 *
 * Verified addresses (Task 1, approved):
 *   from: "BrightByte Contact <noreply@brightbyte-berlin.com>" (verified Resend domain)
 *   to:   hello@brightbyte-berlin.com (studio inbox, CONTACT_EMAIL)
 *
 * Source: 04-RESEARCH.md Pattern 4; Next 16 Route Handler docs
 *   (node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md).
 */
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { contactSchema } from '@/lib/contact/schema'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_ADDRESS = 'BrightByte Contact <noreply@brightbyte-berlin.com>'
const TO_ADDRESS = process.env.CONTACT_EMAIL ?? 'hello@brightbyte-berlin.com'

// Per-IP in-memory rate limit (no external dep — resets on cold start, A6/D-10).
const ipLimiter = new Map<string, { count: number; reset: number }>()
const LIMIT = 3
const WINDOW_MS = 60 * 60 * 1000 // 1 hour
const MIN_TIME_TO_SUBMIT_MS = 3000 // < 3s = likely bot (silent pass)

export async function POST(req: NextRequest) {
  // ── Per-IP rate limit ───────────────────────────────────────────────────
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  const now = Date.now()
  const record = ipLimiter.get(ip)
  if (record && now < record.reset) {
    if (record.count >= LIMIT) {
      return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
    }
    record.count++
  } else {
    ipLimiter.set(ip, { count: 1, reset: now + WINDOW_MS })
  }

  // ── Parse + validate ──────────────────────────────────────────────────────
  // Malformed JSON body → treat as invalid (T-04-11: bounded, no unbounded processing).
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid' }, { status: 400 })
  }

  const parsed = contactSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 })
  }

  // ── Honeypot (D-10): populated = bot. 200 silently — never signal detection. ──
  if (parsed.data.website.length > 0) {
    return NextResponse.json({ ok: true })
  }

  // ── Time-to-submit (D-10): < 3s = likely bot. 200 silent pass. ──────────────
  const timeToSubmit = now - parsed.data._timestamp
  if (timeToSubmit < MIN_TIME_TO_SUBMIT_MS) {
    return NextResponse.json({ ok: true })
  }

  // ── Send via Resend — Result pattern, NEVER try/catch (D-09, Pitfall 5). ────
  const { data, error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: TO_ADDRESS,
    replyTo: parsed.data.email,
    subject: `Neue Anfrage von ${parsed.data.name}`,
    text: `Name: ${parsed.data.name}\nEmail: ${parsed.data.email}\n\n${parsed.data.message}`,
  })

  if (error) {
    return NextResponse.json({ error: 'send_failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, id: data?.id })
}
