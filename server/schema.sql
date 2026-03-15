-- RankForge Pro - Supabase Schema
-- Run this in your Supabase SQL editor to set up the database

-- License Keys Table
CREATE TABLE IF NOT EXISTS licenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('free_lifetime', 'pro_monthly', 'pro_yearly', 'agency')),
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  usage_count INTEGER DEFAULT 0
);

-- Usage Logs Table
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  license_key TEXT NOT NULL REFERENCES licenses(key) ON DELETE CASCADE,
  tool TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert the hardcoded free key
INSERT INTO licenses (key, plan, email, created_at, expires_at)
VALUES ('FAIZAN007-LIFETIME-FREE', 'free_lifetime', 'demo@rankforge.pro', NOW(), NULL)
ON CONFLICT (key) DO NOTHING;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_licenses_key ON licenses(key);
CREATE INDEX IF NOT EXISTS idx_usage_logs_key ON usage_logs(license_key);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created ON usage_logs(created_at);

-- RLS Policies (enable if using Supabase Auth)
-- ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
