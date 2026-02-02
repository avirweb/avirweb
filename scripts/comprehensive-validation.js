const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const DEPLOYED_SITE = 'https://avirwebtest.pages.dev';
const OUTPUT_DIR = path.join(__dirname, '../validation-tests');
const REPORT_PATH = path.join(OUTPUT_DIR, `validation-report-${Date.now()}.json`);

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const PAGES_TO_VALIDATE = [
    { path: '/', name: 'homepage', description: 'Homepage' },
    { path: '/services', name: 'services', description: 'Services page' },
    { path: '/contact', name: 'contact', description: 'Contact page' },
    { path: '/about', name: 'about', description: 'About page' },
    { path: '/team', name: 'team', description: 'Team page' },
    { path: '/portfolio', name: 'portfolio', description: 'Portfolio page' },
    { path: '/blog', name: 'blog', description: 'Blog page' }
];

async function testPageLoad(browser, pageInfo) {
    const page = await browser.newPage();
    const result = {
        page: pageInfo.description,
        path: pageInfo.path,
        pageLoad: { status: 'failed', loadTime: null, error: null },
        responsiveness: { status: 'failed', mobile: false, tablet: false, desktop: false },
        errors: [],
        warnings: []
    };

    try {
        const startTime = Date.now();
        await page.goto(DEPLOYED_SITE + pageInfo.path, { waitUntil: 'networkidle', timeout: 30000 });
        result.pageLoad.loadTime = Date.now() - startTime;
        result.pageLoad.status = 'passed';

        const pageTitle = await page.title();
        if (pageTitle.includes('404') || pageTitle.includes('Error')) {
            result.pageLoad.status = 'failed';
            result.pageLoad.error = 'Page returned 404 error';
        }

        const viewports = [
            { width: 375, height: 667, name: 'mobile' },
            { width: 768, height: 1024, name: 'tablet' },
            { width: 1920, height: 1080, name: 'desktop' }
        ];

        for (const viewport of viewports) {
            await page.setViewportSize(viewport);
            await page.waitForTimeout(1000);
            
            const bodyWidth = await page.evaluate(() => document.body.offsetWidth);
            const hasContent = await page.evaluate(() => {
                const content = document.querySelector('body').innerText.trim();
                return content.length > 100;
            });

            if (hasContent && bodyWidth > 0) {
                result.responsiveness[viewport.name] = true;
            }
        }

        result.responsiveness.status = Object.values(result.responsiveness)
            .filter(v => typeof v === 'boolean')
            .every(v => v) ? 'passed' : 'failed';

        page.on('console', msg => {
            if (msg.type() === 'error') {
                result.errors.push({
                    type: 'console_error',
                    message: msg.text(),
                    page: pageInfo.description
                });
            }
        });

        const brokenImages = await page.evaluate(() => {
            const images = Array.from(document.querySelectorAll('img'));
            return images.filter(img => !img.complete || img.naturalWidth === 0)
                         .map(img => img.src || img.getAttribute('data-src'));
        });

        if (brokenImages.length > 0) {
            result.warnings.push({
                type: 'broken_images',
                count: brokenImages.length,
                sources: brokenImages
            });
        }

        const cssIssues = await page.evaluate(() => {
            const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
            return styles.filter(link => !link.sheet).length;
        });

        if (cssIssues > 0) {
            result.warnings.push({
                type: 'css_load_issues',
                count: cssIssues
            });
        }

    } catch (error) {
        result.pageLoad.error = error.message;
        result.errors.push({
            type: 'navigation_error',
            message: error.message
        });
    } finally {
        await page.close();
    }

    return result;
}

async function testForms(browser) {
    const page = await browser.newPage();
    const result = {
        formTests: { status: 'failed', results: [] },
        errors: []
    };

    try {
        await page.goto(DEPLOYED_SITE + '/contact', { waitUntil: 'networkidle' });

        const forms = await page.$$('form');
        
        for (let i = 0; i < forms.length; i++) {
            const form = forms[i];
            const formResult = {
                formIndex: i + 1,
                fieldsFound: [],
                submissionTest: { status: 'not_tested', response: null }
            };

            try {
                const inputs = await form.$$('input, textarea, select');
                for (const input of inputs) {
                    const fieldName = await input.getAttribute('name');
                    const fieldType = await input.getAttribute('type');
                    const isRequired = await input.getProperty('required');
                    
                    if (fieldName) {
                        formResult.fieldsFound.push({
                            name: fieldName,
                            type: fieldType || 'text',
                            required: !!isRequired
                        });
                    }
                }

                const submitButton = await form.$('input[type="submit"], button[type="submit"]');
                
                if (submitButton) {
                    await page.fill('input[name*="name"], input[id*="name"]', 'Test User');
                    await page.fill('input[name*="email"], input[id*="email"]', 'test@example.com');
                    await page.fill('textarea', 'This is a test message.');

                    const [response] = await Promise.all([
                        page.waitForResponse(response => {
                            return response.url().includes('/api/submit-form') || 
                                   response.status() >= 200;
                        }),
                        form.submit()
                    ]);

                    formResult.submissionTest.status = 'tested';
                    formResult.submissionTest.response = {
                        status: response ? response.status() : 'no_response'
                    };
                }

            } catch (error) {
                formResult.submissionTest.status = 'error';
                formResult.submissionTest.error = error.message;
            }

            result.formTests.results.push(formResult);
        }

        result.formTests.status = result.formTests.results.length > 0 ? 'passed' : 'no_forms_found';

    } catch (error) {
        result.errors.push({
            type: 'form_testing_error',
            message: error.message
        });
    } finally {
        await page.close();
    }

    return result;
}

async function testLinks(browser) {
    const page = await browser.newPage();
    const result = {
        linkTests: { status: 'failed', totalLinks: 0, brokenLinks: [], workingLinks: [] },
        errors: []
    };

    try {
        await page.goto(DEPLOYED_SITE, { waitUntil: 'networkidle' });

        const links = await page.$$('a[href]');
        result.linkTests.totalLinks = links.length;

        const sampleLinks = links.slice(0, 20);

        for (const link of sampleLinks) {
            try {
                const href = await link.getAttribute('href');
                
                if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) {
                    continue;
                }

                const linkUrl = DEPLOYED_SITE + (href.startsWith('/') ? href : '/' + href);
                
                const newPage = await browser.newPage();
                const response = await newPage.goto(linkUrl, { waitUntil: 'domcontentloaded' });

                if (response && response.status() < 400) {
                    result.linkTests.workingLinks.push(href);
                } else {
                    result.linkTests.brokenLinks.push({
                        href: href,
                        status: response ? response.status() : 'failed_to_load'
                    });
                }

                await newPage.close();

            } catch (error) {
                result.linkTests.brokenLinks.push({
                    href: href,
                    error: error.message
                });
            }
        }

        result.linkTests.status = result.linkTests.brokenLinks.length === 0 ? 'passed' : 'failed';

    } catch (error) {
        result.errors.push({
            type: 'link_testing_error',
            message: error.message
        });
    } finally {
        await page.close();
    }

    return result;
}

async function runComprehensiveValidation() {
    console.log('🧪 Starting comprehensive validation tests...\n');

    const browser = await chromium.launch({ headless: true });
    const report = {
        timestamp: new Date().toISOString(),
        site: DEPLOYED_SITE,
        pageResults: [],
        formResults: null,
        linkResults: null,
        summary: {
            totalTests: 0,
            passed: 0,
            failed: 0,
            warnings: 0
        }
    };

    try {
        console.log('📄 Testing individual pages...');
        for (const pageInfo of PAGES_TO_VALIDATE) {
            console.log(`Testing: ${pageInfo.description}`);
            const pageResult = await testPageLoad(browser, pageInfo);
            report.pageResults.push(pageResult);
        }

        console.log('\n📝 Testing forms...');
        report.formResults = await testForms(browser);

        console.log('🔗 Testing links...');
        report.linkResults = await testLinks(browser);

        const pageTests = report.pageResults.map(r => ({ status: r.pageLoad.status === 'passed' && r.responsiveness.status === 'passed' ? 'passed' : 'failed' }));
        const formTest = { status: report.formResults.formTests.status };
        const linkTest = { status: report.linkResults.linkTests.status };

        const allTests = [...pageTests, formTest, linkTest];

        report.summary.totalTests = allTests.length;
        report.summary.passed = allTests.filter(t => t.status === 'passed').length;
        report.summary.failed = allTests.filter(t => t.status === 'failed').length;
        report.summary.warnings = allTests.reduce((sum, t) => 
            sum + (t.warnings ? t.warnings.length : 0), 0);

        fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

        console.log('\n📊 Validation Test Results:');
        console.log('============================');
        console.log(`Total Tests: ${report.summary.totalTests}`);
        console.log(`Passed: ${report.summary.passed}`);
        console.log(`Failed: ${report.summary.failed}`);
        console.log(`Warnings: ${report.summary.warnings}`);
        console.log(`Site Tested: ${report.site}`);

        if (report.summary.failed === 0) {
            console.log('\n🎉 All validation tests passed!');
        } else {
            console.log('\n⚠️  Some tests failed. Check the detailed report.');
        }

        console.log(`\n📄 Detailed report: ${REPORT_PATH}`);

        return report;

    } finally {
        await browser.close();
    }
}

if (require.main === module) {
    runComprehensiveValidation()
        .then(() => {
            console.log('\n✅ Comprehensive validation completed.');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Validation failed:', error);
            process.exit(1);
        });
}

module.exports = { runComprehensiveValidation };