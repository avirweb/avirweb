#!/bin/bash
# Install Turnstile captcha on forms

TURNSTILE_SITE_KEY="YOUR_SITE_KEY"

for file in site/**/contact/index.html site/**/*-form/index.html; do
    if [[ -f "$file" ]]; then
        # Add Turnstile div and script before closing </form> tag
        sed -i "s|</form>|<div class=\"cf-turnstile\" data-sitekey=\"$TURNSTILE_SITE_KEY\"></div>\n<script src=\"https://challenges.cloudflare.com/turnstile/v0/api.js\" defer></script>\n</form>|g" "$file"
    fi
done

echo "✓ Installed Turnstile captcha"
