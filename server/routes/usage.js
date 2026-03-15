const express = require('express');
const router = express.Router();
const { getLicenseMiddleware, getUsage } = require('../lib/supabase');

router.get('/', getLicenseMiddleware(), async (req, res) => {
  try {
    const usage = await getUsage(req.licenseKey);

    if (!usage) {
      return res.status(404).json({ error: 'Usage data not found' });
    }

    res.json(usage);
  } catch (err) {
    console.error('Usage error:', err);
    res.status(500).json({ error: 'Failed to get usage data' });
  }
});

module.exports = router;
