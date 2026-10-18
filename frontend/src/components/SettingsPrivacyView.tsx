import React, { useState } from 'react';
import {
  CheckCircle2,
  Download,
  Globe,
  Lock,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sliders,
  Trash2,
  X,
} from 'lucide-react';
import {
  ExtensionSettings,
  ScenarioId,
  WhitelistEntry,
} from '../types/security';

interface SettingsPrivacyViewProps {
  settings: ExtensionSettings;
  whitelist: WhitelistEntry[];
  historyCount: number;
  onUpdateSettings: (partial: Partial<ExtensionSettings>) => void;
  onAddWhitelist: (domainPattern: string, scope: string) => void;
  onRemoveWhitelist: (id: string) => void;
  onClearHistory: () => void;
  onRestoreDefaults: () => void;
  onSelectScenario?: (id: ScenarioId) => void;
  onTriggerToast: (message: string) => void;
}

export const SettingsPrivacyView: React.FC<SettingsPrivacyViewProps> = ({
  settings,
  whitelist,
  historyCount,
  onUpdateSettings,
  onAddWhitelist,
  onRemoveWhitelist,
  onClearHistory,
  onRestoreDefaults,
  onTriggerToast,
}) => {
  const [showAddDomainForm, setShowAddDomainForm] = useState(false);
  const [newDomainInput, setNewDomainInput] = useState('');
  const [newScopeInput, setNewScopeInput] = useState('Personal Safe List');
  const [confirmWipeCache, setConfirmWipeCache] = useState(false);

  const handleExportConfig = () => {
    const configPayload = {
      exportedAt: new Date().toISOString(),
      settings,
      whitelistedDomains: whitelist,
    };
    const blob = new Blob([JSON.stringify(configPayload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'authguard-settings.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onTriggerToast('Exported settings configuration');
  };

  const handleAddDomainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newDomainInput.trim().toLowerCase();
    if (!trimmed) {
      onTriggerToast('Please enter a valid domain (e.g. internal.company.com)');
      return;
    }
    onAddWhitelist(trimmed, newScopeInput.trim() || 'Safe List Exception');
    setNewDomainInput('');
    setShowAddDomainForm(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 box-border">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0b1c30]">
            Settings & Privacy
          </h1>
          <p className="text-xs sm:text-sm text-[#565e74] mt-0.5">
            Manage your protection sensitivity, trusted safe list, and local data.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={handleExportConfig}
            className="px-3 py-1.5 rounded-lg border border-[#dce9ff] bg-white hover:bg-[#f8faff] text-xs font-medium text-[#0b1c30] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#565e74]" />
            <span>Export Settings</span>
          </button>
          <button
            type="button"
            onClick={onRestoreDefaults}
            className="px-3 py-1.5 rounded-lg border border-[#dce9ff] bg-white hover:bg-[#f8faff] text-xs font-medium text-[#0b1c30] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#565e74]" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: SENSITIVITY PRESET */}
      <section className="bg-white rounded-2xl border border-[#e5eeff] p-5 sm:p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-[#0b1c30]">
            Security Sensitivity
          </h2>
          <p className="text-xs text-[#565e74]">
            Choose how strictly AuthGuard evaluates newly registered domains and potential lookalikes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              id: 'relaxed',
              title: 'Relaxed',
              desc: 'Flags only confirmed dangerous websites and unencrypted pages.',
            },
            {
              id: 'balanced',
              title: 'Balanced',
              desc: 'Recommended. Warns on suspicious lookalikes and unverified scripts.',
            },
            {
              id: 'strict',
              title: 'Strict',
              desc: 'Heightened caution. Flags new domains under 30 days old.',
            },
          ].map((preset) => {
            const isSelected = settings.sensitivityPreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  onUpdateSettings({
                    sensitivityPreset: preset.id as 'relaxed' | 'balanced' | 'strict',
                  });
                  onTriggerToast(`Sensitivity set to ${preset.title}`);
                }}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#00288e] bg-[#f4f7ff] shadow-xs'
                    : 'border-[#e5eeff] hover:border-[#b8c4ff] bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-[#0b1c30]">
                    {preset.title}
                  </span>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-[#00288e]" />
                  )}
                </div>
                <p className="text-xs text-[#565e74] leading-relaxed">
                  {preset.desc}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* SECTION 2: SAFE LIST (WHITELIST) */}
      <section className="bg-white rounded-2xl border border-[#e5eeff] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#0b1c30]">
              Safe List (Trusted Exceptions)
            </h2>
            <p className="text-xs text-[#565e74]">
              Websites added here will not be flagged by automated warnings.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddDomainForm(!showAddDomainForm)}
            className="px-3.5 py-1.5 rounded-lg bg-[#00288e] hover:bg-[#1e40af] text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Website</span>
          </button>
        </div>

        {/* Add domain form */}
        {showAddDomainForm && (
          <form
            onSubmit={handleAddDomainSubmit}
            className="p-4 rounded-xl bg-[#f8faff] border border-[#dce9ff] space-y-3"
          >
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                value={newDomainInput}
                onChange={(e) => setNewDomainInput(e.target.value)}
                placeholder="domain.com (e.g. portal.mycompany.com)"
                className="flex-1 px-3 py-2 rounded-lg border border-[#dce9ff] bg-white text-xs text-[#0b1c30] outline-none focus:border-[#00288e]"
              />
              <input
                type="text"
                value={newScopeInput}
                onChange={(e) => setNewScopeInput(e.target.value)}
                placeholder="Label / Description"
                className="sm:w-48 px-3 py-2 rounded-lg border border-[#dce9ff] bg-white text-xs text-[#0b1c30] outline-none focus:border-[#00288e]"
              />
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#00288e] text-white text-xs font-medium cursor-pointer"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddDomainForm(false)}
                  className="px-3 py-2 rounded-lg text-xs text-[#565e74] hover:bg-[#eff4ff] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Whitelist items */}
        {whitelist.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#565e74] bg-[#f8f9ff] rounded-xl border border-dashed border-[#dce9ff]">
            No websites in your safe list.
          </div>
        ) : (
          <div className="divide-y divide-[#f0f4ff] border border-[#f0f4ff] rounded-xl overflow-hidden">
            {whitelist.map((item) => (
              <div
                key={item.id}
                className="p-3 sm:px-4 flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <span className="font-semibold text-[#0b1c30] font-mono truncate block">
                    {item.domainPattern}
                  </span>
                  <span className="text-[#757684] text-[11px]">
                    {item.scope}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveWhitelist(item.id)}
                  className="p-1.5 text-[#ba1a1a] hover:bg-[#fef2f2] rounded-lg transition-colors cursor-pointer shrink-0"
                  title="Remove from Safe List"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 3: PRIVACY & DATA GUARANTEE */}
      <section className="bg-white rounded-2xl border border-[#e5eeff] p-5 sm:p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-[#0b1c30]">
            Privacy & Local Storage
          </h2>
          <p className="text-xs text-[#565e74]">
            AuthGuard works on your device. We do not store passwords, tokens, or personal credentials.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] flex items-start gap-3 text-xs text-[#166534]">
          <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-[#16a34a]" />
          <div className="space-y-1">
            <span className="font-bold text-[#14532d] block">
              Local Verification Only
            </span>
            <p className="leading-relaxed text-[#166534]">
              Security evaluations are performed directly in your browser. Passwords, OTP codes, and private form inputs are never collected, logged, or sent to any server.
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#f0f4ff]">
          <div className="text-xs">
            <span className="font-medium text-[#0b1c30] block">
              Scan History Storage
            </span>
            <span className="text-[#565e74]">
              {historyCount} website {historyCount === 1 ? 'record' : 'records'} saved locally
            </span>
          </div>

          {confirmWipeCache ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onClearHistory();
                  setConfirmWipeCache(false);
                  onTriggerToast('Cleared local scan records');
                }}
                className="px-3 py-1.5 rounded-lg bg-[#ba1a1a] text-white text-xs font-semibold cursor-pointer"
              >
                Yes, Clear All
              </button>
              <button
                type="button"
                onClick={() => setConfirmWipeCache(false)}
                className="px-3 py-1.5 rounded-lg border border-[#dce9ff] text-xs text-[#565e74] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmWipeCache(true)}
              className="px-3 py-1.5 rounded-lg border border-[#fecaca] text-[#ba1a1a] hover:bg-[#fef2f2] text-xs font-medium transition-colors cursor-pointer self-start sm:self-auto"
            >
              Clear Scan Records
            </button>
          )}
        </div>
      </section>
    </div>
  );
};
