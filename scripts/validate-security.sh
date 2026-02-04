#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo "========================================"
echo "Security Validation Script"
echo "========================================"

ERRORS=0

# Check 1: .secrets/ directory permissions
echo "Checking .secrets/ directory permissions..."
if [ -d "${PROJECT_ROOT}/.secrets" ]; then
    PERMS=$(stat -c "%a" "${PROJECT_ROOT}/.secrets")
    if [ "$PERMS" != "700" ]; then
        echo "  ❌ FAIL: .secrets/ has permissions $PERMS (expected 700)"
        ERRORS=$((ERRORS + 1))
    else
        echo "  ✅ PASS: .secrets/ has correct permissions (700)"
    fi
    
    # Check credential files
    for file in cloudflare-token turnstile-secret-key github-ssh-key; do
        if [ -f "${PROJECT_ROOT}/.secrets/$file" ]; then
            FILE_PERMS=$(stat -c "%a" "${PROJECT_ROOT}/.secrets/$file")
            if [ "$FILE_PERMS" != "600" ]; then
                echo "  ❌ FAIL: .secrets/$file has permissions $FILE_PERMS (expected 600)"
                ERRORS=$((ERRORS + 1))
            else
                echo "  ✅ PASS: .secrets/$file has correct permissions (600)"
            fi
        fi
    done
else
    echo "  ⚠️  WARN: .secrets/ directory does not exist"
fi

# Check 2: No secret keys in HTML (look for long Turnstile keys)
echo "Checking for secret keys in HTML files..."
if [ -d "${PROJECT_ROOT}/site" ]; then
    # Look for Turnstile secret keys (0x4AAAAAA followed by 50+ chars)
    SECRET_KEY_COUNT=$(grep -rE "0x4AAAAAA[0-9a-zA-Z]{50,}" "${PROJECT_ROOT}/site" --include="*.html" 2>/dev/null | wc -l || echo "0")
    if [ "$SECRET_KEY_COUNT" -gt 0 ]; then
        echo "  ❌ FAIL: Found $SECRET_KEY_COUNT potential Turnstile secret keys in HTML"
        ERRORS=$((ERRORS + 1))
    else
        echo "  ✅ PASS: No Turnstile secret keys found in HTML"
    fi
    
    # Check for other common secret patterns in HTML/JS
    # AWS Access Key IDs
    AWS_KEY_COUNT=$(grep -rE "AKIA[0-9A-Z]{16}" "${PROJECT_ROOT}/site" --include="*.html" --include="*.js" 2>/dev/null | wc -l || echo "0")
    if [ "$AWS_KEY_COUNT" -gt 0 ]; then
        echo "  ❌ FAIL: Found $AWS_KEY_COUNT potential AWS access keys in site files"
        ERRORS=$((ERRORS + 1))
    else
        echo "  ✅ PASS: No AWS access keys found in site files"
    fi
    
    # Private keys
    PRIVATE_KEY_COUNT=$(grep -rE "BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY" "${PROJECT_ROOT}/site" --include="*.html" --include="*.js" --include="*.txt" 2>/dev/null | wc -l || echo "0")
    if [ "$PRIVATE_KEY_COUNT" -gt 0 ]; then
        echo "  ❌ FAIL: Found $PRIVATE_KEY_COUNT private keys in site files"
        ERRORS=$((ERRORS + 1))
    else
        echo "  ✅ PASS: No private keys found in site files"
    fi
    
    # API keys in JS (common patterns)
    API_KEY_COUNT=$(grep -rE "(api[_-]?key|apikey|api[_-]?secret)\s*[:=]\s*[\"'][^\"']{20,}[\"']" "${PROJECT_ROOT}/site" --include="*.js" --include="*.html" 2>/dev/null | wc -l || echo "0")
    if [ "$API_KEY_COUNT" -gt 0 ]; then
        echo "  ❌ FAIL: Found $API_KEY_COUNT potential API keys in site files"
        ERRORS=$((ERRORS + 1))
    else
        echo "  ✅ PASS: No suspicious API key patterns found in site files"
    fi
else
    echo "  ⚠️  WARN: site/ directory does not exist"
fi

# Check 3: Gitleaks scan
echo "Running Gitleaks scan..."
if command -v gitleaks > /dev/null 2>&1; then
    if gitleaks detect --source "${PROJECT_ROOT}" --redact > /dev/null 2>&1; then
        echo "  ✅ PASS: Gitleaks scan completed (no secrets found)"
    else
        echo "  ⚠️  WARN: Gitleaks found potential secrets (check manually)"
    fi
else
    echo "  ⚠️  WARN: Gitleaks not installed"
fi

# Check 4: No credential files in git
echo "Checking git for credential files..."
if git -C "${PROJECT_ROOT}" ls-files 2>/dev/null | grep -qE "\.secrets/|cloudflare-token|turnstile-secret"; then
    echo "  ❌ FAIL: Credential files found in git index"
    ERRORS=$((ERRORS + 1))
else
    echo "  ✅ PASS: No credential files in git"
fi

# Check 5: File permissions on scripts
echo "Checking script file permissions..."
if [ -d "${PROJECT_ROOT}/scripts" ]; then
    # Check for scripts without execute permission
    NON_EXEC_SCRIPTS=$(find "${PROJECT_ROOT}/scripts" -name "*.sh" -type f ! -perm -111 2>/dev/null | wc -l || echo "0")
    if [ "$NON_EXEC_SCRIPTS" -gt 0 ]; then
        echo "  ⚠️  WARN: Found $NON_EXEC_SCRIPTS script(s) without execute permission"
    else
        echo "  ✅ PASS: All scripts have execute permission"
    fi
else
    echo "  ⚠️  WARN: scripts/ directory does not exist"
fi

# Check 6: reCAPTCHA site keys (informational - these are public)
echo "Checking for reCAPTCHA site keys (public keys are OK)..."
if [ -d "${PROJECT_ROOT}/site" ]; then
    RECAPTCHA_COUNT=$(grep -rE "data-sitekey=\"[^\"]{30,50}\"" "${PROJECT_ROOT}/site" --include="*.html" 2>/dev/null | wc -l || echo "0")
    if [ "$RECAPTCHA_COUNT" -gt 0 ]; then
        echo "  ℹ️  INFO: Found $RECAPTCHA_COUNT reCAPTCHA site keys (these are public and OK)"
    else
        echo "  ℹ️  INFO: No reCAPTCHA site keys found"
    fi
fi

echo "========================================"
if [ "$ERRORS" -eq 0 ]; then
    echo "✅ All security checks passed!"
    exit 0
else
    echo "❌ $ERRORS security check(s) failed"
    exit 1
fi
