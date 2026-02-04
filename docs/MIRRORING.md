# AVIR Site Mirroring Documentation

## Overview

This document describes the AVIR website mirroring process, including the tools used, the workflow, and best practices.

## What is Mirroring?

Mirroring creates a static snapshot of a live website for hosting on Cloudflare Pages. This allows for:

- **Faster load times** via Cloudflare's CDN
- **Improved reliability** with distributed hosting
- **Version control** of website content
- **Easy rollbacks** via git history

## Mirroring Tools

### Primary Script: `mirror-avir.sh`

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

### Advanced Management: `mirror-manager.js`

For more complex operations:

```bash
node scripts/mirror-manager.js [command] [options]
```

**Commands:**
- `mirror` - Full site mirror with asset download
- `validate` - Validate mirrored site
- `deploy` - Deploy to Cloudflare Pages
- `status` - Check mirror status

## Mirroring Workflow

### 1. Initial Setup

```bash
# Ensure dependencies are installed
which wget  # Should return path

# Create necessary directories
mkdir -p site docs scripts
```

### 2. Run the Mirror

```bash
# Basic mirror
./scripts/mirror-avir.sh

# The script will:
# - Download all HTML, CSS, JS, and images
# - Convert links for local viewing
# - Save to site/ directory
# - Create a log file
```

### 3. Post-Mirror Processing

After mirroring, several fixup scripts may be needed:

```bash
# Fix image paths and references
python3 scripts/fix-all-images.py

# Add canonical tags for SEO
node scripts/add-canonical-tags.js

# Verify and repair HTML structure
python3 scripts/repair-html-heads.py
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
```

### 5. Deployment

```bash
# Commit and push (runs validations automatically)
./scripts/commit-and-push.sh
```

## Directory Structure

```
avir/
├── site/                  # Mirrored website content
│   ├── index.html
│   ├── contact/
│   ├── services/
│   └── images/
├── scripts/               # Mirroring and utility scripts
│   ├── mirror-avir.sh
│   ├── mirror-manager.js
│   ├── validate-site.sh
│   └── validate-security.sh
├── docs/                  # Documentation
│   └── MIRRORING.md
└── .sisyphus/            # Task tracking and evidence
    ├── notepads/
    └── evidence/
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

## Common Issues and Solutions

### Empty src Attributes

**Problem:** Images with `src=""` cause broken image icons.

**Solution:**
```bash
# Check for empty src
find site -name "*.html" -exec grep -l 'src=""' {} \;

# Fix with image repair script
python3 scripts/fix-all-images.py
```

### Missing Assets

**Problem:** Some images or files not downloaded.

**Solution:**
```bash
# Verify assets
./scripts/verify-assets.sh

# Re-download specific assets if needed
python3 scripts/download-webflow-assets.js
```

### SSL Certificate Errors

**Problem:** wget fails with certificate errors.

**Solution:** The mirror script uses `--no-check-certificate` for compatibility.

## Best Practices

1. **Always validate before deploying** - Use the validation scripts
2. **Check git status** - Ensure no sensitive files are staged
3. **Review changes** - Check `git diff --stat` before committing
4. **Test locally** - Serve with `./scripts/serve.sh` and verify
5. **Monitor after deploy** - Check Cloudflare Pages dashboard

## Troubleshooting

### Mirror Fails Mid-Download

```bash
# Resume partial download (wget --continue)
./scripts/mirror-avir.sh
```

### Validation Warnings

Warnings don't block deployment but should be reviewed:

```bash
# View detailed validation report
cat validation-report-*.txt
```

### Large File Warnings

Files >10MB trigger warnings. Review if these are necessary:

```bash
# Find large files
find site -type f -size +10M
```

## Related Documentation

- `README.md` - General project documentation
- `scripts/batch-repair-README.md` - Batch repair instructions
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
./scripts/validate-site.sh
./scripts/commit-and-push.sh
```
