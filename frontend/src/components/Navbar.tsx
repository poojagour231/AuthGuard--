import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { ActiveNavTab, ScenarioId } from '../types/security';
import { AuthGuardLogo } from './AuthGuardLogo';

interface NavbarProps {
  activeTab: ActiveNavTab;
  onSelectTab: (tab: ActiveNavTab) => void;
  activeScenarioId: ScenarioId;
  onSelectScenario: (id: ScenarioId) => void;
  effectiveScore: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  activeScenarioId,
  onSelectScenario,
}) => {
  const navItems: Array<{ id: ActiveNavTab; label: string }> = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'scanner', label: 'Website Scanner' },
    { id: 'report', label: 'Security Reports' },
    { id: 'history', label: 'Scan History' },
    { id: 'popup', label: 'Browser Security' },
    { id: 'demo', label: 'Interactive Demo' },
    { id: 'settings', label: 'Settings & Privacy' },
  ];

  const isLow = activeScenarioId === 'low' || activeScenarioId === 'cloudvault' || activeScenarioId === 'github';
  const isMedium = activeScenarioId === 'medium';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#e5eeff] shadow-[0_1px_6px_rgba(11,28,48,0.03)]">
      {/* Main 3-Zone Top Bar */}
      <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <button
          type="button"
          onClick={() => onSelectTab('dashboard')}
          className="flex items-center gap-2.5 shrink-0 text-left cursor-pointer"
        >
          <AuthGuardLogo size="md" />
          <span className="text-base font-bold tracking-tight text-[#0b1c30] whitespace-nowrap">
            AuthGuard
          </span>
        </button>

        {/* Zone 2: 5 Primary Navigation Links */}
        <nav
          className="hidden lg:flex items-center gap-1"
          aria-label="Primary Navigation"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`px-3.5 py-2 rounded-lg text-[13px] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#e5eeff] text-[#00288e] font-semibold'
                    : 'text-[#444653] hover:text-[#0b1c30] hover:bg-[#eff4ff] font-medium'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Global Scenario Switcher Control */}
        <div className="flex items-center gap-1.5 bg-[#eff4ff] p-1 rounded-xl border border-[#dce9ff] shrink-0">
          <button
            type="button"
            onClick={() => onSelectScenario('low')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all whitespace-nowrap cursor-pointer ${
              isLow
                ? 'bg-white text-[#00563a] shadow-2xs'
                : 'text-[#444653] hover:text-[#0b1c30]'
            }`}
            title="Switch to Low Risk Scenario (checkout.stripe-demo.com)"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00563a]" />
            <span>Low Risk</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectScenario('medium')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all whitespace-nowrap cursor-pointer ${
              isMedium
                ? 'bg-white text-amber-800 shadow-2xs'
                : 'text-[#444653] hover:text-[#0b1c30]'
            }`}
            title="Switch to Medium Risk Scenario (pay-invoice-portal.net)"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Medium</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectScenario('high')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all whitespace-nowrap cursor-pointer ${
              !isLow && !isMedium
                ? 'bg-white text-[#ba1a1a] shadow-2xs'
                : 'text-[#444653] hover:text-[#0b1c30]'
            }`}
            title="Switch to High Risk Scenario (secure-apple-id-verify.login-sync.cc)"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#ba1a1a]" />
            <span>High Risk</span>
          </button>
        </div>
      </div>

      {/* Responsive Mobile/Tablet Navigation Strip */}
      <div className="flex lg:hidden items-center gap-1 px-4 py-2 overflow-x-auto border-t border-[#eff4ff] bg-white">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#e5eeff] text-[#00288e] font-semibold'
                  : 'text-[#444653] hover:text-[#0b1c30] font-medium'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Prototype Simulation Honesty Sub-Bar */}
      <div className="w-full bg-[#eff4ff] border-t border-[#dce9ff] py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center text-[11px] font-medium text-[#444653]">
          <Info className="w-3.5 h-3.5 text-[#00288e] shrink-0" />
          <span>
            <strong className="text-[#0b1c30] font-semibold">
              PROTOTYPE SIMULATION MODE (DEMO DATA):
            </strong>{' '}
            All displayed telemetry, certificates, and risk scores are simulated
            demonstration data for UI/UX evaluation. No real passwords or OTPs
            are collected.
          </span>
        </div>
      </div>
    </header>
  );
};
