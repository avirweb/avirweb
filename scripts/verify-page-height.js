const { chromium } = require('playwright');

async function checkPageHeight(url, expectedMin, expectedMax) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log(`\nNavigating to: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    
    await page.waitForTimeout(3000);
    
    const height = await page.evaluate(() => document.body.scrollHeight);
    const cssLoaded = await page.evaluate(() => {
      const link = document.querySelector('link[href*="avir-site.shared"]');
      return link !== null;
    });
    
    console.log(`\nResults:`);
    console.log(`  Page height: ${height}px`);
    console.log(`  CSS loaded: ${cssLoaded ? '✓ Yes' : '✗ No'}`);
    console.log(`  Expected range: ${expectedMin}px - ${expectedMax}px`);
    
    if (height >= expectedMin && height <= expectedMax) {
      console.log(`  Status: ✓ PASS - Height within expected range`);
      await browser.close();
      return 0;
    } else {
      console.log(`  Status: ✗ FAIL - Height outside expected range`);
      await browser.close();
      return 1;
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    await browser.close();
    return 1;
  }
}

const url = process.argv[2] || 'http://localhost:8791/city/palm-desert.html';
const expectedMin = parseInt(process.argv[3]) || 3500;
const expectedMax = parseInt(process.argv[4]) || 4500;

checkPageHeight(url, expectedMin, expectedMax).then(code => process.exit(code));
