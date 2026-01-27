const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:8791/city/palm-desert.html', { waitUntil: 'networkidle' });
  const tallElements = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('*'))
      .map(el => ({
        tag: el.tagName,
        class: el.className,
        height: el.offsetHeight,
        id: el.id
      }))
      .filter(el => el.height > 2500)
      .sort((a, b) => b.height - a.height);
  });
  console.log('Tall elements:', tallElements.slice(0, 10));
  await browser.close();
})();
