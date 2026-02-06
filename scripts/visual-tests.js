#!/usr/bin/env node
/**
 * Multi-Browser Visual Regression Testing Script
 * Compares live site (www.avir.com) with mirrored site across multiple browsers and viewports
 * 
 * Usage:
 *   node scripts/visual-tests.js
 *   node scripts/visual-tests.js --browsers=chromium,firefox
 *   node scripts/visual-tests.js --pages=/,/services --viewports=desktop
 *   node scripts/visual-tests.js --threshold=0.1
 */

const { chromium, firefox, webkit } = require('playwright');
const fs = require('fs');
const path = require('path');
const pixelmatch = require('pixelmatch').default;
const { PNG } = require('pngjs');

// Configuration
const CONFIG = {
  liveUrl: 'https://www.avir.com',
  mirroredUrl: 'http://localhost:8000',
  mirroredFilePath: path.join(__dirname, '../site'),
  pages: [
    { path: '/', name: 'homepage', description: 'Homepage' },
    { path: '/services', name: 'services', description: 'Services page' },
    { path: '/about-avir', name: 'about-avir', description: 'About AVIR page' },
    { path: '/contact', name: 'contact', description: 'Contact page' },
    { path: '/brands', name: 'brands', description: 'Brands page' }
  ],
  viewports: {
    desktop: { width: 1920, height: 1080 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 375, height: 667 }
  },
  browsers: ['chromium', 'firefox', 'webkit'],
  threshold: 0.1,
  matchThreshold: 95.0, // Minimum match percentage to pass
  outputDir: path.join(__dirname, '../visual-tests'),
  screenshotDir: path.join(__dirname, '../visual-tests/screenshots'),
  diffDir: path.join(__dirname, '../visual-tests/diffs'),
  reportDir: path.join(__dirname, '../visual-tests/reports')
};

// Browser launchers
const browserLaunchers = {
  chromium: () => chromium.launch({ headless: true }),
  firefox: () => firefox.launch({ headless: true }),
  webkit: () => webkit.launch({ headless: true })
};

/**
 * Parse CLI arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    browsers: CONFIG.browsers,
    pages: CONFIG.pages.map(p => p.path),
    viewports: Object.keys(CONFIG.viewports),
    threshold: CONFIG.threshold,
    matchThreshold: CONFIG.matchThreshold,
    verbose: false,
    useFileProtocol: false
  };

  for (const arg of args) {
    if (arg.startsWith('--browsers=')) {
      options.browsers = arg.split('=')[1].split(',').map(b => b.trim());
    } else if (arg.startsWith('--pages=')) {
      options.pages = arg.split('=')[1].split(',').map(p => p.trim());
    } else if (arg.startsWith('--viewports=')) {
      options.viewports = arg.split('=')[1].split(',').map(v => v.trim());
    } else if (arg.startsWith('--threshold=')) {
      options.threshold = parseFloat(arg.split('=')[1]);
    } else if (arg.startsWith('--match-threshold=')) {
      options.matchThreshold = parseFloat(arg.split('=')[1]);
    } else if (arg === '--use-file-protocol') {
      options.useFileProtocol = true;
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  return options;
}

/**
 * Print help message
 */
function printHelp() {
  console.log(`
Multi-Browser Visual Regression Testing

Usage: node scripts/visual-tests.js [options]

Options:
  --browsers=LIST        Comma-separated list: chromium,firefox,webkit (default: all)
  --pages=LIST          Comma-separated list of page paths (default: all)
  --viewports=LIST      Comma-separated list: desktop,tablet,mobile (default: all)
  --threshold=NUM       Pixelmatch threshold 0-1 (default: 0.1)
  --match-threshold=NUM Minimum match percentage to pass (default: 95)
  --use-file-protocol   Use file:// protocol for mirrored site
  --verbose, -v         Enable verbose output
  --help, -h            Show this help message

Examples:
  node scripts/visual-tests.js
  node scripts/visual-tests.js --browsers=chromium,firefox
  node scripts/visual-tests.js --pages=/,/services --viewports=desktop
  node scripts/visual-tests.js --threshold=0.05 --verbose
`);
}

/**
 * Ensure directories exist
 */
function setupDirectories() {
  [CONFIG.outputDir, CONFIG.screenshotDir, CONFIG.diffDir, CONFIG.reportDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

/**
 * Get safe filename for screenshots
 */
function getScreenshotFilename(pageName, browserName, viewportName, type) {
  return `${pageName}_${browserName}_${viewportName}_${type}.png`;
}

/**
 * Capture screenshot from URL
 */
async function captureScreenshot(browserType, url, filePath, viewport, options = {}) {
  const browser = await browserLaunchers[browserType]();
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  
  try {
    console.log(`  📸 Capturing ${browserType} ${viewport.width}x${viewport.height}: ${url}`);
    
    // Navigate with timeout and wait for network idle
    await page.goto(url, { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    // Wait for fonts and images to load
    await page.waitForTimeout(3000);
    
    // Wait for any animations to complete
    await page.evaluate(() => {
      return new Promise(resolve => {
        setTimeout(resolve, 500);
      });
    });
    
    // Take screenshot of full page
    await page.screenshot({ 
      path: filePath,
      fullPage: false,
      type: 'png'
    });
    
    console.log(`     ✓ Screenshot saved: ${path.basename(filePath)}`);
    return { success: true, path: filePath };
    
  } catch (error) {
    console.error(`     ✗ Failed: ${error.message}`);
    return { success: false, error: error.message };
  } finally {
    await context.close();
    await browser.close();
  }
}

/**
 * Load PNG image and return data
 */
function loadPngImage(filePath) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) {
      reject(new Error(`File not found: ${filePath}`));
      return;
    }
    
    const data = fs.readFileSync(filePath);
    const png = PNG.sync.read(data);
    resolve(png);
  });
}

/**
 * Compare two screenshots using pixelmatch
 */
async function compareScreenshots(livePath, mirroredPath, diffPath, threshold) {
  try {
    const img1 = await loadPngImage(livePath);
    const img2 = await loadPngImage(mirroredPath);
    
    // Ensure images are the same size
    const width = Math.min(img1.width, img2.width);
    const height = Math.min(img1.height, img2.height);
    
    if (img1.width !== img2.width || img1.height !== img2.height) {
      console.log(`     ⚠️ Image size mismatch: ${img1.width}x${img1.height} vs ${img2.width}x${img2.height}`);
    }
    
    // Create diff image
    const diff = new PNG({ width, height });
    
    // Run pixelmatch
    const numDiffPixels = pixelmatch(
      img1.data,
      img2.data,
      diff.data,
      width,
      height,
      { 
        threshold: threshold,
        includeAA: false,
        alpha: 0.1,
        aaColor: [255, 0, 0],
        diffColor: [255, 0, 0],
        diffColorAlt: [0, 255, 0]
      }
    );
    
    // Save diff image
    const diffBuffer = PNG.sync.write(diff);
    fs.writeFileSync(diffPath, diffBuffer);
    
    // Calculate match percentage
    const totalPixels = width * height;
    const diffPercentage = (numDiffPixels / totalPixels) * 100;
    const matchPercentage = 100 - diffPercentage;
    
    return {
      success: true,
      numDiffPixels,
      totalPixels,
      diffPercentage,
      matchPercentage,
      diffPath
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate HTML report
 */
function generateHtmlReport(results, options) {
  const timestamp = new Date().toISOString();
  const totalTests = results.length;
  const passedTests = results.filter(r => r.passed).length;
  const failedTests = totalTests - passedTests;
  const overallMatch = results.length > 0
    ? results.reduce((sum, r) => sum + (r.matchPercentage || 0), 0) / results.length
    : 0;
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Visual Regression Test Report - AVIR</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      color: #333;
      line-height: 1.6;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      text-align: center;
    }
    .header h1 { font-size: 2rem; margin-bottom: 0.5rem; }
    .header p { opacity: 0.9; }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    .summary-card {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      text-align: center;
    }
    .summary-card h3 { font-size: 0.875rem; color: #666; margin-bottom: 0.5rem; }
    .summary-card .value { font-size: 2rem; font-weight: bold; }
    .summary-card.passed .value { color: #22c55e; }
    .summary-card.failed .value { color: #ef4444; }
    .summary-card.match .value { color: #3b82f6; }
    .summary-card.tests .value { color: #6b7280; }
    .results {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem 2rem;
    }
    .result-item {
      background: white;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .result-header {
      padding: 1rem 1.5rem;
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .result-header.passed { border-left: 4px solid #22c55e; }
    .result-header.failed { border-left: 4px solid #ef4444; }
    .result-title { font-weight: 600; }
    .result-meta { color: #6b7280; font-size: 0.875rem; }
    .result-status {
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    .result-status.passed { background: #dcfce7; color: #166534; }
    .result-status.failed { background: #fee2e2; color: #991b1b; }
    .result-status.error { background: #fef3c7; color: #92400e; }
    .result-details {
      padding: 1.5rem;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }
    .screenshot-comparison {
      text-align: center;
    }
    .screenshot-comparison h4 {
      font-size: 0.75rem;
      color: #6b7280;
      margin-bottom: 0.5rem;
      text-transform: uppercase;
    }
    .screenshot-comparison img {
      width: 100%;
      max-height: 200px;
      object-fit: contain;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      background: #f9fafb;
    }
    .error-message {
      padding: 2rem;
      text-align: center;
      color: #ef4444;
      background: #fef2f2;
      border-radius: 4px;
      margin: 1rem;
    }
    .match-bar {
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
      margin-top: 0.5rem;
    }
    .match-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #22c55e 0%, #3b82f6 100%);
      transition: width 0.3s ease;
    }
    .match-bar-fill.low {
      background: linear-gradient(90deg, #ef4444 0%, #f97316 100%);
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      padding: 0 1.5rem 1.5rem;
    }
    .stat-item {
      text-align: center;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 4px;
    }
    .stat-value {
      font-size: 1.5rem;
      font-weight: bold;
      color: #111;
    }
    .stat-label {
      font-size: 0.75rem;
      color: #6b7280;
      margin-top: 0.25rem;
    }
    .config-info {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
      margin-bottom: 2rem;
    }
    .config-card {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .config-card h3 { margin-bottom: 1rem; }
    .config-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }
    .config-item { font-size: 0.875rem; }
    .config-item strong { color: #111; }
    .config-item span { color: #6b7280; }
    @media (max-width: 768px) {
      .result-details { grid-template-columns: 1fr; }
      .stats-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <header class="header">
    <h1>Visual Regression Test Report</h1>
    <p>AVIR Website - Live vs Mirrored Site Comparison</p>
    <p style="margin-top: 0.5rem; font-size: 0.875rem;">${new Date().toLocaleString()}</p>
  </header>

  <div class="summary">
    <div class="summary-card tests">
      <h3>Total Tests</h3>
      <div class="value">${totalTests}</div>
    </div>
    <div class="summary-card passed">
      <h3>Passed</h3>
      <div class="value">${passedTests}</div>
    </div>
    <div class="summary-card failed">
      <h3>Failed</h3>
      <div class="value">${failedTests}</div>
    </div>
    <div class="summary-card match">
      <h3>Average Match</h3>
      <div class="value">${overallMatch.toFixed(2)}%</div>
    </div>
  </div>

  <div class="config-info">
    <div class="config-card">
      <h3>Test Configuration</h3>
      <div class="config-grid">
        <div class="config-item"><strong>Browsers:</strong> <span>${options.browsers.join(', ')}</span></div>
        <div class="config-item"><strong>Pages:</strong> <span>${options.pages.join(', ')}</span></div>
        <div class="config-item"><strong>Viewports:</strong> <span>${options.viewports.join(', ')}</span></div>
        <div class="config-item"><strong>Threshold:</strong> <span>${options.threshold}</span></div>
        <div class="config-item"><strong>Match Threshold:</strong> <span>${options.matchThreshold}%</span></div>
        <div class="config-item"><strong>Live URL:</strong> <span>${CONFIG.liveUrl}</span></div>
        <div class="config-item"><strong>Mirrored URL:</strong> <span>${CONFIG.mirroredUrl}</span></div>
      </div>
    </div>
  </div>

  <div class="results">
    ${results.map(result => {
      const hasError = result.error || !result.numDiffPixels;
      return `
      <div class="result-item">
        <div class="result-header ${result.passed ? 'passed' : 'failed'}">
          <div>
            <div class="result-title">${result.pageName}</div>
            <div class="result-meta">${result.browser} • ${result.viewport} • ${result.viewportSize}</div>
          </div>
          <span class="result-status ${hasError ? 'error' : (result.passed ? 'passed' : 'failed')}">
            ${hasError ? 'Error' : (result.passed ? 'Passed' : 'Failed')}
          </span>
        </div>
        ${hasError ? `
        <div class="error-message">
          <strong>⚠️ ${result.error || 'Screenshot comparison failed'}</strong>
        </div>
        ` : `
        <div class="result-details">
          <div class="screenshot-comparison">
            <h4>Live Site</h4>
            <img src="../screenshots/${result.files.live}" alt="Live site screenshot" loading="lazy">
          </div>
          <div class="screenshot-comparison">
            <h4>Mirrored Site</h4>
            <img src="../screenshots/${result.files.mirrored}" alt="Mirrored site screenshot" loading="lazy">
          </div>
          <div class="screenshot-comparison">
            <h4>Difference</h4>
            <img src="../diffs/${result.files.diff}" alt="Diff visualization" loading="lazy">
          </div>
        </div>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">${(result.matchPercentage || 0).toFixed(2)}%</div>
            <div class="stat-label">Match</div>
            <div class="match-bar">
              <div class="match-bar-fill ${(result.matchPercentage || 0) < options.matchThreshold ? 'low' : ''}" style="width: ${result.matchPercentage || 0}%"></div>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${(result.numDiffPixels || 0).toLocaleString()}</div>
            <div class="stat-label">Different Pixels</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${(result.totalPixels || 0).toLocaleString()}</div>
            <div class="stat-label">Total Pixels</div>
          </div>
        </div>
        `}
      </div>
    `}).join('')}
  </div>

  <script>
    // Auto-refresh every 30 seconds if tests are still running
    // (can be disabled by adding ?norefresh to URL)
    if (!window.location.search.includes('norefresh')) {
      setTimeout(() => location.reload(), 30000);
    }
  </script>
</body>
</html>`;

  const reportPath = path.join(CONFIG.reportDir, `visual-report-${Date.now()}.html`);
  fs.writeFileSync(reportPath, html);
  
  // Also save as latest.html for easy access
  const latestPath = path.join(CONFIG.reportDir, 'latest.html');
  fs.writeFileSync(latestPath, html);
  
  return { reportPath, latestPath };
}

/**
 * Generate JSON report
 */
function generateJsonReport(results, options) {
  const report = {
    timestamp: new Date().toISOString(),
    config: {
      liveUrl: CONFIG.liveUrl,
      mirroredUrl: CONFIG.mirroredUrl,
      browsers: options.browsers,
      pages: options.pages,
      viewports: options.viewports,
      threshold: options.threshold,
      matchThreshold: options.matchThreshold
    },
    summary: {
      total: results.length,
      passed: results.filter(r => r.passed).length,
      failed: results.filter(r => !r.passed).length,
      averageMatch: results.length > 0
        ? results.reduce((sum, r) => sum + (r.matchPercentage || 0), 0) / results.length
        : 0
    },
    results
  };
  
  const reportPath = path.join(CONFIG.reportDir, `visual-report-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Also save as latest.json
  const latestPath = path.join(CONFIG.reportDir, 'latest.json');
  fs.writeFileSync(latestPath, JSON.stringify(report, null, 2));
  
  return { reportPath, latestPath };
}

/**
 * Main test runner
 */
async function runVisualTests() {
  console.log('\n🔍 Multi-Browser Visual Regression Testing');
  console.log('==========================================\n');
  
  const options = parseArgs();
  setupDirectories();
  
  // Validate browsers
  const validBrowsers = options.browsers.filter(b => browserLaunchers[b]);
  if (validBrowsers.length === 0) {
    console.error('❌ No valid browsers specified. Available: chromium, firefox, webkit');
    process.exit(1);
  }
  
  // Validate viewports
  const validViewports = options.viewports.filter(v => CONFIG.viewports[v]);
  if (validViewports.length === 0) {
    console.error('❌ No valid viewports specified. Available: desktop, tablet, mobile');
    process.exit(1);
  }
  
  // Filter pages based on CLI options
  const pagesToTest = CONFIG.pages.filter(p => options.pages.includes(p.path));
  if (pagesToTest.length === 0) {
    console.error('❌ No valid pages specified');
    process.exit(1);
  }
  
  console.log('Configuration:');
  console.log(`  Browsers:    ${validBrowsers.join(', ')}`);
  console.log(`  Pages:       ${pagesToTest.map(p => p.name).join(', ')}`);
  console.log(`  Viewports:   ${validViewports.join(', ')}`);
  console.log(`  Threshold:   ${options.threshold}`);
  console.log(`  Min Match:   ${options.matchThreshold}%`);
  console.log(`  Live URL:    ${CONFIG.liveUrl}`);
  console.log(`  Mirrored:    ${CONFIG.mirroredUrl}\n`);
  
  const results = [];
  let testCount = 0;
  const totalTests = pagesToTest.length * validBrowsers.length * validViewports.length;
  
  // Run tests
  for (const pageInfo of pagesToTest) {
    console.log(`\n📄 Testing page: ${pageInfo.description} (${pageInfo.path})`);
    
    for (const browserName of validBrowsers) {
      console.log(`\n  🌐 Browser: ${browserName}`);
      
      for (const viewportName of validViewports) {
        testCount++;
        const viewport = CONFIG.viewports[viewportName];
        
        console.log(`\n    📱 Viewport: ${viewportName} (${viewport.width}x${viewport.height})`);
        console.log(`       [Test ${testCount}/${totalTests}]`);
        
        const liveUrl = `${CONFIG.liveUrl}${pageInfo.path}`;
        const mirroredUrl = options.useFileProtocol 
          ? `file://${CONFIG.mirroredFilePath}${pageInfo.path === '/' ? '/index.html' : pageInfo.path + '/index.html'}`
          : `${CONFIG.mirroredUrl}${pageInfo.path}`;
        
        const liveFile = getScreenshotFilename(pageInfo.name, browserName, viewportName, 'live');
        const mirroredFile = getScreenshotFilename(pageInfo.name, browserName, viewportName, 'mirrored');
        const diffFile = getScreenshotFilename(pageInfo.name, browserName, viewportName, 'diff');
        
        const livePath = path.join(CONFIG.screenshotDir, liveFile);
        const mirroredPath = path.join(CONFIG.screenshotDir, mirroredFile);
        const diffPath = path.join(CONFIG.diffDir, diffFile);
        
        // Capture screenshots
        const liveResult = await captureScreenshot(browserName, liveUrl, livePath, viewport);
        const mirroredResult = await captureScreenshot(browserName, mirroredUrl, mirroredPath, viewport);
        
        if (!liveResult.success || !mirroredResult.success) {
          console.log(`     ⚠️ Skipping comparison - screenshot capture failed`);
          results.push({
            page: pageInfo.path,
            pageName: pageInfo.name,
            description: pageInfo.description,
            browser: browserName,
            viewport: viewportName,
            viewportSize: `${viewport.width}x${viewport.height}`,
            passed: false,
            matchPercentage: 0,
            error: liveResult.error || mirroredResult.error,
            files: { live: liveFile, mirrored: mirroredFile, diff: diffFile }
          });
          continue;
        }
        
        // Compare screenshots
        console.log(`     🔍 Comparing screenshots...`);
        const comparison = await compareScreenshots(livePath, mirroredPath, diffPath, options.threshold);
        
        if (!comparison.success) {
          console.log(`     ⚠️ Comparison failed: ${comparison.error}`);
          results.push({
            page: pageInfo.path,
            pageName: pageInfo.name,
            description: pageInfo.description,
            browser: browserName,
            viewport: viewportName,
            viewportSize: `${viewport.width}x${viewport.height}`,
            passed: false,
            matchPercentage: 0,
            error: comparison.error,
            files: { live: liveFile, mirrored: mirroredFile, diff: diffFile }
          });
          continue;
        }
        
        const passed = comparison.matchPercentage >= options.matchThreshold;
        
        console.log(`     📊 Match: ${comparison.matchPercentage.toFixed(2)}% ${passed ? '✅' : '❌'}`);
        console.log(`        Diff pixels: ${comparison.numDiffPixels.toLocaleString()} / ${comparison.totalPixels.toLocaleString()}`);
        
        results.push({
          page: pageInfo.path,
          pageName: pageInfo.name,
          description: pageInfo.description,
          browser: browserName,
          viewport: viewportName,
          viewportSize: `${viewport.width}x${viewport.height}`,
          passed,
          matchPercentage: comparison.matchPercentage,
          numDiffPixels: comparison.numDiffPixels,
          totalPixels: comparison.totalPixels,
          diffPercentage: comparison.diffPercentage,
          files: { live: liveFile, mirrored: mirroredFile, diff: diffFile }
        });
      }
    }
  }
  
  // Generate reports
  console.log('\n\n📊 Generating Reports...');
  
  const htmlReport = generateHtmlReport(results, options);
  console.log(`  ✓ HTML Report: ${htmlReport.latestPath}`);
  
  const jsonReport = generateJsonReport(results, options);
  console.log(`  ✓ JSON Report: ${jsonReport.latestPath}`);
  
  // Print summary
  const summary = {
    total: results.length,
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => !r.passed).length,
    averageMatch: results.length > 0
      ? results.reduce((sum, r) => sum + (r.matchPercentage || 0), 0) / results.length
      : 0
  };
  
  console.log('\n\n========================================');
  console.log('  Visual Regression Test Results');
  console.log('========================================');
  console.log(`Total Tests:     ${summary.total}`);
  console.log(`Passed:          ${summary.passed} ✅`);
  console.log(`Failed:          ${summary.failed} ❌`);
  console.log(`Average Match:   ${summary.averageMatch.toFixed(2)}%`);
  console.log('========================================\n');
  
  // Print failed tests
  const failedTests = results.filter(r => !r.passed);
  if (failedTests.length > 0) {
    console.log('Failed Tests:');
    failedTests.forEach(r => {
      if (r.error) {
        console.log(`  ❌ ${r.description} (${r.browser}, ${r.viewport}): ${r.error}`);
      } else {
        console.log(`  ❌ ${r.description} (${r.browser}, ${r.viewport}): ${r.matchPercentage.toFixed(2)}%`);
      }
    });
    console.log('');
  }
  
  // Print report locations
  console.log('Reports Generated:');
  console.log(`  📄 HTML: ${htmlReport.latestPath}`);
  console.log(`  📄 JSON: ${jsonReport.latestPath}`);
  console.log(`  📄 Screenshots: ${CONFIG.screenshotDir}`);
  console.log(`  📄 Diffs: ${CONFIG.diffDir}`);
  
  // Return results for programmatic use
  return {
    success: summary.failed === 0,
    summary,
    results,
    reports: {
      html: htmlReport,
      json: jsonReport
    }
  };
}

// Run if called directly
if (require.main === module) {
  runVisualTests()
    .then(results => {
      const exitCode = results.success ? 0 : 1;
      console.log(`\n✅ Visual regression testing completed. Exit code: ${exitCode}\n`);
      process.exit(exitCode);
    })
    .catch(error => {
      console.error('\n❌ Visual regression testing failed:', error);
      process.exit(1);
    });
}

module.exports = { runVisualTests, CONFIG };
