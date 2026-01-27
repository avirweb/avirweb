const { chromium } = require('playwright');

async function comparePages() {
  const browser = await chromium.launch();
  
  const prodPage = await browser.newPage();
  const localPage = await browser.newPage();
  
  try {
    console.log('\n=== PRODUCTION (avir.com/index) ===');
    await prodPage.goto('https://www.avir.com/', { waitUntil: 'networkidle', timeout: 30000 });
    await prodPage.waitForTimeout(3000);
    
    const prodHeight = await prodPage.evaluate(() => document.body.scrollHeight);
    console.log(`Body height: ${prodHeight}px`);
    
    console.log('\n=== LOCAL (localhost:8791/index.html) ===');
    await localPage.goto('http://localhost:8791/index.html', { waitUntil: 'networkidle', timeout: 30000 });
    await localPage.waitForTimeout(3000);
    
    const localHeight = await localPage.evaluate(() => document.body.scrollHeight);
    console.log(`Body height: ${localHeight}px`);
    
    console.log('\n=== COMPARISON ===');
    console.log(`Height difference: ${Math.abs(prodHeight - localHeight)}px`);
    
    await browser.close();
    return 0;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    await browser.close();
    return 1;
  }
}

comparePages().then(code => process.exit(code));
