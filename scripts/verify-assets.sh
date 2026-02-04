#!/bin/bash

# Asset Verification Script
# Verifies all referenced images exist and have content

SITE_DIR="site"
ERRORS=0
WARNINGS=0
TOTAL=0

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo "========================================"
echo "Asset Verification Script"
echo "========================================"
echo ""

# Create temp file for assets
ASSETS_FILE=$(mktemp)

# Find all image references from HTML files
echo "Scanning HTML files for image references..."
find "$SITE_DIR" -name "*.html" -exec grep -oE 'src="[^"]+"' {} \; 2>/dev/null | \
  sed 's/src="//;s/"$//' | \
  sort -u > "$ASSETS_FILE"

# Also check background-image references
grep -rE "background-image:\s*url\(['\"]?[^'\")]+['\"]?\)" "$SITE_DIR" --include="*.html" --include="*.css" 2>/dev/null | \
  grep -oE "url\(['\"]?[^'\")]+['\"]?\)" | \
  sed "s/url(//;s/)//;s/'//g;s/\"//g" | \
  sort -u >> "$ASSETS_FILE"

# Get unique assets
sort -u "$ASSETS_FILE" -o "$ASSETS_FILE"

echo "Checking assets..."
echo ""

# Check each asset
while read -r asset; do
  # Skip empty lines
  [ -z "$asset" ] && continue
  
  ((TOTAL++))
  
  # Skip external URLs (just warn)
  if [[ "$asset" == http* ]] || [[ "$asset" == //* ]]; then
    echo -e "${YELLOW}WARN: External URL (not checked): $asset${NC}"
    ((WARNINGS++))
    continue
  fi
  
  # Skip data URIs
  if [[ "$asset" == data:* ]]; then
    continue
  fi
  
  # Normalize path (remove leading slash if present)
  asset="${asset#/}"
  
  # Check if file exists
  if [ ! -f "$SITE_DIR/$asset" ]; then
    echo -e "${RED}MISSING: $asset${NC}"
    ((ERRORS++))
  elif [ ! -s "$SITE_DIR/$asset" ]; then
    echo -e "${RED}EMPTY: $asset${NC}"
    ((ERRORS++))
  fi
done < "$ASSETS_FILE"

# Cleanup
rm -f "$ASSETS_FILE"

echo ""
echo "========================================"
echo "Verification Complete"
echo "========================================"
echo "Total references found: $TOTAL"
echo "External URLs (warned): $WARNINGS"
echo "Missing/Empty files:    $ERRORS"
echo ""

if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}All local assets verified successfully!${NC}"
  exit 0
else
  echo -e "${RED}Found $ERRORS asset issues.${NC}"
  exit 1
fi
