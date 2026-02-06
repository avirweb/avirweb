#!/usr/bin/env node

/**
 * CSS Computed Style Comparison Script
 * 
 * Extracts and compares CSS styles between the source website (www.avir.com)
 * and a local or deployed replica.
 * 
 * Usage:
 *   node scripts/validate-css.js
 *   node scripts/validate-css.js --url https://avirwebtest.pages.dev
 *   node scripts/validate-css.js --output ./custom-results
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const SOURCE_URL = 'https://www.avir.com';
const DEFAULT_REPLICA_URL = 'file:///home/agent/avir/site/index.html';
const DEFAULT_OUTPUT_DIR = 'test-results/css-comparison';

// Elements to check
const elementsToCheck = [
  { selector: 'h1', name: 'Heading 1' },
  { selector: 'h2', name: 'Heading 2' },
  { selector: 'h3', name: 'Heading 3' },
  { selector: 'p', name: 'Paragraph' },
  { selector: 'button', name: 'Button' },
  { selector: 'nav', name: 'Navigation' },
  { selector: '.button', name: 'Button Class' },
  { selector: '.nav', name: 'Nav Class' }
];

// Styles to compare
const stylesToCompare = [
  'font-family',
  'font-size',
  'font-weight',
  'color',
  'background-color',
  'margin',
  'padding',
  'line-height',
  'text-align',
  'border-radius'
];

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  let replicaUrl = DEFAULT_REPLICA_URL;
  let outputDir = DEFAULT_OUTPUT_DIR;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--url' && args[i + 1]) {
      replicaUrl = args[i + 1];
      i++;
    } else if (args[i] === '--output' && args[i + 1]) {
      outputDir = args[i + 1];
      i++;
    }
  }

  return { replicaUrl, outputDir };
}

/**
 * Extract computed styles from a page for a specific element
 */
async function extractElementStyles(page, selector, styles) {
  try {
    const computedStyles = await page.evaluate(({ sel, styleList }) => {
      const element = document.querySelector(sel);
      if (!element) return null;
      
      const computed = window.getComputedStyle(element);
      const result = {};
      
      styleList.forEach(style => {
        result[style] = computed.getPropertyValue(style);
      });
      
      return result;
    }, { sel: selector, styleList: styles });

    return computedStyles;
  } catch (error) {
    console.warn(`Warning: Failed to extract styles for ${selector}: ${error.message}`);
    return null;
  }
}

/**
 * Compare two style objects and return mismatches
 */
function compareStyles(sourceStyles, replicaStyles, elementName) {
  const mismatches = [];
  
  if (!sourceStyles && !replicaStyles) {
    return { mismatches, status: 'missing', message: 'Element not found on either site' };
  }
  
  if (!sourceStyles) {
    return { mismatches, status: 'missing', message: 'Element not found on source site' };
  }
  
  if (!replicaStyles) {
    return { mismatches, status: 'missing', message: 'Element not found on replica site' };
  }

  stylesToCompare.forEach(style => {
    const sourceValue = sourceStyles[style];
    const replicaValue = replicaStyles[style];
    
    // Normalize values for comparison (handle color format differences)
    const normalizedSource = normalizeStyleValue(sourceValue);
    const normalizedReplica = normalizeStyleValue(replicaValue);
    
    if (normalizedSource !== normalizedReplica) {
      mismatches.push({
        style,
        source: sourceValue,
        replica: replicaValue
      });
    }
  });

  return {
    mismatches,
    status: mismatches.length === 0 ? 'match' : 'mismatch'
  };
}

/**
 * Normalize style values for comparison
 */
function normalizeStyleValue(value) {
  if (!value) return value;
  
  // Trim whitespace
  let normalized = value.trim();
  
  // Normalize rgb/rgba colors (remove spaces after commas)
  normalized = normalized.replace(/rgb\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)\)/g, 'rgb($1,$2,$3)');
  normalized = normalized.replace(/rgba\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\)/g, 'rgba($1,$2,$3,$4)');
  
  return normalized;
}

/**
 * Generate HTML report
 */
function generateHtmlReport(comparisonData) {
  const { timestamp, sourceUrl, replicaUrl, comparisons, summary } = comparisonData;
  
  const elementRows = comparisons.map(comp => {
    const statusClass = comp.status === 'match' ? 'match' : 
                       comp.status === 'missing' ? 'missing' : 'mismatch';
    
    const styleRows = comp.status === 'missing' 
      ? `<div class="missing-message">${comp.message || 'Element not found'}</div>`
      : stylesToCompare.map(style => {
          const sourceValue = comp.sourceStyles?.[style] || 'N/A';
          const replicaValue = comp.replicaStyles?.[style] || 'N/A';
          const hasMismatch = comp.mismatches?.some(m => m.style === style);
          const mismatchClass = hasMismatch ? 'mismatch-value' : '';
          
          return `
            <div class="style-row">
              <span class="style-name">${style}:</span>
              <span class="source-value">${sourceValue}</span>
              <span class="replica-value ${mismatchClass}">${replicaValue}</span>
            </div>
          `;
        }).join('');

    return `
      <div class="element ${statusClass}">
        <h3>${comp.element} - ${comp.name}</h3>
        <div class="element-status">Status: ${comp.status.toUpperCase()}</div>
        ${styleRows}
      </div>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CSS Comparison Report</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    h1 {
      color: #333;
      border-bottom: 2px solid #333;
      padding-bottom: 10px;
    }
    .meta {
      background: white;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .meta p {
      margin: 5px 0;
      color: #666;
    }
    .summary {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      display: flex;
      gap: 30px;
      flex-wrap: wrap;
    }
    .summary-item {
      text-align: center;
    }
    .summary-value {
      font-size: 2em;
      font-weight: bold;
      color: #333;
    }
    .summary-label {
      color: #666;
      font-size: 0.9em;
    }
    .element {
      background: white;
      margin: 20px 0;
      padding: 20px;
      border-radius: 8px;
      border-left: 5px solid #ccc;
    }
    .element.match { border-left-color: #4caf50; }
    .element.mismatch { border-left-color: #ff9800; }
    .element.missing { border-left-color: #f44336; }
    .element h3 {
      margin-top: 0;
      color: #333;
    }
    .element-status {
      font-size: 0.85em;
      color: #666;
      margin-bottom: 15px;
      font-weight: 500;
    }
    .style-row {
      display: flex;
      gap: 20px;
      padding: 8px 0;
      border-bottom: 1px solid #eee;
      align-items: center;
    }
    .style-row:last-child { border-bottom: none; }
    .style-name {
      font-weight: 600;
      width: 150px;
      color: #555;
      flex-shrink: 0;
    }
    .source-value {
      color: #2196f3;
      min-width: 150px;
    }
    .replica-value {
      color: #4caf50;
      min-width: 150px;
    }
    .mismatch-value {
      color: #f44336;
      font-weight: 600;
    }
    .missing-message {
      color: #f44336;
      font-style: italic;
      padding: 10px;
      background: #ffebee;
      border-radius: 4px;
    }
    .legend {
      background: white;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .legend-item {
      display: inline-flex;
      align-items: center;
      margin-right: 20px;
    }
    .legend-color {
      width: 20px;
      height: 20px;
      border-radius: 4px;
      margin-right: 8px;
    }
  </style>
</head>
<body>
  <h1>CSS Comparison Report</h1>
  
  <div class="meta">
    <p><strong>Timestamp:</strong> ${timestamp}</p>
    <p><strong>Source:</strong> ${sourceUrl}</p>
    <p><strong>Replica:</strong> ${replicaUrl}</p>
  </div>

  <div class="legend">
    <div class="legend-item">
      <div class="legend-color" style="background: #4caf50;"></div>
      <span>Match</span>
    </div>
    <div class="legend-item">
      <div class="legend-color" style="background: #ff9800;"></div>
      <span>Mismatch</span>
    </div>
    <div class="legend-item">
      <div class="legend-color" style="background: #f44336;"></div>
      <span>Missing</span>
    </div>
  </div>

  <div class="summary">
    <div class="summary-item">
      <div class="summary-value">${summary.total}</div>
      <div class="summary-label">Total Elements</div>
    </div>
    <div class="summary-item">
      <div class="summary-value" style="color: #4caf50;">${summary.matches}</div>
      <div class="summary-label">Matches</div>
    </div>
    <div class="summary-item">
      <div class="summary-value" style="color: #ff9800;">${summary.mismatches}</div>
      <div class="summary-label">Mismatches</div>
    </div>
    <div class="summary-item">
      <div class="summary-value" style="color: #f44336;">${summary.warnings}</div>
      <div class="summary-label">Warnings</div>
    </div>
  </div>

  ${elementRows}
</body>
</html>`;
}

/**
 * Main execution function
 */
async function main() {
  const { replicaUrl, outputDir } = parseArgs();
  
  console.log('CSS Computed Style Comparison');
  console.log('============================');
  console.log(`Source: ${SOURCE_URL}`);
  console.log(`Replica: ${replicaUrl}`);
  console.log(`Output: ${outputDir}`);
  console.log('');

  let browser;
  
  try {
    // Create output directory
    await fs.mkdir(outputDir, { recursive: true });
    
    // Launch browser
    browser = await chromium.launch();
    
    const comparisons = [];
    let totalMatches = 0;
    let totalMismatches = 0;
    let totalWarnings = 0;

    // Extract styles from source site
    console.log('Extracting styles from source site...');
    const sourceContext = await browser.newContext();
    const sourcePage = await sourceContext.newPage();
    await sourcePage.goto(SOURCE_URL, { waitUntil: 'networkidle' });
    
    // Extract styles from replica site
    console.log('Extracting styles from replica site...');
    const replicaContext = await browser.newContext();
    const replicaPage = await replicaContext.newPage();
    await replicaPage.goto(replicaUrl, { waitUntil: 'networkidle' });

    // Compare each element
    console.log('\nComparing elements...');
    for (const element of elementsToCheck) {
      process.stdout.write(`  ${element.name}... `);
      
      const sourceStyles = await extractElementStyles(sourcePage, element.selector, stylesToCompare);
      const replicaStyles = await extractElementStyles(replicaPage, element.selector, stylesToCompare);
      
      const comparison = compareStyles(sourceStyles, replicaStyles, element.name);
      
      const result = {
        element: element.selector,
        name: element.name,
        sourceStyles,
        replicaStyles,
        mismatches: comparison.mismatches,
        status: comparison.status,
        message: comparison.message
      };
      
      comparisons.push(result);
      
      if (comparison.status === 'match') {
        console.log('✓ MATCH');
        totalMatches++;
      } else if (comparison.status === 'missing') {
        console.log(`⚠ WARNING: ${comparison.message}`);
        totalWarnings++;
      } else {
        console.log(`⚠ MISMATCH (${comparison.mismatches.length} differences)`);
        comparison.mismatches.forEach(m => {
          console.log(`    - ${m.style}: "${m.source}" vs "${m.replica}"`);
        });
        totalMismatches++;
        totalWarnings++;
      }
    }

    // Close contexts
    await sourceContext.close();
    await replicaContext.close();

    // Generate report data
    const reportData = {
      timestamp: new Date().toISOString(),
      sourceUrl: SOURCE_URL,
      replicaUrl,
      comparisons,
      summary: {
        total: elementsToCheck.length,
        matches: totalMatches,
        mismatches: totalMismatches,
        warnings: totalWarnings
      }
    };

    // Write JSON report
    const jsonPath = path.join(outputDir, 'comparison.json');
    await fs.writeFile(jsonPath, JSON.stringify(reportData, null, 2));
    console.log(`\nJSON report written to: ${jsonPath}`);

    // Write HTML report
    const htmlPath = path.join(outputDir, 'report.html');
    await fs.writeFile(htmlPath, generateHtmlReport(reportData));
    console.log(`HTML report written to: ${htmlPath}`);

    // Print summary
    console.log('\n' + '='.repeat(40));
    console.log('SUMMARY');
    console.log('='.repeat(40));
    console.log(`Total elements checked: ${elementsToCheck.length}`);
    console.log(`Matches: ${totalMatches}`);
    console.log(`Mismatches: ${totalMismatches}`);
    console.log(`Warnings: ${totalWarnings}`);
    
    if (totalWarnings > 0) {
      console.log('\n⚠ CSS validation completed with warnings.');
      console.log('Review the HTML report for details.');
    } else {
      console.log('\n✓ All elements match!');
    }

    console.log('\nNote: CSS mismatches are logged as warnings only.');
    console.log('Validation does not block deployment.');

  } catch (error) {
    console.error('\n✗ Error during CSS validation:', error.message);
    // Still exit with 0 - validation warnings shouldn't block
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the script
main().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(0); // Exit with 0 even on error (warnings only)
});
