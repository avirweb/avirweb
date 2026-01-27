const { chromium } = require('playwright');

async function checkCSSRules(url) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log(`\nNavigating to: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    const cssInfo = await page.evaluate(() => {
      const leftBar = document.querySelector('.left-bar');
      if (!leftBar) return { error: 'left-bar not found' };
      
      const allRules = [];
      for (let sheet of document.styleSheets) {
        try {
          for (let rule of sheet.cssRules || []) {
            if (rule.selectorText && rule.selectorText.includes('left-bar')) {
              allRules.push({
                selector: rule.selectorText,
                display: rule.style.display,
                position: rule.style.position,
                href: sheet.href,
              });
            }
          }
        } catch (e) {
        }
      }
      
      const computed = window.getComputedStyle(leftBar);
      
      return {
        matchingRules: allRules,
        computed: {
          display: computed.display,
          position: computed.position,
        },
        inlineStyle: leftBar.style.cssText,
      };
    });
    
    console.log('\nCSS Rules for .left-bar:');
    console.log(JSON.stringify(cssInfo, null, 2));
    
    await browser.close();
    return 0;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    await browser.close();
    return 1;
  }
}

const url = process.argv[2] || 'http://localhost:8791/city/palm-desert.html';
checkCSSRules(url).then(code => process.exit(code));
