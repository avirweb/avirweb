const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('--- PROD ---');
  await page.goto('https://www.avir.com/city/palm-desert', { waitUntil: 'networkidle' });
  console.log('Prod URL:', page.url());
  console.log('Prod Height:', await page.evaluate(() => document.body.scrollHeight));
  
  console.log('--- LOCAL ---');
  page.on('console', msg => console.log('LOCAL LOG:', msg.text()));
  page.on('pageerror', err => console.error('LOCAL ERROR:', err.message));
  page.on('requestfailed', req => console.error('LOCAL REQ FAIL:', req.url(), req.failure().errorText));
  
  await page.goto('http://localhost:8791/city/palm-desert.html', { waitUntil: 'networkidle' });
  console.log('Local URL:', page.url());
  console.log('Local Height:', await page.evaluate(() => document.body.scrollHeight));
  
  const html = await page.content();
  console.log('HTML Length:', html.length);
  
  await browser.close();
})();
