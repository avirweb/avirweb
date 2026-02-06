# AVIR Site Mirroring Documentation

## Overview

This document describes the AVIR website mirroring process, including the tools used, the workflow, and best practices.

## What is Mirroring?

Mirroring creates a static snapshot of a live website for hosting on Cloudflare Pages. This allows for:

- **Faster load times** via Cloudflare's CDN
- **Improved reliability** with distributed hosting
- **Version control** of website content
- **Easy rollbacks** via git history

## Mirroring Tools Comparison

| Tool | Best For | Speed | JS Rendering | Complexity |
|------|----------|-------|--------------|------------|
| **wget** | Static HTML sites | Fast | No | Low |
| **Playwright** | Dynamic/SPA sites | Medium | Yes | Medium |
| **HTTrack** | Complete offline copy | Slow | No | Low |
| **crawlee** | Large-scale crawling | Medium | Optional | High |

### Tool Selection Guide

Use **wget** when:
- Site is mostly static HTML/CSS
- No JavaScript rendering required
- Fast download needed
- Simple setup preferred

Use **Playwright** when:
- Site uses JavaScript frameworks (React, Vue, etc.)
- Content loads dynamically
- Need to capture lazy-loaded images
- Webflow sites with animations

Use **HTTrack** when:
- Need complete offline browsing copy
- Can accept slower download speeds
- GUI interface preferred

## Mirroring Tools

### Primary: wget-based (`mirror-avir.sh`)

The main mirroring script uses `wget` with robust retry logic:

```bash
./scripts/mirror-avir.sh
```

**Features:**
- Mirror mode with link conversion
- 3 retry attempts with 5-second delays
- 30-second timeout per request
- Progress reporting
- Video file exclusion (*.mp4, *.webm, *.mov, *.avi, *.mkv)
- SSL certificate bypass (for compatibility)
- Multi-domain support (avir.com + CDN domains)

**Configuration Options:**

```bash
# Clean mirror (remove existing site first)
./scripts/mirror-avir.sh --clean

# Mirror with custom output directory
SITE_URL="https://example.com" OUTPUT_DIR="custom-site" ./scripts/mirror-avir.sh

# Manual wget with custom options
wget --mirror --convert-links --adjust-extension --page-requisites \
     --no-parent --no-check-certificate --timeout=60 --tries=5 \
     --waitretry=10 --reject=mp4,webm,mov,avi,mkv \
     -P site/ https://www.avir.com/
```

### Advanced: Playwright Mirror (`mirror-playwright.js`)

For JavaScript-heavy sites requiring browser rendering:

```bash
# Full mirror with Playwright
node scripts/mirror-playwright.js

# Show crawl plan only (dry run)
node scripts/mirror-playwright.js --dry-run

# Use specific browser
node scripts/mirror-playwright.js --browser firefox
node scripts/mirror-playwright.js --browser webkit

# Limit number of pages
node scripts/mirror-playwright.js --limit 10

# Run with visible browser (for debugging)
node scripts/mirror-playwright.js --headful
```

**Playwright Mirror Features:**
- Multi-browser support (Chromium, Firefox, WebKit)
- Network request interception for assets
- Lazy loading trigger via scrolling
- Webflow hydration waiting
- Capture of 30+ predefined pages
- Asset download and organization
- HTML post-processing for URL rewriting

**Configuration (in script):**

```javascript
// Key configuration options in mirror-playwright.js
const CONFIG = {
  BASE_URL: 'https://www.avir.com',
  OUTPUT_DIR: path.join(__dirname, '..', 'site'),
  DEFAULT_BROWSER: 'chromium',
  HEADLESS: true,
  VIEWPORT: { width: 1920, height: 1080 },
  PAGE_TIMEOUT: 60000,
  NAVIGATION_TIMEOUT: 60000,
  HYDRATION_WAIT: 5000,
  CONCURRENT_LIMIT: 3,
  MAX_RETRIES: 3
};
```

### Alternative: Crawlee-based (`crawler-enhanced.js`)

For advanced crawling scenarios:

```bash
# Basic crawl
node scripts/crawler-enhanced.js

# Crawl with asset download
node scripts/crawler-enhanced.js --download-assets

# Crawl specific depth
node scripts/crawler-enhanced.js --max-depth 3
```

**Crawlee Features:**
- Configurable crawl depth
- Parallel request handling
- Automatic retry with backoff
- robots.txt respect
- Sitemap generation

### Mirror Manager (`mirror-manager.js`)

For more complex operations:

```bash
node scripts/mirror-manager.js [command] [options]
```

**Commands:**
- `mirror` - Full site mirror with asset download
- `validate` - Validate mirrored site
- `deploy` - Deploy to Cloudflare Pages
- `status` - Check mirror status
- `clean` - Clean up temporary files

## Mirroring Workflow

### 1. Initial Setup

```bash
# Ensure dependencies are installed
which wget  # Should return path
which node  # Should return path

# Install Playwright (if using)
npm install
npx playwright install chromium

# Create necessary directories
mkdir -p site docs scripts logs
```

### 2. Run the Mirror

**Option A: wget (recommended for AVIR)**

```bash
# Basic mirror
./scripts/mirror-avir.sh

# The script will:
# - Download all HTML, CSS, JS, and images
# - Convert links for local viewing
# - Save to site/ directory
# - Create a log file
```

**Option B: Playwright (for JS-heavy sites)**

```bash
# Full Playwright mirror
node scripts/mirror-playwright.js

# With options
node scripts/mirror-playwright.js --browser chromium --limit 50
```

### 3. Post-Mirror Processing

After mirroring, several fixup scripts may be needed:

```bash
# Fix image paths and references
python3 scripts/fix-all-images.py

# Fix CDN assets
python3 scripts/fix-cdn-assets.py

# Add canonical tags for SEO
node scripts/add-canonical-tags.js

# Verify and repair HTML structure
python3 scripts/repair-html-heads.py

# Download missing Webflow assets
node scripts/download-webflow-assets.js
```

### 4. Validation

Always validate before deploying:

```bash
# Full site validation
./scripts/validate-site.sh

# Security validation
./scripts/validate-security.sh

# Asset verification
./scripts/verify-assets.sh

# Comprehensive validation
node scripts/comprehensive-validation.js
```

### 5. Deployment

```bash
# Commit and push (runs validations automatically)
./scripts/commit-and-push.sh

# Or full pipeline (mirror + fix + validate + deploy + test)
./scripts/mirror-deploy-test.sh
```

## Directory Structure

```
avir/
├── site/                  # Mirrored website content
│   ├── index.html
│   ├── contact/
│   ├── services/
│   └── images/
├── mirror-raw/           # Raw crawler output (if using crawler)
├── scripts/              # Mirroring and utility scripts
│   ├── mirror-avir.sh
│   ├── mirror-playwright.js
│   ├── mirror-manager.js
│   ├── crawler-enhanced.js
│   ├── validate-site.sh
│   └── validate-security.sh
├── docs/                 # Documentation
│   └── MIRRORING.md
├── logs/                 # Mirror and deployment logs
└── .sisyphus/            # Task tracking and evidence
    ├── notepads/
    └── evidence/
```

## Configuration Options

### wget Configuration

The `mirror-avir.sh` script uses these wget options:

| Option | Purpose |
|--------|---------|
| `--mirror` | Turn on options suitable for mirroring |
| `--convert-links` | Convert links for local viewing |
| `--adjust-extension` | Save HTML/CSS with proper extensions |
| `--page-requisites` | Get all images, etc. needed to display HTML page |
| `--no-parent` | Don't ascend to the parent directory |
| `--continue` | Continue getting partially-downloaded files |
| `--tries=3` | Set number of retries to 3 |
| `--timeout=30` | Set the network timeout to 30 seconds |
| `--waitretry=5` | Wait 5 seconds between retries |
| `--user-agent` | Identify as a browser |
| `--reject-regex` | Skip malformed embedded URLs |
| `--no-check-certificate` | Don't check server certificates |

### Playwright Configuration

Configure via command-line flags:

```bash
--browser chromium|firefox|webkit  # Browser to use
--dry-run                          # Show crawl plan only
--headful                          # Show browser window
--limit N                          # Limit to N pages
--output-dir DIR                   # Custom output directory
```

Or modify the CONFIG object in `mirror-playwright.js`:

```javascript
const CONFIG = {
  BASE_URL: 'https://www.avir.com',
  OUTPUT_DIR: path.join(__dirname, '..', 'site'),
  DEFAULT_BROWSER: 'chromium',
  HEADLESS: true,
  VIEWPORT: { width: 1920, height: 1080 },
  PAGE_TIMEOUT: 60000,
  NAVIGATION_TIMEOUT: 60000,
  HYDRATION_WAIT: 5000,         // Wait for Webflow hydration
  SCROLL_DELAY: 500,            // Delay between scroll steps
  SCROLL_STEPS: 10,             // Number of scroll steps
  CONCURRENT_LIMIT: 3,          // Parallel page processing
  MAX_RETRIES: 3,
  MAX_PAGES: Infinity
};
```

## Validation Checklist

Before each deployment, verify:

- [ ] Zero empty `src=""` attributes
- [ ] All HTML files have DOCTYPE
- [ ] Critical pages exist (index, contact, services, about)
- [ ] CSS and JS files present
- [ ] Images directory populated
- [ ] No broken internal links
- [ ] Security scan passes
- [ ] No secrets in HTML
- [ ] Canonical tags present
- [ ] Mobile viewport meta tag present

## Common Issues and Solutions

### Empty src Attributes

**Problem:** Images with `src=""` cause broken image icons.

**Solution:**
```bash
# Check for empty src
find site -name "*.html" -exec grep -l 'src=""' {} \;

# Fix with image repair script
python3 scripts/fix-all-images.py

# Verify fix
./scripts/verify-assets.sh
```

### Missing Assets

**Problem:** Some images or files not downloaded.

**Solution:**
```bash
# Verify assets
./scripts/verify-assets.sh

# Re-download specific assets if needed
node scripts/download-webflow-assets.js

# Download CDN images
python3 scripts/download-cdn-images.py

# Fix CDN assets
python3 scripts/fix-cdn-assets.py
```

### SSL Certificate Errors

**Problem:** wget fails with certificate errors.

**Solution:** All mirror scripts use `--no-check-certificate` for compatibility.

### JavaScript-Heavy Sites

**Problem:** Content not captured because it loads via JavaScript.

**Solution:** Use Playwright mirror instead of wget:

```bash
node scripts/mirror-playwright.js
```

### Large File Downloads

**Problem:** Mirror takes too long due to large video files.

**Solution:** Video files are excluded by default. To customize:

```bash
# Edit mirror-avir.sh and adjust --reject option
--reject=mp4,webm,mov,avi,mkv,pdf,zip

# Or for Playwright, edit SKIP_PATTERNS in mirror-playwright.js
```

## Best Practices

### Pre-Mirror

1. **Check target site accessibility:**
   ```bash
   curl -I https://www.avir.com
   ```

2. **Ensure sufficient disk space:**
   ```bash
   df -h
   ```

3. **Clean up previous mirror (if needed):**
   ```bash
   rm -rf site/
   ```

### During Mirror

1. **Monitor progress:** Check log files for errors
2. **Watch for timeouts:** Increase timeout if network is slow
3. **Check for captchas:** Some sites block automated access

### Post-Mirror

1. **Always validate:**
   ```bash
   ./scripts/validate-site.sh
   ./scripts/validate-security.sh
   ```

2. **Fix assets:**
   ```bash
   python3 scripts/fix-all-images.py
   ```

3. **Test locally:**
   ```bash
   ./scripts/serve.sh
   # Visit http://localhost:8788
   ```

### Deployment

1. **Review changes:**
   ```bash
   git diff --stat
   ```

2. **Run full pipeline:**
   ```bash
   ./scripts/mirror-deploy-test.sh
   ```

## Troubleshooting

### Mirror Fails Mid-Download

```bash
# Resume partial download
./scripts/mirror-avir.sh

# Check disk space
df -h

# Check network
ping www.avir.com
```

### Validation Warnings

Warnings don't block deployment but should be reviewed:

```bash
# View detailed validation report
cat validation-report-*.txt

# Run comprehensive validation
node scripts/comprehensive-validation.js
```

### Large File Warnings

Files >10MB trigger warnings. Review if these are necessary:

```bash
# Find large files
find site -type f -size +10M

# Remove if not needed
find site -name "*.mp4" -delete
```

## Advanced Topics

### Custom Domains in Mirror

To mirror sites with multiple domains:

```bash
# Edit mirror-avir.sh --domains option
--domains=www.example.com,cdn.example.com,assets.example.com
```

### Selective Page Mirroring

To mirror only specific pages with Playwright:

```javascript
// Edit PREDEFINED_PAGES in mirror-playwright.js
const PREDEFINED_PAGES = [
  '/',
  '/about',
  '/contact'
  // Remove unwanted pages
];
```

### Rate Limiting

If target site blocks requests:

```bash
# Add delays between requests
wget --mirror --wait=1 --random-wait ...

# Or for Playwright, increase delays in CONFIG
SCROLL_DELAY: 1000,
HYDRATION_WAIT: 10000
```

## Related Documentation

- [README.md](../README.md) - General project documentation
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Troubleshooting guide
- [RUNBOOK.md](RUNBOOK.md) - Operational procedures
- `.sisyphus/notepads/` - Task-specific documentation

## Maintenance

### Regular Tasks

- **Weekly:** Review and update mirror if source site changes
- **Monthly:** Check for broken links and missing assets
- **Quarterly:** Review and optimize image sizes

### Updating the Mirror

```bash
# Clean and re-mirror
rm -rf site/
./scripts/mirror-avir.sh
python3 scripts/fix-all-images.py
./scripts/validate-site.sh
./scripts/commit-and-push.sh
```

### Monitoring Mirror Health

```bash
# Check last mirror timestamp
ls -lt site/ | head -1

# Check for recent errors
tail -50 logs/mirror-*.log

# Validate current mirror
./scripts/validate-site.sh
```
