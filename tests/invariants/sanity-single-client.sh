#!/usr/bin/env bash
#
# CMS-03 Invariant Gate — sanity-single-client.sh
#
# Enforces the BrightByte Berlin v2 Sanity read-client invariant:
#   (a) EXACTLY ONE `createClient(` call across lib/ + sanity/
#       — a stray second client could bypass the stega:false guarantee.
#   (b) The client config declares BOTH `stega: false` AND
#       `perspective: 'published'` (D-03 + CMS-03).
#
# A duplicate client, or a client missing either invariant flag, is the exact
# failure this gate forbids (mirrors lib/sanity/client.ts guarantees).
#
# Exit 0 = clean. Exit 1 = violations found (offenders printed).
#
# Usage:
#   bash tests/invariants/sanity-single-client.sh
#
# Notes:
#   - Comment-only lines (//, /*, *) are filtered so JSDoc mentions of
#     `createClient` / `stega` do not create false positives.
#   - Scans lib/ and sanity/ (*.ts, *.tsx) — the only dirs where a read
#     client could be constructed.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

EXIT_CODE=0

# Directories to scan
SCAN_DIRS=()
for d in lib sanity; do
  if [ -d "${REPO_ROOT}/${d}" ]; then
    SCAN_DIRS+=("${REPO_ROOT}/${d}")
  fi
done

if [ ${#SCAN_DIRS[@]} -eq 0 ]; then
  echo "FAIL [CMS-03]: No source directories found to scan (lib/, sanity/)."
  exit 1
fi

# Comment-line filter applied to every check.
# grep -rn prefixes each hit with `path:linenum:`, so the comment marker is
# NOT at the true line start — anchor after the `:num:` prefix (or at line
# start for prefixless input).
strip_comments() {
  grep -vE '^([^:]*:[0-9]+:)?\s*(//|/\*|\*|<!--)'
}

# ── (a) Exactly one createClient( call ────────────────────────────────────────
CLIENT_HITS=$(
  grep -rEn 'createClient\(' \
    "${SCAN_DIRS[@]}" \
    --include="*.ts" \
    --include="*.tsx" \
  | strip_comments \
  || true
)

CLIENT_COUNT=0
if [ -n "${CLIENT_HITS}" ]; then
  CLIENT_COUNT=$(printf '%s\n' "${CLIENT_HITS}" | grep -c . )
fi

if [ "${CLIENT_COUNT}" -ne 1 ]; then
  echo "FAIL [CMS-03]: Expected exactly ONE createClient( across lib/ + sanity/, found ${CLIENT_COUNT}."
  echo ""
  echo "Offenders:"
  echo "${CLIENT_HITS:-<none>}"
  echo ""
  echo "Fix: There must be exactly one read client (lib/sanity/client.ts). Every GROQ"
  echo "     read flows through it so stega:false cannot be bypassed by a stray client."
  EXIT_CODE=1
fi

# ── (b) The single client declares stega:false AND perspective:'published' ────
# Search the client module(s) for the two required invariant flags.
STEGA_HITS=$(
  grep -rEn "stega:\s*false" \
    "${SCAN_DIRS[@]}" \
    --include="*.ts" \
    --include="*.tsx" \
  | strip_comments \
  || true
)

PERSPECTIVE_HITS=$(
  grep -rEn "perspective:\s*'published'|perspective:\s*\"published\"" \
    "${SCAN_DIRS[@]}" \
    --include="*.ts" \
    --include="*.tsx" \
  | strip_comments \
  || true
)

if [ -z "${STEGA_HITS}" ]; then
  echo "FAIL [CMS-03]: No 'stega: false' found in the Sanity client config."
  echo "  stega tokens corrupt titles/slugs on generateMetadata/generateStaticParams paths."
  echo "  Fix: keep 'stega: false' on the single createClient in lib/sanity/client.ts."
  EXIT_CODE=1
fi

if [ -z "${PERSPECTIVE_HITS}" ]; then
  echo "FAIL [CMS-03]: No \"perspective: 'published'\" found in the Sanity client config."
  echo "  Published-only reads prevent draft leakage (D-03)."
  echo "  Fix: keep \"perspective: 'published'\" on the single createClient in lib/sanity/client.ts."
  EXIT_CODE=1
fi

if [ "${EXIT_CODE}" -eq 0 ]; then
  echo "PASS [CMS-03]: Exactly one createClient with stega:false and perspective:'published'."
fi

exit "${EXIT_CODE}"
