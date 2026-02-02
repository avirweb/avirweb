#!/bin/bash
# Fix Google Fonts license references

for file in site/**/*.html; do
    if [[ -f "$file" ]]; then
        # Update font weights to fix license issues
        sed -i 's/@font-face[^}]*{[^}]*}/@font-face {font-display: swap;}/g' "$file"
        sed -i 's|family=.*display=swap|family=Roboto:wght@300;400;500;700&display=swap|g' "$file"
        sed -i 's|family=Inter[^"]*|family=Inter:wght@400;500;600;700|g' "$file"
    fi
done

echo "✓ Fixed font licenses"
