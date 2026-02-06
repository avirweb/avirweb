#!/usr/bin/env node
/**
 * Enhanced Link Checker Script
 * Verifies all internal and external links in the site directory
 * 
 * Usage:
 *   node scripts/check-links-enhanced.js [--check-external] [--format=json|html|console] [--output=path]
 */

const fs = require('fs');
const path = require('path');
const { globSync } = require('glob');
const cheerio = require('cheerio');

const SITE_DIR = path.resolve('site');
const DEFAULT_OUTPUT = 'link-report.json';

// Parse CLI arguments
const args = process.argv.slice(2);
const checkExternal = args.includes('--check-external');
const formatArg = args.find(arg => arg.startsWith('--format='));
const format = formatArg ? formatArg.split('=')[1] : 'console';
const outputArg = args.find(arg => arg.startsWith('--output='));
const outputPath = outputArg ? outputArg.split('=')[1] : DEFAULT_OUTPUT;

// Statistics
const stats = {
  total: 0,
  internal: 0,
  external: 0,
  anchor: 0,
  mailto: 0,
  tel: 0,
  javascript: 0,
  valid: 0,
  broken: 0,
  warnings: 0,
  skipped: 0
};

const brokenLinks = [];
const warnings = [];
const checkedFiles = new Set();

/**
 * Find all HTML files in the site directory
 */
function findHtmlFiles() {
  return globSync(`${SITE_DIR}/**/*.html`);
}

/**
 * Extract all links from HTML content
 */
function extractLinks(htmlContent, sourceFile) {
  const $ = cheerio.load(htmlContent);
  const links = [];
  const sourceRel = path.relative(SITE_DIR, sourceFile);
  const sourceDir = path.dirname(sourceFile);

  // Helper to add link
  const addLink = (url, type, element) => {
    if (!url) return;
    links.push({
      url: url.trim(),
      type,
      sourceFile: sourceRel,
      sourceDir,
      element: element.substring(0, 100) // Store context
    });
  };

  // Extract href attributes
  $('[href]').each((_, el) => {
    const href = $(el).attr('href');
    const element = $.html(el);
    addLink(href, 'href', element);
  });

  // Extract src attributes
  $('[src]').each((_, el) => {
    const src = $(el).attr('src');
    const element = $.html(el);
    addLink(src, 'src', element);
  });

  // Extract srcset attributes
  $('[srcset]').each((_, el) => {
    const srcset = $(el).attr('srcset');
    if (srcset) {
      const urls = srcset.split(',').map(s => s.trim().split(' ')[0]);
      const element = $.html(el);
      urls.forEach(url => addLink(url, 'srcset', element));
    }
  });

  // Extract action attributes (forms)
  $('form[action]').each((_, el) => {
    const action = $(el).attr('action');
    const element = $.html(el);
    addLink(action, 'action', element);
  });

  // Extract poster attributes (video)
  $('[poster]').each((_, el) => {
    const poster = $(el).attr('poster');
    const element = $.html(el);
    addLink(poster, 'poster', element);
  });

  // Extract data-src attributes (lazy loading)
  $('[data-src]').each((_, el) => {
    const dataSrc = $(el).attr('data-src');
    const element = $.html(el);
    addLink(dataSrc, 'data-src', element);
  });

  return links;
}

/**
 * Classify a link by its type
 */
function classifyLink(url) {
  if (!url || url === '#') return 'anchor';
  
  // Mailto links
  if (url.startsWith('mailto:')) return 'mailto';
  
  // Tel links
  if (url.startsWith('tel:')) return 'tel';
  
  // JavaScript links
  if (url.startsWith('javascript:')) return 'javascript';
  
  // Data URIs
  if (url.startsWith('data:')) return 'data';
  
  // Protocol-relative URLs (external)
  if (url.startsWith('//')) return 'external';
  
  // Absolute URLs (external)
  if (url.startsWith('http://') || url.startsWith('https://')) return 'external';
  
  // Anchors within page
  if (url.startsWith('#')) return 'anchor';
  
  // Internal links
  return 'internal';
}

/**
 * Resolve an internal link to a file path
 */
function resolveInternalPath(url, sourceDir) {
  // Remove anchor
  const urlWithoutAnchor = url.split('#')[0];
  
  // Remove query string
  const cleanUrl = urlWithoutAnchor.split('?')[0];
  
  if (!cleanUrl) return null;
  
  let resolvedPath;
  
  if (cleanUrl.startsWith('/')) {
    // Absolute path from site root
    resolvedPath = path.join(SITE_DIR, cleanUrl);
  } else {
    // Relative path
    resolvedPath = path.resolve(sourceDir, cleanUrl);
  }
  
  // If path ends with /, assume index.html
  if (resolvedPath.endsWith(path.sep)) {
    resolvedPath = path.join(resolvedPath, 'index.html');
  }
  
  // If no extension, assume .html for pages
  if (!path.extname(resolvedPath)) {
    resolvedPath += '.html';
  }
  
  return resolvedPath;
}

/**
 * Check if an internal link is valid
 */
function checkInternalLink(link) {
  const resolvedPath = resolveInternalPath(link.url, link.sourceDir);
  
  if (!resolvedPath) {
    return { valid: false, error: 'Could not resolve path', resolvedPath: null };
  }
  
  const exists = fs.existsSync(resolvedPath);
  
  if (!exists) {
    // Check if it's a directory with index.html
    const dirPath = resolvedPath.replace(/\.html$/, '');
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
      const indexPath = path.join(dirPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        return { valid: true, resolvedPath: indexPath };
      }
    }
    
    return { valid: false, error: 'File not found', resolvedPath };
  }
  
  const stat = fs.statSync(resolvedPath);
  if (!stat.isFile()) {
    return { valid: false, error: 'Not a file', resolvedPath };
  }
  
  return { valid: true, resolvedPath };
}

/**
 * Check an external link via HTTP
 */
async function checkExternalLink(link) {
  // Skip if not checking external links
  if (!checkExternal) {
    return { valid: true, status: 'skipped', checked: false };
  }
  
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(link.url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkChecker/1.0)'
      }
    });
    
    clearTimeout(timeout);
    
    const valid = response.status >= 200 && response.status < 400;
    
    if (!valid) {
      return { 
        valid: false, 
        status: response.status,
        checked: true,
        error: `HTTP ${response.status}` 
      };
    }
    
    return { valid: true, status: response.status, checked: true };
  } catch (error) {
    // Try GET request as fallback for HEAD failures
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(link.url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; LinkChecker/1.0)'
        }
      });
      
      clearTimeout(timeout);
      
      const valid = response.status >= 200 && response.status < 400;
      return { 
        valid, 
        status: response.status,
        checked: true,
        error: valid ? null : `HTTP ${response.status}`
      };
    } catch (fallbackError) {
      return { 
        valid: false, 
        status: 'error',
        checked: true,
        error: error.message || 'Network error'
      };
    }
  }
}

/**
 * Check a single link
 */
async function checkLink(link) {
  const linkType = classifyLink(link.url);
  
  stats.total++;
  
  switch (linkType) {
    case 'internal':
      stats.internal++;
      const internalResult = checkInternalLink(link);
      link.classification = 'internal';
      link.valid = internalResult.valid;
      link.resolvedPath = internalResult.resolvedPath;
      
      if (internalResult.valid) {
        stats.valid++;
      } else {
        stats.broken++;
        link.error = internalResult.error;
        brokenLinks.push(link);
      }
      break;
      
    case 'external':
      stats.external++;
      link.classification = 'external';
      const externalResult = await checkExternalLink(link);
      link.valid = externalResult.valid;
      link.status = externalResult.status;
      link.checked = externalResult.checked;
      
      if (externalResult.checked) {
        if (externalResult.valid) {
          stats.valid++;
        } else {
          stats.broken++;
          link.error = externalResult.error;
          brokenLinks.push(link);
        }
      } else {
        stats.skipped++;
      }
      break;
      
    case 'anchor':
      stats.anchor++;
      link.classification = 'anchor';
      link.valid = true;
      link.note = 'Anchor link - file existence checked separately';
      stats.valid++;
      break;
      
    case 'mailto':
      stats.mailto++;
      link.classification = 'mailto';
      link.valid = true;
      link.note = 'Mailto link - not validated';
      stats.valid++;
      break;
      
    case 'tel':
      stats.tel++;
      link.classification = 'tel';
      link.valid = true;
      link.note = 'Tel link - not validated';
      stats.valid++;
      break;
      
    case 'javascript':
      stats.javascript++;
      link.classification = 'javascript';
      link.valid = true;
      link.note = 'JavaScript link - not validated';
      stats.valid++;
      break;
      
    case 'data':
      link.classification = 'data';
      link.valid = true;
      link.note = 'Data URI - embedded content';
      stats.valid++;
      break;
      
    default:
      link.classification = 'unknown';
      link.valid = true;
      link.note = 'Unknown link type';
      stats.valid++;
  }
  
  return link;
}

/**
 * Generate console output report
 */
function generateConsoleReport(allLinks) {
  console.log('\n' + '='.repeat(70));
  console.log('LINK CHECKER REPORT');
  console.log('='.repeat(70));
  
  console.log('\n📊 STATISTICS:');
  console.log(`  Total links checked: ${stats.total}`);
  console.log(`  ✓ Valid: ${stats.valid}`);
  console.log(`  ✗ Broken: ${stats.broken}`);
  console.log(`  ⚠ Skipped: ${stats.skipped}`);
  
  console.log('\n📋 BY TYPE:');
  console.log(`  Internal: ${stats.internal}`);
  console.log(`  External: ${stats.external} ${!checkExternal ? '(not checked)' : ''}`);
  console.log(`  Anchors: ${stats.anchor}`);
  console.log(`  Mailto: ${stats.mailto}`);
  console.log(`  Tel: ${stats.tel}`);
  console.log(`  JavaScript: ${stats.javascript}`);
  
  if (brokenLinks.length > 0) {
    console.log('\n❌ BROKEN LINKS:');
    console.log('-'.repeat(70));
    
    // Group by source file
    const bySource = brokenLinks.reduce((acc, link) => {
      if (!acc[link.sourceFile]) acc[link.sourceFile] = [];
      acc[link.sourceFile].push(link);
      return acc;
    }, {});
    
    for (const [sourceFile, links] of Object.entries(bySource)) {
      console.log(`\n  File: ${sourceFile}`);
      for (const link of links) {
        console.log(`    • ${link.url}`);
        console.log(`      Type: ${link.classification}`);
        if (link.error) console.log(`      Error: ${link.error}`);
        if (link.resolvedPath) console.log(`      Tried: ${link.resolvedPath}`);
      }
    }
  } else {
    console.log('\n✅ All links are valid!');
  }
  
  console.log('\n' + '='.repeat(70));
  
  // Summary
  if (stats.broken === 0) {
    console.log('🎉 SUCCESS: No broken links found!');
  } else {
    console.log(`⚠️  WARNING: ${stats.broken} broken link(s) found.`);
  }
  
  console.log('='.repeat(70) + '\n');
}

/**
 * Generate JSON report
 */
function generateJsonReport(allLinks) {
  const report = {
    timestamp: new Date().toISOString(),
    siteDirectory: SITE_DIR,
    statistics: stats,
    summary: {
      status: stats.broken === 0 ? 'success' : 'failed',
      totalBroken: stats.broken
    },
    brokenLinks: brokenLinks.map(link => ({
      url: link.url,
      type: link.type,
      classification: link.classification,
      sourceFile: link.sourceFile,
      error: link.error,
      resolvedPath: link.resolvedPath,
      element: link.element
    })),
    allLinks: allLinks.map(link => ({
      url: link.url,
      type: link.type,
      classification: link.classification,
      sourceFile: link.sourceFile,
      valid: link.valid,
      error: link.error,
      status: link.status
    }))
  };
  
  return JSON.stringify(report, null, 2);
}

/**
 * Generate HTML report
 */
function generateHtmlReport(allLinks) {
  const brokenBySource = brokenLinks.reduce((acc, link) => {
    if (!acc[link.sourceFile]) acc[link.sourceFile] = [];
    acc[link.sourceFile].push(link);
    return acc;
  }, {});
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Link Checker Report</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; padding: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    h1 { color: #333; margin-bottom: 10px; }
    .timestamp { color: #666; margin-bottom: 30px; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 30px; }
    .stat-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #007bff; }
    .stat-card.broken { border-left-color: #dc3545; }
    .stat-card.success { border-left-color: #28a745; }
    .stat-value { font-size: 2em; font-weight: bold; color: #333; }
    .stat-label { color: #666; font-size: 0.9em; }
    .status-banner { padding: 20px; border-radius: 8px; margin-bottom: 30px; text-align: center; font-weight: bold; }
    .status-banner.success { background: #d4edda; color: #155724; }
    .status-banner.error { background: #f8d7da; color: #721c24; }
    .broken-section { margin-top: 30px; }
    .broken-section h2 { color: #dc3545; margin-bottom: 20px; }
    .source-file { background: #f8f9fa; padding: 15px; margin-bottom: 20px; border-radius: 8px; border-left: 4px solid #dc3545; }
    .source-file h3 { color: #333; margin-bottom: 10px; font-size: 1.1em; }
    .broken-link { background: white; padding: 15px; margin: 10px 0; border-radius: 4px; border: 1px solid #dee2e6; }
    .broken-link .url { font-family: monospace; color: #dc3545; font-weight: bold; }
    .broken-link .detail { color: #666; font-size: 0.9em; margin-top: 5px; }
    .broken-link .error { color: #dc3545; }
    .type-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; margin-top: 20px; }
    .type-item { background: #e9ecef; padding: 10px; border-radius: 4px; text-align: center; }
    .type-count { font-weight: bold; color: #333; }
    .type-name { color: #666; font-size: 0.85em; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Link Checker Report</h1>
    <p class="timestamp">Generated: ${new Date().toLocaleString()}</p>
    
    <div class="status-banner ${stats.broken === 0 ? 'success' : 'error'}">
      ${stats.broken === 0 ? '✅ All links are valid!' : `⚠️ ${stats.broken} broken link(s) found`}
    </div>
    
    <div class="stats">
      <div class="stat-card">
        <div class="stat-value">${stats.total}</div>
        <div class="stat-label">Total Links</div>
      </div>
      <div class="stat-card success">
        <div class="stat-value">${stats.valid}</div>
        <div class="stat-label">Valid</div>
      </div>
      <div class="stat-card ${stats.broken > 0 ? 'broken' : ''}">
        <div class="stat-value">${stats.broken}</div>
        <div class="stat-label">Broken</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.skipped}</div>
        <div class="stat-label">Skipped</div>
      </div>
    </div>
    
    <h2>Link Types</h2>
    <div class="type-grid">
      <div class="type-item">
        <div class="type-count">${stats.internal}</div>
        <div class="type-name">Internal</div>
      </div>
      <div class="type-item">
        <div class="type-count">${stats.external}</div>
        <div class="type-name">External ${!checkExternal ? '(unchecked)' : ''}</div>
      </div>
      <div class="type-item">
        <div class="type-count">${stats.anchor}</div>
        <div class="type-name">Anchors</div>
      </div>
      <div class="type-item">
        <div class="type-count">${stats.mailto}</div>
        <div class="type-name">Mailto</div>
      </div>
      <div class="type-item">
        <div class="type-count">${stats.tel}</div>
        <div class="type-name">Tel</div>
      </div>
      <div class="type-item">
        <div class="type-count">${stats.javascript}</div>
        <div class="type-name">JavaScript</div>
      </div>
    </div>
    
    ${brokenLinks.length > 0 ? `
    <div class="broken-section">
      <h2>Broken Links by File</h2>
      ${Object.entries(brokenBySource).map(([sourceFile, links]) => `
        <div class="source-file">
          <h3>${sourceFile}</h3>
          ${links.map(link => `
            <div class="broken-link">
              <div class="url">${link.url}</div>
              <div class="detail">Type: ${link.type} (${link.classification})</div>
              ${link.error ? `<div class="detail error">Error: ${link.error}</div>` : ''}
              ${link.resolvedPath ? `<div class="detail">Resolved: ${link.resolvedPath}</div>` : ''}
            </div>
          `).join('')}
        </div>
      `).join('')}
    </div>
    ` : ''}
  </div>
</body>
</html>`;
}

/**
 * Main function
 */
async function main() {
  console.log('🔍 Enhanced Link Checker');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Site directory: ${SITE_DIR}`);
  console.log(`Check external: ${checkExternal ? 'Yes' : 'No (use --check-external to enable)'}`);
  console.log(`Output format: ${format}`);
  console.log(`Output path: ${outputPath}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const htmlFiles = findHtmlFiles();
  console.log(`Found ${htmlFiles.length} HTML files\n`);
  
  const allLinks = [];
  
  // Extract all links
  for (const file of htmlFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const links = extractLinks(content, file);
    allLinks.push(...links);
  }
  
  console.log(`Extracted ${allLinks.length} total links\n`);
  
  // Remove duplicates based on URL + source file
  const uniqueLinks = [];
  const seen = new Set();
  for (const link of allLinks) {
    const key = `${link.url}|${link.sourceFile}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueLinks.push(link);
    }
  }
  
  console.log(`Checking ${uniqueLinks.length} unique links...\n`);
  
  // Check all links
  for (let i = 0; i < uniqueLinks.length; i++) {
    const link = uniqueLinks[i];
    if (i % 50 === 0 && i > 0) {
      console.log(`  Progress: ${i}/${uniqueLinks.length} links checked...`);
    }
    await checkLink(link);
  }
  
  console.log('\n✓ Link checking complete!\n');
  
  // Generate report based on format
  let reportContent;
  switch (format) {
    case 'json':
      reportContent = generateJsonReport(uniqueLinks);
      break;
    case 'html':
      reportContent = generateHtmlReport(uniqueLinks);
      break;
    case 'console':
    default:
      generateConsoleReport(uniqueLinks);
      reportContent = generateJsonReport(uniqueLinks);
      break;
  }
  
  // Save report to file
  fs.writeFileSync(outputPath, reportContent, 'utf8');
  console.log(`📄 Report saved to: ${outputPath}`);
  
  // Return exit code
  process.exit(stats.broken > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
