const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:8791/city/palm-desert.html', { waitUntil: 'networkidle' });
  const data = await page.evaluate(() => {
    const el = document.querySelector('.left-bar');
    const style = window.getComputedStyle(el);
    return {
      display: style.display,
      height: el.offsetHeight,
      source: el.outerHTML.substring(0, 100)
    };
  });
  console.log('Computed Style:', data);
  await browser.close();
})();
