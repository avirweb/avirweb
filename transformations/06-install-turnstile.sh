#!/bin/bash
# Install Turnstile captcha on forms

# Load actual credentials
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/../scripts/lib/credentials.sh"
TURNSTILE_SITE_KEY=$(get_turnstile_site_key)

if [[ -z "$TURNSTILE_SITE_KEY" ]] || [[ "$TURNSTILE_SITE_KEY" == "YOUR_SITE_KEY" ]]; then
    echo "Error: Turnstile site key not configured"
    echo "Run: ./scripts/setup-credentials.sh"
    exit 1
fi

echo "Using Turnstile site key: ${TURNSTILE_SITE_KEY:0:10}..."

# Update all forms - expanded pattern matching
# Use find to properly handle glob patterns
SITE_DIR="${SCRIPT_DIR}/../site"

# Find all form files using find instead of glob
mapfile -t FORM_FILES < <(find "$SITE_DIR" -type f -name "index.html" | while read -r file; do
    # Check if file contains a form
    if grep -q "<form" "$file" 2>/dev/null; then
        # Check if it matches any of our patterns
        case "$file" in
            */contact/index.html|\
            *-form/index.html|\
            */careers/*/index.html|\
            */careers/index.html|\
            */service-request/index.html|\
            */old-home/index.html)
                echo "$file"
                ;;
        esac
    fi
done)

if [[ ${#FORM_FILES[@]} -eq 0 ]]; then
    echo "Warning: No form files found"
    exit 0
fi

for file in "${FORM_FILES[@]}"; do
    if [[ -f "$file" ]]; then
        # Check if Turnstile already installed
        if ! grep -q "cf-turnstile" "$file"; then
            # Add Turnstile div and script before closing </form> tag
            sed -i "s|</form>|<div class=\"cf-turnstile\" data-sitekey=\"$TURNSTILE_SITE_KEY\"></div>\n<script src=\"https://challenges.cloudflare.com/turnstile/v0/api.js\" defer></script>\n</form>|g" "$file"
            echo "✓ Installed Turnstile in: $file"
        else
            # Update existing Turnstile with correct key
            sed -i "s|data-sitekey=\"[^\"]*\"|data-sitekey=\"$TURNSTILE_SITE_KEY\"|g" "$file"
            echo "✓ Updated Turnstile key in: $file"
        fi
    fi
done

echo "✓ Turnstile installation complete"
