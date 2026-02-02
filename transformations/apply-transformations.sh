#!/bin/bash
# Apply all transformations to mirrored site

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SITE_DIR="${SCRIPT_DIR%/*}/site"

echo "========================================"
echo "  Applying AVIR Site Transformations"
echo "========================================"
echo "Source: $SITE_DIR"
echo ""

if [[ ! -d "$SITE_DIR" ]]; then
    echo "Error: site directory not found. Run the crawler first."
    exit 1
fi

# Run each transformation in order
for script in "$SCRIPT_DIR"/[0-9][0-9]-*.sh; do
    if [[ -f "$script" ]]; then
        echo "Running: $(basename "$script")"
        bash "$script"
        echo ""
    fi
done

echo "========================================"
echo "  All transformations complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Review changes in site/"
echo "2. Run: scripts/deploy-to-cloudflare.sh"
echo ""
