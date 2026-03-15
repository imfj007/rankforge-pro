import { useState } from 'react';
import { X, Zap, Crown, Users, KeyRound, Check, ExternalLink } from 'lucide-react';

export default function PaywallModal({ onClose, onActivate }) {
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleActivate = async () => {
    if (!key.trim()) {
      setError('Please enter a license key');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onActivate(key.trim());
    } catch (err) {
      setError(err.message || 'Invalid license key');
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      name: 'Pro Monthly',
      price: '$9',
      period: '/month',
      features: ['500 analyses/month', 'All 4 tools', 'PDF exports', 'Priority support'],
      icon: Zap,
      color: 'var(--color-purple)',
      popular: false
    },
    {
      name: 'Pro Yearly',
      price: '$79',
      period: '/year',
      save: 'Save 27%',
      features: ['500 analyses/month', 'All 4 tools', 'PDF exports', 'Priority support', 'Chrome extension'],
      icon: Crown,
      color: 'var(--color-accent)',
      popular: true
    },
    {
      name: 'Agency',
      price: '$199',
      period: '/year',
      features: ['2000 analyses/month', '5 team seats', 'All pro features', 'White-label reports', 'API access'],
      icon: Users,
      color: 'var(--color-success)',
      popular: false
    }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="w-full max-w-4xl mx-4 rounded-2xl p-8 animate-slide-up max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}
        onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
              <span className="text-gradient">Upgrade to Pro</span>
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              Your free trial has ended. Unlock unlimited SEO intelligence.
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg cursor-pointer hover:bg-white/5 transition-all">
            <X size={20} style={{ color: 'var(--color-text-secondary)' }} />
          </button>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            return (
              <div key={i} className="relative rounded-xl p-5 space-y-4 transition-all hover:scale-105"
                style={{ 
                  background: plan.popular ? 'rgba(123, 47, 255, 0.08)' : 'var(--color-bg-card)',
                  border: plan.popular ? '2px solid var(--color-purple)' : '1px solid var(--color-border)'
                }}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ background: 'var(--color-purple)', color: 'white', fontFamily: 'var(--font-heading)' }}>
                    Most Popular
                  </div>
                )}
                {plan.save && (
                  <span className="chip chip-success text-xs">{plan.save}</span>
                )}
                <div className="flex items-center gap-2">
                  <Icon size={20} style={{ color: plan.color }} />
                  <h3 className="font-semibold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}>
                    {plan.name}
                  </h3>
                </div>
                <div>
                  <span className="text-3xl font-extrabold" style={{ fontFamily: 'var(--font-heading)', color: plan.color }}>
                    {plan.price}
                  </span>
                  <span className="text-sm" style={{ color: 'var(--color-text-dim)' }}>{plan.period}</span>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      <Check size={14} style={{ color: 'var(--color-success)' }} />
                      {feat}
                    </li>
                  ))}
                </ul>
                <a href="https://rankforge.pro" target="_blank" rel="noopener noreferrer"
                  className="btn-primary w-full justify-center text-sm"
                  style={!plan.popular ? { background: 'var(--color-bg-input)', border: '1px solid var(--color-border)' } : {}}>
                  <ExternalLink size={14} /> Purchase
                </a>
              </div>
            );
          })}
        </div>

        {/* License Key Activation */}
        <div className="rounded-xl p-5 space-y-4"
          style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
          <h3 className="font-semibold flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
            <KeyRound size={16} style={{ color: 'var(--color-accent)' }} />
            Already have a license key?
          </h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={key}
              onChange={(e) => { setKey(e.target.value); setError(''); }}
              placeholder="Enter your license key"
              className="input-primary flex-1"
              id="paywall-license-input"
            />
            <button onClick={handleActivate} className="btn-primary" disabled={loading}>
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Activate'
              )}
            </button>
          </div>
          {error && (
            <p className="text-xs" style={{ color: 'var(--color-error)' }}>{error}</p>
          )}
          <p className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
            After purchasing, you'll receive a license key via email. Enter it above to activate your plan.
          </p>
        </div>
      </div>
    </div>
  );
}
