const express = require('express');
const router = express.Router();
const { getLicenseMiddleware, trackUsage } = require('../lib/supabase');
const { callClaude } = require('../lib/claude');

router.post('/', getLicenseMiddleware(), async (req, res) => {
  try {
    const { keyword } = req.body;

    if (!keyword) {
      return res.status(400).json({ error: 'Keyword is required' });
    }

    const systemPrompt = `You are an expert keyword research analyst for RankForge Pro.
Your job is to research keywords and provide comprehensive keyword intelligence using web_search.
You MUST use the web_search tool to research the keyword landscape.
You must respond ONLY with a valid JSON object (no markdown, no code blocks, no extra text).
The JSON must follow this exact structure:
{
  "mainKeyword": "<keyword>",
  "searchVolume": "<estimated monthly search volume>",
  "difficulty": <0-100>,
  "cpc": "$<estimated CPC>",
  "intent": "<informational|commercial|navigational|transactional>",
  "trend": "<rising|stable|declining>",
  "relatedKeywords": [
    {"keyword": "<related keyword>", "volume": "<estimated volume>", "difficulty": <0-100>, "intent": "<intent type>", "cpc": "$<cpc>"}
  ],
  "longTailKeywords": ["<long tail variations>"],
  "questions": ["<people also ask questions>"],
  "topRankingSites": ["<top 5 sites ranking for this keyword>"],
  "contentIdeas": ["<content ideas based on keyword>"],
  "rankingTips": ["<tips to rank for this keyword>"]
}`;

    const userMessage = `Research this keyword: "${keyword}"

Use web_search to find comprehensive information about:
- Estimated monthly search volume
- Keyword difficulty (how hard to rank for)
- Estimated CPC (cost per click in Google Ads)
- Search intent (informational, commercial, navigational, or transactional)
- Whether the keyword is trending up, stable, or declining
- Related keywords with their own volumes and difficulty
- Long-tail keyword variations
- "People Also Ask" questions related to this keyword
- Top 5 sites currently ranking for this keyword
- Content ideas for targeting this keyword
- Tips and strategies to rank for this keyword

Provide at least 8 related keywords, 6 long-tail keywords, 5 questions, and 5 content ideas.
Return your research as a single JSON object.`;

    const result = await callClaude(systemPrompt, userMessage);

    await trackUsage(req.licenseKey, 'keywords');

    res.json(result);
  } catch (err) {
    console.error('Keyword research error:', err);
    res.status(500).json({ error: 'Keyword research failed', message: err.message });
  }
});

module.exports = router;
