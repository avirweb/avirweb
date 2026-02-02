const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const LIVE_SITE = 'https://www.avir.com';
const DEPLOYED_SITE = 'https://avirwebtest.pages.dev';
const OUTPUT_DIR = path.join(__dirname, '../visual-tests');
const SCREENSHOT_DIR = path.join(OUTPUT_DIR, 'screenshots');
const DIFF_DIR = path.join(OUTPUT_DIR, 'diffs');

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
fs.mkdirSync(DIFF_DIR, { recursive: true });
const PAGES_TO_TEST = [
    { path: '/', name: 'homepage', description: 'Homepage' },
    { path: '/services', name: 'services', description: 'Services page' },
    { path: '/contact', name: 'contact', description: 'Contact page' },
    { path: '/about', name: 'about', description: 'About page' },
    { path: '/team', name: 'team', description: 'Team page' }
];

async function takeScreenshot(browser, url, filePath, viewport = { width: 1920, height: 1080 }) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    
    try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        
        await page.waitForTimeout(3000);
        
        await page.screenshot({ path: filePath, fullPage: true });
        
        console.log(`✓ Screenshot captured: ${filePath}`);
        return true;
    } catch (error) {
        console.error(`✗ Failed to capture screenshot for ${url}:`, error.message);
        return false;
    } finally {
        await context.close();
    }
}

async function compareScreenshots(img1Path, img2Path, diffPath, width, height) {
    const pixelmatch = require('pixelmatch').default;
    const { createCanvas, loadImage } = require('canvas');
    
    const image1 = await loadImage(img1Path);
    const image2 = await loadImage(img2Path);
    
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    ctx.drawImage(image1, 0, 0);
    ctx.drawImage(image2, 0, 0);
    
    const imageData1 = ctx.getImageData(0, 0, width, height);
    const imageData2 = ctx.getImageData(0, 0, width, height);
    const diff = ctx.createImageData(width, height);
    
    const numDiffPixels = pixelmatch(
        imageData1.data,
        imageData2.data,
        diff.data,
        width,
        height,
        { threshold: 0.1 }
    );
    
    ctx.putImageData(diff, 0, 0);
    fs.writeFileSync(diffPath, canvas.toBuffer());
    
    return numDiffPixels;
}

async function runVisualTests() {
    console.log('🔍 Starting visual regression tests...\n');
    
    const browser = await chromium.launch({ headless: true });
    const report = {
        timestamp: new Date().toISOString(),
        results: [],
        summary: {
            totalPages: PAGES_TO_TEST.length,
            passed: 0,
            failed: 0,
            averageDifference: 0
        }
    };
    
    try {
        for (const pageInfo of PAGES_TO_TEST) {
            console.log(`\n📸 Testing: ${pageInfo.description} (${pageInfo.path})`);
            
            const liveUrl = LIVE_SITE + pageInfo.path;
            const deployedUrl = DEPLOYED_SITE + pageInfo.path;
            
            const liveShotPath = path.join(SCREENSHOT_DIR, `${pageInfo.name}-live.png`);
            const deployedShotPath = path.join(SCREENSHOT_DIR, `${pageInfo.name}-deployed.png`);
            const diffPath = path.join(DIFF_DIR, `${pageInfo.name}-diff.png`);
            
            const liveSuccess = await takeScreenshot(browser, liveUrl, liveShotPath);
            const deployedSuccess = await takeScreenshot(browser, deployedUrl, deployedShotPath);
            
            if (!liveSuccess || !deployedSuccess) {
                report.results.push({
                    page: pageInfo.description,
                    path: pageInfo.path,
                    status: 'failed',
                    error: 'Failed to capture screenshots'
                });
                report.summary.failed++;
                continue;
            }
            
            try {
                const stats = fs.statSync(liveShotPath);
                const width = 1920;
                const height = 1080;
                
                const diffPixels = await compareScreenshots(liveShotPath, deployedShotPath, diffPath, width, height);
                const totalPixels = width * height;
                const diffPercentage = (diffPixels / totalPixels) * 100;
                
                const passed = diffPercentage < 1.0;
                
                report.results.push({
                    page: pageInfo.description,
                    path: pageInfo.path,
                    status: passed ? 'passed' : 'failed',
                    differencePercentage: diffPercentage,
                    diffPixels: diffPixels,
                    screenshots: {
                        live: liveShotPath,
                        deployed: deployedShotPath,
                        diff: diffPath
                    }
                });
                
                if (passed) {
                    report.summary.passed++;
                    console.log(`✓ Visual test passed: ${diffPercentage.toFixed(3)}% difference`);
                } else {
                    report.summary.failed++;
                    console.log(`✗ Visual test failed: ${diffPercentage.toFixed(3)}% difference (>1% threshold)`);
                }
                
            } catch (error) {
                console.error(`✗ Error comparing screenshots: ${error.message}`);
                report.results.push({
                    page: pageInfo.description,
                    path: pageInfo.path,
                    status: 'error',
                    error: error.message
                });
                report.summary.failed++;
            }
        }
        
        const validResults = report.results.filter(r => r.differencePercentage !== undefined);
        if (validResults.length > 0) {
            const totalDiff = validResults.reduce((sum, r) => sum + r.differencePercentage, 0);
            report.summary.averageDifference = totalDiff / validResults.length;
        }
        
        const reportPath = path.join(OUTPUT_DIR, `visual-report-${Date.now()}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log('\n📊 Visual Regression Test Results:');
        console.log('=====================================');
        console.log(`Total Pages Tested: ${report.summary.totalPages}`);
        console.log(`Passed: ${report.summary.passed}`);
        console.log(`Failed: ${report.summary.failed}`);
        console.log(`Average Difference: ${report.summary.averageDifference.toFixed(3)}%`);
        
        if (report.summary.failed === 0) {
            console.log('\n🎉 All visual tests passed! The deployed site matches the live site.');
        } else {
            console.log('\n⚠️  Some visual tests failed. Check the detailed report and diff images.');
        }
        
        console.log(`\n📄 Detailed report saved to: ${reportPath}`);
        console.log(`🖼️  Screenshots and diffs saved to: ${SCREENSHOT_DIR}`);
        
        return report;
        
    } finally {
        await browser.close();
    }
}

if (require.main === module) {
    runVisualTests()
        .then(() => {
            console.log('\n✅ Visual regression testing completed.');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Visual regression testing failed:', error);
            process.exit(1);
        });
}

module.exports = { runVisualTests, PAGES_TO_TEST };