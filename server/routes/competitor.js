const express = require('express');
const router = express.Router();
const { getLicenseMiddleware, trackUsage } = require('../lib/supabase');
const { callClaude } = require('../lib/claude');

router.post('/', getLicenseMiddleware(), async (req, res) => {
  try {
    const { myDomain, competitors } = req.body;

    if (!myDomain) {
      return res.status(400).json({ error: 'Your domain is required' });
    }

    if (!competitors || !Array.isArray(competitors) || competitors.length === 0) {
      return res.status(400).json({ error: 'At least one competitor domain is required' });
    }

    const allDomains = [myDomain, ...competitors.slice(0, 3)];

    const systemPrompt = `You are a competitive SEO intelligence analyst for RankForge Pro.
Your job is to research and compare websites using web_search to provide detailed competitive analysis.
You MUST use the web_search tool to research each domain.
You must respond ONLY with a valid JSON object (no markdown, no code blocks, no extra text).
The JSON must follow this exact structure:
{
  "sites": [
    {
      "domain": "<domain>",
      "estimatedDA": <0-100>,
      "estimatedPA": <0-100>,
      "monthlyTraffic": "<estimate>",
      "topKeywords": ["<keywords>"],
      "backlinks": "<estimate>",
      "contentLength": "<avg words per post>",
      "postingFrequency": "<e.g. 3x/week>",
      "strengths": ["<strengths>"],
      "weaknesses": ["<weaknesses>"]
    }
  ],
  "contentGaps": ["<content gaps the user can exploit>"],
  "opportunities": ["<SEO opportunities>"],
  "winningStrategy": ["<actionable strategy steps>"],
  "verdict": "<overall competitive analysis verdict>"
}`;

    const userMessage = `Perform a competitive analysis comparing these domains:
My domain: ${myDomain}
Competitors: ${competitors.join(', ')}

Use web_search to research each domain thoroughly. Look up their:
- Estimated domain authority and page authority
- Monthly traffic estimates
- Top ranking keywords
- Backlink profiles
- Content strategy (posting frequency, avg content length)
- Strengths and weaknesses

Then identify content gaps, opportunities, and provide a winning strategy for "${myDomain}".
Return your analysis as a single JSON object.`;

    const result = await callClaude(systemPrompt, userMessage);

    await trackUsage(req.licenseKey, 'competitor');

    res.json(result);
  } catch (err) {
    console.error('Competitor analysis error:', err);
    res.status(500).json({ error: 'Competitor analysis failed', message: err.message });
  }
});

module.exports = router;
