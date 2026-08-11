---
phase: 01
slug: identity-design-tokens
status: verified
# threats_open = count of OPEN threats at or above workflow.security_block_on severity (the blocking gate)
threats_open: 0
asvs_level: 1
created: 2026-08-11
---

# Phase 01 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| npm registry → build | Third-party dev packages (tailwindcss, next, @axe-core/playwright, playwright, svgo) enter the build. Only realistic surface this phase. | Package tarballs (build-time only) |
| authored SVG → public/ static asset | Logo SVGs committed to `public/` are served as static files; if they contained script or external references they could be an XSS vector when inlined. | Static image bytes (no untrusted input source) |
| (none at runtime) | Phase 1 output is static CSS tokens, a build-time font asset, two logo SVGs, and a markdown voice guide. No user input, no auth, no runtime network calls. | None |

---

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-01-SC | Tampering | npm devDependency install (@axe-core/playwright, playwright) | low | mitigate | RESEARCH package legitimacy audit approved @axe-core/playwright (Deque Systems, 8.15M wk downloads, no postinstall script); no [ASSUMED]/[SUS]/[SLOP] packages. | closed |
| T-01-01 | Tampering | font supply chain (Plus Jakarta Sans via next/font) | low | accept | Build-time asset from Google Fonts via Next.js official `next/font`; SIL OFL license. No runtime fetch. | closed |
| T-01-02 | Elevation of Privilege | logo SVG served from public/ (XSS if inlined) | low | mitigate | Both `public/logo-light.svg` and `public/logo-dark.svg` verified: text-as-paths only, zero `<script>`, no external `xlink:href`/`<use>`/`href=`, no event handlers (grep gate = 0 matches). Paths authored, not sourced from untrusted input. | closed |
| T-01-03 | Tampering | svgo (npx) tool used to optimize SVGs | low | accept | Dev-time-only optimization run; output inspected by verify grep gate. No runtime exposure. | closed |

*Status: open · closed · open — below high threshold (non-blocking)*
*Severity: critical > high > medium > low — only open threats at or above workflow.security_block_on count toward threats_open*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| R-01-01 | T-01-01 | Build-time font asset via official `next/font`; SIL OFL, no runtime fetch. No high-severity path. | Daniel Jin Wodke | 2026-08-11 |
| R-01-02 | T-01-03 | svgo is a dev-time-only tool; its output is grep-gated and has no runtime exposure. | Daniel Jin Wodke | 2026-08-11 |

*Accepted risks do not resurface in future audit runs.*

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-08-11 | 4 | 4 | 0 | gsd-secure-phase (orchestrator, ASVS L1 short-circuit) |

Register authored at plan time (both PLAN files contained parseable `<threat_model>` blocks). All 4 threats are low severity — below the `high` block threshold — with dispositions resolved (2 mitigate + verified, 2 accept + documented). Per the ASVS L1 short-circuit rule (`threats_open: 0 AND register_authored_at_plan_time: true AND asvs_level == 1`), grep-depth verification is sufficient; no deeper auditor pass required. The single concrete runtime artifact (logo SVGs) was verified script-free directly.

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-08-11
