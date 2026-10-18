import React from 'react';
import {
  ArrowRight,
  ExternalLink,
  Info,
  Shield,
  X,
} from 'lucide-react';
import {
  ActiveNavTab,
  ExtensionSettings,
  PopupViewState,
  ScenarioId,
  SecurityScenario,
  WhitelistEntry,
} from '../types/security';
import { AuthGuardLogo } from './AuthGuardLogo';

export interface ExtensionPopupCardProps {
  onNavigateTab?: (tab: ActiveNavTab) => void;
  onInspectDomainReport?: (scenarioId: ScenarioId) => void;
  onTriggerToast?: (message: string) => void;
  onClose?: () => void;
  settings?: ExtensionSettings;
  whitelist?: WhitelistEntry[];
  compactMode?: boolean;
  scenario?: SecurityScenario;
  effectiveScore?: number;
  popupState?: PopupViewState;
  setPopupState?: (state: PopupViewState) => void;
  onUpdateSettings?: (partial: Partial<ExtensionSettings>) => void;
  isWhitelisted?: boolean;
  onWhitelistDomain?: (domain: string, scope: string) => void;
  onBackToSafety?: () => void;
  onSelectScenario?: (id: ScenarioId) => void;
}

export const ExtensionPopupCard: React.FC<ExtensionPopupCardProps> = ({
  onNavigateTab,
  onInspectDomainReport,
  onClose,
  scenario,
}) => {
  return (
    <div className="w-full max-w-[380px] sm:max-w-[400px] bg-white rounded-2xl border border-[#dce9ff] shadow-xl overflow-hidden flex flex-col font-sans transition-all text-[#0b1c30]">
      {/* 1. HEADER: BRANDING & CLOSE */}
      <header className="bg-white border-b border-[#e5eeff] px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <AuthGuardLogo size="sm" />
          <span className="font-bold text-sm tracking-tight text-[#0b1c30]">
            AuthGuard
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[#565e74] hover:text-[#0b1c30] hover:bg-[#eff4ff] transition-colors cursor-pointer"
              aria-label="Close popup"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* 2. BODY CONTENT: MINIMAL & REALISTIC */}
      <div className="p-4 sm:p-5 flex-1 space-y-4">
        {scenario ? (
          /* DISPLAY ACTUAL SCENARIO/RESULT WHEN PROVIDED FOR FUTURE INTEGRATION */
          <div className="rounded-xl border border-[#dce9ff] bg-[#f8f9ff] p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#00288e] truncate">
                {scenario.domain}
              </span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white border border-[#dce9ff] text-[#565e74]">
                {scenario.scenarioTitle}
              </span>
            </div>
            <p className="text-xs text-[#444653] leading-relaxed">
              {scenario.headline || scenario.explanation}
            </p>
            {onInspectDomainReport && (
              <button
                type="button"
                onClick={() => onInspectDomainReport(scenario.id)}
                className="text-xs font-semibold text-[#00288e] hover:underline flex items-center gap-1 pt-1 cursor-pointer"
              >
                <span>View Full Report</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          /* MINIMAL CLEAN EMPTY STATE */
          <div className="rounded-xl border border-[#e5eeff] bg-[#f8f9ff] p-5 sm:p-6 text-center flex flex-col items-center justify-center min-h-[190px]">
            {/* Neutral Shield Icon */}
            <div className="w-12 h-12 rounded-2xl bg-white border border-[#dce9ff] flex items-center justify-center text-[#565e74] shadow-2xs mb-3.5">
              <Shield className="w-6 h-6 text-[#00288e]" />
            </div>

            {/* Primary Neutral Message */}
            <h3 className="text-sm font-bold text-[#0b1c30] tracking-tight">
              Your security results will appear here.
            </h3>

            {/* Short Supporting Message */}
            <p className="text-xs text-[#565e74] mt-1.5 max-w-[260px] leading-relaxed">
              Run a security check to see the results.
            </p>

            {/* Action to navigate to scanner if available */}
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => {
                  if (onClose) onClose();
                  onNavigateTab('dashboard');
                }}
                className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#c8dbff] text-[#00288e] hover:bg-[#eff4ff] text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* SUBTLE INDICATOR: INTEGRATION IN PROGRESS */}
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#f0f4ff] border border-[#dce9ff] text-xs text-[#565e74]">
          <Info className="w-3.5 h-3.5 text-[#00288e] shrink-0 mt-0.5" />
          <p className="text-[11px] leading-normal text-[#444653]">
            Full extension scanner integration is in progress.
          </p>
        </div>
      </div>

      {/* 3. FOOTER: SIMPLE & HONEST */}
      <footer className="bg-[#f8f9ff] border-t border-[#e5eeff] px-4 py-2.5 flex items-center justify-between text-[11px] text-[#565e74] shrink-0">
        <span className="font-medium text-[#0b1c30]">AuthGuard</span>
        <span>Browser Extension</span>
      </footer>
    </div>
  );
};
