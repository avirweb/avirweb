#!/bin/bash
# Commit and push site/ to GitHub for auto-deploy

set -e

# Singleton check
LOCKFILE="/tmp/github-push.lock"
if [[ -f "$LOCKFILE" ]]; then
    echo "Error: Another push is already in progress"
    exit 1
fi
echo "$(date)" > "$LOCKFILE"
trap "rm -f $LOCKFILE" EXIT

source scripts/lib/credentials.sh

echo "========================================"
echo "  Commit and Push to GitHub"
echo "========================================"
echo ""

# Commit validation
echo "Running commit validation..."
SITE_DIR="../site"
if [[ ! -d "$SITE_DIR" ]]; then
    echo "Error: site/ directory not found"
    exit 1
fi

# Check for changes
cd "$SITE_DIR"
if git diff-index --quiet HEAD --; then
    echo "No changes to commit"
    exit 0
fi

echo "✓ Found changes to commit"

# Configure git
GIT_USERNAME=$(get_github_username) || exit 1
GIT_EMAIL=$(get_github_email) || exit 1

git config user.name "$GIT_USERNAME"
git config user.email "$GIT_EMAIL"

# Add and commit changes
echo "Adding files..."
git add .

echo "Creating commit..."
COMMIT_MESSAGE="Update mirror - $(date '+%Y-%m-%d %H:%M:%S')"
git commit -m "$COMMIT_MESSAGE" || {
    echo "Nothing to commit"
    exit 0
}

echo "✓ Committed changes"

# Push to GitHub
echo "Pushing to GitHub..."
git push origin main || {
    echo "Error: Push failed"
    exit 1
}

echo ""
echo "========================================"
echo "  Push complete!"
echo "========================================"
echo ""
echo "GitHub will trigger auto-deploy to Cloudflare Pages"
echo ""
