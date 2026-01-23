#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${ROOT_DIR:-site}"
ORIGIN_DOMAIN_REGEX="${ORIGIN_DOMAIN_REGEX:-https?://[^\"'[:space:]]+}"
ABS_LINK_WARN_THRESHOLD="${ABS_LINK_WARN_THRESHOLD:-25}"
CHECK_ASSETS="${CHECK_ASSETS:-1}"

fail() { echo "error: $*" >&2; exit 1; }
warn() { echo "warn: $*" >&2; }

if [[ ! -d "${ROOT_DIR}" ]]; then
  fail "directory '${ROOT_DIR}' not found"
fi

INDEX_HTML="$(find "${ROOT_DIR}" -type f -name index.html -print -quit || true)"
if [[ -z "${INDEX_HTML}" ]]; then
  fail "no index.html found under '${ROOT_DIR}'"
fi

echo "ok: found index.html at '${INDEX_HTML}'"

HTML_FILES="$(find "${ROOT_DIR}" -type f -name '*.html' -print || true)"
if [[ -n "${HTML_FILES}" ]]; then
  ABS_COUNT="$(( (find "${ROOT_DIR}" -type f -name '*.html' -print0 | xargs -0 cat) 2>/dev/null | grep -Eo "${ORIGIN_DOMAIN_REGEX}" | wc -l | tr -d ' ' ) )" || ABS_COUNT="0"
  if [[ "${ABS_COUNT}" -ge "${ABS_LINK_WARN_THRESHOLD}" ]]; then
    warn "found ${ABS_COUNT} absolute links matching '${ORIGIN_DOMAIN_REGEX}' (may still point to origin)"
  else
    echo "ok: absolute-link count ${ABS_COUNT} (< ${ABS_LINK_WARN_THRESHOLD})"
  fi
else
  warn "no .html files found under '${ROOT_DIR}' (unexpected for a static site)"
fi

if [[ "${CHECK_ASSETS}" == "1" ]]; then
  echo "info: checking referenced relative assets (CHECK_ASSETS=1)"
  MISSING=0
  TOTAL=0

  while IFS= read -r -d '' f; do
    base_dir="$(dirname "$f")"

    while IFS= read -r ref; do
      [[ -z "${ref}" ]] && continue
      TOTAL=$((TOTAL + 1))

      ref="${ref%\"}"; ref="${ref#\"}"
      ref="${ref%\'}"; ref="${ref#\'}"

      ref_no_frag="${ref%%#*}"
      ref_no_q="${ref_no_frag%%\?*}"
      [[ -z "${ref_no_q}" ]] && continue

      case "${ref_no_q}" in
        http://*|https://*|mailto:*|tel:*|data:*|javascript:*) continue ;;
        '//'*) continue ;;
        '#'* ) continue ;;
      esac

      if [[ "${ref_no_q}" == /* ]]; then
        target="${ROOT_DIR}/${ref_no_q#/}"
      else
        target="${base_dir}/${ref_no_q}"
      fi

      if [[ -d "${target}" ]]; then
        if [[ -f "${target%/}/index.html" ]]; then
          continue
        fi
      fi

      if [[ ! -e "${target}" ]]; then
        warn "missing asset: '${ref}' referenced from '${f}' -> '${target}'"
        MISSING=$((MISSING + 1))
      fi
    done < <(
      grep -Eo '(src|href)=[\"\'\"][^\"\'\"]+[\"\'\"]' "$f" \
        | sed -E 's/^(src|href)=//'
    )
  done < <(find "${ROOT_DIR}" -type f -name '*.html' -print0)

  if [[ "${MISSING}" -gt 0 ]]; then
    fail "asset check failed: ${MISSING} missing out of ${TOTAL} references"
  fi
  echo "ok: asset check passed (${TOTAL} references)"
else
  echo "info: skipping asset checks (CHECK_ASSETS!=1)"
fi

echo "ok: smoke checks passed"
