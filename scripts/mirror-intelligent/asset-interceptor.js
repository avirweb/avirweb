/**
 * Asset Interceptor Module
 * Intercepts and captures all network requests during page crawling
 */

const { 
  log, 
  mapUrlToLocalPath, 
  isAssetUrl, 
  calculateHash,
  getExtensionFromContentType,
  createDirectoryStructure 
} = require('./utils');
const fs = require('fs').promises;
const path = require('path');

class AssetInterceptor {
  constructor(options = {}) {
    this.assets = new Map();
    this.failedDownloads = [];
    this.options = {
      captureHtml: false,
      skipExternal: true,
      ...options
    };
    this.stats = {
      intercepted: 0,
      captured: 0,
      failed: 0,
      bytesDownloaded: 0
    };
  }

  /**
   * Setup request interception on a Playwright page
   */
  async setup(page) {
    log('INFO', 'Setting up asset interception...');
    
    // Intercept all requests
    await page.route('**/*', async (route) => {
      const request = route.request();
      const url = request.url();
      const resourceType = request.resourceType();
      
      this.stats.intercepted++;
      
      try {
        // Continue the request to get the response
        const response = await route.fetch({
          timeout: 30000,
          maxRedirects: 10
        });
        
        const buffer = await response.body().catch(() => null);
        const contentType = response.headers()['content-type'] || '';
        const status = response.status();
        
        // Process successful responses with content
        if (status >= 200 && status < 300 && buffer && buffer.length > 0) {
          await this.processAsset(url, buffer, contentType, resourceType, response);
        }
        
        // Fulfill with original response
        await route.fulfill({
          status,
          headers: response.headers(),
          body: buffer || Buffer.from('')
        });
        
      } catch (error) {
        log('DEBUG', `Failed to intercept ${url}: ${error.message}`);
        this.stats.failed++;
        this.failedDownloads.push({ url, error: error.message, phase: 'intercept' });
        
        // Continue without interception
        await route.continue();
      }
    });
    
    log('INFO', 'Asset interception setup complete');
  }

  /**
   * Process a captured asset
   */
  async processAsset(url, buffer, contentType, resourceType, response) {
    // Skip if already captured
    if (this.assets.has(url)) {
      log('DEBUG', `Asset already captured: ${url}`);
      return;
    }
    
    // Skip non-asset URLs if configured
    if (this.options.skipExternal && !isAssetUrl(url)) {
      log('DEBUG', `Skipping non-asset URL: ${url}`);
      return;
    }
    
    // Get local path for the asset
    const localPath = mapUrlToLocalPath(url, contentType);
    if (!localPath) {
      log('DEBUG', `Could not map URL to local path: ${url}`);
      return;
    }
    
    // Get full output path
    const outputPath = path.join(require('./utils').CONFIG.OUTPUT_DIR, localPath);
    
    try {
      // Ensure directory exists
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      
      // Check if file already exists
      let existingHash = null;
      try {
        const existingBuffer = await fs.readFile(outputPath);
        existingHash = calculateHash(existingBuffer);
      } catch {
        // File doesn't exist
      }
      
      const newHash = calculateHash(buffer);
      
      // Only write if different or doesn't exist
      if (existingHash !== newHash) {
        await fs.writeFile(outputPath, buffer);
        log('DEBUG', `Asset saved: ${localPath} (${(buffer.length / 1024).toFixed(2)} KB)`);
      } else {
        log('DEBUG', `Asset unchanged: ${localPath}`);
      }
      
      // Track asset
      this.assets.set(url, {
        url,
        localPath,
        size: buffer.length,
        hash: newHash,
        contentType,
        resourceType,
        status: response.status(),
        timestamp: new Date().toISOString()
      });
      
      this.stats.captured++;
      this.stats.bytesDownloaded += buffer.length;
      
    } catch (error) {
      log('ERROR', `Failed to save asset ${url}: ${error.message}`);
      this.stats.failed++;
      this.failedDownloads.push({ 
        url, 
        error: error.message, 
        phase: 'save',
        localPath 
      });
    }
  }

  /**
   * Manually add an asset that was discovered outside of network interception
   */
  async addAsset(url, buffer, contentType, source = 'manual') {
    if (this.assets.has(url)) {
      return this.assets.get(url);
    }
    
    const localPath = mapUrlToLocalPath(url, contentType);
    if (!localPath) {
      return null;
    }
    
    const outputPath = path.join(require('./utils').CONFIG.OUTPUT_DIR, localPath);
    
    try {
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, buffer);
      
      const hash = calculateHash(buffer);
      
      const assetData = {
        url,
        localPath,
        size: buffer.length,
        hash,
        contentType,
        source,
        timestamp: new Date().toISOString()
      };
      
      this.assets.set(url, assetData);
      this.stats.captured++;
      this.stats.bytesDownloaded += buffer.length;
      
      log('INFO', `Manual asset added: ${localPath} (${(buffer.length / 1024).toFixed(2)} KB)`);
      
      return assetData;
    } catch (error) {
      log('ERROR', `Failed to add manual asset ${url}: ${error.message}`);
      this.failedDownloads.push({ url, error: error.message, phase: 'manual', source });
      return null;
    }
  }

  /**
   * Get asset by URL
   */
  getAsset(url) {
    return this.assets.get(url);
  }

  /**
   * Check if asset is already captured
   */
  hasAsset(url) {
    return this.assets.has(url);
  }

  /**
   * Get all captured assets
   */
  getAllAssets() {
    return new Map(this.assets);
  }

  /**
   * Get URL to local path mapping
   */
  getUrlMap() {
    const map = new Map();
    for (const [url, data] of this.assets) {
      map.set(url, data.localPath);
    }
    return map;
  }

  /**
   * Get assets by category
   */
  getAssetsByCategory(category) {
    const result = [];
    for (const [url, data] of this.assets) {
      if (data.localPath.startsWith(category + '/')) {
        result.push(data);
      }
    }
    return result;
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      ...this.stats,
      uniqueAssets: this.assets.size,
      failedDownloads: this.failedDownloads.length
    };
  }

  /**
   * Get failed downloads
   */
  getFailedDownloads() {
    return [...this.failedDownloads];
  }

  /**
   * Generate report
   */
  generateReport() {
    const categories = {};
    for (const [url, data] of this.assets) {
      const category = data.localPath.split('/')[0];
      if (!categories[category]) {
        categories[category] = { count: 0, size: 0 };
      }
      categories[category].count++;
      categories[category].size += data.size;
    }
    
    return {
      timestamp: new Date().toISOString(),
      stats: this.getStats(),
      categories,
      failedDownloads: this.failedDownloads
    };
  }

  /**
   * Save report to file
   */
  async saveReport(outputDir) {
    const report = this.generateReport();
    const reportPath = path.join(outputDir, 'interceptor-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');
    log('INFO', `Interceptor report saved: ${reportPath}`);
    return reportPath;
  }

  /**
   * Reset all captured data
   */
  reset() {
    this.assets.clear();
    this.failedDownloads = [];
    this.stats = {
      intercepted: 0,
      captured: 0,
      failed: 0,
      bytesDownloaded: 0
    };
    log('INFO', 'Asset interceptor reset');
  }
}

module.exports = { AssetInterceptor };
