const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

let supabase = null;

// Only initialize if real Supabase credentials are provided
if (supabaseUrl && supabaseServiceKey && supabaseUrl.startsWith('http')) {
  try {
    supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('✅ Supabase connected');
  } catch (err) {
    console.warn('⚠️ Supabase initialization failed:', err.message);
    console.warn('Running in local-only mode (no Supabase).');
  }
} else {
  console.warn('⚠️ Supabase credentials not configured. Running in local-only mode.');
}

// Hardcoded free key for demo
const HARDCODED_KEYS = {
  'FAIZAN007-LIFETIME-FREE': {
    key: 'FAIZAN007-LIFETIME-FREE',
    plan: 'free_lifetime',
    email: 'demo@rankforge.pro',
    created_at: '2024-01-01T00:00:00Z',
    expires_at: null,
    usage_count: 0
  }
};

// In-memory usage tracking (fallback when no Supabase)
const usageTracker = {};

async function validateLicenseKey(key) {
  if (!key) return null;

  // Check hardcoded keys first
  if (HARDCODED_KEYS[key]) {
    return HARDCODED_KEYS[key];
  }

  // Check Supabase if available
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('licenses')
        .select('*')
        .eq('key', key)
        .single();

      if (error || !data) return null;

      // Check expiry
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        return { ...data, expired: true };
      }

      return data;
    } catch (err) {
      console.error('Supabase error:', err);
    }
  }

  return null;
}

async function trackUsage(key, tool) {
  if (!usageTracker[key]) {
    usageTracker[key] = { total: 0, tools: {} };
  }
  usageTracker[key].total++;
  usageTracker[key].tools[tool] = (usageTracker[key].tools[tool] || 0) + 1;

  // Also track in Supabase if available
  if (supabase) {
    try {
      await supabase.from('usage_logs').insert({
        license_key: key,
        tool,
        created_at: new Date().toISOString()
      });
    } catch (err) {
      console.error('Usage tracking error:', err);
    }
  }
}

async function getUsage(key) {
  const limits = {
    free_lifetime: 50,
    pro_monthly: 500,
    pro_yearly: 500,
    agency: 2000
  };

  const license = await validateLicenseKey(key);
  if (!license) return null;

  const usage = usageTracker[key] || { total: 0, tools: {} };
  const limit = limits[license.plan] || 50;

  return {
    plan: license.plan,
    used: usage.total,
    limit,
    remaining: Math.max(0, limit - usage.total),
    tools: usage.tools
  };
}

function getLicenseMiddleware() {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const key = authHeader?.replace('Bearer ', '');

    if (!key) {
      return res.status(401).json({ error: 'License key required' });
    }

    const license = await validateLicenseKey(key);
    if (!license) {
      return res.status(403).json({ error: 'Invalid license key' });
    }

    if (license.expired) {
      return res.status(403).json({ error: 'License key expired' });
    }

    req.license = license;
    req.licenseKey = key;
    next();
  };
}

module.exports = {
  supabase,
  validateLicenseKey,
  trackUsage,
  getUsage,
  getLicenseMiddleware,
  HARDCODED_KEYS,
  usageTracker
};
