import { X, Clock, Search, Swords, Globe, KeyRound, Trash2 } from 'lucide-react';
import { getHistory, clearHistory } from '../utils/helpers';
import toast from 'react-hot-toast';

const typeIcons = {
  'seo-audit': Search,
  'competitor': Swords,
  'da-pa': Globe,
  'keywords': KeyRound,
};

const typeLabels = {
  'seo-audit': 'SEO Audit',
  'competitor': 'Competitor Analysis',
  'da-pa': 'DA/PA Check',
  'keywords': 'Keyword Research',
};

export default function HistoryPanel({ onClose, onSelect }) {
  const history = getHistory();

  const handleClear = () => {
    clearHistory();
    toast.success('History cleared');
    onClose();
  };

  const getInputLabel = (entry) => {
    if (typeof entry.input === 'string') return entry.input;
    if (entry.input?.myDomain) return `${entry.input.myDomain} vs ${entry.input.competitors?.join(', ')}`;
    return 'N/A';
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="fixed top-0 right-0 h-full w-80 z-40 border-l flex flex-col animate-fade-in"
      style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
      
      <div className="h-16 flex items-center justify-between px-4 border-b" 
        style={{ borderColor: 'var(--color-border)' }}>
        <h3 className="font-semibold flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
          <Clock size={16} style={{ color: 'var(--color-accent)' }} />
          History
        </h3>
        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <button onClick={handleClear} className="p-1.5 rounded-lg cursor-pointer hover:bg-red-500/10 transition-all" title="Clear history">
              <Trash2 size={14} style={{ color: 'var(--color-error)' }} />
            </button>
          )}
          <button onClick={onClose} className="p-1.5 rounded-lg cursor-pointer hover:bg-white/5 transition-all">
            <X size={16} style={{ color: 'var(--color-text-secondary)' }} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {history.length === 0 ? (
          <div className="text-center py-12">
            <Clock size={32} className="mx-auto mb-3" style={{ color: 'var(--color-text-dim)' }} />
            <p className="text-sm" style={{ color: 'var(--color-text-dim)' }}>
              No history yet
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-dim)' }}>
              Your analyses will appear here
            </p>
          </div>
        ) : (
          history.map((entry) => {
            const Icon = typeIcons[entry.type] || Search;
            return (
              <button
                key={entry.id}
                onClick={() => onSelect(entry)}
                className="w-full text-left p-3 rounded-xl cursor-pointer transition-all hover:scale-[1.02]"
                style={{ 
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border)'
                }}>
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={12} style={{ color: 'var(--color-accent)' }} />
                  <span className="text-xs font-medium" style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-heading)' }}>
                    {typeLabels[entry.type]}
                  </span>
                </div>
                <div className="text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>
                  {getInputLabel(entry)}
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--color-text-dim)' }}>
                  {formatTime(entry.timestamp)}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
