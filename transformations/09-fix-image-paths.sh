#!/bin/bash
# Fix image paths to be relative and handle lazy-loading

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SITE_DIR="${SCRIPT_DIR}/../site"

for file in "$SITE_DIR"/**/*.html; do
    if [[ -f "$file" ]]; then
        # Convert absolute image paths to relative
        sed -i 's|https://cdn\.prod\.website-files\.com/|/cdn/|g' "$file"
        sed -i 's|src="https://www\.avir\.com/images/|src="/images/|g' "$file"
        sed -i "s|src='https://www\.avir\.com/images/|src='/images/|g" "$file"
        
        # Fix background image paths
        sed -i 's|background-image: url(https://cdn\.prod\.website-files\.com/|background-image: url(/cdn/|g' "$file"
        sed -i 's|background-image:url(https://cdn\.prod\.website-files\.com/|background-image:url(/cdn/|g' "$file"
        
        # Fix lazy-loading: move data-src to src for images with empty src
        # Pattern: src="" data-src="X" -> src="X" data-src="X"
        sed -i 's|src="" data-src="\([^"]*\)"|src="\1" data-src="\1"|g' "$file"
        sed -i "s|src='' data-src='\([^']*\)'|src='\1' data-src='\1'|g" "$file"
        
        # Fix srcset paths
        sed -i 's|srcset="https://cdn\.prod\.website-files\.com/|srcset="/cdn/|g' "$file"
        sed -i 's|srcset="https://www\.avir\.com/images/|srcset="/images/|g' "$file"
        
        # Fix poster attribute for videos
        sed -i 's|poster="https://cdn\.prod\.website-files\.com/|poster="/cdn/|g' "$file"
        sed -i 's|poster="https://www\.avir\.com/images/|poster="/images/|g' "$file"
    fi
done

echo "✓ Fixed image paths and lazy-loading"
