const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:8791/', { waitUntil: 'networkidle' });
  const height = await page.evaluate(() => document.body.scrollHeight);
  console.log('Local Home height:', height);
  await page.goto('https://www.avir.com/', { waitUntil: 'networkidle' });
  console.log('Prod Home height:', await page.evaluate(() => document.body.scrollHeight));
  await browser.close();
})();
