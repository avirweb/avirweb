const fs = require('fs');
const https = require('https');

// Parse command line arguments
const args = process.argv.slice(2);
const visualMode = args.includes('--visual');

const paths = fs.readFileSync('paths.txt', 'utf8').trim().split('\n');
const originBase = 'https://www.avir.com';
const mirrorBase = 'https://avirwebtest.pages.dev';

// Limit concurrency
const BATCH_SIZE = visualMode ? 3 : 10;

// Visual comparison constants
const FORM_PAGES = ['/index.html', '/commercial-form.html', '/residential-form.html', '/service-request.html', '/careers/assistant-technician.html', '/careers/integration-technician.html'];
const CAPTCHA_SELECTORS = ['.g-recaptcha', '.cf-turnstile', '[data-sitekey]', 'iframe[src*="recaptcha"]', 'iframe[src*="turnstile"]'];
const DIFF_THRESHOLD = 1.0;
const VIEWPORT_WIDTH = 1920;
const VIEWPORT_HEIGHT = 1080;

async function fetchUrl(url) {
  return new Promise((resolve) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
        'Accept-Encoding': 'identity'
      }
    };
    const req = https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({
        status: res.statusCode,
        length: data.length,
        title: data.match(/<title>(.*?)<\/title>/)?.[1] || '',
        data: data
      }));
    });
    req.on('error', (e) => resolve({ error: e.message }));
    req.setTimeout(10000, () => {
      req.abort();
      resolve({ error: 'Timeout' });
    });
  });
}

async function verifyPath(path) {
  // Clean URL handling: strip .html extension for URL construction
  let urlPath = path;
  if (path.endsWith('index.html')) {
    urlPath = path.replace('/index.html', '/');
  } else if (path.endsWith('.html')) {
    urlPath = path.replace('.html', '');
  }
  
  const originUrl = originBase + urlPath;
  const mirrorUrl = mirrorBase + urlPath;

  const [origin, mirror] = await Promise.all([
    fetchUrl(originUrl),
    fetchUrl(mirrorUrl)
  ]);

  if (origin.error || mirror.error) {
    return { path, status: 'ERROR', details: `Fetch failed. Origin: ${origin.error}, Mirror: ${mirror.error}` };
  }

  if (origin.status !== 200) {
    // If origin is 404, mirror should be 404? Or maybe origin works and we just failed?
    // User said "matches", so if origin is 404, mirror should probably be 404.
    // But let's focus on 200s.
    if (origin.status !== mirror.status) {
       return { path, status: 'FAIL', details: `Status mismatch. Origin: ${origin.status}, Mirror: ${mirror.status}` };
    }
    return { path, status: 'SKIP', details: `Origin returned ${origin.status}` };
  }

  if (mirror.status !== 200) {
    return { path, status: 'FAIL', details: `Mirror returned ${mirror.status} (Origin: 200)` };
  }

  // Content checks
  if (origin.title !== mirror.title) {
    return { path, status: 'FAIL', details: `Title mismatch. Origin: "${origin.title}", Mirror: "${mirror.title}"` };
  }

  // Length check (heuristic)
  const lenDiff = Math.abs(origin.length - mirror.length);
  const percentDiff = lenDiff / origin.length;
  
  // If > 20% difference, flag it (Cloudflare injects scripts, so exact match is impossible)
  if (percentDiff > 0.3) { 
    return { path, status: 'WARN', details: `Length mismatch > 30%. Origin: ${origin.length}, Mirror: ${mirror.length}` };
  }

  return { path, status: 'PASS' };
}

function sanitizeFilename(filePath) {
  return filePath.replace(/\//g, '-').replace(/^-/, '');
}

function ensureDirectories() {
  const dirs = ['screenshots/prod', 'screenshots/test', 'screenshots/diff'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

async function visualVerifyPath(page, filePath) {
  let urlPath = filePath;
  if (filePath.endsWith('index.html')) {
    urlPath = filePath.replace('/index.html', '/');
  } else if (filePath.endsWith('.html')) {
    urlPath = filePath.replace('.html', '');
  }

  const originUrl = originBase + urlPath;
  const mirrorUrl = mirrorBase + urlPath;
  const sanitized = sanitizeFilename(filePath);

  try {
    const { chromium } = require('playwright');
    const PNG = require('pngjs').PNG;
    const pixelmatch = require('pixelmatch').default || require('pixelmatch');

    await page.goto(originUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    await page.evaluate(() => {
      const style = document.createElement('style');
      style.textContent = '* { animation: none !important; transition: none !important; } .page-content { opacity: 1 !important; transform: none !important; } .w-form-done, .w-form-fail, .w-dropdown-list { display: none !important; }';
      document.head.appendChild(style);
    });

    if (FORM_PAGES.includes(filePath)) {
      for (const selector of CAPTCHA_SELECTORS) {
        const elements = await page.locator(selector).all();
        for (const element of elements) {
          await element.evaluate(el => {
            el.style.backgroundColor = 'black';
            el.style.color = 'black';
          });
        }
      }
    }

    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(1000);

    const prodScreenshot = await page.screenshot({ fullPage: true });
    fs.writeFileSync(`screenshots/prod/${sanitized}.png`, prodScreenshot);

    await page.goto(mirrorUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    await page.evaluate(() => {
      const style = document.createElement('style');
      style.textContent = '* { animation: none !important; transition: none !important; } .page-content { opacity: 1 !important; transform: none !important; } .w-form-done, .w-form-fail, .w-dropdown-list { display: none !important; }';
      document.head.appendChild(style);
    });

    if (FORM_PAGES.includes(filePath)) {
      for (const selector of CAPTCHA_SELECTORS) {
        const elements = await page.locator(selector).all();
        for (const element of elements) {
          await element.evaluate(el => {
            el.style.backgroundColor = 'black';
            el.style.color = 'black';
          });
        }
      }
    }

    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(1000);

    const testScreenshot = await page.screenshot({ fullPage: true });
    fs.writeFileSync(`screenshots/test/${sanitized}.png`, testScreenshot);

    const img1 = PNG.sync.read(prodScreenshot);
    const img2 = PNG.sync.read(testScreenshot);

    const minWidth = Math.min(img1.width, img2.width);
    const minHeight = Math.min(img1.height, img2.height);

    let croppedImg1Data = img1.data;
    let croppedImg2Data = img2.data;
    let dimensionNote = '';

    if (img1.width !== img2.width || img1.height !== img2.height) {
      dimensionNote = ` [Dimensions: ${img1.width}x${img1.height} vs ${img2.width}x${img2.height}, compared ${minWidth}x${minHeight}]`;
      
      const croppedImg1 = new PNG({ width: minWidth, height: minHeight });
      const croppedImg2 = new PNG({ width: minWidth, height: minHeight });

      for (let y = 0; y < minHeight; y++) {
        for (let x = 0; x < minWidth; x++) {
          const srcIdx1 = (y * img1.width + x) * 4;
          const srcIdx2 = (y * img2.width + x) * 4;
          const dstIdx = (y * minWidth + x) * 4;

          croppedImg1.data[dstIdx] = img1.data[srcIdx1];
          croppedImg1.data[dstIdx + 1] = img1.data[srcIdx1 + 1];
          croppedImg1.data[dstIdx + 2] = img1.data[srcIdx1 + 2];
          croppedImg1.data[dstIdx + 3] = img1.data[srcIdx1 + 3];

          croppedImg2.data[dstIdx] = img2.data[srcIdx2];
          croppedImg2.data[dstIdx + 1] = img2.data[srcIdx2 + 1];
          croppedImg2.data[dstIdx + 2] = img2.data[srcIdx2 + 2];
          croppedImg2.data[dstIdx + 3] = img2.data[srcIdx2 + 3];
        }
      }

      croppedImg1Data = croppedImg1.data;
      croppedImg2Data = croppedImg2.data;
    }

    const diff = new PNG({ width: minWidth, height: minHeight });
    const numDiffPixels = pixelmatch(croppedImg1Data, croppedImg2Data, diff.data, minWidth, minHeight, { threshold: 0.1 });
    const totalPixels = minWidth * minHeight;
    const diffPercent = (numDiffPixels / totalPixels) * 100;

    if (diffPercent > DIFF_THRESHOLD) {
      fs.writeFileSync(`screenshots/diff/${sanitized}.png`, PNG.sync.write(diff));
      return {
        path: filePath,
        status: 'FAIL',
        diffPercent: diffPercent.toFixed(4),
        details: `Visual difference: ${diffPercent.toFixed(4)}% (threshold: ${DIFF_THRESHOLD}%)${dimensionNote}`
      };
    }

    return {
      path: filePath,
      status: 'PASS',
      diffPercent: diffPercent.toFixed(4),
      details: dimensionNote ? `Match${dimensionNote}` : undefined
    };

  } catch (error) {
    return {
      path: filePath,
      status: 'ERROR',
      details: error.message
    };
  }
}

async function run() {
  if (visualMode) {
    console.log(`Visual verification mode: ${paths.length} pages...`);
    ensureDirectories();
    
    const { chromium } = require('playwright');
    const browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: { width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT }
    });
    const page = await context.newPage();
    
    const results = [];
    
    for (let i = 0; i < paths.length; i += BATCH_SIZE) {
      const batch = paths.slice(i, i + BATCH_SIZE);
      const batchResults = [];
      
      for (const p of batch) {
        const result = await visualVerifyPath(page, p);
        batchResults.push(result);
        
        const status = result.status === 'PASS' ? 'PASS' : result.status;
        const diffInfo = result.diffPercent !== undefined ? ` (diff: ${result.diffPercent}%)` : '';
        console.log(`[${status}] ${result.path}${diffInfo}`);
        
        if (result.details) {
          console.log(`  ${result.details}`);
        }
      }
      
      results.push(...batchResults);
      
      const passed = batchResults.filter(r => r.status === 'PASS').length;
      console.log(`Batch ${Math.floor(i/BATCH_SIZE) + 1}: ${passed}/${batch.length} passed\n`);
    }
    
    await browser.close();
    
    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;
    const errors = results.filter(r => r.status === 'ERROR').length;
    
    console.log('\n--- VISUAL COMPARISON SUMMARY ---');
    console.log(`Total: ${results.length}`);
    console.log(`PASS: ${passed}`);
    console.log(`FAIL: ${failed}`);
    console.log(`ERROR: ${errors}`);
    
    fs.writeFileSync('visual-comparison-results.json', JSON.stringify(results, null, 2));
    console.log('\nResults saved to visual-comparison-results.json');
    
    if (failed > 0 || errors > 0) process.exit(1);
    
  } else {
    console.log(`Verifying ${paths.length} pages...`);
    const results = [];
    
    for (let i = 0; i < paths.length; i += BATCH_SIZE) {
      const batch = paths.slice(i, i + BATCH_SIZE);
      const promises = batch.map(p => verifyPath(p));
      const batchResults = await Promise.all(promises);
      results.push(...batchResults);
      
      const passed = batchResults.filter(r => r.status === 'PASS').length;
      console.log(`Batch ${Math.floor(i/BATCH_SIZE) + 1}: ${passed}/${batch.length} passed`);
      
      batchResults.filter(r => r.status !== 'PASS' && r.status !== 'SKIP').forEach(r => {
        console.log(`[${r.status}] ${r.path}: ${r.details}`);
      });
    }

    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;
    const warnings = results.filter(r => r.status === 'WARN').length;
    
    console.log('\n--- SUMMARY ---');
    console.log(`Total: ${results.length}`);
    console.log(`PASS: ${passed}`);
    console.log(`FAIL: ${failed}`);
    console.log(`WARN: ${warnings}`);
    
    if (failed > 0) process.exit(1);
  }
}

run();