/**
 * Capture Module
 * Playwright-based page capture with CSS parsing and asset discovery
 */

const { chromium } = require('playwright');
const { 
  log, 
  CONFIG, 
  getOutputPath, 
  extractCssUrls, 
  rewriteCssUrls, 
  rewriteHtmlUrls,
  downloadFile,
  getAssetOutputPath,
  mapUrlToLocalPath
} = require('./utils');
const { AssetInterceptor } = require('./asset-interceptor');
const { LazyLoader } = require('./lazy-loader');
const fs = require('fs').promises;
const path = require('path');

class CaptureEngine {
  constructor(options = {}) {
    this.options = {
      headless: options.headless !== false,
      viewport: options.viewport || { width: 1920, height: 1080 },
      timeout: options.timeout || 60000,
      hydrationWait: options.hydrationWait || CONFIG.HYDRATION_WAIT,
      animationWait: options.animationWait || CONFIG.ANIMATION_WAIT,
      parseCss: options.parseCss !== false,
      triggerLazyLoad: options.triggerLazyLoad !== false,
      maxRetries: options.maxRetries || CONFIG.MAX_RETRIES,
      ...options
    };
    
    this.browser = null;
    this.context = null;
    this.assetInterceptor = new AssetInterceptor();
    this.lazyLoader = new LazyLoader();
    this.capturedPages = new Map();
    this.cssAssets = new Map();
    this.errors = [];
  }

  /**
   * Initialize the browser
   */
  async initialize() {
    log('INFO', 'Initializing Playwright browser...');
    
    this.browser = await chromium.launch({
      headless: this.options.headless
    });
    
    this.context = await this.browser.newContext({
      viewport: this.options.viewport
    });
    
    log('INFO', 'Browser initialized');
  }

  /**
   * Capture a single page
   */
  async capturePage(url, options = {}) {
    const startTime = Date.now();
    log('INFO', `Capturing page: ${url}`);
    
    const page = await this.context.newPage();
    
    try {
      // Setup asset interception
      await this.assetInterceptor.setup(page);
      
      // Navigate to page
      await this.navigate(page, url);
      
      // Wait for hydration
      await this.waitForHydration(page);
      
      // Trigger lazy loading
      if (this.options.triggerLazyLoad) {
        await this.lazyLoader.trigger(page);
      }
      
      // Parse CSS for additional assets
      if (this.options.parseCss) {
        await this.parseCssAssets(page);
      }
      
      // Extract videos from data attributes
      await this.extractVideos(page);
      
      // Wait for any remaining network activity
      await page.waitForTimeout(2000);
      
      // Get page content
      let html = await page.content();
      
      // Rewrite URLs
      const urlMap = this.assetInterceptor.getUrlMap();
      const pagePath = require('./utils').getLocalPath(url);
      html = rewriteHtmlUrls(html, urlMap, pagePath);
      
      // Save HTML
      const outputPath = getOutputPath(url);
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, html, 'utf8');
      
      // Track captured page
      this.capturedPages.set(url, {
        url,
        outputPath,
        html,
        capturedAt: new Date().toISOString(),
        duration: Date.now() - startTime,
        assetCount: urlMap.size
      });
      
      log('SUCCESS', `Page captured: ${url} (${urlMap.size} assets)`);
      
      return {
        success: true,
        url,
        outputPath,
        assetCount: urlMap.size,
        duration: Date.now() - startTime
      };
      
    } catch (error) {
      log('ERROR', `Failed to capture ${url}: ${error.message}`);
      this.errors.push({ url, error: error.message });
      
      return {
        success: false,
        url,
        error: error.message
      };
    } finally {
      await page.close();
    }
  }

  /**
   * Navigate to URL with retry logic
   */
  async navigate(page, url) {
    let retries = 0;
    
    while (retries < this.options.maxRetries) {
      try {
        const response = await page.goto(url, {
          waitUntil: 'networkidle',
          timeout: this.options.timeout
        });
        
        if (response && response.ok()) {
          return response;
        }
        
        throw new Error(`HTTP ${response ? response.status() : 'no response'}`);
      } catch (error) {
        retries++;
        
        if (retries >= this.options.maxRetries) {
          throw error;
        }
        
        log('WARN', `Navigation retry ${retries}/${this.options.maxRetries} for ${url}`);
        await new Promise(resolve => setTimeout(resolve, 2000 * retries));
      }
    }
  }

  /**
   * Wait for Webflow hydration
   */
  async waitForHydration(page) {
    log('INFO', 'Waiting for Webflow hydration...');
    
    try {
      // Wait for w-mod-js class
      await page.waitForFunction(() => {
        const html = document.documentElement;
        return html.classList.contains('w-mod-js');
      }, { timeout: this.options.hydrationWait });
      
      log('DEBUG', 'Webflow JS hydrated (w-mod-js present)');
    } catch {
      log('WARN', 'w-mod-js not detected within timeout');
    }
    
    try {
      // Wait for w-mod-ix class (interactions)
      await page.waitForFunction(() => {
        const html = document.documentElement;
        return html.classList.contains('w-mod-ix');
      }, { timeout: 3000 });
      
      log('DEBUG', 'Webflow interactions ready (w-mod-ix present)');
    } catch {
      log('DEBUG', 'w-mod-ix not detected (non-interactive page)');
    }
    
    // Additional wait for remaining hydration
    await page.waitForTimeout(1000);
    
    // Wait for animations
    if (this.options.animationWait > 0) {
      log('INFO', `Waiting ${this.options.animationWait}ms for animations...`);
      await page.waitForTimeout(this.options.animationWait);
    }
  }

  /**
   * Parse CSS files for additional assets (background-images, fonts, etc.)
   */
  async parseCssAssets(page) {
    log('INFO', 'Parsing CSS for additional assets...');
    
    try {
      // Get all CSS URLs from the page
      const cssUrls = await page.evaluate(() => {
        const urls = [];
        
        // Get from link tags
        document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
          if (link.href) urls.push(link.href);
        });
        
        // Get from inline style tags
        document.querySelectorAll('style').forEach(style => {
          // We'll process inline styles separately
        });
        
        return urls;
      });
      
      // Process each CSS file
      for (const cssUrl of cssUrls) {
        await this.processCssFile(cssUrl, page);
      }
      
      // Process inline styles
      const inlineStyles = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('style'))
          .map(style => style.textContent)
          .join('\n');
      });
      
      if (inlineStyles) {
        await this.extractAndDownloadCssAssets(inlineStyles, page.url());
      }
      
    } catch (error) {
      log('WARN', `Error parsing CSS assets: ${error.message}`);
    }
  }

  /**
   * Process a CSS file
   */
  async processCssFile(cssUrl, page) {
    try {
      // Skip if already processed
      if (this.cssAssets.has(cssUrl)) {
        return;
      }
      
      log('DEBUG', `Processing CSS: ${cssUrl}`);
      
      // Fetch CSS content
      const response = await page.evaluate(async (url) => {
        try {
          const res = await fetch(url);
          if (!res.ok) return null;
          return await res.text();
        } catch {
          return null;
        }
      }, cssUrl);
      
      if (!response) {
        log('DEBUG', `Could not fetch CSS: ${cssUrl}`);
        return;
      }
      
      this.cssAssets.set(cssUrl, response);
      
      // Extract URLs from CSS
      await this.extractAndDownloadCssAssets(response, cssUrl);
      
    } catch (error) {
      log('DEBUG', `Error processing CSS ${cssUrl}: ${error.message}`);
    }
  }

  /**
   * Extract and download assets from CSS content
   */
  async extractAndDownloadCssAssets(cssContent, baseUrl) {
    const urls = extractCssUrls(cssContent);
    
    log('DEBUG', `Found ${urls.length} URLs in CSS from ${baseUrl}`);
    
    for (const url of urls) {
      try {
        // Resolve relative URLs
        const absoluteUrl = new URL(url, baseUrl).toString();
        
        // Skip if already captured
        if (this.assetInterceptor.hasAsset(absoluteUrl)) {
          continue;
        }
        
        // Download asset
        const outputPath = getAssetOutputPath(absoluteUrl, 'image/*');
        if (!outputPath) continue;
        
        const result = await downloadFile(absoluteUrl, outputPath, {
          retries: 3,
          timeout: 10000
        });
        
        if (result.success) {
          // Add to interceptor
          const buffer = await fs.readFile(outputPath);
          await this.assetInterceptor.addAsset(
            absoluteUrl, 
            buffer, 
            'image/*', 
            'css-extracted'
          );
          
          log('DEBUG', `CSS asset downloaded: ${path.basename(outputPath)}`);
        }
        
      } catch (error) {
        log('DEBUG', `Failed to download CSS asset ${url}: ${error.message}`);
      }
    }
  }

  /**
   * Extract videos from data-video-urls attributes
   */
  async extractVideos(page) {
    log('INFO', 'Extracting videos...');
    
    try {
      const videos = await page.evaluate(() => {
        const results = [];
        
        document.querySelectorAll('[data-video-urls]').forEach(el => {
          const videoUrls = el.getAttribute('data-video-urls');
          if (videoUrls) {
            try {
              const urls = JSON.parse(videoUrls);
              urls.forEach(url => {
                results.push({ url, source: 'data-video-urls' });
              });
            } catch {
              results.push({ url: videoUrls, source: 'data-video-urls-raw' });
            }
          }
          
          const poster = el.getAttribute('data-poster-url');
          if (poster) {
            results.push({ url: poster, source: 'data-poster-url' });
          }
        });
        
        return results;
      });
      
      log('INFO', `Found ${videos.length} video references`);
      
      // Download videos
      for (const video of videos) {
        await this.downloadVideo(video.url);
      }
      
    } catch (error) {
      log('WARN', `Error extracting videos: ${error.message}`);
    }
  }

  /**
   * Download a video file
   */
  async downloadVideo(videoUrl) {
    if (this.assetInterceptor.hasAsset(videoUrl)) {
      return;
    }
    
    try {
      const outputPath = getAssetOutputPath(videoUrl, 'video/mp4');
      if (!outputPath) return;
      
      // Check if already exists
      try {
        await fs.access(outputPath);
        log('DEBUG', `Video already exists: ${path.basename(outputPath)}`);
        return;
      } catch {
        // File doesn't exist
      }
      
      log('INFO', `Downloading video: ${path.basename(outputPath)}`);
      
      const result = await downloadFile(videoUrl, outputPath, {
        retries: 3,
        timeout: 120000
      });
      
      if (result.success) {
        const buffer = await fs.readFile(outputPath);
        await this.assetInterceptor.addAsset(
          videoUrl, 
          buffer, 
          'video/mp4', 
          'video-extracted'
        );
        
        log('SUCCESS', `Video downloaded: ${(result.size / 1024 / 1024).toFixed(2)} MB`);
      }
      
    } catch (error) {
      log('WARN', `Failed to download video ${videoUrl}: ${error.message}`);
    }
  }

  /**
   * Multi-pass capture for thorough asset discovery
   */
  async captureWithPasses(url, passes = 2) {
    log('INFO', `Starting multi-pass capture (${passes} passes)`);
    
    const results = [];
    
    for (let i = 0; i < passes; i++) {
      log('INFO', `=== Pass ${i + 1}/${passes} ===`);
      
      const result = await this.capturePage(url, { 
        triggerLazyLoad: i === passes - 1 // Only scroll on last pass
      });
      
      results.push(result);
      
      // Wait between passes
      if (i < passes - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    const totalAssets = this.assetInterceptor.getStats().captured;
    log('INFO', `Multi-pass complete. Total assets: ${totalAssets}`);
    
    return results;
  }

  /**
   * Get capture statistics
   */
  getStats() {
    return {
      pagesCaptured: this.capturedPages.size,
      assetsCaptured: this.assetInterceptor.getStats().captured,
      cssFilesParsed: this.cssAssets.size,
      errors: this.errors.length,
      interceptorStats: this.assetInterceptor.getStats(),
      lazyLoaderStats: this.lazyLoader.getStats()
    };
  }

  /**
   * Get all errors
   */
  getErrors() {
    return [...this.errors, ...this.assetInterceptor.getFailedDownloads()];
  }

  /**
   * Generate capture report
   */
  generateReport() {
    return {
      timestamp: new Date().toISOString(),
      stats: this.getStats(),
      pages: Array.from(this.capturedPages.entries()).map(([url, data]) => ({
        url,
        ...data
      })),
      errors: this.getErrors()
    };
  }

  /**
   * Close browser
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.context = null;
      log('INFO', 'Browser closed');
    }
  }
}

module.exports = { CaptureEngine };
