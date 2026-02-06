#!/usr/bin/env node

/**
 * Pixel-Perfect Visual Comparison Script
 * 
 * Compares www.avir.com (original) against avirwebtest.pages.dev (deployed)
 * at multiple viewports using Playwright and pixelmatch.
 * 
 * Generates detailed markdown report and JSON data.
 * 
 * Usage:
 *   node scripts/pixel-perfect-comparison.js
 */

const { chromium } = require('playwright');
const pixelmatchModule = require('pixelmatch');
const pixelmatch = pixelmatchModule.default || pixelmatchModule;
const { PNG } = require('pngjs');
const fs = require('fs');
const path = require('path');

// Configuration Constants
const ORIGINAL_SITE = 'https://www.avir.com';
const DEPLOYED_SITE = 'https://avirwebtest.pages.dev';
const PASS_THRESHOLD = 99.5; // Percentage for pixel-perfect

// Output directories
const OUTPUT_BASE_DIR = path.join('.sisyphus', 'pixel-perfect-comparison');
const SCREENSHOTS_DIR = path.join(OUTPUT_BASE_DIR, 'screenshots');
const DIFFS_DIR = path.join(OUTPUT_BASE_DIR, 'diffs');
const REPORT_PATH = path.join('.sisyphus', 'PIXEL_PERFECT_COMPARISON.md');
const JSON_PATH = path.join(OUTPUT_BASE_DIR, 'comparison-data.json');

// Pages to test
const PAGES = [
  { name: 'home', path: '/', title: 'Home' },
  { name: 'about', path: '/about-avir', title: 'About' },
  { name: 'services', path: '/services', title: 'Services' },
  { name: 'portfolio', path: '/portfolio', title: 'Portfolio' },
  { name: 'contact', path: '/contact', title: 'Contact' }
];

// Viewport configurations
const VIEWPORTS = [
  { name: 'desktop', width: 1920, height: 1080, label: 'Desktop' },
  { name: 'tablet-portrait', width: 768, height: 1024, label: 'Tablet Portrait' },
  { name: 'mobile-landscape', width: 896, height: 414, label: 'Mobile Landscape' },
  { name: 'mobile-portrait', width: 414, height: 896, label: 'Mobile Portrait' }
];

/**
 * Ensure output directories exist
 */
function ensureDirectories() {
  [OUTPUT_BASE_DIR, SCREENSHOTS_DIR, DIFFS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
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
 * Capture screenshot of a page at specified viewport
 */
async function captureScreenshot(page, url, viewport, outputPath) {
  try {
    // Set viewport with deviceScaleFactor: 1
    await page.setViewportSize({ 
      width: viewport.width, 
      height: viewport.height 
    });
    await page.waitForTimeout(300);
    
    // Navigate to page
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
    
    // Take full-page screenshot
    await page.screenshot({
      path: outputPath,
      fullPage: true,
      type: 'png'
    });
    
    // Verify file was created
    const stats = fs.statSync(outputPath);
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
async function compareImages(originalPath, deployedPath, diffPath) {
  try {
    // Read images using pngjs (NOT canvas)
    const originalData = fs.readFileSync(originalPath);
    const deployedData = fs.readFileSync(deployedPath);
    
    const originalImg = PNG.sync.read(originalData);
    const deployedImg = PNG.sync.read(deployedData);
    
    // Handle dimension mismatches by cropping to minimum dimensions
    let originalPixelData = originalImg.data;
    let deployedPixelData = deployedImg.data;
    let width = originalImg.width;
    let height = originalImg.height;
    
    if (originalImg.width !== deployedImg.width || originalImg.height !== deployedImg.height) {
      // Calculate minimum dimensions
      const minWidth = Math.min(originalImg.width, deployedImg.width);
      const minHeight = Math.min(originalImg.height, deployedImg.height);
      
      console.log(`    ⚠️ Dimension mismatch: original ${originalImg.width}x${originalImg.height} vs deployed ${deployedImg.width}x${deployedImg.height}`);
      console.log(`    📐 Cropping both to ${minWidth}x${minHeight} for comparison`);
      
      // Create cropped buffers
      const originalCropped = Buffer.alloc(minWidth * minHeight * 4);
      const deployedCropped = Buffer.alloc(minWidth * minHeight * 4);
      
      // Copy data row by row
      for (let y = 0; y < minHeight; y++) {
        for (let x = 0; x < minWidth; x++) {
          const srcIdx = (y * originalImg.width + x) * 4;
          const dstIdx = (y * minWidth + x) * 4;
          originalCropped[dstIdx] = originalPixelData[srcIdx];
          originalCropped[dstIdx + 1] = originalPixelData[srcIdx + 1];
          originalCropped[dstIdx + 2] = originalPixelData[srcIdx + 2];
          originalCropped[dstIdx + 3] = originalPixelData[srcIdx + 3];
        }
      }
      
      for (let y = 0; y < minHeight; y++) {
        for (let x = 0; x < minWidth; x++) {
          const srcIdx = (y * deployedImg.width + x) * 4;
          const dstIdx = (y * minWidth + x) * 4;
          deployedCropped[dstIdx] = deployedPixelData[srcIdx];
          deployedCropped[dstIdx + 1] = deployedPixelData[srcIdx + 1];
          deployedCropped[dstIdx + 2] = deployedPixelData[srcIdx + 2];
          deployedCropped[dstIdx + 3] = deployedPixelData[srcIdx + 3];
        }
      }
      
      originalPixelData = originalCropped;
      deployedPixelData = deployedCropped;
      width = minWidth;
      height = minHeight;
    }
    const diff = new PNG({ width, height });
    
    // Compare images with pixelmatch
    const numDiffPixels = pixelmatch(
      originalPixelData,
      deployedPixelData,
      diff.data,
      width,
      height,
      {
        threshold: 0.1,
        includeAA: false
      }
    );
    
    const totalPixels = width * height;
    const matchPercent = ((totalPixels - numDiffPixels) / totalPixels) * 100;
    const diffPercent = (numDiffPixels / totalPixels) * 100;
    
    // Save diff image only if differences exist
    if (numDiffPixels > 0) {
      const diffBuffer = PNG.sync.write(diff);
      fs.writeFileSync(diffPath, diffBuffer);
    }
    
    return {
      success: true,
      diffPixels: numDiffPixels,
      diffPercent: diffPercent,
      matchPercent: matchPercent,
      totalPixels: totalPixels,
      passed: matchPercent >= PASS_THRESHOLD,
      diffExists: numDiffPixels > 0
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      matchPercent: 0,
      diffPixels: 0,
      totalPixels: 0,
      passed: false,
      diffExists: false
    };
  }
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(results, timestamp) {
  const totalComparisons = results.length;
  const passedComparisons = results.filter(r => r.passed).length;
  const failedComparisons = totalComparisons - passedComparisons;
  
  // Calculate overall match percentage
  const overallMatch = results.reduce((sum, r) => sum + r.matchPercent, 0) / totalComparisons;
  
  const status = overallMatch >= PASS_THRESHOLD ? '✅ SUCCESS' : '⚠️ WARNING';
  
  // Group results by page
  const resultsByPage = {};
  PAGES.forEach(page => {
    resultsByPage[page.name] = results.filter(r => r.pageName === page.name);
  });
  
  // Build detailed results table for each page
  let detailedResults = '';
  PAGES.forEach(page => {
    const pageResults = resultsByPage[page.name];
    detailedResults += `\n### ${page.title} (${page.path})\n\n`;
    detailedResults += '| Viewport | Match % | Status | Diff Pixels |\n';
    detailedResults += '|----------|---------|--------|-------------|\n';
    
    pageResults.forEach(result => {
      const statusIcon = result.passed ? '✅' : '⚠️';
      const diffPixelsFormatted = result.diffPixels.toLocaleString();
      detailedResults += `| ${result.viewportLabel} | ${result.matchPercent.toFixed(2)}% | ${statusIcon} | ${diffPixelsFormatted} |\n`;
    });
  });
  
  // Generate findings and recommendations
  let findings = '';
  const failedResults = results.filter(r => !r.passed);
  
  if (failedResults.length === 0) {
    findings = 'All comparisons passed with pixel-perfect accuracy (≥99.5% match). The deployed site matches the original site visually across all tested pages and viewports.';
  } else {
    findings = `**${failedResults.length} comparison(s) failed** to meet the pixel-perfect threshold (≥99.5%):\n\n`;
    failedResults.forEach(r => {
      findings += `- **${r.pageTitle}** at **${r.viewportLabel}**: ${r.matchPercent.toFixed(2)}% match (${r.diffPixels.toLocaleString()} different pixels)\n`;
    });
    findings += '\n**Recommendations:**\n';
    findings += '1. Review the diff images in `.sisyphus/pixel-perfect-comparison/diffs/` to identify visual differences\n';
    findings += '2. Check for dynamic content, timestamps, or randomized elements that may cause differences\n';
    findings += '3. Verify CSS and asset loading consistency between original and deployed sites\n';
    findings += '4. Consider if differences are acceptable (e.g., minor font rendering variations)\n';
  }
  
  const report = `# Pixel-Perfect Comparison Report

## Executive Summary

- **Overall Site Match:** ${overallMatch.toFixed(2)}%
- **Total Comparisons:** ${totalComparisons}
- **Passed:** ${passedComparisons} (≥${PASS_THRESHOLD}%)
- **Failed:** ${failedComparisons} (<${PASS_THRESHOLD}%)
- **Status:** ${status}

**Original Site:** ${ORIGINAL_SITE}  
**Deployed Site:** ${DEPLOYED_SITE}  
**Generated:** ${timestamp}

## Detailed Results by Page
${detailedResults}

## Findings and Recommendations

${findings}

---

## Technical Details

### Configuration
- **Pixelmatch Threshold:** 0.1
- **Include Anti-Aliasing:** false
- **Pass Threshold:** ${PASS_THRESHOLD}%
- **Viewports Tested:** ${VIEWPORTS.length}
- **Pages Tested:** ${PAGES.length}

### File Locations
- **Screenshots:** \`.sisyphus/pixel-perfect-comparison/screenshots/\`
- **Diff Images:** \`.sisyphus/pixel-perfect-comparison/diffs/\`
- **JSON Data:** \`.sisyphus/pixel-perfect-comparison/comparison-data.json\`

### Screenshots Captured
${results.map(r => `- \`${r.originalScreenshot}\` and \`${r.deployedScreenshot}\``).join('\n')}

${results.filter(r => r.diffExists).length > 0 ? `\n### Diff Images Generated\n${results.filter(r => r.diffExists).map(r => `- \`${r.diffImage}\``).join('\n')}` : ''}
`;
  
  return report;
}

/**
 * Save JSON data
 */
function saveJSONData(results, timestamp) {
  const totalComparisons = results.length;
  const passedComparisons = results.filter(r => r.passed).length;
  const failedComparisons = totalComparisons - passedComparisons;
  const overallMatch = results.reduce((sum, r) => sum + r.matchPercent, 0) / totalComparisons;
  
  const data = {
    timestamp,
    config: {
      originalSite: ORIGINAL_SITE,
      deployedSite: DEPLOYED_SITE,
      passThreshold: PASS_THRESHOLD,
      pixelmatchThreshold: 0.1,
      includeAA: false
    },
    summary: {
      totalComparisons,
      passed: passedComparisons,
      failed: failedComparisons,
      overallMatchPercent: parseFloat(overallMatch.toFixed(2))
    },
    pages: PAGES.map(page => ({
      name: page.name,
      title: page.title,
      path: page.path,
      results: results
        .filter(r => r.pageName === page.name)
        .map(r => ({
          viewport: r.viewportName,
          viewportLabel: r.viewportLabel,
          matchPercent: parseFloat((r.matchPercent || 0).toFixed(2)),
          diffPixels: r.diffPixels || 0,
          totalPixels: r.totalPixels || 0,
          diffPercent: parseFloat((r.diffPercent || 0).toFixed(2)),
          passed: r.passed || false,
          diffExists: r.diffExists || false,
          originalScreenshot: r.originalScreenshot,
          deployedScreenshot: r.deployedScreenshot,
          diffImage: r.diffExists ? r.diffImage : null,
          error: r.error || null
        }))
    }))
  };
  
  fs.writeFileSync(JSON_PATH, JSON.stringify(data, null, 2));
}

/**
 * Main comparison function
 */
async function runPixelPerfectComparison() {
  console.log('='.repeat(70));
  console.log('Pixel-Perfect Visual Comparison');
  console.log('='.repeat(70));
  console.log(`Original:  ${ORIGINAL_SITE}`);
  console.log(`Deployed:  ${DEPLOYED_SITE}`);
  console.log(`Pages:     ${PAGES.length}`);
  console.log(`Viewports: ${VIEWPORTS.length}`);
  console.log(`Total:     ${PAGES.length * VIEWPORTS.length} comparisons`);
  console.log('='.repeat(70));
  console.log();
  
  // Ensure directories exist
  ensureDirectories();
  
  // Launch browser
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    console.log('✓ Browser launched');
  } catch (error) {
    console.error(`✗ Failed to launch browser: ${error.message}`);
    process.exit(1);
  }
  
  const results = [];
  const timestamp = new Date().toISOString();
  
  // Process each page
  for (const pageConfig of PAGES) {
    console.log(`\n📄 Processing: ${pageConfig.title} (${pageConfig.path})`);
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      const originalUrl = `${ORIGINAL_SITE}${pageConfig.path}`;
      const deployedUrl = `${DEPLOYED_SITE}${pageConfig.path}`;
      
      // Process each viewport
      for (const viewport of VIEWPORTS) {
        const testName = `${pageConfig.name}-${viewport.name}`;
        const originalPath = path.join(SCREENSHOTS_DIR, `${testName}-original.png`);
        const deployedPath = path.join(SCREENSHOTS_DIR, `${testName}-deployed.png`);
        const diffPath = path.join(DIFFS_DIR, `${testName}-diff.png`);
        
        process.stdout.write(`  📸 ${viewport.label} (${viewport.width}x${viewport.height})... `);
        
        // Capture original screenshot
        const originalResult = await captureScreenshot(page, originalUrl, viewport, originalPath);
        if (!originalResult.success) {
          console.log(`✗ Original screenshot failed: ${originalResult.error}`);
          results.push({
            pageName: pageConfig.name,
            pageTitle: pageConfig.title,
            pagePath: pageConfig.path,
            viewportName: viewport.name,
            viewportLabel: viewport.label,
            matchPercent: 0,
            diffPixels: 0,
            totalPixels: 0,
            diffPercent: 100,
            passed: false,
            diffExists: false,
            originalScreenshot: originalPath,
            deployedScreenshot: deployedPath,
            diffImage: diffPath,
            error: `Original screenshot failed: ${originalResult.error}`
          });
          continue;
        }
        
        // Small delay between captures to avoid rate limiting
        await page.waitForTimeout(500);
        
        // Capture deployed screenshot
        const deployedResult = await captureScreenshot(page, deployedUrl, viewport, deployedPath);
        if (!deployedResult.success) {
          console.log(`✗ Deployed screenshot failed: ${deployedResult.error}`);
          results.push({
            pageName: pageConfig.name,
            pageTitle: pageConfig.title,
            pagePath: pageConfig.path,
            viewportName: viewport.name,
            viewportLabel: viewport.label,
            matchPercent: 0,
            diffPixels: 0,
            totalPixels: 0,
            diffPercent: 100,
            passed: false,
            diffExists: false,
            originalScreenshot: originalPath,
            deployedScreenshot: deployedPath,
            diffImage: diffPath,
            error: `Deployed screenshot failed: ${deployedResult.error}`
          });
          continue;
        }
        
        // Compare images
        const comparison = await compareImages(originalPath, deployedPath, diffPath);
        
        const result = {
          pageName: pageConfig.name,
          pageTitle: pageConfig.title,
          pagePath: pageConfig.path,
          viewportName: viewport.name,
          viewportLabel: viewport.label,
          matchPercent: comparison.matchPercent,
          diffPixels: comparison.diffPixels,
          totalPixels: comparison.totalPixels,
          diffPercent: comparison.diffPercent,
          passed: comparison.passed,
          diffExists: comparison.diffExists,
          originalScreenshot: originalPath,
          deployedScreenshot: deployedPath,
          diffImage: diffPath,
          error: comparison.error || null
        };
        
        results.push(result);
        
        const status = result.passed ? '✓ PASS' : '✗ FAIL';
        console.log(`${status} (${result.matchPercent.toFixed(2)}% match, ${result.diffPixels.toLocaleString()} diff pixels)`);
        
        // Delay between viewports
        await page.waitForTimeout(300);
      }
      
    } catch (error) {
      console.error(`\n  ✗ Failed to process page ${pageConfig.name}: ${error.message}`);
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
    // Generate markdown report
    const markdownReport = generateMarkdownReport(results, timestamp);
    fs.writeFileSync(REPORT_PATH, markdownReport);
    console.log(`  ✓ Markdown report: ${REPORT_PATH}`);
    
    // Save JSON data
    saveJSONData(results, timestamp);
    console.log(`  ✓ JSON data: ${JSON_PATH}`);
  } catch (error) {
    console.error(`  ✗ Failed to generate reports: ${error.message}`);
  }
  
  // Print summary
  const totalTests = results.length;
  const passedTests = results.filter(r => r.passed).length;
  const failedTests = totalTests - passedTests;
  const overallMatch = results.reduce((sum, r) => sum + r.matchPercent, 0) / totalTests;
  
  console.log('\n' + '='.repeat(70));
  console.log('SUMMARY');
  console.log('='.repeat(70));
  console.log(`Total Comparisons: ${totalTests}`);
  console.log(`Passed:            ${passedTests} ✓`);
  console.log(`Failed:            ${failedTests} ✗`);
  console.log(`Overall Match:     ${overallMatch.toFixed(2)}%`);
  console.log('='.repeat(70));
  
  // List failed tests
  if (failedTests > 0) {
    console.log('\nFailed Comparisons:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  ✗ ${r.pageTitle} - ${r.viewportLabel}: ${r.matchPercent.toFixed(2)}%${r.error ? ` (${r.error})` : ''}`);
    });
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('Pixel-perfect comparison complete!');
  console.log(`Report: ${REPORT_PATH}`);
  console.log('='.repeat(70));
  
  // Exit with appropriate code
  process.exit(failedTests > 0 ? 1 : 0);
}

// Run the comparison
if (require.main === module) {
  runPixelPerfectComparison().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { runPixelPerfectComparison, compareImages, captureScreenshot };
