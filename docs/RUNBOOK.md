# AVIR Pixel-Perfect Replication System - Operational Runbook

**Version:** 1.0  
**Last Updated:** 2025-02-05  
**System:** AVIR Website Replication Pipeline

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Pipeline Stages](#pipeline-stages)
4. [Configuration](#configuration)
5. [Monitoring](#monitoring)
6. [Troubleshooting](#troubleshooting)
7. [Rollback Procedures](#rollback-procedures)
8. [Maintenance](#maintenance)
9. [API Reference](#api-reference)
10. [Emergency Contacts](#emergency-contacts)

---

## Overview

### System Architecture

The AVIR Pixel-Perfect Replication System is a comprehensive pipeline that mirrors the AVIR website (https://www.avir.com) to Cloudflare Pages with pixel-perfect accuracy.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         AVIR REPLICATION PIPELINE                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Stage 1: COPY          Stage 2: UPDATE        Stage 3: VALIDATE        │
│  ┌──────────┐          ┌──────────┐           ┌──────────────┐          │
│  │ Crawler  │─────────▶│ Assets   │──────────▶│   Assets     │          │
│  │          │          │ Manager  │           │   CSS        │          │
│  │ Downloads│          │ Rewrites │           │   Visual     │          │
│  │  Source  │          │   URLs   │           │              │          │
│  └──────────┘          └──────────┘           └──────────────┘          │
│        │                    │                       │                   │
│        ▼                    ▼                       ▼                   │
│   mirror-raw/            site/              test-results/               │
│                                                                          │
│  Stage 4: PUBLISH       Stage 5: DASHBOARD                             │
│  ┌──────────┐          ┌──────────┐                                     │
│  │ Cloudflare│         │ Generate │                                     │
│  │  Pages   │◀─────────│ Dashboard│                                     │
│  │ Deploy   │          │          │                                     │
│  └──────────┘          └──────────┘                                     │
│        │                    │                                           │
│        ▼                    ▼                                           │
│   *.pages.dev         dashboard/index.html                              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Components

| Component | Purpose | Location |
|-----------|---------|----------|
| **crawler-enhanced.js** | Downloads source site with all assets | `scripts/crawler-enhanced.js` |
| **asset-manager.js** | Processes and localizes assets | `scripts/asset-manager.js` |
| **validate-assets.js** | Validates asset integrity | `scripts/validate-assets.js` |
| **validate-css.js** | Compares CSS styles | `scripts/validate-css.js` |
| **validate-visual.js** | Visual regression testing | `scripts/validate-visual.js` |
| **rollback.sh** | Rollback mechanism | `scripts/rollback.sh` |
| **deployment-history.js** | Deployment tracking | `scripts/deployment-history.js` |
| **generate-dashboard.js** | Dashboard generation | `scripts/generate-dashboard.js` |
| **test-pipeline.sh** | End-to-end testing | `scripts/test-pipeline.sh` |

---

## Quick Start

### Prerequisites

- Node.js 20+
- npm
- Playwright
- wrangler (for deployment)
- Git

### Initial Setup

```bash
# 1. Clone the repository
git clone <repository-url>
cd avir

# 2. Install dependencies
npm install

# 3. Install Playwright browsers
npx playwright install chromium

# 4. Set up credentials (if deploying)
export CLOUDFLARE_API_TOKEN="your-token"
export CLOUDFLARE_ACCOUNT_ID="your-account-id"
```

### Run the Pipeline

```bash
# Option 1: Run complete pipeline test
./scripts/test-pipeline.sh

# Option 2: Run individual stages

# Stage 1: Copy source site
node scripts/crawler-enhanced.js

# Stage 2: Update assets
node scripts/asset-manager.js

# Stage 3: Validate
node scripts/validate-assets.js
node scripts/validate-css.js
node scripts/validate-visual.js

# Stage 4: Deploy (requires credentials)
wrangler pages deploy site --project-name=avir-replica-staging

# Stage 5: Generate dashboard
node scripts/generate-dashboard.js
```

### Quick Test Mode

```bash
# Fast test (skips visual regression)
./scripts/test-pipeline.sh --quick

# CI mode (stricter checks, shorter timeouts)
./scripts/test-pipeline.sh --ci
```

---

## Pipeline Stages

### Stage 1: Copy (Crawler)

**Purpose:** Download the source website with all assets

**Script:** `scripts/crawler-enhanced.js`

**What it does:**
- Crawls https://www.avir.com
- Downloads all HTML pages
- Captures all assets (CSS, JS, images, fonts, videos)
- Generates SHA256 hashes for integrity
- Creates multi-viewport screenshots
- Saves to `mirror-raw/`

**Output:**
```
mirror-raw/
├── index.html
├── css/
├── js/
├── images/
├── fonts/
├── videos/
├── cdn/
├── screenshots/
├── crawl-report.json
└── asset-manifest.json
```

**Usage:**
```bash
node scripts/crawler-enhanced.js
```

**Configuration:** Edit `CONFIG` object in the script to customize:
- `BASE_URL`: Source URL
- `OUTPUT_DIR`: Output directory
- `CONCURRENT_LIMIT`: Parallel requests
- `VIEWPORTS`: Screenshot viewports

---

### Stage 2: Update (Asset Manager)

**Purpose:** Process assets and rewrite URLs to local paths

**Script:** `scripts/asset-manager.js`

**What it does:**
- Reads `mirror-raw/asset-manifest.json`
- Copies assets to `site/` directory
- Rewrites external URLs to local paths:
  - `cdn.prod.website-files.com` → `/cdn/`
  - `fonts.googleapis.com` → `/fonts/`
  - `fonts.gstatic.com` → `/fonts/`
  - `use.typekit.net` → `/fonts/`
- Creates `_headers` file for Cloudflare Pages
- Generates updated asset manifest

**Output:**
```
site/
├── index.html
├── css/
├── js/
├── images/
├── fonts/
├── videos/
├── cdn/
├── _headers
└── asset-manifest.json
```

**Usage:**
```bash
node scripts/asset-manager.js
```

---

### Stage 3: Validate

#### 3.1 Asset Integrity Validation

**Script:** `scripts/validate-assets.js`

**Purpose:** Verify all assets load correctly and match SHA256 hashes

**Usage:**
```bash
# Validate local site
node scripts/validate-assets.js --site-dir ./site --output ./test-results/asset-integrity

# Validate deployed site
node scripts/validate-assets.js --url https://avir-replica.pages.dev --output ./test-results/asset-integrity
```

**Output:**
- `integrity.json` - JSON report
- `report.html` - HTML report

#### 3.2 CSS Comparison

**Script:** `scripts/validate-css.js`

**Purpose:** Compare computed CSS styles between source and replica

**Usage:**
```bash
# Compare local replica to source
node scripts/validate-css.js --url file:///path/to/site/index.html --output ./test-results/css-comparison

# Compare deployed site to source
node scripts/validate-css.js --url https://avir-replica.pages.dev --output ./test-results/css-comparison
```

**Output:**
- `comparison.json` - JSON report
- `report.html` - HTML report

#### 3.3 Visual Regression

**Script:** `scripts/validate-visual.js`

**Purpose:** Pixel-perfect comparison using screenshots

**Usage:**
```bash
# Run visual regression tests
node scripts/validate-visual.js --url https://avir-replica.pages.dev --threshold 0.5

# Options:
#   --url <url>          Replica URL to test
#   --threshold <n>      Diff threshold percentage (default: 0.5%)
#   --output <dir>       Output directory
#   --baseline-dir <dir> Baseline directory
```

**Output:**
- `summary.json` - Test summary
- `report.html` - HTML report with image comparisons
- `*-replica.png` - Replica screenshots
- `*-diff.png` - Diff images

---

### Stage 4: Publish

**Purpose:** Deploy to Cloudflare Pages

**Methods:**

#### Manual Deploy
```bash
# Deploy to staging
wrangler pages deploy site --project-name=avir-replica-staging

# Deploy to production
wrangler pages deploy site --project-name=avir-replica-production
```

#### Automated Deploy (CI/CD)
The GitHub Actions workflow handles deployment automatically.

**Deployment History:**
```bash
# List deployments
node scripts/deployment-history.js list

# Get last known-good deployment
node scripts/deployment-history.js get-last-good
```

---

### Stage 5: Dashboard

**Purpose:** Generate unified validation dashboard

**Script:** `scripts/generate-dashboard.js`

**Usage:**
```bash
# Generate dashboard
node scripts/generate-dashboard.js --input ./test-results --output ./test-results/dashboard

# With embedded images (larger file)
node scripts/generate-dashboard.js --embed-images
```

**Output:**
- `test-results/dashboard/index.html` - Unified dashboard

---

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CLOUDFLARE_API_TOKEN` | For deploy | Cloudflare API token |
| `CLOUDFLARE_ACCOUNT_ID` | For deploy | Cloudflare account ID |
| `PROJECT_NAME` | Optional | Cloudflare Pages project name |
| `SOURCE_URL` | Optional | Source URL (default: https://www.avir.com) |

### GitHub Actions Secrets

Required for CI/CD:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

### Configuration Files

#### `package.json`
Dependencies for the pipeline:
```json
{
  "dependencies": {
    "playwright": "^1.58.0",
    "pixelmatch": "^7.1.0",
    "pngjs": "^7.0.0"
  }
}
```

#### `.github/workflows/replicate.yml`
CI/CD workflow configuration with 5 stages:
1. Copy
2. Update
3. Validate (Local)
4. Publish
5. Validate (Live)

---

## Monitoring

### Pipeline Status

Check pipeline execution:
```bash
# View test results
./scripts/test-pipeline.sh

# Check deployment history
node scripts/deployment-history.js list
```

### Dashboard

Open the validation dashboard:
```bash
# Generate and open dashboard
node scripts/generate-dashboard.js
open test-results/dashboard/index.html
```

### Key Metrics

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Asset integrity pass rate | 100% | < 95% |
| CSS match rate | > 90% | < 80% |
| Visual diff threshold | < 0.5% | > 1% |
| Pipeline duration | < 10 min | > 15 min |

### Log Files

| Log | Location | Retention |
|-----|----------|-----------|
| Test logs | `test-results/pipeline-test/*.log` | 7 days |
| Crawl reports | `mirror-raw/crawl-report.json` | Last run |
| Deployment history | `.sisyphus/deployments/history.json` | 5 deployments |

---

## Troubleshooting

### Common Issues

#### Issue: Crawler fails to download assets

**Symptoms:**
- Empty or incomplete `mirror-raw/` directory
- Timeout errors in logs

**Solutions:**
```bash
# 1. Check network connectivity
curl -I https://www.avir.com

# 2. Clear mirror directory and retry
rm -rf mirror-raw/
node scripts/crawler-enhanced.js

# 3. Increase timeout in crawler config
# Edit CONCURRENT_LIMIT and PAGE_TIMEOUT in crawler-enhanced.js
```

#### Issue: Asset validation fails

**Symptoms:**
- Hash mismatches in validation report
- Missing assets

**Solutions:**
```bash
# 1. Re-run asset manager
node scripts/asset-manager.js

# 2. Check asset manifest
node scripts/validate-assets.js --verbose

# 3. Verify file permissions
ls -la site/
```

#### Issue: CSS mismatches

**Symptoms:**
- High mismatch count in CSS comparison
- Visual differences

**Solutions:**
```bash
# 1. Check if fonts loaded correctly
ls -la site/fonts/

# 2. Verify CSS URL rewriting
grep -r "fonts.googleapis.com" site/ || echo "No external font references"

# 3. Re-run asset manager with verbose output
node scripts/asset-manager.js
```

#### Issue: Visual regression failures

**Symptoms:**
- High pixel diff percentage
- Missing baseline images

**Solutions:**
```bash
# 1. Check if baselines exist
ls -la .sisyphus/baselines/

# 2. Capture new baselines
node scripts/capture-baseline.js

# 3. Adjust threshold if needed
node scripts/validate-visual.js --threshold 1.0
```

#### Issue: Deployment fails

**Symptoms:**
- Wrangler authentication errors
- Deployment timeout

**Solutions:**
```bash
# 1. Verify credentials
echo $CLOUDFLARE_API_TOKEN
echo $CLOUDFLARE_ACCOUNT_ID

# 2. Re-authenticate
wrangler login

# 3. Check project exists
wrangler pages project list
```

### Debug Mode

Enable verbose logging:
```bash
# Node.js scripts
DEBUG=* node scripts/crawler-enhanced.js

# Bash scripts
bash -x ./scripts/test-pipeline.sh
```

---

## Rollback Procedures

### Automatic Rollback

The CI/CD pipeline automatically rolls back on validation failure:

1. Live validation fails
2. Pipeline marks deployment as failed
3. Automatic rollback to last known-good deployment
4. GitHub issue created with details

### Manual Rollback

```bash
# Method 1: Using rollback script
./scripts/rollback.sh --auto

# Method 2: Rollback to specific deployment
./scripts/rollback.sh --manual 1

# Method 3: Using deployment history
node scripts/deployment-history.js list
node scripts/deployment-history.js mark-rollback --index 0 --reason "Manual rollback"

# Then deploy specific commit
git checkout <commit-sha> -- site/
wrangler pages deploy site --project-name=avir-replica-staging
```

### Rollback Checklist

- [ ] Identify failed deployment
- [ ] Check deployment history
- [ ] Verify last known-good deployment
- [ ] Execute rollback
- [ ] Verify rollback success
- [ ] Update deployment history
- [ ] Notify team

---

## Maintenance

### Regular Tasks

#### Daily
- Monitor pipeline execution
- Review validation reports
- Check dashboard for issues

#### Weekly
- Update baselines if needed
- Review and cleanup old test results
- Check deployment history

#### Monthly
- Update dependencies
- Review and optimize pipeline
- Update documentation

### Updating Baselines

```bash
# Capture new baselines
node scripts/capture-baseline.js

# Verify baselines captured
ls -la .sisyphus/baselines/
```

### Cleaning Old Data

```bash
# Clean test results older than 7 days
find test-results -type f -mtime +7 -delete

# Clean deployment history
node scripts/deployment-history.js cleanup

# Clean old mirror data
rm -rf mirror-raw/
```

### Dependency Updates

```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Test after update
./scripts/test-pipeline.sh
```

---

## API Reference

### Test Pipeline Script

```bash
./scripts/test-pipeline.sh [options]
```

**Options:**
| Option | Description |
|--------|-------------|
| `--local` | Run in local mode (default) |
| `--ci` | Run in CI mode (stricter checks) |
| `--quick` | Skip long-running tests |
| `--help` | Show help |

**Exit Codes:**
| Code | Meaning |
|------|---------|
| 0 | All tests passed |
| 1 | One or more tests failed |

### Crawler Script

```bash
node scripts/crawler-enhanced.js
```

**Configuration:** Edit `CONFIG` object in script

### Asset Manager

```bash
node scripts/asset-manager.js
```

### Validation Scripts

```bash
# Asset validation
node scripts/validate-assets.js [options]
  --url <url>          Validate remote URL
  --site-dir <dir>     Validate local site
  --output <dir>       Output directory
  --verbose            Verbose output

# CSS validation
node scripts/validate-css.js [options]
  --url <url>          Replica URL
  --output <dir>       Output directory

# Visual regression
node scripts/validate-visual.js [options]
  --url <url>          Replica URL
  --threshold <n>      Diff threshold %
  --output <dir>       Output directory
  --baseline-dir <dir> Baseline directory
```

### Deployment History

```bash
node scripts/deployment-history.js <command> [options]

Commands:
  add --url <url> --commit <sha> --run-id <id> [--validated]
  list
  get-last-good
  get --index <n>
  mark-rollback --index <n> [--reason <reason>]
  cleanup
```

### Rollback Script

```bash
./scripts/rollback.sh [options]

Options:
  --auto [--current-url <url>]   Auto-rollback to last good
  --manual <index>               Rollback to specific index
  --list                         List available deployments
  --help                         Show help
```

---

## Emergency Contacts

### Escalation Path

1. **Primary:** DevOps Team
   - Slack: #devops-alerts
   - Email: devops@example.com

2. **Secondary:** Engineering Lead
   - Slack: @eng-lead
   - Email: eng-lead@example.com

3. **Emergency:** On-Call Engineer
   - PagerDuty: AVIR Replication Pipeline

### Emergency Procedures

#### Pipeline Down
1. Check GitHub Actions status
2. Run `./scripts/test-pipeline.sh --quick` locally
3. If tests pass, trigger manual workflow run
4. If tests fail, check logs and escalate

#### Site Not Updating
1. Check deployment history: `node scripts/deployment-history.js list`
2. Verify last deployment status
3. If failed, execute rollback: `./scripts/rollback.sh --auto`
4. If rollback fails, manual deployment may be needed

#### Critical Security Issue
1. Immediately rollback: `./scripts/rollback.sh --auto`
2. Disable automated pipeline in GitHub Actions
3. Notify security team
4. Investigate and remediate

---

## Appendix

### File Locations

| File | Path |
|------|------|
| Test Pipeline | `scripts/test-pipeline.sh` |
| Crawler | `scripts/crawler-enhanced.js` |
| Asset Manager | `scripts/asset-manager.js` |
| Asset Validator | `scripts/validate-assets.js` |
| CSS Validator | `scripts/validate-css.js` |
| Visual Validator | `scripts/validate-visual.js` |
| Rollback Script | `scripts/rollback.sh` |
| Deployment History | `scripts/deployment-history.js` |
| Dashboard Generator | `scripts/generate-dashboard.js` |
| CI/CD Workflow | `.github/workflows/replicate.yml` |
| Test Report | `.sisyphus/PIPELINE_TEST_REPORT.md` |

### Useful Commands

```bash
# Full pipeline test
./scripts/test-pipeline.sh

# Quick test
./scripts/test-pipeline.sh --quick

# Check all scripts
find scripts -name "*.js" -exec node --check {} \;
find scripts -name "*.sh" -exec bash -n {} \;

# Validate workflow
actionlint .github/workflows/replicate.yml

# Serve site locally
npx serve site/

# Check deployment
wrangler pages deployment list --project-name=avir-replica-staging
```

---

*This runbook is maintained by the DevOps team. Last updated: 2025-02-05*
