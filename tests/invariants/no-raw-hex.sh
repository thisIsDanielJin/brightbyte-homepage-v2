#!/usr/bin/env bash
#
# IDENT-01 Invariant Gate — no-raw-hex.sh
#
# Enforces the BrightByte Berlin v2 token system invariants:
#   (a) Zero raw hex color values in app/ files (*.tsx, *.ts, *.css)
#       — all colors must go through named Tailwind token utilities
#   (b) Zero Tailwind default gray utilities in app/
#       (text-gray-, bg-gray-, border-gray-)
#       — all gray shades must use semantic tokens (text-primary, text-secondary, text-muted)
#
# This gate is run after every task commit and in CI as the IDENT-01 enforcement.
# Exit 0 = clean. Exit 1 = violations found (offenders printed).
#
# Usage:
#   bash tests/invariants/no-raw-hex.sh
#
# Notes:
#   - Filtering is applied to remove comment-prefixed lines so header prose
#     in tokens.css (which lives in styles/, not app/) does not self-invalidate.
#   - The styles/tokens.css file is excluded (it IS the canonical source of hex values).
#   - Raw hex pattern: # followed by 3-8 hex characters (covers shorthand, full, alpha).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
APP_DIR="${REPO_ROOT}/app"

EXIT_CODE=0

# ── (a) Raw hex check ─────────────────────────────────────────────────────────
# Find raw hex colors in app/ tsx/ts/css files, filtering out comment-only lines.
# Comment patterns: lines starting with //, /*, *, or <!-- (after optional whitespace).
RAW_HEX=$(
  grep -rEn '#[0-9a-fA-F]{3,8}' "${APP_DIR}" \
    --include="*.tsx" \
    --include="*.ts" \
    --include="*.css" \
  | grep -vE '^\s*(//|/\*|\*|<!--)' \
  || true
)

if [ -n "${RAW_HEX}" ]; then
  echo "FAIL [IDENT-01]: Raw hex color values found in app/ — use named token utilities instead."
  echo ""
  echo "Offenders:"
  echo "${RAW_HEX}"
  echo ""
  echo "Fix: Replace raw hex with Tailwind token utilities:"
  echo "  text-[#1C39BB]  →  text-accent"
  echo "  bg-[#FFFFFF]    →  bg-surface"
  echo "  color: #18181B  →  use text-primary utility class"
  EXIT_CODE=1
fi

# ── (b) Gray utility check ────────────────────────────────────────────────────
# Find Tailwind default gray scale utilities — these bypass the semantic token system.
GRAY_UTILS=$(
  grep -rEn 'text-gray-[0-9]|bg-gray-[0-9]|border-gray-[0-9]' "${APP_DIR}" \
    --include="*.tsx" \
    --include="*.ts" \
    --include="*.css" \
  | grep -vE '^\s*(//|/\*|\*|<!--)' \
  || true
)

if [ -n "${GRAY_UTILS}" ]; then
  echo "FAIL [IDENT-01]: Tailwind default gray utilities found in app/ — use semantic tokens instead."
  echo ""
  echo "Offenders:"
  echo "${GRAY_UTILS}"
  echo ""
  echo "Fix: Replace gray utilities with semantic token utilities:"
  echo "  text-gray-900  →  text-primary"
  echo "  text-gray-500  →  text-secondary"
  echo "  text-gray-400  →  text-muted"
  echo "  bg-gray-100    →  bg-surface-muted"
  EXIT_CODE=1
fi

if [ "${EXIT_CODE}" -eq 0 ]; then
  echo "PASS [IDENT-01]: No raw hex values and no gray utilities found in app/."
fi

exit "${EXIT_CODE}"
