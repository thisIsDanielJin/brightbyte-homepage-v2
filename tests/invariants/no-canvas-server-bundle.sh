#!/usr/bin/env bash
#
# HERO-01 Invariant Gate — no-canvas-server-bundle.sh
#
# Verifies that Canvas/WebGL code is absent from the Next.js server bundle.
# If HeroScene is accidentally imported server-side (missing 'use client' on
# HeroCanvas, or the dynamic() call moved inside render), its three.js /
# @react-three imports appear in the .next/server/ chunks. This gate proves the
# ssr:false isolation chain (HERO-01, ROADMAP SC #1) holds at build time.
#
# Exit 0 = clean. Exit 1 = canvas/WebGL found in server bundle.
#
# Usage:
#   bash tests/invariants/no-canvas-server-bundle.sh
#
# Ordering: this guard REQUIRES a Next build (.next/server). If .next/server is
# missing it runs `npm run build` first (self-contained). If it already exists
# (e.g. the phase gate just built), it greps the existing output.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
BUILD_DIR="${REPO_ROOT}/.next"

EXIT_CODE=0

# ── Ensure build output exists (self-contained, mirrors no-stega-in-build.sh) ──
if [ ! -d "${BUILD_DIR}/server" ]; then
  echo "[no-canvas-server-bundle] No .next/server found — running 'npm run build' first..."
  ( cd "${REPO_ROOT}" && npm run build )
fi

if [ ! -d "${BUILD_DIR}/server" ]; then
  echo "FAIL [HERO-01]: .next/server missing even after build — cannot verify server bundle."
  exit 1
fi

# ── Scan server chunks for WebGL/three/@react-three imports ───────────────────
# grep -rEl lists FILES with a match (never the raw lines). Guard with `|| true`
# so a no-match (grep exit 1) does not kill the script under `set -e`. We then
# gate on whether the match variable is non-empty — never a bare `== 0` on files.
CANVAS_HITS=$(
  grep -rEl "getContext\(['\"]webgl|THREE\.|@react-three|react-three-fiber" "${BUILD_DIR}/server" \
    --include="*.js" \
  || true
)

if [ -n "${CANVAS_HITS}" ]; then
  echo "FAIL [HERO-01]: Canvas/WebGL code found in Next.js server bundle."
  echo "  This means HeroScene is imported server-side — the ssr:false dynamic() is broken."
  echo ""
  echo "Offending files:"
  echo "${CANVAS_HITS}"
  echo ""
  echo "Fix: Ensure HeroCanvas.tsx has 'use client' at line 1 AND"
  echo "     the dynamic() call is at module top-level (not inside render)."
  EXIT_CODE=1
fi

if [ "${EXIT_CODE}" -eq 0 ]; then
  echo "PASS [HERO-01]: No Canvas/WebGL imports found in server bundle."
fi

exit "${EXIT_CODE}"
