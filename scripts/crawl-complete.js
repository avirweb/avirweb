#!/usr/bin/env node

/**
 * Enhanced Crawler for AVIR Mirror System
 * Crawls www.avir.com with Playwright to capture all pages
 *
 * Usage: node scripts/crawl-complete.js
 * Output: mirror-raw/ directory with full site mirror
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const BASE_URL = 'https://www.avir.com';
const OUTPUT_DIR = '/home/agent/avir/mirror-raw';
const CRAWL_LOG_FILE = path.join(OUTPUT_DIR, 'crawl-log.json');

// Crawler state
const crawledUrls = new Set();
const queue = [];
const errors = [];
const startTime = new Date();

/**
 * Initialize crawler
 */
async function init() {
    console.log('========================================');
    console.log('  AVIR Enhanced Crawler');
    console.log('========================================');
    console.log(`Target: ${BASE_URL}`);
    console.log(`Output: ${OUTPUT_DIR}`);
    console.log('Starting crawl...');
    console.log('');

    // Ensure output directory exists
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    // Add homepage to queue
    queue.push({ url: BASE_URL, depth: 0 });
}

/**
 * Get local file path for a URL
 */
function getLocalPath(url) {
    try {
        const urlObj = new URL(url);
        let pathname = urlObj.pathname;

        // Remove trailing slash
        pathname = pathname.replace(/\/$/, '');

        // Root page becomes index.html
        if (pathname === '' || pathname === '/') {
            return path.join(OUTPUT_DIR, 'index.html');
        }

        // Add index.html to directories
        return path.join(OUTPUT_DIR, pathname, 'index.html');
    } catch (err) {
        throw new Error(`Invalid URL: ${url}`);
    }
}

/**
 * Determine if URL should be crawled
 */
function shouldCrawlUrl(url) {
    try {
        const urlObj = new URL(url);

        // Must be same origin
        if (urlObj.origin !== new URL(BASE_URL).origin) {
            return false;
        }

        // Skip specific patterns
        const skipPatterns = [
            /\/api\//,
            /\/_next\//,
            /\.json$/,
            /\.xml$/,
            /\.txt$/,
        ];

        for (const pattern of skipPatterns) {
            if (pattern.test(url)) {
                return false;
            }
        }

        return true;
    } catch (err) {
        return false;
    }
}

/**
 * Extract links from page
 */
function extractLinks(page, baseUrl) {
    const links = new Set();

    // Get all anchor links
    const anchors = page.locator('a[href]');
    const count = anchors.count();

    for (let i = 0; i < count; i++) {
        const href = anchors.nth(i).getAttribute('href');
        if (href) {
            try {
                // Make absolute URL
                const absoluteUrl = new URL(href, baseUrl).toString();

                // Check if we should crawl it
                if (shouldCrawlUrl(absoluteUrl)) {
                    links.add(absoluteUrl);
                }
            } catch (err) {
                // Invalid URL, skip
            }
        }
    }

    return Array.from(links);
}

/**
 * Save page HTML
 */
async function savePage(url, html) {
    const localPath = getLocalPath(url);
    const dir = path.dirname(localPath);

    // Create directory structure
    await fs.mkdir(dir, { recursive: true });

    // Save HTML
    await fs.writeFile(localPath, html, 'utf8');

    // Make readable
    await fs.chmod(localPath, 0o644);
}

/**
 * Crawl a single page
 */
async function crawlPage(browser, { url, depth }) {
    console.log(`[CRAWL] ${url} (depth: ${depth})`);

    const page = await browser.newPage();

    try {
        // Set viewport
        await page.setViewportSize({ width: 1920, height: 1080 });

        // Navigate to page
        const response = await page.goto(url, {
            waitUntil: 'networkidle',
            timeout: 30000,
        });

        // Check response status
        if (!response || !response.ok()) {
            throw new Error(`HTTP ${response ? response.status() : 'no response'}`);
        }

        // Extract links
        const links = extractLinks(page, url);

        // Save page
        const html = await page.content();
        await savePage(url, html);

        // Queue new links
        for (const link of links) {
            if (!crawledUrls.has(link)) {
                crawledUrls.add(link);
                queue.push({ url: link, depth: depth + 1 });
            }
        }

        console.log(`  ✓ Saved ${links.length} links for crawling`);

    } catch (err) {
        console.error(`  ✗ Error: ${err.message}`);
        errors.push({ url, error: err.message });
    } finally {
        await page.close();
    }
}

/**
 * Run crawler
 */
async function runCrawler() {
    const browser = await chromium.launch();

    try {
        while (queue.length > 0) {
            const task = queue.shift();
            await crawlPage(browser, task);
        }
    } finally {
        await browser.close();
    }
}

/**
 * Save crawl log
 */
async function saveCrawlLog() {
    const completedAt = new Date();

    const log = {
        startedAt: startTime.toISOString(),
        completedAt: completedAt.toISOString(),
        durationMs: completedAt - startTime,
        pagesCrawled: crawledUrls.size,
        errors: errors,
    };

    await fs.writeFile(CRAWL_LOG_FILE, JSON.stringify(log, null, 2), 'utf8');

    console.log('');
    console.log('========================================');
    console.log('  Crawl Complete');
    console.log('========================================');
    console.log(`Pages crawled: ${crawledUrls.size}`);
    console.log(`Errors: ${errors.length}`);
    console.log(`Duration: ${(log.durationMs / 1000).toFixed(2)}s`);
    console.log(`Crawl log: ${CRAWL_LOG_FILE}`);
    console.log('');

    if (errors.length > 0) {
        console.log('Errors encountered:');
        errors.forEach(err => {
            console.log(`  - ${err.url}: ${err.error}`);
        });
        console.log('');
    }
}

/**
 * Main entry point
 */
async function main() {
    try {
        await init();
        await runCrawler();
        await saveCrawlLog();
        process.exit(0);
    } catch (err) {
        console.error('Fatal error:', err);
        process.exit(1);
    }
}

// Run if executed directly
if (require.main === module) {
    main();
}

module.exports = { main };
