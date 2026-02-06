/**
 * Utility functions for the Intelligent Asset Interceptor
 * Handles URL mapping, path conversion, logging, and download utilities
 */

const path = require('path');
const fs = require('fs').promises;
const https = require('https');
const http = require('http');
const { URL } = require('url');
const crypto = require('crypto');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  BASE_URL: 'https://www.avir.com',
  OUTPUT_DIR: path.join(__dirname, '..', '..', 'site'),
  
  // Timing
  HYDRATION_WAIT: 8000,
  ANIMATION_WAIT: 3000,
  SCROLL_STEPS: 20,
  SCROLL_DELAY: 300,
  MAX_RETRIES: 5,
  CONCURRENT_DOWNLOADS: 5,
  REQUEST_TIMEOUT: 30000,
  
  // Asset patterns for URL mapping
  ASSET_PATTERNS: [
    { 
      pattern: /cdn\.prod\.website-files\.com/, 
      localPath: '/cdn',
      category: 'cdn'
    },
    { 
      pattern: /fonts\.googleapis\.com/, 
      localPath: '/fonts',
      category: 'fonts'
    },
    { 
      pattern: /fonts\.gstatic\.com/, 
      localPath: '/fonts',
      category: 'fonts'
    },
    {
      pattern: /use\.typekit\.net/,
      localPath: '/fonts',
      category: 'fonts'
    },
    {
      pattern: /ajax\.googleapis\.com/,
      localPath: '/js',
      category: 'js'
    }
  ],
  
  // Content type to extension mapping
  CONTENT_TYPE_EXTENSIONS: {
    'text/css': 'css',
    'text/javascript': 'js',
    'application/javascript': 'js',
    'application/json': 'json',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/svg+xml': 'svg',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/x-icon': 'ico',
    'font/woff2': 'woff2',
    'font/woff': 'woff',
    'font/ttf': 'ttf',
    'font/otf': 'otf',
    'application/font-woff2': 'woff2',
    'application/font-woff': 'woff',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'text/html': 'html'
  }
};

// ============================================================================
// LOGGING
// ============================================================================

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  SUCCESS: 4
};

let currentLogLevel = LOG_LEVELS.INFO;

function setLogLevel(level) {
  currentLogLevel = level;
}

function log(level, message, data = null) {
  const levelValue = LOG_LEVELS[level.toUpperCase()] || LOG_LEVELS.INFO;
  if (levelValue < currentLogLevel) return;
  
  const timestamp = new Date().toISOString();
  const icons = {
    DEBUG: '🔍',
    INFO: 'ℹ️',
    WARN: '⚠️',
    ERROR: '❌',
    SUCCESS: '✅'
  };
  
  const icon = icons[level.toUpperCase()] || '•';
  console.log(`${icon} [${timestamp}] [${level.toUpperCase()}] ${message}`);
  
  if (data && currentLogLevel <= LOG_LEVELS.DEBUG) {
    console.log('   Data:', typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
  }
}

// ============================================================================
// URL MAPPING
// ============================================================================

/**
 * Calculate SHA256 hash of data
 */
function calculateHash(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Get file extension from content type
 */
function getExtensionFromContentType(contentType = '') {
  const type = contentType.toLowerCase().split(';')[0].trim();
  return CONFIG.CONTENT_TYPE_EXTENSIONS[type] || null;
}

/**
 * Get extension from URL pathname
 */
function getExtensionFromUrl(url) {
  try {
    const urlObj = new URL(url);
    const ext = path.extname(urlObj.pathname).toLowerCase().replace('.', '');
    return ext || null;
  } catch {
    return null;
  }
}

/**
 * Determine asset category from URL and content type
 */
function getAssetCategory(url, contentType = '') {
  const ext = getExtensionFromUrl(url);
  const type = contentType.toLowerCase();
  
  if (ext === 'css' || type.includes('text/css')) return 'css';
  if (['js', 'mjs'].includes(ext) || type.includes('javascript')) return 'js';
  if (['jpg', 'jpeg', 'png', 'svg', 'webp', 'gif', 'ico', 'avif'].includes(ext) || type.includes('image/')) {
    return 'images';
  }
  if (['woff2', 'woff', 'ttf', 'otf', 'eot'].includes(ext) || type.includes('font/')) {
    return 'fonts';
  }
  if (['mp4', 'webm', 'mov', 'ogv'].includes(ext) || type.includes('video/')) {
    return 'videos';
  }
  
  return 'cdn';
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
  } catch {
    return null;
  }
}

/**
 * Map a URL to local path based on asset patterns
 */
function mapUrlToLocalPath(url, contentType = '') {
  try {
    const urlObj = new URL(url);
    
    // Check against all asset patterns
    for (const { pattern, localPath, category } of CONFIG.ASSET_PATTERNS) {
      if (pattern.test(url)) {
        // For fonts.googleapis.com, use a special filename
        if (urlObj.hostname === 'fonts.googleapis.com') {
          return path.join(localPath, 'google-fonts.css');
        }
        
        // For fonts.gstatic.com, extract font filename
        if (urlObj.hostname === 'fonts.gstatic.com') {
          const filename = path.basename(urlObj.pathname) || 'font.woff2';
          return path.join(localPath, filename);
        }
        
        // For typekit, use prefix
        if (urlObj.hostname.includes('typekit.net')) {
          const filename = path.basename(urlObj.pathname) || 'typekit.css';
          return path.join(localPath, `adobe-${filename}`);
        }
        
        // Default: map pathname under local path
        return path.join(localPath, urlObj.pathname);
      }
    }
    
    // Default categorization
    const category = getAssetCategory(url, contentType);
    return path.join(category, urlObj.pathname.replace(/^\//, ''));
  } catch {
    return null;
  }
}

/**
 * Check if URL is an asset that should be intercepted
 */
function isAssetUrl(url) {
  try {
    const urlObj = new URL(url);
    
    // Check against asset patterns
    for (const { pattern } of CONFIG.ASSET_PATTERNS) {
      if (pattern.test(url)) {
        return true;
      }
    }
    
    // Check file extension
    const ext = getExtensionFromUrl(url);
    if (ext && ['css', 'js', 'jpg', 'jpeg', 'png', 'svg', 'webp', 'gif', 
                 'woff2', 'woff', 'ttf', 'otf', 'eot', 'mp4', 'webm', 'ico'].includes(ext)) {
      return true;
    }
    
    return false;
  } catch {
    return false;
  }
}

/**
 * Get output file path for a URL
 */
function getOutputPath(url) {
  return path.join(CONFIG.OUTPUT_DIR, getLocalPath(url));
}

/**
 * Get full output path for an asset
 */
function getAssetOutputPath(url, contentType = '') {
  const localPath = mapUrlToLocalPath(url, contentType);
  if (!localPath) return null;
  return path.join(CONFIG.OUTPUT_DIR, localPath);
}

// ============================================================================
// DOWNLOAD UTILITIES
// ============================================================================

/**
 * Download a file with retry logic
 */
async function downloadFile(url, outputPath, options = {}) {
  const retries = options.retries || CONFIG.MAX_RETRIES;
  const timeout = options.timeout || CONFIG.REQUEST_TIMEOUT;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      log('DEBUG', `Downloading attempt ${attempt}/${retries}: ${url}`);
      
      const buffer = await new Promise((resolve, reject) => {
        const client = url.startsWith('https:') ? https : http;
        
        const request = client.get(url, { 
          timeout,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        }, (response) => {
          // Handle redirects
          if (response.statusCode === 301 || response.statusCode === 302) {
            const redirectUrl = response.headers.location;
            log('DEBUG', `Following redirect: ${redirectUrl}`);
            downloadFile(redirectUrl, outputPath, { ...options, retries: retries - attempt })
              .then(() => resolve(null))
              .catch(reject);
            return;
          }
          
          if (response.statusCode !== 200) {
            reject(new Error(`HTTP ${response.statusCode}`));
            return;
          }
          
          const chunks = [];
          response.on('data', chunk => chunks.push(chunk));
          response.on('end', () => resolve(Buffer.concat(chunks)));
        });
        
        request.on('error', reject);
        request.on('timeout', () => {
          request.destroy();
          reject(new Error('Request timeout'));
        });
      });
      
      if (buffer) {
        // Ensure directory exists
        await fs.mkdir(path.dirname(outputPath), { recursive: true });
        await fs.writeFile(outputPath, buffer);
        
        return {
          success: true,
          size: buffer.length,
          hash: calculateHash(buffer)
        };
      }
      
      return { success: true };
    } catch (error) {
      log('DEBUG', `Download attempt ${attempt} failed: ${error.message}`);
      
      if (attempt === retries) {
        return {
          success: false,
          error: error.message,
          attempts: retries
        };
      }
      
      // Exponential backoff
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return { success: false, error: 'Max retries exceeded' };
}

/**
 * Download multiple files with concurrency limit
 */
async function downloadFilesConcurrently(downloads, maxConcurrent = CONFIG.CONCURRENT_DOWNLOADS) {
  const results = [];
  const queue = [...downloads];
  const active = new Set();
  
  async function processNext() {
    if (queue.length === 0) return;
    
    const { url, outputPath, options } = queue.shift();
    const promise = downloadFile(url, outputPath, options).then(result => {
      results.push({ url, outputPath, ...result });
      active.delete(promise);
    });
    
    active.add(promise);
    
    if (active.size >= maxConcurrent) {
      await Promise.race(active);
    }
    
    await processNext();
  }
  
  // Start initial batch
  const starters = Array(Math.min(maxConcurrent, queue.length))
    .fill()
    .map(() => processNext());
  
  await Promise.all(starters);
  
  // Wait for remaining
  while (active.size > 0) {
    await Promise.race(active);
  }
  
  return results;
}

// ============================================================================
// CSS PARSING UTILITIES
// ============================================================================

/**
 * Extract URLs from CSS content
 * Handles: url(), @import, @font-face src
 */
function extractCssUrls(cssContent) {
  const urls = new Set();
  
  // Match url() patterns - handles both url('...') and url(...)
  const urlRegex = /url\(['"]?([^'"\)]+)['"]?\)/g;
  let match;
  while ((match = urlRegex.exec(cssContent)) !== null) {
    urls.add(match[1]);
  }
  
  // Match @import rules
  const importRegex = /@import\s+(?:url\(['"]?)?([^'"\);\s]+)/g;
  while ((match = importRegex.exec(cssContent)) !== null) {
    urls.add(match[1]);
  }
  
  // Match src: in @font-face
  const srcRegex = /src:\s*([^;]+)/g;
  while ((match = srcRegex.exec(cssContent)) !== null) {
    // Extract URLs from src declaration
    const srcContent = match[1];
    const srcUrlRegex = /url\(['"]?([^'"\)]+)['"]?\)/g;
    let srcMatch;
    while ((srcMatch = srcUrlRegex.exec(srcContent)) !== null) {
      urls.add(srcMatch[1]);
    }
  }
  
  return Array.from(urls);
}

/**
 * Rewrite URLs in CSS content to local paths
 */
function rewriteCssUrls(cssContent, urlMap) {
  let rewritten = cssContent;
  
  // Rewrite url() references
  for (const [originalUrl, localPath] of urlMap) {
    // Escape regex special characters
    const escapedUrl = originalUrl.replace(/[.*+?^${}()|[\]\\\\]/g, '\\$&');
    
    // Replace url('original') patterns
    const regex = new RegExp(`url\\(['"]?${escapedUrl}['"]?\\)`, 'g');
    rewritten = rewritten.replace(regex, `url('${localPath}')`);
  }
  
  return rewritten;
}

// ============================================================================
// HTML URL REWRITING
// ============================================================================

/**
 * Rewrite URLs in HTML content
 */
function rewriteHtmlUrls(html, urlMap, pagePath = '') {
  let rewritten = html;
  const pageDir = path.dirname(pagePath);
  
  // Build relative path from page to root
  const relativeToRoot = pageDir === '.' ? '' : pageDir.split('/').map(() => '..').join('/') + '/';
  
  // Rewrite all mapped URLs
  for (const [originalUrl, localPath] of urlMap) {
    try {
      // Escape special regex characters
      const escapedUrl = originalUrl.replace(/[.*+?^${}()|[\]\\\\]/g, '\\$&');
      const regex = new RegExp(escapedUrl, 'g');
      
      // Calculate relative path from current page to asset
      const relativePath = path.relative(pageDir, localPath).replace(/\\/g, '/');
      const finalPath = relativePath.startsWith('.') ? relativePath : './' + relativePath;
      
      rewritten = rewritten.replace(regex, finalPath);
    } catch {
      // Invalid regex, skip
    }
  }
  
  // Rewrite absolute CDN references
  rewritten = rewritten.replace(
    /https:\/\/cdn\.prod\.website-files\.com\/([^"'\s]+)/g,
    (match, assetPath) => {
      const assetLocalPath = `/cdn/${assetPath}`;
      const relativePath = path.relative(pageDir, assetLocalPath).replace(/\\/g, '/');
      return relativePath.startsWith('.') ? relativePath : './' + relativePath;
    }
  );
  
  // Rewrite Google Fonts API
  rewritten = rewritten.replace(
    /https:\/\/fonts\.googleapis\.com\/css[^"'\s]*/g,
    '/fonts/google-fonts.css'
  );
  
  // Rewrite Google Fonts static
  rewritten = rewritten.replace(
    /https:\/\/fonts\.gstatic\.com\/s\/([^"'\s]+)/g,
    '/fonts/$1'
  );
  
  // Rewrite internal links
  rewritten = rewritten.replace(
    /https:\/\/www\.avir\.com\//g,
    '/'
  );
  
  return rewritten;
}

// ============================================================================
// DIRECTORY UTILITIES
// ============================================================================

/**
 * Create directory structure for output
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
    await fs.mkdir(dir, { recursive: true });
  }
  
  log('INFO', 'Directory structure created');
}

/**
 * Save asset manifest to file
 */
async function saveAssetManifest(assets, outputDir = CONFIG.OUTPUT_DIR) {
  const manifest = {
    generatedAt: new Date().toISOString(),
    baseUrl: CONFIG.BASE_URL,
    totalAssets: assets.size,
    assets: Array.from(assets.entries()).map(([url, data]) => ({
      url,
      ...data
    }))
  };
  
  const manifestPath = path.join(outputDir, 'asset-manifest.json');
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  
  log('INFO', `Asset manifest saved: ${manifestPath}`);
  return manifestPath;
}

/**
 * Save capture report
 */
async function saveCaptureReport(report, outputDir = CONFIG.OUTPUT_DIR) {
  const reportPath = path.join(outputDir, 'capture-report.json');
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');
  
  log('INFO', `Capture report saved: ${reportPath}`);
  return reportPath;
}

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = {
  CONFIG,
  LOG_LEVELS,
  setLogLevel,
  log,
  calculateHash,
  getExtensionFromContentType,
  getExtensionFromUrl,
  getAssetCategory,
  getLocalPath,
  mapUrlToLocalPath,
  isAssetUrl,
  getOutputPath,
  getAssetOutputPath,
  downloadFile,
  downloadFilesConcurrently,
  extractCssUrls,
  rewriteCssUrls,
  rewriteHtmlUrls,
  createDirectoryStructure,
  saveAssetManifest,
  saveCaptureReport
};
