#!/usr/bin/env node

/**
 * Critical Element Validation Script
 * Validates key elements (logo, hero, service icons) on both original and deployed sites
 */

const { chromium } = require('playwright');
const pixelmatchModule = require('pixelmatch');
const pixelmatch = pixelmatchModule.default || pixelmatchModule;
const { PNG } = require('pngjs');
const fs = require('fs');
const path = require('path');

// Configuration
const ORIGINAL_URL = 'https://www.avir.com';
const DEPLOYED_URL = 'https://avirwebtest.pages.dev';
const OUTPUT_DIR = '.sisyphus/critical-elements';

// Critical Elements to Validate
const CRITICAL_ELEMENTS = [
  { 
    name: 'logo',
    selector: '.brand-logo, .logo, .navbar-logo, img[alt*="logo" i], img[src*="logo" i], .nav-logo img',
    pages: ['home', 'about', 'services', 'portfolio', 'contact']
  },
  { 
    name: 'hero',
    selector: '.hero-section, .hero-wrap, .home-hero, [class*="hero"], .banner-section',
    pages: ['home', 'about', 'services']
  },
  { 
    name: 'service-icons',
    selector: '.service-icon, .icon-wrapper, .completed-icon, .service-card img',
    pages: ['home', 'services']
  },
  { 
    name: 'navigation',
    selector: '.nav-menu, .navbar, .navigation, .menu-button, .nav-links',
    pages: ['home', 'about', 'services', 'portfolio', 'contact']
  }
];

// Page URLs mapping
const PAGE_URLS = {
  home: '/',
  about: '/about-avir',
  services: '/services',
  portfolio: '/portfolio',
  contact: '/contact'
};

// Ensure output directories exist
function ensureDirectories() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  Object.keys(PAGE_URLS).forEach(page => {
    const pageDir = path.join(OUTPUT_DIR, page);
    if (!fs.existsSync(pageDir)) {
      fs.mkdirSync(pageDir, { recursive: true });
    }
  });
}

// Wait for page to be fully loaded
async function waitForPageLoad(page) {
  try {
    await page.waitForLoadState('domcontentloaded', { timeout: 15000 });
  } catch (e) {
    console.log('  DOM content loaded timeout, continuing...');
  }
  
  // Short wait for initial render
  await page.waitForTimeout(500);
}

// Check if element is visible
async function isElementVisible(page, selector) {
  try {
    const element = await page.locator(selector).first();
    const isVisible = await element.isVisible().catch(() => false);
    
    if (!isVisible) return { visible: false, width: 0, height: 0, opacity: 0 };
    
    const box = await element.boundingBox();
    const opacity = await element.evaluate(el => {
      const style = window.getComputedStyle(el);
      return parseFloat(style.opacity);
    }).catch(() => 0);
    
    return {
      visible: box && box.width > 0 && box.height > 0 && opacity > 0,
      width: box ? Math.round(box.width) : 0,
      height: box ? Math.round(box.height) : 0,
      opacity: Math.round(opacity * 100) / 100
    };
  } catch (e) {
    return { visible: false, width: 0, height: 0, opacity: 0 };
  }
}

// Capture element screenshot
async function captureElementScreenshot(page, selector, outputPath) {
  try {
    const element = await page.locator(selector).first();
    await element.screenshot({ path: outputPath });
    return true;
  } catch (e) {
    // If element not found or can't screenshot, capture a placeholder
    const placeholder = new PNG({ width: 100, height: 100 });
    // Fill with red to indicate missing element
    for (let y = 0; y < 100; y++) {
      for (let x = 0; x < 100; x++) {
        const idx = (100 * y + x) << 2;
        placeholder.data[idx] = 255;     // R
        placeholder.data[idx + 1] = 0;   // G
        placeholder.data[idx + 2] = 0;   // B
        placeholder.data[idx + 3] = 255; // A
      }
    }
    fs.writeFileSync(outputPath, PNG.sync.write(placeholder));
    return false;
  }
}

// Compare two images using pixelmatch
function compareImages(originalPath, deployedPath) {
  try {
    if (!fs.existsSync(originalPath) || !fs.existsSync(deployedPath)) {
      return { matchPercent: 0, diffPixels: 999999, totalPixels: 0 };
    }
    
    const original = PNG.sync.read(fs.readFileSync(originalPath));
    const deployed = PNG.sync.read(fs.readFileSync(deployedPath));
    
    // If sizes don't match significantly, return 0 match
    if (original.width !== deployed.width || original.height !== deployed.height) {
      console.log(`    Size mismatch: ${original.width}x${original.height} vs ${deployed.width}x${deployed.height}`);
      return { 
        matchPercent: 0, 
        diffPixels: 999999, 
        totalPixels: 0,
        sizeMismatch: true,
        originalSize: { width: original.width, height: original.height },
        deployedSize: { width: deployed.width, height: deployed.height }
      };
    }
    
    const { width, height } = original;
    const diff = new PNG({ width, height });
    
    const diffPixels = pixelmatch(
      original.data, 
      deployed.data, 
      diff.data, 
      width, 
      height,
      { threshold: 0.1 }
    );
    
    const totalPixels = width * height;
    const matchPercent = totalPixels > 0 
      ? Math.round(((totalPixels - diffPixels) / totalPixels) * 10000) / 100 
      : 0;
    
    return {
      matchPercent,
      diffPixels,
      totalPixels,
      width,
      height,
      sizeMismatch: false
    };
  } catch (e) {
    console.error(`  Error comparing images: ${e.message}`);
    return { matchPercent: 0, diffPixels: 999999, totalPixels: 0, error: e.message };
  }
}

// Count service icons on page
async function countServiceIcons(page) {
  try {
    const icons = await page.locator('.service-icon, .icon-wrapper, .completed-icon, .service-card img').all();
    return icons.length;
  } catch (e) {
    return 0;
  }
}

// Validate a single element on a single page
async function validateElement(page, elementConfig, pageName, siteType) {
  const { name, selector } = elementConfig;
  const baseUrl = siteType === 'original' ? ORIGINAL_URL : DEPLOYED_URL;
  
  console.log(`    Validating ${name} on ${pageName} (${siteType})...`);
  
  // Check visibility
  const visibility = await isElementVisible(page, selector);
  
  // Capture screenshot
  const screenshotPath = path.join(
    OUTPUT_DIR, 
    pageName, 
    `${name}-${siteType}.png`
  );
  
  const captured = await captureElementScreenshot(page, selector, screenshotPath);
  
  // Special handling for service icons
  let iconCount = null;
  if (name === 'service-icons') {
    iconCount = await countServiceIcons(page);
  }
  
  return {
    visible: visibility.visible,
    width: visibility.width,
    height: visibility.height,
    opacity: visibility.opacity,
    captured,
    screenshotPath,
    iconCount
  };
}

// Validate all elements on all pages
async function runValidation() {
  console.log('=== Critical Element Validation ===\n');
  
  ensureDirectories();
  
  const report = {
    timestamp: new Date().toISOString(),
    originalUrl: ORIGINAL_URL,
    deployedUrl: DEPLOYED_URL,
    pages: {}
  };
  
  // Process each page with a fresh browser instance to avoid stability issues
  for (const pageName of Object.keys(PAGE_URLS)) {
    const pagePath = PAGE_URLS[pageName];
    console.log(`\n📄 Validating page: ${pageName} (${pagePath})`);
    
    report.pages[pageName] = {};
    
    // Get elements to validate for this page
    const elementsForPage = CRITICAL_ELEMENTS.filter(e => e.pages.includes(pageName));
    
    let browser;
    let originalPage, deployedPage;
    
    try {
      browser = await chromium.launch({ headless: true });
      
      // Create pages for both sites
      const originalContext = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 1
      });
      const deployedContext = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 1
      });
      
      originalPage = await originalContext.newPage();
      deployedPage = await deployedContext.newPage();
      
      // Load original site
      console.log(`  🌐 Original site: ${ORIGINAL_URL}${pagePath}`);
      try {
        await originalPage.goto(`${ORIGINAL_URL}${pagePath}`, { timeout: 30000 });
        await waitForPageLoad(originalPage);
      } catch (e) {
        console.log(`  ⚠️  Failed to load original page: ${e.message}`);
      }
      
      // Load deployed site
      console.log(`  🌐 Deployed site: ${DEPLOYED_URL}${pagePath}`);
      try {
        await deployedPage.goto(`${DEPLOYED_URL}${pagePath}`, { timeout: 30000 });
        await waitForPageLoad(deployedPage);
      } catch (e) {
        console.log(`  ⚠️  Failed to load deployed page: ${e.message}`);
      }
      
      // Validate each element
      for (const elementConfig of elementsForPage) {
        const { name } = elementConfig;
        
        // Validate on both sites
        const originalResult = await validateElement(originalPage, elementConfig, pageName, 'original');
        const deployedResult = await validateElement(deployedPage, elementConfig, pageName, 'deployed');
        
        // Compare screenshots
        const comparison = compareImages(
          originalResult.screenshotPath,
          deployedResult.screenshotPath
        );
        
        // Determine status
        let status = 'PASS';
        let issues = [];
        
        if (!originalResult.visible) {
          status = 'WARN';
          issues.push('Not visible on original');
        }
        
        if (!deployedResult.visible) {
          status = 'FAIL';
          issues.push('Not visible on deployed');
        }
        
        if (originalResult.visible && deployedResult.visible) {
          if (comparison.matchPercent < 90) {
            status = 'FAIL';
            issues.push(`Low match: ${comparison.matchPercent}%`);
          } else if (comparison.matchPercent < 95) {
            status = 'WARN';
            issues.push(`Moderate match: ${comparison.matchPercent}%`);
          }
        }
        
        // Special check for service icons
        if (name === 'service-icons' && pageName === 'home') {
          if (deployedResult.iconCount < 7) {
            status = 'FAIL';
            issues.push(`Only ${deployedResult.iconCount}/7 icons found`);
          }
        }
        
        report.pages[pageName][name] = {
          original: {
            visible: originalResult.visible,
            width: originalResult.width,
            height: originalResult.height,
            opacity: originalResult.opacity,
            captured: originalResult.captured
          },
          deployed: {
            visible: deployedResult.visible,
            width: deployedResult.width,
            height: deployedResult.height,
            opacity: deployedResult.opacity,
            captured: deployedResult.captured,
            iconCount: deployedResult.iconCount
          },
          comparison: {
            matchPercent: comparison.matchPercent,
            diffPixels: comparison.diffPixels,
            totalPixels: comparison.totalPixels,
            sizeMismatch: comparison.sizeMismatch || false
          },
          status,
          issues
        };
        
        console.log(`    ${status === 'PASS' ? '✅' : status === 'WARN' ? '⚠️' : '❌'} ${name}: ${status}${issues.length > 0 ? ' - ' + issues.join(', ') : ''}`);
      }
    } catch (e) {
      console.error(`  ❌ Error processing ${pageName}: ${e.message}`);
    } finally {
      // Always close browser after each page
      if (browser) {
        try {
          await browser.close();
        } catch (e) {
          // Ignore close errors
        }
      }
    }
    
    // Generate summary statistics
    const stats = {
      totalElements: 0,
      pass: 0,
      warn: 0,
      fail: 0
    };
    
    Object.values(report.pages).forEach(page => {
      Object.values(page).forEach(element => {
        stats.totalElements++;
        if (element.status === 'PASS') stats.pass++;
        else if (element.status === 'WARN') stats.warn++;
        else if (element.status === 'FAIL') stats.fail++;
      });
    });
    
    report.summary = stats;
  }
  
  // Save JSON report
  const reportPath = path.join(OUTPUT_DIR, 'validation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📊 Report saved: ${reportPath}`);
  
  // Generate markdown summary
  generateSummary(report);
  
  return report;
}

// Generate markdown summary
function generateSummary(report) {
  const summaryPath = path.join(OUTPUT_DIR, 'summary.md');
  
  let md = `# Critical Element Validation Report\n\n`;
  md += `**Generated:** ${new Date(report.timestamp).toLocaleString()}\n\n`;
  md += `## URLs Tested\n\n`;
  md += `- **Original:** ${report.originalUrl}\n`;
  md += `- **Deployed:** ${report.deployedUrl}\n\n`;
  
  md += `## Summary\n\n`;
  md += `| Status | Count |\n`;
  md += `|--------|-------|\n`;
  md += `| ✅ PASS | ${report.summary.pass} |\n`;
  md += `| ⚠️ WARN | ${report.summary.warn} |\n`;
  md += `| ❌ FAIL | ${report.summary.fail} |\n`;
  md += `| **Total** | **${report.summary.totalElements}** |\n\n`;
  
  // Detailed results by page
  md += `## Detailed Results\n\n`;
  
  for (const [pageName, elements] of Object.entries(report.pages)) {
    md += `### ${pageName.charAt(0).toUpperCase() + pageName.slice(1)} Page\n\n`;
    
    for (const [elementName, result] of Object.entries(elements)) {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'WARN' ? '⚠️' : '❌';
      md += `#### ${icon} ${elementName.charAt(0).toUpperCase() + elementName.slice(1)}\n\n`;
      
      md += `| Property | Original | Deployed |\n`;
      md += `|----------|----------|----------|\n`;
      md += `| Visible | ${result.original.visible ? 'Yes' : 'No'} | ${result.deployed.visible ? 'Yes' : 'No'} |\n`;
      md += `| Dimensions | ${result.original.width}×${result.original.height} | ${result.deployed.width}×${result.deployed.height} |\n`;
      md += `| Opacity | ${result.original.opacity} | ${result.deployed.opacity} |\n`;
      
      if (result.deployed.iconCount !== undefined) {
        md += `| Icons Found | ${result.original.iconCount || 'N/A'} | ${result.deployed.iconCount} |\n`;
      }
      
      md += `| Match % | - | ${result.comparison.matchPercent}% |\n\n`;
      
      if (result.issues.length > 0) {
        md += `**Issues:**\n`;
        result.issues.forEach(issue => {
          md += `- ${issue}\n`;
        });
        md += `\n`;
      }
      
      // Add screenshot links
      md += `**Screenshots:**\n`;
      md += `- [Original](./${pageName}/${elementName}-original.png)\n`;
      md += `- [Deployed](./${pageName}/${elementName}-deployed.png)\n\n`;
    }
    
    md += `---\n\n`;
  }
  
  // Known issues section
  md += `## Known Issues\n\n`;
  
  let hasIssues = false;
  for (const [pageName, elements] of Object.entries(report.pages)) {
    for (const [elementName, result] of Object.entries(elements)) {
      if (result.status === 'FAIL' || result.status === 'WARN') {
        hasIssues = true;
        md += `- **${pageName}/${elementName}**: ${result.issues.join(', ')}\n`;
      }
    }
  }
  
  if (!hasIssues) {
    md += `No issues detected! All critical elements are rendering correctly.\n`;
  }
  
  fs.writeFileSync(summaryPath, md);
  console.log(`📝 Summary saved: ${summaryPath}`);
}

// Main execution
if (require.main === module) {
  runValidation()
    .then(report => {
      console.log('\n=== Validation Complete ===');
      console.log(`\nResults:`);
      console.log(`  ✅ PASS: ${report.summary.pass}`);
      console.log(`  ⚠️  WARN: ${report.summary.warn}`);
      console.log(`  ❌ FAIL: ${report.summary.fail}`);
      console.log(`  Total: ${report.summary.totalElements}`);
      
      if (report.summary.fail > 0) {
        console.log('\n⚠️  Some critical elements failed validation. Check the report for details.');
        process.exit(1);
      } else if (report.summary.warn > 0) {
        console.log('\n⚠️  Some warnings detected, but all critical elements are present.');
        process.exit(0);
      } else {
        console.log('\n✅ All critical elements validated successfully!');
        process.exit(0);
      }
    })
    .catch(error => {
      console.error('\n❌ Validation failed:', error.message);
      process.exit(1);
    });
}

module.exports = { runValidation, validateElement };
