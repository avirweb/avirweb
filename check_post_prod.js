const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://www.avir.com/post/a-legacy-in-sound--801-abbey-road-limited-edition', { waitUntil: 'networkidle' });
  const height = await page.evaluate(() => document.body.scrollHeight);
  console.log('Prod Post height:', height);
  await browser.close();
})();
