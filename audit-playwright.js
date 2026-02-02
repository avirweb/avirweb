const { chromium } = require('playwright');

const SITE_ORIGIN = 'https://avirwebtest.pages.dev';
const SITEMAP_URL = `${SITE_ORIGIN}/sitemap.xml`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const extractLocs = (xmlText) => {
  const matches = xmlText.match(/<loc>(.*?)<\/loc>/g) || [];
  return matches
    .map((m) => m.replace('<loc>', '').replace('</loc>', '').trim())
    .filter(Boolean);
};

const normalizeUrl = (url) => {
  try {
    return new URL(url, SITE_ORIGIN).toString();
  } catch (err) {
    return null;
  }
};

const isSameOrigin = (url) => {
  try {
    return new URL(url).origin === SITE_ORIGIN;
  } catch (err) {
    return false;
  }
};

const getExtension = (url) => {
  const clean = url.split('?')[0].split('#')[0];
  const lastDot = clean.lastIndexOf('.');
  if (lastDot === -1) return '';
  return clean.slice(lastDot + 1).toLowerCase();
};

const main = async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultNavigationTimeout(20000);
  page.setDefaultTimeout(20000);

  const sitemapResponse = await page.goto(SITEMAP_URL, { waitUntil: 'domcontentloaded' });
  const sitemapText = await page.content();
  const sitemapUrls = extractLocs(sitemapText);

  const pages = Array.from(new Set(sitemapUrls));

  const allInternalLinks = new Set();
  const pageResults = [];
  const globalConsole = [];
  const globalRequestFailures = [];

  for (const url of pages) {
    const pageErrors = [];
    const consoleMessages = [];
    const requestFailures = [];

    const consoleHandler = (msg) => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location(),
      });
    };
    const pageErrorHandler = (err) => {
      pageErrors.push({ message: err.message, stack: err.stack });
    };
    const requestFailedHandler = (request) => {
      requestFailures.push({
        url: request.url(),
        resourceType: request.resourceType(),
        failure: request.failure(),
      });
    };

    page.on('console', consoleHandler);
    page.on('pageerror', pageErrorHandler);
    page.on('requestfailed', requestFailedHandler);

    let response = null;
    let status = null;
    let navError = null;
    try {
      response = await page.goto(url, { waitUntil: 'domcontentloaded' });
      status = response ? response.status() : null;
    } catch (err) {
      navError = err.message;
    }

    await sleep(50);

    const data = await page.evaluate(() => {
      const getMeta = (name) => {
        const el = document.querySelector(`meta[name="${name}"]`);
        return el ? el.getAttribute('content') : null;
      };
      const getProperty = (property) => {
        const el = document.querySelector(`meta[property="${property}"]`);
        return el ? el.getAttribute('content') : null;
      };

      const links = Array.from(document.querySelectorAll('a[href]')).map((a) => a.href);
      const images = Array.from(document.querySelectorAll('img')).map((img) => ({
        src: img.getAttribute('src'),
        currentSrc: img.currentSrc || null,
        alt: img.getAttribute('alt'),
        width: img.getAttribute('width'),
        height: img.getAttribute('height'),
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        complete: img.complete,
      }));
      const forms = Array.from(document.querySelectorAll('form')).map((form) => ({
        action: form.getAttribute('action'),
        method: form.getAttribute('method'),
        id: form.getAttribute('id'),
        name: form.getAttribute('name'),
        fields: Array.from(form.querySelectorAll('input, select, textarea')).map((field) => ({
          tag: field.tagName.toLowerCase(),
          type: field.getAttribute('type'),
          name: field.getAttribute('name'),
          id: field.getAttribute('id'),
          required: field.hasAttribute('required'),
          autocomplete: field.getAttribute('autocomplete'),
        })),
      }));
      const turnstilePresent = Boolean(
        document.querySelector('iframe[src*="turnstile"], div.cf-turnstile, input[name="cf-turnstile-response"]')
      );
      const metaDescription = getMeta('description');
      const metaViewport = getMeta('viewport');
      const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href') || null;
      const ogTitle = getProperty('og:title');
      const ogDescription = getProperty('og:description');
      const ogImage = getProperty('og:image');
      const navEntry = performance.getEntriesByType('navigation')[0];
      const loadTime = navEntry ? navEntry.duration : null;

      return {
        title: document.title,
        links,
        images,
        forms,
        turnstilePresent,
        metaDescription,
        metaViewport,
        canonical,
        ogTitle,
        ogDescription,
        ogImage,
        loadTime,
      };
    });

    const internalLinks = data.links
      .map((href) => href && href.trim())
      .filter(Boolean)
      .filter((href) => href.startsWith(SITE_ORIGIN));

    internalLinks.forEach((href) => allInternalLinks.add(href));

    pageResults.push({
      url,
      status,
      title: data.title,
      navError,
      loadTime: data.loadTime,
      meta: {
        description: data.metaDescription,
        viewport: data.metaViewport,
        canonical: data.canonical,
        ogTitle: data.ogTitle,
        ogDescription: data.ogDescription,
        ogImage: data.ogImage,
      },
      images: data.images,
      forms: data.forms,
      turnstilePresent: data.turnstilePresent,
      consoleMessages,
      pageErrors,
      requestFailures,
    });

    consoleMessages.forEach((msg) => globalConsole.push({ url, ...msg }));
    pageErrors.forEach((err) => globalConsole.push({ url, type: 'pageerror', text: err.message }));
    requestFailures.forEach((failure) => globalRequestFailures.push({ url, ...failure }));

    page.off('console', consoleHandler);
    page.off('pageerror', pageErrorHandler);
    page.off('requestfailed', requestFailedHandler);
  }

  await browser.close();

  const sitemapSet = new Set(pages.map((url) => normalizeUrl(url)).filter(Boolean));
  const internalSet = new Set(
    Array.from(allInternalLinks)
      .map((url) => normalizeUrl(url))
      .filter(Boolean)
  );

  const orphanPages = Array.from(sitemapSet).filter((url) => !internalSet.has(url));

  const imageStats = pageResults.reduce(
    (acc, page) => {
      page.images.forEach((img) => {
        acc.total += 1;
        const src = img.currentSrc || img.src || '';
        const hasSrc = Boolean(src);
        const loaded = img.complete && img.naturalWidth > 0;
        const ext = getExtension(src);

        if (!hasSrc || !loaded) {
          acc.broken += 1;
          acc.brokenImages.push({ page: page.url, src });
        }

        if (ext) {
          acc.formats[ext] = (acc.formats[ext] || 0) + 1;
        } else {
          acc.formats.unknown = (acc.formats.unknown || 0) + 1;
        }
      });
      return acc;
    },
    { total: 0, broken: 0, formats: {}, brokenImages: [] }
  );

  const brokenRequests = globalRequestFailures.filter((failure) => failure.resourceType === 'image');

  const report = {
    generatedAt: new Date().toISOString(),
    pageCount: pages.length,
    pages,
    orphanPages,
    pageResults,
    imageStats,
    consoleMessages: globalConsole,
    requestFailures: globalRequestFailures,
    brokenImageRequests: brokenRequests,
  };

  process.stdout.write(JSON.stringify(report, null, 2));
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
