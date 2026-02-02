#!/usr/bin/env node

/**
 * Post-Deploy Verification Script for AVIRWEBTEST.pages.dev
 * 
 * Verifies deployment succeeded by:
 * - Checking HTTP response status (200 OK)
 * - Testing key pages load correctly
 * - Verifying images display (no broken image icons)
 * - Verifying forms have required fields
 * - Checking for Turnstile captcha presence
 * 
 * Usage: node scripts/verify-deployment.js
 * Exit code: 0 on success, non-zero on failure
 */

const { chromium } = require('playwright');
const https = require('https');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const TARGET_URL = 'https://AVIRWEBTEST.pages.dev';
const REPORT_DIR = path.join(__dirname, '..', 'validation-tests');
const REPORT_FILE = path.join(REPORT_DIR, `verify-deployment-${Date.now()}.json`);

// Key pages to verify (based on site structure)
const PAGES_TO_VERIFY = [
    { path: '/', name: 'homepage', description: 'Homepage' },
    { path: '/services', name: 'services', description: 'Services page' },
    { path: '/contact', name: 'contact', description: 'Contact page' },
    { path: '/about-avir', name: 'about', description: 'About page' },
    { path: '/portfolio', name: 'portfolio', description: 'Portfolio page' },
    { path: '/blog', name: 'blog', description: 'Blog page' },
    { path: '/brands', name: 'brands', description: 'Brands page' }
];

// Results tracking
const results = {
    timestamp: new Date().toISOString(),
    targetUrl: TARGET_URL,
    summary: {
        totalChecks: 0,
        passed: 0,
        failed: 0,
        warnings: 0
    },
    checks: []
};

/**
 * Log a check result
 */
function logCheck(category, name, status, details = null) {
    const check = {
        category,
        name,
        status,
        details,
        timestamp: new Date().toISOString()
    };
    results.checks.push(check);
    results.summary.totalChecks++;
    
    if (status === 'PASS') {
        results.summary.passed++;
        console.log(`  ✓ ${category}: ${name}`);
    } else if (status === 'FAIL') {
        results.summary.failed++;
        console.log(`  ✗ ${category}: ${name}${details ? ` - ${details}` : ''}`);
    } else if (status === 'WARN') {
        results.summary.warnings++;
        console.log(`  ⚠ ${category}: ${name}${details ? ` - ${details}` : ''}`);
    }
    
    return check;
}

/**
 * Check HTTP response status for a URL
 */
async function checkHttpStatus(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { timeout: 10000 }, (res) => {
            resolve({
                statusCode: res.statusCode,
                headers: res.headers
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

/**
 * Verify main site responds with 200 OK
 */
async function verifyHttpResponse() {
    console.log('\n📡 HTTP Response Check');
    console.log('----------------------');
    
    try {
        const response = await checkHttpStatus(TARGET_URL);
        
        if (response.statusCode === 200) {
            logCheck('HTTP', 'Main site responds with 200 OK', 'PASS', { statusCode: 200 });
        } else {
            logCheck('HTTP', 'Main site responds with 200 OK', 'FAIL', { 
                statusCode: response.statusCode,
                expected: 200 
            });
        }
    } catch (error) {
        logCheck('HTTP', 'Main site responds with 200 OK', 'FAIL', error.message);
    }
}

/**
 * Verify all key pages load successfully
 */
async function verifyPages(browser) {
    console.log('\n📄 Page Load Verification');
    console.log('-------------------------');
    
    for (const pageInfo of PAGES_TO_VERIFY) {
        const page = await browser.newPage();
        
        try {
            const url = `${TARGET_URL}${pageInfo.path}`;
            const response = await page.goto(url, { 
                waitUntil: 'networkidle', 
                timeout: 30000 
            });
            
            if (response && response.ok()) {
                // Check for 404 indicators in title or content
                const title = await page.title();
                const has404Indicator = title.toLowerCase().includes('404') || 
                                       title.toLowerCase().includes('not found') ||
                                       title.toLowerCase().includes('error');
                
                if (!has404Indicator) {
                    logCheck('PAGE', `${pageInfo.description} loads`, 'PASS', { 
                        path: pageInfo.path,
                        status: response.status(),
                        title: title.substring(0, 50)
                    });
                } else {
                    logCheck('PAGE', `${pageInfo.description} loads`, 'FAIL', { 
                        path: pageInfo.path,
                        error: 'Page shows 404/error indicator',
                        title
                    });
                }
            } else {
                logCheck('PAGE', `${pageInfo.description} loads`, 'FAIL', { 
                    path: pageInfo.path,
                    status: response ? response.status() : 'no response'
                });
            }
        } catch (error) {
            logCheck('PAGE', `${pageInfo.description} loads`, 'FAIL', { 
                path: pageInfo.path,
                error: error.message 
            });
        } finally {
            await page.close();
        }
    }
}

/**
 * Verify images have loaded (no broken images)
 */
async function verifyImages(browser) {
    console.log('\n🖼️  Image Verification');
    console.log('----------------------');
    
    const page = await browser.newPage();
    
    try {
        await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 30000 });
        
        // Check for broken images
        const brokenImages = await page.evaluate(() => {
            const images = Array.from(document.querySelectorAll('img'));
            return images
                .filter(img => {
                    // Image is broken if:
                    // 1. It has no src or empty src
                    // 2. It's not complete
                    // 3. It has naturalWidth of 0 (failed to load)
                    const hasEmptySrc = !img.src || img.src === '' || img.src === window.location.href;
                    const isNotComplete = !img.complete;
                    const hasZeroWidth = img.naturalWidth === 0;
                    
                    return hasEmptySrc || isNotComplete || hasZeroWidth;
                })
                .map(img => ({
                    src: img.src || img.getAttribute('data-src') || 'no-src',
                    alt: img.alt || 'no-alt',
                    hasEmptySrc: !img.src || img.src === '' || img.src === window.location.href,
                    isNotComplete: !img.complete,
                    hasZeroWidth: img.naturalWidth === 0
                }));
        });
        
        if (brokenImages.length === 0) {
            logCheck('IMAGES', 'No broken images on homepage', 'PASS');
        } else {
            logCheck('IMAGES', 'No broken images on homepage', 'FAIL', { 
                brokenCount: brokenImages.length,
                examples: brokenImages.slice(0, 5)
            });
        }
        
        // Also check for empty src attributes specifically
        const emptySrcImages = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('img[src=""], img:not([src])'))
                .map(img => ({
                    alt: img.alt || 'no-alt',
                    dataSrc: img.getAttribute('data-src') || null
                }));
        });
        
        if (emptySrcImages.length === 0) {
            logCheck('IMAGES', 'No empty src attributes', 'PASS');
        } else {
            logCheck('IMAGES', 'No empty src attributes', 'WARN', { 
                count: emptySrcImages.length,
                examples: emptySrcImages.slice(0, 3)
            });
        }
        
    } catch (error) {
        logCheck('IMAGES', 'Image verification', 'FAIL', error.message);
    } finally {
        await page.close();
    }
}

/**
 * Verify forms have required fields and Turnstile
 */
async function verifyForms(browser) {
    console.log('\n📝 Form Verification');
    console.log('--------------------');
    
    const page = await browser.newPage();
    
    try {
        // Check contact page forms
        await page.goto(`${TARGET_URL}/contact`, { waitUntil: 'networkidle', timeout: 30000 });
        
        const forms = await page.$$('form');
        
        if (forms.length === 0) {
            logCheck('FORMS', 'Forms found on contact page', 'WARN', { count: 0 });
        } else {
            logCheck('FORMS', 'Forms found on contact page', 'PASS', { count: forms.length });
            
            for (let i = 0; i < forms.length; i++) {
                const form = forms[i];
                
                // Check for input fields
                const inputs = await form.$$('input, textarea, select');
                const inputDetails = [];
                
                for (const input of inputs) {
                    const name = await input.getAttribute('name');
                    const type = await input.getAttribute('type');
                    const required = await input.evaluate(el => el.required);
                    
                    if (name) {
                        inputDetails.push({ name, type: type || 'text', required: !!required });
                    }
                }
                
                if (inputDetails.length > 0) {
                    logCheck('FORMS', `Form ${i + 1} has input fields`, 'PASS', { 
                        fieldCount: inputDetails.length,
                        fields: inputDetails.slice(0, 5)
                    });
                } else {
                    logCheck('FORMS', `Form ${i + 1} has input fields`, 'WARN', { count: 0 });
                }
                
                // Check for Turnstile captcha
                const turnstileElements = await form.$$('.cf-turnstile, [data-turnstile-sitekey], iframe[src*="turnstile"]');
                const turnstileScript = await page.$('script[src*="turnstile"]');
                
                if (turnstileElements.length > 0 || turnstileScript) {
                    logCheck('FORMS', `Form ${i + 1} has Turnstile captcha`, 'PASS');
                } else {
                    logCheck('FORMS', `Form ${i + 1} has Turnstile captcha`, 'WARN', { 
                        message: 'Turnstile not detected - may be loaded dynamically'
                    });
                }
                
                // Check for submit button
                const submitButton = await form.$('input[type="submit"], button[type="submit"]');
                if (submitButton) {
                    logCheck('FORMS', `Form ${i + 1} has submit button`, 'PASS');
                } else {
                    logCheck('FORMS', `Form ${i + 1} has submit button`, 'WARN');
                }
            }
        }
        
        // Also check service-request page
        await page.goto(`${TARGET_URL}/service-request`, { waitUntil: 'networkidle', timeout: 30000 });
        const serviceForms = await page.$$('form');
        
        if (serviceForms.length > 0) {
            logCheck('FORMS', 'Forms found on service-request page', 'PASS', { count: serviceForms.length });
        }
        
    } catch (error) {
        logCheck('FORMS', 'Form verification', 'FAIL', error.message);
    } finally {
        await page.close();
    }
}

/**
 * Verify site structure and key elements
 */
async function verifySiteStructure(browser) {
    console.log('\n🏗️  Site Structure Verification');
    console.log('-------------------------------');
    
    const page = await browser.newPage();
    
    try {
        await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 30000 });
        
        // Check for DOCTYPE
        const hasDoctype = await page.evaluate(() => {
            return document.doctype !== null;
        });
        
        if (hasDoctype) {
            logCheck('STRUCTURE', 'Page has DOCTYPE declaration', 'PASS');
        } else {
            logCheck('STRUCTURE', 'Page has DOCTYPE declaration', 'WARN');
        }
        
        // Check for title
        const title = await page.title();
        if (title && title.length > 0 && !title.toLowerCase().includes('404')) {
            logCheck('STRUCTURE', 'Page has valid title', 'PASS', { title: title.substring(0, 50) });
        } else {
            logCheck('STRUCTURE', 'Page has valid title', 'FAIL', { title });
        }
        
        // Check for meta description
        const metaDescription = await page.$eval('meta[name="description"]', el => el.content)
            .catch(() => null);
        
        if (metaDescription && metaDescription.length > 10) {
            logCheck('STRUCTURE', 'Page has meta description', 'PASS', { 
                description: metaDescription.substring(0, 100) 
            });
        } else {
            logCheck('STRUCTURE', 'Page has meta description', 'WARN');
        }
        
        // Check for navigation
        const hasNav = await page.evaluate(() => {
            return document.querySelector('nav, header, [role="navigation"]') !== null;
        });
        
        if (hasNav) {
            logCheck('STRUCTURE', 'Page has navigation element', 'PASS');
        } else {
            logCheck('STRUCTURE', 'Page has navigation element', 'WARN');
        }
        
        // Check for footer
        const hasFooter = await page.evaluate(() => {
            return document.querySelector('footer') !== null;
        });
        
        if (hasFooter) {
            logCheck('STRUCTURE', 'Page has footer element', 'PASS');
        } else {
            logCheck('STRUCTURE', 'Page has footer element', 'WARN');
        }
        
    } catch (error) {
        logCheck('STRUCTURE', 'Site structure verification', 'FAIL', error.message);
    } finally {
        await page.close();
    }
}

/**
 * Save verification report to file
 */
async function saveReport() {
    try {
        await fs.mkdir(REPORT_DIR, { recursive: true });
        await fs.writeFile(REPORT_FILE, JSON.stringify(results, null, 2), 'utf8');
        console.log(`\n📄 Report saved: ${REPORT_FILE}`);
    } catch (error) {
        console.error(`\n⚠️  Failed to save report: ${error.message}`);
    }
}

/**
 * Print summary
 */
function printSummary() {
    console.log('\n' + '='.repeat(50));
    console.log('  VERIFICATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`Target: ${TARGET_URL}`);
    console.log(`Total Checks: ${results.summary.totalChecks}`);
    console.log(`✓ Passed: ${results.summary.passed}`);
    console.log(`✗ Failed: ${results.summary.failed}`);
    console.log(`⚠ Warnings: ${results.summary.warnings}`);
    console.log('='.repeat(50));
    
    if (results.summary.failed === 0) {
        console.log('\n🎉 All critical checks passed!');
        console.log('Deployment verification: SUCCESS');
        return true;
    } else {
        console.log('\n⚠️  Some checks failed.');
        console.log('Deployment verification: FAILED');
        return false;
    }
}

/**
 * Main verification function
 */
async function main() {
    console.log('========================================');
    console.log('  Post-Deploy Verification');
    console.log('========================================');
    console.log(`Target: ${TARGET_URL}`);
    console.log('');
    
    let browser;
    
    try {
        // HTTP checks (no browser needed)
        await verifyHttpResponse();
        
        // Launch browser for page verification
        console.log('\n🚀 Launching browser...');
        browser = await chromium.launch({ headless: true });
        
        // Run all verification checks
        await verifyPages(browser);
        await verifyImages(browser);
        await verifyForms(browser);
        await verifySiteStructure(browser);
        
    } catch (error) {
        console.error('\n❌ Fatal error during verification:', error.message);
        logCheck('SYSTEM', 'Verification execution', 'FAIL', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
    
    // Save report
    await saveReport();
    
    // Print summary and exit
    const success = printSummary();
    process.exit(success ? 0 : 1);
}

// Run if executed directly
if (require.main === module) {
    main().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = { main, results };
