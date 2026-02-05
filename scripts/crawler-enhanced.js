#!/usr/bin/env node

/**
 * Enhanced Playwright Crawler for AVIR Website Replication
 *
 * Features:
 * - Request interception for all network traffic
 * - SHA256 hashing for all assets
 * - Lazy-loaded image triggering via scrolling
 * - Multi-viewport screenshot capture
 * - URL rewriting to relative paths
 * - Complete asset manifest generation
 *
 * Usage: node scripts/crawler-enhanced.js
 * Output: mirror-raw/ directory with complete site mirror
 */

const { chromium } = require('playwright');
const fsPromises = require('fs').promises;
const path = require('path');
const { URL } = require('url');
const AssetManifest = require('./lib/asset-manifest');

// Configuration
const CONFIG = {
    BASE_URL: 'https://www.avir.com',
    OUTPUT_DIR: path.join(__dirname, '..', 'mirror-raw'),
    CONCURRENT_LIMIT: 3,
    PAGE_TIMEOUT: 30000,
    NAVIGATION_TIMEOUT: 60000,
    SCROLL_DELAY: 500,
    MAX_RETRIES: 3,
    VIEWPORTS: [
        { name: 'mobile', width: 375, height: 667 },
        { name: 'tablet', width: 768, height: 1024 },
        { name: 'desktop', width: 1920, height: 1080 },
        { name: 'desktop-xl', width: 2560, height: 1440 },
    ],
    SKIP_PATTERNS: [
        /\/api\//,
        /\/_next\//,
        /\.json$/,
        /\.xml$/,
        /\.txt$/,
        /^mailto:/,
        /^tel:/,
        /^#/,
    ],
};

// Crawler state
const state = {
    crawledUrls: new Set(),
    queuedUrls: new Set(),
    queue: [],
    errors: [],
    startTime: Date.now(),
    manifest: null,
    browser: null,
};

/**
 * Initialize the crawler
 */
async function init() {
    console.log('========================================');
    console.log('  AVIR Enhanced Crawler');
    console.log('  Playwright + Request Interception');
    console.log('========================================');
    console.log(`Target: ${CONFIG.BASE_URL}`);
    console.log(`Output: ${CONFIG.OUTPUT_DIR}`);
    console.log('');

    // Create output directory structure
    await fsPromises.mkdir(CONFIG.OUTPUT_DIR, { recursive: true });
    await fsPromises.mkdir(path.join(CONFIG.OUTPUT_DIR, 'css'), { recursive: true });
    await fsPromises.mkdir(path.join(CONFIG.OUTPUT_DIR, 'js'), { recursive: true });
    await fsPromises.mkdir(path.join(CONFIG.OUTPUT_DIR, 'images'), { recursive: true });
    await fsPromises.mkdir(path.join(CONFIG.OUTPUT_DIR, 'fonts'), { recursive: true });
    await fsPromises.mkdir(path.join(CONFIG.OUTPUT_DIR, 'videos'), { recursive: true });
    await fsPromises.mkdir(path.join(CONFIG.OUTPUT_DIR, 'cdn'), { recursive: true });
    await fsPromises.mkdir(path.join(CONFIG.OUTPUT_DIR, 'screenshots'), { recursive: true });

    // Initialize asset manifest
    state.manifest = new AssetManifest(CONFIG.OUTPUT_DIR, CONFIG.BASE_URL);

    // Initialize browser
    state.browser = await chromium.launch({
        headless: true,
    });

    // Add homepage to queue
    queueUrl(CONFIG.BASE_URL, 0);
}

/**
 * Queue a URL for crawling
 */
function queueUrl(url, depth = 0) {
    if (state.queuedUrls.has(url) || state.crawledUrls.has(url)) {
        return false;
    }

    state.queuedUrls.add(url);
    state.queue.push({ url, depth });
    return true;
}

/**
 * Get local file path for a URL
 */
function getLocalPath(url) {
    const urlObj = new URL(url);
    let pathname = urlObj.pathname;

    pathname = pathname.replace(/\/$/, '');

    if (pathname === '' || pathname === '/') {
        return 'index.html';
    }

    const ext = path.extname(pathname);
    if (!ext) {
        return path.join(pathname, 'index.html');
    }

    return pathname;
}

/**
 * Get output file path for a URL
 */
function getOutputPath(url) {
    return path.join(CONFIG.OUTPUT_DIR, getLocalPath(url));
}

/**
 * Determine if URL should be crawled
 */
function shouldCrawlUrl(url) {
    try {
        const urlObj = new URL(url);

        if (urlObj.origin !== new URL(CONFIG.BASE_URL).origin) {
            return false;
        }

        for (const pattern of CONFIG.SKIP_PATTERNS) {
            if (pattern.test(url)) {
                return false;
            }
        }

        return true;
    } catch {
        return false;
    }
}

/**
 * Determine asset category from URL and content type
 */
function getAssetCategory(url, contentType = '') {
    const ext = path.extname(url).toLowerCase();
    const type = contentType.toLowerCase();

    if (ext === '.css' || type.includes('text/css')) return 'css';
    if (ext === '.js' || type.includes('javascript')) return 'js';
    if (['.jpg', '.jpeg', '.png', '.svg', '.webp', '.gif', '.ico'].includes(ext) || type.includes('image/')) {
        return 'images';
    }
    if (['.woff2', '.woff', '.ttf', '.otf', '.eot'].includes(ext) || type.includes('font/')) {
        return 'fonts';
    }
    if (['.mp4', '.webm', '.mov'].includes(ext) || type.includes('video/')) {
        return 'videos';
    }

    return 'cdn';
}

/**
 * Generate local path for an asset URL
 */
function getAssetLocalPath(url, contentType = '') {
    const urlObj = new URL(url);
    const category = getAssetCategory(url, contentType);

    // Skip tracking/analytics URLs
    const skipHosts = [
        'googleads.g.doubleclick.net',
        'www.google.com',
        'www.googleadservices.com',
        'www.googletagmanager.com',
        'www.google-analytics.com',
        'connect.facebook.net',
        'snap.licdn.com',
    ];

    if (skipHosts.some(host => urlObj.hostname.includes(host))) {
        return null;
    }

    // Handle Google Fonts
    if (urlObj.hostname === 'fonts.googleapis.com') {
        return path.join('fonts', 'google-fonts.css');
    }

    // Handle Google Fonts static files
    if (urlObj.hostname === 'fonts.gstatic.com') {
        const filename = path.basename(urlObj.pathname) || 'font.woff2';
        return path.join('fonts', filename);
    }

    // Handle Adobe Typekit
    if (urlObj.hostname.includes('typekit.net') || urlObj.hostname.includes('use.typekit.net')) {
        const filename = path.basename(urlObj.pathname) || 'typekit.css';
        return path.join('fonts', `adobe-${filename}`);
    }

    // Handle Dropbox videos
    if (urlObj.hostname.includes('dropbox.com') || urlObj.hostname.includes('dropboxusercontent.com')) {
        const filename = path.basename(urlObj.pathname) || 'video.mp4';
        return path.join('videos', filename);
    }

    // Handle Webflow CDN
    if (urlObj.hostname === 'cdn.prod.website-files.com') {
        return path.join('cdn', urlObj.pathname);
    }

    // Generic handling - ensure we have a filename
    let pathname = urlObj.pathname.replace(/^\//, '');
    const basename = path.basename(pathname);

    // If no filename or ends with /, generate one from content type
    if (!basename || basename === '' || pathname.endsWith('/')) {
        const ext = getExtensionFromContentType(contentType) || 'bin';
        pathname = path.join(pathname, `asset.${ext}`);
    }

    return path.join(category, pathname);
}

/**
 * Get file extension from content type
 */
function getExtensionFromContentType(contentType) {
    const type = contentType.toLowerCase();
    if (type.includes('text/css')) return 'css';
    if (type.includes('javascript')) return 'js';
    if (type.includes('json')) return 'json';
    if (type.includes('image/jpeg')) return 'jpg';
    if (type.includes('image/png')) return 'png';
    if (type.includes('image/svg')) return 'svg';
    if (type.includes('image/webp')) return 'webp';
    if (type.includes('image/gif')) return 'gif';
    if (type.includes('font/woff2')) return 'woff2';
    if (type.includes('font/woff')) return 'woff';
    if (type.includes('font/ttf')) return 'ttf';
    if (type.includes('video/mp4')) return 'mp4';
    if (type.includes('video/webm')) return 'webm';
    if (type.includes('text/html')) return 'html';
    return null;
}

/**
 * Setup request interception for a page
 */
async function setupRequestInterception(page) {
    const capturedAssets = new Map();

    await page.route('**/*', async (route) => {
        const request = route.request();
        const url = request.url();

        try {
            // Continue the request
            const response = await route.fetch({
                timeout: CONFIG.PAGE_TIMEOUT,
            });

            const buffer = await response.body();
            const contentType = response.headers()['content-type'] || '';
            const status = response.status();

            // Skip if not successful
            if (status >= 200 && status < 300 && buffer && buffer.length > 0) {
                // Check if already captured
                if (!state.manifest.hasAsset(url)) {
                    const localPath = getAssetLocalPath(url, contentType);

                    // Skip if localPath is null (tracking/analytics URLs)
                    if (localPath) {
                        const outputPath = path.join(CONFIG.OUTPUT_DIR, localPath);

                        // Save asset
                        await fsPromises.mkdir(path.dirname(outputPath), { recursive: true });
                        await fsPromises.writeFile(outputPath, buffer);

                        // Add to manifest
                        await state.manifest.addAsset(url, localPath, buffer, contentType, {
                            status,
                            headers: response.headers(),
                        });

                        capturedAssets.set(url, localPath);
                    }
                } else {
                    const asset = state.manifest.getAsset(url);
                    if (asset) {
                        capturedAssets.set(url, asset.localPath);
                    }
                }
            }

            // Fulfill with original response
            await route.fulfill({
                status,
                headers: response.headers(),
                body: buffer,
            });
        } catch (error) {
            console.error(`    ✗ Failed to intercept ${url}: ${error.message}`);
            await route.continue();
        }
    });

    return capturedAssets;
}

/**
 * Trigger lazy-loaded images by scrolling
 */
async function triggerLazyLoading(page) {
    console.log('    → Triggering lazy-loaded content...');

    const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
    const viewportHeight = 1080;

    for (let y = 0; y < scrollHeight; y += viewportHeight) {
        await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
        await page.waitForTimeout(CONFIG.SCROLL_DELAY);
    }

    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);

    console.log('    ✓ Lazy-loading triggered');
}

/**
 * Take screenshots at multiple viewports
 */
async function takeScreenshots(page, pagePath) {
    const screenshotsDir = path.join(CONFIG.OUTPUT_DIR, 'screenshots');
    const pageName = pagePath.replace(/\//g, '-').replace(/^-/, '') || 'index';

    console.log('    → Taking screenshots...');

    for (const viewport of CONFIG.VIEWPORTS) {
        await page.setViewportSize({
            width: viewport.width,
            height: viewport.height,
        });

        // Wait for layout to settle
        await page.waitForTimeout(500);

        const screenshotPath = path.join(
            screenshotsDir,
            `${pageName}-${viewport.name}-${viewport.width}x${viewport.height}.png`
        );

        await page.screenshot({
            path: screenshotPath,
            fullPage: true,
        });

        console.log(`    ✓ Screenshot: ${viewport.name}`);
    }

    // Reset to desktop viewport
    await page.setViewportSize({
        width: 1920,
        height: 1080,
    });
}

/**
 * Rewrite URLs in HTML to local paths
 */
function rewriteUrls(html, capturedAssets, pageUrl) {
    let rewritten = html;
    const pageDir = path.dirname(getLocalPath(pageUrl));

    // Build URL to local path mapping
    const urlMap = new Map();
    for (const [originalUrl, localPath] of capturedAssets) {
        urlMap.set(originalUrl, localPath);
    }

    // Add existing manifest assets
    for (const asset of state.manifest.assets.values()) {
        urlMap.set(asset.originalUrl, asset.localPath);
    }

    // Rewrite URLs in various attributes
    const patterns = [
        { regex: /href="([^"]+)"/g, attr: 'href' },
        { regex: /src="([^"]+)"/g, attr: 'src' },
        { regex: /srcset="([^"]+)"/g, attr: 'srcset' },
        { regex: /url\(([^)]+)\)/g, attr: 'url' },
        { regex: /data-src="([^"]+)"/g, attr: 'data-src' },
        { regex: /data-srcset="([^"]+)"/g, attr: 'data-srcset' },
        { regex: /poster="([^"]+)"/g, attr: 'poster' },
        { regex: /content="(https?:\/\/[^"]+)"/g, attr: 'content' },
    ];

    for (const { regex } of patterns) {
        rewritten = rewritten.replace(regex, (match, url) => {
            const cleanUrl = url.replace(/['"]/g, '').trim();

            // Skip data URIs, anchors, and javascript
            if (cleanUrl.startsWith('data:') ||
                cleanUrl.startsWith('#') ||
                cleanUrl.startsWith('javascript:')) {
                return match;
            }

            try {
                const absoluteUrl = new URL(cleanUrl, pageUrl).toString();
                const localPath = urlMap.get(absoluteUrl);

                if (localPath) {
                    // Calculate relative path from current page
                    const relativePath = path.relative(pageDir, localPath);
                    const finalPath = relativePath.startsWith('.')
                        ? relativePath
                        : './' + relativePath;

                    return match.replace(cleanUrl, finalPath);
                }
            } catch {
                // Invalid URL, keep original
            }

            return match;
        });
    }

    // Rewrite inline CSS
    rewritten = rewritten.replace(/style="([^"]*)"/g, (match) => {
        return match.replace(/url\(([^)]+)\)/g, (urlMatch, url) => {
            const cleanUrl = url.replace(/['"]/g, '').trim();

            if (cleanUrl.startsWith('data:')) return urlMatch;

            try {
                const absoluteUrl = new URL(cleanUrl, pageUrl).toString();
                const localPath = urlMap.get(absoluteUrl);

                if (localPath) {
                    const relativePath = path.relative(pageDir, localPath);
                    const finalPath = relativePath.startsWith('.')
                        ? relativePath
                        : './' + relativePath;
                    return `url(${finalPath})`;
                }
            } catch {
                // Invalid URL
            }

            return urlMatch;
        });
    });

    return rewritten;
}

/**
 * Extract links from page
 */
async function extractLinks(page, baseUrl) {
    const links = new Set();

    const anchors = await page.locator('a[href]').all();

    for (const anchor of anchors) {
        const href = await anchor.getAttribute('href');
        if (href) {
            try {
                const absoluteUrl = new URL(href, baseUrl).toString();
                if (shouldCrawlUrl(absoluteUrl)) {
                    links.add(absoluteUrl);
                }
            } catch {
                // Invalid URL
            }
        }
    }

    return Array.from(links);
}

/**
 * Crawl a single page
 */
async function crawlPage({ url, depth }) {
    console.log(`\n[CRAWL] ${url} (depth: ${depth})`);

    const page = await state.browser.newPage();
    let capturedAssets = new Map();

    try {
        // Setup request interception
        capturedAssets = await setupRequestInterception(page);

        // Set default viewport
        await page.setViewportSize({ width: 1920, height: 1080 });

        // Navigate with retry logic
        let response = null;
        let retries = 0;

        while (retries < CONFIG.MAX_RETRIES && !response) {
            try {
                response = await page.goto(url, {
                    waitUntil: 'networkidle',
                    timeout: CONFIG.NAVIGATION_TIMEOUT,
                });
            } catch (error) {
                retries++;
                if (retries >= CONFIG.MAX_RETRIES) {
                    throw error;
                }
                console.log(`    → Retry ${retries}/${CONFIG.MAX_RETRIES}...`);
                await page.waitForTimeout(2000);
            }
        }

        if (!response || !response.ok()) {
            throw new Error(`HTTP ${response ? response.status() : 'no response'}`);
        }

        // Trigger lazy loading
        await triggerLazyLoading(page);

        // Wait for any remaining network activity
        await page.waitForTimeout(2000);

        // Get HTML content
        let html = await page.content();

        // Rewrite URLs
        html = rewriteUrls(html, capturedAssets, url);

        // Save HTML
        const outputPath = getOutputPath(url);
        await fsPromises.mkdir(path.dirname(outputPath), { recursive: true });
        await fsPromises.writeFile(outputPath, html, 'utf8');

        // Extract and queue new links
        const links = await extractLinks(page, url);
        let queuedCount = 0;

        for (const link of links) {
            if (queueUrl(link, depth + 1)) {
                queuedCount++;
            }
        }

        // Take screenshots
        await takeScreenshots(page, getLocalPath(url));

        console.log(`  ✓ Saved (${capturedAssets.size} assets, ${queuedCount} new links)`);

        state.crawledUrls.add(url);

    } catch (error) {
        console.error(`  ✗ Error: ${error.message}`);
        state.errors.push({ url, error: error.message, depth });
    } finally {
        await page.close();
    }
}

/**
 * Process the crawl queue with concurrency limit
 */
async function processQueue() {
    const activePromises = new Set();

    while (state.queue.length > 0 || activePromises.size > 0) {
        // Fill up to concurrent limit
        while (activePromises.size < CONFIG.CONCURRENT_LIMIT && state.queue.length > 0) {
            const task = state.queue.shift();
            const promise = crawlPage(task).finally(() => {
                activePromises.delete(promise);
            });
            activePromises.add(promise);
        }

        // Wait for at least one to complete
        if (activePromises.size > 0) {
            await Promise.race(activePromises);
        }
    }
}

/**
 * Save crawl report
 */
async function saveReport() {
    const completedAt = Date.now();
    const duration = completedAt - state.startTime;

    const report = {
        startedAt: new Date(state.startTime).toISOString(),
        completedAt: new Date(completedAt).toISOString(),
        durationMs: duration,
        durationFormatted: `${(duration / 1000).toFixed(2)}s`,
        pagesCrawled: state.crawledUrls.size,
        assetsDownloaded: state.manifest.assets.size,
        errors: state.errors,
        statistics: state.manifest.getStatistics(),
    };

    const reportPath = path.join(CONFIG.OUTPUT_DIR, 'crawl-report.json');
    await fsPromises.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');

    // Save asset manifest
    const manifestPath = await state.manifest.save();

    console.log('');
    console.log('========================================');
    console.log('  Crawl Complete');
    console.log('========================================');
    console.log(`Duration: ${report.durationFormatted}`);
    console.log(`Pages crawled: ${report.pagesCrawled}`);
    console.log(`Assets downloaded: ${report.assetsDownloaded}`);
    console.log(`Total size: ${(report.statistics.totalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Errors: ${report.errors.length}`);
    console.log('');
    console.log(`Asset manifest: ${manifestPath}`);
    console.log(`Crawl report: ${reportPath}`);
    console.log('');

    if (report.errors.length > 0) {
        console.log('Errors encountered:');
        report.errors.forEach((err) => {
            console.log(`  - ${err.url}: ${err.error}`);
        });
        console.log('');
    }

    // Print asset breakdown
    console.log('Asset breakdown:');
    for (const [category, count] of Object.entries(report.statistics.byCategory)) {
        console.log(`  ${category}: ${count}`);
    }
    console.log('');
}

/**
 * Main entry point
 */
async function main() {
    let exitCode = 0;

    try {
        await init();
        await processQueue();
    } catch (error) {
        console.error('Fatal error:', error);
        state.errors.push({ url: 'CRAWLER', error: error.message });
        exitCode = 1;
    } finally {
        // Always save report and manifest
        try {
            await saveReport();
        } catch (reportError) {
            console.error('Failed to save report:', reportError);
        }

        // Close browser
        if (state.browser) {
            try {
                await state.browser.close();
            } catch {
                // Ignore browser close errors
            }
        }

        process.exit(exitCode);
    }
}

// Run if executed directly
if (require.main === module) {
    main();
}

module.exports = { main, CONFIG };
