const cheerio = require('cheerio');

/**
 * Scrape a webpage and extract SEO-relevant data using cheerio.
 * We use fetch instead of puppeteer for lightweight scraping.
 * @param {string} url - The URL to scrape
 * @returns {object} Scraped page data
 */
async function scrapePage(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract title
    const title = $('title').text().trim() || '';

    // Extract meta description
    const metaDescription = $('meta[name="description"]').attr('content') || 
                            $('meta[property="og:description"]').attr('content') || '';

    // Extract meta keywords
    const metaKeywords = $('meta[name="keywords"]').attr('content') || '';

    // Extract headings
    const h1 = $('h1').first().text().trim() || '';
    const h2s = [];
    $('h2').each((i, el) => {
      if (i < 10) h2s.push($(el).text().trim());
    });
    const h3s = [];
    $('h3').each((i, el) => {
      if (i < 10) h3s.push($(el).text().trim());
    });

    // Word count
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    const wordCount = bodyText.split(' ').filter(w => w.length > 0).length;

    // Images
    const images = [];
    $('img').each((i, el) => {
      if (i < 20) {
        images.push({
          src: $(el).attr('src') || '',
          alt: $(el).attr('alt') || '',
          hasAlt: !!($(el).attr('alt'))
        });
      }
    });

    const imagesWithAlt = images.filter(img => img.hasAlt).length;
    const totalImages = images.length;

    // Links
    const internalLinks = [];
    const externalLinks = [];
    const baseUrl = new URL(url);

    $('a[href]').each((i, el) => {
      const href = $(el).attr('href') || '';
      try {
        const linkUrl = new URL(href, url);
        if (linkUrl.hostname === baseUrl.hostname) {
          internalLinks.push(href);
        } else {
          externalLinks.push(href);
        }
      } catch (e) {
        // relative link
        internalLinks.push(href);
      }
    });

    // Canonical tag
    const canonical = $('link[rel="canonical"]').attr('href') || '';

    // Schema/structured data
    const schemas = [];
    $('script[type="application/ld+json"]').each((i, el) => {
      try {
        const data = JSON.parse($(el).html());
        schemas.push(data['@type'] || 'Unknown');
      } catch (e) {}
    });

    // Open Graph tags
    const ogTags = {};
    $('meta[property^="og:"]').each((i, el) => {
      const prop = $(el).attr('property').replace('og:', '');
      ogTags[prop] = $(el).attr('content') || '';
    });

    // Robots meta
    const robotsMeta = $('meta[name="robots"]').attr('content') || '';

    // HTTPS check
    const isHttps = url.startsWith('https');

    // Viewport check
    const hasViewport = !!$('meta[name="viewport"]').attr('content');

    // Language
    const lang = $('html').attr('lang') || '';

    return {
      url,
      title,
      metaDescription,
      metaKeywords,
      h1,
      h2s,
      h3s,
      wordCount,
      images: {
        total: totalImages,
        withAlt: imagesWithAlt,
        withoutAlt: totalImages - imagesWithAlt
      },
      internalLinks: internalLinks.length,
      externalLinks: externalLinks.length,
      canonical,
      schemaTypes: schemas,
      ogTags,
      robotsMeta,
      isHttps,
      hasViewport,
      lang,
      bodyTextPreview: bodyText.substring(0, 500)
    };
  } catch (err) {
    console.error('Scraping error:', err.message);
    return {
      url,
      error: err.message,
      title: '',
      metaDescription: '',
      h1: '',
      h2s: [],
      wordCount: 0,
      images: { total: 0, withAlt: 0, withoutAlt: 0 },
      internalLinks: 0,
      externalLinks: 0,
      canonical: '',
      schemaTypes: [],
      isHttps: url.startsWith('https'),
      hasViewport: false
    };
  }
}

module.exports = { scrapePage };
