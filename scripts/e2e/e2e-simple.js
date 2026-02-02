const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const pixelmatch = require('pixelmatch');
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

const pageManifest = require('./page-manifest.json');

async function captureScreenshot(browser, url, screenshotPath) {
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();
    
    try {
        const startTime = Date.now();
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        const loadTime = Date.now() - startTime;
        
        await page.waitForTimeout(2000);
        
        await page.screenshot({ path: screenshotPath, fullPage: true });
        
        await context.close();
        return { success: true, loadTime };
    } catch (error) {
        await context.close();
        return { success: false, error: error.message };
    }
}

async function compareScreenshots(livePath, deployedPath, diffPath) {
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

        return {
            diffPixels: numDiffPixels,
            diffPercentage: parseFloat(diffPercentage.toFixed(3)),
            passed: diffPercentage < 1.0,
            width,
            height,
        };
    } catch (error) {
        return { error: error.message, passed: false };
    }
}

async function runTests() {
    console.log('🚀 Starting E2E Full Coverage Tests');
    console.log(`📄 Total pages: ${pageManifest.length}`);
    
    const browser = await chromium.launch({ headless: true });
    const results = [];
    const comparisons = [];
    
    for (let i = 0; i < pageManifest.length; i++) {
        const page = pageManifest[i];
        const pageName = page.path.replace(/\//g, '_') || 'homepage';
        
        console.log(`\n[${i + 1}/${pageManifest.length}] Testing: ${page.path}`);
        
        const liveUrl = `${LIVE_SITE}${page.path}`;
        const deployedUrl = `${DEPLOYED_SITE}${page.path}`;
        const livePath = path.join(SCREENSHOT_DIR, `${pageName}-live.png`);
        const deployedPath = path.join(SCREENSHOT_DIR, `${pageName}-deployed.png`);
        const diffPath = path.join(DIFF_DIR, `${pageName}-diff.png`);
        
        const liveResult = await captureScreenshot(browser, liveUrl, livePath);
        const deployedResult = await captureScreenshot(browser, deployedUrl, deployedPath);
        
        results.push({
            pagePath: page.path,
            live: { ...liveResult, url: liveUrl, screenshotPath: livePath },
            deployed: { ...deployedResult, url: deployedUrl, screenshotPath: deployedPath },
        });
        
        if (liveResult.success && deployedResult.success) {
            const comparison = await compareScreenshots(livePath, deployedPath, diffPath);
            comparisons.push({
                pagePath: page.path,
                ...comparison,
                liveScreenshot: livePath,
                deployedScreenshot: deployedPath,
                diffImage: diffPath,
            });
            
            const status = comparison.passed ? '✅' : '❌';
            console.log(`${status} Diff: ${comparison.diffPercentage}%`);
        } else {
            console.log(`❌ Failed to capture screenshots`);
            comparisons.push({
                pagePath: page.path,
                passed: false,
                error: 'Screenshot capture failed',
            });
        }
    }
    
    await browser.close();
    
    const passedCount = comparisons.filter(c => c.passed).length;
    const failedCount = comparisons.filter(c => !c.passed).length;
    
    const jsonReport = {
        timestamp: new Date().toISOString(),
        summary: {
            totalPages: pageManifest.length,
            passedPages: passedCount,
            failedPages: failedCount,
            averageDiffPercentage: comparisons
                .filter(c => c.diffPercentage !== undefined)
                .reduce((sum, c) => sum + c.diffPercentage, 0) / comparisons.length || 0,
        },
        comparisons,
    };
    
    const jsonPath = path.join(REPORT_DIR, `e2e-report-${Date.now()}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(jsonReport, null, 2));
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 E2E TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Pages: ${pageManifest.length}`);
    console.log(`Passed: ${passedCount} ✅`);
    console.log(`Failed: ${failedCount} ❌`);
    console.log(`\n📄 Report: ${jsonPath}`);
    
    return jsonReport;
}

runTests().catch(console.error);
