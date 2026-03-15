import { useState } from 'react';
import { KeyRound, Copy, TrendingUp, TrendingDown, Minus, HelpCircle, Lightbulb, ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { runKeywordResearch } from '../utils/api';
import { addToHistory, copyToClipboard, getScoreColor } from '../utils/helpers';
import LoadingSkeleton from './LoadingSkeleton';

export default function KeywordTab({ checkAccess }) {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [sortField, setSortField] = useState('volume');
  const [sortDir, setSortDir] = useState('desc');

  const handleResearch = async (e) => {
    e.preventDefault();
    if (!keyword.trim()) return toast.error('Enter a keyword');
    if (!checkAccess()) return;

    setLoading(true);
    setResult(null);

    try {
      const data = await runKeywordResearch(keyword.trim());
      setResult(data);
      addToHistory('keywords', keyword.trim(), data);
      toast.success('Keyword research complete!');
    } catch (err) {
      toast.error(err.message || 'Research failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const sortedKeywords = result?.relatedKeywords ? [...result.relatedKeywords].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    if (typeof aVal === 'string') aVal = parseInt(aVal.replace(/[^0-9]/g, '')) || 0;
    if (typeof bVal === 'string') bVal = parseInt(bVal.replace(/[^0-9]/g, '')) || 0;
    return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
  }) : [];

  const getTrendIcon = (trend) => {
    if (trend === 'rising') return <TrendingUp size={14} style={{ color: 'var(--color-success)' }} />;
    if (trend === 'declining') return <TrendingDown size={14} style={{ color: 'var(--color-error)' }} />;
    return <Minus size={14} style={{ color: 'var(--color-text-dim)' }} />;
  };

  const getIntentChip = (intent) => {
    const colors = {
      informational: 'chip-purple',
      commercial: 'chip-warning',
      transactional: 'chip-success',
      navigational: 'chip-error'
    };
    return colors[intent] || 'chip-purple';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
          <span className="text-gradient">Keyword Research</span>
        </h2>
        <p style={{ color: 'var(--color-text-secondary)' }} className="mt-1 text-sm">
          Discover keyword opportunities, search volumes, and ranking strategies
        </p>
      </div>

      <form onSubmit={handleResearch} className="flex gap-3">
        <div className="flex-1 relative">
          <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--color-text-dim)' }} />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder='Enter seed keyword (e.g., "best SEO tools")'
            className="input-primary pl-11"
            id="keyword-input"
          />
        </div>
        <button type="submit" className="btn-primary" disabled={loading} id="keyword-submit">
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Researching...
            </span>
          ) : (
            <>
              <KeyRound size={16} /> Research
            </>
          )}
        </button>
      </form>

      {loading && <LoadingSkeleton type="keywords" />}

      {result && !result.parseError && (
        <div className="space-y-6 animate-slide-up">
          <div className="flex justify-end">
            <button onClick={() => { copyToClipboard(JSON.stringify(result, null, 2)); toast.success('Copied!'); }}
              className="btn-secondary text-sm">
              <Copy size={14} /> Copy Results
            </button>
          </div>

          {/* Main Keyword Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard label="Keyword" value={result.mainKeyword} highlight />
            <StatCard label="Search Volume" value={result.searchVolume} />
            <StatCard label="Difficulty" value={`${result.difficulty}/100`} 
              color={getScoreColor(100 - (result.difficulty || 0))} />
            <StatCard label="CPC" value={result.cpc} />
            <StatCard label="Intent" value={result.intent} />
            <StatCard label="Trend" value={result.trend} 
              icon={getTrendIcon(result.trend)} />
          </div>

          {/* Related Keywords Table */}
          {sortedKeywords.length > 0 && (
            <div className="card-static space-y-3">
              <h3 className="font-semibold text-sm" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-accent)' }}>
                Related Keywords
              </h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Keyword</th>
                      <th className="cursor-pointer" onClick={() => handleSort('volume')}>
                        <span className="flex items-center gap-1">
                          Volume <ArrowUpDown size={12} />
                        </span>
                      </th>
                      <th className="cursor-pointer" onClick={() => handleSort('difficulty')}>
                        <span className="flex items-center gap-1">
                          Difficulty <ArrowUpDown size={12} />
                        </span>
                      </th>
                      <th>CPC</th>
                      <th>Intent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedKeywords.map((kw, i) => (
                      <tr key={i}>
                        <td style={{ color: 'var(--color-text-primary)' }}>{kw.keyword}</td>
                        <td style={{ color: 'var(--color-accent)' }}>{kw.volume}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-input)' }}>
                              <div className="h-full rounded-full" style={{ 
                                width: `${kw.difficulty || 0}%`,
                                background: getScoreColor(100 - (kw.difficulty || 0))
                              }} />
                            </div>
                            <span className="text-xs">{kw.difficulty}</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--color-success)' }}>{kw.cpc}</td>
                        <td>
                          <span className={`chip text-xs ${getIntentChip(kw.intent)}`}>
                            {kw.intent}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Long-tail Keywords */}
          {result.longTailKeywords && result.longTailKeywords.length > 0 && (
            <div className="card-static space-y-3">
              <h3 className="font-semibold text-sm" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-accent)' }}>
                Long-Tail Keywords
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.longTailKeywords.map((kw, i) => (
                  <span key={i} className="chip chip-purple">{kw}</span>
                ))}
              </div>
            </div>
          )}

          {/* People Also Ask */}
          {result.questions && result.questions.length > 0 && (
            <div className="card-static space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2"
                style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-warning)' }}>
                <HelpCircle size={16} /> People Also Ask
              </h3>
              <div className="space-y-2">
                {result.questions.map((q, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 rounded-lg text-sm"
                    style={{ background: 'var(--color-bg-input)', border: '1px solid var(--color-border)' }}>
                    <span style={{ color: 'var(--color-warning)' }}>?</span>
                    <span style={{ color: 'var(--color-text-secondary)' }}>{q}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Ranking Sites */}
          {result.topRankingSites && result.topRankingSites.length > 0 && (
            <div className="card-static space-y-3">
              <h3 className="font-semibold text-sm" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-accent)' }}>
                Top Ranking Sites
              </h3>
              <div className="space-y-2">
                {result.topRankingSites.map((site, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg"
                    style={{ background: 'var(--color-bg-input)' }}>
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: 'var(--color-purple)', color: 'white' }}>
                      {i + 1}
                    </span>
                    <span className="text-sm truncate" style={{ color: 'var(--color-text-secondary)' }}>
                      {site}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Content Ideas + Ranking Tips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {result.contentIdeas && result.contentIdeas.length > 0 && (
              <div className="card-static space-y-3">
                <h3 className="font-semibold text-sm flex items-center gap-2"
                  style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-success)' }}>
                  <Lightbulb size={16} /> Content Ideas
                </h3>
                <div className="space-y-2">
                  {result.contentIdeas.map((idea, i) => (
                    <div key={i} className="text-sm flex items-start gap-2"
                      style={{ color: 'var(--color-text-secondary)' }}>
                      <span style={{ color: 'var(--color-success)' }}>💡</span> {idea}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.rankingTips && result.rankingTips.length > 0 && (
              <div className="card-static space-y-3">
                <h3 className="font-semibold text-sm flex items-center gap-2"
                  style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-accent)' }}>
                  <TrendingUp size={16} /> Ranking Tips
                </h3>
                <div className="space-y-2">
                  {result.rankingTips.map((tip, i) => (
                    <div key={i} className="text-sm flex items-start gap-2"
                      style={{ color: 'var(--color-text-secondary)' }}>
                      <span style={{ color: 'var(--color-accent)' }}>→</span> {tip}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color, icon, highlight }) {
  return (
    <div className={`p-3 rounded-xl text-center ${highlight ? '' : ''}`}
      style={{ 
        background: highlight ? 'rgba(123, 47, 255, 0.1)' : 'var(--color-bg-card)',
        border: highlight ? '1px solid rgba(123, 47, 255, 0.3)' : '1px solid var(--color-border)'
      }}>
      <div className="text-xs" style={{ color: 'var(--color-text-dim)' }}>{label}</div>
      <div className="text-sm font-bold mt-1 flex items-center justify-center gap-1" 
        style={{ color: color || 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}>
        {icon} {value || 'N/A'}
      </div>
    </div>
  );
}
