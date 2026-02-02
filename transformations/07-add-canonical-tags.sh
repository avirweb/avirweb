#!/bin/bash
# Add canonical URLs for SEO

BASE_URL="https://avirwebtest.pages.dev"

for file in site/**/*.html; do
    if [[ -f "$file" ]]; then
        # Extract the page path from file path
        page_path=$(echo "$file" | sed 's|site/||' | sed 's|/index\.html||')
        if [[ "$page_path" == "index.html" ]]; then
            canonical_url="$BASE_URL/"
        else
            canonical_url="$BASE_URL/$page_path/"
        fi
        
        # Add canonical tag if not already present
        if ! grep -q '<link rel="canonical"' "$file"; then
            sed -i "s|<head>|<head>\n  <link rel=\"canonical\" href=\"$canonical_url\">|" "$file"
        fi
    fi
done

echo "✓ Added canonical tags"
