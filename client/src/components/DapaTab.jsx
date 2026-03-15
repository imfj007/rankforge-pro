import { useState } from 'react';
import { Globe, Copy, Shield, AlertTriangle, BarChart3, Users, Search, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { runDapaCheck } from '../utils/api';
import { addToHistory, copyToClipboard, getScoreColor } from '../utils/helpers';
import ScoreCircle from './ScoreCircle';
import LoadingSkeleton from './LoadingSkeleton';

export default function DapaTab({ checkAccess }) {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!domain.trim()) return toast.error('Enter a domain');
    if (!checkAccess()) return;

    setLoading(true);
    setResult(null);

    try {
      const data = await runDapaCheck(domain.trim());
      setResult(data);
      addToHistory('da-pa', domain.trim(), data);
      toast.success('DA/PA check complete!');
    } catch (err) {
      toast.error(err.message || 'Check failed');
    } finally {
      setLoading(false);
    }
  };

  const getMetricColor = (value, inverse = false) => {
    const v = typeof value === 'number' ? value : parseInt(value) || 0;
    if (inverse) {
      if (v <= 20) return 'var(--color-success)';
      if (v <= 50) return 'var(--color-warning)';
      return 'var(--color-error)';
    }
    return getScoreColor(v);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
          <span className="text-gradient">DA/PA Checker</span>
        </h2>
        <p style={{ color: 'var(--color-text-secondary)' }} className="mt-1 text-sm">
          Check Domain Authority, Page Authority, and key metrics for any domain
        </p>
      </div>

      <form onSubmit={handleCheck} className="flex gap-3">
        <div className="flex-1 relative">
          <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--color-text-dim)' }} />
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="Enter domain (e.g., example.com)"
            className="input-primary pl-11"
            id="dapa-domain-input"
          />
        </div>
        <button type="submit" className="btn-primary" disabled={loading} id="dapa-submit">
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Checking...
            </span>
          ) : (
            <>
              <Globe size={16} /> Check DA/PA
            </>
          )}
        </button>
      </form>

      {loading && <LoadingSkeleton type="dapa" />}

      {result && !result.parseError && (
        <div className="space-y-6 animate-slide-up">
          <div className="flex justify-end">
            <button onClick={() => { copyToClipboard(JSON.stringify(result, null, 2)); toast.success('Copied!'); }}
              className="btn-secondary text-sm">
              <Copy size={14} /> Copy Results
            </button>
          </div>

          {/* Domain Header */}
          <div className="card-static p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, var(--color-purple), var(--color-accent))' }}>
                <Globe size={20} color="white" />
              </div>
              <div>
                <h3 className="font-bold text-lg" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}>
                  {result.domain}
                </h3>
                <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
                  {result.niche || 'Unknown niche'} • {result.age || 'Unknown age'}
                </span>
              </div>
            </div>
          </div>

          {/* Main Scores */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ScoreCard label="Domain Authority" value={result.estimatedDA} icon={Shield} />
            <ScoreCard label="Page Authority" value={result.estimatedPA} icon={FileText} />
            <ScoreCard label="Trust Flow" value={result.trustFlow} icon={Shield} />
            <ScoreCard label="Citation Flow" value={result.citationFlow} icon={BarChart3} />
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <MetricCard 
              label="Spam Score" 
              value={result.spamScore} 
              suffix="/100"
              color={getMetricColor(result.spamScore, true)}
              icon={AlertTriangle}
            />
            <MetricCard 
              label="Backlinks" 
              value={result.backlinks} 
              color="var(--color-accent)"
              icon={BarChart3}
            />
            <MetricCard 
              label="Referring Domains" 
              value={result.referringDomains}
              color="var(--color-accent)"
              icon={Globe}
            />
            <MetricCard 
              label="Organic Traffic" 
              value={result.organicTraffic}
              color="var(--color-success)"
              icon={Users}
            />
            <MetricCard 
              label="Ranking Keywords" 
              value={result.rankingKeywords}
              color="var(--color-warning)"
              icon={Search}
            />
            <MetricCard 
              label="Indexed Pages" 
              value={result.indexedPages}
              color="var(--color-accent)"
              icon={FileText}
            />
            <MetricCard 
              label="Top Country" 
              value={result.topCountry}
              color="var(--color-text-primary)"
              icon={Globe}
            />
            <MetricCard 
              label="Domain Age" 
              value={result.age}
              color="var(--color-text-primary)"
              icon={Shield}
            />
          </div>

          {/* Verdict */}
          {result.verdict && (
            <div className="card-static p-4"
              style={{ borderLeft: '4px solid var(--color-purple)' }}>
              <h3 className="font-semibold text-sm mb-2" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-accent)' }}>
                Verdict
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {result.verdict}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ScoreCard({ label, value, icon: Icon }) {
  const numValue = typeof value === 'number' ? value : parseInt(value) || 0;
  return (
    <div className="card flex flex-col items-center p-4">
      <div className="mb-3">
        <ScoreCircle score={numValue} size={90} />
      </div>
      <div className="flex items-center gap-1.5 mt-1">
        <Icon size={12} style={{ color: 'var(--color-text-dim)' }} />
        <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-heading)' }}>
          {label}
        </span>
      </div>
    </div>
  );
}

function MetricCard({ label, value, suffix = '', color, icon: Icon }) {
  return (
    <div className="card-static p-4 flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}15` }}>
        <Icon size={16} style={{ color }} />
      </div>
      <div>
        <div className="text-xs" style={{ color: 'var(--color-text-dim)' }}>{label}</div>
        <div className="text-base font-bold mt-0.5" style={{ color, fontFamily: 'var(--font-heading)' }}>
          {value || 'N/A'}{suffix && value ? suffix : ''}
        </div>
      </div>
    </div>
  );
}
