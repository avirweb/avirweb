#!/usr/bin/env node

/**
 * Asset Validator and Repair System
 * 
 * Validates all assets in the site/ directory, checks for broken images,
 * missing files, and incorrect paths. Automatically repairs issues by
 * re-downloading from original site. Generates detailed validation reports.
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

// Configuration
const CONFIG = {
  SITE_DIR: path.join(__dirname, '..', 'site'),
  ORIGINAL_URL: 'https://www.avir.com',
  MAX_RETRIES: 3,
  REQUEST_TIMEOUT: 30000,
  CONCURRENT_DOWNLOADS: 5,
  VALIDATION_REPORT: path.join(__dirname, '..', '.sisyphus', 'validation-report.json'),
  REPAIR_REPORT: path.join(__dirname, '..', '.sisyphus', 'repair-report.json')
};

// Image file signatures (magic numbers)
const IMAGE_SIGNATURES = {
  // JPEG
  '\xff\xd8\xff': 'jpeg',
  // PNG
  '\x89PNG\r\n\x1a\n': 'png',
  // GIF
  'GIF87a': 'gif',
  'GIF89a': 'gif',
  // WebP
  'RIFF': 'webp',
  // SVG (starts with <svg or <?xml)
  '<svg': 'svg',
  '<?xml': 'svg',
  '<!DO': 'svg'
};

// Font file signatures
const FONT_SIGNATURES = {
  // WOFF
  'wOFF': 'woff',
  // WOFF2
  'wOF2': 'woff2',
  // TTF/OTF
  '\x00\x01\x00\x00': 'ttf',
  'OTTO': 'otf',
  // EOT
  '\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00LP': 'eot'
};

// Known corrupted files (from previous analysis)
const KNOWN_CORRUPTED_FILES = [
  '/cdn/61aeaa63fc373a25c198ab33/634f160c4aab386bffbdfdce_Completed_Home%20cinema.svg',
  '/cdn/61aeaa63fc373a25c198ab33/63321d325eb1364b8722e824_Completed_Whole%20Home%20AV.svg',
  '/cdn/61aeaa63fc373a25c198ab33/634f160c97b2f503eb935fb2_Completed_Lighting.svg',
  '/cdn/61aeaa63fc373a25c198ab33/634f160cedac82047c722def_Completed_Shades.svg',
  '/cdn/61aeaa63fc373a25c198ab33/634f160c5d6872332aea763f_Completed_Hone%20Audio.svg',
  '/cdn/61aeaa63fc373a25c198ab33/634f160c5365780db863f458_Completed_Security.svg',
  '/cdn/61aeaa63fc373a25c198ab33/634f160c36574a4d3de12ac3_Completed_Networkibng.svg',
  '/cdn/61aeaa63fc373a25c198ab33/627031527309863b09abc49b_Shutterstock%20Partners%20Pic%20220502.jpg'
];

// Statistics
const stats = {
  totalFiles: 0,
  validFiles: 0,
  invalidFiles: 0,
  missingFiles: 0,
  repairedFiles: 0,
  failedRepairs: 0,
  skippedFiles: 0
};

// Report data
const report = {
  timestamp: new Date().toISOString(),
  validations: [],
  repairs: [],
  errors: []
};

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    validateOnly: false,
    repairOnly: null,
    verbose: false,
    dryRun: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--validate-only':
        config.validateOnly = true;
        break;
      case '--file':
      case '-f':
        config.repairOnly = args[++i];
        break;
      case '--verbose':
      case '-v':
        config.verbose = true;
        break;
      case '--dry-run':
        config.dryRun = true;
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
╔════════════════════════════════════════════════════════════════╗
║         Asset Validator and Repair System                      ║
╚════════════════════════════════════════════════════════════════╝

Usage: node scripts/validate-and-repair.js [options]

Options:
  --validate-only    Only validate, do not repair
  --file <path>      Repair specific file only
  --dry-run          Show what would be done without making changes
  --verbose          Enable verbose output
  --help             Show this help message

Examples:
  # Validate only
  node scripts/validate-and-repair.js --validate-only

  # Validate and repair
  node scripts/validate-and-repair.js

  # Repair specific file
  node scripts/validate-and-repair.js --file site/cdn/path/to/file.svg

  # Dry run
  node scripts/validate-and-repair.js --dry-run
`);
}

/**
 * Walk directory recursively and yield all files
 */
async function* walkDirectory(dir, extensions = null) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Skip common non-asset directories
      if (['node_modules', '.git', '.sisyphus', 'test-results'].includes(entry.name)) {
        continue;
      }
      yield* walkDirectory(fullPath, extensions);
    } else if (entry.isFile()) {
      if (!extensions || extensions.some(ext => entry.name.endsWith(ext))) {
        yield fullPath;
      }
    }
  }
}

/**
 * Check if file has valid image signature
 */
function isValidImage(buffer, extension) {
  if (!buffer || buffer.length === 0) return false;
  
  const header = buffer.toString('utf8', 0, Math.min(100, buffer.length));
  const firstBytes = buffer.toString('binary', 0, Math.min(20, buffer.length));
  
  // Check for HTML content in image files (corruption indicator)
  if (extension && !['svg', 'xml'].includes(extension.toLowerCase())) {
    const htmlSignatures = ['<!DOCTYPE', '<html', '<head', '<body', '<div', '<script'];
    if (htmlSignatures.some(sig => header.toLowerCase().includes(sig.toLowerCase()))) {
      return { valid: false, reason: 'Contains HTML content (corrupted)' };
    }
  }
  
  // Extension-specific validation
  const ext = (extension || '').toLowerCase();
  
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      if (!buffer.slice(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) {
        return { valid: false, reason: 'Invalid JPEG header' };
      }
      break;
      
    case 'png':
      if (!buffer.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
        return { valid: false, reason: 'Invalid PNG header' };
      }
      break;
      
    case 'gif':
      const gifSig = buffer.slice(0, 6).toString('ascii');
      if (gifSig !== 'GIF87a' && gifSig !== 'GIF89a') {
        return { valid: false, reason: 'Invalid GIF header' };
      }
      break;
      
    case 'webp':
      if (!buffer.slice(0, 4).toString('ascii').startsWith('RIFF')) {
        return { valid: false, reason: 'Invalid WebP header' };
      }
      break;
      
    case 'svg':
      // SVG should start with <svg or <?xml or contain SVG namespace
      const svgHeader = header.toLowerCase().trim();
      if (!svgHeader.includes('<svg') && !svgHeader.includes('<?xml')) {
        return { valid: false, reason: 'Invalid SVG content' };
      }
      break;
      
    default:
      // Unknown extension, try to detect from content
      break;
  }
  
  return { valid: true };
}

/**
 * Check if file has valid font signature
 */
function isValidFont(buffer, extension) {
  if (!buffer || buffer.length === 0) return { valid: false, reason: 'Empty file' };
  
  const ext = (extension || '').toLowerCase();
  
  switch (ext) {
    case 'woff':
      if (buffer.slice(0, 4).toString('ascii') !== 'wOFF') {
        return { valid: false, reason: 'Invalid WOFF header' };
      }
      break;
      
    case 'woff2':
      if (buffer.slice(0, 4).toString('ascii') !== 'wOF2') {
        return { valid: false, reason: 'Invalid WOFF2 header' };
      }
      break;
      
    case 'ttf':
      if (!buffer.slice(0, 4).equals(Buffer.from([0x00, 0x01, 0x00, 0x00])) &&
          !buffer.slice(0, 4).equals(Buffer.from('true', 'ascii'))) {
        return { valid: false, reason: 'Invalid TTF header' };
      }
      break;
      
    case 'otf':
      if (buffer.slice(0, 4).toString('ascii') !== 'OTTO') {
        return { valid: false, reason: 'Invalid OTF header' };
      }
      break;
      
    case 'eot':
      // EOT files have complex header, just check size for now
      if (buffer.length < 32) {
        return { valid: false, reason: 'EOT file too small' };
      }
      break;
      
    default:
      break;
  }
  
  return { valid: true };
}

/**
 * Extract asset references from HTML content
 */
function extractHtmlAssets(content, basePath) {
  const assets = [];
  
  // src attributes
  const srcRegex = /src=["']([^"']+)["']/gi;
  let match;
  while ((match = srcRegex.exec(content)) !== null) {
    assets.push({ type: 'src', url: match[1], context: 'html' });
  }
  
  // href attributes (excluding stylesheets handled separately)
  const hrefRegex = /href=["']([^"']+\.(?:png|jpe?g|gif|svg|webp|ico|pdf))["']/gi;
  while ((match = hrefRegex.exec(content)) !== null) {
    assets.push({ type: 'href', url: match[1], context: 'html' });
  }
  
  // srcset attributes
  const srcsetRegex = /srcset=["']([^"']+)["']/gi;
  while ((match = srcsetRegex.exec(content)) !== null) {
    const urls = match[1].split(',').map(s => s.trim().split(' ')[0]);
    urls.forEach(url => assets.push({ type: 'srcset', url, context: 'html' }));
  }
  
  // poster attributes (video thumbnails)
  const posterRegex = /poster=["']([^"']+)["']/gi;
  while ((match = posterRegex.exec(content)) !== null) {
    assets.push({ type: 'poster', url: match[1], context: 'html' });
  }
  
  // data-src attributes (lazy loading)
  const dataSrcRegex = /data-src=["']([^"']+)["']/gi;
  while ((match = dataSrcRegex.exec(content)) !== null) {
    assets.push({ type: 'data-src', url: match[1], context: 'html' });
  }
  
  // Inline styles with url()
  const inlineStyleRegex = /style=["'][^"']*url\(["']?([^"')]+)["']?\)[^"']*["']/gi;
  while ((match = inlineStyleRegex.exec(content)) !== null) {
    assets.push({ type: 'inline-style', url: match[1], context: 'html' });
  }
  
  return assets;
}

/**
 * Extract asset references from CSS content
 */
function extractCssAssets(content) {
  const assets = [];
  
  // background-image, background, and other url() references
  const urlRegex = /url\(["']?([^"')]+)["']?\)/gi;
  let match;
  while ((match = urlRegex.exec(content)) !== null) {
    assets.push({ type: 'url', url: match[1], context: 'css' });
  }
  
  // @font-face src
  const fontSrcRegex = /@font-face\s*\{[^}]*src:\s*[^}]+\}/gi;
  const fontFaceMatches = content.match(fontSrcRegex) || [];
  
  fontFaceMatches.forEach(fontFace => {
    const fontUrls = fontFace.match(/url\(["']?([^"')]+)["']?\)/gi) || [];
    fontUrls.forEach(url => {
      const cleanUrl = url.replace(/url\(["']?/, '').replace(/["']?\)$/, '');
      assets.push({ type: 'font-src', url: cleanUrl, context: 'css' });
    });
  });
  
  return assets;
}

/**
 * Resolve a URL to a local file path
 */
function resolveLocalPath(url, baseDir) {
  // Remove query parameters and hash
  const cleanUrl = url.split('?')[0].split('#')[0];
  
  // Handle absolute paths
  if (cleanUrl.startsWith('/')) {
    return path.join(CONFIG.SITE_DIR, cleanUrl);
  }
  
  // Handle protocol-relative URLs (skip these)
  if (cleanUrl.startsWith('//')) {
    return null;
  }
  
  // Handle relative paths
  if (baseDir) {
    // Make sure we're resolving within the site directory
    const resolved = path.resolve(baseDir, cleanUrl);
    if (!resolved.startsWith(CONFIG.SITE_DIR)) {
      // Path resolved outside site dir, treat as absolute within site
      return path.join(CONFIG.SITE_DIR, cleanUrl);
    }
    return resolved;
  }
  
  return path.join(CONFIG.SITE_DIR, cleanUrl);
}

/**
 * Check if URL is external
 */
function isExternalUrl(url) {
  return url.startsWith('http://') || 
         url.startsWith('https://') || 
         url.startsWith('//') ||
         url.startsWith('data:');
}

/**
 * Download file from URL with retry logic
 */
async function downloadFile(url, outputPath, retries = CONFIG.MAX_RETRIES) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      timeout: CONFIG.REQUEST_TIMEOUT,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': CONFIG.ORIGINAL_URL
      }
    };

    const request = client.request(options, async (response) => {
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        const redirectUrl = new URL(response.headers.location, url).toString();
        console.log(`  ↳ Following redirect to: ${redirectUrl}`);
        try {
          const result = await downloadFile(redirectUrl, outputPath, retries);
          resolve(result);
        } catch (error) {
          reject(error);
        }
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }

      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', async () => {
        const buffer = Buffer.concat(chunks);
        
        // Ensure directory exists
        await fs.mkdir(path.dirname(outputPath), { recursive: true });
        
        // Write file
        await fs.writeFile(outputPath, buffer);
        
        resolve({
          success: true,
          size: buffer.length,
          contentType: response.headers['content-type']
        });
      });
    });

    request.on('error', async (error) => {
      if (retries > 0) {
        console.log(`  ⚠ Download failed, retrying... (${retries} attempts left)`);
        await new Promise(r => setTimeout(r, 1000));
        try {
          const result = await downloadFile(url, outputPath, retries - 1);
          resolve(result);
        } catch (retryError) {
          reject(retryError);
        }
      } else {
        reject(error);
      }
    });

    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });

    request.end();
  });
}

/**
 * Normalize a path that may contain local filesystem artifacts
 * Returns { cleanPath, wasMalformed }
 */
function normalizeLocalPath(localPath) {
  let cleanPath = localPath;
  let wasMalformed = false;
  
  // Remove common local path artifacts like /home/agent/avir/ or ../home/agent/avir/
  const localArtifacts = [
    /\/home\/agent\/avir\//g,
    /\.\.\/home\/agent\/avir\//g,
    /home\/agent\/avir\//g
  ];
  
  for (const artifact of localArtifacts) {
    if (artifact.test(cleanPath)) {
      cleanPath = cleanPath.replace(artifact, '');
      wasMalformed = true;
    }
  }
  
  return { cleanPath, wasMalformed };
}

/**
 * Repair a single asset file
 */
async function repairAsset(localPath, originalUrl, options = {}) {
  const { dryRun = false, verbose = false } = options;
  
  // Normalize the path to remove local filesystem artifacts
  const { cleanPath, wasMalformed } = normalizeLocalPath(localPath);
  if (wasMalformed) {
    localPath = cleanPath;
    if (!path.isAbsolute(localPath)) {
      localPath = path.join(CONFIG.SITE_DIR, localPath);
    }
  }
  
  // Build original URL if not provided
  if (!originalUrl) {
    // Try to determine original URL from local path
    const relativePath = path.relative(CONFIG.SITE_DIR, localPath);
    originalUrl = `${CONFIG.ORIGINAL_URL}/${relativePath}`;
  }
  
  // Also clean up the original URL if it contains artifacts
  const { cleanPath: cleanUrl } = normalizeLocalPath(originalUrl);
  if (cleanUrl !== originalUrl) {
    originalUrl = cleanUrl;
  }
  
  console.log(`  🔧 Repairing: ${path.relative(CONFIG.SITE_DIR, localPath)}`);
  console.log(`  📥 Source: ${originalUrl}`);
  
  if (dryRun) {
    console.log(`  ✓ Would download (dry run)`);
    return { success: true, dryRun: true };
  }
  
  try {
    const result = await downloadFile(originalUrl, localPath);
    console.log(`  ✓ Downloaded (${result.size} bytes)`);
    return { success: true, size: result.size };
  } catch (error) {
    console.log(`  ✗ Download failed: ${error.message}`);
    
    // Try alternative URLs
    const alternatives = [
      originalUrl.replace(' ', '%20'),
      originalUrl.replace(/%20/g, ' '),
      encodeURI(originalUrl)
    ];
    
    for (const altUrl of alternatives) {
      if (altUrl === originalUrl) continue;
      
      try {
        console.log(`  🔄 Trying alternative: ${altUrl}`);
        const result = await downloadFile(altUrl, localPath);
        console.log(`  ✓ Downloaded from alternative (${result.size} bytes)`);
        return { success: true, size: result.size, alternative: true };
      } catch (altError) {
        // Continue to next alternative
      }
    }
    
    return { success: false, error: error.message };
  }
}

/**
 * Validate a single file
 */
async function validateFile(filePath, options = {}) {
  const { dryRun = false, verbose = false } = options;
  const relativePath = path.relative(CONFIG.SITE_DIR, filePath);
  const ext = path.extname(filePath).toLowerCase().replace('.', '');
  
  stats.totalFiles++;
  
  try {
    // Check if file exists
    const stats = await fs.stat(filePath);
    
    if (stats.size === 0) {
      return {
        valid: false,
        file: relativePath,
        error: 'Empty file (0 bytes)',
        shouldRepair: true
      };
    }
    
    // Read first few KB for validation
    const buffer = await fs.readFile(filePath);
    const firstBytes = buffer.toString('utf8', 0, Math.min(500, buffer.length));
    
    // Check for HTML content corruption
    const htmlSignatures = ['<!DOCTYPE', '<html', '<head', '<body'];
    const isHtml = htmlSignatures.some(sig => 
      firstBytes.toLowerCase().includes(sig.toLowerCase())
    );
    
    // Image validation
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
      const validation = isValidImage(buffer, ext);
      
      if (!validation.valid) {
        // Also check if it's HTML instead of image (common mirror error)
        if (isHtml) {
          return {
            valid: false,
            file: relativePath,
            error: 'Contains HTML instead of image data',
            shouldRepair: true,
            details: validation.reason
          };
        }
        
        return {
          valid: false,
          file: relativePath,
          error: validation.reason,
          shouldRepair: true
        };
      }
      
      stats.validFiles++;
      return { valid: true, file: relativePath, type: 'image', subtype: ext };
    }
    
    // Font validation
    if (['woff', 'woff2', 'ttf', 'otf', 'eot'].includes(ext)) {
      const validation = isValidFont(buffer, ext);
      
      if (!validation.valid) {
        return {
          valid: false,
          file: relativePath,
          error: validation.reason,
          shouldRepair: true
        };
      }
      
      stats.validFiles++;
      return { valid: true, file: relativePath, type: 'font', subtype: ext };
    }
    
    // CSS validation (check for valid CSS structure)
    if (ext === 'css') {
      // Basic check - CSS should have rules
      if (!firstBytes.includes('{') || isHtml) {
        return {
          valid: false,
          file: relativePath,
          error: isHtml ? 'Contains HTML instead of CSS' : 'No CSS rules found',
          shouldRepair: true
        };
      }
      
      stats.validFiles++;
      return { valid: true, file: relativePath, type: 'stylesheet' };
    }
    
    stats.validFiles++;
    return { valid: true, file: relativePath, type: 'other' };
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      stats.missingFiles++;
      return {
        valid: false,
        file: relativePath,
        error: 'File not found',
        shouldRepair: true
      };
    }
    
    return {
      valid: false,
      file: relativePath,
      error: error.message,
      shouldRepair: false
    };
  }
}

/**
 * Validate all HTML files and their referenced assets
 */
async function validateHtmlFiles(options = {}) {
  const { dryRun = false, verbose = false } = options;
  const results = [];
  
  console.log('\n📄 Validating HTML files and referenced assets...\n');
  
  for await (const htmlPath of walkDirectory(CONFIG.SITE_DIR, ['.html'])) {
    const relativePath = path.relative(CONFIG.SITE_DIR, htmlPath);
    
    if (verbose) {
      console.log(`Checking: ${relativePath}`);
    }
    
    try {
      const content = await fs.readFile(htmlPath, 'utf8');
      const assets = extractHtmlAssets(content, path.dirname(htmlPath));
      const baseDir = path.dirname(htmlPath);
      
      for (const asset of assets) {
        if (isExternalUrl(asset.url)) {
          continue;
        }
        
        const localPath = resolveLocalPath(asset.url, baseDir);
        
        if (!localPath) {
          continue;
        }
        
        const validation = await validateFile(localPath, options);
        
        if (!validation.valid) {
          validation.source = relativePath;
          validation.assetType = asset.type;
          results.push(validation);
          
          if (verbose) {
            console.log(`  ✗ ${validation.error}: ${asset.url}`);
          }
        }
      }
    } catch (error) {
      console.error(`  Error reading ${relativePath}: ${error.message}`);
    }
  }
  
  return results;
}

/**
 * Validate all CSS files and their referenced assets
 */
async function validateCssFiles(options = {}) {
  const { dryRun = false, verbose = false } = options;
  const results = [];
  
  console.log('\n🎨 Validating CSS files and referenced assets...\n');
  
  for await (const cssPath of walkDirectory(CONFIG.SITE_DIR, ['.css'])) {
    const relativePath = path.relative(CONFIG.SITE_DIR, cssPath);
    
    if (verbose) {
      console.log(`Checking: ${relativePath}`);
    }
    
    try {
      const content = await fs.readFile(cssPath, 'utf8');
      const assets = extractCssAssets(content);
      const baseDir = path.dirname(cssPath);
      
      for (const asset of assets) {
        if (isExternalUrl(asset.url)) {
          continue;
        }
        
        const localPath = resolveLocalPath(asset.url, baseDir);
        
        if (!localPath) {
          continue;
        }
        
        const validation = await validateFile(localPath, options);
        
        if (!validation.valid) {
          validation.source = relativePath;
          validation.assetType = asset.type;
          results.push(validation);
          
          if (verbose) {
            console.log(`  ✗ ${validation.error}: ${asset.url}`);
          }
        }
      }
    } catch (error) {
      console.error(`  Error reading ${relativePath}: ${error.message}`);
    }
  }
  
  return results;
}

/**
 * Validate all asset files directly
 */
async function validateAllAssets(options = {}) {
  const { dryRun = false, verbose = false } = options;
  const results = [];
  
  console.log('\n🖼️  Validating all asset files...\n');
  
  const assetExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico', '.woff', '.woff2', '.ttf', '.otf', '.eot', '.pdf'];
  
  for await (const filePath of walkDirectory(CONFIG.SITE_DIR, assetExtensions)) {
    const validation = await validateFile(filePath, options);
    
    if (!validation.valid) {
      results.push(validation);
      
      if (verbose) {
        console.log(`  ✗ ${validation.error}: ${validation.file}`);
      }
    }
  }
  
  return results;
}

/**
 * Repair all invalid/missing assets
 */
async function repairAssets(invalidAssets, options = {}) {
  const { dryRun = false, verbose = false } = options;
  const results = [];
  
  console.log('\n🔧 Repairing invalid/missing assets...\n');
  
  // Process in batches to avoid overwhelming the server
  const batchSize = CONFIG.CONCURRENT_DOWNLOADS;
  
  for (let i = 0; i < invalidAssets.length; i += batchSize) {
    const batch = invalidAssets.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (asset) => {
      const localPath = path.join(CONFIG.SITE_DIR, asset.file);
      
      const result = await repairAsset(localPath, null, options);
      
      results.push({
        file: asset.file,
        ...result
      });
      
      if (result.success) {
        stats.repairedFiles++;
      } else {
        stats.failedRepairs++;
      }
      
      return result;
    });
    
    await Promise.all(batchPromises);
    
    // Small delay between batches
    if (i + batchSize < invalidAssets.length) {
      await new Promise(r => setTimeout(r, 500));
    }
  }
  
  return results;
}

/**
 * Generate validation report
 */
async function generateReport() {
  // Ensure .sisyphus directory exists
  await fs.mkdir(path.dirname(CONFIG.VALIDATION_REPORT), { recursive: true });
  
  const reportData = {
    timestamp: new Date().toISOString(),
    stats,
    details: report
  };
  
  await fs.writeFile(
    CONFIG.VALIDATION_REPORT,
    JSON.stringify(reportData, null, 2)
  );
  
  // Also generate a human-readable summary
  const summaryPath = CONFIG.VALIDATION_REPORT.replace('.json', '-summary.txt');
  const summary = `
════════════════════════════════════════════════════════════════
           ASSET VALIDATION REPORT
════════════════════════════════════════════════════════════════

Timestamp: ${new Date().toLocaleString()}

SUMMARY
-------
Total Files Checked:  ${stats.totalFiles}
Valid Files:          ${stats.validFiles}
Invalid Files:        ${stats.invalidFiles}
Missing Files:        ${stats.missingFiles}
Files Repaired:       ${stats.repairedFiles}
Failed Repairs:       ${stats.failedRepairs}

Pass Rate: ${stats.totalFiles > 0 ? ((stats.validFiles / stats.totalFiles) * 100).toFixed(1) : 0}%

Detailed JSON report: ${CONFIG.VALIDATION_REPORT}
`;
  
  await fs.writeFile(summaryPath, summary);
  
  return { jsonPath: CONFIG.VALIDATION_REPORT, summaryPath };
}

/**
 * Print summary to console
 */
function printSummary() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║              VALIDATION SUMMARY                            ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log(`║ Total Files Checked:  ${stats.totalFiles.toString().padEnd(39)} ║`);
  console.log(`║ ✓ Valid Files:        ${stats.validFiles.toString().padEnd(39)} ║`);
  console.log(`║ ✗ Invalid Files:      ${stats.invalidFiles.toString().padEnd(39)} ║`);
  console.log(`║ ? Missing Files:      ${stats.missingFiles.toString().padEnd(39)} ║`);
  console.log(`║ 🔧 Files Repaired:    ${stats.repairedFiles.toString().padEnd(39)} ║`);
  console.log(`║ ✗ Failed Repairs:    ${stats.failedRepairs.toString().padEnd(39)} ║`);
  console.log('╠════════════════════════════════════════════════════════════╣');
  const passRate = stats.totalFiles > 0 ? ((stats.validFiles / stats.totalFiles) * 100).toFixed(1) : 0;
  console.log(`║ Pass Rate:            ${(passRate + '%').padEnd(39)} ║`);
  console.log('╚════════════════════════════════════════════════════════════╝');
}

/**
 * Main function
 */
async function main() {
  const config = parseArgs();
  
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     Asset Validator and Repair System                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\nSite Directory: ${CONFIG.SITE_DIR}`);
  console.log(`Original URL: ${CONFIG.ORIGINAL_URL}`);
  
  if (config.dryRun) {
    console.log('\n⚠️  DRY RUN MODE - No files will be modified\n');
  }
  
  // Handle single file repair
  if (config.repairOnly) {
    const filePath = path.resolve(config.repairOnly);
    console.log(`\n🔧 Repairing single file: ${config.repairOnly}`);
    
    const result = await repairAsset(filePath, null, config);
    
    if (result.success) {
      console.log('\n✓ File repaired successfully');
      process.exit(0);
    } else {
      console.log('\n✗ Failed to repair file');
      process.exit(1);
    }
  }
  
  // Run validation
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(' PHASE 1: VALIDATION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const htmlIssues = await validateHtmlFiles(config);
  const cssIssues = await validateCssFiles(config);
  const assetIssues = await validateAllAssets(config);
  
  // Combine all issues
  const allIssues = [...htmlIssues, ...cssIssues, ...assetIssues];
  
  // Deduplicate by file path
  const uniqueIssues = allIssues.filter((issue, index, self) => 
    index === self.findIndex(i => i.file === issue.file)
  );
  
  stats.invalidFiles = uniqueIssues.length;
  
  console.log(`\nFound ${uniqueIssues.length} invalid/missing assets`);
  
  if (uniqueIssues.length > 0) {
    console.log('\nIssues found:');
    uniqueIssues.slice(0, 20).forEach(issue => {
      console.log(`  ✗ ${issue.file}: ${issue.error}`);
    });
    
    if (uniqueIssues.length > 20) {
      console.log(`  ... and ${uniqueIssues.length - 20} more`);
    }
  }
  
  // Run repair if not in validate-only mode
  if (!config.validateOnly && uniqueIssues.length > 0) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(' PHASE 2: REPAIR');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const repairs = await repairAssets(uniqueIssues, config);
    
    // Add to report
    report.repairs = repairs;
  }
  
  // Generate report
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(' PHASE 3: REPORT GENERATION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const reportPaths = await generateReport();
  
  // Print summary
  printSummary();
  
  console.log(`\n📊 Reports saved:`);
  console.log(`   JSON: ${reportPaths.jsonPath}`);
  console.log(`   Text: ${reportPaths.summaryPath}`);
  
  // Exit with appropriate code
  const exitCode = stats.failedRepairs > 0 || (config.validateOnly && stats.invalidFiles > 0) ? 1 : 0;
  
  console.log(`\nExit code: ${exitCode}`);
  process.exit(exitCode);
}

// Run main
main().catch(error => {
  console.error(`\nFatal error: ${error.message}`);
  console.error(error.stack);
  process.exit(1);
});
