#!/usr/bin/env node

/**
 * AVIR v1.0 Baseline Capture Script
 * 
 * Captures baseline screenshots from the LOCAL mirrored site for future comparison.
 * Tagged as "v1.0-baseline" - represents the stable state after Task 18 completion.
 * 
 * Usage: node scripts/capture-baseline-v1.js
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');
const http = require('http');
const https = require('https');

// Configuration
const SITE_DIR = path.join(__dirname, '..', 'site');
const BASELINE_DIR = path.join(__dirname, '..', '.sisyphus', 'baselines', 'v1.0-baseline');
const SERVER_PORT = 9876; // Local server port (avoid common ports)
const BASE_URL = `http://localhost:${SERVER_PORT}`; // Local server URL

// Pages to capture
const pages = [
  { name: 'home', path: '/', description: 'Homepage' },
  { name: 'services', path: '/services', description: 'Services page' },
  { name: 'about-avir', path: '/about-avir', description: 'About AVIR page' },
  { name: 'contact', path: '/contact', description: 'Contact page' },
  { name: 'brands', path: '/brands', description: 'Brands page' },
  // City landing pages (at least 3)
  { name: 'city-palm-springs', path: '/city/palm-springs', description: 'Palm Springs city page' },
  { name: 'city-rancho-mirage', path: '/city/rancho-mirage', description: 'Rancho Mirage city page' },
  { name: 'city-la-quinta', path: '/city/la-quinta', description: 'La Quinta city page' },
  { name: 'city-riverside', path: '/city/riverside', description: 'Riverside city page' },
  { name: 'city-temecula', path: '/city/temecula', description: 'Temecula city page' }
];

// Viewport configurations
const viewports = [
  { name: 'desktop', width: 1920, height: 1080, description: 'Desktop (1920x1080)' },
  { name: 'mobile', width: 375, height: 667, description: 'Mobile (375x667)' }
];

// Results tracking
const results = {
  timestamp: new Date().toISOString(),
  tag: 'v1.0-baseline',
  totalScreenshots: 0,
  successful: [],
  failed: [],
  pages: [],
  viewports: []
};

/**
 * Simple static file server
 */
function createStaticServer(rootDir, port) {
  const server = http.createServer(async (req, res) => {
    let filePath = path.join(rootDir, req.url === '/' ? 'index.html' : req.url);
    
    // If path ends with /, look for index.html
    if (filePath.endsWith('/')) {
      filePath = path.join(filePath, 'index.html');
    }
    
    try {
      const stat = await fs.stat(filePath);
      
      if (stat.isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }
      
      const ext = path.extname(filePath).toLowerCase();
      const contentTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.ttf': 'font/ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.mp4': 'video/mp4',
        '.webm': 'video/webm'
      };
      
      const contentType = contentTypes[ext] || 'application/octet-stream';
      const content = await fs.readFile(filePath);
      
      res.writeHead(200, { 
        'Content-Type': contentType,
        'Cache-Control': 'no-cache'
      });
      res.end(content);
    } catch (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  });
  
  return new Promise((resolve, reject) => {
    server.listen(port, (err) => {
      if (err) reject(err);
      else resolve(server);
    });
  });
}

/**
 * Trigger lazy-loading by scrolling through the page
 */
async function triggerLazyLoading(page) {
  console.log('    Triggering lazy loading...');
  
  const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
  const viewportHeight = await page.evaluate(() => window.innerHeight);
  const steps = Math.ceil(scrollHeight / viewportHeight);
  
  for (let i = 0; i <= steps; i++) {
    const y = Math.min(i * viewportHeight, scrollHeight);
    await page.evaluate(y => window.scrollTo(0, y), y);
    await page.waitForTimeout(500);
  }
  
  // Scroll back to top
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  
  console.log('    Lazy loading complete');
}

/**
 * Capture screenshot with retry logic
 */
async function captureScreenshot(page, url, viewport, outputPath, attempt = 1) {
  const maxAttempts = 3;
  
  try {
    // Set viewport
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.waitForTimeout(500);
    
    // Take screenshot
    await page.screenshot({
      path: outputPath,
      fullPage: true,
      type: 'png'
    });
    
    // Verify file was created and has content
    const stats = await fs.stat(outputPath);
    if (stats.size < 1000) {
      throw new Error(`Screenshot file too small (${stats.size} bytes)`);
    }
    
    return { success: true, size: stats.size };
  } catch (error) {
    if (attempt < maxAttempts) {
      console.log(`    Retry ${attempt}/${maxAttempts}...`);
      await page.waitForTimeout(2000);
      return captureScreenshot(page, url, viewport, outputPath, attempt + 1);
    }
    return { success: false, error: error.message };
  }
}

/**
 * Main capture function
 */
async function captureBaselines() {
  console.log('='.repeat(70));
  console.log('AVIR v1.0 Baseline Screenshot Capture');
  console.log('='.repeat(70));
  console.log(`Source: ${SITE_DIR}`);
  console.log(`Output: ${BASELINE_DIR}`);
  console.log(`Pages: ${pages.length} | Viewports: ${viewports.length} | Total: ${pages.length * viewports.length}`);
  console.log('='.repeat(70));
  console.log();

  // Ensure baseline directory exists
  try {
    await fs.mkdir(BASELINE_DIR, { recursive: true });
    console.log(`Created baseline directory: ${BASELINE_DIR}`);
  } catch (error) {
    console.error(`Failed to create baseline directory: ${error.message}`);
    process.exit(1);
  }

  // Start static server
  let server;
  try {
    server = await createStaticServer(SITE_DIR, SERVER_PORT);
    console.log(`Static server started on ${BASE_URL}`);
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }

  // Launch browser
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    console.log('Browser launched successfully');
  } catch (error) {
    console.error(`Failed to launch browser: ${error.message}`);
    server.close();
    process.exit(1);
  }

  console.log();

  // Process each page
  for (const pageConfig of pages) {
    console.log(`📄 Processing: ${pageConfig.description}`);
    console.log(`   Path: ${pageConfig.path}`);
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      // Navigate to page
      const url = `${BASE_URL}${pageConfig.path}`;
      await page.goto(url, { 
        waitUntil: 'networkidle',
        timeout: 60000 
      });
      
      // Wait for initial render
      await page.waitForTimeout(1000);
      
      // Trigger lazy loading
      await triggerLazyLoading(page);
      
      // Wait for any remaining network activity
      await page.waitForLoadState('networkidle');
      
      // Capture screenshots for each viewport
      for (const viewport of viewports) {
        const filename = `${pageConfig.name}-${viewport.name}.png`;
        const outputPath = path.join(BASELINE_DIR, filename);
        
        process.stdout.write(`   📸 ${viewport.name} (${viewport.width}x${viewport.height})... `);
        
        const result = await captureScreenshot(page, url, viewport, outputPath);
        
        if (result.success) {
          const sizeKB = Math.round(result.size / 1024);
          console.log(`✓ (${sizeKB} KB)`);
          
          results.successful.push({
            page: pageConfig.name,
            viewport: viewport.name,
            file: filename,
            size: sizeKB
          });
          results.totalScreenshots++;
        } else {
          console.log(`✗ FAILED: ${result.error}`);
          results.failed.push({
            page: pageConfig.name,
            viewport: viewport.name,
            file: filename,
            error: result.error
          });
        }
        
        // Small delay between viewports
        await page.waitForTimeout(500);
      }
      
    } catch (error) {
      console.error(`\n   ✗ Failed to process page: ${error.message}`);
      // Mark all viewports for this page as failed
      for (const viewport of viewports) {
        results.failed.push({
          page: pageConfig.name,
          viewport: viewport.name,
          file: `${pageConfig.name}-${viewport.name}.png`,
          error: error.message
        });
      }
    } finally {
      await page.close();
      await context.close();
    }
    
    console.log();
    // Delay between pages
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Close browser and server
  await browser.close();
  server.close();
  
  console.log('='.repeat(70));

  // Generate manifest
  const manifest = {
    version: '1.0',
    tag: 'v1.0-baseline',
    timestamp: results.timestamp,
    source: SITE_DIR,
    totalScreenshots: results.totalScreenshots,
    pages: pages.map(p => ({ name: p.name, path: p.path, description: p.description })),
    viewports: viewports.map(v => ({ name: v.name, width: v.width, height: v.height })),
    results: {
      successful: results.successful,
      failed: results.failed
    },
    metadata: {
      totalPages: pages.length,
      totalViewports: viewports.length,
      expectedScreenshots: pages.length * viewports.length,
      actualScreenshots: results.totalScreenshots,
      successRate: results.totalScreenshots / (pages.length * viewports.length)
    }
  };

  const manifestPath = path.join(BASELINE_DIR, 'manifest.json');
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\n✓ Manifest saved: ${manifestPath}`);

  // Print summary
  console.log('\n' + '='.repeat(70));
  console.log('SUMMARY REPORT');
  console.log('='.repeat(70));
  console.log(`Total screenshots: ${results.totalScreenshots + results.failed.length}`);
  console.log(`Successful: ${results.successful.length} ✓`);
  console.log(`Failed: ${results.failed.length} ✗`);
  console.log(`Success rate: ${((results.successful.length / (results.successful.length + results.failed.length)) * 100).toFixed(1)}%`);
  console.log();

  if (results.successful.length > 0) {
    console.log('Successful captures:');
    results.successful.forEach(item => {
      console.log(`  ✓ ${item.file} (${item.size} KB)`);
    });
  }

  if (results.failed.length > 0) {
    console.log('\nFailed captures:');
    results.failed.forEach(item => {
      console.log(`  ✗ ${item.file}: ${item.error}`);
    });
  }

  // Final verification
  console.log('\n' + '='.repeat(70));
  console.log('VERIFICATION');
  console.log('='.repeat(70));
  
  try {
    const files = await fs.readdir(BASELINE_DIR);
    const pngFiles = files.filter(f => f.endsWith('.png'));
    console.log(`PNG files in baseline directory: ${pngFiles.length}`);
    
    if (pngFiles.length === pages.length * viewports.length) {
      console.log('✓ All expected screenshots captured!');
    } else {
      console.log(`⚠ Expected ${pages.length * viewports.length} files, found ${pngFiles.length}`);
    }
    
    // List all files
    console.log('\nCaptured baseline files:');
    pngFiles.sort().forEach(file => {
      console.log(`  - ${file}`);
    });
    
    // Check file sizes
    console.log('\nFile size verification:');
    let allValid = true;
    for (const file of pngFiles) {
      const filePath = path.join(BASELINE_DIR, file);
      const stats = await fs.stat(filePath);
      const sizeKB = Math.round(stats.size / 1024);
      const valid = stats.size > 1000;
      if (!valid) allValid = false;
      console.log(`  ${valid ? '✓' : '✗'} ${file}: ${sizeKB} KB`);
    }
    
    console.log(`\n${allValid ? '✓' : '✗'} All files have valid sizes`);
    
  } catch (error) {
    console.error(`Error reading baseline directory: ${error.message}`);
  }

  console.log('\n' + '='.repeat(70));
  console.log('Baseline capture complete!');
  console.log(`Location: ${path.resolve(BASELINE_DIR)}`);
  console.log(`Tag: v1.0-baseline`);
  console.log('='.repeat(70));

  // Exit with error code if any failures
  if (results.failed.length > 0) {
    process.exit(1);
  }
}

// Run the capture
if (require.main === module) {
  captureBaselines().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { captureBaselines };
