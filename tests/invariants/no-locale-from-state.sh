#!/usr/bin/env bash
#
# I18N-01 Invariant Gate — no-locale-from-state.sh
#
# Enforces the BrightByte Berlin v2 i18n locale-from-URL-only rule (D-09):
#   The active locale MUST be derived from the URL segment only —
#   never from localStorage or React component state.
#
# Scans: app/ components/ lib/ (*.ts, *.tsx)
# Exits 0 on clean. Exits 1 if any violations are found.
#
# Usage:
#   bash tests/invariants/no-locale-from-state.sh
#
# Pattern rationale:
#   (a) localStorage locale reads  — v1 anti-pattern; replaced by path-based routing
#   (b) useState/useReducer holding locale — locale must come from URL segment (next/root-params)
#
# Note: grep patterns are assembled to avoid comment-line false positives.
# Comment-only lines (// /* * style) are filtered before each check.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

EXIT_CODE=0

# Directories to scan — only source directories where locale derivation could occur
SCAN_DIRS=()
for d in app components lib; do
  if [ -d "${REPO_ROOT}/${d}" ]; then
    SCAN_DIRS+=("${REPO_ROOT}/${d}")
  fi
done

if [ ${#SCAN_DIRS[@]} -eq 0 ]; then
  echo "PASS [I18N-01]: No source directories found to scan (app/, components/, lib/)."
  exit 0
fi

# ── (a) localStorage locale reads ─────────────────────────────────────────────
# Matches: localStorage.*locale  localStorage.*lang  localStorage.getItem.*locale
# Pattern assembled via variable to prevent self-defeating literal match.
LS_PATTERN="localStorage.*locale|localStorage.*lang|localStorage\.getItem.*locale"

LS_HITS=$(
  grep -rEn "${LS_PATTERN}" \
    "${SCAN_DIRS[@]}" \
    --include="*.ts" \
    --include="*.tsx" \
  | grep -vE '^\s*(//|/\*|\*|<!--)' \
  || true
)

if [ -n "${LS_HITS}" ]; then
  echo "FAIL [I18N-01]: localStorage locale access found — locale must come from the URL segment only."
  echo ""
  echo "Offenders:"
  echo "${LS_HITS}"
  echo ""
  echo "Fix: Remove localStorage locale reads. Use next/root-params or useParams() to read"
  echo "     the locale from the URL [locale] segment instead."
  EXIT_CODE=1
fi

# ── (b) useState / useReducer holding locale ──────────────────────────────────
# Matches: useState.*locale  useReducer.*locale
# (locale/lang as state variable — state must not drive the active locale)
STATE_PATTERN="useState.*locale|useReducer.*locale"

STATE_HITS=$(
  grep -rEn "${STATE_PATTERN}" \
    "${SCAN_DIRS[@]}" \
    --include="*.ts" \
    --include="*.tsx" \
  | grep -vE '^\s*(//|/\*|\*|<!--)' \
  || true
)

if [ -n "${STATE_HITS}" ]; then
  echo "FAIL [I18N-01]: Component state (useState/useReducer) storing locale found."
  echo "  Locale must come from the URL segment — never from component state."
  echo ""
  echo "Offenders:"
  echo "${STATE_HITS}"
  echo ""
  echo "Fix: Remove useState/useReducer locale derivation. Use useLocale() from next-intl"
  echo "     (which reads from the URL segment, not state) in Client Components, or"
  echo "     next/root-params in Server Components."
  EXIT_CODE=1
fi

if [ "${EXIT_CODE}" -eq 0 ]; then
  echo "PASS [I18N-01]: No localStorage locale reads and no component-state locale derivation found."
fi

exit "${EXIT_CODE}"
