const API_BASE = '/api';

function getHeaders() {
  const key = localStorage.getItem('rankforge_license_key');
  return {
    'Content-Type': 'application/json',
    ...(key ? { 'Authorization': `Bearer ${key}` } : {})
  };
}

export async function activateLicense(key) {
  const res = await fetch(`${API_BASE}/activate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Activation failed');
  return data;
}

export async function runSeoAudit(url) {
  const res = await fetch(`${API_BASE}/seo-audit`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ url })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Audit failed');
  return data;
}

export async function runCompetitorAnalysis(myDomain, competitors) {
  const res = await fetch(`${API_BASE}/competitor`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ myDomain, competitors })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Analysis failed');
  return data;
}

export async function runDapaCheck(domain) {
  const res = await fetch(`${API_BASE}/da-pa`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ domain })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'DA/PA check failed');
  return data;
}

export async function runKeywordResearch(keyword) {
  const res = await fetch(`${API_BASE}/keywords`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ keyword })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Keyword research failed');
  return data;
}

export async function getUsage() {
  const res = await fetch(`${API_BASE}/usage`, {
    headers: getHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to get usage');
  return data;
}

// Admin APIs
export async function adminGenerateKey(plan, email, count, adminPassword) {
  const res = await fetch(`${API_BASE}/admin/generate-key`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'X-Admin-Password': adminPassword
    },
    body: JSON.stringify({ plan, email, count })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Key generation failed');
  return data;
}

export async function adminGetKeys(adminPassword) {
  const res = await fetch(`${API_BASE}/admin/keys`, {
    headers: { 
      'Content-Type': 'application/json',
      'X-Admin-Password': adminPassword
    }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to get keys');
  return data;
}

export async function adminRevokeKey(key, adminPassword) {
  const res = await fetch(`${API_BASE}/admin/revoke-key`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'X-Admin-Password': adminPassword
    },
    body: JSON.stringify({ key })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Revocation failed');
  return data;
}

export async function adminGetAnalytics(adminPassword) {
  const res = await fetch(`${API_BASE}/admin/analytics`, {
    headers: { 
      'Content-Type': 'application/json',
      'X-Admin-Password': adminPassword
    }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Analytics failed');
  return data;
}
