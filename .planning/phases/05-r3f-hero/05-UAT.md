---
status: testing
phase: 05-r3f-hero
source: [05-VERIFICATION.md]
started: 2026-09-03T00:00:00Z
updated: 2026-09-03T00:00:00Z
---

## Current Test

number: 1
name: Draw calls < 200 and PerformanceMonitor adaptive DPR scaling (SC #4)
expected: |
  With a production `next start` server running, open /de in a browser (or headless
  Playwright) with a throttled CPU profile. In DevTools console:
    - window.__r3f_hero.calls()  →  < 200
    - window.__r3f_hero.dpr()    →  read before and after sustained CPU load;
      after PerformanceMonitor.onDecline fires, dpr() should drop below 2.0
      (AdaptiveDpr reduced pixel ratio) and GlassMesh degrades in place
      (degraded=true: fewer transmission samples) rather than dropping to a
      non-transmissive fallback.
  Both values must be read from the live scene, not estimated.
awaiting: user response

## Tests

### 1. Draw calls < 200 and PerformanceMonitor adaptive DPR scaling (SC #4)
expected: window.__r3f_hero.calls() < 200; after sustained CPU pressure window.__r3f_hero.dpr() < 2.0 (PerformanceMonitor.onDecline fired, AdaptiveDpr reduced pixel ratio); scene degrades gracefully (GlassMesh degraded=true) rather than switching to a non-transmissive fallback.
result: [pending]

## Summary

total: 1
passed: 0
issues: 0
pending: 1
skipped: 0
blocked: 0

## Gaps
