#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const DEFAULT_OG_IMAGE = 'https://cdn.prod.website-files.com/61aeaa63fc373a25c198ab33/6361680bf3e6a52a0fd9470c_AVIR%20Opengraph.jpg';
const BASE_URL = 'https://avir.com';
const MAX_DESCRIPTION_LENGTH = 155;

// Title fallback map for pages without .page-title
const titleFallbacks = {
  'index.html': 'AVIR | Luxury Smart Home Solutions',
  'old-home.html': 'AVIR Home | Smart Home Technology',
  'commercial-form.html': 'Commercial Inquiry | AVIR',
  'residential-form.html': 'Residential Inquiry | AVIR',
  'service-request.html': 'Service Request | AVIR'
};

// Description templates
const descriptionTemplates = {
  'city': (cityName) => `Premium smart home installation and automation services in ${cityName}. AVIR delivers luxury home technology solutions for the discerning homeowner.`,
  'post': 'Read the latest smart home technology news and product updates from AVIR.',
  'default': 'Luxury smart home solutions, designed for the discerning.'
};

// HTML entity decoding map
const htmlEntities = {
  '&#x27;': "'",
  '&amp;': '&',
  '&quot;': '"',
  '&lt;': '<',
  '&gt;': '>',
  '&#39;': "'",
  '&apos;': "'"
};

/**
 * Decode HTML entities in a string
 */
function decodeHtmlEntities(text) {
  let decoded = text;
  for (const [entity, char] of Object.entries(htmlEntities)) {
    decoded = decoded.split(entity).join(char);
  }
  return decoded;
}

/**
 * Extract text content from HTML string (simple tag stripper)
 */
function stripHtmlTags(html) {
  return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * Truncate text to max length with ellipsis
 */
function truncateText(text, maxLength) {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3).trim() + '...';
}

/**
 * Extract title from HTML content
 */
function extractTitle(html, filePath) {
  const fileName = path.basename(filePath);
  
  // Check for fallback title first
  if (titleFallbacks[fileName]) {
    return titleFallbacks[fileName];
  }
  
  // Try to extract from <h1 class="page-title">
  const pageTitleMatch = html.match(/<h1[^>]*class="[^"]*page-title[^"]*"[^>]*>(.*?)<\/h1>/i);
  if (pageTitleMatch) {
    const title = stripHtmlTags(pageTitleMatch[1]);
    return decodeHtmlEntities(title.trim());
  }
  
  // Fallback to existing <title> tag
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  if (titleMatch) {
    return decodeHtmlEntities(titleMatch[1].trim());
  }
  
  return 'AVIR';
}

/**
 * Extract description from HTML content
 */
function extractDescription(html, filePath) {
  const relativePath = path.relative('site', filePath);
  
  // Try to extract from .w-richtext > p:first-child
  const richtextMatch = html.match(/<div[^>]*class="[^"]*w-richtext[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  if (richtextMatch) {
    const richtextContent = richtextMatch[1];
    // Find first <p> tag after any <h1> tags
    const paragraphMatch = richtextContent.match(/<p[^>]*>(.*?)<\/p>/i);
    if (paragraphMatch) {
      let description = stripHtmlTags(paragraphMatch[1]);
      description = decodeHtmlEntities(description);
      // Remove common non-content markers
      description = description.replace(/^[\s\u200B\u00A0]+|[\s\u200B\u00A0]+$/g, '');
      if (description && description.length > 10) {
        return truncateText(description, MAX_DESCRIPTION_LENGTH);
      }
    }
  }
  
  // Use template-based description
  if (relativePath.startsWith('city/')) {
    const cityName = path.basename(filePath, '.html')
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    return descriptionTemplates.city(cityName);
  } else if (relativePath.startsWith('post/')) {
    return descriptionTemplates.post;
  }
  
  return descriptionTemplates.default;
}

/**
 * Extract first image URL from content
 */
function extractImage(html) {
  const allImages = html.match(/src="(https:\/\/cdn\.prod\.website-files\.com\/[^"]+)"/gi) || [];
  
  for (const match of allImages) {
    const url = match.match(/src="([^"]+)"/i)[1];
    if (!url.includes('.svg') && !url.includes('logo') && !url.includes('icon')) {
      return url;
    }
  }
  
  return DEFAULT_OG_IMAGE;
}

/**
 * Generate canonical URL from file path
 */
function generateCanonicalUrl(filePath) {
  const relativePath = path.relative('site', filePath);
  return `${BASE_URL}/${relativePath.replace(/\\/g, '/')}`;
}

/**
 * Check if file already has SEO tags (canonical URL)
 */
function hasExistingSeo(html) {
  return html.includes('rel="canonical"');
}

/**
 * Generate SEO meta tags
 */
function generateSeoTags(title, description, ogImage, canonicalUrl) {
  return `<meta content="${description}" name="description"/>
<meta content="${title}" property="og:title"/>
<meta content="${description}" property="og:description"/>
<meta content="${ogImage}" property="og:image"/>
<meta content="${title}" property="twitter:title"/>
<meta content="${description}" property="twitter:description"/>
<meta content="${ogImage}" property="twitter:image"/>
<meta property="og:type" content="website"/>
<meta content="summary_large_image" name="twitter:card"/>
<link rel="canonical" href="${canonicalUrl}"/>
`;
}

/**
 * Inject SEO tags into HTML
 */
function injectSeoTags(html, seoTags, title) {
  // Replace existing <title> tag
  const titleTag = `<title>${title}</title>`;
  html = html.replace(/<title>.*?<\/title>/i, titleTag);
  
  // Find insertion point (before viewport meta tag)
  const viewportMetaRegex = /(<meta content="width=device-width[^>]*>)/i;
  const match = html.match(viewportMetaRegex);
  
  if (match) {
    const insertionPoint = html.indexOf(match[1]);
    const before = html.substring(0, insertionPoint);
    const after = html.substring(insertionPoint);
    return before + seoTags + after;
  }
  
  // Fallback: insert after </title>
  return html.replace(/(<\/title>)/i, `$1\n${seoTags}`);
}

/**
 * Process a single HTML file
 */
function processFile(filePath, dryRun = false) {
  console.log(`\nProcessing: ${filePath}`);
  
  // Read file
  const html = fs.readFileSync(filePath, 'utf8');
  
  // Check if already has SEO
  if (hasExistingSeo(html)) {
    console.log('  ⏭️  Skipping - already has canonical URL');
    return { skipped: true };
  }
  
  // Extract metadata
  const title = extractTitle(html, filePath);
  const description = extractDescription(html, filePath);
  const ogImage = extractImage(html);
  const canonicalUrl = generateCanonicalUrl(filePath);
  
  // Log extracted data
  console.log(`  📝 Title: ${title}`);
  console.log(`  📄 Description: ${description}`);
  console.log(`  🖼️  OG Image: ${ogImage}`);
  console.log(`  🔗 Canonical: ${canonicalUrl}`);
  
  // Generate SEO tags
  const seoTags = generateSeoTags(title, description, ogImage, canonicalUrl);
  
  if (dryRun) {
    console.log('\n  Would insert SEO tags:');
    seoTags.split('\n').forEach(line => {
      if (line.trim()) {
        console.log(`    ${line}`);
      }
    });
    return { processed: true, dryRun: true };
  }
  
  // Inject SEO tags
  const updatedHtml = injectSeoTags(html, seoTags, title);
  
  // Write back to file
  fs.writeFileSync(filePath, updatedHtml, 'utf8');
  console.log('  ✅ SEO tags injected successfully');
  
  return { processed: true, dryRun: false };
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  
  // Parse arguments
  let dryRun = false;
  let filePath = null;
  
  for (const arg of args) {
    if (arg === '--dry-run') {
      dryRun = true;
    } else if (!arg.startsWith('--')) {
      filePath = arg;
    }
  }
  
  // Validate arguments
  if (!filePath) {
    console.error('Usage: node scripts/inject-seo.js [--dry-run] <file-path>');
    console.error('');
    console.error('Examples:');
    console.error('  node scripts/inject-seo.js --dry-run site/post/kef-reference-5-meta.html');
    console.error('  node scripts/inject-seo.js site/post/kef-reference-5-meta.html');
    process.exit(1);
  }
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }
  
  // Process file
  const result = processFile(filePath, dryRun);
  
  // Summary
  console.log('\n' + '='.repeat(60));
  if (dryRun) {
    console.log('DRY RUN - No files modified');
  } else if (result.skipped) {
    console.log('File skipped (already has SEO)');
  } else {
    console.log('✅ File processed successfully');
  }
  console.log('='.repeat(60));
}

// Run main function
if (require.main === module) {
  main();
}

module.exports = {
  extractTitle,
  extractDescription,
  extractImage,
  generateCanonicalUrl,
  decodeHtmlEntities,
  hasExistingSeo
};
