#!/bin/bash
# Optimize SEO meta tags

for file in site/**/*.html; do
    if [[ -f "$file" ]]; then
        # Add meta description if missing
        if ! grep -q '<meta name="description"' "$file"; then
            sed -i '/<head>/a \    <meta name="description" content="AVIR brings together the best in home automation, home cinema, and smart home technology for a truly exceptional living experience.">' "$file"
        fi
        
        # Add Open Graph tags if missing
        if ! grep -q '<meta property="og:' "$file"; then
            title=$(grep '<title>' "$file" | sed 's/.*<title>\(.*\)<\/title>.*/\1/')
            sed -i "/<head>/a \\    <meta property=\"og:title\" content=\"$title\">\n    <meta property=\"og:type\" content=\"website\">" "$file"
        fi
    fi
done

echo "✓ Optimized SEO meta tags"
