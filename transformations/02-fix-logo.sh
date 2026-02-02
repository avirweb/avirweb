#!/bin/bash
# Fix AVIR logo path

for file in site/**/*.html; do
    if [[ -f "$file" ]]; then
        # Update logo references to use the correct AVIR logo
        sed -i 's|src="/images/dunclyde-logo-white.svg"|src="/images/5e5d861373b92cc146460ff9_Full Logo in white.svg"|g' "$file"
        sed -i 's|src="/images/.*logo.*\.svg"|src="/images/5e5d861373b92cc146460ff9_Full Logo in white.svg"|g' "$file"
    fi
done

echo "✓ Fixed AVIR logo paths"
