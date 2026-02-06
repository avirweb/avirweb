#!/usr/bin/env node
/**
 * Functional Tests for AVIR Website
 * Tests navigation, mobile menu, videos, and forms
 * 
 * Usage:
 *   node functional-tests.js [--url=http://localhost:8000] [--viewport=desktop|mobile] [--verbose]
 * 
 * Exit codes:
 *   0 - All tests passed
 *   1 - One or more tests failed
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  defaultUrl: 'http://localhost:8000',
  screenshotsDir: path.join(__dirname, 'test-results', 'functional-screenshots'),
  reportPath: path.join(__dirname, 'test-results', 'functional-report.html'),
  viewport: {
    desktop: { width: 1920, height: 1080 },
    mobile: { width: 375, height: 667 }
  },
  timeout: 30000,
  navigationTimeout: 10000
};

// Parse CLI arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    url: CONFIG.defaultUrl,
    viewport: 'desktop',
    verbose: false
  };

  for (const arg of args) {
    if (arg.startsWith('--url=')) {
      config.url = arg.replace('--url=', '');
    } else if (arg.startsWith('--viewport=')) {
      config.viewport = arg.replace('--viewport=', '');
    } else if (arg === '--verbose') {
      config.verbose = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Functional Tests for AVIR Website

Usage: node functional-tests.js [options]

Options:
  --url=<url>           Base URL to test (default: http://localhost:8000)
  --viewport=<type>     Viewport type: desktop|mobile (default: desktop)
  --verbose             Enable verbose output
  --help, -h            Show this help message

Examples:
  node functional-tests.js
  node functional-tests.js --url=https://example.com
  node functional-tests.js --viewport=mobile --verbose
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
    verbose: (msg) => verbose && console.log(`[VERB] ${msg}`),
    section: (msg) => console.log(`\n=== ${msg} ===`)
  };
}

// Test result tracking
class TestRunner {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  addResult(name, passed, duration, error = null, screenshot = null) {
    this.results.push({
      name,
      passed,
      duration,
      error,
      screenshot,
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

// Test Definitions
const TESTS = [
  {
    name: 'Navigation - Homepage to Services',
    test: async (page, baseUrl, logger) => {
      await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle', timeout: CONFIG.timeout });
      await page.waitForSelector('.nav__link-wrap, .mobile__nav', { timeout: 5000 });
      
      // Look for services link
      const servicesLink = await page.$('a[href="/services"]');
      if (!servicesLink) {
        throw new Error('Services link not found in navigation');
      }
      
      await servicesLink.click();
      await page.waitForLoadState('networkidle');
      
      const url = page.url();
      if (!url.includes('/services')) {
        throw new Error(`Expected URL to include /services, got: ${url}`);
      }
      
      return true;
    }
  },
  {
    name: 'Navigation - All Main Nav Links',
    test: async (page, baseUrl, logger) => {
      const navLinks = [
        { path: '/', selector: '.nav__site-logo, .nav-link[href="/"]' },
        { path: '/services', selector: 'a[href="/services"]' },
        { path: '/brands', selector: 'a[href="/brands"]' },
        { path: '/portfolio', selector: 'a[href="/portfolio"]' },
        { path: '/about-avir', selector: 'a[href="/about-avir"]' },
        { path: '/contact', selector: 'a[href="/contact"]' }
      ];
      
      const results = [];
      for (const link of navLinks) {
        try {
          await page.goto(`${baseUrl}${link.path}`, { waitUntil: 'networkidle', timeout: CONFIG.timeout });
          await page.waitForSelector(link.selector, { timeout: 5000 });
          results.push({ path: link.path, success: true });
        } catch (error) {
          results.push({ path: link.path, success: false, error: error.message });
        }
      }
      
      const failed = results.filter(r => !r.success);
      if (failed.length > 0) {
        throw new Error(`Failed navigation to: ${failed.map(f => f.path).join(', ')}`);
      }
      
      return true;
    }
  },
  {
    name: 'Mobile Menu Toggle',
    test: async (page, baseUrl, logger) => {
      await page.setViewportSize(CONFIG.viewport.mobile);
      await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle', timeout: CONFIG.timeout });
      
      // Look for mobile menu toggle
      const mobileToggle = await page.$('.mobile__nav-toggle');
      if (!mobileToggle) {
        throw new Error('Mobile menu toggle (.mobile__nav-toggle) not found');
      }
      
      // Check if menu is initially closed
      const mobileMenu = await page.$('.mobile__dd');
      if (!mobileMenu) {
        throw new Error('Mobile menu dropdown (.mobile__dd) not found');
      }
      
      // Click toggle to open menu
      await mobileToggle.click();
      await page.waitForTimeout(500); // Allow animation
      
      // Check if menu opened
      const isVisible = await mobileMenu.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });
      
      if (!isVisible) {
        throw new Error('Mobile menu did not open after toggle click');
      }
      
      // Verify mobile nav links exist
      const mobileLinks = await page.$$('.nav-link-mobile');
      if (mobileLinks.length === 0) {
        throw new Error('No mobile navigation links found');
      }
      
      return true;
    }
  },
  {
    name: 'Video Element Present',
    test: async (page, baseUrl, logger) => {
      await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle', timeout: CONFIG.timeout });
      
      const videos = await page.$$('video');
      if (videos.length === 0) {
        throw new Error('No video elements found on homepage');
      }
      
      // Check video attributes
      for (let i = 0; i < videos.length; i++) {
        const video = videos[i];
        const hasSrc = await video.evaluate(el => {
          return el.currentSrc || el.querySelector('source')?.src;
        });
        
        logger.verbose(`Video ${i + 1}: has source = ${!!hasSrc}`);
      }
      
      return videos.length > 0;
    }
  },
  {
    name: 'Video Playback Capabilities',
    test: async (page, baseUrl, logger) => {
      await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle', timeout: CONFIG.timeout });
      
      const videoCheck = await page.evaluate(() => {
        const videos = document.querySelectorAll('video');
        return Array.from(videos).map((v, i) => ({
          index: i,
          paused: v.paused,
          muted: v.muted,
          autoplay: v.autoplay,
          loop: v.loop,
          readyState: v.readyState,
          duration: v.duration,
          error: v.error?.message || null
        }));
      });
      
      if (videoCheck.length === 0) {
        throw new Error('No video elements found');
      }
      
      logger.verbose(`Found ${videoCheck.length} videos: ${JSON.stringify(videoCheck)}`);
      
      return videoCheck.length > 0;
    }
  },
  {
    name: 'Homepage Form Fields',
    test: async (page, baseUrl, logger) => {
      await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle', timeout: CONFIG.timeout });
      
      // Homepage has a CTA form
      const formFields = [
        { name: 'name', type: 'text' },
        { name: 'project-type', type: 'text' },
        { name: 'email-address', type: 'email' },
        { name: 'budget', type: 'text' }
      ];
      
      for (const field of formFields) {
        const input = await page.$(`input[name="${field.name}"], input[data-name="${field.name}"]`);
        if (!input) {
          throw new Error(`Form field "${field.name}" not found`);
        }
        
        // Check if field is enabled
        const isEnabled = await input.evaluate(el => !el.disabled);
        if (!isEnabled) {
          throw new Error(`Form field "${field.name}" is disabled`);
        }
        
        // Try to fill the field (but don't submit)
        await input.fill(`Test ${field.name}`);
        const value = await input.inputValue();
        if (value !== `Test ${field.name}`) {
          throw new Error(`Could not fill form field "${field.name}"`);
        }
        
        // Clear the field
        await input.fill('');
      }
      
      return true;
    }
  },
  {
    name: 'Contact Page Accessibility',
    test: async (page, baseUrl, logger) => {
      await page.goto(`${baseUrl}/contact`, { waitUntil: 'networkidle', timeout: CONFIG.timeout });
      
      // Check for contact information
      const contactElements = [
        { selector: '.footer__contact-info', name: 'Contact info' },
        { selector: '.footer__heading', name: 'Footer headings' }
      ];
      
      for (const el of contactElements) {
        const element = await page.$(el.selector);
        if (!element) {
          logger.verbose(`Warning: ${el.name} not found`);
        }
      }
      
      // Check page title
      const title = await page.title();
      if (!title.toLowerCase().includes('contact')) {
        throw new Error(`Page title does not indicate contact page: ${title}`);
      }
      
      return true;
    }
  },
  {
    name: 'Dropdown Navigation',
    test: async (page, baseUrl, logger) => {
      await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle', timeout: CONFIG.timeout });
      
      // Test desktop dropdowns
      const dropdowns = await page.$$('.nav__dropdown');
      if (dropdowns.length === 0) {
        logger.verbose('No dropdown navigation found');
        return true;
      }
      
      for (let i = 0; i < dropdowns.length; i++) {
        const dropdown = dropdowns[i];
        const toggle = await dropdown.$('.nav-link.is--dropdown');
        
        if (toggle) {
          await toggle.hover();
          await page.waitForTimeout(300);
          
          const dropdownList = await dropdown.$('.nav__dropdown-list');
          if (dropdownList) {
            const isVisible = await dropdownList.evaluate(el => {
              const style = window.getComputedStyle(el);
              return style.display !== 'none';
            });
            
            if (!isVisible) {
              logger.verbose(`Dropdown ${i + 1} did not open on hover`);
            }
          }
        }
      }
      
      return true;
    }
  },
  {
    name: 'Left Sidebar Navigation',
    test: async (page, baseUrl, logger) => {
      await page.goto(`${baseUrl}/services`, { waitUntil: 'networkidle', timeout: CONFIG.timeout });
      
      const leftBar = await page.$('.left-bar');
      if (!leftBar) {
        throw new Error('Left sidebar (.left-bar) not found');
      }
      
      const leftBarItems = await page.$$('.left-bar__item');
      if (leftBarItems.length === 0) {
        throw new Error('No left sidebar navigation items found');
      }
      
      logger.verbose(`Found ${leftBarItems.length} left sidebar items`);
      
      // Try clicking first item
      if (leftBarItems.length > 0) {
        await leftBarItems[0].click();
        await page.waitForTimeout(500);
      }
      
      return leftBarItems.length > 0;
    }
  },
  {
    name: 'Footer Navigation',
    test: async (page, baseUrl, logger) => {
      await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle', timeout: CONFIG.timeout });
      
      const footer = await page.$('.footer');
      if (!footer) {
        throw new Error('Footer section not found');
      }
      
      const footerLinks = await page.$$('.nav-link.is--footer');
      if (footerLinks.length === 0) {
        throw new Error('No footer navigation links found');
      }
      
      logger.verbose(`Found ${footerLinks.length} footer navigation links`);
      
      return footerLinks.length > 0;
    }
  }
];

// Main test execution
async function runTests() {
  const cliConfig = parseArgs();
  ensureDirectories();
  const logger = createLogger(cliConfig.verbose);
  const runner = new TestRunner();
  
  logger.section('AVIR Functional Tests');
  logger.info(`Base URL: ${cliConfig.url}`);
  logger.info(`Viewport: ${cliConfig.viewport}`);
  logger.info(`Started: ${new Date().toISOString()}`);
  
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    
    for (const testDef of TESTS) {
      const testStart = Date.now();
      logger.info(`Running: ${testDef.name}`);
      
      const context = await browser.newContext({
        viewport: CONFIG.viewport[cliConfig.viewport] || CONFIG.viewport.desktop
      });
      const page = await context.newPage();
      
      let screenshot = null;
      let passed = false;
      let error = null;
      
      try {
        passed = await testDef.test(page, cliConfig.url, logger);
        
        // Take screenshot on success
        const screenshotPath = path.join(
          CONFIG.screenshotsDir,
          `${testDef.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`
        );
        await page.screenshot({ path: screenshotPath, fullPage: false });
        screenshot = path.basename(screenshotPath);
        
        logger.success(`${testDef.name}`);
      } catch (err) {
        passed = false;
        error = err.message;
        
        // Take screenshot on failure
        const screenshotPath = path.join(
          CONFIG.screenshotsDir,
          `FAILED_${testDef.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`
        );
        await page.screenshot({ path: screenshotPath, fullPage: false });
        screenshot = path.basename(screenshotPath);
        
        logger.error(`${testDef.name}: ${error}`);
      }
      
      const duration = Date.now() - testStart;
      runner.addResult(testDef.name, passed, duration, error, screenshot);
      
      await context.close();
    }
    
  } catch (err) {
    logger.error(`Browser initialization failed: ${err.message}`);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
  
  // Generate report
  const summary = runner.getSummary();
  await generateReport(runner.results, summary, cliConfig);
  
  // Print summary
  logger.section('Test Summary');
  logger.info(`Total tests: ${summary.total}`);
  logger.info(`Passed: ${summary.passed}`);
  logger.info(`Failed: ${summary.failed}`);
  logger.info(`Total duration: ${summary.totalDuration}ms`);
  logger.info(`Report saved to: ${CONFIG.reportPath}`);
  
  // Exit with appropriate code
  process.exit(summary.failed > 0 ? 1 : 0);
}

// Generate HTML report
async function generateReport(results, summary, config) {
  const timestamp = new Date().toISOString();
  const statusColor = summary.failed === 0 ? '#22c55e' : '#ef4444';
  const statusText = summary.failed === 0 ? 'PASSED' : 'FAILED';
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Functional Test Results - AVIR</title>
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
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      padding: 30px;
    }
    h1 {
      color: #1a1a1a;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid #e0e0e0;
    }
    h2 {
      color: #444;
      margin: 25px 0 15px;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
      margin-bottom: 30px;
    }
    .summary-card {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 6px;
      text-align: center;
    }
    .summary-card.status {
      background: ${statusColor};
      color: white;
    }
    .summary-card h3 {
      font-size: 2em;
      margin-bottom: 5px;
    }
    .summary-card p {
      color: #666;
      font-size: 0.9em;
    }
    .summary-card.status p {
      color: rgba(255,255,255,0.9);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e0e0e0;
    }
    th {
      background: #f8f9fa;
      font-weight: 600;
      color: #555;
    }
    tr:hover {
      background: #f8f9fa;
    }
    .status-pass {
      color: #22c55e;
      font-weight: 600;
    }
    .status-fail {
      color: #ef4444;
      font-weight: 600;
    }
    .duration {
      color: #666;
      font-size: 0.9em;
    }
    .error {
      color: #ef4444;
      font-size: 0.85em;
      margin-top: 5px;
    }
    .screenshot-link {
      color: #3b82f6;
      text-decoration: none;
    }
    .screenshot-link:hover {
      text-decoration: underline;
    }
    .config-info {
      background: #f0f7ff;
      padding: 15px;
      border-radius: 6px;
      margin-bottom: 20px;
    }
    .config-info p {
      margin: 5px 0;
      color: #555;
    }
    footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      text-align: center;
      color: #888;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Functional Test Results</h1>
    
    <div class="config-info">
      <p><strong>Base URL:</strong> ${config.url}</p>
      <p><strong>Viewport:</strong> ${config.viewport}</p>
      <p><strong>Generated:</strong> ${timestamp}</p>
    </div>
    
    <div class="summary">
      <div class="summary-card status">
        <h3>${statusText}</h3>
        <p>Overall Status</p>
      </div>
      <div class="summary-card">
        <h3>${summary.total}</h3>
        <p>Total Tests</p>
      </div>
      <div class="summary-card">
        <h3 style="color: #22c55e;">${summary.passed}</h3>
        <p>Passed</p>
      </div>
      <div class="summary-card">
        <h3 style="color: ${summary.failed > 0 ? '#ef4444' : '#666'};">${summary.failed}</h3>
        <p>Failed</p>
      </div>
      <div class="summary-card">
        <h3>${summary.totalDuration}ms</h3>
        <p>Total Duration</p>
      </div>
    </div>
    
    <h2>Detailed Results</h2>
    <table>
      <thead>
        <tr>
          <th>Test</th>
          <th>Status</th>
          <th>Duration</th>
          <th>Screenshot</th>
        </tr>
      </thead>
      <tbody>
        ${results.map(r => `
        <tr>
          <td>
            ${r.name}
            ${r.error ? `<div class="error">${r.error}</div>` : ''}
          </td>
          <td class="${r.passed ? 'status-pass' : 'status-fail'}">
            ${r.passed ? 'PASS' : 'FAIL'}
          </td>
          <td class="duration">${r.duration}ms</td>
          <td>
            ${r.screenshot ? `<a class="screenshot-link" href="functional-screenshots/${r.screenshot}" target="_blank">View</a>` : '-'}
          </td>
        </tr>
        `).join('')}
      </tbody>
    </table>
    
    <footer>
      <p>AVIR Functional Tests | Generated by Playwright</p>
    </footer>
  </div>
</body>
</html>`;

  fs.writeFileSync(CONFIG.reportPath, html);
}

// Run the tests
runTests().catch(err => {
  console.error(`Fatal error: ${err.message}`);
  process.exit(1);
});
