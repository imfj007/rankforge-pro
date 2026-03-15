import { Sun, Moon, Shield, Zap, User } from 'lucide-react';

export default function Header({ theme, toggleTheme, licensed, plan, trialRemaining, onActivate }) {
  const planLabel = plan ? plan.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '';

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b"
      style={{ 
        background: 'var(--color-bg-secondary)', 
        borderColor: 'var(--color-border)' 
      }}>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-purple flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <h1 className="text-lg font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
            <span className="text-gradient-purple">Rank</span>
            <span style={{ color: 'var(--color-text-primary)' }}>Forge</span>
            <span className="text-xs ml-1 px-2 py-0.5 rounded-full" 
              style={{ background: 'rgba(123, 47, 255, 0.15)', color: 'var(--color-accent)', fontSize: '10px' }}>
              PRO
            </span>
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Trial / Plan indicator */}
        {licensed ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{ background: 'var(--color-success-dim)', border: '1px solid rgba(0, 255, 148, 0.3)' }}>
            <Shield size={14} style={{ color: 'var(--color-success)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--color-success)' }}>
              {planLabel}
            </span>
          </div>
        ) : (
          <button onClick={onActivate}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-all hover:scale-105"
            style={{ 
              background: trialRemaining > 0 ? 'var(--color-warning-dim)' : 'var(--color-error-dim)',
              border: trialRemaining > 0 
                ? '1px solid rgba(255, 215, 0, 0.3)' 
                : '1px solid rgba(255, 77, 77, 0.3)'
            }}>
            <Zap size={14} style={{ color: trialRemaining > 0 ? 'var(--color-warning)' : 'var(--color-error)' }} />
            <span className="text-xs font-medium" 
              style={{ color: trialRemaining > 0 ? 'var(--color-warning)' : 'var(--color-error)' }}>
              {trialRemaining > 0 ? `${trialRemaining} trial uses left` : 'Activate License'}
            </span>
          </button>
        )}

        {/* Theme toggle */}
        <button onClick={toggleTheme}
          className="p-2 rounded-lg cursor-pointer transition-all hover:scale-110"
          style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}
          id="theme-toggle">
          {theme === 'dark' ? (
            <Sun size={16} style={{ color: 'var(--color-warning)' }} />
          ) : (
            <Moon size={16} style={{ color: 'var(--color-purple)' }} />
          )}
        </button>
      </div>
    </header>
  );
}
