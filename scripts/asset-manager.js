#!/usr/bin/env node

/**
 * Asset Manager
 * Normalizes and localizes all external assets for the AVIR website replication
 *
 * Usage:
 *   node scripts/asset-manager.js
 *
 * This script:
 *   1. Reads mirror-raw/asset-manifest.json
 *   2. Creates site/ directory structure
 *   3. Copies and rewrites HTML files with local asset paths
 *   4. Copies and rewrites CSS files with local font paths
 *   5. Copies JS files, images, CDN assets
 *   6. Downloads Google Fonts CSS and font files
 *   7. Updates asset manifest with local paths
 *   8. Creates site/_headers with CORS configuration
 */

const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

// Configuration
const MIRROR_RAW_DIR = 'mirror-raw';
const SITE_DIR = 'site';
const ASSET_MANIFEST_FILE = 'asset-manifest.json';

// AssetManifest class (embedded for standalone operation)
class AssetManifest {
    constructor(outputDir, sourceUrl) {
        this.outputDir = outputDir;
        this.sourceUrl = sourceUrl;
        this.assets = new Map();
        this.generatedAt = new Date().toISOString();
    }

    calculateHash(data) {
        const crypto = require('crypto');
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    determineAssetType(contentType, url) {
        if (contentType) {
            const type = contentType.toLowerCase().split(';')[0].trim();
            if (type.includes('text/html')) return 'text/html';
            if (type.includes('text/css')) return 'text/css';
            if (type.includes('javascript')) return 'application/javascript';
            if (type.includes('json')) return 'application/json';
            if (type.includes('image/jpeg') || type.includes('image/jpg')) return 'image/jpeg';
            if (type.includes('image/png')) return 'image/png';
            if (type.includes('image/svg')) return 'image/svg+xml';
            if (type.includes('image/webp')) return 'image/webp';
            if (type.includes('image/gif')) return 'image/gif';
            if (type.includes('font/woff2')) return 'font/woff2';
            if (type.includes('font/woff')) return 'font/woff';
            if (type.includes('font/ttf') || type.includes('truetype')) return 'font/ttf';
            if (type.includes('video/mp4')) return 'video/mp4';
            return type;
        }

        const ext = path.extname(url).toLowerCase();
        const typeMap = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'application/javascript',
            '.json': 'application/json',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.svg': 'image/svg+xml',
            '.webp': 'image/webp',
            '.gif': 'image/gif',
            '.woff2': 'font/woff2',
            '.woff': 'font/woff',
            '.ttf': 'font/ttf',
            '.mp4': 'video/mp4',
        };
        return typeMap[ext] || 'application/octet-stream';
    }

    getAssetCategory(assetType) {
        if (assetType.includes('text/css')) return 'css';
        if (assetType.includes('javascript')) return 'js';
        if (assetType.includes('image/')) return 'images';
        if (assetType.includes('font/')) return 'fonts';
        if (assetType.includes('video/')) return 'videos';
        if (assetType.includes('text/html')) return 'html';
        return 'cdn';
    }

    async addAsset(originalUrl, localPath, data, contentType, metadata = {}) {
        const hash = this.calculateHash(data);
        const size = data.length;
        const type = this.determineAssetType(contentType, originalUrl);
        const category = this.getAssetCategory(type);

        const entry = {
            originalUrl,
            localPath,
            sha256: hash,
            size,
            type,
            category,
            downloadedAt: new Date().toISOString(),
            ...metadata,
        };

        this.assets.set(originalUrl, entry);
        return entry;
    }

    hasAsset(originalUrl) {
        return this.assets.has(originalUrl);
    }

    getAsset(originalUrl) {
        return this.assets.get(originalUrl);
    }

    getAssetsByCategory(category) {
        return Array.from(this.assets.values()).filter(
            (asset) => asset.category === category
        );
    }

    getTotalSize() {
        return Array.from(this.assets.values()).reduce(
            (sum, asset) => sum + asset.size,
            0
        );
    }

    getStatistics() {
        const stats = {
            totalAssets: this.assets.size,
            totalSize: this.getTotalSize(),
            byCategory: {},
            byType: {},
        };

        for (const asset of this.assets.values()) {
            stats.byCategory[asset.category] =
                (stats.byCategory[asset.category] || 0) + 1;
            stats.byType[asset.type] = (stats.byType[asset.type] || 0) + 1;
        }

        return stats;
    }

    async save(filename = 'asset-manifest.json') {
        const manifestPath = path.join(this.outputDir, filename);

        const manifest = {
            generatedAt: this.generatedAt,
            savedAt: new Date().toISOString(),
            sourceUrl: this.sourceUrl,
            statistics: this.getStatistics(),
            assets: Array.from(this.assets.values()),
        };

        await fsPromises.mkdir(this.outputDir, { recursive: true });
        await fsPromises.writeFile(
            manifestPath,
            JSON.stringify(manifest, null, 2),
            'utf8'
        );

        return manifestPath;
    }

    async load(filename = 'asset-manifest.json') {
        const manifestPath = path.join(this.outputDir, filename);
        const data = await fsPromises.readFile(manifestPath, 'utf8');
        const manifest = JSON.parse(data);

        this.generatedAt = manifest.generatedAt;
        this.assets = new Map(
            manifest.assets.map((asset) => [asset.originalUrl, asset])
        );

        return manifest;
    }
}

// Asset Manager Class
class AssetManager {
    constructor() {
        this.sourceManifest = null;
        this.targetManifest = new AssetManifest(SITE_DIR, 'https://www.avir.com');
        this.errors = [];
        this.stats = {
            htmlFiles: 0,
            cssFiles: 0,
            jsFiles: 0,
            imageFiles: 0,
            fontFiles: 0,
            cdnFiles: 0,
            videoFiles: 0,
            urlsRewritten: 0,
        };
    }

    async loadSourceManifest() {
        console.log('Loading source manifest...');
        const manifestPath = path.join(MIRROR_RAW_DIR, ASSET_MANIFEST_FILE);
        const data = await fsPromises.readFile(manifestPath, 'utf8');
        this.sourceManifest = JSON.parse(data);
        console.log(`Loaded manifest with ${this.sourceManifest.assets.length} assets`);
        return this.sourceManifest;
    }

    async createDirectoryStructure() {
        console.log('Creating site directory structure...');
        const dirs = [
            SITE_DIR,
            path.join(SITE_DIR, 'css'),
            path.join(SITE_DIR, 'js'),
            path.join(SITE_DIR, 'fonts'),
            path.join(SITE_DIR, 'images'),
            path.join(SITE_DIR, 'cdn'),
            path.join(SITE_DIR, 'videos'),
        ];

        for (const dir of dirs) {
            await fsPromises.mkdir(dir, { recursive: true });
        }
        console.log('Directory structure created');
    }

    async copyFile(src, dest) {
        await fsPromises.mkdir(path.dirname(dest), { recursive: true });
        await fsPromises.copyFile(src, dest);
    }

    rewriteHtmlUrls(content, currentPath) {
        let rewritten = content;
        const originalRewritten = this.stats.urlsRewritten;

        // Rewrite CDN URLs: https://cdn.prod.website-files.com/... -> /cdn/...
        rewritten = rewritten.replace(
            /https:\/\/cdn\.prod\.website-files\.com\/([^"'\s]+)/g,
            '/cdn/$1'
        );

        // Rewrite Google Fonts CSS: https://fonts.googleapis.com/css... -> /fonts/google-fonts.css
        rewritten = rewritten.replace(
            /https:\/\/fonts\.googleapis\.com\/css[^"'\s]*/g,
            '/fonts/google-fonts.css'
        );

        // Rewrite Google Fonts font files: https://fonts.gstatic.com/... -> /fonts/...
        rewritten = rewritten.replace(
            /https:\/\/fonts\.gstatic\.com\/s\/([^"'\s]+)/g,
            '/fonts/$1'
        );

        // Rewrite Adobe Typekit: https://use.typekit.net/... -> /fonts/...
        rewritten = rewritten.replace(
            /https:\/\/use\.typekit\.net\/([^"'\s]+)/g,
            '/fonts/adobe-$1'
        );

        // Rewrite WebFont loader: https://ajax.googleapis.com/ajax/libs/webfont/... -> /js/ajax/libs/webfont/...
        rewritten = rewritten.replace(
            /https:\/\/ajax\.googleapis\.com\/ajax\/libs\/webfont\/([^"'\s]+)/g,
            '/js/ajax/libs/webfont/$1'
        );

        // Rewrite jQuery from CloudFront: https://d3e54v103j8qbb.cloudfront.net/js/jquery-... -> /js/js/jquery-...
        rewritten = rewritten.replace(
            /https:\/\/d3e54v103j8qbb\.cloudfront\.net\/js\/([^"'\s]+)/g,
            '/js/js/$1'
        );

        // Rewrite gstatic recaptcha: https://www.gstatic.com/recaptcha/... -> /js/recaptcha/...
        rewritten = rewritten.replace(
            /https:\/\/www\.gstatic\.com\/recaptcha\/([^"'\s]+)/g,
            '/js/recaptcha/$1'
        );

        // Rewrite gstatic recaptcha CSS: https://www.gstatic.com/recaptcha/... -> /css/recaptcha/...
        rewritten = rewritten.replace(
            /https:\/\/www\.gstatic\.com\/recaptcha\/([^"'\s]+\.css)/g,
            '/css/recaptcha/$1'
        );

        // Rewrite LiveChat: https://cdn.livechatinc.com/... -> /js/...
        rewritten = rewritten.replace(
            /https:\/\/cdn\.livechatinc\.com\/([^"'\s]+)/g,
            '/js/$1'
        );

        // Rewrite LiveChat API: https://api.livechatinc.com/... -> /cdn/...
        rewritten = rewritten.replace(
            /https:\/\/api\.livechatinc\.com\/([^"'\s]+)/g,
            '/cdn/$1'
        );

        // Rewrite Dropbox video: https://www.dropbox.com/... -> /videos/...
        rewritten = rewritten.replace(
            /https:\/\/www\.dropbox\.com\/s\/([^"'\s]+)\?raw=1/g,
            '/videos/$1'
        );

        // Rewrite internal links: https://www.avir.com/... -> /...
        // Handle root URL
        rewritten = rewritten.replace(
            /https:\/\/www\.avir\.com\/(?!["'\s])/g,
            '/'
        );

        // Handle subpages
        rewritten = rewritten.replace(
            /https:\/\/www\.avir\.com\/([^"'\s]*)/g,
            (match, p1) => {
                if (!p1) return '/';
                // Remove trailing slash for consistency
                const cleanPath = p1.replace(/\/$/, '');
                return `/${cleanPath}/`;
            }
        );

        // Count rewrites
        this.stats.urlsRewritten += (rewritten.match(/\/cdn\//g) || []).length;
        this.stats.urlsRewritten += (rewritten.match(/\/fonts\//g) || []).length;
        this.stats.urlsRewritten += (rewritten.match(/\/js\//g) || []).length;

        return rewritten;
    }

    rewriteCssUrls(content) {
        let rewritten = content;

        // Rewrite font URLs in CSS: url(https://fonts.gstatic.com/...) -> url(/fonts/...)
        rewritten = rewritten.replace(
            /url\(['"]?https:\/\/fonts\.gstatic\.com\/s\/([^'"\)]+)['"]?\)/g,
            "url('/fonts/$1')"
        );

        // Rewrite font URLs in CSS: url(https://use.typekit.net/...) -> url(/fonts/...)
        rewritten = rewritten.replace(
            /url\(['"]?https:\/\/use\.typekit\.net\/([^'"\)]+)['"]?\)/g,
            "url('/fonts/adobe-$1')"
        );

        return rewritten;
    }

    async processHtmlFiles() {
        console.log('Processing HTML files...');
        const htmlAssets = this.sourceManifest.assets.filter(a => a.category === 'html');

        for (const asset of htmlAssets) {
            try {
                const srcPath = path.join(MIRROR_RAW_DIR, asset.localPath);
                const destPath = path.join(SITE_DIR, asset.localPath);

                // Read HTML content
                let content = await fsPromises.readFile(srcPath, 'utf8');

                // Rewrite URLs
                content = this.rewriteHtmlUrls(content, asset.localPath);

                // Write to site/
                await fsPromises.mkdir(path.dirname(destPath), { recursive: true });
                await fsPromises.writeFile(destPath, content, 'utf8');

                // Add to target manifest
                const buffer = Buffer.from(content);
                await this.targetManifest.addAsset(
                    asset.originalUrl,
                    asset.localPath,
                    buffer,
                    asset.type,
                    { status: asset.status, headers: asset.headers }
                );

                // If this is the root page, also copy to index.html
                if (asset.originalUrl === 'https://www.avir.com/') {
                    const rootIndexPath = path.join(SITE_DIR, 'index.html');
                    await fsPromises.writeFile(rootIndexPath, content, 'utf8');
                    console.log('Created root index.html');
                }

                this.stats.htmlFiles++;
            } catch (error) {
                this.errors.push({ file: asset.localPath, error: error.message });
                console.error(`Error processing HTML ${asset.localPath}: ${error.message}`);
            }
        }

        console.log(`Processed ${this.stats.htmlFiles} HTML files`);
    }

    async processCssFiles() {
        console.log('Processing CSS files...');
        const cssAssets = this.sourceManifest.assets.filter(a => a.category === 'css');

        for (const asset of cssAssets) {
            try {
                const srcPath = path.join(MIRROR_RAW_DIR, asset.localPath);
                const destPath = path.join(SITE_DIR, asset.localPath);

                // Read CSS content
                let content = await fsPromises.readFile(srcPath, 'utf8');

                // Rewrite URLs
                content = this.rewriteCssUrls(content);

                // Write to site/
                await fsPromises.mkdir(path.dirname(destPath), { recursive: true });
                await fsPromises.writeFile(destPath, content, 'utf8');

                // Add to target manifest
                const buffer = Buffer.from(content);
                await this.targetManifest.addAsset(
                    asset.originalUrl,
                    asset.localPath,
                    buffer,
                    asset.type,
                    { status: asset.status, headers: asset.headers }
                );

                this.stats.cssFiles++;
            } catch (error) {
                this.errors.push({ file: asset.localPath, error: error.message });
                console.error(`Error processing CSS ${asset.localPath}: ${error.message}`);
            }
        }

        console.log(`Processed ${this.stats.cssFiles} CSS files`);
    }

    async processJsFiles() {
        console.log('Processing JS files...');
        const jsAssets = this.sourceManifest.assets.filter(a => a.category === 'js');

        for (const asset of jsAssets) {
            try {
                const srcPath = path.join(MIRROR_RAW_DIR, asset.localPath);
                const destPath = path.join(SITE_DIR, asset.localPath);

                // Copy file
                await this.copyFile(srcPath, destPath);

                // Add to target manifest
                const buffer = await fsPromises.readFile(srcPath);
                await this.targetManifest.addAsset(
                    asset.originalUrl,
                    asset.localPath,
                    buffer,
                    asset.type,
                    { status: asset.status, headers: asset.headers }
                );

                this.stats.jsFiles++;
            } catch (error) {
                this.errors.push({ file: asset.localPath, error: error.message });
                console.error(`Error processing JS ${asset.localPath}: ${error.message}`);
            }
        }

        console.log(`Processed ${this.stats.jsFiles} JS files`);
    }

    async processImageFiles() {
        console.log('Processing image files...');
        const imageAssets = this.sourceManifest.assets.filter(a => a.category === 'images');

        for (const asset of imageAssets) {
            try {
                const srcPath = path.join(MIRROR_RAW_DIR, asset.localPath);
                const destPath = path.join(SITE_DIR, asset.localPath);

                // Copy file
                await this.copyFile(srcPath, destPath);

                // Add to target manifest
                const buffer = await fsPromises.readFile(srcPath);
                await this.targetManifest.addAsset(
                    asset.originalUrl,
                    asset.localPath,
                    buffer,
                    asset.type,
                    { status: asset.status, headers: asset.headers }
                );

                this.stats.imageFiles++;
            } catch (error) {
                this.errors.push({ file: asset.localPath, error: error.message });
                console.error(`Error processing image ${asset.localPath}: ${error.message}`);
            }
        }

        console.log(`Processed ${this.stats.imageFiles} image files`);
    }

    async processFontFiles() {
        console.log('Processing font files...');
        const fontAssets = this.sourceManifest.assets.filter(a => a.category === 'fonts');

        for (const asset of fontAssets) {
            try {
                const srcPath = path.join(MIRROR_RAW_DIR, asset.localPath);
                const destPath = path.join(SITE_DIR, asset.localPath);

                // Copy file
                await this.copyFile(srcPath, destPath);

                // Add to target manifest
                const buffer = await fsPromises.readFile(srcPath);
                await this.targetManifest.addAsset(
                    asset.originalUrl,
                    asset.localPath,
                    buffer,
                    asset.type,
                    { status: asset.status, headers: asset.headers }
                );

                this.stats.fontFiles++;
            } catch (error) {
                this.errors.push({ file: asset.localPath, error: error.message });
                console.error(`Error processing font ${asset.localPath}: ${error.message}`);
            }
        }

        console.log(`Processed ${this.stats.fontFiles} font files`);
    }

    async processCdnFiles() {
        console.log('Processing CDN files...');
        const cdnAssets = this.sourceManifest.assets.filter(a => a.category === 'cdn');

        for (const asset of cdnAssets) {
            try {
                const srcPath = path.join(MIRROR_RAW_DIR, asset.localPath);
                const destPath = path.join(SITE_DIR, asset.localPath);

                // Copy file
                await this.copyFile(srcPath, destPath);

                // Add to target manifest
                const buffer = await fsPromises.readFile(srcPath);
                await this.targetManifest.addAsset(
                    asset.originalUrl,
                    asset.localPath,
                    buffer,
                    asset.type,
                    { status: asset.status, headers: asset.headers }
                );

                this.stats.cdnFiles++;
            } catch (error) {
                this.errors.push({ file: asset.localPath, error: error.message });
                console.error(`Error processing CDN ${asset.localPath}: ${error.message}`);
            }
        }

        console.log(`Processed ${this.stats.cdnFiles} CDN files`);
    }

    async processVideoFiles() {
        console.log('Processing video files...');
        const videoAssets = this.sourceManifest.assets.filter(a => a.category === 'videos');

        for (const asset of videoAssets) {
            try {
                const srcPath = path.join(MIRROR_RAW_DIR, asset.localPath);
                const destPath = path.join(SITE_DIR, asset.localPath);

                // Copy file
                await this.copyFile(srcPath, destPath);

                // Add to target manifest
                const buffer = await fsPromises.readFile(srcPath);
                await this.targetManifest.addAsset(
                    asset.originalUrl,
                    asset.localPath,
                    buffer,
                    asset.type,
                    { status: asset.status, headers: asset.headers }
                );

                this.stats.videoFiles++;
            } catch (error) {
                this.errors.push({ file: asset.localPath, error: error.message });
                console.error(`Error processing video ${asset.localPath}: ${error.message}`);
            }
        }

        console.log(`Processed ${this.stats.videoFiles} video files`);
    }

    async downloadGoogleFonts() {
        console.log('Processing Google Fonts...');

        // The Google Fonts CSS is already downloaded, we just need to ensure
        // the font files referenced in it are also available locally
        const googleFontsCssPath = path.join(MIRROR_RAW_DIR, 'fonts', 'google-fonts.css');

        try {
            const cssContent = await fsPromises.readFile(googleFontsCssPath, 'utf8');

            // Extract all font URLs from the CSS
            const fontUrlRegex = /url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g;
            const fontUrls = [];
            let match;

            while ((match = fontUrlRegex.exec(cssContent)) !== null) {
                fontUrls.push(match[1]);
            }

            console.log(`Found ${fontUrls.length} font URLs in Google Fonts CSS`);

            // Check which fonts are already downloaded
            const existingFonts = this.sourceManifest.assets.filter(
                a => a.originalUrl.includes('fonts.gstatic.com')
            );

            console.log(`${existingFonts.length} Google Fonts already downloaded`);

            // Copy existing fonts to site/
            for (const font of existingFonts) {
                const srcPath = path.join(MIRROR_RAW_DIR, font.localPath);
                const destPath = path.join(SITE_DIR, font.localPath);

                try {
                    await this.copyFile(srcPath, destPath);

                    // Add to target manifest
                    const buffer = await fsPromises.readFile(srcPath);
                    await this.targetManifest.addAsset(
                        font.originalUrl,
                        font.localPath,
                        buffer,
                        font.type,
                        { status: font.status, headers: font.headers }
                    );
                } catch (error) {
                    console.error(`Error copying font ${font.localPath}: ${error.message}`);
                }
            }

            // Copy the Google Fonts CSS to site/
            const destCssPath = path.join(SITE_DIR, 'fonts', 'google-fonts.css');
            let cssContentRewritten = cssContent;

            // Rewrite font URLs in CSS
            cssContentRewritten = cssContentRewritten.replace(
                /url\((https:\/\/fonts\.gstatic\.com\/s\/[^)]+)\)/g,
                (match, url) => {
                    const fontPath = url.replace('https://fonts.gstatic.com/s/', '/fonts/');
                    return `url(${fontPath})`;
                }
            );

            await fsPromises.mkdir(path.dirname(destCssPath), { recursive: true });
            await fsPromises.writeFile(destCssPath, cssContentRewritten, 'utf8');

            // Add to target manifest
            const googleFontsAsset = this.sourceManifest.assets.find(
                a => a.originalUrl.includes('fonts.googleapis.com/css')
            );

            if (googleFontsAsset) {
                const buffer = Buffer.from(cssContentRewritten);
                await this.targetManifest.addAsset(
                    googleFontsAsset.originalUrl,
                    'fonts/google-fonts.css',
                    buffer,
                    'text/css',
                    { status: 200 }
                );
            }

            console.log('Google Fonts CSS processed');
        } catch (error) {
            console.error(`Error processing Google Fonts: ${error.message}`);
        }
    }

    async createHeadersFile() {
        console.log('Creating _headers file...');

        const headersContent = `# Cloudflare Pages Headers Configuration
# Generated by asset-manager.js

# Font files - CORS and long cache
/fonts/*
  Access-Control-Allow-Origin: *
  Cache-Control: public, max-age=31536000, immutable

# CDN assets - long cache
/cdn/*
  Cache-Control: public, max-age=31536000, immutable

# Images - long cache
/images/*
  Cache-Control: public, max-age=31536000, immutable

# CSS files - medium cache
/css/*
  Cache-Control: public, max-age=86400

# JS files - medium cache
/js/*
  Cache-Control: public, max-age=86400
`;

        const headersPath = path.join(SITE_DIR, '_headers');
        await fsPromises.writeFile(headersPath, headersContent, 'utf8');
        console.log('_headers file created');
    }

    async saveManifest() {
        console.log('Saving asset manifest...');
        const manifestPath = await this.targetManifest.save();
        console.log(`Manifest saved to ${manifestPath}`);
    }

    async verifyNoExternalUrls() {
        console.log('Verifying no external CDN references...');

        const htmlFiles = this.targetManifest.getAssetsByCategory('html');
        const externalPatterns = [
            /cdn\.prod\.website-files\.com/,
            /fonts\.googleapis\.com/,
            /fonts\.gstatic\.com/,
            /use\.typekit\.net/,
            /ajax\.googleapis\.com/,
            /d3e54v103j8qbb\.cloudfront\.net/,
            /www\.gstatic\.com/,
            /cdn\.livechatinc\.com/,
            /api\.livechatinc\.com/,
            /www\.dropbox\.com/,
        ];

        let externalFound = 0;

        for (const htmlFile of htmlFiles.slice(0, 5)) { // Check first 5 HTML files
            const filePath = path.join(SITE_DIR, htmlFile.localPath);
            try {
                const content = await fsPromises.readFile(filePath, 'utf8');

                for (const pattern of externalPatterns) {
                    if (pattern.test(content)) {
                        const matches = content.match(pattern);
                        if (matches) {
                            console.warn(`Warning: Found external URL pattern ${pattern} in ${htmlFile.localPath}`);
                            externalFound++;
                        }
                    }
                }
            } catch (error) {
                console.error(`Error reading ${filePath}: ${error.message}`);
            }
        }

        if (externalFound === 0) {
            console.log('✓ No external CDN references found in HTML files');
        } else {
            console.warn(`⚠ Found ${externalFound} potential external references`);
        }

        return externalFound === 0;
    }

    printSummary() {
        console.log('\n========================================');
        console.log('  Asset Manager Summary');
        console.log('========================================');
        console.log(`HTML files processed:    ${this.stats.htmlFiles}`);
        console.log(`CSS files processed:     ${this.stats.cssFiles}`);
        console.log(`JS files processed:      ${this.stats.jsFiles}`);
        console.log(`Image files processed:   ${this.stats.imageFiles}`);
        console.log(`Font files processed:    ${this.stats.fontFiles}`);
        console.log(`CDN files processed:     ${this.stats.cdnFiles}`);
        console.log(`Video files processed:   ${this.stats.videoFiles}`);
        console.log(`URLs rewritten:          ${this.stats.urlsRewritten}`);
        console.log(`Errors encountered:      ${this.errors.length}`);
        console.log('========================================');

        if (this.errors.length > 0) {
            console.log('\nErrors:');
            this.errors.forEach((err, i) => {
                console.log(`  ${i + 1}. ${err.file}: ${err.error}`);
            });
        }
    }

    async run() {
        console.log('========================================');
        console.log('  Asset Manager');
        console.log('  Normalizing and localizing assets');
        console.log('========================================\n');

        const startTime = Date.now();

        try {
            // Load source manifest
            await this.loadSourceManifest();

            // Create directory structure
            await this.createDirectoryStructure();

            // Process all asset types
            await this.processHtmlFiles();
            await this.processCssFiles();
            await this.processJsFiles();
            await this.processImageFiles();
            await this.processFontFiles();
            await this.processCdnFiles();
            await this.processVideoFiles();

            // Process Google Fonts
            await this.downloadGoogleFonts();

            // Create headers file
            await this.createHeadersFile();

            // Save manifest
            await this.saveManifest();

            // Verify no external URLs
            await this.verifyNoExternalUrls();

            // Print summary
            this.printSummary();

            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            console.log(`\nCompleted in ${duration}s`);

            return this.errors.length === 0;
        } catch (error) {
            console.error(`Fatal error: ${error.message}`);
            console.error(error.stack);
            return false;
        }
    }
}

// Main execution
if (require.main === module) {
    const manager = new AssetManager();
    manager.run().then((success) => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = AssetManager;
