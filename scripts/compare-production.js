const { chromium } = require('playwright');

async function comparePages() {
  const browser = await chromium.launch();
  
  const prodPage = await browser.newPage();
  const localPage = await browser.newPage();
  
  try {
    console.log('\n=== PRODUCTION (avir.com) ===');
    await prodPage.goto('https://www.avir.com/city/palm-desert', { waitUntil: 'networkidle', timeout: 30000 });
    await prodPage.waitForTimeout(3000);
    
    const prodDebug = await prodPage.evaluate(() => {
      const leftBar = document.querySelector('.left-bar');
      return {
        bodyHeight: document.body.scrollHeight,
        leftBar: leftBar ? {
          height: leftBar.offsetHeight,
          display: window.getComputedStyle(leftBar).display,
          position: window.getComputedStyle(leftBar).position,
        } : { exists: false },
      };
    });
    
    console.log(`Body height: ${prodDebug.bodyHeight}px`);
    console.log(`Left-bar display: ${prodDebug.leftBar.display}`);
    console.log(`Left-bar position: ${prodDebug.leftBar.position}`);
    
    console.log('\n=== LOCAL (localhost:8791) ===');
    await localPage.goto('http://localhost:8791/city/palm-desert.html', { waitUntil: 'networkidle', timeout: 30000 });
    await localPage.waitForTimeout(3000);
    
    const localDebug = await localPage.evaluate(() => {
      const leftBar = document.querySelector('.left-bar');
      return {
        bodyHeight: document.body.scrollHeight,
        leftBar: leftBar ? {
          height: leftBar.offsetHeight,
          display: window.getComputedStyle(leftBar).display,
          position: window.getComputedStyle(leftBar).position,
        } : { exists: false },
      };
    });
    
    console.log(`Body height: ${localDebug.bodyHeight}px`);
    console.log(`Left-bar display: ${localDebug.leftBar.display}`);
    console.log(`Left-bar position: ${localDebug.leftBar.position}`);
    
    console.log('\n=== COMPARISON ===');
    console.log(`Height difference: ${Math.abs(prodDebug.bodyHeight - localDebug.bodyHeight)}px`);
    
    await browser.close();
    return 0;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    await browser.close();
    return 1;
  }
}

comparePages().then(code => process.exit(code));
