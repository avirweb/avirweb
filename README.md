# Static Website Mirror → Cloudflare Pages

This repo mirrors a public website into `site/` and deploys that static output on Cloudflare Pages (no app runtime).

## What this is

A static snapshot of upstream HTML/CSS/JS/assets. It is intended for simple, cacheable content without server-side logic.

## Limitations (Scenario B mirror)

- SPAs/SSR apps may not mirror correctly (client-side routes, API calls, auth).
- Personalized/dynamic content will not be captured reliably.
- Absolute links and canonical URLs may still point to the origin.
- You must have rights to mirror and rehost the content.

## Mirror a site

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

Output goes to `site/`.

See [docs/MIRRORING.md](docs/MIRRORING.md) for detailed mirroring documentation.

## Serve locally

```bash
./scripts/serve.sh
```

Smoke test:

```bash
./scripts/smoke.sh
```

## Playwright browser dependencies

Playwright's `install-deps` helper only supports `apt-get`, `dnf`, and `yum`, so it fails on distributions such as Arch Linux (the builder VM here). Instead run:

```bash
sudo ./scripts/install-playwright-deps.sh
```

The script detects the available package manager (`apt-get`, `dnf`, `yum`, or `pacman`) and installs the libraries Chromium needs. After the dependencies are in place you can run `npx playwright install` (and `npx playwright install-deps chromium` if you still want to run the Playwright helper) without shared-library errors.

## Cloudflare Pages settings

- Production branch: `main`
- Build command: `exit 0`
- Publish directory: `site`

## Custom domains

Attach the domain in Pages first, then update DNS per Cloudflare instructions (CNAME to `*.pages.dev` for subdomains; apex usually requires Cloudflare nameservers).

## Redirects and headers

Place in the publish root:

- `site/_redirects`
- `site/_headers`

Note: `_redirects`/`_headers` apply to static assets only, not Pages Functions.

## Deployment Pipeline

The deployment process includes an integrated validation pipeline that runs automatically before any commit is pushed to GitHub. This ensures that only validated, secure content is deployed.

### Pre-Deploy Validation Stages

When you run `./scripts/commit-and-push.sh`, the following validation stages execute in sequence:

| Stage | Script | Purpose | Failure Behavior |
|-------|--------|---------|------------------|
| 1 | Built-in | Basic directory validation | **Blocking** - Exits immediately |
| 2 | `validate-site.sh` | Site structure validation | **Blocking** - Must pass |
| 3 | `verify-assets.sh` | Asset verification | **Non-blocking** - Warns only |
| 4 | `validate-security.sh` | Security validation | **Blocking** - Must pass |
| 5 | Built-in | Sensitive file detection | **Blocking** - Must pass |
| 6 | Built-in | Large file check (>10MB) | **Non-blocking** - Warns only |

### Validation Scripts

Run individual validation scripts for detailed reports:

```bash
# Full site validation (HTML structure, broken links, etc.)
./scripts/validate-site.sh

# Asset verification (checks all referenced images exist)
./scripts/verify-assets.sh

# Security validation (checks for secrets, credentials)
./scripts/validate-security.sh
```

### Deploy to Production

```bash
./scripts/commit-and-push.sh
```

This script will:
1. Run all validation stages
2. Fail fast if any blocking check fails
3. Create a commit with timestamp
4. Push to GitHub
5. Trigger Cloudflare Pages auto-deploy

### Pipeline Exit Codes

- `0` - Validation passed, commit and push successful
- `1` - Validation failed or push failed (see output for details)

## Committing mirrored output

Pros:

- Deterministic deploys (Pages publishes what you reviewed).
- No dependency on upstream during deploy.
- Easy rollback with `git revert`.
- Integrated validation pipeline prevents bad deploys.

Cons:

- Repo history grows quickly.
- Large binary assets can bloat the repo.

Default recommendation: **commit `site/`** for predictable deployments. If repo growth becomes a problem, move mirrors to a separate repo or generate in CI and ignore `site/` locally.

## Mirror-Deploy-Test Pipeline

Run the complete pipeline (mirror → fix → validate → deploy → test) with a single command:

```bash
./scripts/mirror-deploy-test.sh
```

This orchestrates all stages:
1. **Mirror** - Downloads the AVIR website
2. **Fix** - Repairs image paths and references
3. **Validate** - Runs site structure and security checks
4. **Deploy** - Pushes to Cloudflare Pages
5. **Test** - Runs E2E Playwright tests

### Pipeline Results

The script generates:
- Console output with color-coded status
- Log file: `logs/mirror-deploy-YYYYMMDD-HHMMSS.log`
- JSON report: `test-results/unified-report.json`
- HTML report: `test-results/unified-report.html`

### Exit Codes

- `0` - All stages completed successfully
- `1` - One or more stages failed

### Example Output

```
========================================
  AVIR Mirror + Fix + Validate Pipeline
========================================
Started: Wed Feb 4 12:00:00 UTC 2026
Log file: logs/mirror-deploy-20260204-120000.log

[STAGE 1] Mirror Site
----------------------------------------
[INFO] Stage 1 completed in 45s

[STAGE 2] Fix Images
----------------------------------------
[INFO] Stage 2 completed in 2s

...

========================================
  Pipeline Summary
========================================
✅ All stages completed successfully!
Site is ready for deployment.
```

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed deployment documentation.

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Mirror fails with SSL errors | The script uses `--no-check-certificate` by default |
| Images not loading | Run `python3 scripts/fix-all-images.py` |
| Validation warnings | Check `logs/validation-report-*.txt` for details |
| Deployment fails | Ensure `wrangler` is authenticated: `wrangler login` |
| E2E tests timeout | Check deploy URL is accessible |

### Debug Commands

```bash
# Check site structure
./scripts/validate-site.sh

# Verify all assets
./scripts/verify-assets.sh

# Run security scan
./scripts/validate-security.sh

# Serve locally for manual testing
./scripts/serve.sh
```

### Getting Help

1. Check the log files in `logs/` directory
2. Review [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)
3. Check [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for deployment-specific issues

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
./scripts/fix-all-images.py
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
