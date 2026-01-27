const { chromium } = require('playwright');

async function waitForAnimations(url) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log(`\nNavigating to: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    
    console.log('\nWaiting for animations to complete...');
    
    for (let i = 0; i <= 10; i++) {
      await page.waitForTimeout(1000);
      
      const state = await page.evaluate((time) => {
        const leftBar = document.querySelector('.left-bar');
        return {
          time: time,
          height: document.body.scrollHeight,
          leftBarDisplay: leftBar ? window.getComputedStyle(leftBar).display : 'N/A',
          leftBarPosition: leftBar ? window.getComputedStyle(leftBar).position : 'N/A',
        };
      }, i);
      
      console.log(`${state.time}s: height=${state.height}px, display=${state.leftBarDisplay}, position=${state.leftBarPosition}`);
    }
    
    await browser.close();
    return 0;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    await browser.close();
    return 1;
  }
}

const url = process.argv[2] || 'http://localhost:8791/city/palm-desert.html';
waitForAnimations(url).then(code => process.exit(code));
