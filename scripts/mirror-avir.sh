#!/bin/bash
set -euo pipefail

# AVIR Site Mirror Script
# Robust wget-based mirroring with retry logic and progress reporting

SITE_URL="https://www.avir.com"
OUTPUT_DIR="site"
LOG_FILE="mirror-$(date +%Y%m%d-%H%M%S).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to cleanup on exit
cleanup() {
    local exit_code=$?
    if [[ $exit_code -ne 0 ]]; then
        print_error "Mirror failed with exit code $exit_code"
        print_error "Check log file: $LOG_FILE"
    fi
}
trap cleanup EXIT

# Validate dependencies
if ! command -v wget &> /dev/null; then
    print_error "wget is not installed. Please install wget first."
    exit 1
fi

print_info "Starting AVIR site mirror..."
print_info "URL: $SITE_URL"
print_info "Output: $OUTPUT_DIR"
print_info "Log: $LOG_FILE"

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# wget with robust options:
# --mirror: Turn on options suitable for mirroring
# --convert-links: Convert links for local viewing
# --adjust-extension: Save HTML/CSS with proper extensions
# --page-requisites: Get all images, etc. needed to display HTML page
# --no-parent: Don't ascend to the parent directory
# --continue: Continue getting partially-downloaded files
# --tries=3: Set number of retries to 3
# --timeout=30: Set the network timeout to 30 seconds
# --waitretry=5: Wait 5 seconds between retries
# --user-agent: Identify as a browser
# --reject: Skip large video files
# --domains: Only follow links within this domain
# --no-check-certificate: Don't check server certificates (for SSL issues)
# --progress=bar:force: Show progress bar
# --show-progress: Display progress even in verbose mode

print_info "Starting download with retry logic (3 attempts)..."

wget \
    --mirror \
    --convert-links \
    --adjust-extension \
    --page-requisites \
    --no-parent \
    --continue \
    --tries=3 \
    --timeout=30 \
    --waitretry=5 \
    --user-agent="Mozilla/5.0 (compatible; AVIR-Bot/1.0)" \
    --reject="*.mp4,*.webm,*.mov,*.avi,*.mkv" \
    --domains=www.avir.com \
    --no-check-certificate \
    --directory-prefix="$OUTPUT_DIR" \
    --progress=bar:force \
    --show-progress \
    --server-response \
    "$SITE_URL" 2>&1 | tee "$LOG_FILE"

print_info "Mirror complete!"
print_info "Output directory: $OUTPUT_DIR"
print_info "Log file: $LOG_FILE"

# Summary
if [[ -d "$OUTPUT_DIR" ]]; then
    FILE_COUNT=$(find "$OUTPUT_DIR" -type f 2>/dev/null | wc -l)
    TOTAL_SIZE=$(du -sh "$OUTPUT_DIR" 2>/dev/null | cut -f1)
    print_info "Downloaded $FILE_COUNT files ($TOTAL_SIZE)"
fi

exit 0
