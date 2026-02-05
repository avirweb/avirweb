#!/usr/bin/env node

/**
 * Asset Manifest Module
 * Manages SHA256 hashes and metadata for all crawled assets
 *
 * Usage:
 *   const AssetManifest = require('./lib/asset-manifest');
 *   const manifest = new AssetManifest('/output/dir');
 *   await manifest.addAsset(originalUrl, localPath, buffer, contentType);
 *   await manifest.save();
 */

const crypto = require('crypto');
const fsPromises = require('fs').promises;
const path = require('path');

class AssetManifest {
    /**
     * Create a new AssetManifest instance
     * @param {string} outputDir - Base output directory for the mirror
     * @param {string} sourceUrl - Source URL being mirrored
     */
    constructor(outputDir, sourceUrl) {
        this.outputDir = outputDir;
        this.sourceUrl = sourceUrl;
        this.assets = new Map();
        this.generatedAt = new Date().toISOString();
    }

    /**
     * Calculate SHA256 hash of data
     * @param {Buffer|string} data - Data to hash
     * @returns {string} Hex-encoded SHA256 hash
     */
    calculateHash(data) {
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    /**
     * Determine asset type from content type or URL
     * @param {string} contentType - HTTP content type header
     * @param {string} url - Asset URL
     * @returns {string} Normalized asset type
     */
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
            if (type.includes('video/webm')) return 'video/webm';
            return type;
        }

        // Fallback to extension detection
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
            '.webm': 'video/webm',
        };
        return typeMap[ext] || 'application/octet-stream';
    }

    /**
     * Determine directory category for asset type
     * @param {string} assetType - Normalized asset type
     * @returns {string} Directory category (css, js, images, fonts, videos, cdn, etc.)
     */
    getAssetCategory(assetType) {
        if (assetType.includes('text/css')) return 'css';
        if (assetType.includes('javascript')) return 'js';
        if (assetType.includes('image/')) return 'images';
        if (assetType.includes('font/')) return 'fonts';
        if (assetType.includes('video/')) return 'videos';
        if (assetType.includes('text/html')) return 'html';
        return 'cdn';
    }

    /**
     * Add an asset to the manifest
     * @param {string} originalUrl - Original URL of the asset
     * @param {string} localPath - Local path where asset is saved (relative to outputDir)
     * @param {Buffer} data - Asset data buffer
     * @param {string} contentType - HTTP content type
     * @param {Object} metadata - Additional metadata (headers, status, etc.)
     * @returns {Object} Asset entry
     */
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

    /**
     * Check if an asset has already been added
     * @param {string} originalUrl - Original URL to check
     * @returns {boolean}
     */
    hasAsset(originalUrl) {
        return this.assets.has(originalUrl);
    }

    /**
     * Get an asset entry by URL
     * @param {string} originalUrl - Original URL
     * @returns {Object|undefined} Asset entry
     */
    getAsset(originalUrl) {
        return this.assets.get(originalUrl);
    }

    /**
     * Get all assets of a specific category
     * @param {string} category - Category name (css, js, images, fonts, videos)
     * @returns {Array} Array of asset entries
     */
    getAssetsByCategory(category) {
        return Array.from(this.assets.values()).filter(
            (asset) => asset.category === category
        );
    }

    /**
     * Get total size of all assets
     * @returns {number} Total size in bytes
     */
    getTotalSize() {
        return Array.from(this.assets.values()).reduce(
            (sum, asset) => sum + asset.size,
            0
        );
    }

    /**
     * Get asset statistics
     * @returns {Object} Statistics object
     */
    getStatistics() {
        const stats = {
            totalAssets: this.assets.size,
            totalSize: this.getTotalSize(),
            byCategory: {},
            byType: {},
        };

        for (const asset of this.assets.values()) {
            // By category
            stats.byCategory[asset.category] =
                (stats.byCategory[asset.category] || 0) + 1;

            // By type
            stats.byType[asset.type] = (stats.byType[asset.type] || 0) + 1;
        }

        return stats;
    }

    /**
     * Save manifest to JSON file
     * @param {string} filename - Output filename (default: asset-manifest.json)
     */
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

    /**
     * Load manifest from JSON file
     * @param {string} filename - Manifest filename
     */
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

    /**
     * Generate a relative URL from original URL to local path
     * @param {string} originalUrl - Original URL
     * @param {string} currentPagePath - Path of current page (for relative calculation)
     * @returns {string} Relative path
     */
    getRelativePath(originalUrl, currentPagePath = '') {
        const asset = this.assets.get(originalUrl);
        if (!asset) return originalUrl;

        // If no current page, return absolute path from root
        if (!currentPagePath) return '/' + asset.localPath;

        // Calculate relative path
        const currentDir = path.dirname(currentPagePath);
        const relativePath = path.relative(currentDir, asset.localPath);

        // Ensure it starts with ./ or ../
        return relativePath.startsWith('.') ? relativePath : './' + relativePath;
    }
}

module.exports = AssetManifest;
