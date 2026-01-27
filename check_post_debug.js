const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('request', req => console.log('REQ:', req.url()));
  page.on('response', res => {
    if (res.url().includes('images/')) {
       console.log('RES IMAGE:', res.url(), res.status(), res.headers()['content-type']);
    }
  });
  
  await page.goto('http://localhost:8791/post/coastal-source-opens-showroom-at-pacific-design-center.html', { waitUntil: 'networkidle' });
  const height = await page.evaluate(() => document.body.scrollHeight);
  console.log('Local Post height:', height);
  
  await browser.close();
})();
