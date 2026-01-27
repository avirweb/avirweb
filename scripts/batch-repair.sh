#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PATHS_FILE="$PROJECT_ROOT/paths.txt"
REPAIR_SCRIPT="$SCRIPT_DIR/repair-html.py"
SITE_DIR="$PROJECT_ROOT/site"
PRODUCTION_BASE="https://www.avir.com"
TEMP_DIR="/tmp/batch-repair-$$"

LOG_FILE="$PROJECT_ROOT/batch-repair.log"
SUCCESS_COUNT=0
FAIL_COUNT=0
SKIP_COUNT=0

mkdir -p "$TEMP_DIR"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

cleanup() {
    rm -rf "$TEMP_DIR"
}

trap cleanup EXIT

if [ ! -f "$PATHS_FILE" ]; then
    log "ERROR: paths.txt not found at $PATHS_FILE"
    exit 1
fi

if [ ! -f "$REPAIR_SCRIPT" ]; then
    log "ERROR: repair-html.py not found at $REPAIR_SCRIPT"
    exit 1
fi

TOTAL_PATHS=$(wc -l < "$PATHS_FILE")
CURRENT=0

log "Starting batch repair of $TOTAL_PATHS files"
log "Production base: $PRODUCTION_BASE"
log "Site directory: $SITE_DIR"
log "Repair script: $REPAIR_SCRIPT"
log ""

while IFS= read -r path; do
    CURRENT=$((CURRENT + 1))
    
    if [ -z "$path" ]; then
        log "[$CURRENT/$TOTAL_PATHS] SKIP: Empty line"
        SKIP_COUNT=$((SKIP_COUNT + 1))
        continue
    fi
    
    path="${path#/}"
    path="${path%.html}"
    
    PRODUCTION_URL="${PRODUCTION_BASE}/${path}"
    LOCAL_FILE="${SITE_DIR}/${path}.html"
    TEMP_DOWNLOAD="${TEMP_DIR}/download.html"
    TEMP_REPAIRED="${TEMP_DIR}/repaired.html"
    
    log "[$CURRENT/$TOTAL_PATHS] Processing: /$path.html"
    log "  URL: $PRODUCTION_URL"
    log "  Local: $LOCAL_FILE"
    
    mkdir -p "$(dirname "$LOCAL_FILE")"
    
    if ! curl -s -L -f -m 30 "$PRODUCTION_URL" -o "$TEMP_DOWNLOAD"; then
        log "  ERROR: Failed to download from production"
        FAIL_COUNT=$((FAIL_COUNT + 1))
        continue
    fi
    
    if [ ! -s "$TEMP_DOWNLOAD" ]; then
        log "  ERROR: Downloaded file is empty"
        FAIL_COUNT=$((FAIL_COUNT + 1))
        continue
    fi
    
    DOWNLOAD_SIZE=$(wc -c < "$TEMP_DOWNLOAD")
    log "  Downloaded: $DOWNLOAD_SIZE bytes"
    
    if ! python3 "$REPAIR_SCRIPT" "$TEMP_DOWNLOAD" "$TEMP_REPAIRED" 2>&1 | tee -a "$LOG_FILE"; then
        log "  ERROR: Repair script failed"
        FAIL_COUNT=$((FAIL_COUNT + 1))
        continue
    fi
    
    if [ ! -s "$TEMP_REPAIRED" ]; then
        log "  ERROR: Repaired file is empty"
        FAIL_COUNT=$((FAIL_COUNT + 1))
        continue
    fi
    
    REPAIRED_SIZE=$(wc -c < "$TEMP_REPAIRED")
    log "  Repaired: $REPAIRED_SIZE bytes"
    
    CDN_COUNT=$(grep -c "cdn.prod.website-files.com" "$TEMP_REPAIRED" || true)
    SRI_COUNT=$(grep -c 'integrity=' "$TEMP_REPAIRED" || true)
    CROSSORIGIN_COUNT=$(grep -c 'crossorigin' "$TEMP_REPAIRED" || true)
    
    if [ "$CDN_COUNT" -gt 0 ]; then
        log "  WARNING: $CDN_COUNT CDN URLs still present"
    fi
    
    if [ "$SRI_COUNT" -gt 0 ]; then
        log "  WARNING: $SRI_COUNT integrity attributes still present"
    fi
    
    if [ "$CROSSORIGIN_COUNT" -gt 0 ]; then
        log "  WARNING: $CROSSORIGIN_COUNT crossorigin attributes still present"
    fi
    
    cp "$TEMP_REPAIRED" "$LOCAL_FILE"
    log "  SUCCESS: File repaired and saved"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    
    rm -f "$TEMP_DOWNLOAD" "$TEMP_REPAIRED"
    
done < "$PATHS_FILE"

log ""
log "=== BATCH REPAIR SUMMARY ==="
log "Total files: $TOTAL_PATHS"
log "Success: $SUCCESS_COUNT"
log "Failed: $FAIL_COUNT"
log "Skipped: $SKIP_COUNT"
log ""

if [ "$FAIL_COUNT" -gt 0 ]; then
    log "WARNING: $FAIL_COUNT files failed to repair"
    exit 1
fi

log "Batch repair completed successfully"
exit 0
