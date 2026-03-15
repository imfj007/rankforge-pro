import { useState } from 'react';
import { Swords, Plus, X, Copy, TrendingUp, TrendingDown, Target, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { runCompetitorAnalysis } from '../utils/api';
import { addToHistory, copyToClipboard } from '../utils/helpers';
import LoadingSkeleton from './LoadingSkeleton';
import ScoreCircle from './ScoreCircle';

export default function CompetitorTab({ checkAccess }) {
  const [myDomain, setMyDomain] = useState('');
  const [competitors, setCompetitors] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const addCompetitor = () => {
    if (competitors.length < 3) {
      setCompetitors([...competitors, '']);
    }
  };

  const removeCompetitor = (index) => {
    if (competitors.length > 1) {
      setCompetitors(competitors.filter((_, i) => i !== index));
    }
  };

  const updateCompetitor = (index, value) => {
    const updated = [...competitors];
    updated[index] = value;
    setCompetitors(updated);
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!myDomain.trim()) return toast.error('Enter your domain');
    const validCompetitors = competitors.filter(c => c.trim());
    if (validCompetitors.length === 0) return toast.error('Add at least one competitor');
    if (!checkAccess()) return;

    setLoading(true);
    setResult(null);

    try {
      const data = await runCompetitorAnalysis(myDomain.trim(), validCompetitors);
      setResult(data);
      addToHistory('competitor', { myDomain, competitors: validCompetitors }, data);
      toast.success('Competitor analysis complete!');
    } catch (err) {
      toast.error(err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
          <span className="text-gradient">Competitor Analysis</span>
        </h2>
        <p style={{ color: 'var(--color-text-secondary)' }} className="mt-1 text-sm">
          Compare your domain against competitors with AI-powered analysis
        </p>
      </div>

      <form onSubmit={handleAnalyze} className="space-y-4">
        <div>
          <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-text-dim)' }}>
            Your Domain
          </label>
          <input
            type="text"
            value={myDomain}
            onChange={(e) => setMyDomain(e.target.value)}
            placeholder="yourdomain.com"
            className="input-primary"
            id="competitor-my-domain"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-text-dim)' }}>
            Competitors (up to 3)
          </label>
          {competitors.map((comp, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={comp}
                onChange={(e) => updateCompetitor(i, e.target.value)}
                placeholder={`competitor${i + 1}.com`}
                className="input-primary flex-1"
              />
              {competitors.length > 1 && (
                <button type="button" onClick={() => removeCompetitor(i)}
                  className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 cursor-pointer transition-all">
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
          {competitors.length < 3 && (
            <button type="button" onClick={addCompetitor}
              className="btn-ghost text-xs flex items-center gap-1">
              <Plus size={14} /> Add Competitor
            </button>
          )}
        </div>

        <button type="submit" className="btn-primary" disabled={loading} id="competitor-submit">
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing...
            </span>
          ) : (
            <>
              <Swords size={16} /> Analyze Competitors
            </>
          )}
        </button>
      </form>

      {loading && <LoadingSkeleton type="competitor" />}

      {result && !result.parseError && (
        <div className="space-y-6 animate-slide-up">
          <div className="flex justify-end">
            <button onClick={() => { copyToClipboard(JSON.stringify(result, null, 2)); toast.success('Copied!'); }}
              className="btn-secondary text-sm">
              <Copy size={14} /> Copy Results
            </button>
          </div>

          {/* Site Cards */}
          {result.sites && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {result.sites.map((site, i) => (
                <div key={i} className="card space-y-4" 
                  style={i === 0 ? { borderColor: 'var(--color-purple)', borderWidth: '2px' } : {}}>
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm truncate" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-accent)' }}>
                      {site.domain}
                    </h4>
                    {i === 0 && <span className="chip chip-purple text-xs">YOU</span>}
                  </div>

                  <div className="flex justify-center">
                    <ScoreCircle score={site.estimatedDA || 0} size={80} label="DA" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-center">
                    <MiniStat label="DA" value={site.estimatedDA} />
                    <MiniStat label="PA" value={site.estimatedPA} />
                    <MiniStat label="Traffic" value={site.monthlyTraffic} />
                    <MiniStat label="Backlinks" value={site.backlinks} />
                  </div>

                  {site.topKeywords && (
                    <div>
                      <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>Top Keywords</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {site.topKeywords.slice(0, 3).map((kw, j) => (
                          <span key={j} className="chip chip-purple text-xs">{kw}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {site.strengths && (
                    <div>
                      <span className="text-xs flex items-center gap-1" style={{ color: 'var(--color-success)' }}>
                        <TrendingUp size={12} /> Strengths
                      </span>
                      <div className="mt-1 space-y-1">
                        {site.strengths.slice(0, 3).map((s, j) => (
                          <div key={j} className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                            • {s}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {site.weaknesses && (
                    <div>
                      <span className="text-xs flex items-center gap-1" style={{ color: 'var(--color-error)' }}>
                        <TrendingDown size={12} /> Weaknesses
                      </span>
                      <div className="mt-1 space-y-1">
                        {site.weaknesses.slice(0, 3).map((w, j) => (
                          <div key={j} className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                            • {w}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Content Gaps */}
          {result.contentGaps && result.contentGaps.length > 0 && (
            <div className="card-static space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-warning)' }}>
                <Target size={16} /> Content Gaps
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {result.contentGaps.map((gap, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-lg text-sm"
                    style={{ background: 'var(--color-bg-input)', color: 'var(--color-text-secondary)' }}>
                    <span style={{ color: 'var(--color-warning)' }}>◆</span> {gap}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Opportunities */}
          {result.opportunities && result.opportunities.length > 0 && (
            <div className="card-static space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-success)' }}>
                <TrendingUp size={16} /> Opportunities
              </h3>
              <div className="space-y-2">
                {result.opportunities.map((opp, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm"
                    style={{ color: 'var(--color-text-secondary)' }}>
                    <span style={{ color: 'var(--color-success)' }}>→</span> {opp}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Winning Strategy */}
          {result.winningStrategy && result.winningStrategy.length > 0 && (
            <div className="card-static space-y-3" 
              style={{ border: '1px solid rgba(123, 47, 255, 0.3)', background: 'rgba(123, 47, 255, 0.05)' }}>
              <h3 className="font-semibold text-sm flex items-center gap-2"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-accent)' }}>
                <BarChart3 size={16} /> Winning Strategy
              </h3>
              <div className="space-y-2">
                {result.winningStrategy.map((step, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm"
                    style={{ color: 'var(--color-text-secondary)' }}>
                    <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: 'var(--color-purple)', color: 'white' }}>
                      {i + 1}
                    </span>
                    {step}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verdict */}
          {result.verdict && (
            <div className="card-static p-4 rounded-xl"
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

function MiniStat({ label, value }) {
  return (
    <div className="p-2 rounded-lg" style={{ background: 'var(--color-bg-input)' }}>
      <div className="text-xs" style={{ color: 'var(--color-text-dim)' }}>{label}</div>
      <div className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
        {value || 'N/A'}
      </div>
    </div>
  );
}
