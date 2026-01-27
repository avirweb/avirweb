const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('request', req => console.log('REQ:', req.url()));
  page.on('response', res => console.log('RES:', res.url(), res.status()));
  
  await page.goto('http://localhost:8791/city/palm-desert.html', { waitUntil: 'networkidle' });
  const height = await page.evaluate(() => document.body.scrollHeight);
  console.log('Final local height:', height);
  
  const display = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('.left-bar'));
    return els.map(el => window.getComputedStyle(el).display);
  });
  console.log('Displays:', display);
  
  await browser.close();
})();
