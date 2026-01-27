const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:8791/post/a-legacy-in-sound--801-abbey-road-limited-edition.html', { waitUntil: 'networkidle' });
  const localSections = await page.evaluate(() => Array.from(document.querySelectorAll('.section')).map(s => s.className + ' | ' + s.innerText.substring(0, 50)));
  console.log('Local Sections:', localSections);
  await browser.close();
})();
