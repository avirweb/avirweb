#!/bin/bash

# TURNSTILE_SITE_KEY should be set in Cloudflare Pages environment
# For testing, you can use: 1x00000000000000000000AA (always passes)
# For production, create a Turnstile widget at: https://dash.cloudflare.com/?to=/:account/turnstile

TURNSTILE_SITE_KEY="1x00000000000000000000AA"

FORM_FILES=(
  "site/careers/assistant-technician.html"
  "site/careers/integration-technician.html"
  "site/commercial-form.html"
  "site/index.html"
  "site/residential-form.html"
  "site/service-request.html"
)

cd /home/agent/avir

echo "Replacing reCAPTCHA with Turnstile..."
echo ""

for file in "${FORM_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file..."
    
    sed -i 's|<script src="https://www.google.com/recaptcha/api.js"[^>]*></script>|<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>|' "$file"
    
    sed -i 's|<div data-theme="dark" data-sitekey="[^"]*" class="w-form-formrecaptcha g-recaptcha[^"]*"></div>|<div class="cf-turnstile" data-sitekey="'"$TURNSTILE_SITE_KEY"'" data-theme="dark"></div>|' "$file"
    
    echo "  ✓ Updated"
  else
    echo "  ✗ Not found: $file"
  fi
done

echo ""
echo "✅ All forms updated with Turnstile!"
echo ""
echo "Note: Using test site key that always passes."
echo "For production, replace with real Turnstile site key from:"
echo "https://dash.cloudflare.com/?to=/:account/turnstile"
