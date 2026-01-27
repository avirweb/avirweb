const { chromium } = require('playwright');

async function checkJSLoading(url) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const loadedScripts = [];
  const failedScripts = [];
  
  page.on('response', response => {
    if (response.url().endsWith('.js')) {
      if (response.status() === 200) {
        loadedScripts.push(response.url());
      } else {
        failedScripts.push({ url: response.url(), status: response.status() });
      }
    }
  });
  
  try {
    console.log(`\nNavigating to: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    
    await page.waitForTimeout(3000);
    
    console.log('\n✓ Loaded Scripts:');
    loadedScripts.forEach(script => {
      const filename = script.split('/').pop();
      console.log(`  - ${filename}`);
    });
    
    if (failedScripts.length > 0) {
      console.log('\n✗ Failed Scripts:');
      failedScripts.forEach(script => {
        const filename = script.url.split('/').pop();
        console.log(`  - ${filename} (${script.status})`);
      });
    }
    
    await browser.close();
    return failedScripts.length > 0 ? 1 : 0;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    await browser.close();
    return 1;
  }
}

const url = process.argv[2] || 'http://localhost:8791/city/palm-desert.html';
checkJSLoading(url).then(code => process.exit(code));
