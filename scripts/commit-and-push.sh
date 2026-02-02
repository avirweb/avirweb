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
SITE_DIR="site"
if [[ ! -d "$SITE_DIR" ]]; then
    echo "Error: site/ directory not found"
    exit 1
fi

# Check for sensitive files
echo "Checking for sensitive files..."
SENSITIVE_PATTERNS=(
    ".env"
    ".secrets"
    "secrets.json"
    "*.pem"
    "*.key"
    "id_rsa"
    ".htpasswd"
)

for pattern in "${SENSITIVE_PATTERNS[@]}"; do
    if find "$SITE_DIR" -name "$pattern" -type f 2>/dev/null | grep -q .; then
        echo "Error: Found sensitive file pattern: $pattern"
        echo "Review these files before committing:"
        find "$SITE_DIR" -name "$pattern" -type f
        exit 1
    fi
done
echo "✓ No sensitive files detected"

# Check for large files (>10MB)
echo "Checking for large files..."
LARGE_FILES=$(find "$SITE_DIR" -type f -size +10M 2>/dev/null)
if [[ -n "$LARGE_FILES" ]]; then
    echo "Warning: Found large files (>10MB):"
    echo "$LARGE_FILES"
    echo "Consider using Git LFS for these files"
fi

# Verify HTML structure
echo "Checking HTML structure..."
if [[ ! -f "$SITE_DIR/index.html" ]]; then
    echo "Error: index.html not found in site directory"
    exit 1
fi

# Check for empty src attributes (critical issue)
echo "Checking for empty image sources..."
EMPTY_SRC_COUNT=$(find "$SITE_DIR" -name "*.html" -exec grep -l 'src=""' {} \; 2>/dev/null | wc -l)
if [[ $EMPTY_SRC_COUNT -gt 0 ]]; then
    echo "Warning: Found $EMPTY_SRC_COUNT files with empty src attributes"
    echo "Run ./scripts/validate-site.sh for details"
fi

# Check for changes
cd "$SITE_DIR"
if git diff-index --quiet HEAD --; then
    echo "No changes to commit"
    exit 0
fi

echo "✓ Found changes to commit"
echo "✓ All validation checks passed"

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
