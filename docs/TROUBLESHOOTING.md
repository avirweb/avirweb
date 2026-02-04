# AVIR Mirror System - Troubleshooting Guide

Comprehensive troubleshooting guide for the AVIR website mirroring and deployment system.

## Table of Contents

- [Quick Fixes](#quick-fixes)
- [Mirror Issues](#mirror-issues)
- [Validation Issues](#validation-issues)
- [Deployment Issues](#deployment-issues)
- [Test Issues](#test-issues)
- [Common Error Messages](#common-error-messages)
- [Debug Commands](#debug-commands)
- [Getting Help](#getting-help)

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
```

### Stale Lock Files

```bash
# Remove deployment lock file
rm -f /tmp/cloudflare-deploy.lock

# Remove other temporary files
rm -f .sisyphus/DEPLOY_URL
rm -f .sisyphus/LAST_DEPLOY
```

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
```

### SSL Certificate Errors

**Symptoms:**
- "Unable to locally verify the issuer's authority"
- Certificate verification failed

**Solution:**
The mirror script already uses `--no-check-certificate`. If still failing:

```bash
# Manual mirror with extra flags
wget --mirror --convert-links --adjust-extension --page-requisites \
     --no-parent --no-check-certificate --timeout=30 --tries=3 \
     --waitretry=5 --reject=mp4,webm,mov,avi,mkv \
     -P site/ https://www.avir.com/
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
python3 scripts/download-webflow-images.py

# Verify asset references
grep -r "cdn.prod.website-files.com" site/ --include="*.html"
```

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

# Review flagged files
grep -r "password\|secret\|token\|api_key" site/ --include="*.html" -i

# If false positive, check scripts/validate-security.sh
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
```

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
```

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
```

## Common Error Messages

### "site/ directory not found"

**Cause:** Mirror hasn't been run.

**Fix:**
```bash
./scripts/mirror-avir.sh
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
```

### Check Logs

```bash
# Recent pipeline logs
ls -lt logs/ | head -5

# View latest log
tail -100 logs/mirror-deploy-*.log 2>/dev/null | head -50

# Check evidence files
ls -la .sisyphus/evidence/
```

### Validate Components

```bash
# Check all scripts are executable
ls -la scripts/*.sh | grep -v "x"

# Verify Python environment
python3 --version
python3 -c "import bs4; print('BeautifulSoup OK')"

# Check Node.js
node --version
npm --version
```

### Network Diagnostics

```bash
# Test connectivity
ping -c 3 www.avir.com

# Test Cloudflare API
curl -I https://api.cloudflare.com/client/v4/user/tokens/verify

# Check DNS resolution
nslookup avir.com
```

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
   ```

3. **Check evidence files:**
   ```bash
   cat .sisyphus/evidence/*.txt
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

### Useful Resources

- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide
- [MIRRORING.md](MIRRORING.md) - Mirroring documentation
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Playwright Docs](https://playwright.dev/)
- [wget Manual](https://www.gnu.org/software/wget/manual/wget.html)

## Prevention Checklist

To avoid common issues:

- [ ] Run `./scripts/validate-site.sh` before deploying
- [ ] Keep `wrangler` authenticated
- [ ] Monitor disk space
- [ ] Regular dependency updates
- [ ] Test locally with `./scripts/serve.sh`
- [ ] Review changes before committing
- [ ] Archive old logs periodically
