const Anthropic = require('@anthropic-ai/sdk').default;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Call Claude API with web_search tool enabled.
 * @param {string} systemPrompt - The system prompt for Claude
 * @param {string} userMessage - The user message
 * @param {number} maxTokens - Max tokens (default 4096)
 * @returns {object} Parsed JSON response from Claude
 */
async function callClaude(systemPrompt, userMessage, maxTokens = 4096) {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      tools: [
        {
          type: 'web_search_20250305',
          name: 'web_search',
          max_uses: 5
        }
      ],
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userMessage
        }
      ]
    });

    // Extract text blocks from the response
    const textBlocks = response.content.filter(block => block.type === 'text');
    const fullText = textBlocks.map(block => block.text).join('\n');

    // Try to parse as JSON
    try {
      // Find JSON in the response (might be wrapped in markdown code blocks)
      const jsonMatch = fullText.match(/```(?:json)?\s*([\s\S]*?)```/) || 
                        fullText.match(/(\{[\s\S]*\})/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1].trim());
      }
      
      return JSON.parse(fullText.trim());
    } catch (parseErr) {
      console.error('JSON parse error, returning raw text:', parseErr.message);
      return { rawText: fullText, parseError: true };
    }
  } catch (err) {
    console.error('Claude API error:', err);
    throw new Error(`Claude API call failed: ${err.message}`);
  }
}

module.exports = { callClaude, anthropic };
