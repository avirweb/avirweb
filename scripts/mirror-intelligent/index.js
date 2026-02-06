#!/usr/bin/env node

/**
 * Intelligent Asset Interceptor - Main Orchestrator
 * 
 * Comprehensive website mirroring with:
 * - Network request interception for ALL assets
 * - CSS parsing for background-images and fonts
 * - Aggressive lazy loading triggers
 * - Multi-pass capture
 * - Detailed asset logging
 * 
 * Usage:
 *   node scripts/mirror-intelligent/index.js
 *   node scripts/mirror-intelligent/index.js --url https://www.avir.com
 *   node scripts/mirror-intelligent/index.js --dry-run
 *   node scripts/mirror-intelligent/index.js --passes 3
 *   node scripts/mirror-intelligent/index.js --headed
 */

const { CaptureEngine } = require('./capture');
const { 
  log, 
  CONFIG, 
  createDirectoryStructure, 
  saveAssetManifest, 
  saveCaptureReport,
  setLogLevel,
  LOG_LEVELS
} = require('./utils');
const fs = require('fs').promises;
const path = require('path');

// ============================================================================
// PREDEFINED PAGES
// ============================================================================

const PREDEFINED_PAGES = [
  '/',
  '/services',
  '/about-avir',
  '/contact',
  '/brands',
  '/portfolio',
  '/blog',
  '/careers',
  '/processes',
  '/exciting-new-products',
  '/city/banning',
  '/city/beaumont',
  '/city/bermuda-dunes',
  '/city/big-bear',
  '/city/cathedral-city',
  '/city/coachella',
  '/city/idyllwild',
  '/city/indian-wells',
  '/city/indio',
  '/city/joshua-tree',
  '/city/lake-arrowhead',
  '/city/la-quinta',
  '/city/moreno-valley',
  '/city/murrieta',
  '/city/palm-desert',
  '/city/palm-springs',
  '/city/rancho-mirage',
  '/city/redlands',
  '/city/riverside',
  '/city/san-bernardino',
  '/city/temecula',
  '/city/thermal',
  '/city/thousand-palms',
  '/city/yucaipa',
  '/city/yucca-valley',
  '/galleries/lifestyle',
  '/galleries/home-cinema',
  '/galleries/commercial',
  '/careers/assistant-technician',
  '/careers/integration-technician',
  '/commercial-form',
  '/residential-form',
  '/service-request'
];

// ============================================================================
// CLI PARSING
// ============================================================================

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    baseUrl: CONFIG.BASE_URL,
    outputDir: CONFIG.OUTPUT_DIR,
    dryRun: false,
    headless: true,
    passes: 2,
    limit: Infinity,
    concurrency: 3,
    debug: false,
    pages: []
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--url':
      case '-u':
        options.baseUrl = args[++i];
        break;
      case '--output':
      case '-o':
        options.outputDir = args[++i];
        break;
      case '--dry-run':
      case '-d':
        options.dryRun = true;
        break;
      case '--headed':
      case '-h':
        options.headless = false;
        break;
      case '--passes':
      case '-p':
        options.passes = parseInt(args[++i], 10);
        break;
      case '--limit':
      case '-l':
        options.limit = parseInt(args[++i], 10);
        break;
      case '--concurrency':
      case '-c':
        options.concurrency = parseInt(args[++i], 10);
        break;
      case '--debug':
        options.debug = true;
        break;
      case '--pages':
        const pagesArg = args[++i];
        options.pages = pagesArg.split(',').map(p => p.trim());
        break;
      case '--help':
        showHelp();
        process.exit(0);
        break;
    }
  }
  
  return options;
}

function showHelp() {
  console.log(`
Intelligent Asset Interceptor for AVIR Website

Usage: node scripts/mirror-intelligent/index.js [options]

Options:
  --url, -u <url>         Target URL (default: ${CONFIG.BASE_URL})
  --output, -o <dir>      Output directory (default: site/)
  --dry-run, -d           Show crawl plan without executing
  --headed, -h            Run browser in headed mode (visible)
  --passes, -p <n>        Number of capture passes (default: 2)
  --limit, -l <n>         Limit number of pages to capture
  --concurrency, -c <n>   Concurrent page captures (default: 3)
  --pages <list>          Comma-separated list of pages to capture
  --debug                 Enable debug logging
  --help                  Show this help message

Examples:
  node scripts/mirror-intelligent/index.js
  node scripts/mirror-intelligent/index.js --url https://example.com
  node scripts/mirror-intelligent/index.js --dry-run
  node scripts/mirror-intelligent/index.js --passes 3 --limit 10
  node scripts/mirror-intelligent/index.js --pages /,/services,/about-avir
`);
}

// ============================================================================
// DRY RUN
// ============================================================================

function showDryRunPlan(options) {
  console.log('\n========================================');
  console.log('  DRY RUN - Capture Plan');
  console.log('========================================\n');
  
  console.log(`Target URL: ${options.baseUrl}`);
  console.log(`Output Directory: ${options.outputDir}`);
  console.log(`Capture Passes: ${options.passes}`);
  console.log(`Concurrency: ${options.concurrency}`);
  console.log(`Headless: ${options.headless}`);
  console.log('');
  
  const pagesToCapture = options.pages.length > 0 
    ? options.pages 
    : PREDEFINED_PAGES.slice(0, options.limit);
  
  console.log(`Pages to capture (${pagesToCapture.length}):`);
  
  const categories = {
    'Main Pages': pagesToCapture.filter(p => !p.includes('/') || p === '/'),
    'City Pages': pagesToCapture.filter(p => p.startsWith('/city/')),
    'Gallery Pages': pagesToCapture.filter(p => p.startsWith('/galleries/')),
    'Career Pages': pagesToCapture.filter(p => p.startsWith('/careers/')),
    'Other Pages': pagesToCapture.filter(p => 
      !p.startsWith('/city/') && 
      !p.startsWith('/galleries/') && 
      !p.startsWith('/careers/') && 
      p !== '/' &&
      p.includes('/')
    )
  };
  
  for (const [category, pages] of Object.entries(categories)) {
    if (pages.length > 0) {
      console.log(`\n${category} (${pages.length}):`);
      pages.slice(0, 10).forEach(p => console.log(`  - ${p}`));
      if (pages.length > 10) {
        console.log(`  ... and ${pages.length - 10} more`);
      }
    }
  }
  
  console.log('\n\nAsset Mapping Rules:');
  CONFIG.ASSET_PATTERNS.forEach(({ pattern, localPath }) => {
    console.log(`  ${pattern.toString()} → ${localPath}`);
  });
  
  console.log('\n\nConfiguration:');
  console.log(`  - Hydration wait: ${CONFIG.HYDRATION_WAIT}ms`);
  console.log(`  - Scroll steps: ${CONFIG.SCROLL_STEPS}`);
  console.log(`  - Max retries: ${CONFIG.MAX_RETRIES}`);
  console.log(`  - Concurrent downloads: ${CONFIG.CONCURRENT_DOWNLOADS}`);
  console.log('');
}

// ============================================================================
// MAIN ORCHESTRATION
// ============================================================================

async function main() {
  const startTime = Date.now();
  const options = parseArgs();
  
  // Set log level
  if (options.debug) {
    setLogLevel(LOG_LEVELS.DEBUG);
  }
  
  console.log('\n========================================');
  console.log('  Intelligent Asset Interceptor');
  console.log('  AVIR Website Mirror');
  console.log('========================================\n');
  console.log(`Target: ${options.baseUrl}`);
  console.log(`Output: ${options.outputDir}`);
  console.log(`Mode: ${options.dryRun ? 'DRY RUN' : 'FULL CAPTURE'}`);
  console.log(`Passes: ${options.passes}`);
  console.log('');
  
  if (options.dryRun) {
    showDryRunPlan(options);
    return;
  }
  
  // Create directory structure
  await createDirectoryStructure();
  
  // Initialize capture engine
  const engine = new CaptureEngine({
    headless: options.headless,
    viewport: { width: 1920, height: 1080 }
  });
  
  try {
    await engine.initialize();
    
    // Determine pages to capture
    const pagesToCapture = options.pages.length > 0 
      ? options.pages 
      : PREDEFINED_PAGES.slice(0, options.limit);
    
    log('INFO', `Starting capture of ${pagesToCapture.length} pages`);
    
    // Capture pages with concurrency control
    const results = [];
    const queue = [...pagesToCapture];
    const active = new Set();
    
    async function captureNext() {
      if (queue.length === 0) return;
      
      const pagePath = queue.shift();
      const url = new URL(pagePath, options.baseUrl).toString();
      
      const promise = engine.capturePage(url).then(result => {
        results.push(result);
        active.delete(promise);
      });
      
      active.add(promise);
      
      if (active.size >= options.concurrency) {
        await Promise.race(active);
      }
      
      await captureNext();
    }
    
    // Start initial batch
    const starters = Array(Math.min(options.concurrency, queue.length))
      .fill()
      .map(() => captureNext());
    
    await Promise.all(starters);
    
    // Wait for remaining
    while (active.size > 0) {
      await Promise.race(active);
    }
    
    // Multi-pass for first page (usually home page with most assets)
    if (options.passes > 1 && pagesToCapture.length > 0) {
      const homeUrl = new URL(pagesToCapture[0], options.baseUrl).toString();
      log('INFO', `Running additional passes on home page...`);
      await engine.captureWithPasses(homeUrl, options.passes);
    }
    
    // Generate and save reports
    const report = engine.generateReport();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Save asset manifest
    const manifestPath = await saveAssetManifest(
      engine.assetInterceptor.getAllAssets(),
      options.outputDir
    );
    
    // Save capture report
    const reportPath = path.join(options.outputDir, `capture-report-${timestamp}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');
    
    // Save interceptor report
    await engine.assetInterceptor.saveReport(options.outputDir);
    
    // Print summary
    const duration = Date.now() - startTime;
    const stats = engine.getStats();
    
    console.log('\n========================================');
    console.log('  Capture Complete');
    console.log('========================================');
    console.log(`Duration: ${(duration / 1000).toFixed(2)}s`);
    console.log(`Pages Captured: ${stats.pagesCaptured}`);
    console.log(`Assets Captured: ${stats.assetsCaptured}`);
    console.log(`CSS Files Parsed: ${stats.cssFilesParsed}`);
    console.log(`Errors: ${stats.errors}`);
    console.log('');
    console.log('Reports:');
    console.log(`  Asset Manifest: ${manifestPath}`);
    console.log(`  Capture Report: ${reportPath}`);
    console.log('');
    
    // Show errors if any
    const errors = engine.getErrors();
    if (errors.length > 0) {
      console.log('Errors:');
      errors.slice(0, 10).forEach((err, i) => {
        console.log(`  ${i + 1}. ${err.url}: ${err.error}`);
      });
      if (errors.length > 10) {
        console.log(`  ... and ${errors.length - 10} more`);
      }
      console.log('');
    }
    
  } catch (error) {
    log('ERROR', `Fatal error: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await engine.close();
  }
}

// ============================================================================
// ENTRY POINT
// ============================================================================

if (require.main === module) {
  main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = { main, PREDEFINED_PAGES };
