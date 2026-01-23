#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-4173}"
HOST="${HOST:-127.0.0.1}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
SITE_DIR="${REPO_ROOT}/site"

if ! command -v python3 >/dev/null 2>&1; then
  echo "error: python3 not found" >&2
  exit 1
fi

if [[ ! -d "${SITE_DIR}" ]]; then
  echo "error: site directory not found at ${SITE_DIR}" >&2
  exit 1
fi

echo "Serving '${SITE_DIR}' at http://${HOST}:${PORT}/"
echo "Ctrl-C to stop."
exec python3 -m http.server "${PORT}" --bind "${HOST}" --directory "${SITE_DIR}"
