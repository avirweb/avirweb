# Pixel-Perfect Website Mirroring Research

## Executive Summary

This research analyzes methods for creating a pixel-perfect static mirror of a 144-page website for deployment on Cloudflare Pages. The analysis covers current mirroring approaches, alternative technologies, technical requirements, common failures, and best practices.

**Key Finding**: Traditional wget/httrack mirroring has significant limitations for modern JavaScript-heavy websites. A Playwright-based crawling approach combined with proper asset capture and URL rewriting provides the most reliable path to pixel-perfect mirroring.

---

## 1. Current Mirroring Approach: wget/httrack Limitations

### wget Limitations

wget is a command-line utility for downloading files from the web. While powerful for basic mirroring, it has critical limitations:

**JavaScript Execution Gap**
- wget downloads HTML source code but does NOT execute JavaScript
- Modern websites (React, Vue, Angular) render content client-side - wget sees only the initial HTML shell
- Dynamic content loaded via AJAX/fetch remains uncaptured
- Lazy-loaded images (using `data-src` attributes or Intersection Observer API) are not triggered

**Link Conversion Issues**
- `--convert-links` (`-k`) only works reliably on relative links
- Absolute URLs pointing to the same domain may not be converted correctly
- Query string URLs (`?page=2`) won't work on static hosting
- Some users report wget failing to convert links even with proper flags

**Asset Capture Problems**
- CSS/JS files referenced in dynamically injected HTML are missed
- Web fonts loaded via `@font-face` in CSS may not be captured
- Images loaded via CSS `background-image` are often missed
- SVG sprites and icon fonts may be incomplete

**Common wget Command for Mirroring**:
```bash
wget --mirror --convert-links --adjust-extension --page-requisites \
     --no-parent --restrict-file-names=windows --wait=1 \
     --limit-rate=250k --domains=example.com https://example.com
```

### HTTrack Limitations

HTTrack is a GUI/command-line website copier with similar constraints:

**Absolute Link Challenges**
- Sites using absolute links (`https://example.com/page`) instead of relative links (`/page`) cause HTTrack to follow external links
- Can result in downloading unintended external content
- Requires careful "Scan Rules" configuration to restrict to target domain

**JavaScript-Heavy Sites**
- Like wget, HTTrack captures pre-rendered HTML, not JavaScript-rendered content
- Wix sites, SPAs (Single Page Applications), and modern frameworks are problematic
- Forum consensus: "You'd need a program that runs all the JavaScript"

**URL Structure Issues**
- URL rewriting may not produce "pretty" URLs (e.g., `page.html` instead of `/page/`)
- May create duplicate downloads with different URL patterns

---

## 2. Alternative Approaches

### 2.1 Puppeteer/Playwright-Based Crawling

**What They Are**:
- **Puppeteer**: Google-maintained Node.js library controlling headless Chrome
- **Playwright**: Microsoft-maintained multi-browser automation (Chromium, Firefox, WebKit)

**Advantages for Mirroring**:

1. **JavaScript Execution**: Renders pages fully in a real browser, capturing:
   - Client-side rendered content (React, Vue, Angular)
   - Lazy-loaded images (by scrolling or triggering Intersection Observer)
   - Dynamic content loaded via AJAX/fetch
   - Content behind login walls (with authentication)

2. **Asset Capture**: Can intercept and download all network requests:
   - Images, CSS, JavaScript files
   - Web fonts
   - API responses (can be mocked for offline use)

3. **Screenshot Verification**: Can capture screenshots for visual regression testing

4. **Modern Best Practice**: As of 2025-2026, Playwright is generally preferred over Puppeteer for new projects due to:
   - Multi-browser support
   - Better auto-waiting mechanisms
   - More consistent API
   - Active development

**Implementation Approach**:

```javascript
// Example: Basic Playwright crawler structure
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function crawlPage(url, outputDir) {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Track all resources
  const resources = [];
  page.on('response', async (response) => {
    const url = response.url();
    if (isAsset(url)) {
      resources.push({
        url,
        buffer: await response.body(),
        contentType: response.headers()['content-type']
      });
    }
  });
  
  // Navigate and wait for full render
  await page.goto(url, { waitUntil: 'networkidle2' });
  
  // Trigger lazy loading by scrolling
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
  
  // Get fully rendered HTML
  const html = await page.content();
  
  // Save HTML and resources
  await savePage(html, resources, outputDir);
  
  await browser.close();
}
```

**Tools in This Space**:
- **Crawlee**: Production-ready web scraping library with Playwright integration
- **PlaywrightCrawler**: Handles queue management, error handling, and parallel crawling
- **Apify**: Cloud-based scraping platform with Playwright support

**Limitations**:
- Slower than wget (requires browser startup/rendering)
- Higher resource usage (RAM, CPU)
- Forms and interactive elements remain non-functional in static output
- JavaScript functionality (dropdowns, modals) requires manual intervention

### 2.2 Static Site Generators (11ty, Next.js Static Export)

**When to Use**:
- If you have access to the source code/content management system
- If the site is already built with a framework that supports static export
- For rebuilding rather than mirroring

**11ty (Eleventy)**:
- Zero-config by default
- Supports 11+ template languages
- Ships zero JavaScript by default (fast, lightweight)
- Ideal for content-heavy sites
- Used by 1.07% of static sites (2026 data)

**Next.js Static Export**:
- `output: 'export'` in `next.config.js`
- Generates static HTML files at build time
- Supports ISR (Incremental Static Regeneration) - but NOT with static export
- React-based, good for interactive components
- More complex than needed for simple mirroring

**Limitations for Mirroring**:
- Requires source code access (not applicable for mirroring existing sites)
- Cannot mirror sites you don't control
- Complete rebuild, not a mirror

### 2.3 Complete Rebuild (shadcn/ui, Astro, etc.)

**Approach**:
- Use AI-powered tools (Same.dev, CopyAnyUI) to analyze and recreate
- Manual rebuild with modern component libraries

**Tools**:
- **Same.dev**: AI-powered pixel-perfect cloning using Next.js + shadcn/ui
- **CopyAnyUI**: Claims pixel-perfect replication without coding

**Limitations**:
- Not truly "mirroring" - creates a new implementation
- May not capture all functionality
- Time-intensive for 144 pages
- Risk of missing edge cases

### 2.4 CDN Proxy Approaches

**Cloudflare Workers Reverse Proxy**:
- Serves content from origin through Cloudflare edge
- Real-time proxy, not a static mirror
- Can modify requests/responses

**Implementation**:
```javascript
// Cloudflare Worker reverse proxy example
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const targetUrl = `https://origin-site.com${url.pathname}${url.search}`;
    
    const response = await fetch(targetUrl, {
      headers: request.headers
    });
    
    return new Response(response.body, {
      status: response.status,
      headers: response.headers
    });
  }
};
```

**Limitations**:
- Requires ongoing origin server availability
- Not a static mirror (origin must remain online)
- Higher latency than static hosting
- Does not solve the "static deployment" requirement

---

## 3. Pixel-Perfect Requirements: Technical Definition

### 3.1 Exact HTML Structure

**Requirements**:
- DOM tree must match original exactly (tag hierarchy, attributes)
- All semantic HTML elements preserved (`<header>`, `<nav>`, `<article>`, etc.)
- Data attributes preserved (often used by JavaScript)
- ARIA attributes for accessibility maintained
- Comments preserved (sometimes contain conditional logic)

**Challenges**:
- JavaScript may modify DOM after load - need post-render snapshot
- Dynamic IDs/classes may change between renders
- Some frameworks inject wrapper elements

### 3.2 Exact CSS Styling

**Requirements**:
- All CSS rules captured (inline, internal, external)
- CSS custom properties (variables) preserved
- Media queries for responsive design maintained
- `@font-face` declarations and font files captured
- `@keyframes` animations preserved
- Vendor prefixes maintained

**Critical Assets**:
- Stylesheets (`.css` files)
- Inline `<style>` blocks
- `style` attributes on elements
- Web fonts (WOFF2, WOFF, TTF)
- Icon fonts (Font Awesome, etc.)

### 3.3 All Assets

**Images**:
- Standard `<img>` tags
- Lazy-loaded images (must trigger loading)
- CSS `background-image`
- `<picture>` element with `srcset`
- SVG images and inline SVG
- Favicons and touch icons

**Video/Audio**:
- `<video>` and `<audio>` elements
- Poster images for videos
- Captions/subtitles files

**Documents**:
- PDFs, Word docs, etc. linked from pages

### 3.4 JavaScript Functionality

**Reality Check**:
- True JavaScript functionality (forms, dynamic content) cannot be preserved in a static mirror
- Client-side routing breaks in static hosting
- API calls will fail without backend

**Mitigation Strategies**:
- Forms: Replace with `mailto:` links or use form handling services (Formspree, Getform)
- Dynamic content: Pre-render all variations
- Client-side search: Replace with static search (Pagefind, Fuse.js)
- Interactive elements: Use Alpine.js for minimal interactivity

### 3.5 Meta Tags, SEO, OpenGraph

**Required Tags**:
```html
<!-- Basic SEO -->
<title>Page Title</title>
<meta name="description" content="...">
<meta name="keywords" content="...">
<meta name="robots" content="index,follow">

<!-- Canonical URL -->
<link rel="canonical" href="https://example.com/page">

<!-- OpenGraph (Facebook, LinkedIn, etc.) -->
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:image" content="...">
<meta property="og:url" content="...">
<meta property="og:type" content="website">

<!-- Twitter Cards -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="...">
<meta name="twitter:description" content="...">
<meta name="twitter:image" content="...">

<!-- Favicons -->
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
```

**Considerations**:
- Canonical URLs should point to the original site or be updated to new domain
- OpenGraph images must be captured and paths updated
- Sitemap.xml should be regenerated with new URLs

### 3.6 Forms and Interactivity

**Challenges**:
- Form submissions require server-side processing
- Static hosting (Cloudflare Pages) cannot process form submissions natively

**Solutions**:
1. **Form Handling Services**: Formspree, Formbucket, Getform, Netlify Forms
2. **Static Forms**: Replace with `mailto:` links
3. **Serverless Functions**: Cloudflare Workers for form processing (requires setup)
4. **Remove Forms**: If not critical to the mirror's purpose

---

## 4. Common Mirroring Failures

### 4.1 Lazy-Loaded Images Not Captured

**Problem**:
- Images use `data-src` instead of `src`
- Intersection Observer API delays loading until scroll
- wget/HTTrack see placeholder images only

**Solutions**:
- Playwright: Scroll page to trigger lazy loading
- Modify lazy-loading script to load all images immediately
- Use browser automation to trigger `scroll` events

**Implementation**:
```javascript
// Trigger all lazy-loaded images
await page.evaluate(() => {
  document.querySelectorAll('img[data-src]').forEach(img => {
    img.src = img.dataset.src;
  });
  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    img.loading = 'eager';
  });
});
```

### 4.2 JavaScript-Dependent Content Missing

**Problem**:
- Content loaded via `fetch()` or `XMLHttpRequest`
- React/Vue/Angular SPAs show blank or partial content
- Infinite scroll content not captured

**Solutions**:
- Use Playwright/Puppeteer to wait for network idle
- Wait for specific selectors to appear
- Execute API calls and embed responses in HTML

### 4.3 CSS/JS Paths Broken

**Problem**:
- Absolute URLs (`/css/style.css`) not converted to relative
- Query strings in asset URLs stripped
- CDN-hosted assets not downloaded

**Solutions**:
- URL rewriting during crawl
- Download external assets and update references
- Use `--convert-links` equivalent in custom crawler

### 4.4 Forms Not Working

**Problem**:
- Form actions point to non-existent endpoints
- CSRF tokens invalid
- POST requests fail on static hosting

**Solutions**:
- Replace forms with static alternatives
- Add form handling service integration
- Document non-functional forms

### 4.5 Dynamic Content Not Captured

**Problem**:
- User-specific content ("Welcome, John")
- Content behind authentication
- A/B test variations

**Solutions**:
- Authenticate crawler if needed
- Capture specific variant
- Document dynamic elements

---

## 5. Best Practices for 144-Page Sites

### 5.1 Ensuring All Pages Are Captured

**Discovery Methods**:

1. **Sitemap.xml Parsing**:
   - Check `/sitemap.xml` and `/sitemap_index.xml`
   - Parse `robots.txt` for `Sitemap:` directive
   - Handle nested sitemap indexes recursively
   - Tools: Ultimate Sitemap Parser (Python), sitemap-scraper (Go)

2. **Recursive Crawling**:
   - Start from homepage
   - Extract all `<a href="...">` links
   - Follow links within same domain
   - Maintain visited URL set to avoid duplicates

3. **URL List Validation**:
   - Compare crawled URLs against sitemap
   - Identify orphan pages (in sitemap but not linked)
   - Identify missing pages (linked but not in sitemap)

**Implementation**:
```javascript
// URL discovery with Crawlee
const { PlaywrightCrawler } = require('crawlee');

const crawler = new PlaywrightCrawler({
  async requestHandler({ request, page, enqueueLinks }) {
    // Process current page
    await savePage(page, request.url);
    
    // Discover and enqueue all links
    await enqueueLinks({
      globs: ['https://example.com/**'],
    });
  },
});

await crawler.run(['https://example.com/']);
```

### 5.2 Verifying Completeness

**Automated Checks**:

1. **Link Validation**:
   - Check all internal links resolve to existing files
   - Verify no 404s in the mirror
   - Tools: `hyperlink`, `htmltest`

2. **Asset Validation**:
   - Verify all images load
   - Check CSS/JS files exist
   - Ensure fonts are captured

3. **Visual Regression**:
   - Screenshot original and mirror
   - Compare with pixel-diff tools
   - Tools: Playwright screenshot comparison, BackstopJS

4. **Content Comparison**:
   - Extract text content from original and mirror
   - Compare for significant differences
   - Flag pages with >X% difference

**Manual Checks**:
- Spot-check critical pages
- Verify navigation works
- Test on mobile viewport
- Check print stylesheets

### 5.3 Handling Relative vs Absolute URLs

**URL Types**:

| Type | Example | Handling |
|------|---------|----------|
| Relative | `about.html` | Keep as-is |
| Root-relative | `/about` | Convert to relative or keep |
| Absolute (same domain) | `https://example.com/about` | Convert to relative |
| Absolute (external) | `https://other.com/page` | Keep, may warn |
| Protocol-relative | `//cdn.com/file.js` | Convert to HTTPS |

**URL Rewriting Strategy**:

```javascript
function rewriteUrl(url, pageUrl, baseUrl) {
  const urlObj = new URL(url, pageUrl);
  
  // External URL - keep as-is
  if (urlObj.hostname !== baseUrl.hostname) {
    return url;
  }
  
  // Convert to relative path
  const pagePath = new URL(pageUrl).pathname;
  const targetPath = urlObj.pathname;
  
  return path.relative(path.dirname(pagePath), targetPath);
}
```

**Best Practices**:
- Convert same-domain absolute URLs to relative
- Download external assets if critical (fonts, CDNs)
- Update canonical URLs to new domain
- Rewrite OpenGraph URLs

---

## 6. Recommended Approach for Cloudflare Pages

### 6.1 Recommended Architecture

**Primary Recommendation**: Playwright-Based Crawling with Static Export

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Source Website │────▶│ Playwright       │────▶│ Static Files    │
│  (144 pages)    │     │ Crawler          │     │ (HTML/CSS/JS)   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                              │                           │
                              ▼                           ▼
                        ┌──────────┐              ┌──────────────┐
                        │ Asset    │              │ Cloudflare   │
                        │ Capture  │              │ Pages        │
                        └──────────┘              └──────────────┘
```

### 6.2 Implementation Stack

**Core Tools**:
1. **Crawlee + Playwright**: Production-grade crawling with queue management
2. **Custom Asset Pipeline**: Download and rewrite all resources
3. **URL Rewriting**: Convert absolute to relative URLs
4. **Validation Suite**: Link checking, screenshot comparison

**Optional Enhancements**:
- **Pagefind**: Add static search functionality
- **Cloudflare Workers**: Handle form submissions if needed

### 6.3 Step-by-Step Process

**Phase 1: Discovery** (1-2 hours)
1. Parse sitemap.xml to get initial URL list
2. Crawl recursively to discover all pages
3. Validate URL list (compare sitemap vs. crawled)
4. Identify authentication requirements

**Phase 2: Crawling** (2-4 hours for 144 pages)
1. Configure Playwright crawler with:
   - `waitUntil: 'networkidle2'` for full render
   - Scroll trigger for lazy loading
   - Resource interception for asset capture
2. Crawl all discovered URLs
3. Save rendered HTML for each page
4. Download all referenced assets

**Phase 3: Post-Processing** (1-2 hours)
1. Rewrite all URLs (absolute → relative)
2. Update canonical and OpenGraph tags
3. Handle forms (replace or integrate with form service)
4. Generate new sitemap.xml

**Phase 4: Validation** (1 hour)
1. Run link checker on all pages
2. Screenshot comparison (original vs. mirror)
3. Manual spot-check of critical pages
4. Mobile viewport testing

**Phase 5: Deployment** (30 minutes)
1. Upload to Cloudflare Pages
2. Configure custom domain
3. Set up redirects if needed
4. Configure headers (security, caching)

### 6.4 Cloudflare Pages Configuration

**Build Settings**:
- Build command: (none - static files)
- Build output directory: `/`
- Root directory: (output folder)

**Headers** (`_headers` file):
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';

/*.css
  Cache-Control: public, max-age=31536000, immutable

/*.js
  Cache-Control: public, max-age=31536000, immutable

/*.png
  Cache-Control: public, max-age=31536000, immutable
```

**Redirects** (`_redirects` file):
```
# Handle trailing slashes
/about/ /about 301

# Custom redirects if needed
/old-page /new-page 301
```

### 6.5 Alternative: Hybrid Approach

If Playwright crawling is too resource-intensive:

1. **Use wget for initial capture** (fast, gets static content)
2. **Use Playwright for JavaScript-heavy pages only**
3. **Merge results** and validate

This works well if most pages are static HTML with a few dynamic sections.

---

## 7. Tool Recommendations

### 7.1 Crawling/Scraping

| Tool | Best For | Complexity |
|------|----------|------------|
| **Crawlee + Playwright** | Production mirroring | Medium |
| **Puppeteer** | Simple scripts, Google ecosystem | Low |
| **Scrapy + Splash** | Python-based pipelines | Medium |
| **wget** | Quick static captures only | Low |
| **HTTrack** | GUI-based simple mirrors | Low |

### 7.2 Validation

| Tool | Purpose |
|------|---------|
| **hyperlink** | Link checking |
| **htmltest** | HTML validation + link checking |
| **Playwright** | Screenshot comparison |
| **BackstopJS** | Visual regression testing |

### 7.3 URL Rewriting

| Tool | Purpose |
|------|---------|
| **Cheerio** | Server-side jQuery-like HTML manipulation |
| **PostHTML** | Post-processor for HTML transformations |
| **Custom scripts** | Domain-specific rewriting logic |

---

## 8. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| JavaScript content missed | High | High | Use Playwright, not wget |
| Lazy-loaded images missing | High | Medium | Scroll trigger in crawler |
| Broken internal links | Medium | High | Automated link checking |
| Forms non-functional | High | Medium | Replace with static alternatives |
| External assets unavailable | Medium | Medium | Download and host locally |
| URL rewriting errors | Medium | High | Test thoroughly, validate |
| Dynamic content outdated | Low | Low | Document last crawl date |

---

## 9. Conclusion

For a pixel-perfect mirror of a 144-page website on Cloudflare Pages:

**Recommended Approach**: Playwright-based crawling using Crawlee

**Key Success Factors**:
1. Use browser automation (Playwright) to capture JavaScript-rendered content
2. Implement comprehensive asset capture (images, fonts, CSS, JS)
3. Thorough URL rewriting (absolute → relative)
4. Automated validation (link checking, screenshot comparison)
5. Manual spot-checking of critical pages

**Timeline Estimate**: 1-2 days for initial crawl, plus ongoing maintenance

**Cost Considerations**:
- Cloudflare Pages: Free tier (unlimited bandwidth, 500 builds/month)
- Crawling infrastructure: Local machine or small VPS
- Storage: ~100MB-1GB for 144 pages (depending on media)

This approach provides the highest fidelity mirror while maintaining the benefits of static hosting (speed, reliability, low cost).

---

## References

1. HTTrack Documentation: https://www.httrack.com/
2. Playwright Web Scraping Guide (2026): https://www.browserstack.com/guide/playwright-web-scraping
3. Cloudflare Pages Documentation: https://developers.cloudflare.com/pages/
4. Crawlee Documentation: https://crawlee.dev/
5. Sitemaps.org Protocol: https://www.sitemaps.org/
6. Open Graph Protocol: https://ogp.me/

---

*Research compiled: January 2026*
*For: Prometheus Planning Agent*
