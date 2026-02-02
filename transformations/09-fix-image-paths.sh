#!/bin/bash
# Fix image paths to be relative

for file in site/**/*.html; do
    if [[ -f "$file" ]]; then
        # Convert absolute image paths to relative
        sed -i 's|https://cdn\.prod\.website-files\.com/|/cdn/|g' "$file"
        sed -i 's|src="https://www\.avir\.com/images/|src="/images/|g' "$file"
        sed -i 's|src="/images/|src="/images/|g' "$file"
        
        # Fix background image paths
        sed -i 's|background-image: url(https://cdn\.prod\.website-files\.com/|background-image: url(/cdn/|g' "$file"
    fi
done

echo "✓ Fixed image paths"
