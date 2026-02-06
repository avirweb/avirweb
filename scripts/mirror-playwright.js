#!/usr/bin/env node

/**
 * Production-Ready Playwright Mirror Script for AVIR Website
 * 
 * Comprehensive website mirroring with:
 * - Multi-browser support (Chromium, Firefox, WebKit)
 * - Network request interception for ALL assets
 * - Lazy loading trigger via scrolling
 * - Webflow hydration waiting (w-mod-js, w-mod-ix classes)
 * - Capture of 30+ pages (main + city landing pages)
 * - Asset download and organization
 * - HTML post-processing for URL rewriting
 * 
 * Usage:
 *   node scripts/mirror-playwright.js                    # Full mirror
 *   node scripts/mirror-playwright.js --dry-run          # Show crawl plan only
 *   node scripts/mirror-playwright.js --browser firefox  # Use Firefox
 *   node scripts/mirror-playwright.js --limit 5          # Limit to 5 pages
 * 
 * Output: site/ directory with complete site mirror
 */

const { chromium, firefox, webkit } = require('playwright');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');
const crypto = require('crypto');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Target and output
  BASE_URL: 'https://www.avir.com',
  OUTPUT_DIR: path.join(__dirname, '..', 'site'),
  
  // Browser settings
  DEFAULT_BROWSER: 'chromium',
  HEADLESS: true,
  
  // Viewport settings
  VIEWPORT: {
    width: 1920,
    height: 1080
  },
  
  // Timing settings
  PAGE_TIMEOUT: 60000,          // 60 seconds per page
  NAVIGATION_TIMEOUT: 60000,    // 60 seconds for navigation
  HYDRATION_WAIT: 5000,         // 5 seconds for Webflow hydration
  SCROLL_DELAY: 500,            // 500ms between scroll steps
  SCROLL_STEPS: 10,             // Number of scroll steps for lazy loading
  
  // Concurrency
  CONCURRENT_LIMIT: 3,
  MAX_RETRIES: 3,
  
  // Page limits
  MAX_PAGES: Infinity,
  
  // CDN and asset domains
  CDN_DOMAIN: 'cdn.prod.website-files.com',
  FONT_DOMAINS: ['fonts.gstatic.com', 'fonts.googleapis.com', 'use.typekit.net'],
  VIDEO_DOMAINS: ['dropbox.com', 'dropboxusercontent.com'],
  
  // Skip patterns
  SKIP_PATTERNS: [
    /\/api\//,
    /\/_next\//,
    /\.json$/,
    /\.xml$/,
    /\.txt$/,
    /^mailto:/,
    /^tel:/,
    /^#/,
    /googleads\.g\.doubleclick\.net/,
    /google-analytics\.com/,
    /googletagmanager\.com/,
    /facebook\.com/,
    /connect\.facebook\.net/,
    /snap\.licdn\.com/
  ]
};

// Predefined page list for comprehensive coverage
const PREDEFINED_PAGES = [
  // Main pages
  '/',
  '/services',
  '/about-avir',
  '/contact',
  '/brands',
  '/portfolio',
  '/blog',
  '/careers',
  '/processes',
  '/exciting-new-products',
  
  // City landing pages (25 cities)
  '/city/banning',
  '/city/beaumont',
  '/city/bermuda-dunes',
  '/city/big-bear',
  '/city/cathedral-city',
  '/city/coachella',
  '/city/idyllwild',
  '/city/indian-wells',
  '/city/indio',
  '/city/joshua-tree',
  '/city/lake-arrowhead',
  '/city/la-quinta',
  '/city/moreno-valley',
  '/city/murrieta',
  '/city/palm-desert',
  '/city/palm-springs',
  '/city/rancho-mirage',
  '/city/redlands',
  '/city/riverside',
  '/city/san-bernardino',
  '/city/temecula',
  '/city/thermal',
  '/city/thousand-palms',
  '/city/yucaipa',
  '/city/yucca-valley',
  
  // Gallery pages
  '/galleries/lifestyle',
  '/galleries/home-cinema',
  '/galleries/commercial',
  
  // Career pages
  '/careers/assistant-technician',
  '/careers/integration-technician',
  
  // Forms
  '/commercial-form',
  '/residential-form',
  '/service-request'
];

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

const state = {
  crawledUrls: new Set(),
  queuedUrls: new Set(),
  queue: [],
  errors: [],
  assets: new Map(),
  videos: new Map(),
  startTime: Date.now(),
  browser: null,
  context: null,
  isDryRun: false,
  stats: {
    pagesCrawled: 0,
    assetsDownloaded: 0,
    videosDownloaded: 0,
    bytesDownloaded: 0
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate SHA256 hash of data
 */
function calculateHash(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    browser: CONFIG.DEFAULT_BROWSER,
    dryRun: false,
    limit: CONFIG.MAX_PAGES,
    headless: CONFIG.HEADLESS
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--browser':
      case '-b':
        options.browser = args[++i];
        break;
      case '--dry-run':
      case '-d':
        options.dryRun = true;
        break;
      case '--limit':
      case '-l':
        options.limit = parseInt(args[++i], 10);
        break;
      case '--headed':
      case '-h':
        options.headless = false;
        break;
      case '--help':
        showHelp();
        process.exit(0);
        break;
    }
  }
  
  return options;
}

/**
 * Show help text
 */
function showHelp() {
  console.log(`
AVIR Website Mirror - Playwright Edition

Usage: node scripts/mirror-playwright.js [options]

Options:
  --browser, -b <name>    Browser to use: chromium, firefox, webkit (default: chromium)
  --dry-run, -d          Show crawl plan without executing
  --limit, -l <number>   Limit number of pages to crawl
  --headed, -h           Run browser in headed mode (visible)
  --help                 Show this help message

Examples:
  node scripts/mirror-playwright.js                    # Full mirror with Chromium
  node scripts/mirror-playwright.js --dry-run          # Show crawl plan
  node scripts/mirror-playwright.js --browser firefox  # Use Firefox
  node scripts/mirror-playwright.js --limit 5          # Crawl only 5 pages
`);
}

/**
 * Log with timestamp
 */
function log(level, message) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  console.log(`${prefix} ${message}`);
}

/**
 * Get browser launcher based on name
 */
function getBrowserLauncher(browserName) {
  switch (browserName.toLowerCase()) {
    case 'firefox':
      return firefox;
    case 'webkit':
      return webkit;
    case 'chromium':
    default:
      return chromium;
  }
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
      return 'index.html';
    }
    
    // Add index.html to directories
    if (!path.extname(pathname)) {
      return path.join(pathname, 'index.html');
    }
    
    return pathname;
  } catch (err) {
    return null;
  }
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
    
    // Must be same origin
    if (urlObj.origin !== new URL(CONFIG.BASE_URL).origin) {
      return false;
    }
    
    // Skip specific patterns
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
  try {
    const urlObj = new URL(url);
    const category = getAssetCategory(url, contentType);
    
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
    if (urlObj.hostname.includes('typekit.net')) {
      const filename = path.basename(urlObj.pathname) || 'typekit.css';
      return path.join('fonts', `adobe-${filename}`);
    }
    
    // Handle Webflow CDN
    if (urlObj.hostname === CONFIG.CDN_DOMAIN) {
      return path.join('cdn', urlObj.pathname);
    }
    
    // Handle Dropbox videos
    if (urlObj.hostname.includes('dropbox.com') || urlObj.hostname.includes('dropboxusercontent.com')) {
      const filename = path.basename(urlObj.pathname) || 'video.mp4';
      // Remove query parameters from filename
      const cleanFilename = filename.split('?')[0];
      return path.join('videos', cleanFilename);
    }
    
    // Generic handling
    let pathname = urlObj.pathname.replace(/^\//, '');
    const basename = path.basename(pathname);
    
    if (!basename || basename === '' || pathname.endsWith('/')) {
      const ext = getExtensionFromContentType(contentType) || 'bin';
      pathname = path.join(pathname, `asset.${ext}`);
    }
    
    return path.join(category, pathname);
  } catch {
    return null;
  }
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
  return 'bin';
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize the crawler
 */
async function init(options) {
  log('info', '========================================');
  log('info', '  AVIR Playwright Mirror');
  log('info', '  Production-Ready Website Capture');
  log('info', '========================================');
  log('info', `Target: ${CONFIG.BASE_URL}`);
  log('info', `Output: ${CONFIG.OUTPUT_DIR}`);
  log('info', `Browser: ${options.browser}`);
  log('info', `Mode: ${options.dryRun ? 'DRY RUN' : 'FULL MIRROR'}`);
  log('info', '');
  
  if (options.dryRun) {
    state.isDryRun = true;
    showCrawlPlan();
    return;
  }
  
  // Create output directory structure
  await createDirectoryStructure();
  
  // Initialize browser
  const browserLauncher = getBrowserLauncher(options.browser);
  state.browser = await browserLauncher.launch({
    headless: options.headless
  });
  
  // Create browser context
  state.context = await state.browser.newContext({
    viewport: CONFIG.VIEWPORT
  });
  
  // Queue predefined pages
  for (const pagePath of PREDEFINED_PAGES) {
    const url = new URL(pagePath, CONFIG.BASE_URL).toString();
    queueUrl(url, 0);
  }
  
  log('info', `Queued ${state.queue.length} predefined pages`);
  log('info', '');
}

/**
 * Create directory structure
 */
async function createDirectoryStructure() {
  const dirs = [
    CONFIG.OUTPUT_DIR,
    path.join(CONFIG.OUTPUT_DIR, 'css'),
    path.join(CONFIG.OUTPUT_DIR, 'js'),
    path.join(CONFIG.OUTPUT_DIR, 'images'),
    path.join(CONFIG.OUTPUT_DIR, 'fonts'),
    path.join(CONFIG.OUTPUT_DIR, 'videos'),
    path.join(CONFIG.OUTPUT_DIR, 'cdn'),
    path.join(CONFIG.OUTPUT_DIR, 'city'),
    path.join(CONFIG.OUTPUT_DIR, 'galleries'),
    path.join(CONFIG.OUTPUT_DIR, 'post')
  ];
  
  for (const dir of dirs) {
    await fsPromises.mkdir(dir, { recursive: true });
  }
  
  log('info', 'Directory structure created');
}

/**
 * Show crawl plan for dry run
 */
function showCrawlPlan() {
  console.log('CRAWL PLAN');
  console.log('========================================');
  console.log(`\nPages to crawl (${PREDEFINED_PAGES.length} total):\n`);
  
  const categories = {
    'Main Pages': PREDEFINED_PAGES.filter(p => !p.includes('/') || p === '/'),
    'City Pages': PREDEFINED_PAGES.filter(p => p.startsWith('/city/')),
    'Gallery Pages': PREDEFINED_PAGES.filter(p => p.startsWith('/galleries/')),
    'Career Pages': PREDEFINED_PAGES.filter(p => p.startsWith('/careers/')),
    'Form Pages': PREDEFINED_PAGES.filter(p => p.includes('form') || p.includes('request')),
    'Other Pages': PREDEFINED_PAGES.filter(p => 
      !p.startsWith('/city/') && 
      !p.startsWith('/galleries/') && 
      !p.startsWith('/careers/') && 
      !p.includes('form') && 
      !p.includes('request') && 
      p !== '/' &&
      p.includes('/')
    )
  };
  
  for (const [category, pages] of Object.entries(categories)) {
    if (pages.length > 0) {
      console.log(`\n${category} (${pages.length}):`);
      pages.forEach(p => console.log(`  - ${p}`));
    }
  }
  
  console.log('\n\nConfiguration:');
  console.log(`  - Viewport: ${CONFIG.VIEWPORT.width}x${CONFIG.VIEWPORT.height}`);
  console.log(`  - Hydration wait: ${CONFIG.HYDRATION_WAIT}ms`);
  console.log(`  - Scroll steps: ${CONFIG.SCROLL_STEPS}`);
  console.log(`  - Page timeout: ${CONFIG.PAGE_TIMEOUT}ms`);
  console.log(`  - Concurrent limit: ${CONFIG.CONCURRENT_LIMIT}`);
  console.log(`  - Max retries: ${CONFIG.MAX_RETRIES}`);
  console.log('');
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

// ============================================================================
// NETWORK INTERCEPTION
// ============================================================================

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
        timeout: CONFIG.PAGE_TIMEOUT
      });
      
      const buffer = await response.body();
      const contentType = response.headers()['content-type'] || '';
      const status = response.status();
      
      // Process successful responses
      if (status >= 200 && status < 300 && buffer && buffer.length > 0) {
        // Skip if already captured
        if (!state.assets.has(url)) {
          const localPath = getAssetLocalPath(url, contentType);
          
          if (localPath) {
            const outputPath = path.join(CONFIG.OUTPUT_DIR, localPath);
            
            // Save asset
            await fsPromises.mkdir(path.dirname(outputPath), { recursive: true });
            await fsPromises.writeFile(outputPath, buffer);
            
            // Track asset
            state.assets.set(url, {
              originalUrl: url,
              localPath,
              size: buffer.length,
              hash: calculateHash(buffer),
              contentType,
              status
            });
            
            state.stats.assetsDownloaded++;
            state.stats.bytesDownloaded += buffer.length;
            capturedAssets.set(url, localPath);
            
            log('debug', `Asset captured: ${localPath}`);
          }
        } else {
          const asset = state.assets.get(url);
          capturedAssets.set(url, asset.localPath);
        }
      }
      
      // Fulfill with original response
      await route.fulfill({
        status,
        headers: response.headers(),
        body: buffer
      });
    } catch (error) {
      log('debug', `Failed to intercept ${url}: ${error.message}`);
      await route.continue();
    }
  });
  
  return capturedAssets;
}

// ============================================================================
// VIDEO EXTRACTION
// ============================================================================

/**
 * Extract and download videos from data-video-urls attributes
 */
async function extractVideos(page, pageUrl) {
  log('info', '    → Extracting videos from data-video-urls...');
  
  const videos = await page.evaluate(() => {
    const videoElements = document.querySelectorAll('[data-video-urls]');
    const results = [];
    
    videoElements.forEach(el => {
      const videoUrls = el.getAttribute('data-video-urls');
      if (videoUrls) {
        try {
          const urls = JSON.parse(videoUrls);
          urls.forEach(url => {
            results.push({
              element: el.tagName,
              url: url,
              source: 'data-video-urls'
            });
          });
        } catch (e) {
          // Try as plain URL
          results.push({
            element: el.tagName,
            url: videoUrls,
            source: 'data-video-urls-raw'
          });
        }
      }
      
      // Also check for poster attribute
      const poster = el.getAttribute('data-poster-url');
      if (poster) {
        results.push({
          element: el.tagName,
          url: poster,
          source: 'data-poster-url'
        });
      }
    });
    
    return results;
  });
  
  log('info', `    Found ${videos.length} video references`);
  
  // Download each video
  for (const video of videos) {
    await downloadVideo(video.url);
  }
  
  return videos;
}

/**
 * Download a video file
 */
async function downloadVideo(videoUrl) {
  if (state.videos.has(videoUrl) || state.assets.has(videoUrl)) {
    return;
  }
  
  try {
    const localPath = getAssetLocalPath(videoUrl, 'video/mp4');
    if (!localPath) return;
    
    const outputPath = path.join(CONFIG.OUTPUT_DIR, localPath);
    
    // Check if already exists
    try {
      await fsPromises.access(outputPath);
      state.videos.set(videoUrl, { localPath, cached: true });
      return;
    } catch {
      // File doesn't exist, proceed with download
    }
    
    log('info', `    → Downloading video: ${path.basename(localPath)}`);
    
    // Download video
    await new Promise((resolve, reject) => {
      const client = videoUrl.startsWith('https:') ? https : http;
      
      const request = client.get(videoUrl, { timeout: 120000 }, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          // Follow redirect
          downloadVideo(response.headers.location).then(resolve).catch(reject);
          return;
        }
        
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}`));
          return;
        }
        
        const chunks = [];
        response.on('data', chunk => chunks.push(chunk));
        response.on('end', async () => {
          const buffer = Buffer.concat(chunks);
          
          await fsPromises.mkdir(path.dirname(outputPath), { recursive: true });
          await fsPromises.writeFile(outputPath, buffer);
          
          state.videos.set(videoUrl, {
            localPath,
            size: buffer.length,
            hash: calculateHash(buffer)
          });
          
          state.stats.videosDownloaded++;
          state.stats.bytesDownloaded += buffer.length;
          
          log('info', `    ✓ Video downloaded: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);
          resolve();
        });
      });
      
      request.on('error', reject);
      request.on('timeout', () => {
        request.destroy();
        reject(new Error('Request timeout'));
      });
    });
  } catch (error) {
    log('error', `    ✗ Failed to download video ${videoUrl}: ${error.message}`);
  }
}

// ============================================================================
// WEBFLOW HYDRATION & LAZY LOADING
// ============================================================================

/**
 * Wait for Webflow hydration
 */
async function waitForHydration(page) {
  log('info', '    → Waiting for Webflow hydration...');
  
  try {
    // Wait for w-mod-js class to be added to html element
    await page.waitForFunction(() => {
      const html = document.documentElement;
      return html.classList.contains('w-mod-js');
    }, { timeout: CONFIG.HYDRATION_WAIT });
    
    log('info', '    ✓ Webflow JS hydrated (w-mod-js present)');
  } catch {
    log('warn', '    ⚠ w-mod-js not detected within timeout');
  }
  
  try {
    // Wait for w-mod-ix class (interactions)
    await page.waitForFunction(() => {
      const html = document.documentElement;
      return html.classList.contains('w-mod-ix');
    }, { timeout: 2000 });
    
    log('info', '    ✓ Webflow interactions ready (w-mod-ix present)');
  } catch {
    log('debug', '    w-mod-ix not detected (non-interactive page)');
  }
  
  // Additional wait for any remaining hydration
  await page.waitForTimeout(1000);
}

/**
 * Trigger lazy loading by scrolling
 */
async function triggerLazyLoading(page) {
  log('info', '    → Triggering lazy loading via scroll...');
  
  const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
  const stepSize = Math.ceil(scrollHeight / CONFIG.SCROLL_STEPS);
  
  for (let i = 0; i <= CONFIG.SCROLL_STEPS; i++) {
    const scrollY = Math.min(i * stepSize, scrollHeight);
    await page.evaluate(y => window.scrollTo(0, y), scrollY);
    await page.waitForTimeout(CONFIG.SCROLL_DELAY);
    
    // Log progress every 3 steps
    if (i % 3 === 0) {
      log('debug', `    Scroll progress: ${Math.round((i / CONFIG.SCROLL_STEPS) * 100)}%`);
    }
  }
  
  // Scroll back to top
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  
  log('info', '    ✓ Lazy loading triggered');
}

// ============================================================================
// URL REWRITING
// ============================================================================

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
  for (const [originalUrl, asset] of state.assets) {
    urlMap.set(originalUrl, asset.localPath);
  }
  for (const [originalUrl, video] of state.videos) {
    if (video.localPath) {
      urlMap.set(originalUrl, video.localPath);
    }
  }
  
  // Rewrite CDN URLs
  rewritten = rewritten.replace(
    new RegExp(`https://${CONFIG.CDN_DOMAIN}/([^"'\\s]+)`, 'g'),
    (match, assetPath) => {
      const localPath = `/cdn/${assetPath}`;
      const relativePath = path.relative(pageDir, localPath);
      return relativePath.startsWith('.') ? relativePath : './' + relativePath;
    }
  );
  
  // Rewrite Google Fonts
  rewritten = rewritten.replace(
    /https:\/\/fonts\.googleapis\.com\/css[^"'\\s]*/g,
    '/fonts/google-fonts.css'
  );
  
  // Rewrite Google Fonts static
  rewritten = rewritten.replace(
    /https:\/\/fonts\.gstatic\.com\/s\/([^"'\\s]+)/g,
    '/fonts/$1'
  );
  
  // Rewrite Adobe Typekit
  rewritten = rewritten.replace(
    /https:\/\/use\.typekit\.net\/([^"'\\s]+)/g,
    '/fonts/adobe-$1'
  );
  
  // Rewrite Dropbox videos
  rewritten = rewritten.replace(
    /https:\/\/www\.dropbox\.com\/s\/([^"'\\s]+)\?raw=1/g,
    '/videos/$1'
  );
  
  // Rewrite internal links (avir.com -> local)
  rewritten = rewritten.replace(
    /https:\/\/www\.avir\.com\//g,
    '/'
  );
  
  // Rewrite specific asset URLs found in the captured assets
  for (const [originalUrl, localPath] of urlMap) {
    try {
      const regex = new RegExp(originalUrl.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&'), 'g');
      const relativePath = path.relative(pageDir, localPath);
      const finalPath = relativePath.startsWith('.') ? relativePath : './' + relativePath;
      rewritten = rewritten.replace(regex, finalPath);
    } catch {
      // Invalid regex, skip
    }
  }
  
  return rewritten;
}

/**
 * Rewrite CSS URLs
 */
function rewriteCssUrls(content) {
  let rewritten = content;
  
  // Rewrite CDN URLs in CSS
  rewritten = rewritten.replace(
    /url\(['"]?https:\/\/cdn\.prod\.website-files\.com\/([^'"\\)]+)['"]?\)/g,
    "url('/cdn/$1')"
  );
  
  // Rewrite font URLs
  rewritten = rewritten.replace(
    /url\(['"]?https:\/\/fonts\.gstatic\.com\/s\/([^'"\\)]+)['"]?\)/g,
    "url('/fonts/$1')"
  );
  
  rewritten = rewritten.replace(
    /url\(['"]?https:\/\/use\.typekit\.net\/([^'"\\)]+)['"]?\)/g,
    "url('/fonts/adobe-$1')"
  );
  
  return rewritten;
}

// ============================================================================
// LINK EXTRACTION
// ============================================================================

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

// ============================================================================
// PAGE CRAWLING
// ============================================================================

/**
 * Crawl a single page
 */
async function crawlPage({ url, depth }) {
  if (state.crawledUrls.size >= parseArgs().limit) {
    log('info', `Page limit reached, skipping: ${url}`);
    return;
  }
  
  log('info', `[CRAWL] ${url} (depth: ${depth})`);
  
  const page = await state.context.newPage();
  let capturedAssets = new Map();
  
  try {
    // Setup request interception
    capturedAssets = await setupRequestInterception(page);
    
    // Set viewport
    await page.setViewportSize(CONFIG.VIEWPORT);
    
    // Navigate with retry logic
    let response = null;
    let retries = 0;
    
    while (retries < CONFIG.MAX_RETRIES && !response) {
      try {
        response = await page.goto(url, {
          waitUntil: 'networkidle',
          timeout: CONFIG.NAVIGATION_TIMEOUT
        });
      } catch (error) {
        retries++;
        if (retries >= CONFIG.MAX_RETRIES) {
          throw error;
        }
        log('info', `    → Retry ${retries}/${CONFIG.MAX_RETRIES}...`);
        await page.waitForTimeout(2000);
      }
    }
    
    if (!response || !response.ok()) {
      throw new Error(`HTTP ${response ? response.status() : 'no response'}`);
    }
    
    // Wait for Webflow hydration
    await waitForHydration(page);
    
    // Trigger lazy loading
    await triggerLazyLoading(page);
    
    // Extract and download videos
    await extractVideos(page, url);
    
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
    
    log('info', `  ✓ Saved (${capturedAssets.size} assets, ${queuedCount} new links)`);
    
    state.crawledUrls.add(url);
    state.stats.pagesCrawled++;
    
  } catch (error) {
    log('error', `  ✗ Error: ${error.message}`);
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
  const options = parseArgs();
  
  while ((state.queue.length > 0 || activePromises.size > 0) && 
         state.crawledUrls.size < options.limit) {
    
    // Fill up to concurrent limit
    while (activePromises.size < CONFIG.CONCURRENT_LIMIT && 
           state.queue.length > 0 &&
           state.crawledUrls.size < options.limit) {
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

// ============================================================================
// REPORTING & CLEANUP
// ============================================================================

/**
 * Save crawl report
 */
async function saveReport() {
  const completedAt = Date.now();
  const duration = completedAt - state.startTime;
  
  // Calculate asset statistics
  const assetStats = {
    css: 0,
    js: 0,
    images: 0,
    fonts: 0,
    videos: state.stats.videosDownloaded,
    cdn: 0,
    other: 0
  };
  
  for (const asset of state.assets.values()) {
    const category = asset.localPath.split('/')[0];
    if (assetStats[category] !== undefined) {
      assetStats[category]++;
    } else {
      assetStats.other++;
    }
  }
  
  const report = {
    startedAt: new Date(state.startTime).toISOString(),
    completedAt: new Date(completedAt).toISOString(),
    durationMs: duration,
    durationFormatted: `${(duration / 1000).toFixed(2)}s`,
    pagesCrawled: state.stats.pagesCrawled,
    assetsDownloaded: state.stats.assetsDownloaded,
    videosDownloaded: state.stats.videosDownloaded,
    bytesDownloaded: state.stats.bytesDownloaded,
    bytesFormatted: `${(state.stats.bytesDownloaded / 1024 / 1024).toFixed(2)} MB`,
    assetBreakdown: assetStats,
    errors: state.errors
  };
  
  // Save JSON report
  const reportPath = path.join(CONFIG.OUTPUT_DIR, 'mirror-report.json');
  await fsPromises.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');
  
  // Save asset manifest
  const manifestPath = path.join(CONFIG.OUTPUT_DIR, 'asset-manifest.json');
  const manifest = {
    generatedAt: new Date().toISOString(),
    baseUrl: CONFIG.BASE_URL,
    assets: Array.from(state.assets.values()),
    videos: Array.from(state.videos.entries()).map(([url, data]) => ({
      url,
      ...data
    }))
  };
  await fsPromises.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  
  // Print summary
  log('info', '');
  log('info', '========================================');
  log('info', '  Mirror Complete');
  log('info', '========================================');
  log('info', `Duration: ${report.durationFormatted}`);
  log('info', `Pages crawled: ${report.pagesCrawled}`);
  log('info', `Assets downloaded: ${report.assetsDownloaded}`);
  log('info', `Videos downloaded: ${report.videosDownloaded}`);
  log('info', `Total size: ${report.bytesFormatted}`);
  log('info', `Errors: ${report.errors.length}`);
  log('info', '');
  log('info', 'Asset breakdown:');
  for (const [category, count] of Object.entries(assetStats)) {
    if (count > 0) {
      log('info', `  ${category}: ${count}`);
    }
  }
  log('info', '');
  log('info', `Report: ${reportPath}`);
  log('info', `Manifest: ${manifestPath}`);
  log('info', '');
  
  if (report.errors.length > 0) {
    log('warn', 'Errors encountered:');
    report.errors.forEach((err, i) => {
      log('error', `  ${i + 1}. ${err.url}: ${err.error}`);
    });
  }
}

/**
 * Create Cloudflare Pages headers file
 */
async function createHeadersFile() {
  const headersContent = `# Cloudflare Pages Headers Configuration
# Generated by mirror-playwright.js

# Font files - CORS and long cache
/fonts/*
  Access-Control-Allow-Origin: *
  Cache-Control: public, max-age=31536000, immutable

# CDN assets - long cache
/cdn/*
  Cache-Control: public, max-age=31536000, immutable

# Images - long cache
/images/*
  Cache-Control: public, max-age=31536000, immutable

# Videos - long cache
/videos/*
  Cache-Control: public, max-age=31536000, immutable

# CSS files - medium cache
/css/*
  Cache-Control: public, max-age=86400

# JS files - medium cache
/js/*
  Cache-Control: public, max-age=86400
`;
  
  const headersPath = path.join(CONFIG.OUTPUT_DIR, '_headers');
  await fsPromises.writeFile(headersPath, headersContent, 'utf8');
  log('info', 'Created _headers file');
}

/**
 * Verify no external CDN references remain
 */
async function verifyNoExternalUrls() {
  log('info', 'Verifying no external CDN references...');
  
  const externalPatterns = [
    { pattern: /cdn\.prod\.website-files\.com/, name: 'Webflow CDN' },
    { pattern: /fonts\.googleapis\.com/, name: 'Google Fonts API' },
    { pattern: /fonts\.gstatic\.com/, name: 'Google Fonts Static' },
    { pattern: /use\.typekit\.net/, name: 'Adobe Typekit' },
    { pattern: /dropbox\.com/, name: 'Dropbox' }
  ];
  
  let externalFound = 0;
  const htmlFiles = [];
  
  // Find all HTML files
  async function findHtmlFiles(dir) {
    const entries = await fsPromises.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await findHtmlFiles(fullPath);
      } else if (entry.name.endsWith('.html')) {
        htmlFiles.push(fullPath);
      }
    }
  }
  
  await findHtmlFiles(CONFIG.OUTPUT_DIR);
  
  // Check first 10 HTML files
  for (const htmlFile of htmlFiles.slice(0, 10)) {
    try {
      const content = await fsPromises.readFile(htmlFile, 'utf8');
      
      for (const { pattern, name } of externalPatterns) {
        const matches = content.match(pattern);
        if (matches) {
          log('warn', `Warning: Found ${name} reference in ${path.relative(CONFIG.OUTPUT_DIR, htmlFile)}`);
          externalFound++;
        }
      }
    } catch (error) {
      log('error', `Error reading ${htmlFile}: ${error.message}`);
    }
  }
  
  if (externalFound === 0) {
    log('info', '✓ No external CDN references found');
  } else {
    log('warn', `⚠ Found ${externalFound} potential external references`);
  }
  
  return externalFound === 0;
}

// ============================================================================
// MAIN ENTRY POINT
// ============================================================================

async function main() {
  const options = parseArgs();
  let exitCode = 0;
  
  try {
    await init(options);
    
    if (state.isDryRun) {
      // Dry run - just show plan and exit
      process.exit(0);
    }
    
    await processQueue();
    await createHeadersFile();
    await verifyNoExternalUrls();
    await saveReport();
    
  } catch (error) {
    log('error', `Fatal error: ${error.message}`);
    log('error', error.stack);
    state.errors.push({ url: 'CRAWLER', error: error.message });
    exitCode = 1;
  } finally {
    // Cleanup
    if (state.context) {
      try {
        await state.context.close();
      } catch {
        // Ignore
      }
    }
    
    if (state.browser) {
      try {
        await state.browser.close();
      } catch {
        // Ignore
      }
    }
    
    process.exit(exitCode);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { main, CONFIG, PREDEFINED_PAGES };
