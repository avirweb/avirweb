#!/usr/bin/env node
/**
 * Mobile Responsiveness Testing Script
 * Tests viewport sizes, captures screenshots, validates critical elements,
 * checks for horizontal scroll, and tests mobile menu functionality
 * 
 * Usage:
 *   node scripts/test-mobile.js [--url=http://localhost:8000] [--verbose]
 * 
 * Exit codes:
 *   0 - All tests passed
 *   1 - One or more tests failed
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

// Configuration
const CONFIG = {
  defaultUrl: 'http://localhost:8000',
  screenshotsDir: path.join(__dirname, 'test-results', 'mobile-screenshots'),
  reportPath: path.join(__dirname, 'test-results', 'mobile-responsiveness-report.html'),
  jsonReportPath: path.join(__dirname, 'test-results', 'mobile-responsiveness-report.json'),
  viewports: {
    mobile: { width: 375, height: 667, deviceScaleFactor: 2 },
    tablet: { width: 768, height: 1024, deviceScaleFactor: 2 },
    desktop: { width: 1920, height: 1080, deviceScaleFactor: 1 }
  },
  pages: [
    { path: '/', name: 'homepage', description: 'Homepage' },
    { path: '/services', name: 'services', description: 'Services page' },
    { path: '/contact', name: 'contact', description: 'Contact page' }
  ],
  criticalElements: {
    logo: ['.nav__site-logo', '.nav__site-logo-inner'],
    nav: ['.nav__link-wrap', '.mobile__nav', '.nav'],
    content: ['.page-content', '.section', 'main', 'body'],
    footer: ['.footer']
  },
  timeout: 30000,
  navigationTimeout: 10000
};

// Parse CLI arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    url: CONFIG.defaultUrl,
    verbose: false,
    openReport: false
  };

  for (const arg of args) {
    if (arg.startsWith('--url=')) {
      config.url = arg.replace('--url=', '');
    } else if (arg === '--verbose' || arg === '-v') {
      config.verbose = true;
    } else if (arg === '--open-report') {
      config.openReport = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Mobile Responsiveness Testing Script

Usage: node scripts/test-mobile.js [options]

Options:
  --url=<url>         Base URL to test (default: http://localhost:8000)
  --verbose, -v       Enable verbose output
  --open-report       Open report in browser after testing
  --help, -h          Show this help message

Examples:
  node scripts/test-mobile.js
  node scripts/test-mobile.js --url=https://example.com
  node scripts/test-mobile.js --verbose
`);
      process.exit(0);
    }
  }

  return config;
}

// Ensure directories exist
function ensureDirectories() {
  if (!fs.existsSync(CONFIG.screenshotsDir)) {
    fs.mkdirSync(CONFIG.screenshotsDir, { recursive: true });
  }
}

// Logger
function createLogger(verbose) {
  return {
    info: (msg) => console.log(`[INFO] ${msg}`),
    success: (msg) => console.log(`[PASS] ${msg}`),
    error: (msg) => console.log(`[FAIL] ${msg}`),
    warn: (msg) => console.log(`[WARN] ${msg}`),
    verbose: (msg) => verbose && console.log(`[VERB] ${msg}`),
    section: (msg) => console.log(`\n=== ${msg} ===`)
  };
}

// Check if URL is accessible
async function checkUrlAccessible(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { timeout: 5000 }, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 400);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

// Test result tracking
class TestRunner {
  constructor() {
    this.results = [];
    this.screenshots = [];
    this.startTime = Date.now();
  }

  addResult(testName, viewport, page, passed, details = {}) {
    this.results.push({
      testName,
      viewport,
      page,
      passed,
      timestamp: new Date().toISOString(),
      ...details
    });
  }

  addScreenshot(path, viewport, page, description) {
    this.screenshots.push({
      path,
      viewport,
      page,
      description,
      timestamp: new Date().toISOString()
    });
  }

  getSummary() {
    const total = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    const failed = total - passed;
    const totalDuration = Date.now() - this.startTime;
    return { total, passed, failed, totalDuration };
  }
}

// Check if element is visible
async function isElementVisible(page, selectors) {
  for (const selector of selectors) {
    try {
      const element = await page.$(selector);
      if (element) {
        const isVisible = await element.evaluate(el => {
          const rect = el.getBoundingClientRect();
          const style = window.getComputedStyle(el);
          return rect.width > 0 && 
                 rect.height > 0 && 
                 style.display !== 'none' && 
                 style.visibility !== 'hidden' &&
                 style.opacity !== '0';
        });
        if (isVisible) return { found: true, selector };
      }
    } catch (e) {
      // Continue to next selector
    }
  }
  return { found: false, selector: null };
}

// Check for horizontal scroll
async function checkHorizontalScroll(page) {
  return await page.evaluate(() => {
    const docWidth = document.documentElement.scrollWidth;
    const winWidth = window.innerWidth;
    const bodyWidth = document.body.scrollWidth;
    
    // Check if any element overflows
    const allElements = document.querySelectorAll('*');
    let overflowingElements = [];
    
    allElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.right > winWidth + 5) { // 5px tolerance
        overflowingElements.push({
          tag: el.tagName,
          class: el.className,
          width: rect.width,
          right: rect.right
        });
      }
    });
    
    return {
      hasHorizontalScroll: docWidth > winWidth || bodyWidth > winWidth,
      documentWidth: docWidth,
      windowWidth: winWidth,
      bodyWidth: bodyWidth,
      overflowDiff: Math.max(docWidth - winWidth, bodyWidth - winWidth),
      overflowingElements: overflowingElements.slice(0, 5) // Limit to first 5
    };
  });
}

// Test mobile menu functionality
async function testMobileMenu(page, logger) {
  try {
    // Check if mobile menu toggle exists
    const toggleSelectors = ['.mobile__nav-toggle', '.mobile__nav', '[data-w-id*="mobile"]'];
    let toggle = null;
    let usedSelector = null;
    
    for (const selector of toggleSelectors) {
      toggle = await page.$(selector);
      if (toggle) {
        usedSelector = selector;
        break;
      }
    }
    
    if (!toggle) {
      return { 
        success: false, 
        error: 'Mobile menu toggle not found',
        menuOpened: false,
        linksClickable: false
      };
    }
    
    logger.verbose(`Found mobile menu toggle: ${usedSelector}`);
    
    // Check if menu dropdown exists
    const menuSelectors = ['.mobile__dd', '.w-dropdown-list', '.mobile__nav-list'];
    let menu = null;
    
    for (const selector of menuSelectors) {
      menu = await page.$(selector);
      if (menu) break;
    }
    
    if (!menu) {
      return { 
        success: false, 
        error: 'Mobile menu dropdown not found',
        menuOpened: false,
        linksClickable: false
      };
    }
    
    // Click toggle to open menu
    await toggle.click();
    await page.waitForTimeout(500); // Allow animation
    
    // Check if menu is visible
    const isVisible = await menu.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });
    
    // Check for mobile nav links
    const mobileLinks = await page.$$('.nav-link-mobile, .mobile__dd a');
    const linksClickable = mobileLinks.length > 0;
    
    return {
      success: isVisible && linksClickable,
      menuOpened: isVisible,
      linksClickable: linksClickable,
      linkCount: mobileLinks.length,
      error: isVisible ? null : 'Menu did not open after toggle click'
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message,
      menuOpened: false,
      linksClickable: false
    };
  }
}

// Run tests for a single viewport and page
async function runViewportTests(browser, pageInfo, viewportName, viewportConfig, baseUrl, logger, runner) {
  logger.section(`Testing ${pageInfo.description} - ${viewportName} (${viewportConfig.width}x${viewportConfig.height})`);
  
  const context = await browser.newContext({
    viewport: {
      width: viewportConfig.width,
      height: viewportConfig.height
    },
    deviceScaleFactor: viewportConfig.deviceScaleFactor || 1
  });
  
  const page = await context.newPage();
  const testResults = {
    viewport: viewportName,
    page: pageInfo.name,
    url: `${baseUrl}${pageInfo.path}`,
    tests: {}
  };
  
  try {
    // Navigate to page
    logger.verbose(`Navigating to ${baseUrl}${pageInfo.path}`);
    await page.goto(`${baseUrl}${pageInfo.path}`, { 
      waitUntil: 'networkidle',
      timeout: CONFIG.timeout 
    });
    
    // Wait for animations to complete
    await page.waitForTimeout(2000);
    
    // Test 1: Critical Elements Visibility
    logger.verbose('Checking critical elements...');
    const elementResults = {};
    
    for (const [elementName, selectors] of Object.entries(CONFIG.criticalElements)) {
      const result = await isElementVisible(page, selectors);
      elementResults[elementName] = result;
      logger.verbose(`  ${elementName}: ${result.found ? 'VISIBLE' : 'NOT FOUND'} (${result.selector || 'none'})`);
    }
    
    const allElementsVisible = Object.values(elementResults).every(r => r.found);
    runner.addResult('Critical Elements Visible', viewportName, pageInfo.name, allElementsVisible, {
      elements: elementResults
    });
    
    if (allElementsVisible) {
      logger.success('All critical elements visible');
    } else {
      const missing = Object.entries(elementResults)
        .filter(([_, r]) => !r.found)
        .map(([name, _]) => name);
      logger.error(`Missing critical elements: ${missing.join(', ')}`);
    }
    
    // Test 2: Horizontal Scroll Check
    logger.verbose('Checking for horizontal scroll...');
    const scrollCheck = await checkHorizontalScroll(page);
    const noHorizontalScroll = !scrollCheck.hasHorizontalScroll || scrollCheck.overflowDiff <= 5;
    
    runner.addResult('No Horizontal Scroll', viewportName, pageInfo.name, noHorizontalScroll, {
      documentWidth: scrollCheck.documentWidth,
      windowWidth: scrollCheck.windowWidth,
      overflowDiff: scrollCheck.overflowDiff,
      overflowingElements: scrollCheck.overflowingElements
    });
    
    if (noHorizontalScroll) {
      logger.success('No horizontal scroll detected');
    } else {
      logger.error(`Horizontal scroll detected: ${scrollCheck.overflowDiff}px overflow`);
      if (scrollCheck.overflowingElements.length > 0) {
        logger.verbose(`Overflowing elements: ${JSON.stringify(scrollCheck.overflowingElements)}`);
      }
    }
    
    // Test 3: Mobile Menu (only for mobile viewport)
    if (viewportName === 'mobile') {
      logger.verbose('Testing mobile menu functionality...');
      const menuResult = await testMobileMenu(page, logger);
      
      runner.addResult('Mobile Menu Functional', viewportName, pageInfo.name, menuResult.success, {
        menuOpened: menuResult.menuOpened,
        linksClickable: menuResult.linksClickable,
        linkCount: menuResult.linkCount,
        error: menuResult.error
      });
      
      if (menuResult.success) {
        logger.success('Mobile menu functional');
      } else {
        logger.error(`Mobile menu issue: ${menuResult.error}`);
      }
    }
    
    // Capture screenshot
    const screenshotFilename = `${pageInfo.name}_${viewportName}_${viewportConfig.width}x${viewportConfig.height}.png`;
    const screenshotPath = path.join(CONFIG.screenshotsDir, screenshotFilename);
    
    logger.verbose(`Capturing screenshot: ${screenshotFilename}`);
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: false
    });
    
    runner.addScreenshot(screenshotPath, viewportName, pageInfo.name, `${pageInfo.description} at ${viewportName}`);
    logger.success(`Screenshot saved: ${screenshotFilename}`);
    
    await context.close();
    
    return {
      success: true,
      screenshot: screenshotFilename,
      elementResults,
      scrollCheck
    };
    
  } catch (error) {
    logger.error(`Test failed: ${error.message}`);
    
    // Capture error screenshot
    try {
      const errorScreenshotFilename = `ERROR_${pageInfo.name}_${viewportName}.png`;
      const errorScreenshotPath = path.join(CONFIG.screenshotsDir, errorScreenshotFilename);
      await page.screenshot({ path: errorScreenshotPath, fullPage: false });
      runner.addScreenshot(errorScreenshotPath, viewportName, pageInfo.name, `Error on ${pageInfo.description}`);
    } catch (e) {
      // Ignore screenshot errors
    }
    
    runner.addResult('Page Load', viewportName, pageInfo.name, false, {
      error: error.message
    });
    
    await context.close();
    return { success: false, error: error.message };
  }
}

// Generate HTML report
function generateHtmlReport(runner, config) {
  const summary = runner.getSummary();
  const timestamp = new Date().toISOString();
  
  // Group results by viewport and page
  const resultsByViewport = {};
  const resultsByPage = {};
  
  runner.results.forEach(result => {
    if (!resultsByViewport[result.viewport]) {
      resultsByViewport[result.viewport] = [];
    }
    resultsByViewport[result.viewport].push(result);
    
    if (!resultsByPage[result.page]) {
      resultsByPage[result.page] = [];
    }
    resultsByPage[result.page].push(result);
  });
  
  // Calculate viewport summaries
  const viewportSummaries = {};
  Object.entries(resultsByViewport).forEach(([viewport, results]) => {
    const passed = results.filter(r => r.passed).length;
    viewportSummaries[viewport] = {
      total: results.length,
      passed: passed,
      failed: results.length - passed
    };
  });
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mobile Responsiveness Test Report - AVIR</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
      padding: 20px;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      border-radius: 8px;
      margin-bottom: 2rem;
    }
    .header h1 { font-size: 2rem; margin-bottom: 0.5rem; }
    .header p { opacity: 0.9; }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .summary-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      text-align: center;
    }
    .summary-card h3 {
      font-size: 0.875rem;
      color: #666;
      margin-bottom: 0.5rem;
      text-transform: uppercase;
    }
    .summary-card .value {
      font-size: 2.5rem;
      font-weight: bold;
    }
    .summary-card.passed .value { color: #22c55e; }
    .summary-card.failed .value { color: #ef4444; }
    .summary-card.total .value { color: #3b82f6; }
    .summary-card.duration .value { color: #6b7280; }
    
    .viewport-section {
      background: white;
      border-radius: 8px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .viewport-header {
      background: #f8f9fa;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .viewport-header h2 {
      font-size: 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .viewport-badge {
      background: #e0e7ff;
      color: #4338ca;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .viewport-content {
      padding: 1.5rem;
    }
    
    .screenshot-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-top: 1rem;
    }
    .screenshot-card {
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      overflow: hidden;
    }
    .screenshot-card img {
      width: 100%;
      height: 200px;
      object-fit: cover;
      object-position: top;
      background: #f8f9fa;
    }
    .screenshot-info {
      padding: 1rem;
    }
    .screenshot-info h4 {
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }
    .screenshot-meta {
      font-size: 0.75rem;
      color: #6b7280;
    }
    
    .test-results {
      margin-top: 1rem;
    }
    .test-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #f3f4f6;
    }
    .test-item:last-child {
      border-bottom: none;
    }
    .test-name {
      font-weight: 500;
    }
    .test-status {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .test-status.pass {
      background: #dcfce7;
      color: #166534;
    }
    .test-status.fail {
      background: #fee2e2;
      color: #991b1b;
    }
    
    .details-section {
      margin-top: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 6px;
    }
    .details-section h5 {
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
      color: #4b5563;
    }
    .details-list {
      font-size: 0.875rem;
      color: #6b7280;
    }
    .details-list li {
      margin-left: 1.5rem;
      margin-bottom: 0.25rem;
    }
    
    .config-info {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .config-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }
    .config-item {
      font-size: 0.875rem;
    }
    .config-item strong {
      color: #111;
    }
    .config-item span {
      color: #6b7280;
    }
    
    footer {
      text-align: center;
      padding: 2rem;
      color: #6b7280;
      font-size: 0.875rem;
    }
    
    @media (max-width: 768px) {
      .screenshot-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Mobile Responsiveness Test Report</h1>
      <p>AVIR Website - Viewport Testing Across Mobile, Tablet, and Desktop</p>
      <p style="margin-top: 0.5rem; font-size: 0.875rem;">${new Date().toLocaleString()}</p>
    </div>
    
    <div class="summary-grid">
      <div class="summary-card total">
        <h3>Total Tests</h3>
        <div class="value">${summary.total}</div>
      </div>
      <div class="summary-card passed">
        <h3>Passed</h3>
        <div class="value">${summary.passed}</div>
      </div>
      <div class="summary-card failed">
        <h3>Failed</h3>
        <div class="value">${summary.failed}</div>
      </div>
      <div class="summary-card duration">
        <h3>Duration</h3>
        <div class="value">${(summary.totalDuration / 1000).toFixed(1)}s</div>
      </div>
    </div>
    
    <div class="config-info">
      <h3>Test Configuration</h3>
      <div class="config-grid">
        <div class="config-item"><strong>Base URL:</strong> <span>${config.url}</span></div>
        <div class="config-item"><strong>Pages Tested:</strong> <span>${CONFIG.pages.length}</span></div>
        <div class="config-item"><strong>Viewports:</strong> <span>${Object.keys(CONFIG.viewports).join(', ')}</span></div>
        <div class="config-item"><strong>Total Screenshots:</strong> <span>${runner.screenshots.length}</span></div>
      </div>
    </div>
    
    ${Object.entries(resultsByViewport).map(([viewport, results]) => {
      const viewportConfig = CONFIG.viewports[viewport];
      const viewportScreenshots = runner.screenshots.filter(s => s.viewport === viewport);
      const viewportSummary = viewportSummaries[viewport];
      
      return `
    <div class="viewport-section">
      <div class="viewport-header">
        <h2>
          ${viewport.charAt(0).toUpperCase() + viewport.slice(1)}
          <span class="viewport-badge">${viewportConfig.width}x${viewportConfig.height}</span>
        </h2>
        <span style="color: ${viewportSummary.failed === 0 ? '#22c55e' : '#ef4444'}; font-weight: 600;">
          ${viewportSummary.passed}/${viewportSummary.total} passed
        </span>
      </div>
      <div class="viewport-content">
        <div class="screenshot-grid">
          ${viewportScreenshots.map(screenshot => `
          <div class="screenshot-card">
            <img src="mobile-screenshots/${path.basename(screenshot.path)}" alt="${screenshot.description}" loading="lazy">
            <div class="screenshot-info">
              <h4>${screenshot.page.charAt(0).toUpperCase() + screenshot.page.slice(1)}</h4>
              <div class="screenshot-meta">${screenshot.description}</div>
            </div>
          </div>
          `).join('')}
        </div>
        
        <div class="test-results">
          <h4 style="margin-bottom: 0.5rem;">Test Results</h4>
          ${results.map(result => `
          <div class="test-item">
            <span class="test-name">${result.page} - ${result.testName}</span>
            <span class="test-status ${result.passed ? 'pass' : 'fail'}">${result.passed ? 'PASS' : 'FAIL'}</span>
          </div>
          `).join('')}
        </div>
      </div>
    </div>
      `;
    }).join('')}
    
    <footer>
      <p>AVIR Mobile Responsiveness Testing | Generated by Playwright</p>
    </footer>
  </div>
</body>
</html>`;
  
  fs.writeFileSync(CONFIG.reportPath, html);
  return CONFIG.reportPath;
}

// Generate JSON report
function generateJsonReport(runner, config) {
  const summary = runner.getSummary();
  
  const report = {
    timestamp: new Date().toISOString(),
    config: {
      url: config.url,
      viewports: CONFIG.viewports,
      pages: CONFIG.pages.map(p => p.name)
    },
    summary: {
      total: summary.total,
      passed: summary.passed,
      failed: summary.failed,
      duration: summary.totalDuration
    },
    results: runner.results,
    screenshots: runner.screenshots.map(s => ({
      ...s,
      path: path.relative(__dirname, s.path)
    }))
  };
  
  fs.writeFileSync(CONFIG.jsonReportPath, JSON.stringify(report, null, 2));
  return CONFIG.jsonReportPath;
}

// Main test execution
async function runTests() {
  const cliConfig = parseArgs();
  ensureDirectories();
  const logger = createLogger(cliConfig.verbose);
  const runner = new TestRunner();
  
  logger.section('Mobile Responsiveness Tests');
  logger.info(`Base URL: ${cliConfig.url}`);
  logger.info(`Started: ${new Date().toISOString()}`);
  
  // Check if URL is accessible
  logger.info('Checking URL accessibility...');
  const isAccessible = await checkUrlAccessible(cliConfig.url);
  if (!isAccessible) {
    logger.error(`URL ${cliConfig.url} is not accessible`);
    logger.info('Make sure your local server is running on port 8000');
    logger.info('You can start a server with: python3 -m http.server 8000 --directory site');
    process.exit(1);
  }
  logger.success('URL is accessible');
  
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    
    // Run tests for each page and viewport combination
    for (const pageInfo of CONFIG.pages) {
      for (const [viewportName, viewportConfig] of Object.entries(CONFIG.viewports)) {
        await runViewportTests(
          browser,
          pageInfo,
          viewportName,
          viewportConfig,
          cliConfig.url,
          logger,
          runner
        );
      }
    }
    
  } catch (err) {
    logger.error(`Browser initialization failed: ${err.message}`);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
  
  // Generate reports
  logger.section('Generating Reports');
  
  const htmlReportPath = generateHtmlReport(runner, cliConfig);
  logger.success(`HTML Report: ${htmlReportPath}`);
  
  const jsonReportPath = generateJsonReport(runner, cliConfig);
  logger.success(`JSON Report: ${jsonReportPath}`);
  
  // Print summary
  const summary = runner.getSummary();
  logger.section('Test Summary');
  logger.info(`Total tests: ${summary.total}`);
  logger.info(`Passed: ${summary.passed}`);
  logger.info(`Failed: ${summary.failed}`);
  logger.info(`Screenshots captured: ${runner.screenshots.length}`);
  logger.info(`Total duration: ${(summary.totalDuration / 1000).toFixed(1)}s`);
  
  // Print failed tests
  if (summary.failed > 0) {
    logger.section('Failed Tests');
    runner.results
      .filter(r => !r.passed)
      .forEach(r => {
        logger.error(`${r.page} (${r.viewport}): ${r.testName}`);
      });
  }
  
  // Return results
  const allPassed = summary.failed === 0;
  
  logger.section('Results');
  if (allPassed) {
    logger.success('All tests passed!');
  } else {
    logger.error(`${summary.failed} test(s) failed`);
  }
  
  // Open report if requested
  if (cliConfig.openReport) {
    const { exec } = require('child_process');
    const platform = process.platform;
    const openCommand = platform === 'darwin' ? 'open' : platform === 'win32' ? 'start' : 'xdg-open';
    exec(`${openCommand} ${htmlReportPath}`);
  }
  
  return {
    success: allPassed,
    summary,
    reports: {
      html: htmlReportPath,
      json: jsonReportPath
    }
  };
}

// Run the tests
runTests()
  .then(results => {
    const exitCode = results.success ? 0 : 1;
    console.log(`\nExit code: ${exitCode}\n`);
    process.exit(exitCode);
  })
  .catch(err => {
    console.error(`\nFatal error: ${err.message}\n`);
    process.exit(1);
  });
