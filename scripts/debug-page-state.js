const { chromium } = require('playwright');

async function debugPage(url) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log(`\nNavigating to: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    
    await page.waitForTimeout(3000);
    
    const debug = await page.evaluate(() => {
      const leftBar = document.querySelector('.left-bar');
      const pageContent = document.querySelector('.page-content');
      const heroWrap = document.querySelector('.hero-wrap');
      
      return {
        bodyHeight: document.body.scrollHeight,
        leftBar: leftBar ? {
          exists: true,
          height: leftBar.offsetHeight,
          display: window.getComputedStyle(leftBar).display,
          position: window.getComputedStyle(leftBar).position,
          top: window.getComputedStyle(leftBar).top,
          bottom: window.getComputedStyle(leftBar).bottom,
        } : { exists: false },
        pageContent: pageContent ? {
          exists: true,
          opacity: window.getComputedStyle(pageContent).opacity,
          transform: window.getComputedStyle(pageContent).transform,
        } : { exists: false },
        heroWrap: heroWrap ? {
          exists: true,
          display: window.getComputedStyle(heroWrap).display,
        } : { exists: false },
        cssLoaded: !!document.querySelector('link[href*="avir-site.shared"]'),
        webflowLoaded: typeof window.Webflow !== 'undefined',
      };
    });
    
    console.log('\nDebug Info:');
    console.log(JSON.stringify(debug, null, 2));
    
    await browser.close();
    return 0;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    await browser.close();
    return 1;
  }
}

const url = process.argv[2] || 'http://localhost:8791/city/palm-desert.html';
debugPage(url).then(code => process.exit(code));
