const { PlaywrightCrawler, Dataset } = require('crawlee');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

// Configuration
const START_URL = 'https://www.avir.com/';
const OUTPUT_DIR = 'site-new';
const MAX_PAGES = 200; // Safety limit

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Create subdirectories
['css', 'js', 'images', 'videos', 'fonts'].forEach(dir => {
    const dirPath = path.join(OUTPUT_DIR, dir);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
});

// Track downloaded assets to avoid duplicates
const downloadedAssets = new Set();

// Helper to get file extension from URL
function getFileExtension(url) {
    const pathname = new URL(url).pathname;
    const ext = path.extname(pathname);
    return ext || '.html';
}

// Helper to determine asset type and destination
function getAssetInfo(url) {
    const ext = getFileExtension(url).toLowerCase();
    const parsed = new URL(url);
    
    if (['.css'].includes(ext)) {
        return { type: 'css', dir: 'css' };
    } else if (['.js'].includes(ext)) {
        return { type: 'js', dir: 'js' };
    } else if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico'].includes(ext)) {
        return { type: 'image', dir: 'images' };
    } else if (['.webm', '.mp4', '.mov'].includes(ext)) {
        return { type: 'video', dir: 'videos' };
    } else if (['.woff', '.woff2', '.ttf', '.otf', '.eot'].includes(ext)) {
        return { type: 'font', dir: 'fonts' };
    }
    
    return { type: 'other', dir: 'assets' };
}

// Create the crawler
const crawler = new PlaywrightCrawler({
    maxRequestsPerCrawl: MAX_PAGES,
    
    // Browser configuration
    launchContext: {
        launchOptions: {
            headless: true,
        },
    },
    
    // Request handler
    async requestHandler({ request, page, enqueueLinks, log }) {
        const url = request.url;
        log.info(`Processing: ${url}`);
        
        // Scroll to trigger lazy-loaded images
        await page.evaluate(async () => {
            await new Promise((resolve) => {
                let totalHeight = 0;
                const distance = 500;
                const timer = setInterval(() => {
                    const scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;
                    
                    if (totalHeight >= scrollHeight) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 100);
            });
        });
        
        // Wait for images to load
        await page.waitForTimeout(2000);
        
        // Get the final HTML after JavaScript execution
        const html = await page.content();
        
        // Determine file path
        const parsedUrl = new URL(url);
        let filePath = parsedUrl.pathname;
        
        // Handle root path
        if (filePath === '/' || filePath === '') {
            filePath = 'index.html';
        } else if (!path.extname(filePath)) {
            // Clean URL - add .html extension for saving
            filePath = path.join(filePath, 'index.html');
        }
        
        // Remove leading slash and save
        const outputPath = path.join(OUTPUT_DIR, filePath.replace(/^\//, ''));
        const outputDir = path.dirname(outputPath);
        
        // Ensure directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Save HTML file
        fs.writeFileSync(outputPath, html);
        log.info(`Saved: ${outputPath}`);
        
        // Download assets
        const assetUrls = await page.evaluate(() => {
            const urls = [];
            
            // CSS files
            document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
                if (link.href) urls.push(link.href);
            });
            
            // JS files
            document.querySelectorAll('script[src]').forEach(script => {
                if (script.src) urls.push(script.src);
            });
            
            // Images
            document.querySelectorAll('img').forEach(img => {
                if (img.src) urls.push(img.src);
                // Handle data-src for lazy-loaded images
                if (img.dataset.src) urls.push(img.dataset.src);
            });
            
            // Background images
            document.querySelectorAll('*').forEach(el => {
                const style = window.getComputedStyle(el);
                const bgImage = style.backgroundImage;
                if (bgImage && bgImage !== 'none') {
                    const match = bgImage.match(/url\(["']?([^"')]+)["']?\)/);
                    if (match) urls.push(match[1]);
                }
            });
            
            // Videos
            document.querySelectorAll('video source').forEach(source => {
                if (source.src) urls.push(source.src);
            });
            
            return urls;
        });
        
        // Download each asset
        for (const assetUrl of assetUrls) {
            try {
                // Skip data URLs and javascript URLs
                if (assetUrl.startsWith('data:') || assetUrl.startsWith('javascript:')) {
                    continue;
                }
                
                // Resolve relative URLs
                const absoluteUrl = new URL(assetUrl, url).href;
                
                // Skip if already downloaded
                if (downloadedAssets.has(absoluteUrl)) {
                    continue;
                }
                
                // Skip external domains (except fonts.googleapis and fonts.gstatic)
                const assetParsed = new URL(absoluteUrl);
                const allowedDomains = ['www.avir.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];
                if (!allowedDomains.includes(assetParsed.hostname)) {
                    continue;
                }
                
                downloadedAssets.add(absoluteUrl);
                
                // Download asset
                const response = await page.evaluate(async (url) => {
                    try {
                        const res = await fetch(url);
                        if (!res.ok) return null;
                        const blob = await res.blob();
                        const buffer = await blob.arrayBuffer();
                        return Array.from(new Uint8Array(buffer));
                    } catch (e) {
                        return null;
                    }
                }, absoluteUrl);
                
                if (response) {
                    const assetInfo = getAssetInfo(absoluteUrl);
                    const fileName = path.basename(assetParsed.pathname) || 'asset';
                    const assetPath = path.join(OUTPUT_DIR, assetInfo.dir, fileName);
                    
                    fs.writeFileSync(assetPath, Buffer.from(response));
                    log.info(`Downloaded asset: ${assetPath}`);
                }
            } catch (error) {
                log.warning(`Failed to download asset: ${assetUrl} - ${error.message}`);
            }
        }
        
        // Enqueue links for crawling
        await enqueueLinks({
            globs: ['https://www.avir.com/**'],
        });
    },
    
    // Error handler
    async failedRequestHandler({ request, log }) {
        log.error(`Request failed: ${request.url}`);
    },
});

// Run the crawler
(async () => {
    console.log('Starting crawler...');
    console.log(`Output directory: ${OUTPUT_DIR}`);
    console.log(`Start URL: ${START_URL}`);
    
    await crawler.run([START_URL]);
    
    console.log('\nCrawl complete!');
    console.log(`Downloaded ${downloadedAssets.size} assets`);
    
    // Generate summary
    const stats = {
        htmlFiles: 0,
        cssFiles: 0,
        jsFiles: 0,
        images: 0,
        videos: 0,
        fonts: 0,
    };
    
    function countFiles(dir, type) {
        if (!fs.existsSync(dir)) return 0;
        return fs.readdirSync(dir).filter(f => fs.statSync(path.join(dir, f)).isFile()).length;
    }
    
    stats.htmlFiles = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.html')).length;
    stats.cssFiles = countFiles(path.join(OUTPUT_DIR, 'css'));
    stats.jsFiles = countFiles(path.join(OUTPUT_DIR, 'js'));
    stats.images = countFiles(path.join(OUTPUT_DIR, 'images'));
    stats.videos = countFiles(path.join(OUTPUT_DIR, 'videos'));
    stats.fonts = countFiles(path.join(OUTPUT_DIR, 'fonts'));
    
    console.log('\nSummary:');
    console.log(`  HTML files: ${stats.htmlFiles}`);
    console.log(`  CSS files: ${stats.cssFiles}`);
    console.log(`  JS files: ${stats.jsFiles}`);
    console.log(`  Images: ${stats.images}`);
    console.log(`  Videos: ${stats.videos}`);
    console.log(`  Fonts: ${stats.fonts}`);
    
    // Save stats to file
    fs.writeFileSync(path.join(OUTPUT_DIR, 'crawl-stats.json'), JSON.stringify(stats, null, 2));
})();
