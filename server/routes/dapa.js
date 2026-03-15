const express = require('express');
const router = express.Router();
const { getLicenseMiddleware, trackUsage } = require('../lib/supabase');
const { callClaude } = require('../lib/claude');

router.post('/', getLicenseMiddleware(), async (req, res) => {
  try {
    const { domain } = req.body;

    if (!domain) {
      return res.status(400).json({ error: 'Domain is required' });
    }

    const systemPrompt = `You are an expert domain authority and link analysis specialist for RankForge Pro.
Your job is to research domains and estimate their authority metrics using web_search.
You MUST use the web_search tool to research the domain.
You must respond ONLY with a valid JSON object (no markdown, no code blocks, no extra text).
The JSON must follow this exact structure:
{
  "domain": "<domain>",
  "estimatedDA": <0-100>,
  "estimatedPA": <0-100>,
  "trustFlow": <0-100>,
  "citationFlow": <0-100>,
  "spamScore": <0-100>,
  "backlinks": "<estimated count>",
  "referringDomains": "<estimated count>",
  "organicTraffic": "<estimated monthly traffic>",
  "rankingKeywords": "<estimated count>",
  "topCountry": "<primary audience country>",
  "indexedPages": "<estimated count>",
  "niche": "<website niche/category>",
  "age": "<estimated domain age>",
  "verdict": "<overall assessment of the domain>"
}`;

    const userMessage = `Research and analyze this domain: ${domain}

Use web_search to find information about:
- The website's domain authority and page authority estimates
- Trust flow and citation flow
- Spam score indicators
- Estimated backlink count and referring domains
- Organic traffic estimates
- How many keywords it ranks for
- Primary target country/audience
- Number of indexed pages
- What niche/category the website is in
- How old the domain is

Provide your analysis as a single JSON object with estimated metrics.`;

    const result = await callClaude(systemPrompt, userMessage);

    await trackUsage(req.licenseKey, 'da-pa');

    res.json(result);
  } catch (err) {
    console.error('DA/PA check error:', err);
    res.status(500).json({ error: 'DA/PA check failed', message: err.message });
  }
});

module.exports = router;
