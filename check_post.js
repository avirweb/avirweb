const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:8791/post/a-legacy-in-sound--801-abbey-road-limited-edition.html', { waitUntil: 'networkidle' });
  const height = await page.evaluate(() => document.body.scrollHeight);
  console.log('Local Post height:', height);
  await browser.close();
})();
