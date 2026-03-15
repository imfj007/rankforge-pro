const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { supabase, HARDCODED_KEYS, usageTracker, validateLicenseKey } = require('../lib/supabase');

// Simple admin auth middleware
function adminAuth(req, res, next) {
  const password = req.headers['x-admin-password'] || req.body.adminPassword;
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Generate license keys
router.post('/generate-key', adminAuth, async (req, res) => {
  try {
    const { plan, email, count = 1 } = req.body;

    if (!plan || !['free_lifetime', 'pro_monthly', 'pro_yearly', 'agency'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan type' });
    }

    const keys = [];
    const expiresAt = plan === 'free_lifetime' ? null : 
      plan === 'pro_monthly' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() :
      new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

    for (let i = 0; i < Math.min(count, 50); i++) {
      const key = `RF-${plan.toUpperCase().substring(0, 3)}-${uuidv4().substring(0, 8).toUpperCase()}`;
      keys.push({
        key,
        plan,
        email: email || null,
        created_at: new Date().toISOString(),
        expires_at: expiresAt,
        usage_count: 0
      });
    }

    // Store in Supabase if available
    if (supabase) {
      const { error } = await supabase.from('licenses').insert(keys);
      if (error) {
        console.error('Supabase insert error:', error);
      }
    }

    // Also store in hardcoded keys for fallback
    keys.forEach(k => {
      HARDCODED_KEYS[k.key] = k;
    });

    res.json({ success: true, keys: keys.map(k => k.key), details: keys });
  } catch (err) {
    console.error('Key generation error:', err);
    res.status(500).json({ error: 'Key generation failed' });
  }
});

// List all keys
router.get('/keys', adminAuth, async (req, res) => {
  try {
    let allKeys = Object.values(HARDCODED_KEYS);

    if (supabase) {
      const { data, error } = await supabase
        .from('licenses')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        allKeys = [...allKeys, ...data.filter(d => !HARDCODED_KEYS[d.key])];
      }
    }

    res.json({ keys: allKeys });
  } catch (err) {
    console.error('List keys error:', err);
    res.status(500).json({ error: 'Failed to list keys' });
  }
});

// Revoke a key
router.post('/revoke-key', adminAuth, async (req, res) => {
  try {
    const { key } = req.body;

    if (!key) {
      return res.status(400).json({ error: 'Key is required' });
    }

    // Remove from hardcoded keys
    delete HARDCODED_KEYS[key];

    // Remove from Supabase
    if (supabase) {
      await supabase.from('licenses').delete().eq('key', key);
    }

    res.json({ success: true, message: 'Key revoked' });
  } catch (err) {
    console.error('Revoke error:', err);
    res.status(500).json({ error: 'Revocation failed' });
  }
});

// Analytics
router.get('/analytics', adminAuth, async (req, res) => {
  try {
    const totalKeys = Object.keys(HARDCODED_KEYS).length;
    const totalUsage = Object.values(usageTracker).reduce((sum, u) => sum + u.total, 0);
    
    const toolUsage = {};
    Object.values(usageTracker).forEach(u => {
      Object.entries(u.tools).forEach(([tool, count]) => {
        toolUsage[tool] = (toolUsage[tool] || 0) + count;
      });
    });

    res.json({
      totalKeys,
      totalUsage,
      toolUsage,
      activeUsers: Object.keys(usageTracker).length
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: 'Analytics failed' });
  }
});

module.exports = router;
