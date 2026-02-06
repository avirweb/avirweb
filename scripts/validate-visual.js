#!/usr/bin/env node

/**
 * AVIR Visual Regression Testing Script
 * 
 * Compares replica screenshots against baseline screenshots using pixelmatch.
 * Generates diff images and HTML report for visual regression testing.
 * 
 * Usage:
 *   node scripts/validate-visual.js
 *   node scripts/validate-visual.js --url https://avirwebtest.pages.dev
 *   node scripts/validate-visual.js --threshold 0.1
 *   node scripts/validate-visual.js --output ./custom-results
 */

const { chromium } = require('playwright');
const pixelmatch = require('pixelmatch');
const { PNG } = require('pngjs');
const fs = require('fs').promises;
const path = require('path');

// Default configuration
const DEFAULT_CONFIG = {
  baselineDir: path.join('.sisyphus', 'baselines'),
  outputDir: path.join('test-results', 'visual-regression'),
  defaultUrl: 'file:///home/agent/avir/site/index.html',
  defaultThreshold: 0.5, // 0.5% difference threshold
  maxDiffThreshold: 0.1 // pixelmatch threshold (0-1, lower = more sensitive)
};

// Pages to test
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
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    url: DEFAULT_CONFIG.defaultUrl,
    threshold: DEFAULT_CONFIG.defaultThreshold,
    outputDir: DEFAULT_CONFIG.outputDir,
    baselineDir: DEFAULT_CONFIG.baselineDir
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--url':
        config.url = args[++i];
        break;
      case '--threshold':
        config.threshold = parseFloat(args[++i]);
        if (isNaN(config.threshold) || config.threshold < 0) {
          console.error('Error: Invalid threshold value');
          process.exit(1);
        }
        break;
      case '--output':
        config.outputDir = args[++i];
        break;
      case '--baseline-dir':
        config.baselineDir = args[++i];
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
        break;
      default:
        console.error(`Unknown argument: ${arg}`);
        printHelp();
        process.exit(1);
    }
  }

  return config;
}

/**
 * Print help message
 */
function printHelp() {
  console.log(`
AVIR Visual Regression Testing Script

Usage: node scripts/validate-visual.js [options]

Options:
  --url <url>           Replica URL to test (default: ${DEFAULT_CONFIG.defaultUrl})
  --threshold <n>       Diff threshold percentage (default: ${DEFAULT_CONFIG.defaultThreshold}%)
  --output <dir>        Output directory for results (default: ${DEFAULT_CONFIG.outputDir})
  --baseline-dir <dir>  Baseline directory (default: ${DEFAULT_CONFIG.baselineDir})
  --help, -h            Show this help message

Examples:
  node scripts/validate-visual.js
  node scripts/validate-visual.js --url https://avirwebtest.pages.dev
  node scripts/validate-visual.js --threshold 0.1
  node scripts/validate-visual.js --output ./custom-results
`);
}

/**
 * Trigger lazy-loading by scrolling through the page
 */
async function triggerLazyLoading(page) {
  console.log('  Triggering lazy loading...');
  
  const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
  const viewportHeight = await page.evaluate(() => window.innerHeight);
  
  for (let y = 0; y < scrollHeight; y += viewportHeight) {
    await page.evaluate(y => window.scrollTo(0, y), y);
    await page.waitForTimeout(300);
  }
  
  // Scroll back to top
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(200);
  
  console.log('  Lazy loading complete');
}

/**
 * Capture screenshot of replica page
 */
async function captureReplicaScreenshot(page, _url, viewport, outputPath) {
  try {
    // Set viewport
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.waitForTimeout(300);
    
    // Take screenshot
    await page.screenshot({
      path: outputPath,
      fullPage: true,
      type: 'png'
    });
    
    // Verify file was created
    const stats = await fs.stat(outputPath);
    if (stats.size < 1000) {
      throw new Error(`Screenshot file too small (${stats.size} bytes)`);
    }
    
    return { success: true, size: stats.size };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Compare two images using pixelmatch
 */
async function compareImages(baselinePath, replicaPath, diffPath, threshold) {
  try {
    // Read images
    const baselineData = await fs.readFile(baselinePath);
    const replicaData = await fs.readFile(replicaPath);
    
    const baselineImg = PNG.sync.read(baselineData);
    const replicaImg = PNG.sync.read(replicaData);
    
    // Check dimensions
    if (baselineImg.width !== replicaImg.width || baselineImg.height !== replicaImg.height) {
      return {
        success: false,
        error: `Dimension mismatch: baseline ${baselineImg.width}x${baselineImg.height} vs replica ${replicaImg.width}x${replicaImg.height}`,
        diffPercent: 100
      };
    }
    
    const { width, height } = baselineImg;
    const diff = new PNG({ width, height });
    
    // Compare images
    const numDiffPixels = pixelmatch(
      baselineImg.data,
      replicaImg.data,
      diff.data,
      width,
      height,
      {
        threshold: DEFAULT_CONFIG.maxDiffThreshold,
        includeAA: false
      }
    );
    
    const totalPixels = width * height;
    const diffPercent = (numDiffPixels / totalPixels) * 100;
    
    // Save diff image if there are differences
    if (numDiffPixels > 0) {
      const diffBuffer = PNG.sync.write(diff);
      await fs.writeFile(diffPath, diffBuffer);
    }
    
    return {
      success: true,
      diffPixels: numDiffPixels,
      diffPercent: diffPercent,
      totalPixels: totalPixels,
      passed: diffPercent <= threshold
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      diffPercent: 100,
      passed: false
    };
  }
}

/**
 * Generate HTML report
 */
async function generateHTMLReport(results, config) {
  const totalTests = results.length;
  const passedTests = results.filter(r => r.passed).length;
  const failedTests = totalTests - passedTests;
  const passRate = ((passedTests / totalTests) * 100).toFixed(1);
  
  const maxDiff = Math.max(...results.map(r => r.diffPercent));
  const avgDiff = (results.reduce((sum, r) => sum + r.diffPercent, 0) / totalTests).toFixed(2);
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Visual Regression Report - AVIR</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: #f5f5f5;
      padding: 20px;
      line-height: 1.6;
    }
    
    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
    
    h1 {
      color: #333;
      margin-bottom: 10px;
    }
    
    .timestamp {
      color: #666;
      font-size: 14px;
      margin-bottom: 20px;
    }
    
    .summary {
      background: white;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
      margin-top: 15px;
    }
    
    .stat-box {
      text-align: center;
      padding: 15px;
      border-radius: 6px;
      background: #f8f9fa;
    }
    
    .stat-box.pass {
      background: #d4edda;
      color: #155724;
    }
    
    .stat-box.fail {
      background: #f8d7da;
      color: #721c24;
    }
    
    .stat-value {
      font-size: 32px;
      font-weight: bold;
      display: block;
    }
    
    .stat-label {
      font-size: 14px;
      margin-top: 5px;
    }
    
    .comparison {
      background: white;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .comparison-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      padding-bottom: 15px;
      border-bottom: 1px solid #eee;
    }
    
    .comparison-title {
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }
    
    .comparison-status {
      padding: 6px 12px;
      border-radius: 4px;
      font-weight: 600;
      font-size: 14px;
    }
    
    .comparison-status.pass {
      background: #d4edda;
      color: #155724;
    }
    
    .comparison-status.fail {
      background: #f8d7da;
      color: #721c24;
    }
    
    .comparison-images {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 15px;
    }
    
    .image-box {
      text-align: center;
    }
    
    .image-box h3 {
      font-size: 14px;
      color: #666;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .image-box img {
      max-width: 100%;
      height: auto;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    .diff-info {
      margin-top: 15px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 4px;
    }
    
    .diff-percent {
      font-size: 24px;
      font-weight: bold;
    }
    
    .diff-percent.pass {
      color: #28a745;
    }
    
    .diff-percent.fail {
      color: #dc3545;
    }
    
    .diff-details {
      color: #666;
      font-size: 14px;
      margin-top: 5px;
    }
    
    .config-info {
      background: #e9ecef;
      padding: 15px;
      border-radius: 6px;
      margin-bottom: 20px;
      font-size: 14px;
    }
    
    .config-info strong {
      color: #333;
    }
    
    .error-message {
      background: #f8d7da;
      color: #721c24;
      padding: 15px;
      border-radius: 4px;
      margin-top: 10px;
    }
    
    .filter-buttons {
      margin-bottom: 20px;
    }
    
    .filter-buttons button {
      padding: 8px 16px;
      margin-right: 10px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      background: #e9ecef;
      color: #333;
    }
    
    .filter-buttons button.active {
      background: #007bff;
      color: white;
    }
    
    .filter-buttons button:hover {
      opacity: 0.9;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Visual Regression Report</h1>
    <p class="timestamp">Generated: ${new Date().toISOString()}</p>
    
    <div class="config-info">
      <strong>Configuration:</strong><br>
      URL: ${config.url}<br>
      Threshold: ${config.threshold}%<br>
      Baseline Directory: ${config.baselineDir}<br>
      Output Directory: ${config.outputDir}
    </div>
    
    <div class="summary">
      <h2>Summary</h2>
      <div class="summary-grid">
        <div class="stat-box">
          <span class="stat-value">${totalTests}</span>
          <span class="stat-label">Total Tests</span>
        </div>
        <div class="stat-box pass">
          <span class="stat-value">${passedTests}</span>
          <span class="stat-label">Passed</span>
        </div>
        <div class="stat-box fail">
          <span class="stat-value">${failedTests}</span>
          <span class="stat-label">Failed</span>
        </div>
        <div class="stat-box">
          <span class="stat-value">${passRate}%</span>
          <span class="stat-label">Pass Rate</span>
        </div>
        <div class="stat-box">
          <span class="stat-value">${maxDiff.toFixed(2)}%</span>
          <span class="stat-label">Max Diff</span>
        </div>
        <div class="stat-box">
          <span class="stat-value">${avgDiff}%</span>
          <span class="stat-label">Avg Diff</span>
        </div>
      </div>
    </div>
    
    <div class="filter-buttons">
      <button class="active" onclick="showAll()">All (${totalTests})</button>
      <button onclick="showFailed()">Failed (${failedTests})</button>
      <button onclick="showPassed()">Passed (${passedTests})</button>
    </div>
    
    <div id="comparisons">
      ${results.map(result => generateComparisonHTML(result)).join('')}
    </div>
  </div>
  
  <script>
    function showAll() {
      document.querySelectorAll('.comparison').forEach(el => el.style.display = 'block');
      updateActiveButton(0);
    }
    
    function showFailed() {
      document.querySelectorAll('.comparison').forEach(el => {
        el.style.display = el.dataset.passed === 'false' ? 'block' : 'none';
      });
      updateActiveButton(1);
    }
    
    function showPassed() {
      document.querySelectorAll('.comparison').forEach(el => {
        el.style.display = el.dataset.passed === 'true' ? 'block' : 'none';
      });
      updateActiveButton(2);
    }
    
    function updateActiveButton(index) {
      document.querySelectorAll('.filter-buttons button').forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
      });
    }
  </script>
</body>
</html>`;

  const reportPath = path.join(config.outputDir, 'report.html');
  await fs.writeFile(reportPath, html);
  
  return reportPath;
}

/**
 * Generate HTML for a single comparison
 */
function generateComparisonHTML(result) {
  const statusClass = result.passed ? 'pass' : 'fail';
  const statusText = result.passed ? 'PASS' : 'FAIL';
  
  let imagesHTML = '';
  
  if (result.baselineExists) {
    imagesHTML += `
      <div class="image-box">
        <h3>Baseline</h3>
        <img src="${path.basename(result.baselinePath)}" alt="Baseline" loading="lazy">
      </div>`;
  }
  
  if (result.replicaExists) {
    imagesHTML += `
      <div class="image-box">
        <h3>Replica</h3>
        <img src="${path.basename(result.replicaPath)}" alt="Replica" loading="lazy">
      </div>`;
  }
  
  if (result.diffExists) {
    imagesHTML += `
      <div class="image-box">
        <h3>Diff</h3>
        <img src="${path.basename(result.diffPath)}" alt="Diff" loading="lazy">
      </div>`;
  }
  
  let diffInfoHTML = '';
  if (result.error) {
    diffInfoHTML = `<div class="error-message">Error: ${escapeHtml(result.error)}</div>`;
  } else {
    diffInfoHTML = `
      <div class="diff-info">
        <div class="diff-percent ${statusClass}">${result.diffPercent.toFixed(2)}% different</div>
        <div class="diff-details">
          ${result.diffPixels !== undefined ? `${result.diffPixels.toLocaleString()} pixels different out of ${result.totalPixels?.toLocaleString()} total` : ''}
        </div>
      </div>`;
  }
  
  return `
    <div class="comparison" data-passed="${result.passed}">
      <div class="comparison-header">
        <div class="comparison-title">${result.page} - ${result.viewport}</div>
        <div class="comparison-status ${statusClass}">${statusText}</div>
      </div>
      <div class="comparison-images">
        ${imagesHTML}
      </div>
      ${diffInfoHTML}
    </div>`;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generate summary JSON
 */
async function generateSummaryJSON(results, config) {
  const totalTests = results.length;
  const passedTests = results.filter(r => r.passed).length;
  const failedTests = totalTests - passedTests;
  
  const summary = {
    timestamp: new Date().toISOString(),
    config: {
      url: config.url,
      threshold: config.threshold,
      baselineDir: config.baselineDir,
      outputDir: config.outputDir
    },
    summary: {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      passRate: ((passedTests / totalTests) * 100).toFixed(1)
    },
    results: results.map(r => ({
      page: r.page,
      viewport: r.viewport,
      passed: r.passed,
      diffPercent: r.diffPercent,
      diffPixels: r.diffPixels,
      error: r.error || null
    }))
  };
  
  const summaryPath = path.join(config.outputDir, 'summary.json');
  await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));
  
  return summaryPath;
}

/**
 * Main validation function
 */
async function runValidation() {
  const config = parseArgs();
  
  console.log('='.repeat(70));
  console.log('AVIR Visual Regression Testing');
  console.log('='.repeat(70));
  console.log(`URL: ${config.url}`);
  console.log(`Threshold: ${config.threshold}%`);
  console.log(`Baseline Directory: ${config.baselineDir}`);
  console.log(`Output Directory: ${config.outputDir}`);
  console.log('='.repeat(70));
  console.log();

  // Ensure output directory exists
  try {
    await fs.mkdir(config.outputDir, { recursive: true });
    console.log(`Created output directory: ${config.outputDir}`);
  } catch (error) {
    console.error(`Failed to create output directory: ${error.message}`);
    process.exit(1);
  }

  // Check if baseline directory exists
  try {
    await fs.access(config.baselineDir);
  } catch (error) {
    console.error(`Baseline directory not found: ${config.baselineDir}`);
    process.exit(1);
  }

  // Launch browser
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    console.log('Browser launched successfully');
  } catch (error) {
    console.error(`Failed to launch browser: ${error.message}`);
    process.exit(1);
  }

  const results = [];

  // Process each page
  for (const pageConfig of pages) {
    console.log();
    console.log(`\n📄 Processing page: ${pageConfig.name}`);
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      const isFileUrl = config.url.startsWith('file://');
      let pageUrl;
      
      if (isFileUrl) {
        const baseUrl = config.url.replace(/\/index\.html$/, '').replace(/\/$/, '');
        pageUrl = `${baseUrl}${pageConfig.path === '/' ? '/index.html' : pageConfig.path + '.html'}`;
      } else {
        const baseUrl = config.url.replace(/\/$/, '');
        pageUrl = `${baseUrl}${pageConfig.path}`;
      }
      
      console.log(`   URL: ${pageUrl}`);
      
      // Navigate to page
      await page.goto(pageUrl, { 
        waitUntil: 'networkidle',
        timeout: 60000 
      });
      
      // Wait for initial render
      await page.waitForTimeout(1000);
      
      // Trigger lazy loading
      await triggerLazyLoading(page);
      
      // Wait for any remaining network activity
      await page.waitForLoadState('networkidle');
      
      // Test each viewport
      for (const viewport of viewports) {
        const testName = `${pageConfig.name}-${viewport.name}`;
        const baselinePath = path.join(config.baselineDir, `${testName}.png`);
        const replicaPath = path.join(config.outputDir, `${testName}-replica.png`);
        const diffPath = path.join(config.outputDir, `${testName}-diff.png`);
        
        process.stdout.write(`  📸 ${viewport.name} (${viewport.width}x${viewport.height})... `);
        
        const result = {
          page: pageConfig.name,
          viewport: viewport.name,
          baselinePath: baselinePath,
          replicaPath: replicaPath,
          diffPath: diffPath,
          baselineExists: false,
          replicaExists: false,
          diffExists: false,
          passed: false,
          diffPercent: 100,
          error: null
        };
        
        try {
          // Check if baseline exists
          try {
            await fs.access(baselinePath);
            result.baselineExists = true;
          } catch {
            result.error = `Baseline not found: ${baselinePath}`;
            console.log(`✗ ${result.error}`);
            results.push(result);
            continue;
          }
          
          // Capture replica screenshot
          const captureResult = await captureReplicaScreenshot(page, pageUrl, viewport, replicaPath);
          
          if (!captureResult.success) {
            result.error = `Screenshot failed: ${captureResult.error}`;
            console.log(`✗ ${result.error}`);
            results.push(result);
            continue;
          }
          
          result.replicaExists = true;
          
          // Compare images
          const compareResult = await compareImages(baselinePath, replicaPath, diffPath, config.threshold);
          
          if (!compareResult.success) {
            result.error = compareResult.error;
            result.diffPercent = compareResult.diffPercent;
            console.log(`✗ Comparison failed: ${compareResult.error}`);
            results.push(result);
            continue;
          }
          
          result.diffPixels = compareResult.diffPixels;
          result.diffPercent = compareResult.diffPercent;
          result.totalPixels = compareResult.totalPixels;
          result.passed = compareResult.passed;
          result.diffExists = compareResult.diffPixels > 0;
          
          const status = result.passed ? '✓ PASS' : '✗ FAIL';
          console.log(`${status} (${result.diffPercent.toFixed(2)}% diff)`);
          
        } catch (error) {
          result.error = error.message;
          console.log(`✗ Error: ${error.message}`);
        }
        
        results.push(result);
        
        // Small delay between viewports
        await page.waitForTimeout(300);
      }
      
    } catch (error) {
      console.error(`\n  ✗ Failed to process page ${pageConfig.name}: ${error.message}`);
      
      // Mark all viewports for this page as failed
      for (const viewport of viewports) {
        const testName = `${pageConfig.name}-${viewport.name}`;
        results.push({
          page: pageConfig.name,
          viewport: viewport.name,
          baselinePath: path.join(config.baselineDir, `${testName}.png`),
          replicaPath: path.join(config.outputDir, `${testName}-replica.png`),
          diffPath: path.join(config.outputDir, `${testName}-diff.png`),
          baselineExists: false,
          replicaExists: false,
          diffExists: false,
          passed: false,
          diffPercent: 100,
          error: error.message
        });
      }
    } finally {
      await page.close();
      await context.close();
    }
    
    // Delay between pages
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Close browser
  await browser.close();
  console.log('\n' + '='.repeat(70));

  // Generate reports
  console.log('\n📊 Generating reports...');
  
  try {
    const htmlPath = await generateHTMLReport(results, config);
    console.log(`  ✓ HTML report: ${htmlPath}`);
    
    const jsonPath = await generateSummaryJSON(results, config);
    console.log(`  ✓ Summary JSON: ${jsonPath}`);
  } catch (error) {
    console.error(`  ✗ Failed to generate reports: ${error.message}`);
  }

  // Print summary
  const totalTests = results.length;
  const passedTests = results.filter(r => r.passed).length;
  const failedTests = totalTests - passedTests;
  
  console.log('\n' + '='.repeat(70));
  console.log('SUMMARY');
  console.log('='.repeat(70));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests} ✓`);
  console.log(`Failed: ${failedTests} ✗`);
  console.log(`Pass Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  console.log('='.repeat(70));

  // List failed tests
  if (failedTests > 0) {
    console.log('\nFailed Tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  ✗ ${r.page} - ${r.viewport}: ${r.diffPercent.toFixed(2)}%${r.error ? ` (${r.error})` : ''}`);
    });
  }

  console.log('\n' + '='.repeat(70));
  console.log('Visual regression testing complete!');
  console.log(`Report: ${path.join(config.outputDir, 'report.html')}`);
  console.log('='.repeat(70));

  // Exit with appropriate code
  process.exit(failedTests > 0 ? 1 : 0);
}

// Run the validation
if (require.main === module) {
  runValidation().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { runValidation, compareImages };
