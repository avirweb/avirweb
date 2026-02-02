#!/bin/bash
# Update form submission endpoints

for file in site/**/contact/index.html site/**/*-form/index.html; do
    if [[ -f "$file" ]]; then
        # Update form actions to use correct endpoint
        sed -i 's|action="/submit-form"|action="/api/submit"|g' "$file"
        sed -i 's|action="/forms/submit"|action="/api/submit"|g' "$file"
    fi
done

echo "✓ Updated form endpoints"
