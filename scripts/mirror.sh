#!/usr/bin/env bash
set -euo pipefail

SCRIPT_NAME="$(basename "$0")"
SITE_DIR="site"

usage() {
  cat <<'EOF'
Mirror a public website into ./site/ for static hosting, using wget.

Usage:
  scripts/mirror.sh [--clean] [--extra-domains a,b,c] URL
  scripts/mirror.sh --help

Required:
  URL                         The site URL to mirror (must include scheme, e.g. https://example.com/)

Options:
  --clean                     Remove ./site/ before mirroring
  --extra-domains a,b,c       Allow additional hosts (e.g. CDNs). Enables wget --span-hosts and
                              sets --domains to include the target host plus the extras.
  --help                      Show this help text

Limitations:
  - SPAs/SSR apps may not mirror correctly: client-side routes, API calls, and JS-rendered content
    are not pre-rendered by wget.

Examples:
  scripts/mirror.sh https://example.com/
  scripts/mirror.sh --clean https://example.com/docs/
  scripts/mirror.sh --extra-domains cdn.example.com,images.examplecdn.com https://example.com/
EOF
}

die() {
  printf '%s: error: %s\n' "$SCRIPT_NAME" "$*" >&2
  printf 'Try: %s --help\n' "$SCRIPT_NAME" >&2
  exit 2
}

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "missing required command: $1"
}

CLEAN=0
EXTRA_DOMAINS=""
URL=""

while [ "$#" -gt 0 ]; do
  case "$1" in
    --help|-h)
      usage
      exit 0
      ;;
    --clean)
      CLEAN=1
      shift
      ;;
    --extra-domains)
      shift
      [ "$#" -gt 0 ] || die "--extra-domains requires a value like a,b,c"
      EXTRA_DOMAINS="${1:-}"
      shift
      ;;
    --extra-domains=*)
      EXTRA_DOMAINS="${1#*=}"
      shift
      ;;
    --*)
      die "unknown option: $1"
      ;;
    *)
      if [ -n "$URL" ]; then
        die "unexpected extra argument: $1"
      fi
      URL="$1"
      shift
      ;;
  esac
done

[ -n "$URL" ] || die "missing required URL argument"
case "$URL" in
  http://*|https://*) ;;
  *) die "URL must include scheme (http:// or https://): $URL" ;;
esac

need_cmd wget
need_cmd rm
need_cmd mkdir

host="${URL#*://}"
host="${host%%/*}"
host="${host%%:*}"
[ -n "$host" ] || die "could not parse host from URL: $URL"

if [ "$CLEAN" -eq 1 ]; then
  rm -rf "$SITE_DIR"
fi
mkdir -p "$SITE_DIR"

WGET_DOMAIN_ARGS=("--domains=$host")
WGET_SPAN_ARGS=()

if [ -n "$EXTRA_DOMAINS" ]; then
  normalized="$(printf '%s' "$EXTRA_DOMAINS" | tr -d '[:space:]')"
  [ -n "$normalized" ] || die "--extra-domains value is empty"

  domains_csv="$host"
  IFS=',' read -r -a extras <<<"$normalized"
  for d in "${extras[@]}"; do
    [ -n "$d" ] || continue
    domains_csv="$domains_csv,$d"
  done

  WGET_SPAN_ARGS=("--span-hosts")
  WGET_DOMAIN_ARGS=("--domains=$domains_csv")
fi

wget \
  --mirror \
  --page-requisites \
  --convert-links \
  --adjust-extension \
  --no-parent \
  --directory-prefix="$SITE_DIR" \
  --no-host-directories \
  --no-protocol-directories \
  "${WGET_SPAN_ARGS[@]}" \
  "${WGET_DOMAIN_ARGS[@]}" \
  "$URL"

if [ -d "$SITE_DIR/$host" ]; then
  shopt -s nullglob dotglob
  root_entries=("$SITE_DIR"/*)
  has_index=0
  for f in "$SITE_DIR"/index.*; do
    [ -e "$f" ] && has_index=1
  done

  if [ "$has_index" -eq 0 ] && [ "${#root_entries[@]}" -eq 1 ] && [ "${root_entries[0]}" = "$SITE_DIR/$host" ]; then
    tmp_src="$SITE_DIR/$host"
    printf '%s: note: flattening output from %s/ into %s/\n' "$SCRIPT_NAME" "$tmp_src" "$SITE_DIR" >&2

    src_entries=("$tmp_src"/*)
    if [ "${#src_entries[@]}" -gt 0 ]; then
      mv "$tmp_src"/* "$SITE_DIR"/
    fi
    rmdir "$tmp_src" 2>/dev/null || true
  fi
fi
