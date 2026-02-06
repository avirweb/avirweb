# Static Website Mirror → Cloudflare Pages

This repo mirrors a public website into `site/` and deploys that static output on Cloudflare Pages (no app runtime).

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Available Tools](#available-tools)
- [Mirror a Site](#mirror-a-site)
- [Testing Commands](#testing-commands)
- [Serve Locally](#serve-locally)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Overview

### What This Is

A static snapshot of upstream HTML/CSS/JS/assets. It is intended for simple, cacheable content without server-side logic.

### Key Features

- **Multiple Mirror Methods**: wget (fast), Playwright (JS-aware), Crawlee (advanced)
- **Automated Validation**: Pre-deploy checks for structure, security, and assets
- **E2E Testing**: Playwright-based testing for deployed sites
- **Visual Regression**: Screenshot comparison testing
- **One-Command Pipeline**: Mirror → Fix → Validate → Deploy → Test

### Limitations (Scenario B Mirror)

- SPAs/SSR apps may not mirror correctly (client-side routes, API calls, auth)
- Personalized/dynamic content will not be captured reliably
- Absolute links and canonical URLs may still point to the origin
- You must have rights to mirror and rehost the content

---

## Quick Start

### Prerequisites

```bash
# Check required tools
which wget node npx git

# Install Node.js dependencies
npm install

# Install Playwright browsers (for testing and Playwright mirror)
npx playwright install chromium

# Set up Cloudflare credentials (for deployment)
./scripts/setup-credentials.sh
# OR manually:
export CLOUDFLARE_API_TOKEN="your-token"
export CLOUDFLARE_ACCOUNT_ID="your-account-id"
```

### One-Command Setup

```bash
# Run everything: mirror, fix, validate, deploy, test
./scripts/mirror-deploy-test.sh
```

### Manual Quick Start

```bash
# 1. Mirror the site
./scripts/mirror-avir.sh

# 2. Fix assets
python3 scripts/fix-all-images.py

# 3. Validate
./scripts/validate-site.sh

# 4. Test locally
./scripts/serve.sh

# 5. Deploy
./scripts/commit-and-push.sh
```

---

## Available Tools

### Mirror Tools

| Tool | Script | Best For | Speed |
|------|--------|----------|-------|
| **wget** | `mirror-avir.sh` | Static sites | Fast |
| **Playwright** | `mirror-playwright.js` | JS-heavy sites | Medium |
| **Crawlee** | `crawler-enhanced.js` | Advanced crawling | Medium |
| **Manager** | `mirror-manager.js` | Orchestration | - |

### Validation Tools

| Tool | Script | Purpose |
|------|--------|---------|
| **Site Validator** | `validate-site.sh` | Structure, links, HTML |
| **Security Scanner** | `validate-security.sh` | Secrets, credentials |
| **Asset Verifier** | `verify-assets.sh` | Images, files |
| **Link Checker** | `check-links-enhanced.js` | Broken links |
| **CSS Validator** | `validate-css.js` | Style comparison |
| **Visual Validator** | `validate-visual.js` | Screenshot comparison |

### Fixup Tools

| Tool | Script | Purpose |
|------|--------|---------|
| **Image Fixer** | `fix-all-images.py` | Repair image paths |
| **CDN Fixer** | `fix-cdn-assets.py` | Fix CDN references |
| **Asset Downloader** | `download-webflow-assets.js` | Download missing assets |
| **HTML Repair** | `repair-html-heads.py` | Fix HTML structure |
| **Canonical Tags** | `add-canonical-tags.js` | Add SEO tags |

### Testing Tools

| Tool | Script | Purpose |
|------|--------|---------|
| **E2E Tests** | `e2e/tests/*.spec.js` | End-to-end testing |
| **Smoke Test** | `smoke.sh` | Quick health check |
| **Test Pipeline** | `test-pipeline.sh` | Full test suite |
| **Visual Tests** | `visual-tests.js` | Visual regression |
| **Functional Tests** | `functional-tests.js` | Feature testing |

### Deployment Tools

| Tool | Script | Purpose |
|------|--------|---------|
| **Deploy** | `deploy-to-cloudflare.sh` | Deploy to Pages |
| **Commit & Push** | `commit-and-push.sh` | Git + deploy |
| **Rollback** | `rollback.sh` | Rollback deployments |
| **History** | `deployment-history.js` | Track deployments |
| **Verify** | `verify-deployment.js` | Post-deploy checks |

### Utility Tools

| Tool | Script | Purpose |
|------|--------|---------|
| **Serve** | `serve.sh` | Local server |
| **Dashboard** | `generate-dashboard.js` | Status dashboard |
| **Benchmark** | `benchmark-performance.js` | Performance testing |

---

## Mirror a Site

### Quick Mirror (AVIR)

```bash
./scripts/mirror-avir.sh
```

This mirrors https://www.avir.com with robust retry logic and progress reporting.

### Mirror Other Sites

```bash
./scripts/mirror.sh https://example.com
```

Optional flags:

```bash
./scripts/mirror.sh --clean https://example.com
./scripts/mirror.sh --extra-domains cdn.example.com,images.examplecdn.com https://example.com
```

### Playwright Mirror (for JS-heavy sites)

```bash
# Full mirror with browser rendering
node scripts/mirror-playwright.js

# Dry run to preview crawl plan
node scripts/mirror-playwright.js --dry-run

# Use specific browser
node scripts/mirror-playwright.js --browser firefox

# Limit pages for testing
node scripts/mirror-playwright.js --limit 5
```

Output goes to `site/`.

See [docs/MIRRORING.md](docs/MIRRORING.md) for detailed mirroring documentation.

---

## Testing Commands

### E2E Testing

```bash
# Run all E2E tests
cd e2e && npx playwright test

# Run specific test file
npx playwright test tests/basic.spec.js
npx playwright test tests/links.spec.js
npx playwright test tests/visual.spec.js

# Run with debug mode
npx playwright test --debug

# Run with visible browser
npx playwright test --headed

# Update visual baselines
npx playwright test --update-snapshots

# Run with specific URL
DEPLOY_URL=https://your-site.pages.dev npx playwright test
```

### Validation Testing

```bash
# Site structure validation
./scripts/validate-site.sh

# Security validation
./scripts/validate-security.sh

# Asset verification
./scripts/verify-assets.sh

# Comprehensive validation
node scripts/comprehensive-validation.js

# Enhanced link checking
node scripts/check-links-enhanced.js
```

### Visual Testing

```bash
# Generate visual comparison
node scripts/validate-visual.js

# Run visual tests
node scripts/visual-tests.js

# Capture baseline screenshots
node scripts/capture-baseline.js
```

### Performance Testing

```bash
# Benchmark site performance
node scripts/benchmark-performance.js

# Compare with production
node scripts/compare-production.js
```

### Smoke Testing

```bash
# Quick health check
./scripts/smoke.sh

# Check specific endpoint
curl -I http://localhost:8788
```

---

## Serve Locally

```bash
./scripts/serve.sh
```

This starts a local server on http://localhost:8788

Smoke test:

```bash
./scripts/smoke.sh
```

---

## Playwright Browser Dependencies

Playwright's `install-deps` helper only supports `apt-get`, `dnf`, and `yum`, so it fails on distributions such as Arch Linux. Instead run:

```bash
sudo ./scripts/install-playwright-deps.sh
```

The script detects the available package manager (`apt-get`, `dnf`, `yum`, or `pacman`) and installs the libraries Chromium needs.

---

## Deployment

### Cloudflare Pages Settings

- Production branch: `main`
- Build command: `exit 0`
- Publish directory: `site`

### Pre-Deploy Validation Stages

When you run `./scripts/commit-and-push.sh`, the following validation stages execute:

| Stage | Script | Purpose | Failure Behavior |
|-------|--------|---------|------------------|
| 1 | Built-in | Directory validation | **Blocking** |
| 2 | `validate-site.sh` | Site structure | **Blocking** |
| 3 | `verify-assets.sh` | Asset verification | **Warning** |
| 4 | `validate-security.sh` | Security scan | **Blocking** |
| 5 | Built-in | Sensitive files | **Blocking** |
| 6 | Built-in | Large files (>10MB) | **Warning** |

### Deploy to Production

```bash
# Full validation + commit + push
./scripts/commit-and-push.sh

# Or manual deployment
wrangler pages deploy site --project-name=avirwebtest --branch=main
```

### Mirror-Deploy-Test Pipeline

Run the complete pipeline with a single command:

```bash
./scripts/mirror-deploy-test.sh
```

This orchestrates all stages:
1. **Mirror** - Downloads the AVIR website
2. **Fix** - Repairs image paths and references
3. **Validate** - Runs site structure and security checks
4. **Deploy** - Pushes to Cloudflare Pages
5. **Test** - Runs E2E Playwright tests

**Pipeline Results:**

- Console output with color-coded status
- Log file: `logs/mirror-deploy-YYYYMMDD-HHMMSS.log`
- JSON report: `test-results/unified-report.json`
- HTML report: `test-results/unified-report.html`

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed deployment documentation.

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Mirror fails with SSL errors | Script uses `--no-check-certificate` by default |
| Images not loading | Run `python3 scripts/fix-all-images.py` |
| Validation warnings | Check `logs/validation-report-*.txt` for details |
| Deployment fails | Ensure `wrangler` is authenticated: `wrangler login` |
| E2E tests timeout | Check deploy URL is accessible |
| Playwright not found | Run `npx playwright install chromium` |
| Permission denied | Run `chmod +x scripts/*.sh` |

### Debug Commands

```bash
# Check site structure
./scripts/validate-site.sh

# Verify all assets
./scripts/verify-assets.sh

# Run security scan
./scripts/validate-security.sh

# Check deployment history
node scripts/deployment-history.js

# View logs
tail -100 logs/mirror-deploy-*.log

# Check system state
node --version
npm --version
wrangler --version
```

### Getting Help

1. Check the log files in `logs/` directory
2. Review [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)
3. Check [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for deployment issues
4. Review [docs/MIRRORING.md](docs/MIRRORING.md) for mirror issues

---

## Usage Examples

### Example 1: Full Pipeline (Recommended)

```bash
# Run everything - mirror, fix, validate, deploy, test
./scripts/mirror-deploy-test.sh
```

### Example 2: Manual Step-by-Step

```bash
# Step 1: Mirror the site
./scripts/mirror-avir.sh

# Step 2: Fix image paths
python3 scripts/fix-all-images.py

# Step 3: Validate
./scripts/validate-site.sh
./scripts/validate-security.sh

# Step 4: Deploy
./scripts/commit-and-push.sh
```

### Example 3: Quick Local Test

```bash
# Mirror and serve locally (no deploy)
./scripts/mirror-avir.sh
./scripts/serve.sh

# In another terminal
./scripts/smoke.sh
```

### Example 4: Update Existing Mirror

```bash
# Clean and re-mirror
rm -rf site/
./scripts/mirror-avir.sh
python3 scripts/fix-all-images.py
./scripts/validate-site.sh
./scripts/commit-and-push.sh
```

### Example 5: Custom Domain Setup

```bash
# 1. Deploy first
./scripts/mirror-deploy-test.sh

# 2. Add domain in Cloudflare Pages dashboard
# 3. Update DNS records as instructed
# 4. Create _redirects file if needed
echo "/old-path /new-path 301" > site/_redirects
```

### Example 6: Playwright Mirror for JS Sites

```bash
# Mirror a JavaScript-heavy site
node scripts/mirror-playwright.js

# Fix assets
python3 scripts/fix-all-images.py

# Validate
./scripts/validate-site.sh

# Deploy
./scripts/commit-and-push.sh
```

### Example 7: Testing Before Deploy

```bash
# Mirror and serve locally
./scripts/mirror-avir.sh
./scripts/serve.sh &

# Run E2E tests against local server
DEPLOY_URL=http://localhost:8788 npx playwright test

# If tests pass, deploy
./scripts/commit-and-push.sh
```

---

## Documentation

- [docs/MIRRORING.md](docs/MIRRORING.md) - Detailed mirroring documentation
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) - Deployment guide
- [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) - Troubleshooting guide
- [docs/RUNBOOK.md](docs/RUNBOOK.md) - Operational runbook
- [SECURITY.md](SECURITY.md) - Security information

---

## Custom Domains

Attach the domain in Pages first, then update DNS per Cloudflare instructions (CNAME to `*.pages.dev` for subdomains; apex usually requires Cloudflare nameservers).

## Redirects and Headers

Place in the publish root:

- `site/_redirects`
- `site/_headers`

Note: `_redirects`/`_headers` apply to static assets only, not Pages Functions.

---

## Committing Mirrored Output

**Pros:**
- Deterministic deploys (Pages publishes what you reviewed)
- No dependency on upstream during deploy
- Easy rollback with `git revert`
- Integrated validation pipeline prevents bad deploys

**Cons:**
- Repo history grows quickly
- Large binary assets can bloat the repo

**Recommendation:** Commit `site/` for predictable deployments. If repo growth becomes a problem, move mirrors to a separate repo or generate in CI.
