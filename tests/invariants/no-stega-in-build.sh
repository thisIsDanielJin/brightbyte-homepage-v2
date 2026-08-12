#!/usr/bin/env bash
#
# CMS-03 Invariant Gate — no-stega-in-build.sh
#
# Enforces the BrightByte Berlin v2 stega invariant at BUILD OUTPUT level:
#   The Next build output must contain ZERO stega-encoding Unicode characters
#   in the U+E0000–U+E007F range (invisible "tag" codepoints). Sanity's stega
#   feature embeds these into returned strings for click-to-edit overlays; with
#   the single client's `stega: false`, they must NEVER appear in built
#   titles/routes/slugs. Any hit = stega leaked into production metadata (FAIL).
#
# This is the build-output counterpart to sanity-single-client.sh (config-level).
# Together they mitigate T-03-08 (stega tokens reach production metadata).
#
# Exit 0 = clean. Exit 1 = stega codepoints found (offenders printed).
#
# Usage:
#   bash tests/invariants/no-stega-in-build.sh
#
# Ordering: this guard REQUIRES a Next build (.next/). If .next/server is
# missing it runs `npm run build` first (self-contained). If it already exists
# (e.g. the phase gate just built), it greps the existing output.

set -euo pipefail

# Force a UTF-8 locale so grep -P interprets \x{E0000}-\x{E007F} as CODEPOINTS,
# not bytes. Under a non-UTF-8 locale (C/POSIX) the range never matches a
# multibyte stega char and the guard would silently pass (false negative).
# Set unconditionally — an inherited LC_ALL=C must NOT weaken the guard.
export LC_ALL=C.UTF-8
export LANG=C.UTF-8

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

EXIT_CODE=0

BUILD_DIR="${REPO_ROOT}/.next"

# ── Ensure build output exists (self-contained) ───────────────────────────────
if [ ! -d "${BUILD_DIR}/server" ]; then
  echo "[no-stega-in-build] No .next/server found — running 'npm run build' first..."
  ( cd "${REPO_ROOT}" && npm run build )
fi

if [ ! -d "${BUILD_DIR}/server" ]; then
  echo "FAIL [CMS-03]: .next/server missing even after build — cannot verify stega output."
  exit 1
fi

# ── Scan build output for stega Unicode (U+E0000–U+E007F) ─────────────────────
# macOS BSD grep does NOT support -P, and GNU grep -P codepoint matching is
# locale-dependent — both are portability traps that silently pass. Use Perl
# (always present on macOS + Linux CI): -CSD decodes files as UTF-8 so \x{...}
# matches CODEPOINTS, and we walk the tree with `find` for a stable file list.
# Perl prints the path of any file containing a stega tag char; empty = clean.
SCAN_TARGETS=("${BUILD_DIR}/server")
if [ -d "${BUILD_DIR}/static" ]; then
  SCAN_TARGETS+=("${BUILD_DIR}/static")
fi

STEGA_FILES=$(
  find "${SCAN_TARGETS[@]}" -type f -print0 2>/dev/null \
  | perl -CSD -0 -ne '
      # $_ is one NUL-terminated filename (via -0). Read the file, scan for
      # any codepoint in the stega tag block U+E0000–U+E007F; print path if hit.
      chomp(my $f = $_);
      next unless -f $f;
      open(my $fh, "<:encoding(UTF-8)", $f) or next;
      local $/; my $data = eval { <$fh> };
      close($fh);
      next unless defined $data;
      print "$f\n" if $data =~ /[\x{E0000}-\x{E007F}]/;
    ' \
  || true
)

if [ -n "${STEGA_FILES}" ]; then
  echo "FAIL [CMS-03]: Stega Unicode (U+E0000–U+E007F) found in build output."
  echo "  This means stega tokens leaked into built titles/routes/slugs (CMS-03 violation)."
  echo ""
  echo "Offending files:"
  echo "${STEGA_FILES}"
  echo ""
  echo "Fix: ensure lib/sanity/client.ts keeps 'stega: false' (and no second stega-enabled"
  echo "     client exists). Re-run the build after correcting the client config."
  EXIT_CODE=1
fi

if [ "${EXIT_CODE}" -eq 0 ]; then
  echo "PASS [CMS-03]: No stega Unicode (U+E0000–U+E007F) in build output."
fi

exit "${EXIT_CODE}"
