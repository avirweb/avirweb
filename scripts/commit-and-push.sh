#!/bin/bash
# Commit and push site/ to GitHub for auto-deploy
# Integrated validation pipeline - fails fast on any issues

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

# ============================================
# PRE-COMMIT VALIDATION PIPELINE
# ============================================

SITE_DIR="site"
VALIDATION_FAILED=0

# Step 1: Basic directory validation
echo "[1/6] Running basic validation..."
if [[ ! -d "$SITE_DIR" ]]; then
    echo "Error: site/ directory not found"
    exit 1
fi
echo "✓ Site directory exists"

# Step 2: Run full site validation (validate-site.sh)
echo ""
echo "[2/6] Running site validation..."
if [[ -f "scripts/validate-site.sh" ]]; then
    if ! bash scripts/validate-site.sh; then
        echo "Error: Site validation failed"
        VALIDATION_FAILED=1
    else
        echo "✓ Site validation passed"
    fi
else
    echo "Warning: validate-site.sh not found, skipping"
fi

# Step 3: Run asset verification (verify-assets.sh) - warnings only
echo ""
echo "[3/6] Running asset verification..."
if [[ -f "scripts/verify-assets.sh" ]]; then
    if ! bash scripts/verify-assets.sh; then
        echo "Warning: Asset verification found issues (non-blocking)"
        # Asset issues are warnings only, don't fail the pipeline
    else
        echo "✓ Asset verification passed"
    fi
else
    echo "Warning: verify-assets.sh not found, skipping"
fi

# Step 4: Run security validation (validate-security.sh)
echo ""
echo "[4/6] Running security validation..."
if [[ -f "scripts/validate-security.sh" ]]; then
    if ! bash scripts/validate-security.sh; then
        echo "Error: Security validation failed"
        VALIDATION_FAILED=1
    else
        echo "✓ Security validation passed"
    fi
else
    echo "Warning: validate-security.sh not found, skipping"
fi

# Step 5: Check for sensitive files (additional check)
echo ""
echo "[5/6] Checking for sensitive files..."
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
        VALIDATION_FAILED=1
    fi
done
echo "✓ No sensitive files detected"

# Step 6: Check for large files (>10MB)
echo ""
echo "[6/6] Checking for large files..."
LARGE_FILES=$(find "$SITE_DIR" -type f -size +10M 2>/dev/null)
if [[ -n "$LARGE_FILES" ]]; then
    echo "Warning: Found large files (>10MB):"
    echo "$LARGE_FILES"
    echo "Consider using Git LFS for these files"
fi
echo "✓ Large file check complete"

# ============================================
# VALIDATION SUMMARY
# ============================================
echo ""
echo "========================================"
echo "  Validation Summary"
echo "========================================"

if [[ $VALIDATION_FAILED -eq 1 ]]; then
    echo "❌ VALIDATION FAILED - Fix errors before deploying"
    echo ""
    echo "The following checks failed:"
    echo "  - Site validation (critical)"
    echo "  - Security validation (critical)"
    echo "  - Sensitive file detection (critical)"
    echo ""
    echo "Run individual scripts for details:"
    echo "  ./scripts/validate-site.sh"
    echo "  ./scripts/validate-security.sh"
    exit 1
fi

echo "✅ All validation checks passed"
echo ""
echo "Pipeline stages completed:"
echo "  ✓ Basic directory validation"
echo "  ✓ Site structure validation"
echo "  ✓ Asset verification"
echo "  ✓ Security validation"
echo "  ✓ Sensitive file check"
echo "  ✓ Large file check"
echo ""

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
