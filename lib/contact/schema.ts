/**
 * lib/contact/schema.ts — ONE shared Zod schema for the contact form (D-08).
 *
 * Single source of truth for the contact payload shape, imported by BOTH:
 *   - the client (components/sections/ContactSection.tsx) for per-field preview validation
 *   - the server (app/api/contact/route.ts) for authoritative safeParse validation
 *
 * Fields (D-08 — exactly 3 VISIBLE fields; website + _timestamp are spam-defense internals):
 *   - name      required, min 1
 *   - email     required, valid email
 *   - message   required, min 1
 *   - website   honeypot (D-10) — must be empty (max 0); a populated value = bot
 *   - _timestamp form mount time (ms epoch) for the time-to-submit check (D-10, Pitfall 8)
 *
 * zod 4.4.3 — z.string().email() API is unchanged from v3 (04-RESEARCH.md).
 *
 * Source: 04-RESEARCH.md Pattern 4; 04-UI-SPEC.md Contact Section; D-08/D-09/D-10.
 */
import { z } from 'zod'

/** Authoritative contact payload schema — server validation. */
export const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1),
  website: z.string().max(0), // honeypot — must be empty
  _timestamp: z.number(), // time-to-submit check
})

export type ContactPayload = z.infer<typeof contactSchema>

/**
 * Per-field client-preview schema — the 3 VISIBLE fields only.
 * The client validates these before POSTing; the server still re-validates
 * the full schema (never trust the client). website/_timestamp are added by
 * the client at submit time and are not user-facing fields.
 */
export const contactVisibleSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1),
})

export type ContactVisibleField = keyof z.infer<typeof contactVisibleSchema>
