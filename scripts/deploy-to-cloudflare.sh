#!/bin/bash
# Deploy mirror-raw/ to Cloudflare Pages (AVIRWEBTEST)

set -e

SECRETS_DIR="/home/agent/avir/.secrets"
SOURCE_DIR="/home/agent/avir/site"
PROJECT_NAME="AVIRWEBTEST"

# Singleton check
LOCKFILE="/tmp/cloudflare-deploy.lock"
if [[ -f "$LOCKFILE" ]]; then
    echo "Error: Another deployment is already in progress"
    echo "Lockfile: $LOCKFILE"
    exit 1
fi
echo "$(date)" > "$LOCKFILE"
trap "rm -f $LOCKFILE" EXIT

source scripts/lib/credentials.sh

echo "========================================"
echo "  Cloudflare Pages deployment"
echo "========================================"
echo "Project: $PROJECT_NAME"
echo "Source: $SOURCE_DIR"
echo "Target: https://$PROJECT_NAME.pages.dev"
echo ""

# Pre-deploy validation
echo "Running pre-deploy validation..."
if [[ ! -d "$SOURCE_DIR" ]]; then
    echo "Error: site/ directory not found"
    exit 1
fi

if [[ ! -f "$SOURCE_DIR/index.html" ]]; then
    echo "Error: site/index.html not found"
    exit 1
fi

PAGE_COUNT=$(find "$SOURCE_DIR" -name "*.html" | wc -l)
echo "✓ Found $PAGE_COUNT HTML pages"

# Validate index.html is valid
if grep -q '<!DOCTYPE html>' "$SOURCE_DIR/index.html"; then
    echo "✓ index.html has valid DOCTYPE"
else
    echo "Warning: index.html missing DOCTYPE"
fi

# Deploy to Cloudflare Pages
echo ""
echo "Starting deployment..."
TOKEN=$(get_cloudflare_token) || exit 1
ACCOUNT_ID=$(get_cloudflare_account_id) || exit 1

# Export for wrangler
export CLOUDFLARE_API_TOKEN="$TOKEN"
export CLOUDFLARE_ACCOUNT_ID="$ACCOUNT_ID"

# Using Cloudflare Pages API to deploy
# Note: Requires wrangler to be installed
if command -v wrangler &> /dev/null; then
    echo "Deploying with Wrangler..."
    cd "$SOURCE_DIR"
    wrangler pages deploy "$SOURCE_DIR" --project-name="$PROJECT_NAME" --branch=main
else
    echo "Error: wrangler not found. Install with: npm install -g wrangler"
    exit 1
fi

# Post-deploy verification
echo ""
echo "Running post-deployment verification..."
sleep 5

if curl -s -f "https://$PROJECT_NAME.pages.dev" > /dev/null; then
    echo "✓ Deployment accessible at https://$PROJECT_NAME.pages.dev"
else
    echo "Warning: Deployment may not be accessible yet"
fi

echo ""
echo "========================================"
echo "  Deployment complete!"
echo "========================================"
echo ""
echo "URL: https://$PROJECT_NAME.pages.dev"
echo ""
