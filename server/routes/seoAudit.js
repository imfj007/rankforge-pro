const express = require('express');
const router = express.Router();
const { getLicenseMiddleware, trackUsage } = require('../lib/supabase');
const { callClaude } = require('../lib/claude');
const { scrapePage } = require('../lib/scraper');

router.post('/', getLicenseMiddleware(), async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Scrape the page
    const scrapedData = await scrapePage(url);

    // System prompt for SEO audit
    const systemPrompt = `You are an expert SEO analyst for RankForge Pro. Your job is to perform comprehensive SEO audits.
You MUST use the web_search tool to look up information about the website, check its indexing status, and gather additional insights.
You must respond ONLY with a valid JSON object (no markdown, no code blocks, no extra text).
The JSON must follow this exact structure:
{
  "score": <number 0-100>,
  "title": "<page title>",
  "metaDescription": "<found|missing>",
  "metaDescriptionText": "<the actual meta description text>",
  "h1": "<h1 text>",
  "h2s": ["<h2 texts>"],
  "wordCount": <number>,
  "loadSpeed": "<fast|medium|slow>",
  "mobileReady": <true|false>,
  "https": <true|false>,
  "canonicalTag": "<present|missing>",
  "schemaMarkup": "<present|missing>",
  "schemaTypes": ["<type names>"],
  "issues": [{"priority": "<critical|high|medium|low>", "issue": "<description>", "fix": "<how to fix>"}],
  "keywords": ["<detected keywords>"],
  "internalLinks": <number>,
  "externalLinks": <number>,
  "imageAltTags": "<optimized|missing|partial>",
  "recommendations": ["<actionable recommendations>"],
  "approvalReady": <true|false>,
  "summary": "<2-3 sentence summary>"
}`;

    const userMessage = `Perform a comprehensive SEO audit for this URL: ${url}

Here is the scraped data from the page:
- Title: ${scrapedData.title || 'Not found'}
- Meta Description: ${scrapedData.metaDescription || 'Not found'}
- H1: ${scrapedData.h1 || 'Not found'}
- H2s: ${scrapedData.h2s.join(', ') || 'None found'}
- Word Count: ${scrapedData.wordCount}
- Images Total: ${scrapedData.images.total}, With Alt: ${scrapedData.images.withAlt}, Without Alt: ${scrapedData.images.withoutAlt}
- Internal Links: ${scrapedData.internalLinks}
- External Links: ${scrapedData.externalLinks}
- Canonical: ${scrapedData.canonical || 'Not found'}
- Schema Types: ${scrapedData.schemaTypes.join(', ') || 'None'}
- HTTPS: ${scrapedData.isHttps}
- Has Viewport: ${scrapedData.hasViewport}
- Language: ${scrapedData.lang || 'Not set'}
- Content Preview: ${scrapedData.bodyTextPreview}

Please use web_search to look up this website's indexing status, reputation, and any publicly available SEO metrics.
Analyze all the data and provide your audit as a single JSON object.`;

    const result = await callClaude(systemPrompt, userMessage);

    // Track usage
    await trackUsage(req.licenseKey, 'seo-audit');

    res.json(result);
  } catch (err) {
    console.error('SEO Audit error:', err);
    res.status(500).json({ error: 'SEO audit failed', message: err.message });
  }
});

module.exports = router;
