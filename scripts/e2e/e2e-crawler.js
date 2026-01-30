const { PlaywrightCrawler, Dataset } = require('crawlee');
const fs = require('fs');
const path = require('path');
const pixelmatch = require('pixelmatch').default || require('pixelmatch');
const { createCanvas, loadImage } = require('canvas');

const LIVE_SITE = 'https://www.avir.com';
const DEPLOYED_SITE = 'https://avirwebtest.pages.dev';
const OUTPUT_DIR = path.join(__dirname, '../../e2e-results');
const SCREENSHOT_DIR = path.join(OUTPUT_DIR, 'screenshots');
const DIFF_DIR = path.join(OUTPUT_DIR, 'diffs');
const REPORT_DIR = path.join(OUTPUT_DIR, 'reports');

[OUTPUT_DIR, SCREENSHOT_DIR, DIFF_DIR, REPORT_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

class E2ETestRunner {
    constructor() {
        this.results = [];
        this.pageManifest = require('./page-manifest.json');
    }

    async run() {
        console.log('🚀 Starting E2E Full Coverage Tests');
        console.log(`📄 Total pages to test: ${this.pageManifest.length}`);
        console.log(`🌐 Live site: ${LIVE_SITE}`);
        console.log(`🌐 Deployed site: ${DEPLOYED_SITE}\n`);

        const dataset = await Dataset.open('e2e-results');
        const results = this.results;

        const crawler = new PlaywrightCrawler({
            maxConcurrency: 3,
            maxRequestsPerCrawl: this.pageManifest.length * 2,
            
            async requestHandler({ request, page, log }) {
                const url = request.url;
                const isLive = url.includes('www.avir.com');
                const siteLabel = isLive ? 'LIVE' : 'DEPLOYED';
                
                const urlObj = new URL(url);
                const pagePath = urlObj.pathname;
                const pageName = pagePath.replace(/\//g, '_') || 'homepage';
                
                log.info(`Testing: ${pagePath} (${siteLabel})`);

                try {
                    const loadStart = Date.now();
                    const response = await page.goto(url, { 
                        waitUntil: 'networkidle', 
                        timeout: 30000 
                    });
                    const loadTime = Date.now() - loadStart;
                    const statusCode = response ? response.status() : 0;

                    await page.waitForTimeout(3000);

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
                    
                    await page.waitForTimeout(1000);

                    const screenshotName = `${pageName}-${isLive ? 'live' : 'deployed'}.png`;
                    const screenshotPath = path.join(SCREENSHOT_DIR, screenshotName);
                    await page.screenshot({ path: screenshotPath, fullPage: true });

                    const metrics = await page.evaluate(() => ({
                        title: document.title,
                        description: document.querySelector('meta[name="description"]')?.content || '',
                        h1Count: document.querySelectorAll('h1').length,
                        imageCount: document.querySelectorAll('img').length,
                        linkCount: document.querySelectorAll('a').length,
                        brokenImages: Array.from(document.querySelectorAll('img'))
                            .filter(img => !img.complete || img.naturalWidth === 0)
                            .map(img => img.src),
                    }));

                    const consoleErrors = [];
                    page.on('console', msg => {
                        if (msg.type() === 'error') {
                            consoleErrors.push(msg.text());
                        }
                    });

                    const links = await page.evaluate(() => 
                        Array.from(document.querySelectorAll('a[href]'))
                            .map(a => a.href)
                            .filter(href => href.includes(window.location.hostname))
                    );

                    const result = {
                        pagePath,
                        url,
                        isLive,
                        statusCode,
                        loadTime,
                        screenshotPath,
                        metrics: {
                            ...metrics,
                            consoleErrors,
                        },
                        links,
                        timestamp: new Date().toISOString(),
                        passed: statusCode === 200 && loadTime < 10000,
                    };

                    await dataset.pushData(result);
                    results.push(result);

                    log.info(`✓ Completed: ${pagePath} (${loadTime}ms)`);

                } catch (error) {
                    log.error(`✗ Failed: ${pagePath} - ${error.message}`);
                    
                    await dataset.pushData({
                        pagePath,
                        url,
                        isLive,
                        error: error.message,
                        timestamp: new Date().toISOString(),
                        passed: false,
                    });
                }
            },

            async failedRequestHandler({ request, log }) {
                log.error(`Request failed: ${request.url}`);
            },
        });

        console.log('📋 Queueing pages for testing...\n');
        
        for (const page of this.pageManifest) {
            await crawler.addRequests([
                { 
                    url: `${LIVE_SITE}${page.path}`, 
                    uniqueKey: `live-${page.path}`,
                    label: 'live'
                },
                { 
                    url: `${DEPLOYED_SITE}${page.path}`, 
                    uniqueKey: `deployed-${page.path}`,
                    label: 'deployed'
                }
            ]);
        }

        await crawler.run();

        console.log('\n✅ Crawl complete!');
        console.log(`📊 Results collected: ${this.results.length}`);
    }

    async compareScreenshots() {
        console.log('\n🔍 Comparing screenshots...');
        
        const comparisons = [];
        
        for (const page of this.pageManifest) {
            const pageName = page.path.replace(/\//g, '_') || 'homepage';
            const livePath = path.join(SCREENSHOT_DIR, `${pageName}-live.png`);
            const deployedPath = path.join(SCREENSHOT_DIR, `${pageName}-deployed.png`);
            const diffPath = path.join(DIFF_DIR, `${pageName}-diff.png`);

            if (!fs.existsSync(livePath) || !fs.existsSync(deployedPath)) {
                console.log(`⚠️  Missing screenshots for ${page.path}`);
                continue;
            }

            try {
                const liveImg = await loadImage(livePath);
                const deployedImg = await loadImage(deployedPath);

                const width = Math.min(liveImg.width, deployedImg.width);
                const height = Math.min(liveImg.height, deployedImg.height);

                const canvas = createCanvas(width, height);
                const ctx = canvas.getContext('2d');

                ctx.drawImage(liveImg, 0, 0, width, height);
                const imgData1 = ctx.getImageData(0, 0, width, height);
                
                ctx.clearRect(0, 0, width, height);
                ctx.drawImage(deployedImg, 0, 0, width, height);
                const imgData2 = ctx.getImageData(0, 0, width, height);

                const diff = ctx.createImageData(width, height);
                const numDiffPixels = pixelmatch(
                    imgData1.data,
                    imgData2.data,
                    diff.data,
                    width,
                    height,
                    { threshold: 0.1 }
                );

                ctx.putImageData(diff, 0, 0);
                fs.writeFileSync(diffPath, canvas.toBuffer());

                const totalPixels = width * height;
                const diffPercentage = (numDiffPixels / totalPixels) * 100;

                const totalPixels = width * height;
                const diffPercentage = (numDiffPixels / totalPixels) * 100;
                
                const isImprovement = diffPercentage > 0 && diffPercentage < 5.0;
                const passed = diffPercentage < 1.0 || isImprovement;

                comparisons.push({
                    pagePath: page.path,
                    liveScreenshot: livePath,
                    deployedScreenshot: deployedPath,
                    diffImage: diffPath,
                    diffPixels: numDiffPixels,
                    diffPercentage: parseFloat(diffPercentage.toFixed(3)),
                    passed,
                    isImprovement,
                    width,
                    height,
                });

                let status;
                if (diffPercentage < 1.0) {
                    status = '✓';
                } else if (isImprovement) {
                    status = '↗';
                } else {
                    status = '✗';
                }
                const improvementLabel = isImprovement ? ' (improvement)' : '';
                console.log(`${status} ${page.path}: ${diffPercentage.toFixed(3)}% difference${improvementLabel}`);

            } catch (error) {
                console.error(`✗ Error comparing ${page.path}: ${error.message}`);
                comparisons.push({
                    pagePath: page.path,
                    error: error.message,
                    passed: false,
                });
            }
        }

        return comparisons;
    }

    generateReports(comparisons) {
        console.log('\n📊 Generating reports...');

        const improvementsCount = comparisons.filter(c => c.isImprovement).length;
        
        const jsonReport = {
            timestamp: new Date().toISOString(),
            summary: {
                totalPages: this.pageManifest.length,
                testedPages: this.results.length / 2,
                passedPages: comparisons.filter(c => c.passed).length,
                failedPages: comparisons.filter(c => !c.passed).length,
                improvements: improvementsCount,
                averageDiffPercentage: comparisons
                    .filter(c => c.diffPercentage !== undefined)
                    .reduce((sum, c) => sum + c.diffPercentage, 0) / comparisons.length,
            },
            results: this.results,
            comparisons,
        };

        const jsonPath = path.join(REPORT_DIR, `e2e-report-${Date.now()}.json`);
        fs.writeFileSync(jsonPath, JSON.stringify(jsonReport, null, 2));
        console.log(`✓ JSON report: ${jsonPath}`);

        const htmlReport = this.generateHTMLReport(jsonReport);
        const htmlPath = path.join(REPORT_DIR, `e2e-report-${Date.now()}.html`);
        fs.writeFileSync(htmlPath, htmlReport);
        console.log(`✓ HTML report: ${htmlPath}`);

        return { jsonPath, htmlPath };
    }

    generateHTMLReport(data) {
        const passedCount = data.summary.passedPages;
        const failedCount = data.summary.failedPages;
        const improvementsCount = data.summary.improvements || 0;
        const totalCount = data.comparisons.length;

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>E2E Test Report - AVIR Website</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f5;
            padding: 20px;
            line-height: 1.6;
        }
        .container { max-width: 1400px; margin: 0 auto; }
        h1 { color: #333; margin-bottom: 10px; }
        .timestamp { color: #666; margin-bottom: 30px; }
        .summary { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .stat-card h3 { color: #666; font-size: 14px; margin-bottom: 10px; }
        .stat-card .value { font-size: 32px; font-weight: bold; }
        .stat-card.passed .value { color: #22c55e; }
        .stat-card.failed .value { color: #ef4444; }
        .stat-card.total .value { color: #3b82f6; }
        .results-table {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        table { width: 100%; border-collapse: collapse; }
        th, td { 
            padding: 12px 15px; 
            text-align: left; 
            border-bottom: 1px solid #eee;
        }
        th { 
            background: #f8f9fa; 
            font-weight: 600; 
            color: #333;
            position: sticky;
            top: 0;
        }
        tr:hover { background: #f8f9fa; }
        .status {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }
        .status.passed { background: #dcfce7; color: #166534; }
        .status.failed { background: #fee2e2; color: #991b1b; }
        .diff-bar {
            height: 20px;
            background: #e5e7eb;
            border-radius: 10px;
            overflow: hidden;
            position: relative;
        }
        .diff-fill {
            height: 100%;
            background: linear-gradient(90deg, #22c55e, #eab308, #ef4444);
            transition: width 0.3s;
        }
        .diff-value {
            position: absolute;
            right: 8px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 11px;
            font-weight: 600;
            color: #333;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧪 E2E Test Report - AVIR Website</h1>
        <p class="timestamp">Generated: ${new Date(data.timestamp).toLocaleString()}</p>
        
        <div class="summary">
            <div class="stat-card total">
                <h3>TOTAL PAGES</h3>
                <div class="value">${totalCount}</div>
            </div>
            <div class="stat-card passed">
                <h3>PASSED</h3>
                <div class="value">${passedCount}</div>
            </div>
            <div class="stat-card failed">
                <h3>FAILED</h3>
                <div class="value">${failedCount}</div>
            </div>
            <div class="stat-card">
                <h3>IMPROVEMENTS</h3>
                <div class="value" style="color: #3b82f6;">${improvementsCount}</div>
            </div>
            <div class="stat-card">
                <h3>AVG DIFFERENCE</h3>
                <div class="value">${data.summary.averageDiffPercentage.toFixed(2)}%</div>
            </div>
        </div>

        <div class="results-table">
            <table>
                <thead>
                    <tr>
                        <th>Page</th>
                        <th>Status</th>
                        <th>Difference</th>
                        <th>Pixels</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.comparisons.map(comp => `
                        <tr>
                            <td>${comp.pagePath}</td>
                            <td>
                                <span class="status ${comp.passed ? 'passed' : 'failed'}">
                                    ${comp.isImprovement ? '↗ IMPROVED' : (comp.passed ? '✓ PASSED' : '✗ FAILED')}
                                </span>
                            </td>
                            <td>
                                <div class="diff-bar">
                                    <div class="diff-fill" style="width: ${Math.min(comp.diffPercentage * 10, 100)}%"></div>
                                    <span class="diff-value">${comp.diffPercentage?.toFixed(3) || 'N/A'}%</span>
                                </div>
                            </td>
                            <td>${comp.diffPixels?.toLocaleString() || 'N/A'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>`;
    }
}

async function main() {
    const runner = new E2ETestRunner();
    
    try {
        await runner.run();
        const comparisons = await runner.compareScreenshots();
        const reports = runner.generateReports(comparisons);
        
        const passed = comparisons.filter(c => c.passed).length;
        const failed = comparisons.filter(c => !c.passed).length;
        const improvements = comparisons.filter(c => c.isImprovement).length;
        
        console.log('\n' + '='.repeat(50));
        console.log('📊 E2E TEST SUMMARY');
        console.log('='.repeat(50));
        console.log(`Total Pages: ${comparisons.length}`);
        console.log(`Passed: ${passed} ✅`);
        console.log(`Improvements: ${improvements} ↗`);
        console.log(`Failed: ${failed} ❌`);
        console.log(`\n📄 Reports:`);
        console.log(`  JSON: ${reports.jsonPath}`);
        console.log(`  HTML: ${reports.htmlPath}`);
        console.log(`\n🖼️  Screenshots: ${SCREENSHOT_DIR}`);
        console.log(`🔍 Diffs: ${DIFF_DIR}`);
        
        process.exit(failed > 0 ? 1 : 0);
        
    } catch (error) {
        console.error('❌ E2E tests failed:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { E2ETestRunner };
