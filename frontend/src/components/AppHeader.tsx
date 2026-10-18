import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  Shield,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { ActiveNavTab, ScenarioId, SecurityScenario } from '../types/security';

interface AppHeaderProps {
  activeTab: ActiveNavTab;
  currentScenario?: SecurityScenario;
  activeScenarioId?: ScenarioId;
  onSelectScenario?: (id: ScenarioId) => void;
  effectiveScore?: number;
  onOpenSidebar: () => void;
  onNavigateTab: (tab: ActiveNavTab) => void;
  isSidebarCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onOpenQuickCheck?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  activeTab,
  onOpenSidebar,
  isSidebarCollapsed = false,
  onToggleCollapse,
  onOpenQuickCheck,
}) => {
  const getTabTitle = (tab: ActiveNavTab) => {
    switch (tab) {
      case 'dashboard':
        return 'Dashboard';
      case 'history':
        return 'Scan History';
      case 'report':
        return 'Security Report';
      case 'settings':
        return 'Settings';
      case 'about':
        return 'About';
      case 'scanner':
        return 'Scan Website';
      case 'popup':
        return 'Extension Popup';
      default:
        return 'Dashboard';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#e5eeff] h-16 px-4 sm:px-6 flex items-center justify-between gap-3 shadow-[0_1px_4px_rgba(11,28,48,0.02)] min-w-0 w-full box-border">
      {/* Left: Mobile Drawer Trigger & Desktop Sidebar Toggle + Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        {/* Mobile Hamburger Drawer Button */}
        <button
          type="button"
          onClick={onOpenSidebar}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-[#444653] hover:text-[#0b1c30] hover:bg-[#eff4ff] border border-[#dce9ff] lg:hidden transition-colors cursor-pointer shrink-0"
          aria-label="Open navigation sidebar"
          aria-controls="main-sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Collapse / Expand Toggle Button */}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex w-8 h-8 rounded-lg items-center justify-center text-[#565e74] hover:text-[#0b1c30] hover:bg-[#eff4ff] border border-[#dce9ff] transition-colors cursor-pointer shrink-0"
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        )}

        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-[#0b1c30] tracking-tight truncate">
            {getTabTitle(activeTab)}
          </h1>
        </div>
      </div>

      {/* Right: Extension Popup Trigger Button */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {onOpenQuickCheck && (
          <button
            type="button"
            onClick={onOpenQuickCheck}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-[#00288e] border border-[#c8dbff] text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            title="Open AuthGuard browser extension popup"
          >
            <Shield className="w-3.5 h-3.5 text-[#00288e] shrink-0" />
            <span className="hidden sm:inline">Extension</span>
            <span className="text-[10px] bg-[#00288e] text-white px-1.5 py-0.2 rounded font-mono">
              Popup
            </span>
          </button>
        )}

      </div>
    </header>
  );
};
