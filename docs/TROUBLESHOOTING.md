# AVIR Mirror System - Comprehensive Troubleshooting Guide

Complete troubleshooting guide for the AVIR website mirroring, validation, and deployment system.

## Table of Contents

- [Quick Fixes](#quick-fixes)
- [Mirror Issues](#mirror-issues)
- [Validation Issues](#validation-issues)
- [Deployment Issues](#deployment-issues)
- [Test Issues](#test-issues)
- [Common Error Messages](#common-error-messages)
- [Debug Commands](#debug-commands)
- [Manual Recovery Procedures](#manual-recovery-procedures)
- [Getting Help](#getting-help)

---

## Quick Fixes

### Credential Errors

```bash
# Re-run credential setup
bash scripts/setup-credentials.sh

# Verify wrangler authentication
wrangler whoami

# Re-authenticate if needed
wrangler login
```

### Images Not Loading

```bash
# Fix image paths
python3 scripts/fix-all-images.py

# Verify assets
./scripts/verify-assets.sh

# Check for empty src attributes
grep -r 'src=""' site/ --include="*.html"

# Fix CDN assets specifically
python3 scripts/fix-cdn-assets.py
```

### Stale Lock Files

```bash
# Remove deployment lock file
rm -f /tmp/cloudflare-deploy.lock

# Remove other temporary files
rm -f .sisyphus/DEPLOY_URL
rm -f .sisyphus/LAST_DEPLOY

# Clear any test artifacts
rm -rf test-results/*
```

---

## Mirror Issues

### Mirror Fails Mid-Download

**Symptoms:**
- wget exits with error code
- Partial site/ directory
- Network timeout errors

**Solutions:**

```bash
# Resume with clean slate
rm -rf site/
./scripts/mirror-avir.sh

# Check network connectivity
ping www.avir.com

# Check disk space
df -h

# Manual mirror with extra flags
wget --mirror --convert-links --adjust-extension --page-requisites \
     --no-parent --no-check-certificate --timeout=30 --tries=3 \
     --waitretry=5 --reject=mp4,webm,mov,avi,mkv \
     -P site/ https://www.avir.com/
```

### Playwright Mirror Issues

**Symptoms:**
- Playwright mirror fails to start
- Browser not found errors
- Timeout during page navigation

**Solutions:**

```bash
# Install/update Playwright browsers
npx playwright install chromium
npx playwright install firefox
npx playwright install webkit

# Install system dependencies (if missing)
sudo ./scripts/install-playwright-deps.sh

# Run with specific browser
node scripts/mirror-playwright.js --browser chromium

# Dry run to test without downloading
node scripts/mirror-playwright.js --dry-run

# Limit pages for faster testing
node scripts/mirror-playwright.js --limit 5
```

### SSL Certificate Errors

**Symptoms:**
- "Unable to locally verify the issuer's authority"
- Certificate verification failed

**Solution:**

All mirror scripts already use `--no-check-certificate` or equivalent. If still failing:

```bash
# Update system certificates
sudo update-ca-certificates  # Debian/Ubuntu
sudo pacman -S ca-certificates  # Arch

# Or use HTTP instead (not recommended for production)
wget --no-check-certificate ...
```

### Missing Assets

**Symptoms:**
- Images not downloaded
- CSS files missing
- JavaScript not working

**Solutions:**

```bash
# Check what was downloaded
ls -la site/
ls -la site/images/ 2>/dev/null || echo "No images directory"

# Re-download specific assets
python3 scripts/download-webflow-images.sh
node scripts/download-webflow-assets.js

# Verify asset references
grep -r "cdn.prod.website-files.com" site/ --include="*.html"

# Check for Webflow CDN references
find site -name "*.html" -exec grep -l "website-files.com" {} \;
```

---

## Validation Issues

### Site Structure Validation Fails

**Symptoms:**
- "index.html not found"
- "Critical pages missing"
- "Empty src attributes detected"

**Solutions:**

```bash
# Check critical files exist
ls -la site/index.html
ls -la site/contact/ site/services/ site/about/ 2>/dev/null

# Fix empty src attributes
python3 scripts/fix-all-images.py

# Check HTML structure
find site -name "*.html" | head -5 | xargs head -5

# Run comprehensive validation
node scripts/comprehensive-validation.js

# Check specific validation
./scripts/validate-site.sh --verbose
```

### Security Validation Fails

**Symptoms:**
- "Potential secrets found"
- "Suspicious patterns detected"
- "Hardcoded credentials"

**Solutions:**

```bash
# Check what triggered the failure
cat logs/validation-report-*.txt 2>/dev/null || echo "No report found"

# Review flagged files manually
grep -r "password\|secret\|token\|api_key" site/ --include="*.html" -i

# Run security validation with details
./scripts/validate-security.sh --verbose

# Check for false positives
./scripts/validate-security.sh --no-secrets-check
```

### Asset Verification Warnings

**Symptoms:**
- "Missing assets detected"
- "Broken image references"
- "Orphaned files"

**Solutions:**

```bash
# Run asset verification with details
./scripts/verify-assets.sh

# Check for broken image references
grep -r 'src=""' site/ --include="*.html"
grep -r 'src="[^"]*"' site/ --include="*.html" | grep -v '\.[a-z]*"'

# Fix images
python3 scripts/fix-all-images.py

# Run enhanced link check
node scripts/check-links-enhanced.js
```

---

## Deployment Issues

### Wrangler Not Found

**Symptoms:**
- "command not found: wrangler"
- "wrangler not installed"

**Solutions:**

```bash
# Install wrangler globally
npm install -g wrangler

# Or use npx
npx wrangler --version

# Verify installation
which wrangler
wrangler --version

# If using nvm, ensure it's in PATH
export PATH="$PATH:$(npm bin -g)"
```

### Authentication Errors

**Symptoms:**
- "Not authenticated"
- "Invalid API token"
- "Unauthorized"

**Solutions:**

```bash
# Login to Cloudflare
wrangler login

# Check current auth status
wrangler whoami

# Configure API token manually
export CLOUDFLARE_API_TOKEN="your-token-here"
export CLOUDFLARE_ACCOUNT_ID="your-account-id"

# Verify token works
wrangler pages project list
```

### Deployment Fails

**Symptoms:**
- "Deployment failed"
- "Upload error"
- "Project not found"

**Solutions:**

```bash
# Verify project exists
wrangler pages project list

# Check project name is correct
wrangler pages deployment list --project-name=avirwebtest

# Deploy with verbose output
wrangler pages deploy site --project-name=avirwebtest --branch=main --verbose

# Deploy without validation (use with caution)
wrangler pages deploy site --project-name=avirwebtest --skip-caching
```

### Deployment Timeout

**Symptoms:**
- "Deployment timed out"
- Long upload times
- Connection errors

**Solutions:**

```bash
# Check file sizes
find site -type f -size +10M

# Remove unnecessary large files
find site -name "*.mp4" -o -name "*.webm" -delete

# Deploy in smaller chunks
# Or use the deployment script with retry
./scripts/deploy-to-cloudflare.sh
```

---

## Test Issues

### E2E Tests Timeout

**Symptoms:**
- "Test timeout"
- "Page not accessible"
- "Navigation failed"

**Solutions:**

```bash
# Check deploy URL is accessible
curl -I https://your-site.pages.dev

# Wait for propagation
echo "Waiting for deployment..."
sleep 60

# Run tests with longer timeout
cd e2e
npx playwright test --timeout=120000

# Run specific test file
npx playwright test tests/basic.spec.js

# Run with debug mode
npx playwright test --debug
```

### Playwright Not Found

**Symptoms:**
- "npx not found"
- "playwright not installed"
- "Browsers not installed"

**Solutions:**

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium

# Verify installation
npx playwright --version
npx playwright chromium --version

# Check browsers are installed
ls -la ~/ms-playwright/
```

### Visual Test Failures

**Symptoms:**
- "Visual differences exceed threshold"
- "Screenshot comparison failed"
- "Baseline differences"

**Solutions:**

```bash
# Update baselines (if changes are expected)
cd e2e
npx playwright test --update-snapshots

# Check visual differences
cat test-results/unified-report.html

# Review screenshots
ls -la test-results/

# Run visual tests only
npx playwright test tests/visual.spec.js

# Generate visual report
node e2e/generate-visual-report.js
```

### Test Interpretation Guide

**Understanding Test Failures:**

| Test Output | Meaning | Action |
|-------------|---------|--------|
| `expect(received).toBe(expected)` | Assertion failed | Check the values shown in error |
| `Timeout of 30000ms exceeded` | Page took too long to load | Check network, increase timeout |
| `page.goto: net::ERR_CONNECTION_REFUSED` | Site not accessible | Check if deployed, verify URL |
| `locator.click: Target closed` | Page crashed during test | Check console errors, try again |
| `snapshot comparison failed` | Visual differences detected | Review diff images, update if intentional |

**Common Test Failure Patterns:**

```bash
# Test can't find element
# Cause: Selector changed or element not loaded
# Fix: Update selector or add wait

# Test times out on navigation
# Cause: Site slow or not deployed
# Fix: Check deployment, increase timeout

# Screenshot comparison fails
# Cause: Visual changes or flakiness
# Fix: Review diff, update baseline if expected

# Console errors detected
# Cause: JavaScript errors on page
# Fix: Check browser console, fix scripts
```

---

## Common Error Messages

### "site/ directory not found"

**Cause:** Mirror hasn't been run.

**Fix:**
```bash
./scripts/mirror-avir.sh
# OR
node scripts/mirror-playwright.js
```

### "Script not found"

**Cause:** Running from wrong directory or script doesn't exist.

**Fix:**
```bash
# Ensure you're in project root
cd /home/agent/avir

# Check script exists
ls -la scripts/
```

### "Permission denied"

**Cause:** Script not executable.

**Fix:**
```bash
chmod +x scripts/*.sh
```

### "Python module not found"

**Cause:** Missing Python dependencies.

**Fix:**
```bash
# Install beautifulsoup4
pip3 install beautifulsoup4 lxml

# Or use system package manager
sudo pacman -S python-beautifulsoup4  # Arch
sudo apt-get install python3-bs4       # Debian/Ubuntu
```

### "Lock file exists"

**Cause:** Previous deployment didn't clean up.

**Fix:**
```bash
rm -f /tmp/cloudflare-deploy.lock
```

### "Node.js version mismatch"

**Cause:** Node.js version too old or incompatible.

**Fix:**
```bash
# Check current version
node --version  # Should be 18+

# Update Node.js
nvm install 20
nvm use 20

# Or use package manager
npx n latest
```

---

## Debug Commands

### Check System State

```bash
# Project structure
ls -la

# Site contents
ls -la site/ 2>/dev/null || echo "site/ not found"

# Git status
git status

# Disk space
df -h

# Memory usage
free -h

# Node.js environment
node --version
npm --version
npx --version

# Python environment
python3 --version
pip3 list | grep -E "beautifulsoup|lxml"
```

### Check Logs

```bash
# Recent pipeline logs
ls -lt logs/ | head -5

# View latest log
tail -100 logs/mirror-deploy-*.log 2>/dev/null | head -50

# Check evidence files
ls -la .sisyphus/evidence/

# View validation reports
cat validation-report-*.txt

# Check deployment history
node scripts/deployment-history.js
```

### Validate Components

```bash
# Check all scripts are executable
ls -la scripts/*.sh | grep -v "x"

# Verify Python environment
python3 --version
python3 -c "import bs4; print('BeautifulSoup OK')"
python3 -c "import lxml; print('lxml OK')"

# Check Node.js
node --version
npm --version

# Verify Playwright
npx playwright --version
npx playwright chromium --version

# Check wrangler
wrangler --version
wrangler whoami
```

### Network Diagnostics

```bash
# Test connectivity
ping -c 3 www.avir.com

# Test Cloudflare API
curl -I https://api.cloudflare.com/client/v4/user/tokens/verify

# Check DNS resolution
nslookup avir.com

# Test HTTPS connection
curl -I https://www.avir.com

# Check SSL certificate
echo | openssl s_client -servername www.avir.com -connect www.avir.com:443 2>/dev/null | openssl x509 -noout -dates
```

### Tool-Specific Debug Commands

#### wget Mirror Debug

```bash
# Verbose wget with debugging
wget --mirror --convert-links --adjust-extension --page-requisites \
     --no-parent --no-check-certificate --verbose \
     -P site/ https://www.avir.com/ 2>&1 | tee debug-wget.log

# Check downloaded URLs
grep "^--" debug-wget.log | head -20

# Check for errors
grep -i "error\|failed\|warning" debug-wget.log
```

#### Playwright Mirror Debug

```bash
# Run with verbose logging
DEBUG=pw:* node scripts/mirror-playwright.js 2>&1 | tee debug-playwright.log

# Run headful (visible browser) for debugging
node scripts/mirror-playwright.js --headful

# Check browser logs
cat logs/playwright-*.log 2>/dev/null
```

#### Validation Debug

```bash
# Run validation with debug output
bash -x ./scripts/validate-site.sh

# Check specific validation step
./scripts/validate-site.sh --check-structure-only

# Run comprehensive validation with trace
node scripts/comprehensive-validation.js --trace
```

#### E2E Test Debug

```bash
# Run with browser visible
npx playwright test --headed

# Run with debug console
npx playwright test --debug

# Show browser logs
DEBUG=pw:browser npx playwright test

# Run with full trace
npx playwright test --trace on

# View trace
npx playwright show-trace test-results/trace.zip
```

---

## Manual Recovery Procedures

### Complete Site Recovery

When the mirror is completely broken and needs full recovery:

```bash
# 1. Backup current state (if anything is salvageable)
tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz site/ 2>/dev/null || echo "No site to backup"

# 2. Clean everything
rm -rf site/
rm -rf mirror-raw/
rm -f logs/*.log

# 3. Fresh mirror
./scripts/mirror-avir.sh

# 4. Fix assets
python3 scripts/fix-all-images.py
python3 scripts/fix-cdn-assets.py

# 5. Validate
./scripts/validate-site.sh
./scripts/validate-security.sh

# 6. Test locally
./scripts/serve.sh &
sleep 2
./scripts/smoke.sh
kill %1
```

### Rollback to Previous Version

```bash
# Use the rollback script
./scripts/rollback.sh

# Or manual rollback
git log --oneline -10
COMMIT_HASH=<commit-to-rollback-to>
git checkout $COMMIT_HASH -- site/
git commit -m "Rollback to $COMMIT_HASH"
./scripts/commit-and-push.sh
```

### Recovery from Deployment Failure

```bash
# 1. Check deployment status
wrangler pages deployment list --project-name=avirwebtest

# 2. Get last successful deployment
LAST_SUCCESS=$(wrangler pages deployment list --project-name=avirwebtest --format=json | jq -r '.[1].id')

# 3. Rollback to that deployment
wrangler pages deployment rollback $LAST_SUCCESS --project-name=avirwebtest

# 4. Verify rollback
curl -I https://your-site.pages.dev
```

### Fixing Broken Image References

```bash
# 1. Find all broken images
grep -r 'src=""' site/ --include="*.html" > broken-images.txt

# 2. Identify missing images
python3 scripts/fix-all-images.py --dry-run

# 3. Re-download specific CDN images
python3 scripts/download-cdn-images.py

# 4. Fix Webflow assets
node scripts/download-webflow-assets.js

# 5. Verify fixes
./scripts/verify-assets.sh
```

### Recovery from Validation Failure

```bash
# 1. Identify which validation failed
./scripts/validate-site.sh 2>&1 | tee validation-output.txt

# 2. Fix specific issues

# If structure validation failed:
python3 scripts/repair-html-heads.py

# If security validation failed:
# Review and manually fix flagged files

# If asset validation failed:
python3 scripts/fix-all-images.py

# 3. Re-run validation
./scripts/validate-site.sh
./scripts/validate-security.sh
```

---

## Getting Help

### Before Asking for Help

1. **Check the logs:**
   ```bash
   tail -n 100 logs/mirror-deploy-*.log
   ```

2. **Run diagnostics:**
   ```bash
   ./scripts/validate-site.sh
   ./scripts/validate-security.sh
   ./scripts/verify-assets.sh
   ```

3. **Check evidence files:**
   ```bash
   cat .sisyphus/evidence/*.txt
   ```

4. **Review system state:**
   ```bash
   node scripts/deployment-history.js
   ```

### Information to Provide

When reporting issues, include:

1. **Error message** (exact text)
2. **Command run** (full command with arguments)
3. **Log output** (relevant section)
4. **System info:**
   ```bash
   uname -a
   cat /etc/os-release
   node --version
   wrangler --version
   ```

5. **Recent changes:**
   ```bash
   git log --oneline -5
   git diff --stat HEAD~1
   ```

### Useful Resources

- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide
- [MIRRORING.md](MIRRORING.md) - Mirroring documentation
- [RUNBOOK.md](RUNBOOK.md) - Operational procedures
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Playwright Docs](https://playwright.dev/)
- [wget Manual](https://www.gnu.org/software/wget/manual/wget.html)

---

## Prevention Checklist

To avoid common issues:

- [ ] Run `./scripts/validate-site.sh` before deploying
- [ ] Run `./scripts/validate-security.sh` to check for secrets
- [ ] Keep `wrangler` authenticated
- [ ] Monitor disk space
- [ ] Regular dependency updates
- [ ] Test locally with `./scripts/serve.sh`
- [ ] Review changes before committing
- [ ] Archive old logs periodically
- [ ] Update baselines when UI changes intentionally
- [ ] Document any manual fixes applied

---

## Emergency Contacts

| Issue Type | Resource |
|------------|----------|
| Cloudflare Issues | [Cloudflare Status](https://www.cloudflarestatus.com/) |
| Playwright Issues | [Playwright Issues](https://github.com/microsoft/playwright/issues) |
| wrangler Issues | [wrangler Docs](https://developers.cloudflare.com/workers/wrangler/) |
| Internal Support | Check project README for team contacts |
