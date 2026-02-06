#!/usr/bin/env node

/**
 * Asset Integrity Validator
 * 
 * Validates all assets in the replica site load correctly and match their SHA256 hashes
 * from the asset manifest. Generates JSON and HTML reports.
 */

const fs = require('fs').promises;
const crypto = require('crypto');
const https = require('https');
const http = require('http');
const path = require('path');
const { URL } = require('url');

// Configuration
const DEFAULT_MANIFEST_PATH = 'site/asset-manifest.json';
const DEFAULT_OUTPUT_DIR = 'test-results/asset-integrity';
const DEFAULT_SITE_DIR = 'site';

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    url: null,
    outputDir: DEFAULT_OUTPUT_DIR,
    manifestPath: DEFAULT_MANIFEST_PATH,
    siteDir: DEFAULT_SITE_DIR,
    verbose: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--url':
      case '-u':
        config.url = args[++i];
        break;
      case '--output':
      case '-o':
        config.outputDir = args[++i];
        break;
      case '--manifest':
      case '-m':
        config.manifestPath = args[++i];
        break;
      case '--site-dir':
      case '-s':
        config.siteDir = args[++i];
        break;
      case '--verbose':
      case '-v':
        config.verbose = true;
        break;
      case '--help':
      case '-h':
        showHelp();
        process.exit(0);
        break;
    }
  }

  return config;
}

/**
 * Show help message
 */
function showHelp() {
  console.log(`
Asset Integrity Validator

Usage: node scripts/validate-assets.js [options]

Options:
  -u, --url <url>          Validate remote URL (default: local file system)
  -o, --output <dir>       Output directory for reports (default: ${DEFAULT_OUTPUT_DIR})
  -m, --manifest <path>    Path to asset manifest (default: ${DEFAULT_MANIFEST_PATH})
  -s, --site-dir <dir>     Site directory for local validation (default: ${DEFAULT_SITE_DIR})
  -v, --verbose            Enable verbose output
  -h, --help               Show this help message

Examples:
  # Validate local site
  node scripts/validate-assets.js

  # Validate deployed site
  node scripts/validate-assets.js --url https://avirwebtest.pages.dev

  # Custom output directory
  node scripts/validate-assets.js --output ./custom-results
`);
}

/**
 * Read and parse the asset manifest
 */
async function readManifest(manifestPath) {
  try {
    const data = await fs.readFile(manifestPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading manifest: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Calculate SHA256 hash of data
 */
function calculateHash(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Fetch remote asset via HTTP/HTTPS
 */
function fetchRemoteAsset(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      timeout: 30000,
      headers: {
        'User-Agent': 'AVIR-Asset-Validator/1.0'
      }
    };

    const request = client.request(options, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        // Follow redirects
        fetchRemoteAsset(response.headers.location).then(resolve).catch(reject);
        return;
      }

      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve({
          statusCode: response.statusCode,
          data: buffer,
          headers: response.headers
        });
      });
    });

    request.on('error', reject);
    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });

    request.end();
  });
}

/**
 * Validate a single local asset
 */
async function validateLocalAsset(asset, siteDir) {
  const filePath = path.join(siteDir, asset.localPath);
  
  try {
    // Check file exists
    await fs.access(filePath);
    
    // Read file and calculate hash
    const data = await fs.readFile(filePath);
    const actualHash = calculateHash(data);
    const expectedHash = asset.sha256;
    
    if (!expectedHash) {
      return {
        localPath: asset.localPath,
        originalUrl: asset.originalUrl,
        status: 'failed',
        error: 'No SHA256 hash in manifest',
        httpStatus: 200,
        hashMatch: false,
        expectedHash: null,
        actualHash: actualHash,
        size: data.length,
        category: asset.category
      };
    }
    
    const hashMatch = actualHash === expectedHash;
    
    return {
      localPath: asset.localPath,
      originalUrl: asset.originalUrl,
      status: hashMatch ? 'passed' : 'failed',
      error: hashMatch ? null : 'Hash mismatch',
      httpStatus: 200,
      hashMatch: hashMatch,
      expectedHash: expectedHash,
      actualHash: actualHash,
      size: data.length,
      category: asset.category
    };
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {
        localPath: asset.localPath,
        originalUrl: asset.originalUrl,
        status: 'failed',
        error: 'File not found',
        httpStatus: 404,
        hashMatch: false,
        expectedHash: asset.sha256,
        actualHash: null,
        size: 0,
        category: asset.category
      };
    }
    
    return {
      localPath: asset.localPath,
      originalUrl: asset.originalUrl,
      status: 'failed',
      error: error.message,
      httpStatus: null,
      hashMatch: false,
      expectedHash: asset.sha256,
      actualHash: null,
      size: 0,
      category: asset.category
    };
  }
}

/**
 * Validate a single remote asset
 */
async function validateRemoteAsset(asset, baseUrl) {
  const assetUrl = new URL(asset.localPath, baseUrl).toString();
  
  try {
    const response = await fetchRemoteAsset(assetUrl);
    
    if (response.statusCode !== 200) {
      return {
        localPath: asset.localPath,
        originalUrl: asset.originalUrl,
        status: 'failed',
        error: `HTTP ${response.statusCode}`,
        httpStatus: response.statusCode,
        hashMatch: false,
        expectedHash: asset.sha256,
        actualHash: null,
        size: 0,
        category: asset.category
      };
    }
    
    const actualHash = calculateHash(response.data);
    const expectedHash = asset.sha256;
    
    if (!expectedHash) {
      return {
        localPath: asset.localPath,
        originalUrl: asset.originalUrl,
        status: 'failed',
        error: 'No SHA256 hash in manifest',
        httpStatus: 200,
        hashMatch: false,
        expectedHash: null,
        actualHash: actualHash,
        size: response.data.length,
        category: asset.category
      };
    }
    
    const hashMatch = actualHash === expectedHash;
    
    return {
      localPath: asset.localPath,
      originalUrl: asset.originalUrl,
      status: hashMatch ? 'passed' : 'failed',
      error: hashMatch ? null : 'Hash mismatch',
      httpStatus: 200,
      hashMatch: hashMatch,
      expectedHash: expectedHash,
      actualHash: actualHash,
      size: response.data.length,
      category: asset.category
    };
  } catch (error) {
    return {
      localPath: asset.localPath,
      originalUrl: asset.originalUrl,
      status: 'failed',
      error: error.message,
      httpStatus: null,
      hashMatch: false,
      expectedHash: asset.sha256,
      actualHash: null,
      size: 0,
      category: asset.category
    };
  }
}

/**
 * Validate all assets
 */
async function validateAllAssets(manifest, config) {
  const assets = manifest.assets || [];
  const results = [];
  const summary = {
    total: assets.length,
    passed: 0,
    failed: 0,
    byCategory: {}
  };
  
  console.log(`\nValidating ${assets.length} assets...\n`);
  
  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    const progress = `[${i + 1}/${assets.length}]`;
    
    if (config.verbose) {
      process.stdout.write(`${progress} Checking ${asset.localPath}... `);
    } else if (i % 10 === 0 || i === assets.length - 1) {
      process.stdout.write(`\r${progress} Validating...`);
    }
    
    let result;
    if (config.url) {
      result = await validateRemoteAsset(asset, config.url);
    } else {
      result = await validateLocalAsset(asset, config.siteDir);
    }
    
    results.push(result);
    
    // Update summary
    if (!summary.byCategory[asset.category]) {
      summary.byCategory[asset.category] = { total: 0, passed: 0, failed: 0 };
    }
    summary.byCategory[asset.category].total++;
    
    if (result.status === 'passed') {
      summary.passed++;
      summary.byCategory[asset.category].passed++;
    } else {
      summary.failed++;
      summary.byCategory[asset.category].failed++;
    }
    
    if (config.verbose) {
      console.log(result.status === 'passed' ? '✓' : '✗');
      if (result.error) {
        console.log(`  Error: ${result.error}`);
      }
    }
  }
  
  if (!config.verbose) {
    console.log('\n');
  }
  
  return { results, summary };
}

/**
 * Generate JSON report
 */
async function generateJsonReport(report, outputDir) {
  const reportPath = path.join(outputDir, 'integrity.json');
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(`JSON report saved to: ${reportPath}`);
}

/**
 * Generate HTML report
 */
async function generateHtmlReport(report, outputDir) {
  const { results, summary, timestamp, replicaUrl } = report;
  
  const passedCount = results.filter(r => r.status === 'passed').length;
  const failedCount = results.filter(r => r.status === 'failed').length;
  
  const categorySummary = Object.entries(summary.byCategory)
    .map(([cat, stats]) => {
      const passRate = ((stats.passed / stats.total) * 100).toFixed(1);
      return `
        <tr>
          <td>${cat}</td>
          <td>${stats.total}</td>
          <td>${stats.passed}</td>
          <td>${stats.failed}</td>
          <td>${passRate}%</td>
        </tr>
      `;
    })
    .join('');
  
  const assetRows = results
    .map(result => {
      const statusClass = result.status === 'passed' ? 'passed' : 'failed';
      const statusIcon = result.status === 'passed' ? '✓' : '✗';
      const errorInfo = result.error ? `<div class="error">${result.error}</div>` : '';
      const hashInfo = result.hashMatch !== null 
        ? `<div class="hash ${result.hashMatch ? 'match' : 'mismatch'}">Hash: ${statusIcon} ${result.hashMatch ? 'Match' : 'Mismatch'}</div>`
        : '';
      
      return `
        <div class="asset-row ${statusClass}">
          <div class="asset-info">
            <div class="asset-path">${result.localPath}</div>
            <div class="asset-url">${result.originalUrl}</div>
            ${errorInfo}
            ${hashInfo}
          </div>
          <div class="asset-status ${statusClass}">${statusIcon} ${result.status.toUpperCase()}</div>
        </div>
      `;
    })
    .join('');
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Asset Integrity Report</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
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
      overflow: hidden;
    }
    
    header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
    }
    
    h1 {
      font-size: 28px;
      margin-bottom: 10px;
    }
    
    .meta {
      opacity: 0.9;
      font-size: 14px;
    }
    
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      padding: 30px;
      background: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
    }
    
    .summary-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .summary-card h3 {
      font-size: 14px;
      color: #666;
      margin-bottom: 10px;
      text-transform: uppercase;
    }
    
    .summary-card .number {
      font-size: 36px;
      font-weight: bold;
      color: #333;
    }
    
    .summary-card.passed .number {
      color: #28a745;
    }
    
    .summary-card.failed .number {
      color: #dc3545;
    }
    
    .category-table {
      padding: 30px;
      border-bottom: 1px solid #e9ecef;
    }
    
    .category-table h2 {
      margin-bottom: 20px;
      color: #333;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
    }
    
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e9ecef;
    }
    
    th {
      background: #f8f9fa;
      font-weight: 600;
      color: #555;
    }
    
    .assets-section {
      padding: 30px;
    }
    
    .assets-section h2 {
      margin-bottom: 20px;
      color: #333;
    }
    
    .asset-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 15px;
      border-bottom: 1px solid #e9ecef;
      transition: background 0.2s;
    }
    
    .asset-row:hover {
      background: #f8f9fa;
    }
    
    .asset-row.passed {
      border-left: 4px solid #28a745;
    }
    
    .asset-row.failed {
      border-left: 4px solid #dc3545;
      background: #fff5f5;
    }
    
    .asset-info {
      flex: 1;
    }
    
    .asset-path {
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
    }
    
    .asset-url {
      font-size: 12px;
      color: #666;
      margin-bottom: 8px;
    }
    
    .error {
      color: #dc3545;
      font-size: 13px;
      margin-top: 4px;
    }
    
    .hash {
      font-size: 12px;
      margin-top: 4px;
    }
    
    .hash.match {
      color: #28a745;
    }
    
    .hash.mismatch {
      color: #dc3545;
    }
    
    .asset-status {
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .asset-status.passed {
      background: #d4edda;
      color: #155724;
    }
    
    .asset-status.failed {
      background: #f8d7da;
      color: #721c24;
    }
    
    footer {
      padding: 20px 30px;
      background: #f8f9fa;
      border-top: 1px solid #e9ecef;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Asset Integrity Report</h1>
      <div class="meta">
        <div>Replica URL: ${replicaUrl}</div>
        <div>Generated: ${new Date(timestamp).toLocaleString()}</div>
      </div>
    </header>
    
    <div class="summary">
      <div class="summary-card">
        <h3>Total Assets</h3>
        <div class="number">${summary.total}</div>
      </div>
      <div class="summary-card passed">
        <h3>Passed</h3>
        <div class="number">${summary.passed}</div>
      </div>
      <div class="summary-card failed">
        <h3>Failed</h3>
        <div class="number">${summary.failed}</div>
      </div>
      <div class="summary-card">
        <h3>Pass Rate</h3>
        <div class="number">${((summary.passed / summary.total) * 100).toFixed(1)}%</div>
      </div>
    </div>
    
    <div class="category-table">
      <h2>Results by Category</h2>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Total</th>
            <th>Passed</th>
            <th>Failed</th>
            <th>Pass Rate</th>
          </tr>
        </thead>
        <tbody>
          ${categorySummary}
        </tbody>
      </table>
    </div>
    
    <div class="assets-section">
      <h2>Asset Details</h2>
      ${assetRows}
    </div>
    
    <footer>
      Generated by AVIR Asset Integrity Validator
    </footer>
  </div>
</body>
</html>`;
  
  const reportPath = path.join(outputDir, 'report.html');
  await fs.writeFile(reportPath, html);
  console.log(`HTML report saved to: ${reportPath}`);
}

/**
 * Main function
 */
async function main() {
  const config = parseArgs();
  
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║     AVIR Asset Integrity Validator                     ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log(`\nManifest: ${config.manifestPath}`);
  console.log(`Output: ${config.outputDir}`);
  if (config.url) {
    console.log(`Remote URL: ${config.url}`);
  } else {
    console.log(`Local site: ${config.siteDir}`);
  }
  
  // Read manifest
  const manifest = await readManifest(config.manifestPath);
  console.log(`\nFound ${manifest.statistics?.totalAssets || manifest.assets?.length || 0} assets in manifest`);
  
  // Create output directory
  await fs.mkdir(config.outputDir, { recursive: true });
  
  // Validate all assets
  const { results, summary } = await validateAllAssets(manifest, config);
  
  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    replicaUrl: config.url || `file://${path.resolve(config.siteDir)}/`,
    totalAssets: summary.total,
    passed: summary.passed,
    failed: summary.failed,
    results: results,
    summary: summary
  };
  
  // Generate reports
  await generateJsonReport(report, config.outputDir);
  await generateHtmlReport(report, config.outputDir);
  
  // Print summary
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║                    SUMMARY                             ║');
  console.log('╠════════════════════════════════════════════════════════╣');
  console.log(`║ Total Assets:  ${summary.total.toString().padEnd(39)} ║`);
  console.log(`║ Passed:        ${summary.passed.toString().padEnd(39)} ║`);
  console.log(`║ Failed:        ${summary.failed.toString().padEnd(39)} ║`);
  console.log(`║ Pass Rate:     ${((summary.passed / summary.total) * 100).toFixed(1).padEnd(39)} ║`);
  console.log('╚════════════════════════════════════════════════════════╝');
  
  // Show failed assets
  if (summary.failed > 0) {
    console.log('\nFailed Assets:');
    results
      .filter(r => r.status === 'failed')
      .slice(0, 10)
      .forEach(r => {
        console.log(`  ✗ ${r.localPath}: ${r.error}`);
      });
    
    if (summary.failed > 10) {
      console.log(`  ... and ${summary.failed - 10} more`);
    }
  }
  
  // Exit with appropriate code
  const exitCode = summary.failed > 0 ? 1 : 0;
  console.log(`\nExit code: ${exitCode}`);
  process.exit(exitCode);
}

// Run main
main().catch(error => {
  console.error(`Fatal error: ${error.message}`);
  process.exit(1);
});
