const express = require('express');
const router = express.Router();
const { validateLicenseKey } = require('../lib/supabase');

router.post('/', async (req, res) => {
  try {
    const { key } = req.body;

    if (!key) {
      return res.status(400).json({ error: 'License key is required' });
    }

    const license = await validateLicenseKey(key);

    if (!license) {
      return res.status(404).json({ error: 'Invalid license key' });
    }

    if (license.expired) {
      return res.status(403).json({ error: 'License key has expired', plan: license.plan });
    }

    return res.json({
      success: true,
      plan: license.plan,
      email: license.email,
      expiresAt: license.expires_at
    });
  } catch (err) {
    console.error('Activation error:', err);
    res.status(500).json({ error: 'Activation failed' });
  }
});

module.exports = router;
