import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import SeoAuditTab from '../components/SeoAuditTab';
import CompetitorTab from '../components/CompetitorTab';
import DapaTab from '../components/DapaTab';
import KeywordTab from '../components/KeywordTab';
import HistoryPanel from '../components/HistoryPanel';
import PaywallModal from '../components/PaywallModal';
import { isLicensed, getLicenseKey, getLicensePlan, setLicenseKey, setLicensePlan, 
         hasTrialRemaining, incrementTrialUses, getTrialUses } from '../utils/helpers';
import { activateLicense } from '../utils/api';

export default function Dashboard({ theme, toggleTheme }) {
  const [activeTab, setActiveTab] = useState('seo-audit');
  const [licensed, setLicensed] = useState(isLicensed());
  const [plan, setPlan] = useState(getLicensePlan());
  const [showPaywall, setShowPaywall] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // Auto-activate if key exists
    const key = getLicenseKey();
    if (key) {
      activateLicense(key)
        .then(data => {
          setPlan(data.plan);
          setLicensePlan(data.plan);
          setLicensed(true);
        })
        .catch(() => {
          // Key might be invalid, but don't clear it yet
        });
    }
  }, []);

  const checkAccess = () => {
    if (licensed) return true;
    if (hasTrialRemaining()) {
      incrementTrialUses();
      return true;
    }
    setShowPaywall(true);
    return false;
  };

  const handleActivate = async (key) => {
    try {
      const data = await activateLicense(key);
      setLicenseKey(key);
      setLicensePlan(data.plan);
      setPlan(data.plan);
      setLicensed(true);
      setShowPaywall(false);
      toast.success(`License activated! Plan: ${data.plan.replace('_', ' ')}`);
    } catch (err) {
      toast.error(err.message || 'Invalid license key');
      throw err;
    }
  };

  const tabs = {
    'seo-audit': <SeoAuditTab checkAccess={checkAccess} />,
    'competitor': <CompetitorTab checkAccess={checkAccess} />,
    'da-pa': <DapaTab checkAccess={checkAccess} />,
    'keywords': <KeywordTab checkAccess={checkAccess} />,
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--color-bg-primary)' }}>
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        showHistory={showHistory}
        setShowHistory={setShowHistory}
      />
      
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <Header 
          theme={theme} 
          toggleTheme={toggleTheme}
          licensed={licensed}
          plan={plan}
          trialRemaining={3 - getTrialUses()}
          onActivate={() => setShowPaywall(true)}
        />
        
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {tabs[activeTab]}
          </div>
        </main>
      </div>

      {showHistory && (
        <HistoryPanel 
          onClose={() => setShowHistory(false)}
          onSelect={(entry) => {
            setActiveTab(entry.type);
            setShowHistory(false);
          }}
        />
      )}

      {showPaywall && (
        <PaywallModal 
          onClose={() => setShowPaywall(false)}
          onActivate={handleActivate}
        />
      )}
    </div>
  );
}
