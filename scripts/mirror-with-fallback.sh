#!/bin/bash
set -euo pipefail

# Mirror with Automatic Fallback Chain
# 
# Fallback Chain:
#   1. Playwright mirror (highest fidelity)
#   2. HTTrack (comprehensive crawling)
#   3. wget (robust standard tool)
#   4. SingleFile (critical pages only - last resort)
#
# Usage: ./mirror-with-fallback.sh [URL] [OUTPUT_DIR]
#   URL: Target website (default: https://www.avir.com)
#   OUTPUT_DIR: Output directory (default: site)
#
# Exit codes:
#   0 - At least one tool succeeded
#   1 - All tools failed

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Configuration
SITE_URL="${1:-https://www.avir.com}"
OUTPUT_DIR="${2:-site}"
LOG_DIR="${PROJECT_ROOT}/logs"
REPORT_DIR="${PROJECT_ROOT}/mirror-reports"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
LOG_FILE="${LOG_DIR}/mirror-fallback-${TIMESTAMP}.log"
REPORT_FILE="${REPORT_DIR}/fallback-report-${TIMESTAMP}.json"

# Tracking variables
ATTEMPTS=()
SUCCESSFUL_TOOL=""
EXIT_CODE=1

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

log_stage() {
    echo -e "${BLUE}[FALLBACK]${NC} $1" | tee -a "$LOG_FILE"
}

log_attempt() {
    local tool="$1"
    local status="$2"
    local duration="${3:-0}"
    local message="${4:-}"
    
    ATTEMPTS+=("{\"tool\":\"$tool\",\"status\":\"$status\",\"duration\":$duration,\"message\":\"$message\"}")
    
    if [[ "$status" == "SUCCESS" ]]; then
        echo -e "${GREEN}✓${NC} $tool succeeded (${duration}s)" | tee -a "$LOG_FILE"
    elif [[ "$status" == "FAILED" ]]; then
        echo -e "${RED}✗${NC} $tool failed (${duration}s): $message" | tee -a "$LOG_FILE"
    else
        echo -e "${YELLOW}⊘${NC} $tool skipped: $message" | tee -a "$LOG_FILE"
    fi
}

# Ensure directories exist
mkdir -p "$LOG_DIR"
mkdir -p "$REPORT_DIR"
mkdir -p "$OUTPUT_DIR"

# Initialize log
echo "Mirror with Fallback Chain - Started $(date)" > "$LOG_FILE"
echo "Target: $SITE_URL" >> "$LOG_FILE"
echo "Output: $OUTPUT_DIR" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"

log_info "Starting mirror with fallback chain..."
log_info "Target: $SITE_URL"
log_info "Output: $OUTPUT_DIR"
echo "" | tee -a "$LOG_FILE"

# Cleanup function
cleanup() {
    # Generate JSON report
    local attempts_json="["
    for i in "${!ATTEMPTS[@]}"; do
        attempts_json+="${ATTEMPTS[$i]}"
        if [[ $i -lt $((${#ATTEMPTS[@]} - 1)) ]]; then
            attempts_json+=","
        fi
    done
    attempts_json+="]"
    
    cat > "$REPORT_FILE" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "target_url": "$SITE_URL",
  "output_directory": "$OUTPUT_DIR",
  "successful_tool": "$SUCCESSFUL_TOOL",
  "exit_code": $EXIT_CODE,
  "total_attempts": ${#ATTEMPTS[@]},
  "attempts": $attempts_json,
  "log_file": "$LOG_FILE"
}
EOF
    
    log_info "Fallback report saved to: $REPORT_FILE"
}

trap cleanup EXIT

# ============================================================================
# FALLBACK 1: Playwright Mirror
# ============================================================================
log_stage "ATTEMPT 1/4: Playwright Mirror"
log_info "Trying Playwright for high-fidelity mirror..."

PLAYWRIGHT_START=$(date +%s)

if command -v node &> /dev/null && [[ -f "${SCRIPT_DIR}/mirror-playwright.js" ]]; then
    if node "${SCRIPT_DIR}/mirror-playwright.js" 2>&1 | tee -a "$LOG_FILE"; then
        PLAYWRIGHT_END=$(date +%s)
        PLAYWRIGHT_DURATION=$((PLAYWRIGHT_END - PLAYWRIGHT_START))
        
        if [[ -d "$OUTPUT_DIR" ]] && [[ "$(ls -A "$OUTPUT_DIR" 2>/dev/null)" ]]; then
            log_attempt "Playwright" "SUCCESS" "$PLAYWRIGHT_DURATION" "High-fidelity mirror complete"
            SUCCESSFUL_TOOL="Playwright"
            EXIT_CODE=0
            exit 0
        else
            log_attempt "Playwright" "FAILED" "$PLAYWRIGHT_DURATION" "Output directory empty"
        fi
    else
        PLAYWRIGHT_END=$(date +%s)
        PLAYWRIGHT_DURATION=$((PLAYWRIGHT_END - PLAYWRIGHT_START))
        log_attempt "Playwright" "FAILED" "$PLAYWRIGHT_DURATION" "Script returned error code"
    fi
else
    log_attempt "Playwright" "SKIPPED" "0" "Node.js or mirror-playwright.js not found"
fi

echo "" | tee -a "$LOG_FILE"
log_warn "Playwright failed or unavailable, falling back to HTTrack..."

# ============================================================================
# FALLBACK 2: HTTrack
# ============================================================================
log_stage "ATTEMPT 2/4: HTTrack"
log_info "Trying HTTrack for comprehensive crawling..."

HTTRACK_START=$(date +%s)

if command -v httrack &> /dev/null; then
    # Clean output dir for fresh attempt
    rm -rf "$OUTPUT_DIR"
    mkdir -p "$OUTPUT_DIR"
    
    # HTTrack options for mirroring
    # -O: Output path
    # -%v: Verbose
    # -r3: Recursion depth 3
    # -%e0: No external links
    # -N0: Original file names
    if httrack "$SITE_URL" \
        -O "$OUTPUT_DIR" \
        -%v \
        -r3 \
        -%e0 \
        -N0 \
        --timeout=30 \
        --retries=3 \
        "-*google*" "-*facebook*" "-*analytics*" \
        2>&1 | tee -a "$LOG_FILE"; then
        
        HTTRACK_END=$(date +%s)
        HTTRACK_DURATION=$((HTTRACK_END - HTTRACK_START))
        
        # Check if any HTML files were created
        if find "$OUTPUT_DIR" -name "*.html" -type f 2>/dev/null | grep -q .; then
            log_attempt "HTTrack" "SUCCESS" "$HTTRACK_DURATION" "Comprehensive crawl complete"
            SUCCESSFUL_TOOL="HTTrack"
            EXIT_CODE=0
            exit 0
        else
            log_attempt "HTTrack" "FAILED" "$HTTRACK_DURATION" "No HTML files found in output"
        fi
    else
        HTTRACK_END=$(date +%s)
        HTTRACK_DURATION=$((HTTRACK_END - HTTRACK_START))
        log_attempt "HTTrack" "FAILED" "$HTTRACK_DURATION" "HTTrack returned error code"
    fi
else
    log_attempt "HTTrack" "SKIPPED" "0" "httrack not installed"
fi

echo "" | tee -a "$LOG_FILE"
log_warn "HTTrack failed or unavailable, falling back to wget..."

# ============================================================================
# FALLBACK 3: wget
# ============================================================================
log_stage "ATTEMPT 3/4: wget"
log_info "Trying wget for robust standard mirroring..."

WGET_START=$(date +%s)

if command -v wget &> /dev/null; then
    # Clean output dir for fresh attempt
    rm -rf "$OUTPUT_DIR"
    mkdir -p "$OUTPUT_DIR"
    
    # Extract domain for wget
    DOMAIN=$(echo "$SITE_URL" | sed -E 's|https?://||' | sed -E 's|/.*||')
    
    if wget \
        --mirror \
        --convert-links \
        --adjust-extension \
        --page-requisites \
        --no-parent \
        --continue \
        --tries=3 \
        --timeout=30 \
        --waitretry=5 \
        --user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" \
        --span-hosts \
        --domains="$DOMAIN,cdn.prod.website-files.com,assets.website-files.com" \
        --no-check-certificate \
        --directory-prefix="$OUTPUT_DIR" \
        --progress=bar:force \
        "$SITE_URL" 2>&1 | tee -a "$LOG_FILE"; then
        
        WGET_END=$(date +%s)
        WGET_DURATION=$((WGET_END - WGET_START))
        
        # Check if output has content
        if [[ -d "$OUTPUT_DIR" ]] && [[ "$(find "$OUTPUT_DIR" -type f 2>/dev/null | wc -l)" -gt 0 ]]; then
            log_attempt "wget" "SUCCESS" "$WGET_DURATION" "Standard mirror complete"
            SUCCESSFUL_TOOL="wget"
            EXIT_CODE=0
            exit 0
        else
            log_attempt "wget" "FAILED" "$WGET_DURATION" "Output directory empty"
        fi
    else
        WGET_END=$(date +%s)
        WGET_DURATION=$((WGET_END - WGET_START))
        log_attempt "wget" "FAILED" "$WGET_DURATION" "wget returned error code"
    fi
else
    log_attempt "wget" "SKIPPED" "0" "wget not installed"
fi

echo "" | tee -a "$LOG_FILE"
log_warn "wget failed or unavailable, falling back to SingleFile (last resort)..."

# ============================================================================
# FALLBACK 4: SingleFile (Critical Pages Only)
# ============================================================================
log_stage "ATTEMPT 4/4: SingleFile (Last Resort)"
log_info "Trying SingleFile for critical pages only..."

SINGLEFILE_START=$(date +%s)

# Check if SingleFile CLI is available
if command -v single-file &> /dev/null || [[ -f "${PROJECT_ROOT}/node_modules/.bin/single-file" ]]; then
    SINGLEFILE_CMD="single-file"
    if [[ -f "${PROJECT_ROOT}/node_modules/.bin/single-file" ]]; then
        SINGLEFILE_CMD="${PROJECT_ROOT}/node_modules/.bin/single-file"
    fi
    
    # Clean output dir for fresh attempt
    rm -rf "$OUTPUT_DIR"
    mkdir -p "$OUTPUT_DIR"
    
    # Define critical pages to capture
    CRITICAL_PAGES=(
        "/"
        "/services"
        "/about-avir"
        "/contact"
        "/brands"
        "/portfolio"
    )
    
    SINGLEFILE_SUCCESS=0
    SINGLEFILE_FAILED=0
    
    for page in "${CRITICAL_PAGES[@]}"; do
        page_url="${SITE_URL%/}$page"
        output_file="${OUTPUT_DIR}/${page//\//_}.html"
        [[ "$page" == "/" ]] && output_file="${OUTPUT_DIR}/index.html"
        
        log_info "Capturing: $page_url -> $output_file"
        
        if $SINGLEFILE_CMD \
            --back-end=webdriver-chromium \
            --browser-headless \
            --compress-CSS \
            --remove-frames \
            --remove-imports \
            "$page_url" "$output_file" 2>&1 | tee -a "$LOG_FILE"; then
            SINGLEFILE_SUCCESS=$((SINGLEFILE_SUCCESS + 1))
        else
            log_warn "Failed to capture: $page_url"
            SINGLEFILE_FAILED=$((SINGLEFILE_FAILED + 1))
        fi
    done
    
    SINGLEFILE_END=$(date +%s)
    SINGLEFILE_DURATION=$((SINGLEFILE_END - SINGLEFILE_START))
    
    # If at least 50% of critical pages were captured, consider it a partial success
    TOTAL_PAGES=$((${#CRITICAL_PAGES[@]}))
    if [[ $SINGLEFILE_SUCCESS -ge $((TOTAL_PAGES / 2)) ]]; then
        log_attempt "SingleFile" "SUCCESS" "$SINGLEFILE_DURATION" "Captured $SINGLEFILE_SUCCESS/$TOTAL_PAGES critical pages"
        SUCCESSFUL_TOOL="SingleFile (partial)"
        EXIT_CODE=0
        
        # Create a minimal report for partial success
        cat > "${OUTPUT_DIR}/MIRROR_PARTIAL_SUCCESS.txt" << EOF
Partial Mirror Complete
=======================
This mirror was created using SingleFile as a fallback.
Only critical pages were captured: $SINGLEFILE_SUCCESS/$TOTAL_PAGES

Captured pages:
$(ls -1 "$OUTPUT_DIR"/*.html 2>/dev/null | xargs -n1 basename)

Missing pages:
Some secondary pages may not be available.

Timestamp: $(date)
EOF
        
        exit 0
    else
        log_attempt "SingleFile" "FAILED" "$SINGLEFILE_DURATION" "Only captured $SINGLEFILE_SUCCESS/$TOTAL_PAGES critical pages"
    fi
else
    log_attempt "SingleFile" "SKIPPED" "0" "SingleFile CLI not found (npm install single-file-cli)"
fi

# ============================================================================
# ALL FAILED
# ============================================================================
echo "" | tee -a "$LOG_FILE"
log_error "========================================"
log_error "ALL FALLBACK ATTEMPTS FAILED"
log_error "========================================"
log_error "Tried: Playwright → HTTrack → wget → SingleFile"
log_error "No mirror could be created."
log_error ""
log_error "Troubleshooting:"
log_error "  1. Check network connectivity to $SITE_URL"
log_error "  2. Verify the site is accessible"
log_error "  3. Check firewall/proxy settings"
log_error "  4. Install at least one mirroring tool:"
log_error "     - Node.js + Playwright: npm install"
log_error "     - HTTrack: apt-get install httrack"
log_error "     - wget: usually pre-installed"
log_error "     - SingleFile: npm install single-file-cli"
log_error ""
log_error "Log file: $LOG_FILE"
log_error "Report: $REPORT_FILE"

EXIT_CODE=1
exit 1
