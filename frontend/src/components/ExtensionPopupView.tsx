import React from 'react';
import {
  ActiveNavTab,
  ExtensionSettings,
  ScenarioId,
  WhitelistEntry,
} from '../types/security';
import { ExtensionPopupCard } from './ExtensionPopupCard';

interface ExtensionPopupViewProps {
  onNavigateTab: (tab: ActiveNavTab) => void;
  onInspectDomainReport?: (scenarioId: ScenarioId) => void;
  onTriggerToast: (message: string) => void;
  settings?: ExtensionSettings;
  whitelist?: WhitelistEntry[];
}

export const ExtensionPopupView: React.FC<ExtensionPopupViewProps> = ({
  onNavigateTab,
  onInspectDomainReport,
  onTriggerToast,
  settings,
  whitelist,
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-2xl border border-[#e5eeff] p-5 shadow-xs space-y-1">
        <h2 className="text-base sm:text-lg font-bold text-[#0b1c30]">
          Extension Popup Preview
        </h2>
        <p className="text-xs text-[#565e74] max-w-2xl">
          Preview of the compact AuthGuard browser extension popup interface.
        </p>
      </div>

      {/* Extension Popup Centered Preview */}
      <div className="flex justify-center py-4">
        <ExtensionPopupCard
          onNavigateTab={onNavigateTab}
          onInspectDomainReport={onInspectDomainReport}
          onTriggerToast={onTriggerToast}
          settings={settings}
          whitelist={whitelist}
        />
      </div>
    </div>
  );
};
