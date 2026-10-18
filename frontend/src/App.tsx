import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import {
  ActiveNavTab,
  ExtensionSettings,
  PopupViewState,
  ScanHistoryRecord,
  ScenarioId,
  WhitelistEntry,
} from './types/security';
import {
  DEFAULT_SETTINGS,
  INITIAL_WHITELIST,
  SCENARIOS,
} from './data/mockScenarios';
import { Sidebar } from './components/Sidebar';
import { AppHeader } from './components/AppHeader';
import { Footer } from './components/Footer';
import { DashboardView } from './components/DashboardView';
import { ExtensionPopupView } from './components/ExtensionPopupView';
import { ExtensionPopupCard } from './components/ExtensionPopupCard';
import { SecurityReportView } from './components/SecurityReportView';
import { ScanHistoryView } from './components/ScanHistoryView';
import { SettingsPrivacyView } from './components/SettingsPrivacyView';
import { InteractiveDemoView } from './components/InteractiveDemoView';
import { AboutView } from './components/AboutView';

const STORAGE_KEYS = {
  SETTINGS: 'authguard_settings_v2',
  WHITELIST: 'authguard_whitelist_v2',
  HISTORY: 'authguard_history_v2',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('dashboard');
  const [activeScenarioId, setActiveScenarioId] = useState<ScenarioId>('low');
  const [popupState, setPopupState] = useState<PopupViewState>('IDLE');
  const [isQuickCheckOpen, setIsQuickCheckOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [scannerUrl, setScannerUrl] = useState<string>('');
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  const [settings, setSettings] = useState<ExtensionSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback to default
    }
    return DEFAULT_SETTINGS;
  });

  const [whitelist, setWhitelist] = useState<WhitelistEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WHITELIST);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback to default
    }
    return INITIAL_WHITELIST;
  });

  // Start with clean history — no fabricated previous scans
  const [historyRecords, setHistoryRecords] = useState<ScanHistoryRecord[]>(
    () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            // Filter out old demo dummy IDs if any exist
            return parsed.filter(
              (r) =>
                !['scan-1', 'scan-2', 'scan-3', 'scan-4', 'scan-5', 'scan-6'].includes(
                  r.id
                )
            );
          }
        }
      } catch {
        // Fallback to default
      }
      return [];
    }
  );

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {
      // Ignore storage quota errors
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WHITELIST, JSON.stringify(whitelist));
    } catch {
      // Ignore storage quota errors
    }
  }, [whitelist]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.HISTORY,
        JSON.stringify(historyRecords)
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [historyRecords]);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 3200);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const currentScenario = useMemo(
    () => SCENARIOS[activeScenarioId] || SCENARIOS.low,
    [activeScenarioId]
  );

  // Compute effective score based on sensitivity setting
  const effectiveScore = useMemo(() => {
    let delta = 0;
    if (settings.sensitivityPreset === 'relaxed') {
      delta = 4;
    } else if (settings.sensitivityPreset === 'strict') {
      delta = -6;
    }
    return Math.max(2, Math.min(100, currentScenario.baseScore + delta));
  }, [currentScenario, settings.sensitivityPreset]);

  const isCurrentDomainWhitelisted = useMemo(() => {
    return whitelist.some(
      (item) =>
        item.domainPattern.toLowerCase() ===
        currentScenario.domain.toLowerCase()
    );
  }, [whitelist, currentScenario.domain]);

  const handleUpdateSettings = (partial: Partial<ExtensionSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const handleWhitelistDomain = (domainPattern: string, scope: string) => {
    const normalized = domainPattern.trim().toLowerCase();
    const existing = whitelist.find(
      (w) => w.domainPattern.toLowerCase() === normalized
    );
    if (existing) {
      setWhitelist((prev) => prev.filter((w) => w.id !== existing.id));
      setToastMessage(`Removed ${normalized} from Safe List`);
    } else {
      const newEntry: WhitelistEntry = {
        id: `wl-${Date.now()}`,
        domainPattern: normalized,
        scope,
        addedBy: 'User Entry',
        verified: currentScenario.riskLevel === 'LOW',
      };
      setWhitelist((prev) => [newEntry, ...prev]);
      setToastMessage(`Added ${normalized} to Safe List`);
    }
  };

  const handleAddWhitelistExplicit = (domainPattern: string, scope: string) => {
    const normalized = domainPattern.trim().toLowerCase();
    if (whitelist.some((w) => w.domainPattern.toLowerCase() === normalized)) {
      setToastMessage(`${normalized} is already in your Safe List`);
      return;
    }
    const newEntry: WhitelistEntry = {
      id: `wl-${Date.now()}`,
      domainPattern: normalized,
      scope,
      addedBy: 'User Entry',
      verified: false,
    };
    setWhitelist((prev) => [newEntry, ...prev]);
    setToastMessage(`Added ${normalized} to Safe List`);
  };

  const handleRemoveWhitelistById = (id: string) => {
    setWhitelist((prev) => prev.filter((w) => w.id !== id));
    setToastMessage('Removed website from Safe List');
  };

  const handleClearHistory = () => {
    setHistoryRecords([]);
    setToastMessage('Scan history cleared');
  };

  const handleRestoreHistory = () => {
    setHistoryRecords([]);
    setToastMessage('Scan history reset');
  };

  const handleRestoreDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
    setWhitelist(INITIAL_WHITELIST);
    setHistoryRecords([]);
    setToastMessage('Restored all settings to default');
  };

  const handleBackToSafety = () => {
    setPopupState('IDLE');
    setActiveScenarioId('low');
    setActiveTab('dashboard');
    setToastMessage('Returned to Dashboard');
  };

  const handleInspectDomainReport = (scenarioId: ScenarioId) => {
    setActiveScenarioId(scenarioId);
    setActiveTab('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInspectDomainPopup = (scenarioId: ScenarioId) => {
    setActiveScenarioId(scenarioId);
    setIsQuickCheckOpen(true);
  };

  const handleStartScanFromDashboard = (url: string) => {
    setScannerUrl(url);
    setActiveTab('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScanComplete = (
    newRecord: ScanHistoryRecord,
    scenarioId: ScenarioId
  ) => {
    setHistoryRecords((prev) => [newRecord, ...prev]);
    setActiveScenarioId(scenarioId);
  };

  const handleNavigateTab = (tab: ActiveNavTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex bg-[#f8f9ff] text-[#0b1c30] overflow-x-hidden relative">
      {/* 1. Clean Left Sidebar with Dashboard, Scan History, Settings, and About */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={handleNavigateTab}
        activeScenarioId={activeScenarioId}
        onSelectScenario={(id) => {
          setPopupState('IDLE');
          setActiveScenarioId(id);
        }}
        effectiveScore={effectiveScore}
        isOpen={isSidebarMobileOpen}
        onClose={() => setIsSidebarMobileOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      {/* 2. Main Content Container */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${
          isSidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-64'
        }`}
      >
        <AppHeader
          activeTab={activeTab}
          currentScenario={currentScenario}
          activeScenarioId={activeScenarioId}
          onSelectScenario={(id) => {
            setPopupState('IDLE');
            setActiveScenarioId(id);
          }}
          effectiveScore={effectiveScore}
          onOpenSidebar={() => setIsSidebarMobileOpen(true)}
          onNavigateTab={handleNavigateTab}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          onOpenQuickCheck={() => setIsQuickCheckOpen(true)}
        />

        <main className="w-full flex-1 min-w-0 box-border">
          {activeTab === 'dashboard' && (
            <DashboardView
              historyRecords={historyRecords}
              activeScenarioId={activeScenarioId}
              onSelectScenario={setActiveScenarioId}
              onStartScan={handleStartScanFromDashboard}
              onNavigateTab={handleNavigateTab}
              onInspectDomainReport={handleInspectDomainReport}
              onInspectDomainPopup={handleInspectDomainPopup}
              onOpenQuickCheck={() => setIsQuickCheckOpen(true)}
              onTriggerToast={setToastMessage}
              settings={settings}
              whitelist={whitelist}
              onScanComplete={handleScanComplete}
            />
          )}

          {activeTab === 'scanner' && (
            <DashboardView
              historyRecords={historyRecords}
              activeScenarioId={activeScenarioId}
              onSelectScenario={setActiveScenarioId}
              onStartScan={handleStartScanFromDashboard}
              onNavigateTab={handleNavigateTab}
              onInspectDomainReport={handleInspectDomainReport}
              onInspectDomainPopup={handleInspectDomainPopup}
              onOpenQuickCheck={() => setIsQuickCheckOpen(true)}
              onTriggerToast={setToastMessage}
              settings={settings}
              whitelist={whitelist}
              onScanComplete={handleScanComplete}
            />
          )}

          {activeTab === 'popup' && (
            <ExtensionPopupView
              onNavigateTab={handleNavigateTab}
              onInspectDomainReport={handleInspectDomainReport}
              onTriggerToast={setToastMessage}
              settings={settings}
              whitelist={whitelist}
            />
          )}

          {activeTab === 'report' && (
            <SecurityReportView
              scenario={currentScenario}
              hasActualScan={historyRecords.length > 0}
              effectiveScore={effectiveScore}
              isWhitelisted={isCurrentDomainWhitelisted}
              onToggleWhitelist={handleWhitelistDomain}
              onSelectScenario={setActiveScenarioId}
              onNavigateTab={handleNavigateTab}
              onTriggerToast={setToastMessage}
            />
          )}

          {activeTab === 'history' && (
            <ScanHistoryView
              historyRecords={historyRecords}
              onClearHistory={handleClearHistory}
              onRestoreHistory={handleRestoreHistory}
              onInspectDomainReport={handleInspectDomainReport}
              onInspectDomainPopup={handleInspectDomainPopup}
              onNavigateTab={handleNavigateTab}
              onTriggerToast={setToastMessage}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPrivacyView
              settings={settings}
              whitelist={whitelist}
              historyCount={historyRecords.length}
              onUpdateSettings={handleUpdateSettings}
              onAddWhitelist={handleAddWhitelistExplicit}
              onRemoveWhitelist={handleRemoveWhitelistById}
              onClearHistory={handleClearHistory}
              onRestoreDefaults={handleRestoreDefaults}
              onSelectScenario={setActiveScenarioId}
              onTriggerToast={setToastMessage}
            />
          )}

          {activeTab === 'about' && (
            <AboutView
              onNavigateTab={handleNavigateTab}
            />
          )}

          {activeTab === 'demo' && (
            <InteractiveDemoView
              scenario={currentScenario}
              effectiveScore={effectiveScore}
              popupState={popupState}
              setPopupState={setPopupState}
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              isWhitelisted={isCurrentDomainWhitelisted}
              onWhitelistDomain={handleWhitelistDomain}
              onSelectScenario={setActiveScenarioId}
              onNavigateTab={handleNavigateTab}
              onBackToSafety={handleBackToSafety}
              onTriggerToast={setToastMessage}
            />
          )}
        </main>

        <Footer onSelectTab={handleNavigateTab} />
      </div>

      {/* AuthGuard Browser Extension Popup Modal */}
      {isQuickCheckOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="AuthGuard browser extension popup"
          className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-[#0b1c30]/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsQuickCheckOpen(false);
          }}
        >
          <div className="relative my-auto w-full max-w-[420px] shadow-2xl">
            <ExtensionPopupCard
              onClose={() => setIsQuickCheckOpen(false)}
              onNavigateTab={(tab) => {
                setIsQuickCheckOpen(false);
                handleNavigateTab(tab);
              }}
              onInspectDomainReport={(scenarioId) => {
                setIsQuickCheckOpen(false);
                handleInspectDomainReport(scenarioId);
              }}
              onTriggerToast={setToastMessage}
              settings={settings}
              whitelist={whitelist}
            />
          </div>
        </div>
      )}

      {/* Global Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 bg-[#213145] text-[#eaf1ff] px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2.5 text-xs font-medium border border-[#3755c3]/40 transition-all"
        >
          <CheckCircle2 className="w-4 h-4 text-[#85f8c4] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
