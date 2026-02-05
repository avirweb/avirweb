#!/usr/bin/env node

/**
 * AVIR Baseline Screenshot Capture Script
 * 
 * Captures baseline screenshots from the source website (avir.com)
 * for visual regression testing. Captures 5 pages × 4 viewports = 20 images.
 * 
 * Usage: node scripts/capture-baseline.js
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const BASE_URL = 'https://www.avir.com';
const OUTPUT_DIR = path.join('.sisyphus', 'baselines');

// Pages to capture
const pages = [
  { name: 'home', path: '/' },
  { name: 'services', path: '/services' },
  { name: 'about-avir', path: '/about-avir' },
  { name: 'contact', path: '/contact' },
  { name: 'portfolio', path: '/portfolio' }
];

// Viewport configurations
const viewports = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1920, height: 1080 },
  { name: 'desktop-xl', width: 2560, height: 1440 }
];

/**
 * Trigger lazy-loading by scrolling through the page
 */
async function triggerLazyLoading(page) {
  console.log('  Triggering lazy loading...');
  
  const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
  const viewportHeight = await page.evaluate(() => window.innerHeight);
  
  for (let y = 0; y < scrollHeight; y += viewportHeight) {
    await page.evaluate(y => window.scrollTo(0, y), y);
    await page.waitForTimeout(500);
  }
  
  // Scroll back to top
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  
  console.log('  Lazy loading complete');
}

/**
 * Capture screenshot with retry logic
 */
async function captureScreenshot(page, url, viewport, outputPath, attempt = 1) {
  const maxAttempts = 2;
  
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
    
    return true;
  } catch (error) {
    if (attempt < maxAttempts) {
      console.log(`  Retry ${attempt}/${maxAttempts} for ${viewport.name}...`);
      await page.waitForTimeout(2000);
      return captureScreenshot(page, url, viewport, outputPath, attempt + 1);
    }
    throw error;
  }
}

/**
 * Main capture function
 */
async function captureBaselines() {
  console.log('='.repeat(60));
  console.log('AVIR Baseline Screenshot Capture');
  console.log('='.repeat(60));
  console.log(`Source: ${BASE_URL}`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log(`Pages: ${pages.length} | Viewports: ${viewports.length} | Total: ${pages.length * viewports.length}`);
  console.log('='.repeat(60));
  console.log();

  // Ensure output directory exists
  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    console.log(`Created output directory: ${OUTPUT_DIR}`);
  } catch (error) {
    console.error(`Failed to create output directory: ${error.message}`);
    process.exit(1);
  }

  // Launch browser
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    console.log('Browser launched successfully');
  } catch (error) {
    console.error(`Failed to launch browser: ${error.message}`);
    console.error('Make sure Playwright is installed: npm install playwright');
    process.exit(1);
  }

  const results = {
    success: [],
    failed: []
  };

  // Process each page
  for (const pageConfig of pages) {
    console.log();
    console.log(`\n📄 Processing page: ${pageConfig.name}`);
    console.log(`   URL: ${BASE_URL}${pageConfig.path}`);
    
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
        const outputPath = path.join(OUTPUT_DIR, filename);
        
        process.stdout.write(`  📸 ${viewport.name} (${viewport.width}x${viewport.height})... `);
        
        try {
          await captureScreenshot(page, url, viewport, outputPath);
          
          const stats = await fs.stat(outputPath);
          const sizeKB = Math.round(stats.size / 1024);
          console.log(`✓ (${sizeKB} KB)`);
          
          results.success.push({
            page: pageConfig.name,
            viewport: viewport.name,
            file: filename,
            size: sizeKB
          });
        } catch (error) {
          console.log(`✗ FAILED: ${error.message}`);
          results.failed.push({
            page: pageConfig.name,
            viewport: viewport.name,
            file: filename,
            error: error.message
          });
        }
        
        // Small delay between viewports
        await page.waitForTimeout(500);
      }
      
    } catch (error) {
      console.error(`\n  ✗ Failed to process page ${pageConfig.name}: ${error.message}`);
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
    
    // Delay between pages
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Close browser
  await browser.close();
  console.log('\n' + '='.repeat(60));

  // Generate summary report
  console.log('\n📊 SUMMARY REPORT');
  console.log('='.repeat(60));
  console.log(`Total screenshots: ${results.success.length + results.failed.length}`);
  console.log(`Successful: ${results.success.length} ✓`);
  console.log(`Failed: ${results.failed.length} ✗`);
  console.log();

  if (results.success.length > 0) {
    console.log('Successful captures:');
    results.success.forEach(item => {
      console.log(`  ✓ ${item.file} (${item.size} KB)`);
    });
  }

  if (results.failed.length > 0) {
    console.log('\nFailed captures:');
    results.failed.forEach(item => {
      console.log(`  ✗ ${item.file}: ${item.error}`);
    });
  }

  // Verify output
  console.log('\n' + '='.repeat(60));
  console.log('VERIFICATION');
  console.log('='.repeat(60));
  
  try {
    const files = await fs.readdir(OUTPUT_DIR);
    const pngFiles = files.filter(f => f.endsWith('.png'));
    console.log(`PNG files in output directory: ${pngFiles.length}`);
    
    if (pngFiles.length === pages.length * viewports.length) {
      console.log('✓ All expected screenshots captured!');
    } else {
      console.log(`⚠ Expected ${pages.length * viewports.length} files, found ${pngFiles.length}`);
    }
    
    // List all files
    console.log('\nCaptured files:');
    pngFiles.sort().forEach(file => {
      console.log(`  - ${file}`);
    });
    
  } catch (error) {
    console.error(`Error reading output directory: ${error.message}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('Baseline capture complete!');
  console.log(`Output directory: ${path.resolve(OUTPUT_DIR)}`);
  console.log('='.repeat(60));

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
