const { PlaywrightCrawler, Dataset } = require('crawlee');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const START_URL = 'https://www.avir.com/';
const OUTPUT_DIR = 'site-new';
const MAX_PAGES = 200;

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

['images/css', 'images/js', 'images', 'videos', 'fonts'].forEach(dir => {
    const dirPath = path.join(OUTPUT_DIR, dir);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
});

const downloadedAssets = new Set();

function getFileExtension(url) {
    const pathname = new URL(url).pathname;
    const ext = path.extname(pathname);
    return ext || '.html';
}

function getAssetInfo(url) {
    const ext = getFileExtension(url).toLowerCase();
    const parsed = new URL(url);
    
    if (['.css'].includes(ext)) {
        return { type: 'css', dir: 'images/css' };
    } else if (['.js'].includes(ext)) {
        return { type: 'js', dir: 'images/js' };
    } else if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico'].includes(ext)) {
        return { type: 'image', dir: 'images' };
    } else if (['.webm', '.mp4', '.mov'].includes(ext)) {
        return { type: 'video', dir: 'videos' };
    } else if (['.woff', '.woff2', '.ttf', '.otf', '.eot'].includes(ext)) {
        return { type: 'font', dir: 'fonts' };
    }
    
    return { type: 'other', dir: 'assets' };
}

const crawler = new PlaywrightCrawler({
    maxRequestsPerCrawl: MAX_PAGES,
    
    launchContext: {
        launchOptions: {
            headless: true,
        },
    },
    
    async requestHandler({ request, page, enqueueLinks, log }) {
        const url = request.url;
        log.info(`Processing: ${url}`);
        
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
        
        await page.waitForTimeout(2000);
        
        const html = await page.content();
        
        const parsedUrl = new URL(url);
        let filePath = parsedUrl.pathname;
        
        if (filePath === '/' || filePath === '') {
            filePath = 'index.html';
        } else if (!path.extname(filePath)) {
            filePath = path.join(filePath, 'index.html');
        }
        
        const outputPath = path.join(OUTPUT_DIR, filePath.replace(/^\//, ''));
        const outputDir = path.dirname(outputPath);
        
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        fs.writeFileSync(outputPath, html);
        log.info(`Saved: ${outputPath}`);
        
        const assetUrls = await page.evaluate(() => {
            const urls = [];
            
            document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
                if (link.href) urls.push(link.href);
            });
            
            document.querySelectorAll('script[src]').forEach(script => {
                if (script.src) urls.push(script.src);
            });
            
            document.querySelectorAll('img').forEach(img => {
                if (img.src) urls.push(img.src);
                if (img.dataset.src) urls.push(img.dataset.src);
            });
            
            document.querySelectorAll('*').forEach(el => {
                const style = window.getComputedStyle(el);
                const bgImage = style.backgroundImage;
                if (bgImage && bgImage !== 'none') {
                    const match = bgImage.match(/url\(["']?([^"')]+)["']?\)/);
                    if (match) urls.push(match[1]);
                }
            });
            
            document.querySelectorAll('video source').forEach(source => {
                if (source.src) urls.push(source.src);
            });
            
            return urls;
        });
        
        for (const assetUrl of assetUrls) {
            try {
                if (assetUrl.startsWith('data:') || assetUrl.startsWith('javascript:')) {
                    continue;
                }
                
                const absoluteUrl = new URL(assetUrl, url).href;
                
                if (downloadedAssets.has(absoluteUrl)) {
                    continue;
                }
                
                const assetParsed = new URL(absoluteUrl);
                const allowedDomains = ['www.avir.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];
                if (!allowedDomains.includes(assetParsed.hostname)) {
                    continue;
                }
                
                downloadedAssets.add(absoluteUrl);
                
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
        
        await enqueueLinks({
            globs: ['https://www.avir.com/**'],
        });
    },
    
    async failedRequestHandler({ request, log }) {
        log.error(`Request failed: ${request.url}`);
    },
});

(async () => {
    console.log('Starting crawler...');
    console.log(`Output directory: ${OUTPUT_DIR}`);
    console.log(`Start URL: ${START_URL}`);
    
    await crawler.run([START_URL]);
    
    console.log('\nCrawl complete!');
    console.log(`Downloaded ${downloadedAssets.size} assets`);
    
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
    stats.cssFiles = countFiles(path.join(OUTPUT_DIR, 'images', 'css'));
    stats.jsFiles = countFiles(path.join(OUTPUT_DIR, 'images', 'js'));
    stats.images = countFiles(path.join(OUTPUT_DIR, 'images')) - stats.cssFiles - stats.jsFiles;
    stats.videos = countFiles(path.join(OUTPUT_DIR, 'videos'));
    stats.fonts = countFiles(path.join(OUTPUT_DIR, 'fonts'));
    
    console.log('\nSummary:');
    console.log(`  HTML files: ${stats.htmlFiles}`);
    console.log(`  CSS files: ${stats.cssFiles}`);
    console.log(`  JS files: ${stats.jsFiles}`);
    console.log(`  Images: ${stats.images}`);
    console.log(`  Videos: ${stats.videos}`);
    console.log(`  Fonts: ${stats.fonts}`);
    
    fs.writeFileSync(path.join(OUTPUT_DIR, 'crawl-stats.json'), JSON.stringify(stats, null, 2));
})();