#!/bin/bash

# Pre-Deploy Validation Script for AVIR Mirror System
# Validates the site/ directory before deployment
# Usage: ./scripts/validate-site.sh
# Exit codes: 0 = success, 1 = failure
#
# OPTIMIZED VERSION - Performance improvements:
# - Parallel processing for independent checks
# - Cached file lists to avoid repeated find calls
# - Optimized grep patterns
# - Background jobs for I/O bound operations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
ERRORS=0
WARNINGS=0
CHECKS_PASSED=0

# Site directory
SITE_DIR="${SITE_DIR:-site}"
REPORT_FILE="validation-report-$(date +%Y%m%d-%H%M%S).txt"

# Temporary directory for parallel job results
TMPDIR=$(mktemp -d)
trap "rm -rf $TMPDIR" EXIT

echo "========================================"
echo "  AVIR Pre-Deploy Validation"
echo "========================================"
echo "Site directory: $SITE_DIR"
echo "Report file: $REPORT_FILE"
echo ""

# Function to log and report
log_check() {
    local status="$1"
    local message="$2"
    local details="${3:-}"
    
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✓${NC} $message"
        CHECKS_PASSED=$((CHECKS_PASSED + 1))
    elif [ "$status" = "WARN" ]; then
        echo -e "${YELLOW}⚠${NC} $message"
        if [ -n "$details" ]; then
            echo "  $details"
        fi
        WARNINGS=$((WARNINGS + 1))
    else
        echo -e "${RED}✗${NC} $message"
        if [ -n "$details" ]; then
            echo "  $details"
        fi
        ERRORS=$((ERRORS + 1))
    fi
    
    # Log to file
    echo "[$status] $message $details" >> "$REPORT_FILE"
}

# Check 1: Site directory exists
if [ ! -d "$SITE_DIR" ]; then
    log_check "FAIL" "Site directory does not exist: $SITE_DIR"
    echo ""
    echo "Validation FAILED"
    exit 1
fi
log_check "PASS" "Site directory exists"

# Check 2: index.html exists
if [ ! -f "$SITE_DIR/index.html" ]; then
    log_check "FAIL" "index.html not found in site directory"
else
    log_check "PASS" "index.html exists"
fi

# Check 3: DOCTYPE declaration in index.html
if [ -f "$SITE_DIR/index.html" ]; then
    if grep -qi "<!DOCTYPE html>" "$SITE_DIR/index.html"; then
        log_check "PASS" "index.html has DOCTYPE declaration"
    else
        log_check "FAIL" "index.html missing DOCTYPE declaration"
    fi
fi

# OPTIMIZATION: Cache file lists to avoid repeated find calls
echo ""
echo "Caching file lists..."
HTML_FILES=$(find "$SITE_DIR" -name "*.html" -type f 2>/dev/null)
HTML_COUNT=$(echo "$HTML_FILES" | grep -c . || echo 0)
CSS_FILES=$(find "$SITE_DIR" -name "*.css" -type f 2>/dev/null)
CSS_COUNT=$(echo "$CSS_FILES" | grep -c . || echo 0)
JS_FILES=$(find "$SITE_DIR" -name "*.js" -type f 2>/dev/null)
JS_COUNT=$(echo "$JS_FILES" | grep -c . || echo 0)

# Check 4: Count HTML pages
if [ "$HTML_COUNT" -eq 0 ]; then
    log_check "FAIL" "No HTML files found in site directory"
elif [ "$HTML_COUNT" -lt 100 ]; then
    log_check "WARN" "Low HTML page count: $HTML_COUNT (expected ~144)"
else
    log_check "PASS" "HTML page count: $HTML_COUNT"
fi

# OPTIMIZATION: Run independent attribute checks in parallel
echo ""
echo "Running parallel attribute checks..."

# Start parallel jobs for empty attribute checks
(
    echo "$HTML_FILES" | xargs -P4 -I{} grep -l 'src=""' {} 2>/dev/null | head -20 > "$TMPDIR/empty_src.txt"
    echo "$HTML_FILES" | xargs -P4 -I{} grep -l 'src=""' {} 2>/dev/null | wc -l > "$TMPDIR/empty_src_count.txt"
) &
PID_EMPTY_SRC=$!

(
    echo "$HTML_FILES" | xargs -P4 -I{} grep -l 'srcset=""' {} 2>/dev/null | wc -l > "$TMPDIR/empty_srcset_count.txt"
) &
PID_EMPTY_SRCSET=$!

(
    echo "$HTML_FILES" | xargs -P4 -I{} grep -l 'href=""' {} 2>/dev/null | wc -l > "$TMPDIR/empty_href_count.txt"
) &
PID_EMPTY_HREF=$!

# Check 5: Check for empty src attributes (wait for parallel job)
wait $PID_EMPTY_SRC
EMPTY_SRC_COUNT=$(cat "$TMPDIR/empty_src_count.txt" 2>/dev/null || echo 0)
if [ "$EMPTY_SRC_COUNT" -eq 0 ]; then
    log_check "PASS" "No empty src attributes found"
else
    log_check "WARN" "Found $EMPTY_SRC_COUNT files with empty src attributes" "(showing first 20)"
    cat "$TMPDIR/empty_src.txt" | while read -r file; do
        echo "  - $file"
    done
fi

# Check 6: Check for empty srcset attributes
wait $PID_EMPTY_SRCSET
EMPTY_SRCSET_COUNT=$(cat "$TMPDIR/empty_srcset_count.txt" 2>/dev/null || echo 0)
if [ "$EMPTY_SRCSET_COUNT" -eq 0 ]; then
    log_check "PASS" "No empty srcset attributes found"
else
    log_check "WARN" "Found $EMPTY_SRCSET_COUNT files with empty srcset attributes"
fi

# Check 7: Check for empty href attributes
wait $PID_EMPTY_HREF
EMPTY_HREF_COUNT=$(cat "$TMPDIR/empty_href_count.txt" 2>/dev/null || echo 0)
if [ "$EMPTY_HREF_COUNT" -eq 0 ]; then
    log_check "PASS" "No empty href attributes found"
else
    log_check "WARN" "Found $EMPTY_HREF_COUNT files with empty href attributes"
fi

# Check 8: Verify critical files exist
echo ""
echo "Checking critical files..."

CRITICAL_FILES=(
    "index.html"
    "contact/index.html"
    "services/index.html"
    "about-avir/index.html"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$SITE_DIR/$file" ]; then
        log_check "PASS" "Critical file exists: $file"
    else
        log_check "FAIL" "Missing critical file: $file"
    fi
done

# Check 9: Check for CSS files
echo ""
echo "Checking CSS files..."
if [ "$CSS_COUNT" -eq 0 ]; then
    log_check "WARN" "No CSS files found"
else
    log_check "PASS" "Found $CSS_COUNT CSS files"
fi

# Check 10: Check for JS files
echo ""
echo "Checking JavaScript files..."
if [ "$JS_COUNT" -eq 0 ]; then
    log_check "WARN" "No JavaScript files found"
else
    log_check "PASS" "Found $JS_COUNT JavaScript files"
fi

# Check 11: Check for images directory
echo ""
echo "Checking images..."
if [ -d "$SITE_DIR/images" ]; then
    IMAGE_COUNT=$(find "$SITE_DIR/images" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.gif" -o -name "*.svg" -o -name "*.webp" \) 2>/dev/null | wc -l)
    log_check "PASS" "Images directory exists with $IMAGE_COUNT images"
else
    log_check "WARN" "No images directory found"
fi

# OPTIMIZATION: Limit broken link check to sample and use faster grep
# Check 12: Check for broken internal links (sample-based, limited scope)
echo ""
echo "Checking for potential broken links (sample-based)..."
BROKEN_LINKS=0
LINK_CHECK_LIMIT=50  # Only check first 50 HTML files for speed

# Process in batches for better performance
echo "$HTML_FILES" | head -$LINK_CHECK_LIMIT | while IFS= read -r file; do
    # Extract href values and check if they point to local files that don't exist
    grep -oE 'href="[^"]*"' "$file" 2>/dev/null | grep -v 'http' | grep -v 'mailto' | grep -v 'tel' | grep -v '#' | while read -r link; do
        # Remove href=" and trailing "
        path=$(echo "$link" | sed 's/href="//;s/"$//')
        # Remove leading slash if present
        path=$(echo "$path" | sed 's/^\///')
        # Skip empty, javascript:, and external links
        if [ -n "$path" ] && [[ ! "$path" =~ ^javascript ]] && [[ ! "$path" =~ ^# ]]; then
            # Check if file exists
            if [[ "$path" =~ \.html$ ]]; then
                if [ ! -f "$SITE_DIR/$path" ] && [ ! -f "$SITE_DIR/$path/index.html" ]; then
                    echo "Potential broken link in $file: $path" >&2
                    echo 1 >> "$TMPDIR/broken_links.txt"
                fi
            fi
        fi
    done
done

BROKEN_LINKS=$(cat "$TMPDIR/broken_links.txt" 2>/dev/null | wc -l)

if [ "$BROKEN_LINKS" -eq 0 ]; then
    log_check "PASS" "No obvious broken internal links detected (checked sample of $LINK_CHECK_LIMIT files)"
else
    log_check "WARN" "Found $BROKEN_LINKS potential broken links (checked sample of $LINK_CHECK_LIMIT files)"
fi

# Summary
echo ""
echo "========================================"
echo "  Validation Summary"
echo "========================================"
echo -e "Checks passed: ${GREEN}$CHECKS_PASSED${NC}"
echo -e "Warnings: ${YELLOW}$WARNINGS${NC}"
echo -e "Errors: ${RED}$ERRORS${NC}"
echo ""

# Final result
if [ "$ERRORS" -gt 0 ]; then
    echo -e "${RED}Validation FAILED${NC} - Fix errors before deploying"
    echo "See $REPORT_FILE for details"
    exit 1
elif [ "$WARNINGS" -gt 0 ]; then
    echo -e "${YELLOW}Validation PASSED with warnings${NC} - Review warnings before deploying"
    echo "See $REPORT_FILE for details"
    exit 0
else
    echo -e "${GREEN}Validation PASSED${NC} - Site ready for deployment"
    exit 0
fi
