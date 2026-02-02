#!/bin/bash

# Pre-Deploy Validation Script for AVIR Mirror System
# Validates the site/ directory before deployment
# Usage: ./scripts/validate-site.sh
# Exit codes: 0 = success, 1 = failure

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
        ((CHECKS_PASSED++))
    elif [ "$status" = "WARN" ]; then
        echo -e "${YELLOW}⚠${NC} $message"
        if [ -n "$details" ]; then
            echo "  $details"
        fi
        ((WARNINGS++))
    else
        echo -e "${RED}✗${NC} $message"
        if [ -n "$details" ]; then
            echo "  $details"
        fi
        ((ERRORS++))
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
    if grep -q "<!DOCTYPE html>" "$SITE_DIR/index.html" || grep -q "<!doctype html>" "$SITE_DIR/index.html"; then
        log_check "PASS" "index.html has DOCTYPE declaration"
    else
        log_check "FAIL" "index.html missing DOCTYPE declaration"
    fi
fi

# Check 4: Count HTML pages
HTML_COUNT=$(find "$SITE_DIR" -name "*.html" -type f | wc -l)
if [ "$HTML_COUNT" -eq 0 ]; then
    log_check "FAIL" "No HTML files found in site directory"
elif [ "$HTML_COUNT" -lt 100 ]; then
    log_check "WARN" "Low HTML page count: $HTML_COUNT (expected ~144)"
else
    log_check "PASS" "HTML page count: $HTML_COUNT"
fi

# Check 5: Check for empty src attributes
echo ""
echo "Checking for empty src attributes..."
EMPTY_SRC=$(find "$SITE_DIR" -name "*.html" -type f -exec grep -l 'src=""' {} \; 2>/dev/null | head -20)
EMPTY_SRC_COUNT=$(find "$SITE_DIR" -name "*.html" -type f -exec grep -l 'src=""' {} \; 2>/dev/null | wc -l)

if [ "$EMPTY_SRC_COUNT" -eq 0 ]; then
    log_check "PASS" "No empty src attributes found"
else
    log_check "WARN" "Found $EMPTY_SRC_COUNT files with empty src attributes" "(showing first 20)"
    echo "$EMPTY_SRC" | while read -r file; do
        echo "  - $file"
    done
fi

# Check 6: Check for empty srcset attributes
echo ""
echo "Checking for empty srcset attributes..."
EMPTY_SRCSET_COUNT=$(find "$SITE_DIR" -name "*.html" -type f -exec grep -l 'srcset=""' {} \; 2>/dev/null | wc -l)

if [ "$EMPTY_SRCSET_COUNT" -eq 0 ]; then
    log_check "PASS" "No empty srcset attributes found"
else
    log_check "WARN" "Found $EMPTY_SRCSET_COUNT files with empty srcset attributes"
fi

# Check 7: Check for empty href attributes (excluding anchors)
echo ""
echo "Checking for empty href attributes..."
EMPTY_HREF_COUNT=$(find "$SITE_DIR" -name "*.html" -type f -exec grep -l 'href=""' {} \; 2>/dev/null | wc -l)

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
CSS_COUNT=$(find "$SITE_DIR" -name "*.css" -type f | wc -l)
if [ "$CSS_COUNT" -eq 0 ]; then
    log_check "WARN" "No CSS files found"
else
    log_check "PASS" "Found $CSS_COUNT CSS files"
fi

# Check 10: Check for JS files
echo ""
echo "Checking JavaScript files..."
JS_COUNT=$(find "$SITE_DIR" -name "*.js" -type f | wc -l)
if [ "$JS_COUNT" -eq 0 ]; then
    log_check "WARN" "No JavaScript files found"
else
    log_check "PASS" "Found $JS_COUNT JavaScript files"
fi

# Check 11: Check for images directory
echo ""
echo "Checking images..."
if [ -d "$SITE_DIR/images" ]; then
    IMAGE_COUNT=$(find "$SITE_DIR/images" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.gif" -o -name "*.svg" -o -name "*.webp" \) | wc -l)
    log_check "PASS" "Images directory exists with $IMAGE_COUNT images"
else
    log_check "WARN" "No images directory found"
fi

# Check 12: Check for broken internal links (simple check)
echo ""
echo "Checking for potential broken links..."
# Look for links to non-existent pages
BROKEN_LINKS=0
while IFS= read -r file; do
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
                    echo "Potential broken link in $file: $path"
                    ((BROKEN_LINKS++))
                fi
            fi
        fi
    done
done < <(find "$SITE_DIR" -name "*.html" -type f)

if [ "$BROKEN_LINKS" -eq 0 ]; then
    log_check "PASS" "No obvious broken internal links detected"
else
    log_check "WARN" "Found $BROKEN_LINKS potential broken links"
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
