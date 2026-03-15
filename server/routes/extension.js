const express = require('express');
const router = express.Router();
const { getLicenseMiddleware } = require('../lib/supabase');
const { callClaude } = require('../lib/claude');
const { scrapePage } = require('../lib/scraper');

router.post('/bar', getLicenseMiddleware(), async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const scrapedData = await scrapePage(url);

    // Return lightweight data for chromeextension
    const quickAudit = {
      url,
      title: scrapedData.title,
      hasMetaDescription: !!scrapedData.metaDescription,
      hasH1: !!scrapedData.h1,
      wordCount: scrapedData.wordCount,
      imagesTotal: scrapedData.images.total,
      imagesWithAlt: scrapedData.images.withAlt,
      internalLinks: scrapedData.internalLinks,
      externalLinks: scrapedData.externalLinks,
      isHttps: scrapedData.isHttps,
      hasCanonical: !!scrapedData.canonical,
      hasSchema: scrapedData.schemaTypes.length > 0,
      hasViewport: scrapedData.hasViewport,
      quickScore: calculateQuickScore(scrapedData)
    };

    res.json(quickAudit);
  } catch (err) {
    console.error('Extension bar error:', err);
    res.status(500).json({ error: 'Extension analysis failed' });
  }
});

function calculateQuickScore(data) {
  let score = 0;
  const checks = [
    { test: !!data.title, weight: 10 },
    { test: data.title.length >= 30 && data.title.length <= 60, weight: 5 },
    { test: !!data.metaDescription, weight: 10 },
    { test: !!data.h1, weight: 10 },
    { test: data.wordCount > 300, weight: 10 },
    { test: data.wordCount > 1000, weight: 5 },
    { test: data.isHttps, weight: 10 },
    { test: data.hasViewport, weight: 10 },
    { test: !!data.canonical, weight: 5 },
    { test: data.schemaTypes.length > 0, weight: 10 },
    { test: data.images.withoutAlt === 0, weight: 5 },
    { test: data.internalLinks > 3, weight: 5 },
    { test: data.externalLinks > 0, weight: 5 }
  ];

  checks.forEach(check => {
    if (check.test) score += check.weight;
  });

  return score;
}

module.exports = router;
