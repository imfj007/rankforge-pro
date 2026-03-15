// History management for localStorage
const HISTORY_KEY = 'rankforge_history';
const MAX_HISTORY = 10;

export function getHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToHistory(type, input, result) {
  const history = getHistory();
  const entry = {
    id: Date.now().toString(),
    type,
    input,
    result,
    timestamp: new Date().toISOString()
  };
  history.unshift(entry);
  if (history.length > MAX_HISTORY) {
    history.pop();
  }
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  return entry;
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
}

// Trial usage tracking
const TRIAL_KEY = 'rankforge_trial_uses';

export function getTrialUses() {
  return parseInt(localStorage.getItem(TRIAL_KEY) || '0', 10);
}

export function incrementTrialUses() {
  const uses = getTrialUses() + 1;
  localStorage.setItem(TRIAL_KEY, uses.toString());
  return uses;
}

export function hasTrialRemaining() {
  return getTrialUses() < 3;
}

// License key management
export function getLicenseKey() {
  return localStorage.getItem('rankforge_license_key') || '';
}

export function setLicenseKey(key) {
  localStorage.setItem('rankforge_license_key', key);
}

export function getLicensePlan() {
  return localStorage.getItem('rankforge_license_plan') || '';
}

export function setLicensePlan(plan) {
  localStorage.setItem('rankforge_license_plan', plan);
}

export function clearLicense() {
  localStorage.removeItem('rankforge_license_key');
  localStorage.removeItem('rankforge_license_plan');
}

export function isLicensed() {
  return !!getLicenseKey();
}

// Theme management
export function getTheme() {
  return localStorage.getItem('rankforge_theme') || 'dark';
}

export function setTheme(theme) {
  localStorage.setItem('rankforge_theme', theme);
}

// Copy to clipboard
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return true;
  }
}

// Format number
export function formatNumber(num) {
  if (typeof num === 'string') return num;
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

// Score color
export function getScoreColor(score) {
  if (score >= 80) return '#00FF94';
  if (score >= 60) return '#FFD700';
  if (score >= 40) return '#FF9632';
  return '#FF4D4D';
}

export function getScoreLabel(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Poor';
}
