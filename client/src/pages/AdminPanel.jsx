import { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, BarChart3, Key, Users, Activity, Copy, ArrowLeft, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { adminGenerateKey, adminGetKeys, adminRevokeKey, adminGetAnalytics } from '../utils/api';
import { copyToClipboard } from '../utils/helpers';

export default function AdminPanel() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [activeSection, setActiveSection] = useState('keys');
  const [keys, setKeys] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  // Key generation form
  const [genPlan, setGenPlan] = useState('pro_monthly');
  const [genEmail, setGenEmail] = useState('');
  const [genCount, setGenCount] = useState(1);

  const handleLogin = (e) => {
    e.preventDefault();
    // We just store the password and let it validate on the server side
    setAuthenticated(true);
    loadData();
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [keysData, analyticsData] = await Promise.all([
        adminGetKeys(password),
        adminGetAnalytics(password)
      ]);
      setKeys(keysData.keys || []);
      setAnalytics(analyticsData);
    } catch (err) {
      toast.error('Failed to load data: ' + err.message);
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateKey = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await adminGenerateKey(genPlan, genEmail, genCount, password);
      toast.success(`Generated ${result.keys.length} key(s)`);
      
      // Copy the keys to clipboard
      copyToClipboard(result.keys.join('\n'));
      toast.success('Keys copied to clipboard!');
      
      loadData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (key) => {
    if (!confirm('Revoke this key?')) return;
    try {
      await adminRevokeKey(key, password);
      toast.success('Key revoked');
      loadData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Login screen
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg-primary)' }}>
        <Toaster position="bottom-right" toastOptions={{
          style: { background: '#111128', color: '#E2E0F0', border: '1px solid #1E1E3A', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px' }
        }} />
        <div className="w-full max-w-md mx-4">
          <div className="card-static p-8 space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--color-purple), var(--color-accent))' }}>
              <Lock size={32} color="white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                <span className="text-gradient-purple">Admin Panel</span>
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                Enter the admin password to continue
              </p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin password"
                className="input-primary text-center"
                id="admin-password"
              />
              <button type="submit" className="btn-primary w-full justify-center">
                <Shield size={16} /> Authenticate
              </button>
            </form>
            <Link to="/" className="text-xs flex items-center justify-center gap-1 mt-4 cursor-pointer"
              style={{ color: 'var(--color-text-dim)' }}>
              <ArrowLeft size={12} /> Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-primary)' }}>
      <Toaster position="bottom-right" toastOptions={{
        style: { background: '#111128', color: '#E2E0F0', border: '1px solid #1E1E3A', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px' }
      }} />
      
      {/* Top bar */}
      <div className="h-16 flex items-center justify-between px-6 border-b"
        style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-3">
          <Shield size={20} style={{ color: 'var(--color-purple)' }} />
          <h1 className="font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
            <span className="text-gradient-purple">Admin Panel</span>
          </h1>
        </div>
        <Link to="/" className="btn-ghost text-xs flex items-center gap-1">
          <ArrowLeft size={12} /> Dashboard
        </Link>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <AnalyticsCard icon={Key} label="Total Keys" value={analytics.totalKeys} color="var(--color-purple)" />
            <AnalyticsCard icon={Activity} label="Total Usage" value={analytics.totalUsage} color="var(--color-accent)" />
            <AnalyticsCard icon={Users} label="Active Users" value={analytics.activeUsers} color="var(--color-success)" />
            <AnalyticsCard icon={BarChart3} label="Tools Used" value={Object.keys(analytics.toolUsage || {}).length} color="var(--color-warning)" />
          </div>
        )}

        {/* Tool Usage Breakdown */}
        {analytics?.toolUsage && Object.keys(analytics.toolUsage).length > 0 && (
          <div className="card-static p-4">
            <h3 className="font-semibold text-sm mb-3" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-accent)' }}>
              Usage per Tool
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(analytics.toolUsage).map(([tool, count]) => (
                <div key={tool} className="p-3 rounded-lg text-center"
                  style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)' }}>
                  <div className="text-xs" style={{ color: 'var(--color-text-dim)' }}>{tool}</div>
                  <div className="text-lg font-bold mt-1" style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-heading)' }}>
                    {count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b pb-3" style={{ borderColor: 'var(--color-border)' }}>
          <button onClick={() => setActiveSection('generate')}
            className={`px-4 py-2 rounded-lg text-sm cursor-pointer transition-all ${activeSection === 'generate' ? 'tab-active' : 'tab-inactive'}`}
            style={{ fontFamily: 'var(--font-heading)' }}>
            <Plus size={14} className="inline mr-1" /> Generate Keys
          </button>
          <button onClick={() => setActiveSection('keys')}
            className={`px-4 py-2 rounded-lg text-sm cursor-pointer transition-all ${activeSection === 'keys' ? 'tab-active' : 'tab-inactive'}`}
            style={{ fontFamily: 'var(--font-heading)' }}>
            <Key size={14} className="inline mr-1" /> All Keys ({keys.length})
          </button>
        </div>

        {/* Generate Keys Section */}
        {activeSection === 'generate' && (
          <div className="card-static p-6 space-y-4 animate-fade-in">
            <h3 className="font-semibold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-accent)' }}>
              Generate License Keys
            </h3>
            <form onSubmit={handleGenerateKey} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs block mb-1" style={{ color: 'var(--color-text-dim)' }}>Plan</label>
                <select value={genPlan} onChange={(e) => setGenPlan(e.target.value)}
                  className="input-primary" id="admin-gen-plan">
                  <option value="free_lifetime">Free Lifetime</option>
                  <option value="pro_monthly">Pro Monthly</option>
                  <option value="pro_yearly">Pro Yearly</option>
                  <option value="agency">Agency</option>
                </select>
              </div>
              <div>
                <label className="text-xs block mb-1" style={{ color: 'var(--color-text-dim)' }}>Email (optional)</label>
                <input type="email" value={genEmail} onChange={(e) => setGenEmail(e.target.value)}
                  placeholder="user@email.com" className="input-primary" />
              </div>
              <div>
                <label className="text-xs block mb-1" style={{ color: 'var(--color-text-dim)' }}>Count</label>
                <input type="number" min="1" max="50" value={genCount} onChange={(e) => setGenCount(parseInt(e.target.value) || 1)}
                  className="input-primary" />
              </div>
              <div className="flex items-end">
                <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
                  <Plus size={14} /> Generate
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Keys List */}
        {activeSection === 'keys' && (
          <div className="card-static animate-fade-in">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Key</th>
                    <th>Plan</th>
                    <th>Email</th>
                    <th>Created</th>
                    <th>Expires</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {keys.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8" style={{ color: 'var(--color-text-dim)' }}>
                        No keys found
                      </td>
                    </tr>
                  ) : (
                    keys.map((k, i) => (
                      <tr key={i}>
                        <td>
                          <div className="flex items-center gap-1">
                            <code className="text-xs" style={{ color: 'var(--color-accent)' }}>
                              {k.key.substring(0, 20)}...
                            </code>
                            <button onClick={() => { copyToClipboard(k.key); toast.success('Copied!'); }}
                              className="p-1 rounded cursor-pointer hover:bg-white/5">
                              <Copy size={10} style={{ color: 'var(--color-text-dim)' }} />
                            </button>
                          </div>
                        </td>
                        <td>
                          <span className="chip chip-purple text-xs">
                            {k.plan?.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td style={{ color: 'var(--color-text-secondary)' }}>
                          {k.email || '-'}
                        </td>
                        <td style={{ color: 'var(--color-text-dim)' }}>
                          {k.created_at ? new Date(k.created_at).toLocaleDateString() : '-'}
                        </td>
                        <td style={{ color: k.expires_at ? 'var(--color-warning)' : 'var(--color-success)' }}>
                          {k.expires_at ? new Date(k.expires_at).toLocaleDateString() : 'Never'}
                        </td>
                        <td>
                          <button onClick={() => handleRevoke(k.key)}
                            className="p-1.5 rounded-lg cursor-pointer hover:bg-red-500/10 transition-all"
                            title="Revoke key">
                            <Trash2 size={14} style={{ color: 'var(--color-error)' }} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AnalyticsCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ background: `${color}15` }}>
        <Icon size={24} style={{ color }} />
      </div>
      <div>
        <div className="text-xs" style={{ color: 'var(--color-text-dim)' }}>{label}</div>
        <div className="text-2xl font-bold" style={{ color, fontFamily: 'var(--font-heading)' }}>
          {value || 0}
        </div>
      </div>
    </div>
  );
}
