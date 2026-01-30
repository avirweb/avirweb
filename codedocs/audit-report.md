# Codebase Audit Report

**Generated:** 2026-01-30  
**Project:** AVIR Website Mirror  
**Location:** /home/agent/avir

---

## Executive Summary

This is a **static site mirror** of a Webflow-generated website for AVIR (Audio Visual Integration & Residential). The codebase is primarily a crawled/exported static HTML site with supporting Node.js tooling for validation, visual regression testing, and asset management.

**Key Characteristics:**
- Static HTML site (147+ pages)
- Webflow export with minified JS/CSS bundles
- Node.js tooling for crawling and validation
- Cloudflare Pages deployment target
- No frontend framework (React/Vue/Angular)
- No TypeScript in production code

---

## 1. Project Structure

### Directory Layout
```
/home/agent/avir/
├── site/                          # Main static site content
│   ├── index.html                 # Homepage entry point
│   ├── images/                    # Assets (JS, CSS, images)
│   │   ├── js/                    # Minified JS bundles (rspack)
│   │   ├── css/                   # Webflow CSS + normalize
│   │   └── ...                    # Image assets
│   ├── about-avir/
│   ├── blog/
│   ├── brands/
│   ├── careers/
│   ├── city/                      # 25+ city pages
│   ├── galleries/
│   ├── post/                      # 80+ blog posts
│   ├── services/
│   └── ...                        # Other static pages
├── functions/                     # Cloudflare Pages Functions
│   └── api/
│       ├── submit-form.ts         # Form submission handler
│       └── submit-form.js         # Compiled JS
├── scripts/                       # Build/validation scripts
│   ├── crawl-site.js              # Playwright crawler
│   ├── comprehensive-validation.js
│   ├── visual-tests.js            # Visual regression
│   ├── fix-asset-paths.js
│   └── ...                        # Various utility scripts
├── analysis/                      # Documentation
│   ├── crawl-validation.md
│   ├── mirroring-research.md
│   ├── live-site-analysis.md
│   └── cloudflare-site-analysis.md
├── .sisyphus/                     # Agent workspace
│   ├── plans/
│   ├── notepads/
│   └── evidence/
├── package.json
├── package-lock.json
├── README.md
└── AGENTS.md                      # Deployment constraints
```

### File Counts (Project Files, Excluding node_modules/.git)

| Type | Count | Location |
|------|-------|----------|
| HTML | 147 | `site/` |
| JS | 17 | `scripts/`, `site/images/js/` |
| TS | 1 | `functions/api/submit-form.ts` |
| CSS | 1 | `site/images/css/` |
| Shell | 4 | `scripts/` |
| Python | 5 | `scripts/` |
| JSON | 188 | Various |
| Markdown | 25 | Documentation |

---

## 2. Technology Stack

### Runtime Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| `crawlee` | ^3.x | Web crawling/scraping framework |
| `playwright` | ^1.x | Browser automation |
| `agent-browser` | - | Browser automation helper |
| `canvas` | ^2.x | Server-side image processing |
| `pixelmatch` | ^5.x | Image diffing for visual regression |
| `pngjs` | ^7.x | PNG parsing/encoding |

### Build Tools
- **None declared** - No webpack, vite, rollup, or tsc configs
- Static site requires no build step (`exit 0` in Cloudflare Pages)

### Testing Frameworks
- **None declared** - No Jest, Mocha, Vitest
- Custom validation scripts using Playwright

### Cloud/Services
- Cloudflare Pages (deployment target)
- No AWS/GCP/Azure SDKs
- No Stripe/other service integrations

---

## 3. Architecture Overview

### Entry Points
1. **Static Site**: `site/index.html`
2. **Cloudflare Function**: `functions/api/submit-form.ts`
3. **Crawler**: `scripts/crawl-site.js`
4. **Validation**: `scripts/comprehensive-validation.js`

### Key Components

#### Static Site (`site/`)
- **Generator**: Webflow export
- **Structure**: Flat HTML files with nested directories for routing
- **Assets**: Minified JS bundles (rspack), Webflow CSS, images
- **Forms**: Connected to `/api/submit-form` Cloudflare Function

#### Cloudflare Pages Functions (`functions/`)
- Single API endpoint for form submissions
- TypeScript source with compiled JS fallback
- Handles residential and commercial form POSTs

#### Scripts (`scripts/`)
- **Crawling**: `crawl-site.js` (PlaywrightCrawler)
- **Validation**: Page checks, visual regression
- **Asset Management**: Path fixing, filename repair
- **Form Handling**: Form action updates

---

## 4. Code Patterns & Quality

### Static Site Patterns

#### HTML/CSS
- **Webflow Export**: `data-wf-*` attributes, `w-*` classes
- **BEM-like naming**: `nav__link-wrap`, `button--primary`
- **Inline styles**: Present in many elements
- **Normalize.css**: Included in main CSS bundle

#### JavaScript
- **Minified bundles**: rspack output, no source maps
- **Global jQuery**: `$` available globally
- **Webflow runtime**: `Webflow` global object
- **Inline scripts**: Page-specific initialization

### Code Quality Observations

#### Positive Patterns
- ARIA attributes on interactive elements (`aria-controls`, `aria-haspopup`)
- Semantic HTML structure
- Consistent Webflow class naming

#### Anti-Patterns & Risks

| Issue | Severity | Location |
|-------|----------|----------|
| Empty alt attributes on images | Medium | Throughout site |
| Inline scripts/styles | Medium | All HTML pages |
| Global event handlers intercepting links | Medium | `site/index.html` |
| Third-party scripts without SRI | High | Analytics, LiveChat, reCAPTCHA |
| No Content Security Policy | High | Site-wide |
| Protocol-relative URLs | Low | LiveChat script |
| console.log in production bundles | Low | Minified JS |

### Error Handling
- **Inline scripts**: No explicit try/catch blocks
- **Minified bundles**: Internal error handling not reviewable
- **API endpoint**: Not analyzed (TypeScript file)

### State Management
- **None** - DOM-driven via jQuery/Webflow
- Page transitions handled by inline scripts
- No React/Vue/Angular state management

### Accessibility
- **ARIA**: Present on dropdowns and lightbox triggers
- **Alt text**: Many images have empty `alt=""` (likely decorative)
- **Forms**: Standard HTML form elements
- **Navigation**: Keyboard navigable

---

## 5. Security Assessment

### Vulnerabilities

| Risk | Description | Mitigation |
|------|-------------|------------|
| Supply Chain | Third-party scripts without SRI | Add integrity attributes |
| XSS | Inline scripts make CSP difficult | Move to external files |
| Data Exposure | Analytics keys in HTML | Expected for client-side |
| Mixed Content | Protocol-relative URLs | Use HTTPS explicitly |

### Third-Party Scripts
- Google Analytics / Google Ads
- Meta Pixel (Facebook)
- LiveChat
- Google reCAPTCHA
- Various tracking pixels

---

## 6. Testing & Validation

### Current Testing
- **No unit tests** (no Jest/Mocha/Vitest)
- **Visual regression**: `scripts/visual-tests.js` using pixelmatch
- **Validation**: `scripts/comprehensive-validation.js` using Playwright
- **Output artifacts**: JSON reports in `visual-tests/` and `validation-tests/`

### Validation Coverage
- Page crawl and link checking
- Visual comparison against baseline
- Performance metrics collection

---

## 7. Deployment Configuration

### Cloudflare Pages
- **Publish Directory**: `site/`
- **Build Command**: `exit 0` (static site, no build)
- **Functions**: `functions/` directory
- **Headers**: `site/_headers`
- **Redirects**: `site/_redirects`

### Constraints (from AGENTS.md)
> **MANDATORY**: Any Cloudflare Pages deployment shall ONLY go to:
> - **Pages Container Name**: `AVIRWEBTEST`
> - **Deployment URL**: `AVIRWEBTEST.pages.dev`
> - **GitHub Connection**: `github.com/avirweb/avirweb`

### Missing CI/CD
- No `.github/workflows` directory
- No automated deployment pipeline configured

---

## 8. Documentation

### Existing Documentation
| File | Purpose |
|------|---------|
| `README.md` | Project overview and setup |
| `MIGRATION-REPORT.md` | Migration details |
| `AGENTS.md` | Deployment constraints |
| `analysis/*.md` | Site analysis and research |
| `.sisyphus/plans/*.md` | Implementation plans |
| `.sisyphus/notepads/*.md` | Decision records |

### Documentation Quality
- Good project-level documentation
- Agent workspace well-organized
- Missing: API documentation, component library docs

---

## 9. Recommendations

### High Priority
1. **Add Content Security Policy** - Mitigate XSS risks
2. **Implement Subresource Integrity** - For third-party scripts
3. **Add automated CI/CD** - GitHub Actions for deployment
4. **Fix empty alt attributes** - Improve accessibility

### Medium Priority
5. **Add source maps** - For minified JS bundles
6. **Implement error tracking** - Sentry or similar
7. **Add unit tests** - For Cloudflare Functions
8. **Document API endpoints** - OpenAPI/Swagger

### Low Priority
9. **Migrate to external scripts** - Remove inline JS
10. **Add TypeScript** - For better type safety
11. **Implement proper state management** - If adding interactivity

---

## 10. Summary Statistics

| Metric | Value |
|--------|-------|
| Total Files | ~400+ (excluding node_modules) |
| HTML Pages | 147 |
| JavaScript Files | 17 |
| Lines of Code (est.) | 50,000+ (minified JS/CSS) |
| Dependencies | 6 runtime |
| Dev Dependencies | 0 |
| Test Coverage | 0% (no unit tests) |
| TypeScript Coverage | <1% (1 file) |

---

## Appendix: File Inventory

### Key Configuration Files
- `package.json` - Node.js dependencies
- `package-lock.json` - Lock file
- `.gitignore` - Git ignore rules
- `site/_headers` - Cloudflare Pages headers
- `site/_redirects` - Cloudflare Pages redirects
- `site/robots.txt` - SEO robots
- `site/sitemap.xml` - SEO sitemap

### Script Inventory
```
scripts/
├── add-turnstile.sh
├── batch-repair.sh
├── check-css-rules.js
├── check-js-loading.js
├── compare-index.js
├── compare-production.js
├── comprehensive-validation.js
├── crawl-site-fixed.js
├── crawl-site.js
├── debug-page-state.js
├── download-cdn-images.py
├── download-webflow-assets.js
├── fix-asset-filenames.py
├── fix-asset-paths.js
├── fix-forms.sh
├── fix-html-files.py
├── inject-seo.js
├── repair-footer.py
├── repair-html-heads.py
├── repair-html.py
├── verify-page-height.js
├── visual-audit-v2.js
├── visual-compare.sh
├── visual-tests.js
└── wait-for-animations.js
```

---

*Report generated by automated codebase audit*
