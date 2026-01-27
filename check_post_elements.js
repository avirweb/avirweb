const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:8791/post/coastal-source-opens-showroom-at-pacific-design-center.html', { waitUntil: 'networkidle' });
  const counts = await page.evaluate(() => ({
    dynItems: document.querySelectorAll('.w-dyn-item').length,
    images: document.images.length,
    sections: document.querySelectorAll('.section').length
  }));
  console.log('Local Counts:', counts);
  
  await page.goto('https://www.avir.com/post/coastal-source-opens-showroom-at-pacific-design-center', { waitUntil: 'networkidle' });
  const prodCounts = await page.evaluate(() => ({
    dynItems: document.querySelectorAll('.w-dyn-item').length,
    images: document.images.length,
    sections: document.querySelectorAll('.section').length
  }));
  console.log('Prod Counts:', prodCounts);
  
  await browser.close();
})();
