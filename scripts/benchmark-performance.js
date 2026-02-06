#!/usr/bin/env node
/**
 * Performance Benchmark Script for AVIR Website
 * 
 * Measures page load times, network requests, page weight, and Core Web Vitals
 * 
 * Usage:
 *   node benchmark-performance.js [--url=http://localhost:8000] [--verbose] [--json]
 * 
 * Exit codes:
 *   0 - All pages load in <5s (PASS)
 *   1 - One or more pages load in >=5s (FAIL)
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  defaultUrl: 'http://localhost:8000',
  resultsDir: path.join(__dirname, 'test-results', 'performance'),
  reportPath: path.join(__dirname, 'test-results', 'performance-report.html'),
  jsonReportPath: path.join(__dirname, 'test-results', 'performance-report.json'),
  viewport: { width: 1920, height: 1080 },
  timeout: 30000,
  maxLoadTime: 5000, // 5 seconds threshold
  pages: [
    { path: '/', name: 'Homepage' },
    { path: '/services', name: 'Services' },
    { path: '/about-avir', name: 'About AVIR' },
    { path: '/contact', name: 'Contact' },
    { path: '/brands', name: 'Brands' }
  ]
};

// Parse CLI arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    url: CONFIG.defaultUrl,
    verbose: false,
    json: false
  };

  for (const arg of args) {
    if (arg.startsWith('--url=')) {
      config.url = arg.replace('--url=', '');
    } else if (arg === '--verbose') {
      config.verbose = true;
    } else if (arg === '--json') {
      config.json = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Performance Benchmark Script for AVIR Website

Usage: node benchmark-performance.js [options]

Options:
  --url=<url>      Base URL to test (default: http://localhost:8000)
  --verbose        Enable verbose output
  --json           Output results as JSON only
  --help, -h       Show this help message

Metrics measured:
  - Page load time (navigationStart to loadEventEnd)
  - Network request count
  - Total page weight (sum of all resources)
  - Core Web Vitals (LCP, FID, CLS) when available

Exit codes:
  0 - All pages load in <5s
  1 - One or more pages load in >=5s
`);
      process.exit(0);
    }
  }

  return config;
}

// Ensure directories exist
function ensureDirectories() {
  if (!fs.existsSync(CONFIG.resultsDir)) {
    fs.mkdirSync(CONFIG.resultsDir, { recursive: true });
  }
}

// Logger
function createLogger(verbose, jsonOnly) {
  if (jsonOnly) {
    return {
      info: () => {},
      success: () => {},
      error: () => {},
      verbose: () => {},
      section: () => {},
      warn: () => {}
    };
  }
  
  return {
    info: (msg) => console.log(`[INFO] ${msg}`),
    success: (msg) => console.log(`[PASS] ${msg}`),
    error: (msg) => console.log(`[FAIL] ${msg}`),
    warn: (msg) => console.log(`[WARN] ${msg}`),
    verbose: (msg) => verbose && console.log(`[VERB] ${msg}`),
    section: (msg) => console.log(`\n=== ${msg} ===`)
  };
}

// Format bytes to human-readable
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Format milliseconds to human-readable
function formatDuration(ms) {
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

// Measure performance for a single page
async function measurePagePerformance(page, pageConfig, baseUrl, logger) {
  const url = `${baseUrl}${pageConfig.path}`;
  logger.info(`Testing: ${pageConfig.name} (${url})`);
  
  // Track network requests
  const networkRequests = [];
  const networkHandler = (request) => {
    networkRequests.push({
      url: request.url(),
      method: request.method(),
      resourceType: request.resourceType(),
      startTime: Date.now()
    });
  };
  
  const responseHandler = async (response) => {
    const request = response.request();
    const requestIndex = networkRequests.findIndex(r => r.url === request.url() && r.method === request.method());
    if (requestIndex !== -1) {
      const body = await response.body().catch(() => Buffer.alloc(0));
      networkRequests[requestIndex].size = body.length;
      networkRequests[requestIndex].status = response.status();
      networkRequests[requestIndex].endTime = Date.now();
    }
  };
  
  page.on('request', networkHandler);
  page.on('response', responseHandler);
  
  // Clear cache for accurate measurements
  const client = await page.context().newCDPSession(page);
  await client.send('Network.clearBrowserCache');
  
  // Inject performance observer for Core Web Vitals
  await page.addInitScript(() => {
    window.performanceMetrics = {
      lcp: null,
      fid: null,
      cls: null,
      lcpEntries: [],
      clsEntries: []
    };
    
    // Observe LCP
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          window.performanceMetrics.lcpEntries = entries;
          if (entries.length > 0) {
            const lastEntry = entries[entries.length - 1];
            window.performanceMetrics.lcp = lastEntry.startTime;
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {}
      
      // Observe CLS
      try {
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          window.performanceMetrics.clsEntries = entries;
          let clsValue = 0;
          entries.forEach(entry => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          window.performanceMetrics.cls = clsValue;
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {}
      
      // Observe FID
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            window.performanceMetrics.fid = entries[0].processingStart - entries[0].startTime;
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {}
    }
  });
  
  // Navigate to page and measure
  const navigationStart = Date.now();
  
  try {
    await page.goto(url, { 
      waitUntil: 'load',
      timeout: CONFIG.timeout 
    });
  } catch (err) {
    logger.error(`Failed to load ${url}: ${err.message}`);
    return {
      page: pageConfig.name,
      path: pageConfig.path,
      error: err.message,
      loadTime: 0,
      networkRequests: 0,
      pageWeight: 0,
      coreWebVitals: {}
    };
  }
  
  // Wait a bit for any async metrics
  await page.waitForTimeout(1000);
  
  // Get navigation timing
  const navigationTiming = await page.evaluate(() => {
    const timing = performance.getEntriesByType('navigation')[0];
    if (timing) {
      return {
        navigationStart: timing.startTime,
        domInteractive: timing.domInteractive,
        domContentLoadedEventEnd: timing.domContentLoadedEventEnd,
        loadEventEnd: timing.loadEventEnd,
        duration: timing.duration
      };
    }
    return null;
  });
  
  // Get Core Web Vitals from page
  const coreWebVitals = await page.evaluate(() => {
    return window.performanceMetrics || {};
  });
  
  // Calculate metrics
  const loadTime = navigationTiming ? navigationTiming.loadEventEnd : (Date.now() - navigationStart);
  const pageWeight = networkRequests.reduce((sum, req) => sum + (req.size || 0), 0);
  const successfulRequests = networkRequests.filter(req => req.status && req.status < 400).length;
  
  // Resource breakdown by type
  const resourceBreakdown = networkRequests.reduce((acc, req) => {
    const type = req.resourceType || 'other';
    if (!acc[type]) {
      acc[type] = { count: 0, size: 0 };
    }
    acc[type].count++;
    acc[type].size += (req.size || 0);
    return acc;
  }, {});
  
  // Remove handlers
  page.off('request', networkHandler);
  page.off('response', responseHandler);
  
  return {
    page: pageConfig.name,
    path: pageConfig.path,
    url,
    loadTime,
    loadTimeFormatted: formatDuration(loadTime),
    navigationTiming,
    networkRequests: networkRequests.length,
    successfulRequests,
    pageWeight,
    pageWeightFormatted: formatBytes(pageWeight),
    coreWebVitals: {
      lcp: coreWebVitals.lcp ? Math.round(coreWebVitals.lcp) : null,
      fid: coreWebVitals.fid ? Math.round(coreWebVitals.fid) : null,
      cls: coreWebVitals.cls ? parseFloat(coreWebVitals.cls.toFixed(4)) : null
    },
    resourceBreakdown,
    passed: loadTime < CONFIG.maxLoadTime,
    timestamp: new Date().toISOString()
  };
}

// Generate HTML report
function generateHtmlReport(results, summary, config) {
  const timestamp = new Date().toISOString();
  const allPassed = summary.failed === 0;
  const statusColor = allPassed ? '#22c55e' : '#ef4444';
  const statusText = allPassed ? 'PASS' : 'FAIL';
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Performance Benchmark Report - AVIR</title>
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
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      padding: 30px;
    }
    h1 {
      color: #1a1a1a;
      margin-bottom: 10px;
      padding-bottom: 15px;
      border-bottom: 2px solid #e0e0e0;
    }
    h2 {
      color: #444;
      margin: 25px 0 15px;
    }
    h3 {
      color: #555;
      margin: 20px 0 10px;
    }
    .subtitle {
      color: #666;
      margin-bottom: 20px;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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
    .summary-card h3.value {
      font-size: 2em;
      margin-bottom: 5px;
      color: inherit;
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
      margin-top: 15px;
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
    .metric {
      font-family: monospace;
      font-size: 0.9em;
      background: #f0f0f0;
      padding: 2px 6px;
      border-radius: 3px;
    }
    .metric-good {
      color: #22c55e;
    }
    .metric-warn {
      color: #f59e0b;
    }
    .metric-bad {
      color: #ef4444;
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
    .cwv-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }
    .cwv-item {
      background: #f8f9fa;
      padding: 10px;
      border-radius: 4px;
      text-align: center;
    }
    .cwv-item .label {
      font-size: 0.8em;
      color: #666;
      text-transform: uppercase;
    }
    .cwv-item .value {
      font-size: 1.2em;
      font-weight: 600;
      margin-top: 5px;
    }
    footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      text-align: center;
      color: #888;
      font-size: 0.9em;
    }
    .error {
      color: #ef4444;
      font-size: 0.85em;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Performance Benchmark Report</h1>
    <p class="subtitle">AVIR Website Performance Analysis</p>
    
    <div class="config-info">
      <p><strong>Base URL:</strong> ${config.url}</p>
      <p><strong>Max Load Time Threshold:</strong> ${formatDuration(CONFIG.maxLoadTime)}</p>
      <p><strong>Generated:</strong> ${timestamp}</p>
    </div>
    
    <div class="summary">
      <div class="summary-card status">
        <h3 class="value">${statusText}</h3>
        <p>Overall Status</p>
      </div>
      <div class="summary-card">
        <h3 class="value">${summary.total}</h3>
        <p>Pages Tested</p>
      </div>
      <div class="summary-card">
        <h3 class="value" style="color: #22c55e;">${summary.passed}</h3>
        <p>Passed (&lt;5s)</p>
      </div>
      <div class="summary-card">
        <h3 class="value" style="color: ${summary.failed > 0 ? '#ef4444' : '#666'};">${summary.failed}</h3>
        <p>Failed (&ge;5s)</p>
      </div>
      <div class="summary-card">
        <h3 class="value">${formatBytes(summary.totalWeight)}</h3>
        <p>Total Page Weight</p>
      </div>
      <div class="summary-card">
        <h3 class="value">${summary.avgLoadTime}</h3>
        <p>Avg Load Time</p>
      </div>
    </div>
    
    <h2>Detailed Results</h2>
    <table>
      <thead>
        <tr>
          <th>Page</th>
          <th>Load Time</th>
          <th>Status</th>
          <th>Network Requests</th>
          <th>Page Weight</th>
          <th>LCP</th>
          <th>CLS</th>
        </tr>
      </thead>
      <tbody>
        ${results.map(r => `
        <tr>
          <td>
            <strong>${r.page}</strong>
            <br><small style="color: #666;">${r.path}</small>
            ${r.error ? `<div class="error">Error: ${r.error}</div>` : ''}
          </td>
          <td>
            <span class="metric ${r.loadTime < 2500 ? 'metric-good' : r.loadTime < 5000 ? 'metric-warn' : 'metric-bad'}">${r.loadTimeFormatted}</span>
          </td>
          <td class="${r.passed ? 'status-pass' : 'status-fail'}">${r.passed ? 'PASS' : 'FAIL'}</td>
          <td>${r.networkRequests}</td>
          <td>${r.pageWeightFormatted}</td>
          <td>${r.coreWebVitals.lcp ? formatDuration(r.coreWebVitals.lcp) : '-'}</td>
          <td>${r.coreWebVitals.cls !== null ? r.coreWebVitals.cls.toFixed(4) : '-'}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
    
    <h2>Core Web Vitals Summary</h2>
    <div class="cwv-grid">
      <div class="cwv-item">
        <div class="label">Largest Contentful Paint (LCP)</div>
        <div class="value">${summary.avgLCP ? formatDuration(summary.avgLCP) : 'N/A'}</div>
      </div>
      <div class="cwv-item">
        <div class="label">First Input Delay (FID)</div>
        <div class="value">${summary.avgFID ? Math.round(summary.avgFID) + 'ms' : 'N/A'}</div>
      </div>
      <div class="cwv-item">
        <div class="label">Cumulative Layout Shift (CLS)</div>
        <div class="value">${summary.avgCLS !== null ? summary.avgCLS.toFixed(4) : 'N/A'}</div>
      </div>
    </div>
    
    <footer>
      <p>AVIR Performance Benchmark | Generated by Playwright</p>
    </footer>
  </div>
</body>
</html>`;
}

// Main benchmark execution
async function runBenchmark() {
  const cliConfig = parseArgs();
  ensureDirectories();
  const logger = createLogger(cliConfig.verbose, cliConfig.json);
  
  logger.section('AVIR Performance Benchmark');
  logger.info(`Base URL: ${cliConfig.url}`);
  logger.info(`Started: ${new Date().toISOString()}`);
  logger.info(`Pages to test: ${CONFIG.pages.length}`);
  
  const results = [];
  let browser;
  
  try {
    browser = await chromium.launch({ headless: true });
    
    for (const pageConfig of CONFIG.pages) {
      const context = await browser.newContext({
        viewport: CONFIG.viewport
      });
      const page = await context.newPage();
      
      const result = await measurePagePerformance(page, pageConfig, cliConfig.url, logger);
      results.push(result);
      
      if (result.error) {
        logger.error(`${result.page}: ${result.error}`);
      } else if (result.passed) {
        logger.success(`${result.page}: ${result.loadTimeFormatted} (${result.networkRequests} requests, ${result.pageWeightFormatted})`);
      } else {
        logger.error(`${result.page}: ${result.loadTimeFormatted} (exceeds 5s threshold)`);
      }
      
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
  
  // Calculate summary
  const total = results.length;
  const passed = results.filter(r => r.passed && !r.error).length;
  const failed = total - passed;
  const successfulResults = results.filter(r => !r.error);
  
  const totalWeight = successfulResults.reduce((sum, r) => sum + r.pageWeight, 0);
  const avgLoadTime = successfulResults.length > 0 
    ? formatDuration(successfulResults.reduce((sum, r) => sum + r.loadTime, 0) / successfulResults.length)
    : 'N/A';
  
  const lcpResults = successfulResults.filter(r => r.coreWebVitals.lcp !== null);
  const avgLCP = lcpResults.length > 0 
    ? lcpResults.reduce((sum, r) => sum + r.coreWebVitals.lcp, 0) / lcpResults.length 
    : null;
  
  const fidResults = successfulResults.filter(r => r.coreWebVitals.fid !== null);
  const avgFID = fidResults.length > 0 
    ? fidResults.reduce((sum, r) => sum + r.coreWebVitals.fid, 0) / fidResults.length 
    : null;
  
  const clsResults = successfulResults.filter(r => r.coreWebVitals.cls !== null);
  const avgCLS = clsResults.length > 0 
    ? clsResults.reduce((sum, r) => sum + r.coreWebVitals.cls, 0) / clsResults.length 
    : null;
  
  const summary = {
    total,
    passed,
    failed,
    totalWeight,
    avgLoadTime,
    avgLCP,
    avgFID,
    avgCLS
  };
  
  // Generate reports
  const htmlReport = generateHtmlReport(results, summary, cliConfig);
  fs.writeFileSync(CONFIG.reportPath, htmlReport);
  
  const jsonReport = {
    timestamp: new Date().toISOString(),
    config: {
      url: cliConfig.url,
      maxLoadTime: CONFIG.maxLoadTime,
      pages: CONFIG.pages
    },
    summary,
    results
  };
  fs.writeFileSync(CONFIG.jsonReportPath, JSON.stringify(jsonReport, null, 2));
  
  // Print summary
  if (!cliConfig.json) {
    logger.section('Benchmark Summary');
    logger.info(`Total pages: ${summary.total}`);
    logger.info(`Passed: ${summary.passed}`);
    logger.info(`Failed: ${summary.failed}`);
    logger.info(`Average load time: ${summary.avgLoadTime}`);
    logger.info(`Total page weight: ${formatBytes(summary.totalWeight)}`);
    if (summary.avgLCP) logger.info(`Average LCP: ${formatDuration(summary.avgLCP)}`);
    if (summary.avgFID) logger.info(`Average FID: ${Math.round(summary.avgFID)}ms`);
    if (summary.avgCLS !== null) logger.info(`Average CLS: ${summary.avgCLS.toFixed(4)}`);
    logger.info(`HTML Report: ${CONFIG.reportPath}`);
    logger.info(`JSON Report: ${CONFIG.jsonReportPath}`);
  } else {
    console.log(JSON.stringify(jsonReport, null, 2));
  }
  
  // Exit with appropriate code
  process.exit(summary.failed > 0 ? 1 : 0);
}

// Run the benchmark
runBenchmark().catch(err => {
  console.error(`Fatal error: ${err.message}`);
  process.exit(1);
});
