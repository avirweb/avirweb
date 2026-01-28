#!/usr/bin/env node
/**
 * Visual Audit v2: Production Site Audit
 *
 * Audits www.avir.com pages for visual consistency and issues.
 * Compares against itself (production baseline) to identify:
 * - Broken images (404s)
 * - Console errors
 * - Form rendering issues
 * - Page structure issues
 *
 * Usage:
 *   TEST_SITE_URL=https://www.avir.com node scripts/visual-audit-v2.js --all
 *   node scripts/visual-audit-v2.js --page index
 *
 * To test against test site (when fixed):
 *   TEST_SITE_URL=https://avirwebtest.pages.dev node scripts/visual-audit-v2.js --all
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Configuration - use env var or default to production
const TEST_SITE = process.env.TEST_SITE_URL || 'https://www.avir.com';
const VIEWPORT = { width: 1920, height: 1080 };
const SCROLL_INCREMENT = 500;
const WAIT_TIME = 2000;
const SITE_DIR = '/home/agent/avir/site';
const SCREENSHOTS_DIR = '/home/agent/avir/site/screenshots';
const PATHS_FILE = '/home/agent/avir/site/paths-audit.txt';

// Directories
const DIRS = {
  TEST: path.join(SCREENSHOTS_DIR, 'test'),
  NETWORK: path.join(SCREENSHOTS_DIR, 'network'),
  CONSOLE: path.join(SCREENSHOTS_DIR, 'console'),
  LINKS: path.join(SCREENSHOTS_DIR, 'links'),
  FORMS: path.join(SCREENSHOTS_DIR, 'forms')
};

// State
let browser = null;
let page = null;
let currentPage = '';
const results = {
  pagesAudited: 0,
  errors: [],
  findings: {
    images404: [],
    formIssues: [],
    consoleErrors: [],
    linkFailures: []
  }
};

/**
 * Initialize directories and browser
 */
async function initBrowser() {
  if (browser) {
    try { await browser.close(); } catch (e) {}
  }
  browser = await chromium.launch({ headless: true });
  page = await browser.newPage();
  await page.setViewportSize(VIEWPORT);

  // Setup console logging
  page.on('console', msg => {
    if (msg.type() === 'error') {
      results.findings.consoleErrors.push({
        page: currentPage,
        message: msg.text(),
        timestamp: new Date().toISOString()
      });
    }
  });

  // Setup network logging for 404s
  page.on('response', response => {
    if (response.status() >= 400) {
      const url = response.url();
      if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        results.findings.images404.push({
          page: currentPage,
          url: url,
          status: response.status()
        });
      }
    }
  });
}

/**
 * Initialize directories and state
 */
async function init() {
  console.log('Initializing Visual Audit v2...');
  console.log(`Test site: ${TEST_SITE}`);

  // Ensure directories exist
  Object.values(DIRS).forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  await initBrowser();
  console.log('Initialization complete.\n');
}

/**
 * Navigate to page
 */
async function navigateTo(url) {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(WAIT_TIME);
}

/**
 * Scroll from top to bottom
 */
async function fullPageScroll() {
  const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const viewportHeight = await page.evaluate(() => window.innerHeight);
  const maxScroll = scrollHeight - viewportHeight;

  for (let position = 0; position <= maxScroll; position += SCROLL_INCREMENT) {
    await page.evaluate((pos) => window.scrollTo(0, pos), position);
    await page.waitForTimeout(100);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
}

/**
 * Take screenshot
 */
async function takeScreenshot(pagePath) {
  const filename = `${pagePath.replace(/\//g, '_')}.png`;
  const filepath = path.join(DIRS.TEST, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  return filepath;
}

/**
 * Check forms for rendering issues
 */
async function checkForms() {
  const forms = await page.$$('form');
  const issues = [];

  for (const form of forms) {
    const html = await form.innerHTML();
    const hasRawPattern = html.includes('data-wf-page-id') ||
                         html.includes('data-wf-element-id') ||
                         (html.includes('method="post"') && html.length < 100);

    if (hasRawPattern || html.trim().length === 0) {
      issues.push({ hasRawHtml: hasRawPattern, htmlLength: html.length });
    }
  }
  return issues;
}

/**
 * Test internal links
 */
async function testLinks(baseUrl) {
  const links = await page.$$('a[href]');
  const results = [];

  for (const link of links) {
    const href = await link.getAttribute('href');
    if (href && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
      const fullUrl = href.startsWith('/') ? `${baseUrl}${href}` : `${baseUrl}/${href}`;
      try {
        const response = await page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
        results.push({ href, status: response.status(), success: response.status() < 400 });
      } catch (error) {
        results.push({ href, error: error.message, success: false });
      }
      // Return to original page
      await navigateTo(`${baseUrl}/${currentPage}`);
    }
  }
  return results;
}

/**
 * Audit a single page
 */
async function auditPage(pagePath) {
  console.log(`Auditing: ${pagePath}`);
  const startTime = Date.now();
  currentPage = pagePath;

  const urlPath = pagePath === 'index.html' ? '' : `/${pagePath.replace('.html', '')}`;
  const url = `${TEST_SITE}${urlPath}`;

  try {
    await navigateTo(url);
    await fullPageScroll();
    await takeScreenshot(pagePath);

    // Check forms
    const formIssues = await checkForms();
    if (formIssues.length > 0) {
      console.log(`  Forms with issues: ${formIssues.length}`);
      results.findings.formIssues.push({ page: pagePath, count: formIssues.length });
    }

    // Save evidence
    fs.writeFileSync(
      path.join(DIRS.FORMS, `${pagePath.replace(/\//g, '_')}.json`),
      JSON.stringify({ formIssues, timestamp: new Date().toISOString() }, null, 2)
    );

    const duration = Date.now() - startTime;
    console.log(`  Done in ${(duration / 1000).toFixed(1)}s`);
    results.pagesAudited++;

  } catch (error) {
    console.error(`  Error: ${error.message}`);
    results.errors.push({ page: pagePath, error: error.message });

    // Try to restart browser if it crashed
    if (error.message.includes('Target page, context or browser has been closed')) {
      console.log('  Restarting browser...');
      await initBrowser();
    }
  }
}

/**
 * Run full audit
 */
async function runAudit() {
  if (!fs.existsSync(PATHS_FILE)) {
    console.error(`Paths file not found: ${PATHS_FILE}`);
    return;
  }

  const pages = fs.readFileSync(PATHS_FILE, 'utf-8').split('\n').filter(p => p.trim());

  console.log(`Auditing ${pages.length} pages...\n`);

  for (const pagePath of pages) {
    await auditPage(pagePath);
  }

  console.log(`\nAudit complete. ${results.pagesAudited} pages audited.`);
}

/**
 * Generate report
 */
function generateReport() {
  const report = `# Visual Audit Report

Generated: ${new Date().toISOString()}
Site: ${TEST_SITE}

## Summary

- Pages Audited: ${results.pagesAudited}
- Pages with Errors: ${results.errors.length}
- Image 404s: ${results.findings.images404.length}
- Form Issues: ${results.findings.formIssues.length}
- Console Errors: ${results.findings.consoleErrors.length}
- Link Failures: ${results.findings.linkFailures.length}

## Findings

### Image 404s
${results.findings.images404.length === 0 ? 'None found.' : results.findings.images404.map(i => `- ${i.page}: ${i.url}`).join('\n')}

### Form Issues
${results.findings.formIssues.length === 0 ? 'None found.' : results.findings.formIssues.map(f => `- ${f.page}: ${f.count} issues`).join('\n')}

### Console Errors
${results.findings.consoleErrors.length === 0 ? 'None found.' : results.findings.consoleErrors.map(e => `- ${e.page}: ${e.message}`).join('\n')}

### Link Failures
${results.findings.linkFailures.length === 0 ? 'None found.' : results.findings.linkFailures.map(l => `- ${l.page}: ${l.links.length} failures`).join('\n')}

## Errors
${results.errors.length === 0 ? 'None.' : results.errors.map(e => `- ${e.page}: ${e.error}`).join('\n')}
`;

  fs.writeFileSync('VISUAL-AUDIT-REPORT.md', report);
  console.log('Report: VISUAL-AUDIT-REPORT.md');
}

/**
 * Cleanup
 */
async function cleanup() {
  if (browser) await browser.close();
}

// Main
async function main() {
  const args = process.argv.slice(2);
  const pageArg = args.find(a => a.startsWith('--page='))?.replace('--page=', '');

  try {
    await init();

    if (pageArg) {
      await auditPage(pageArg);
    } else {
      await runAudit();
      generateReport();
    }

  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await cleanup();
  }
}

main();
