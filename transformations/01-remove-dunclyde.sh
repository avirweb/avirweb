#!/bin/bash
# Remove dunclyde references from site

for file in site/**/*.html; do
    if [[ -f "$file" ]]; then
        # Remove dunclyde links and references
        sed -i 's/dunclyde-logo-white\.svg//g' "$file"
        sed -i '/dunclyde/d' "$file"
    fi
done

echo "✓ Removed dunclyde references"
