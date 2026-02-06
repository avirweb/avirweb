#!/usr/bin/env node
/**
 * Synchronized Capture Script
 * Captures both original and deployed sites simultaneously to minimize timing differences
 *
 * Uses single browser instance with two contexts for synchronized captures
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  ORIGINAL_URL: 'https://www.avir.com',
  DEPLOYED_URL: 'https://avirwebtest.pages.dev',
  OUTPUT_DIR: '.sisyphus/pixel-perfect-comparison/screenshots',
  VIEWPORT: { width: 1920, height: 1080 },
  HYDRATION_WAIT: 10000, // 10 seconds for Webflow
  ANIMATION_DISABLE_CSS: '* { animation: none !important; transition: none !important; }',
};

// Viewports for different devices
const VIEWPORTS = [
  { name: 'desktop', width: 1920, height: 1080 },
  { name: 'tablet-portrait', width: 768, height: 1024 },
  { name: 'mobile-landscape', width: 896, height: 414 },
  { name: 'mobile-portrait', width: 414, height: 896 },
];

// Pages to capture
const PAGES = [
  { name: 'home', path: '/' },
  { name: 'about', path: '/about-avir' },
  { name: 'services', path: '/services' },
  { name: 'portfolio', path: '/portfolio' },
  { name: 'contact', path: '/contact' },
];

/**
 * Ensure output directory exists
 */
function ensureDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Inject CSS to disable animations
 */
async function disableAnimations(page) {
  await page.addStyleTag({ content: CONFIG.ANIMATION_DISABLE_CSS });
}

/**
 * Wait for Webflow hydration markers
 */
async function waitForHydration(page, timeout = CONFIG.HYDRATION_WAIT) {
  try {
    await page.waitForFunction(() => {
      return document.body && document.body.classList.contains('w-mod-js');
    }, { timeout });
    return true;
  } catch (error) {
    console.warn(`  ⚠️ Hydration timeout - proceeding anyway`);
    return false;
  }
}

/**
 * Trigger lazy loading via scrolling
 */
async function triggerLazyLoading(page) {
  await page.evaluate(async () => {
    // Scroll to bottom and back up to trigger lazy loading
    const scrollHeight = document.body.scrollHeight;
    window.scrollTo(0, scrollHeight);
    await new Promise(resolve => setTimeout(resolve, 500));
    window.scrollTo(0, 0);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Scroll through entire page in chunks
    const chunkSize = window.innerHeight;
    for (let i = 0; i < scrollHeight; i += chunkSize) {
      window.scrollTo(0, i);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Reset to top
    window.scrollTo(0, 0);
  });
  
  // Wait for any lazy-loaded content
  await page.waitForTimeout(1000);
}

/**
 * Get page dimensions
 */
async function getPageDimensions(page) {
  return await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    height: document.documentElement.scrollHeight,
  }));
}

/**
 * Capture a single page from both sites simultaneously
 */
async function capturePage(browser, pageConfig, viewport, timingLog) {
  const { name: pageName, path: pagePath } = pageConfig;
  const { name: viewportName, width, height } = viewport;
  
  console.log(`\n📸 Capturing ${pageName} @ ${viewportName} (${width}x${height})`);
  
  const timestamp = Date.now();
  
  // Create two browser contexts (same browser instance)
  const originalContext = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
  });
  
  const deployedContext = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
  });
  
  // Create pages
  const originalPage = await originalContext.newPage();
  const deployedPage = await deployedContext.newPage();
  
  // Disable animations on both pages
  await Promise.all([
    disableAnimations(originalPage),
    disableAnimations(deployedPage),
  ]);
  
  // Navigate to both sites simultaneously
  const originalUrl = `${CONFIG.ORIGINAL_URL}${pagePath}`;
  const deployedUrl = `${CONFIG.DEPLOYED_URL}${pagePath}`;
  
  console.log(`  🌐 Navigating to both URLs simultaneously...`);
  const navigateStart = Date.now();
  
  const [originalResponse, deployedResponse] = await Promise.all([
    originalPage.goto(originalUrl, { waitUntil: 'networkidle', timeout: 30000 }),
    deployedPage.goto(deployedUrl, { waitUntil: 'networkidle', timeout: 30000 }),
  ]);
  
  const navigateEnd = Date.now();
  const navigationTime = navigateEnd - navigateStart;
  
  // Wait for hydration on both pages
  console.log(`  ⏳ Waiting for Webflow hydration...`);
  const hydrationStart = Date.now();
  
  const [originalHydrated, deployedHydrated] = await Promise.all([
    waitForHydration(originalPage),
    waitForHydration(deployedPage),
  ]);
  
  const hydrationEnd = Date.now();
  const hydrationTime = hydrationEnd - hydrationStart;
  
  // Trigger lazy loading on both pages
  console.log(`  📜 Triggering lazy loading...`);
  await Promise.all([
    triggerLazyLoading(originalPage),
    triggerLazyLoading(deployedPage),
  ]);
  
  // Get page dimensions
  const [originalDimensions, deployedDimensions] = await Promise.all([
    getPageDimensions(originalPage),
    getPageDimensions(deployedPage),
  ]);
  
  // Capture screenshots
  console.log(`  📷 Capturing screenshots...`);
  const screenshotStart = Date.now();
  
  const screenshotDir = path.join(CONFIG.OUTPUT_DIR, pageName, viewportName);
  ensureDirectory(screenshotDir);
  
  const originalScreenshot = path.join(screenshotDir, 'original.png');
  const deployedScreenshot = path.join(screenshotDir, 'deployed.png');
  
  await Promise.all([
    originalPage.screenshot({ 
      path: originalScreenshot, 
      fullPage: true,
      type: 'png',
    }),
    deployedPage.screenshot({ 
      path: deployedScreenshot, 
      fullPage: true,
      type: 'png',
    }),
  ]);
  
  const screenshotEnd = Date.now();
  const screenshotTime = screenshotEnd - screenshotStart;
  
  // Log timing information
  const captureData = {
    page: pageName,
    path: pagePath,
    viewport: viewportName,
    dimensions: { width, height },
    original: {
      url: originalUrl,
      dimensions: originalDimensions,
      hydrated: originalHydrated,
      status: originalResponse?.status(),
    },
    deployed: {
      url: deployedUrl,
      dimensions: deployedDimensions,
      hydrated: deployedHydrated,
      status: deployedResponse?.status(),
    },
    timing: {
      navigation: navigationTime,
      hydration: hydrationTime,
      screenshot: screenshotTime,
      total: Date.now() - timestamp,
    },
    screenshots: {
      original: originalScreenshot,
      deployed: deployedScreenshot,
    },
    timestamp: new Date().toISOString(),
  };
  
  timingLog.captures.push(captureData);
  
  console.log(`  ✓ Original: ${originalDimensions.width}x${originalDimensions.height} (hydrated: ${originalHydrated})`);
  console.log(`  ✓ Deployed: ${deployedDimensions.width}x${deployedDimensions.height} (hydrated: ${deployedHydrated})`);
  console.log(`  ⏱ Total capture time: ${captureData.timing.total}ms`);
  
  // Clean up contexts
  await originalContext.close();
  await deployedContext.close();
  
  return captureData;
}

/**
 * Main capture function
 */
async function main() {
  console.log('🚀 Starting synchronized capture...');
  console.log(`   Original: ${CONFIG.ORIGINAL_URL}`);
  console.log(`   Deployed: ${CONFIG.DEPLOYED_URL}`);
  console.log(`   Output: ${CONFIG.OUTPUT_DIR}`);
  
  // Ensure output directory exists
  ensureDirectory(CONFIG.OUTPUT_DIR);
  
  // Initialize timing log
  const timingLog = {
    startTime: new Date().toISOString(),
    config: CONFIG,
    captures: [],
  };
  
  // Launch browser (single instance)
  console.log('\n🌐 Launching browser...');
  const browser = await chromium.launch({
    headless: true,
  });
  
  try {
    // Capture all pages across all viewports
    for (const page of PAGES) {
      for (const viewport of VIEWPORTS) {
        try {
          await capturePage(browser, page, viewport, timingLog);
        } catch (error) {
          console.error(`  ❌ Failed to capture ${page.name} @ ${viewport.name}:`, error.message);
          timingLog.captures.push({
            page: page.name,
            viewport: viewport.name,
            error: error.message,
            timestamp: new Date().toISOString(),
          });
        }
      }
    }
    
    // Complete timing log
    timingLog.endTime = new Date().toISOString();
    timingLog.totalCaptures = timingLog.captures.filter(c => !c.error).length;
    timingLog.failedCaptures = timingLog.captures.filter(c => c.error).length;
    
    // Save timing log
    const logPath = path.join(CONFIG.OUTPUT_DIR, 'sync-capture-log.json');
    fs.writeFileSync(logPath, JSON.stringify(timingLog, null, 2));
    console.log(`\n📝 Timing log saved to: ${logPath}`);
    
  } finally {
    // Close browser
    await browser.close();
  }
  
  // Summary
  console.log('\n📊 Capture Summary');
  console.log('==================');
  console.log(`✓ Successful: ${timingLog.totalCaptures}`);
  console.log(`✗ Failed: ${timingLog.failedCaptures}`);
  console.log(`📁 Screenshots saved to: ${CONFIG.OUTPUT_DIR}`);
  
  if (timingLog.failedCaptures > 0) {
    process.exit(1);
  }
}

// Run main function
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
