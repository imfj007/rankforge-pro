import { Search, Swords, Globe, KeyRound, History, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';

const tabs = [
  { id: 'seo-audit', label: 'SEO Audit', icon: Search, description: 'Analyze any URL' },
  { id: 'competitor', label: 'Competitors', icon: Swords, description: 'Compare domains' },
  { id: 'da-pa', label: 'DA/PA Check', icon: Globe, description: 'Domain metrics' },
  { id: 'keywords', label: 'Keywords', icon: KeyRound, description: 'Keyword research' },
];

export default function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen, showHistory, setShowHistory }) {
  return (
    <aside 
      className={`fixed top-0 left-0 h-full z-30 flex flex-col transition-all duration-300 border-r ${isOpen ? 'w-64' : 'w-16'}`}
      style={{ 
        background: 'var(--color-bg-secondary)', 
        borderColor: 'var(--color-border)' 
      }}>
      
      {/* Toggle button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer z-40"
        style={{ 
          background: 'var(--color-purple)', 
          border: '2px solid var(--color-bg-primary)' 
        }}>
        {isOpen ? <ChevronLeft size={12} color="white" /> : <ChevronRight size={12} color="white" />}
      </button>

      {/* Logo area - when collapsed */}
      <div className="h-16 flex items-center justify-center border-b" style={{ borderColor: 'var(--color-border)' }}>
        {isOpen ? (
          <div className="flex items-center gap-2 px-4">
            <BarChart3 size={24} style={{ color: 'var(--color-purple)' }} />
            <span className="font-bold text-gradient-purple" style={{ fontFamily: 'var(--font-heading)' }}>
              RankForge
            </span>
          </div>
        ) : (
          <BarChart3 size={22} style={{ color: 'var(--color-purple)' }} />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        <div className={`px-3 py-2 ${isOpen ? 'block' : 'hidden'}`}>
          <span className="text-xs font-semibold uppercase tracking-wider" 
            style={{ color: 'var(--color-text-dim)', fontFamily: 'var(--font-heading)' }}>
            Tools
          </span>
        </div>

        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 rounded-xl cursor-pointer transition-all duration-200
                ${isOpen ? 'px-4 py-3' : 'px-0 py-3 justify-center'}
                ${isActive ? 'tab-active' : 'tab-inactive'}`}
              style={isActive ? { 
                background: 'linear-gradient(135deg, rgba(123, 47, 255, 0.15), rgba(192, 132, 252, 0.08))',
                borderLeft: '3px solid var(--color-purple)'
              } : {}}
              title={!isOpen ? tab.label : undefined}>
              <Icon size={18} style={{ 
                color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                flexShrink: 0
              }} />
              {isOpen && (
                <div className="text-left">
                  <div className="text-sm font-medium" style={{ 
                    fontFamily: 'var(--font-heading)',
                    color: isActive ? 'var(--color-accent)' : 'var(--color-text-primary)' 
                  }}>
                    {tab.label}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
                    {tab.description}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* History button */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <button 
          onClick={() => setShowHistory(!showHistory)}
          className={`w-full flex items-center gap-3 rounded-xl cursor-pointer transition-all duration-200 
            ${isOpen ? 'px-4 py-3' : 'px-0 py-3 justify-center'}`}
          style={{ 
            background: showHistory ? 'rgba(123, 47, 255, 0.1)' : 'transparent',
            color: showHistory ? 'var(--color-accent)' : 'var(--color-text-secondary)'
          }}
          title={!isOpen ? 'History' : undefined}>
          <History size={18} />
          {isOpen && (
            <span className="text-sm font-medium" style={{ fontFamily: 'var(--font-heading)' }}>
              History
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}
