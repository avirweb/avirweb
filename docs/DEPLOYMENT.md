# AVIR Deployment Guide

Complete guide for deploying the AVIR website mirror to Cloudflare Pages.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Deployment Methods](#deployment-methods)
- [Pre-Deploy Validation](#pre-deploy-validation)
- [Post-Deploy Verification](#post-deploy-verification)
- [Troubleshooting](#troubleshooting)
- [Rollback Procedures](#rollback-procedures)

## Overview

This guide covers deploying the static AVIR website mirror to Cloudflare Pages. The deployment process includes validation, security checks, and automated testing.

### Deployment Pipeline

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Mirror    │ -> │    Fix      │ -> │  Validate   │ -> │   Deploy    │ -> │    Test     │
│   (wget)    │    │  (images)   │    │(site + sec) │    │(Cloudflare) │    │  (E2E)      │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

## Prerequisites

### Required Tools

```bash
# Verify all tools are installed
which wget      # Mirror tool
which node      # Node.js for scripts
which npx       # Playwright tests
which wrangler  # Cloudflare CLI
which git       # Version control
```

### Cloudflare Authentication

```bash
# Login to Cloudflare (one-time setup)
wrangler login

# Verify authentication
wrangler whoami
```

### Environment Setup

```bash
# Install Playwright browsers
npx playwright install chromium

# Install dependencies (if package.json exists)
npm install
```

## Deployment Methods

### Method 1: Full Pipeline (Recommended)

Run the complete pipeline with a single command:

```bash
./scripts/mirror-deploy-test.sh
```

**What it does:**
1. Mirrors the AVIR website
2. Fixes image paths and references
3. Validates site structure
4. Validates security
5. Deploys to Cloudflare Pages
6. Runs E2E tests

**When to use:**
- Initial deployment
- Full site updates
- Scheduled mirror refreshes

### Method 2: Commit and Push

For deploying already-mirrored content:

```bash
./scripts/commit-and-push.sh
```

**What it does:**
1. Runs all validation stages
2. Creates a git commit with timestamp
3. Pushes to GitHub
4. Triggers Cloudflare Pages auto-deploy

**When to use:**
- After manual site modifications
- When site/ is already prepared
- Quick deployments after fixes

### Method 3: Manual Deployment

Direct deployment using wrangler:

```bash
# Deploy site/ directory directly
wrangler pages deploy site --project-name=avirwebtest --branch=main
```

**When to use:**
- Emergency deployments
- Testing different branches
- Bypassing validation (not recommended)

### Method 4: GitHub Auto-Deploy

Push to GitHub and let Cloudflare Pages auto-deploy:

```bash
git add site/
git commit -m "Update site mirror"
git push origin main
```

**When to use:**
- CI/CD workflows
- Automated deployments
- Team collaboration

## Pre-Deploy Validation

### Validation Stages

The deployment pipeline runs these validation stages:

| Stage | Script | Purpose | Blocking |
|-------|--------|---------|----------|
| 1 | Built-in | Directory validation | Yes |
| 2 | `validate-site.sh` | Site structure | Yes |
| 3 | `verify-assets.sh` | Asset verification | No |
| 4 | `validate-security.sh` | Security scan | Yes |
| 5 | Built-in | Sensitive file detection | Yes |
| 6 | Built-in | Large file check (>10MB) | No |

### Running Validation Manually

```bash
# Full site validation
./scripts/validate-site.sh

# Asset verification
./scripts/verify-assets.sh

# Security validation
./scripts/validate-security.sh
```

### Validation Checklist

Before deploying, verify:

- [ ] `site/` directory exists and is not empty
- [ ] `site/index.html` exists
- [ ] All critical pages present (index, contact, services, about)
- [ ] No empty `src=""` attributes
- [ ] All HTML files have DOCTYPE
- [ ] CSS and JS files present
- [ ] Images directory populated
- [ ] No broken internal links
- [ ] Security scan passes
- [ ] No secrets or credentials in HTML
- [ ] No files >10MB (or justified)

## Post-Deploy Verification

### Check Deployment Status

```bash
# View Cloudflare Pages deployment status
wrangler pages deployment list --project-name=avirwebtest
```

### Run Smoke Tests

```bash
# Test local deployment
./scripts/smoke.sh

# Test deployed URL
DEPLOY_URL="https://your-site.pages.dev" ./scripts/smoke.sh
```

### E2E Testing

```bash
# Run Playwright tests against deployed URL
cd e2e
DEPLOY_URL="https://your-site.pages.dev" npx playwright test
```

### Manual Verification Checklist

- [ ] Homepage loads correctly
- [ ] Navigation works
- [ ] Images display properly
- [ ] Contact page accessible
- [ ] Services page accessible
- [ ] About page accessible
- [ ] No console errors
- [ ] Mobile responsive

## Troubleshooting

### Deployment Failures

#### Issue: "site/ directory not found"

**Cause:** Mirror hasn't been run or directory was deleted.

**Solution:**
```bash
./scripts/mirror-avir.sh
```

#### Issue: "Validation failed"

**Cause:** Site structure or security checks failed.

**Solution:**
```bash
# Check specific validation failures
./scripts/validate-site.sh
./scripts/validate-security.sh

# Fix issues and re-run
python3 scripts/fix-all-images.py
./scripts/validate-site.sh
```

#### Issue: "wrangler not authenticated"

**Cause:** Cloudflare authentication expired or not set up.

**Solution:**
```bash
wrangler login
wrangler whoami  # Verify
```

#### Issue: "E2E tests timeout"

**Cause:** Deployed site not accessible or slow.

**Solution:**
```bash
# Check deploy URL
curl -I https://your-site.pages.dev

# Wait for propagation (can take 1-2 minutes)
sleep 120

# Re-run tests
npx playwright test
```

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `exit 1` in Stage 1 | Mirror failed | Check network, re-run mirror |
| `exit 1` in Stage 2 | Image fix failed | Check Python environment |
| `exit 1` in Stage 3 | Validation failed | Review validation output |
| `exit 1` in Stage 4 | Deploy failed | Check wrangler auth |
| `exit 1` in Stage 5 | Tests failed | Check deploy URL accessibility |

### Log Files

Check these locations for detailed error information:

```bash
# Pipeline logs
logs/mirror-deploy-*.log

# Validation reports
logs/validation-report-*.txt

# Evidence files
.sisyphus/evidence/*.txt

# Test results
test-results/
```

## Rollback Procedures

### Quick Rollback (Git)

```bash
# Find last good commit
git log --oneline -10

# Revert to previous commit
git revert HEAD

# Or reset to specific commit
git reset --hard <commit-hash>

# Push to trigger rollback
git push origin main
```

### Manual Rollback

```bash
# Checkout previous version
git checkout <commit-hash> -- site/

# Validate
./scripts/validate-site.sh

# Deploy
./scripts/commit-and-push.sh
```

### Emergency Rollback

If deployment is broken and needs immediate rollback:

```bash
# Deploy empty site (shows Cloudflare 404)
wrangler pages deploy empty-dir --project-name=avirwebtest --branch=main

# Or deploy from previous commit
git checkout HEAD~1 -- site/
wrangler pages deploy site --project-name=avirwebtest --branch=main
```

## Best Practices

1. **Always validate before deploying** - Never skip validation stages
2. **Test locally first** - Use `./scripts/serve.sh` for local testing
3. **Review changes** - Check `git diff --stat` before committing
4. **Monitor after deploy** - Check Cloudflare Pages dashboard
5. **Keep logs** - Archive logs for troubleshooting
6. **Regular updates** - Schedule periodic mirror refreshes

## Related Documentation

- [README.md](../README.md) - Project overview
- [MIRRORING.md](MIRRORING.md) - Mirroring documentation
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - General troubleshooting
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
