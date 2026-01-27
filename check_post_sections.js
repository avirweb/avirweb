const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://www.avir.com/post/coastal-source-opens-showroom-at-pacific-design-center', { waitUntil: 'networkidle' });
  const prodSections = await page.evaluate(() => Array.from(document.querySelectorAll('.section')).map(s => s.className + ' | ' + s.innerText.substring(0, 50)));
  console.log('Prod Sections:', prodSections);
  
  await page.goto('http://localhost:8791/post/coastal-source-opens-showroom-at-pacific-design-center.html', { waitUntil: 'networkidle' });
  const localSections = await page.evaluate(() => Array.from(document.querySelectorAll('.section')).map(s => s.className + ' | ' + s.innerText.substring(0, 50)));
  console.log('Local Sections:', localSections);
  
  await browser.close();
})();
