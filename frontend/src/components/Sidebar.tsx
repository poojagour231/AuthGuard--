import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  History,
  Info,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  X,
} from 'lucide-react';
import { ActiveNavTab, ScenarioId } from '../types/security';
import { AuthGuardLogo } from './AuthGuardLogo';

export interface SidebarProps {
  activeTab: ActiveNavTab;
  onSelectTab: (tab: ActiveNavTab) => void;
  activeScenarioId?: ScenarioId;
  onSelectScenario?: (id: ScenarioId) => void;
  effectiveScore?: number;
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpen,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  // Exactly 4 main navigation items:
  // Dashboard, Scan History, Settings, About
  const navItems: Array<{
    id: ActiveNavTab;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      description: 'Website scanner & report',
      icon: LayoutDashboard,
    },
    {
      id: 'history',
      label: 'Scan History',
      description: 'Previous scans & reports',
      icon: History,
    },
    {
      id: 'settings',
      label: 'Settings',
      description: 'Preferences & Safe List',
      icon: Settings,
    },
    {
      id: 'about',
      label: 'About',
      description: 'Product info & principles',
      icon: Info,
    },
  ];

  const handleNavClick = (tab: ActiveNavTab) => {
    onSelectTab(tab);
    onClose();
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          role="presentation"
          onClick={onClose}
          className="fixed inset-0 bg-[#0b1c30]/40 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-200"
          aria-label="Close navigation drawer"
        />
      )}

      {/* Main Sidebar Aside */}
      <aside
        id="main-sidebar"
        aria-label="Application Navigation Sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 bg-white border-r border-[#e5eeff] shadow-[2px_0_12px_rgba(11,28,48,0.03)] flex flex-col justify-between transition-all duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'lg:w-[72px]' : 'lg:w-64'} w-64`}
      >
        {/* Top: Product Branding */}
        <div className="flex flex-col shrink-0">
          <div
            className={`h-16 px-4 border-b border-[#e5eeff] flex items-center justify-between ${
              isCollapsed ? 'lg:justify-center lg:px-2' : ''
            }`}
          >
            <button
              type="button"
              onClick={() => handleNavClick('dashboard')}
              className="flex items-center gap-2.5 text-left cursor-pointer group min-w-0"
              title="AuthGuard — Dashboard"
            >
              <AuthGuardLogo size={isCollapsed ? 'sm' : 'md'} />
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-base font-bold tracking-tight text-[#0b1c30] group-hover:text-[#00288e] transition-colors whitespace-nowrap truncate">
                    AuthGuard
                  </span>
                  <span className="text-[10px] font-medium text-[#565e74] tracking-wide whitespace-nowrap">
                    Browser Security
                  </span>
                </div>
              )}
            </button>

            {/* Desktop Collapse / Expand Toggle */}
            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden lg:flex w-7 h-7 rounded-lg items-center justify-center text-[#565e74] hover:text-[#0b1c30] hover:bg-[#eff4ff] transition-colors cursor-pointer shrink-0 ml-1"
                title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </button>
            )}

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#444653] hover:text-[#0b1c30] hover:bg-[#eff4ff] transition-colors lg:hidden cursor-pointer"
              aria-label="Close navigation sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Middle: Simplified Navigation Links */}
        <nav
          className="flex-1 overflow-y-auto px-2.5 py-4 space-y-1.5"
          aria-label="Sidebar Primary Navigation"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            // Mark active if current tab matches (or if tab is report/scanner, highlight appropriate parent)
            const isActive =
              activeTab === item.id ||
              (item.id === 'history' && activeTab === 'report') ||
              (item.id === 'dashboard' && activeTab === 'scanner');

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                aria-current={isActive ? 'page' : undefined}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center rounded-xl text-left transition-all cursor-pointer group ${
                  isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'
                } ${
                  isActive
                    ? 'bg-[#e5eeff] text-[#00288e] font-semibold shadow-2xs'
                    : 'text-[#444653] hover:text-[#0b1c30] hover:bg-[#f8f9ff] font-medium'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isActive
                      ? 'bg-[#00288e] text-white shadow-2xs'
                      : 'bg-[#eff4ff] text-[#00288e] group-hover:bg-[#dce9ff]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {!isCollapsed && (
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm leading-tight truncate">
                      {item.label}
                    </span>
                    <span
                      className={`text-[11px] leading-tight truncate mt-0.5 ${
                        isActive ? 'text-[#00288e]/80' : 'text-[#757684]'
                      }`}
                    >
                      {item.description}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom: Clean Protection Status */}
        <div className="p-3 border-t border-[#e5eeff] bg-[#f8f9ff] shrink-0">
          {!isCollapsed ? (
            <div className="flex items-center gap-2 px-1 text-xs text-[#444653]">
              <span className="w-2 h-2 rounded-full bg-[#16a34a] shrink-0" />
              <span className="font-medium text-[#0b1c30]">Scanner Ready</span>
            </div>
          ) : (
            <div className="flex justify-center" title="Scanner Ready">
              <span className="w-2.5 h-2.5 rounded-full bg-[#16a34a]" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
