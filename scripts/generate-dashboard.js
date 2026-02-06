#!/usr/bin/env node

/**
 * Unified HTML Validation Dashboard Generator
 * 
 * Generates a unified HTML dashboard aggregating all validation results:
 * - Asset integrity validation
 * - CSS comparison validation
 * - Visual regression tests
 * - Live deployment validation
 * 
 * Usage:
 *   node scripts/generate-dashboard.js
 *   node scripts/generate-dashboard.js --input ./test-results --output ./dashboard
 *   node scripts/generate-dashboard.js --embed-images
 */

const fs = require('fs').promises;
const path = require('path');

// Default configuration
const DEFAULT_CONFIG = {
  inputDir: 'test-results',
  outputDir: 'test-results/dashboard',
  embedImages: false,
  maxImageSize: 1024 * 1024 // 1MB max for embedded images
};

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const config = { ...DEFAULT_CONFIG };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--input':
      case '-i':
        config.inputDir = args[++i];
        break;
      case '--output':
      case '-o':
        config.outputDir = args[++i];
        break;
      case '--embed-images':
        config.embedImages = true;
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
Unified Validation Dashboard Generator

Usage: node scripts/generate-dashboard.js [options]

Options:
  -i, --input <dir>     Input directory with validation results (default: ${DEFAULT_CONFIG.inputDir})
  -o, --output <dir>    Output directory for dashboard (default: ${DEFAULT_CONFIG.outputDir})
  --embed-images        Embed images as base64 in HTML (increases file size)
  -h, --help            Show this help message

Examples:
  node scripts/generate-dashboard.js
  node scripts/generate-dashboard.js --embed-images
  node scripts/generate-dashboard.js --input ./results --output ./reports
`);
}

/**
 * Read and parse JSON file if it exists
 */
async function readJsonFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn(`Warning: Error reading ${filePath}: ${error.message}`);
    }
    return null;
  }
}

/**
 * Convert image to base64 data URI
 */
async function imageToBase64(imagePath) {
  try {
    const data = await fs.readFile(imagePath);
    const ext = path.extname(imagePath).toLowerCase();
    const mimeType = ext === '.png' ? 'image/png' : 
                     ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 
                     'image/png';
    return `data:${mimeType};base64,${data.toString('base64')}`;
  } catch (error) {
    return null;
  }
}

/**
 * Aggregate all validation data from test-results directories
 */
async function aggregateValidationData(config) {
  const data = {
    timestamp: new Date().toISOString(),
    pipeline: {},
    assetIntegrity: null,
    cssComparison: null,
    visualRegression: null,
    liveValidation: null
  };

  // Read pipeline info if available
  const lastRunPath = path.join(config.inputDir, '.last-run.json');
  data.pipeline = await readJsonFile(lastRunPath) || {};

  // Read asset integrity report
  const assetPath = path.join(config.inputDir, 'asset-integrity', 'integrity.json');
  data.assetIntegrity = await readJsonFile(assetPath);

  // Read CSS comparison report
  const cssPath = path.join(config.inputDir, 'css-comparison', 'comparison.json');
  data.cssComparison = await readJsonFile(cssPath);

  // Read visual regression report
  const visualPath = path.join(config.inputDir, 'visual-regression', 'summary.json');
  data.visualRegression = await readJsonFile(visualPath);

  // Read live validation report if exists
  const livePath = path.join(config.inputDir, 'live-validation', 'report.json');
  data.liveValidation = await readJsonFile(livePath);

  return data;
}

/**
 * Calculate summary statistics
 */
function calculateSummary(data) {
  const summary = {
    totalTests: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
    byCategory: {}
  };

  // Asset integrity stats
  if (data.assetIntegrity) {
    const ai = data.assetIntegrity;
    summary.byCategory.assetIntegrity = {
      total: ai.totalAssets || 0,
      passed: ai.passed || 0,
      failed: ai.failed || 0,
      warnings: 0
    };
    summary.totalTests += ai.totalAssets || 0;
    summary.passed += ai.passed || 0;
    summary.failed += ai.failed || 0;
  }

  // CSS comparison stats
  if (data.cssComparison) {
    const css = data.cssComparison;
    const comparisons = css.comparisons || [];
    const matches = comparisons.filter(c => c.status === 'match').length;
    const mismatches = comparisons.filter(c => c.status === 'mismatch').length;
    const missing = comparisons.filter(c => c.status === 'missing').length;
    
    summary.byCategory.cssComparison = {
      total: comparisons.length,
      passed: matches,
      failed: mismatches,
      warnings: missing
    };
    summary.totalTests += comparisons.length;
    summary.passed += matches;
    summary.failed += mismatches;
    summary.warnings += missing;
  }

  // Visual regression stats
  if (data.visualRegression) {
    const vr = data.visualRegression;
    const results = vr.results || [];
    const passed = results.filter(r => r.passed).length;
    const failed = results.length - passed;
    
    summary.byCategory.visualRegression = {
      total: results.length,
      passed: passed,
      failed: failed,
      warnings: 0
    };
    summary.totalTests += results.length;
    summary.passed += passed;
    summary.failed += failed;
  }

  // Live validation stats
  if (data.liveValidation) {
    const lv = data.liveValidation;
    summary.byCategory.liveValidation = {
      total: lv.totalChecks || 0,
      passed: lv.passed || 0,
      failed: lv.failed || 0,
      warnings: lv.warnings || 0
    };
    summary.totalTests += lv.totalChecks || 0;
    summary.passed += lv.passed || 0;
    summary.failed += lv.failed || 0;
    summary.warnings += lv.warnings || 0;
  }

  summary.passRate = summary.totalTests > 0 
    ? ((summary.passed / summary.totalTests) * 100).toFixed(1)
    : 0;

  return summary;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format duration
 */
function formatDuration(ms) {
  if (!ms) return 'N/A';
  if (ms < 1000) return ms + 'ms';
  if (ms < 60000) return (ms / 1000).toFixed(1) + 's';
  return (ms / 60000).toFixed(1) + 'm';
}

/**
 * Generate the unified dashboard HTML
 */
async function generateDashboard(data, summary, config) {
  const isDark = false; // Default to light mode
  
  // Generate asset integrity section
  const assetSection = generateAssetSection(data.assetIntegrity);
  
  // Generate CSS comparison section
  const cssSection = generateCssSection(data.cssComparison);
  
  // Generate visual regression section
  const visualSection = await generateVisualSection(data.visualRegression, config);
  
  // Generate live validation section
  const liveSection = generateLiveSection(data.liveValidation);

  // Get git info
  const gitCommit = data.pipeline?.commit || 'N/A';
  const gitBranch = data.pipeline?.branch || 'N/A';
  const pipelineDuration = data.pipeline?.duration || 0;

  return `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Validation Dashboard - AVIR</title>
  <style>
    /* CSS Variables for theming */
    :root {
      --bg-primary: #ffffff;
      --bg-secondary: #f6f8fa;
      --bg-tertiary: #f3f4f6;
      --bg-hover: #f3f4f6;
      --text-primary: #1f2328;
      --text-secondary: #656d76;
      --text-muted: #8c959f;
      --border-color: #d0d7de;
      --border-light: #e6e9ef;
      --accent-blue: #0969da;
      --accent-green: #1a7f37;
      --accent-red: #cf222e;
      --accent-yellow: #9a6700;
      --accent-orange: #bc4c00;
      --accent-purple: #8250df;
      --shadow-sm: 0 1px 2px rgba(31, 35, 40, 0.04);
      --shadow-md: 0 3px 6px rgba(31, 35, 40, 0.08);
      --shadow-lg: 0 8px 24px rgba(31, 35, 40, 0.12);
      --radius-sm: 6px;
      --radius-md: 8px;
      --radius-lg: 12px;
      --font-mono: 'SF Mono', Monaco, 'Cascadia Code', monospace;
    }

    [data-theme="dark"] {
      --bg-primary: #0d1117;
      --bg-secondary: #161b22;
      --bg-tertiary: #21262d;
      --bg-hover: #21262d;
      --text-primary: #e6edf3;
      --text-secondary: #7d8590;
      --text-muted: #6e7681;
      --border-color: #30363d;
      --border-light: #21262d;
      --accent-blue: #2f81f7;
      --accent-green: #3fb950;
      --accent-red: #f85149;
      --accent-yellow: #d29922;
      --accent-orange: #db6d28;
      --accent-purple: #a371f7;
      --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
      --shadow-md: 0 3px 6px rgba(0, 0, 0, 0.4);
      --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.5);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
      background-color: var(--bg-secondary);
      color: var(--text-primary);
      line-height: 1.5;
      min-height: 100vh;
    }

    /* Header */
    .header {
      background: linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-blue) 100%);
      color: white;
      padding: 24px;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: var(--shadow-md);
    }

    .header-content {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .header h1 {
      font-size: 24px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-icon {
      width: 32px;
      height: 32px;
      background: rgba(255,255,255,0.2);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }

    .header-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .btn {
      padding: 8px 16px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-color);
      background: var(--bg-primary);
      color: var(--text-primary);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }

    .btn:hover {
      background: var(--bg-hover);
      border-color: var(--text-muted);
    }

    .btn-primary {
      background: var(--accent-blue);
      color: white;
      border-color: var(--accent-blue);
    }

    .btn-primary:hover {
      background: var(--accent-blue);
      opacity: 0.9;
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 12px;
    }

    /* Theme toggle */
    .theme-toggle {
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }

    .theme-toggle:hover {
      background: rgba(255,255,255,0.3);
    }

    /* Pipeline info bar */
    .pipeline-info {
      background: var(--bg-primary);
      border-bottom: 1px solid var(--border-color);
      padding: 12px 24px;
    }

    .pipeline-content {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
      font-size: 13px;
      color: var(--text-secondary);
    }

    .pipeline-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .pipeline-item strong {
      color: var(--text-primary);
    }

    /* Main container */
    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 24px;
    }

    /* Summary cards */
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .summary-card {
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 20px;
      box-shadow: var(--shadow-sm);
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .summary-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .summary-card .label {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-secondary);
      margin-bottom: 8px;
    }

    .summary-card .value {
      font-size: 32px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .summary-card .subtext {
      font-size: 13px;
      color: var(--text-muted);
      margin-top: 4px;
    }

    .summary-card.success { border-top: 3px solid var(--accent-green); }
    .summary-card.error { border-top: 3px solid var(--accent-red); }
    .summary-card.warning { border-top: 3px solid var(--accent-yellow); }
    .summary-card.info { border-top: 3px solid var(--accent-blue); }

    .summary-card.success .value { color: var(--accent-green); }
    .summary-card.error .value { color: var(--accent-red); }
    .summary-card.warning .value { color: var(--accent-yellow); }
    .summary-card.info .value { color: var(--accent-blue); }

    /* Filter bar */
    .filter-bar {
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 16px;
      margin-bottom: 24px;
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      align-items: center;
    }

    .filter-group {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .filter-label {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-secondary);
    }

    .filter-btn {
      padding: 6px 12px;
      border: 1px solid var(--border-color);
      background: var(--bg-secondary);
      color: var(--text-secondary);
      border-radius: var(--radius-md);
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .filter-btn:hover {
      background: var(--bg-hover);
      border-color: var(--text-muted);
    }

    .filter-btn.active {
      background: var(--accent-blue);
      color: white;
      border-color: var(--accent-blue);
    }

    .search-input {
      padding: 8px 12px;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      background: var(--bg-secondary);
      color: var(--text-primary);
      font-size: 13px;
      width: 240px;
    }

    .search-input:focus {
      outline: none;
      border-color: var(--accent-blue);
    }

    /* Sections */
    .section {
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      margin-bottom: 24px;
      overflow: hidden;
    }

    .section-header {
      padding: 16px 20px;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      transition: background 0.2s;
    }

    .section-header:hover {
      background: var(--bg-tertiary);
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .section-icon {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }

    .section-icon.success { background: rgba(26, 127, 55, 0.1); }
    .section-icon.error { background: rgba(207, 34, 46, 0.1); }
    .section-icon.warning { background: rgba(154, 103, 0, 0.1); }

    .section-name {
      font-size: 16px;
      font-weight: 600;
    }

    .section-meta {
      font-size: 13px;
      color: var(--text-secondary);
    }

    .section-badges {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .badge {
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }

    .badge.success {
      background: rgba(26, 127, 55, 0.1);
      color: var(--accent-green);
    }

    .badge.error {
      background: rgba(207, 34, 46, 0.1);
      color: var(--accent-red);
    }

    .badge.warning {
      background: rgba(154, 103, 0, 0.1);
      color: var(--accent-yellow);
    }

    .section-toggle {
      font-size: 12px;
      color: var(--text-secondary);
      transition: transform 0.2s;
    }

    .section.collapsed .section-toggle {
      transform: rotate(-90deg);
    }

    .section-content {
      padding: 20px;
    }

    .section.collapsed .section-content {
      display: none;
    }

    /* Tables */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }

    .data-table th {
      text-align: left;
      padding: 12px;
      font-weight: 600;
      color: var(--text-secondary);
      border-bottom: 1px solid var(--border-color);
      white-space: nowrap;
      cursor: pointer;
      user-select: none;
    }

    .data-table th:hover {
      color: var(--text-primary);
    }

    .data-table th .sort-icon {
      margin-left: 4px;
      opacity: 0.5;
    }

    .data-table th.sort-asc .sort-icon::after { content: '▲'; }
    .data-table th.sort-desc .sort-icon::after { content: '▼'; }

    .data-table td {
      padding: 12px;
      border-bottom: 1px solid var(--border-light);
      vertical-align: top;
    }

    .data-table tr:hover td {
      background: var(--bg-hover);
    }

    .data-table tr.hidden {
      display: none;
    }

    /* Status indicators */
    .status {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }

    .status::before {
      content: '';
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .status.success {
      background: rgba(26, 127, 55, 0.1);
      color: var(--accent-green);
    }

    .status.success::before {
      background: var(--accent-green);
    }

    .status.error {
      background: rgba(207, 34, 46, 0.1);
      color: var(--accent-red);
    }

    .status.error::before {
      background: var(--accent-red);
    }

    .status.warning {
      background: rgba(154, 103, 0, 0.1);
      color: var(--accent-yellow);
    }

    .status.warning::before {
      background: var(--accent-yellow);
    }

    /* Code/path display */
    .code {
      font-family: var(--font-mono);
      font-size: 12px;
      background: var(--bg-secondary);
      padding: 2px 6px;
      border-radius: var(--radius-sm);
      word-break: break-all;
    }

    .path-cell {
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* Expandable rows */
    .expandable-row {
      cursor: pointer;
    }

    .expandable-row .expand-icon {
      transition: transform 0.2s;
      display: inline-block;
      margin-right: 8px;
    }

    .expandable-row.expanded .expand-icon {
      transform: rotate(90deg);
    }

    .detail-row {
      display: none;
    }

    .detail-row.visible {
      display: table-row;
    }

    .detail-content {
      background: var(--bg-secondary);
      padding: 16px;
      border-radius: var(--radius-md);
      margin: 8px 0;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .detail-item {
      font-size: 13px;
    }

    .detail-item .label {
      color: var(--text-secondary);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .detail-item .value {
      color: var(--text-primary);
      font-family: var(--font-mono);
      word-break: break-all;
    }

    /* Visual regression grid */
    .visual-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
    }

    .visual-card {
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      overflow: hidden;
    }

    .visual-card-header {
      padding: 12px 16px;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .visual-card-title {
      font-weight: 600;
      font-size: 14px;
    }

    .visual-images {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      padding: 12px;
    }

    .visual-image-box {
      text-align: center;
    }

    .visual-image-box h4 {
      font-size: 11px;
      color: var(--text-secondary);
      margin-bottom: 8px;
      text-transform: uppercase;
    }

    .visual-image-box img {
      width: 100%;
      height: 120px;
      object-fit: cover;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-color);
      cursor: pointer;
      transition: transform 0.2s;
    }

    .visual-image-box img:hover {
      transform: scale(1.05);
    }

    .visual-diff-info {
      padding: 12px 16px;
      background: var(--bg-secondary);
      border-top: 1px solid var(--border-color);
      font-size: 13px;
    }

    /* Empty state */
    .empty-state {
      text-align: center;
      padding: 48px;
      color: var(--text-secondary);
    }

    .empty-state-icon {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        align-items: flex-start;
      }

      .summary-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .filter-bar {
        flex-direction: column;
        align-items: stretch;
      }

      .search-input {
        width: 100%;
      }

      .data-table {
        font-size: 12px;
      }

      .data-table th,
      .data-table td {
        padding: 8px;
      }

      .visual-grid {
        grid-template-columns: 1fr;
      }

      .visual-images {
        grid-template-columns: 1fr;
      }
    }

    /* Animations */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .section {
      animation: fadeIn 0.3s ease-out;
    }

    /* Scrollbar */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    ::-webkit-scrollbar-track {
      background: var(--bg-secondary);
    }

    ::-webkit-scrollbar-thumb {
      background: var(--border-color);
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: var(--text-muted);
    }
  </style>
</head>
<body>
  <header class="header">
    <div class="header-content">
      <h1>
        <span class="header-icon">📊</span>
        Validation Dashboard
      </h1>
      <div class="header-actions">
        <button class="btn btn-sm" onclick="exportJSON()">
          <span>📥</span> Export JSON
        </button>
        <button class="btn btn-sm" onclick="exportCSV()">
          <span>📄</span> Export CSV
        </button>
        <button class="theme-toggle" onclick="toggleTheme()" title="Toggle theme">
          <span id="theme-icon">🌙</span>
        </button>
      </div>
    </div>
  </header>

  <div class="pipeline-info">
    <div class="pipeline-content">
      <div class="pipeline-item">
        <span>⏱️</span>
        <span><strong>Generated:</strong> ${new Date(data.timestamp).toLocaleString()}</span>
      </div>
      <div class="pipeline-item">
        <span>📝</span>
        <span><strong>Commit:</strong> ${escapeHtml(gitCommit.substring(0, 8))}</span>
      </div>
      <div class="pipeline-item">
        <span>🌿</span>
        <span><strong>Branch:</strong> ${escapeHtml(gitBranch)}</span>
      </div>
      <div class="pipeline-item">
        <span>⏱️</span>
        <span><strong>Duration:</strong> ${formatDuration(pipelineDuration)}</span>
      </div>
    </div>
  </div>

  <main class="container">
    <!-- Summary Cards -->
    <div class="summary-grid">
      <div class="summary-card ${summary.failed === 0 ? 'success' : 'info'}">
        <div class="label">Total Tests</div>
        <div class="value">${summary.totalTests}</div>
        <div class="subtext">across all categories</div>
      </div>
      <div class="summary-card success">
        <div class="label">Passed</div>
        <div class="value">${summary.passed}</div>
        <div class="subtext">${summary.totalTests > 0 ? ((summary.passed / summary.totalTests) * 100).toFixed(1) : 0}% of total</div>
      </div>
      <div class="summary-card ${summary.failed > 0 ? 'error' : 'success'}">
        <div class="label">Failed</div>
        <div class="value">${summary.failed}</div>
        <div class="subtext">${summary.totalTests > 0 ? ((summary.failed / summary.totalTests) * 100).toFixed(1) : 0}% of total</div>
      </div>
      <div class="summary-card ${summary.warnings > 0 ? 'warning' : 'success'}">
        <div class="label">Warnings</div>
        <div class="value">${summary.warnings}</div>
        <div class="subtext">non-blocking issues</div>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="filter-bar">
      <div class="filter-group">
        <span class="filter-label">Show:</span>
        <button class="filter-btn active" onclick="filterStatus('all')">All</button>
        <button class="filter-btn" onclick="filterStatus('passed')">Passed</button>
        <button class="filter-btn" onclick="filterStatus('failed')">Failed</button>
      </div>
      <input type="text" class="search-input" placeholder="Search by name..." oninput="searchTable(this.value)">
    </div>

    <!-- Asset Integrity Section -->
    ${assetSection}

    <!-- CSS Comparison Section -->
    ${cssSection}

    <!-- Visual Regression Section -->
    ${visualSection}

    <!-- Live Validation Section -->
    ${liveSection}
  </main>

  <script>
    // Theme management
    function toggleTheme() {
      const html = document.documentElement;
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      document.getElementById('theme-icon').textContent = next === 'dark' ? '☀️' : '🌙';
      localStorage.setItem('dashboard-theme', next);
    }

    // Load saved theme
    const savedTheme = localStorage.getItem('dashboard-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.getElementById('theme-icon').textContent = savedTheme === 'dark' ? '☀️' : '🌙';

    // Section collapse/expand
    function toggleSection(id) {
      const section = document.getElementById(id);
      section.classList.toggle('collapsed');
    }

    // Expandable rows
    function toggleRow(row) {
      row.classList.toggle('expanded');
      const detailRow = row.nextElementSibling;
      if (detailRow && detailRow.classList.contains('detail-row')) {
        detailRow.classList.toggle('visible');
      }
    }

    // Filter by status
    function filterStatus(status) {
      // Update active button
      document.querySelectorAll('.filter-bar .filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase().includes(status) || (status === 'all' && btn.textContent === 'All')) {
          btn.classList.add('active');
        }
      });

      // Filter all tables
      document.querySelectorAll('.data-table tbody tr').forEach(row => {
        if (row.classList.contains('detail-row')) return;
        
        const statusCell = row.querySelector('.status');
        if (!statusCell) return;

        const rowStatus = statusCell.classList.contains('success') ? 'passed' :
                         statusCell.classList.contains('error') ? 'failed' : 'other';

        if (status === 'all' || rowStatus === status) {
          row.classList.remove('hidden');
        } else {
          row.classList.add('hidden');
        }
      });
    }

    // Search table
    function searchTable(query) {
      const lowerQuery = query.toLowerCase();
      document.querySelectorAll('.data-table tbody tr').forEach(row => {
        if (row.classList.contains('detail-row')) return;
        
        const text = row.textContent.toLowerCase();
        if (text.includes(lowerQuery)) {
          row.classList.remove('hidden');
        } else {
          row.classList.add('hidden');
        }
      });
    }

    // Table sorting
    function sortTable(tableId, colIndex) {
      const table = document.getElementById(tableId);
      const tbody = table.querySelector('tbody');
      const rows = Array.from(tbody.querySelectorAll('tr:not(.detail-row)'));
      const th = table.querySelectorAll('th')[colIndex];
      
      // Toggle sort direction
      const isAsc = !th.classList.contains('sort-asc');
      table.querySelectorAll('th').forEach(h => h.classList.remove('sort-asc', 'sort-desc'));
      th.classList.add(isAsc ? 'sort-asc' : 'sort-desc');

      rows.sort((a, b) => {
        const aVal = a.cells[colIndex]?.textContent.trim() || '';
        const bVal = b.cells[colIndex]?.textContent.trim() || '';
        
        // Try numeric sort
        const aNum = parseFloat(aVal);
        const bNum = parseFloat(bVal);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return isAsc ? aNum - bNum : bNum - aNum;
        }
        
        return isAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      });

      rows.forEach(row => tbody.appendChild(row));
    }

    // Export to JSON
    function exportJSON() {
      const data = ${JSON.stringify({ ...data, summary })};
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'validation-report.json';
      a.click();
      URL.revokeObjectURL(url);
    }

    // Export to CSV
    function exportCSV() {
      let csv = 'Category,Item,Status,Details\\n';
      
      // Asset integrity
      ${data.assetIntegrity ? `
      ${JSON.stringify(data.assetIntegrity.results || [])}.forEach(r => {
        csv += 'Asset Integrity,' + r.localPath + ',' + r.status + ',' + (r.error || '') + '\\n';
      });
      ` : ''}
      
      // CSS comparison
      ${data.cssComparison ? `
      ${JSON.stringify(data.cssComparison.comparisons || [])}.forEach(c => {
        csv += 'CSS Comparison,' + c.element + ',' + c.status + ',' + (c.mismatches?.length || 0) + ' mismatches\\n';
      });
      ` : ''}
      
      // Visual regression
      ${data.visualRegression ? `
      ${JSON.stringify(data.visualRegression.results || [])}.forEach(r => {
        csv += 'Visual Regression,' + r.page + '-' + r.viewport + ',' + (r.passed ? 'passed' : 'failed') + ',' + r.diffPercent.toFixed(2) + '% diff\\n';
      });
      ` : ''}

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'validation-report.csv';
      a.click();
      URL.revokeObjectURL(url);
    }

    // Image modal
    function showImageModal(src) {
      const modal = document.createElement('div');
      modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.9);display:flex;align-items:center;justify-content:center;z-index:1000;cursor:zoom-out;';
      modal.innerHTML = '<img src="' + src + '" style="max-width:90%;max-height:90%;object-fit:contain;">';
      modal.onclick = () => modal.remove();
      document.body.appendChild(modal);
    }

    // Add click handlers to images
    document.querySelectorAll('.visual-image-box img').forEach(img => {
      img.addEventListener('click', () => showImageModal(img.src));
    });
  </script>
</body>
</html>`;
}

/**
 * Generate Asset Integrity section
 */
function generateAssetSection(data) {
  if (!data) {
    return generateEmptySection('asset-integrity', 'Asset Integrity', '🔐');
  }

  const results = data.results || [];
  const passed = results.filter(r => r.status === 'passed').length;
  const failed = results.filter(r => r.status === 'failed').length;

  const rows = results.map((r, i) => {
    const statusClass = r.status === 'passed' ? 'success' : 'error';
    const statusText = r.status === 'passed' ? 'Passed' : 'Failed';
    
    return `
      <tr class="expandable-row" onclick="toggleRow(this)">
        <td><span class="expand-icon">▶</span></td>
        <td class="path-cell" title="${escapeHtml(r.localPath)}">
          <span class="code">${escapeHtml(r.localPath)}</span>
        </td>
        <td>${escapeHtml(r.category || 'unknown')}</td>
        <td>${formatBytes(r.size || 0)}</td>
        <td><span class="status ${statusClass}">${statusText}</span></td>
      </tr>
      <tr class="detail-row">
        <td colspan="5">
          <div class="detail-content">
            <div class="detail-grid">
              <div class="detail-item">
                <div class="label">Original URL</div>
                <div class="value">${escapeHtml(r.originalUrl || 'N/A')}</div>
              </div>
              <div class="detail-item">
                <div class="label">HTTP Status</div>
                <div class="value">${r.httpStatus || 'N/A'}</div>
              </div>
              <div class="detail-item">
                <div class="label">Hash Match</div>
                <div class="value">${r.hashMatch ? '✓ Yes' : '✗ No'}</div>
              </div>
              ${r.error ? `
              <div class="detail-item">
                <div class="label">Error</div>
                <div class="value" style="color: var(--accent-red);">${escapeHtml(r.error)}</div>
              </div>
              ` : ''}
            </div>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <section class="section" id="asset-integrity">
      <div class="section-header" onclick="toggleSection('asset-integrity')">
        <div class="section-title">
          <div class="section-icon ${failed === 0 ? 'success' : 'error'}">🔐</div>
          <div>
            <div class="section-name">Asset Integrity</div>
            <div class="section-meta">${results.length} assets validated</div>
          </div>
        </div>
        <div class="section-badges">
          <span class="badge success">${passed} passed</span>
          ${failed > 0 ? `<span class="badge error">${failed} failed</span>` : ''}
          <span class="section-toggle">▼</span>
        </div>
      </div>
      <div class="section-content">
        <table class="data-table" id="asset-table">
          <thead>
            <tr>
              <th style="width: 30px;"></th>
              <th onclick="sortTable('asset-table', 1)">Path <span class="sort-icon">↕</span></th>
              <th onclick="sortTable('asset-table', 2)">Category <span class="sort-icon">↕</span></th>
              <th onclick="sortTable('asset-table', 3)">Size <span class="sort-icon">↕</span></th>
              <th onclick="sortTable('asset-table', 4)">Status <span class="sort-icon">↕</span></th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

/**
 * Generate CSS Comparison section
 */
function generateCssSection(data) {
  if (!data) {
    return generateEmptySection('css-comparison', 'CSS Comparison', '🎨');
  }

  const comparisons = data.comparisons || [];
  const matches = comparisons.filter(c => c.status === 'match').length;
  const mismatches = comparisons.filter(c => c.status === 'mismatch').length;
  const missing = comparisons.filter(c => c.status === 'missing').length;

  const rows = comparisons.map(c => {
    const statusClass = c.status === 'match' ? 'success' : c.status === 'missing' ? 'warning' : 'error';
    const statusText = c.status === 'match' ? 'Match' : c.status === 'missing' ? 'Missing' : 'Mismatch';
    const mismatchCount = c.mismatches?.length || 0;

    return `
      <tr class="expandable-row" onclick="toggleRow(this)">
        <td><span class="expand-icon">▶</span></td>
        <td><code>${escapeHtml(c.element)}</code></td>
        <td>${escapeHtml(c.name)}</td>
        <td>${mismatchCount}</td>
        <td><span class="status ${statusClass}">${statusText}</span></td>
      </tr>
      <tr class="detail-row">
        <td colspan="5">
          <div class="detail-content">
            ${c.mismatches?.length > 0 ? `
              <h4 style="margin-bottom: 12px; font-size: 13px; color: var(--text-secondary);">Mismatched Properties</h4>
              <table class="data-table" style="margin-bottom: 16px;">
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Source Value</th>
                    <th>Replica Value</th>
                  </tr>
                </thead>
                <tbody>
                  ${c.mismatches.map(m => `
                    <tr>
                      <td><code>${escapeHtml(m.style)}</code></td>
                      <td style="color: var(--accent-blue);">${escapeHtml(m.source)}</td>
                      <td style="color: var(--accent-orange);">${escapeHtml(m.replica)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : ''}
            <div class="detail-grid">
              <div class="detail-item">
                <div class="label">Source URL</div>
                <div class="value">${escapeHtml(data.sourceUrl)}</div>
              </div>
              <div class="detail-item">
                <div class="label">Replica URL</div>
                <div class="value">${escapeHtml(data.replicaUrl)}</div>
              </div>
            </div>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <section class="section" id="css-comparison">
      <div class="section-header" onclick="toggleSection('css-comparison')">
        <div class="section-title">
          <div class="section-icon ${mismatches === 0 ? 'success' : 'error'}">🎨</div>
          <div>
            <div class="section-name">CSS Comparison</div>
            <div class="section-meta">${comparisons.length} elements compared</div>
          </div>
        </div>
        <div class="section-badges">
          <span class="badge success">${matches} matches</span>
          ${mismatches > 0 ? `<span class="badge error">${mismatches} mismatches</span>` : ''}
          ${missing > 0 ? `<span class="badge warning">${missing} missing</span>` : ''}
          <span class="section-toggle">▼</span>
        </div>
      </div>
      <div class="section-content">
        <table class="data-table" id="css-table">
          <thead>
            <tr>
              <th style="width: 30px;"></th>
              <th onclick="sortTable('css-table', 1)">Selector <span class="sort-icon">↕</span></th>
              <th onclick="sortTable('css-table', 2)">Name <span class="sort-icon">↕</span></th>
              <th onclick="sortTable('css-table', 3)">Mismatches <span class="sort-icon">↕</span></th>
              <th onclick="sortTable('css-table', 4)">Status <span class="sort-icon">↕</span></th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

/**
 * Generate Visual Regression section
 */
async function generateVisualSection(data, config) {
  if (!data) {
    return generateEmptySection('visual-regression', 'Visual Regression', '📸');
  }

  const results = data.results || [];
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  // Group by page
  const byPage = {};
  results.forEach(r => {
    if (!byPage[r.page]) byPage[r.page] = [];
    byPage[r.page].push(r);
  });

  const visualCards = await Promise.all(Object.entries(byPage).map(async ([page, pageResults]) => {
    const cards = await Promise.all(pageResults.map(async r => {
      const statusClass = r.passed ? 'success' : 'error';
      const diffPercent = r.diffPercent?.toFixed(2) || '0.00';
      
      // Get image paths
      const basePath = path.join(config.inputDir, 'visual-regression');
      const baselinePath = path.join(basePath, path.basename(r.baselinePath || ''));
      const replicaPath = path.join(basePath, path.basename(r.replicaPath || ''));
      const diffPath = path.join(basePath, path.basename(r.diffPath || ''));
      
      // Embed images if requested
      let baselineSrc = path.basename(baselinePath);
      let replicaSrc = path.basename(replicaPath);
      let diffSrc = path.basename(diffPath);
      
      if (config.embedImages) {
        const [baseline64, replica64, diff64] = await Promise.all([
          imageToBase64(baselinePath),
          imageToBase64(replicaPath),
          imageToBase64(diffPath)
        ]);
        if (baseline64) baselineSrc = baseline64;
        if (replica64) replicaSrc = replica64;
        if (diff64) diffSrc = diff64;
      }

      return `
        <div class="visual-card">
          <div class="visual-card-header">
            <span class="visual-card-title">${escapeHtml(r.viewport)}</span>
            <span class="status ${statusClass}">${r.passed ? 'Pass' : 'Fail'}</span>
          </div>
          <div class="visual-images">
            <div class="visual-image-box">
              <h4>Baseline</h4>
              <img src="${escapeHtml(baselineSrc)}" alt="Baseline" loading="lazy" onerror="this.style.display='none'">
            </div>
            <div class="visual-image-box">
              <h4>Replica</h4>
              <img src="${escapeHtml(replicaSrc)}" alt="Replica" loading="lazy" onerror="this.style.display='none'">
            </div>
            <div class="visual-image-box">
              <h4>Diff</h4>
              <img src="${escapeHtml(diffSrc)}" alt="Diff" loading="lazy" onerror="this.style.display='none'">
            </div>
          </div>
          <div class="visual-diff-info">
            <strong>${diffPercent}%</strong> different
            ${r.diffPixels ? `(${r.diffPixels.toLocaleString()} pixels)` : ''}
            ${r.error ? `<div style="color: var(--accent-red); margin-top: 4px;">${escapeHtml(r.error)}</div>` : ''}
          </div>
        </div>
      `;
    }));

    return `
      <div style="margin-bottom: 24px;">
        <h3 style="margin-bottom: 12px; font-size: 16px; text-transform: capitalize;">${escapeHtml(page)}</h3>
        <div class="visual-grid">
          ${cards.join('')}
        </div>
      </div>
    `;
  }));

  return `
    <section class="section" id="visual-regression">
      <div class="section-header" onclick="toggleSection('visual-regression')">
        <div class="section-title">
          <div class="section-icon ${failed === 0 ? 'success' : 'error'}">📸</div>
          <div>
            <div class="section-name">Visual Regression</div>
            <div class="section-meta">${results.length} screenshots compared</div>
          </div>
        </div>
        <div class="section-badges">
          <span class="badge success">${passed} passed</span>
          ${failed > 0 ? `<span class="badge error">${failed} failed</span>` : ''}
          <span class="section-toggle">▼</span>
        </div>
      </div>
      <div class="section-content">
        ${visualCards.join('')}
      </div>
    </section>
  `;
}

/**
 * Generate Live Validation section
 */
function generateLiveSection(data) {
  if (!data) {
    return generateEmptySection('live-validation', 'Live Validation', '🌐');
  }

  const checks = data.checks || [];
  const passed = checks.filter(c => c.status === 'passed').length;
  const failed = checks.filter(c => c.status === 'failed').length;

  const rows = checks.map(c => {
    const statusClass = c.status === 'passed' ? 'success' : 'error';
    const statusText = c.status === 'passed' ? 'Passed' : 'Failed';

    return `
      <tr>
        <td>${escapeHtml(c.name || 'Unknown')}</td>
        <td><code>${escapeHtml(c.url || 'N/A')}</code></td>
        <td>${c.statusCode || 'N/A'}</td>
        <td>${c.responseTime ? c.responseTime + 'ms' : 'N/A'}</td>
        <td><span class="status ${statusClass}">${statusText}</span></td>
      </tr>
    `;
  }).join('');

  return `
    <section class="section" id="live-validation">
      <div class="section-header" onclick="toggleSection('live-validation')">
        <div class="section-title">
          <div class="section-icon ${failed === 0 ? 'success' : 'error'}">🌐</div>
          <div>
            <div class="section-name">Live Validation</div>
            <div class="section-meta">${checks.length} deployment checks</div>
          </div>
        </div>
        <div class="section-badges">
          <span class="badge success">${passed} passed</span>
          ${failed > 0 ? `<span class="badge error">${failed} failed</span>` : ''}
          <span class="section-toggle">▼</span>
        </div>
      </div>
      <div class="section-content">
        <table class="data-table" id="live-table">
          <thead>
            <tr>
              <th onclick="sortTable('live-table', 0)">Check <span class="sort-icon">↕</span></th>
              <th onclick="sortTable('live-table', 1)">URL <span class="sort-icon">↕</span></th>
              <th onclick="sortTable('live-table', 2)">Status Code <span class="sort-icon">↕</span></th>
              <th onclick="sortTable('live-table', 3)">Response Time <span class="sort-icon">↕</span></th>
              <th onclick="sortTable('live-table', 4)">Status <span class="sort-icon">↕</span></th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No live validation data available</td></tr>'}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

/**
 * Generate empty section placeholder
 */
function generateEmptySection(id, title, icon) {
  return `
    <section class="section collapsed" id="${id}">
      <div class="section-header" onclick="toggleSection('${id}')">
        <div class="section-title">
          <div class="section-icon warning">${icon}</div>
          <div>
            <div class="section-name">${title}</div>
            <div class="section-meta">No data available</div>
          </div>
        </div>
        <div class="section-badges">
          <span class="badge warning">No data</span>
          <span class="section-toggle">▼</span>
        </div>
      </div>
      <div class="section-content">
        <div class="empty-state">
          <div class="empty-state-icon">📭</div>
          <p>No validation data found for this section.</p>
          <p style="font-size: 13px; margin-top: 8px;">Run the validation script to generate data.</p>
        </div>
      </div>
    </section>
  `;
}

/**
 * Main function
 */
async function main() {
  const config = parseArgs();

  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║     Unified Validation Dashboard Generator             ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log(`\nInput: ${config.inputDir}`);
  console.log(`Output: ${config.outputDir}`);
  console.log(`Embed Images: ${config.embedImages ? 'Yes' : 'No'}`);

  try {
    // Aggregate validation data
    console.log('\n📊 Aggregating validation data...');
    const data = await aggregateValidationData(config);

    // Calculate summary
    const summary = calculateSummary(data);

    console.log(`\nFound validation data:`);
    console.log(`  - Asset Integrity: ${data.assetIntegrity ? '✓' : '✗'}`);
    console.log(`  - CSS Comparison: ${data.cssComparison ? '✓' : '✗'}`);
    console.log(`  - Visual Regression: ${data.visualRegression ? '✓' : '✗'}`);
    console.log(`  - Live Validation: ${data.liveValidation ? '✓' : '✗'}`);

    // Generate dashboard HTML
    console.log('\n🎨 Generating dashboard...');
    const html = await generateDashboard(data, summary, config);

    // Create output directory
    await fs.mkdir(config.outputDir, { recursive: true });

    // Write dashboard
    const outputPath = path.join(config.outputDir, 'index.html');
    await fs.writeFile(outputPath, html);

    console.log(`\n✓ Dashboard generated: ${outputPath}`);

    // Print summary
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║                    SUMMARY                             ║');
    console.log('╠════════════════════════════════════════════════════════╣');
    console.log(`║ Total Tests:  ${summary.totalTests.toString().padEnd(39)} ║`);
    console.log(`║ Passed:       ${summary.passed.toString().padEnd(39)} ║`);
    console.log(`║ Failed:       ${summary.failed.toString().padEnd(39)} ║`);
    console.log(`║ Warnings:     ${summary.warnings.toString().padEnd(39)} ║`);
    console.log(`║ Pass Rate:    ${(summary.passRate + '%').padEnd(39)} ║`);
    console.log('╚════════════════════════════════════════════════════════╝');

    // Exit with appropriate code
    process.exit(summary.failed > 0 ? 1 : 0);

  } catch (error) {
    console.error('\n✗ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run main
main();
