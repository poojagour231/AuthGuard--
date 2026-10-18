import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Bug,
  CheckCircle2,
  Code2,
  Cpu,
  EyeOff,
  ExternalLink,
  ListChecks,
  Lock,
  MoreVertical,
  RefreshCw,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  SpellCheck,
  Terminal,
  XCircle,
} from 'lucide-react';
import {
  ActiveNavTab,
  ExtensionSettings,
  PopupViewState,
  ScenarioId,
  SecurityScenario,
} from '../types/security';
import { SCENARIOS } from '../data/mockScenarios';
import { ExtensionPopupCard } from './ExtensionPopupCard';

interface InteractiveDemoViewProps {
  scenario: SecurityScenario;
  effectiveScore: number;
  popupState: PopupViewState;
  setPopupState: (state: PopupViewState) => void;
  settings: ExtensionSettings;
  onUpdateSettings: (partial: Partial<ExtensionSettings>) => void;
  isWhitelisted: boolean;
  onWhitelistDomain: (domain: string, scope: string) => void;
  onSelectScenario: (id: ScenarioId) => void;
  onNavigateTab: (tab: ActiveNavTab) => void;
  onBackToSafety: () => void;
  onTriggerToast: (message: string) => void;
}

export const InteractiveDemoView: React.FC<InteractiveDemoViewProps> = ({
  scenario,
  effectiveScore,
  popupState,
  setPopupState,
  settings,
  onUpdateSettings,
  isWhitelisted,
  onWhitelistDomain,
  onSelectScenario,
  onNavigateTab,
  onBackToSafety,
  onTriggerToast,
}) => {
  const [weights, setWeights] = useState(scenario.simulator.weights);
  const [logs, setLogs] = useState(scenario.simulator.logs);
  const [scriptInjected, setScriptInjected] = useState(false);
  const [typosquatSimulated, setTyposquatSimulated] = useState(false);
  const [showInlinePopup, setShowInlinePopup] = useState(false);

  // Sync local simulator state when scenario changes
  useEffect(() => {
    setWeights(scenario.simulator.weights);
    setLogs(scenario.simulator.logs);
    setScriptInjected(false);
    setTyposquatSimulated(false);
  }, [scenario]);

  const isLow = scenario.riskLevel === 'LOW';
  const isMedium = scenario.riskLevel === 'MEDIUM';
  const isHigh = scenario.riskLevel === 'HIGH';

  // Calculate dynamic score when anomalies are triggered
  const anomalyPenalty =
    (scriptInjected ? 18 : 0) + (typosquatSimulated ? 22 : 0);
  const displayedScore = Math.max(4, effectiveScore - anomalyPenalty);

  const appendLog = (
    text: string,
    tone: 'safe' | 'caution' | 'danger' | 'primary' | 'neutral'
  ) => {
    const now = new Date();
    const timeStr = `[${now.toTimeString().split(' ')[0]}.${String(
      now.getMilliseconds()
    )
      .padStart(2, '0')
      .slice(0, 2)}]`;
    setLogs((prev) => [...prev, { time: timeStr, text, tone }]);
  };

  const handleTriggerScriptInjection = () => {
    setScriptInjected(true);
    setWeights((prev) => ({
      ...prev,
      dom: Math.max(12, prev.dom - 36),
      script: Math.max(8, prev.script - 44),
    }));
    appendLog(
      'INTRUSION_SIM: Synthetic unauthorized fetch hook attached to window.fetch',
      'danger'
    );
    appendLog(
      'HEURISTIC_RESPONSE: Sandboxed script flagged in 4.1ms. Alert dispatched to UI.',
      'primary'
    );
    onTriggerToast('Simulated unauthorized script injection anomaly (DEMO DATA)');
  };

  const handleSimulateTyposquat = () => {
    setTyposquatSimulated(true);
    setWeights((prev) => ({
      ...prev,
      origin: 24,
    }));
    appendLog(
      'TYPOSQUAT_SIM: Synthesizing Unicode punycode variations for target domain...',
      'caution'
    );
    appendLog(
      'DISTANCE_METRIC: Damerau-Levenshtein calculation scored similarity at 0.96 (Spoof risk).',
      'danger'
    );
    onTriggerToast('Simulated homograph & typosquatting anomaly (DEMO DATA)');
  };

  const handleResetBaseline = () => {
    setWeights(scenario.simulator.weights);
    setLogs(scenario.simulator.logs);
    setScriptInjected(false);
    setTyposquatSimulated(false);
    appendLog(
      'SYSTEM_RESET: Re-initialized execution sandbox to baseline state.',
      'safe'
    );
    onTriggerToast('Reset simulator telemetry to baseline');
  };

  const handleSimulatedFormAction = () => {
    if (isHigh || scriptInjected || typosquatSimulated) {
      appendLog(
        `FORM_GUARD: Advisory triggered on ${scenario.domain}. Simulated submission halted.`,
        'danger'
      );
      onTriggerToast(
        'AuthGuard Advisory: Simulated submission flagged due to elevated risk indicators.'
      );
    } else if (isMedium) {
      appendLog(
        `FORM_CAUTION: Cross-origin action detected on ${scenario.domain}. User confirmation advised.`,
        'caution'
      );
      onTriggerToast(
        'Caution: Simulated form points to an external host (DEMO DATA).'
      );
    } else {
      appendLog(
        `FORM_VALIDATED: Simulated handshake verified for ${scenario.domain}.`,
        'safe'
      );
      onTriggerToast(
        'Verified: Simulated authentication request passed all sandbox checks.'
      );
    }
  };

  const scenarioCards: Array<{
    id: ScenarioId;
    code: string;
    badgeText: string;
    title: string;
    domain: string;
    bullet1: string;
    bullet2: string;
    tone: 'low' | 'medium' | 'high';
  }> = [
    {
      id: 'low',
      code: 'SCENARIO A',
      badgeText: '94/100 Safe',
      title: 'Validated SaaS Login',
      domain: 'checkout.stripe-demo.com',
      bullet1: 'TLS 1.3 Strict · Zero-Revocation',
      bullet2: 'CSP Intact · Sandboxed iFrame',
      tone: 'low',
    },
    {
      id: 'medium',
      code: 'SCENARIO B',
      badgeText: '58/100 Caution',
      title: 'Ambiguous Payment Gateway',
      domain: 'pay-invoice-portal.net',
      bullet1: 'Domain Age: 18 Days · Redacted WHOIS',
      bullet2: 'Third-Party Cross-Origin Form Action',
      tone: 'medium',
    },
    {
      id: 'high',
      code: 'SCENARIO C',
      badgeText: '18/100 High Risk',
      title: 'Deceptive Phishing Intercept',
      domain: 'secure-apple-id-verify.login-sync.cc',
      bullet1: 'Lookalike Subdomain & Homoglyph Spoof',
      bullet2: 'Input Field Exfiltration Listener Active',
      tone: 'high',
    },
  ];

  const barColorClass =
    isHigh || scriptInjected || typosquatSimulated
      ? 'bg-[#ba1a1a]'
      : isMedium
      ? 'bg-amber-500'
      : 'bg-[#00288e]';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Top Hero Sandbox Banner */}
      <div className="w-full rounded-xl bg-[#eff4ff] border border-[#dce9ff] shadow-2xs mb-6 p-6 md:p-7">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#1e40af] text-white text-[10px] font-semibold uppercase tracking-wider">
                Evaluation Environment · DEMO DATA
              </span>
              <span className="text-[#565e74] text-xs font-semibold">
                v2.4-SANDBOX
              </span>
            </div>
            <h1 className="text-xl font-bold text-[#0b1c30] tracking-tight">
              Interactive Security Simulator & Scenario Lab
            </h1>
            <p className="text-[13px] text-[#444653] mt-1 max-w-2xl leading-relaxed">
              Select a pre-configured threat scenario to observe how AuthGuard
              AI evaluates DOM trees, flags lookalike spoofs, and updates risk
              scores across both the web viewport and extension popup.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigateTab('popup')}
              className="bg-white hover:bg-[#e5eeff] text-[#00288e] border border-[#c4c5d5] px-4 py-2.5 rounded-lg shadow-2xs text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Shield className="w-4 h-4" />
              <span>View Full Extension Popup</span>
            </button>
          </div>
        </div>

        {/* Safe Simulation Sandbox Notice */}
        <div className="mt-5 p-3.5 bg-white rounded-lg border border-[#e5eeff] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#e5eeff] flex items-center justify-center shrink-0 text-[#00288e]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-[#0b1c30] font-semibold uppercase tracking-wider">
                Safe Simulation Sandbox Notice (DEMO DATA)
              </div>
              <p className="text-xs text-[#444653]">
                All pages, exploits, and telemetry shown below are synthetic
                mock environments for UI/UX demonstration. No real attacks are
                executed and no passwords or OTPs are collected.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded bg-[#dae2fd] text-[#3f465c] text-[10px] font-semibold uppercase shrink-0 self-start sm:self-center">
            Air-Gapped Sandbox
          </span>
        </div>
      </div>

      {/* SCENARIO SELECTOR GRID (Low, Medium, High Risk) */}
      <section className="mb-8" aria-label="Select Target Vector for Emulation">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold text-[#565e74] uppercase tracking-widest">
            Select Target Vector for Emulation
          </span>
          <span className="text-[11px] text-[#757684]">
            Click any scenario to update score, explanation, and telemetry
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {scenarioCards.map((card) => {
            const isSelected = scenario.id === card.id;
            const topBarColor =
              card.tone === 'high'
                ? 'bg-[#ba1a1a]'
                : card.tone === 'medium'
                ? 'bg-amber-500'
                : 'bg-[#00288e]';

            return (
              <button
                key={card.id}
                type="button"
                onClick={() => onSelectScenario(card.id)}
                className={`text-left p-5 rounded-xl bg-white border transition-all duration-200 relative overflow-hidden group cursor-pointer ${
                  isSelected
                    ? 'border-[#1e40af] shadow-md'
                    : 'border-[#e5eeff] shadow-2xs opacity-85 hover:opacity-100 hover:shadow-sm'
                }`}
              >
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${
                    isSelected ? topBarColor : 'bg-transparent'
                  }`}
                />
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span
                    className={`px-2 py-0.5 rounded bg-[#e5eeff] text-[10px] font-bold ${
                      card.tone === 'high'
                        ? 'text-[#ba1a1a]'
                        : card.tone === 'medium'
                        ? 'text-amber-800'
                        : 'text-[#00288e]'
                    }`}
                  >
                    {card.code}
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 tabular-nums ${
                      card.tone === 'high'
                        ? 'bg-[#ffdad6] text-[#93000a]'
                        : card.tone === 'medium'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-[#85f8c4] text-[#002114]'
                    }`}
                  >
                    {card.tone === 'high' ? (
                      <XCircle className="w-3 h-3" />
                    ) : card.tone === 'medium' ? (
                      <AlertTriangle className="w-3 h-3" />
                    ) : (
                      <CheckCircle2 className="w-3 h-3" />
                    )}
                    <span>{card.badgeText}</span>
                  </span>
                </div>

                <div className="text-sm font-bold text-[#0b1c30] group-hover:text-[#00288e] transition-colors">
                  {card.title}
                </div>
                <div
                  className={`text-xs font-mono mt-0.5 truncate tabular-nums ${
                    card.tone === 'high' ? 'text-[#ba1a1a]' : 'text-[#565e74]'
                  }`}
                >
                  {card.domain}
                </div>

                <div className="mt-4 space-y-1.5 bg-[#eff4ff] rounded-lg p-2.5 text-[11px] text-[#444653]">
                  <div className="flex items-center gap-1.5">
                    <Lock
                      className={`w-3.5 h-3.5 shrink-0 ${
                        card.tone === 'high'
                          ? 'text-[#ba1a1a]'
                          : card.tone === 'medium'
                          ? 'text-amber-600'
                          : 'text-[#00563a]'
                      }`}
                    />
                    <span className="truncate">{card.bullet1}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Shield
                      className={`w-3.5 h-3.5 shrink-0 ${
                        card.tone === 'high'
                          ? 'text-[#ba1a1a]'
                          : card.tone === 'medium'
                          ? 'text-amber-600'
                          : 'text-[#00563a]'
                      }`}
                    />
                    <span className="truncate">{card.bullet2}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* DUAL-PANE SANDBOX VIEW */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-10">
        {/* LEFT PANE: SIMULATED BROWSER TAB VIEWPORT (7 COLS) */}
        <div className="lg:col-span-7 flex flex-col rounded-xl overflow-hidden border border-[#dce9ff] shadow-sm bg-white relative">
          {/* Simulated Browser Chrome Toolbar */}
          <div className="bg-[#e5eeff] px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 shrink-0" aria-hidden="true">
              <div className="w-3 h-3 rounded-full bg-[#ffdad6] border border-[#ba1a1a]/20" />
              <div className="w-3 h-3 rounded-full bg-amber-200 border border-amber-500/20" />
              <div className="w-3 h-3 rounded-full bg-[#85f8c4] border border-[#00563a]/20" />
            </div>

            {/* Simulated Address Bar */}
            <div className="flex-1 bg-white rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-2xs min-w-0">
              {isHigh ? (
                <ShieldAlert className="w-4 h-4 text-[#ba1a1a] shrink-0" />
              ) : isMedium ? (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              ) : (
                <Lock className="w-4 h-4 text-[#00563a] shrink-0" />
              )}
              <span className="text-xs font-mono text-[#0b1c30] truncate tabular-nums">
                {scenario.fullUrl}
              </span>
              <span
                className={`ml-auto px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase whitespace-nowrap shrink-0 ${
                  isHigh
                    ? 'bg-[#ffdad6] text-[#93000a]'
                    : isMedium
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-[#85f8c4] text-[#002114]'
                }`}
              >
                {scenario.protocolLabel}
              </span>
            </div>

            {/* Browser Extension Action Button (Toggles Embedded Popup!) */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowInlinePopup((prev) => !prev)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  showInlinePopup
                    ? 'bg-[#00288e] text-white shadow-xs'
                    : 'bg-white text-[#00288e] hover:bg-[#eff4ff] border border-[#b8c4ff]'
                }`}
                title="Toggle Chrome Extension Popup Overlay"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{showInlinePopup ? 'Hide Popup' : 'Extension Popup'}</span>
              </button>
              <button
                type="button"
                onClick={handleResetBaseline}
                className="p-1.5 rounded-lg text-[#444653] hover:text-[#0b1c30] hover:bg-white/60 transition-colors cursor-pointer"
                title="Reload simulated tab"
                aria-label="Reload simulated tab"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <MoreVertical className="w-4 h-4 text-[#757684]" />
            </div>
          </div>

          {/* Floating Chrome Extension Popup Overlay inside Simulated Browser */}
          {showInlinePopup && (
            <div className="p-4 bg-[#f8f9ff]/95 border-b border-[#dce9ff] flex flex-col items-center">
              <div className="w-full max-w-[396px] flex items-center justify-between mb-2 text-xs text-[#444653]">
                <span className="font-semibold text-[#00288e]">
                  Live Extension Popup Overlay (DEMO DATA)
                </span>
                <button
                  type="button"
                  onClick={() => setShowInlinePopup(false)}
                  className="text-[#00288e] font-semibold hover:underline cursor-pointer"
                >
                  Close Overlay
                </button>
              </div>
              <ExtensionPopupCard
                scenario={scenario}
                effectiveScore={displayedScore}
                popupState={popupState}
                setPopupState={setPopupState}
                settings={settings}
                onUpdateSettings={onUpdateSettings}
                isWhitelisted={isWhitelisted}
                onWhitelistDomain={onWhitelistDomain}
                onNavigateTab={onNavigateTab}
                onBackToSafety={onBackToSafety}
                onTriggerToast={onTriggerToast}
                compactMode
              />
            </div>
          )}

          {/* Simulated Webpage Content Surface */}
          <div className="p-6 md:p-8 bg-[#f8f9ff] min-h-[500px] flex flex-col justify-between">
            {/* Inline Overlay Alert Banner generated by AuthGuard */}
            <div
              className={`mb-6 p-4 rounded-xl bg-white border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all w-full min-w-0 box-border ${
                isHigh || scriptInjected || typosquatSimulated
                  ? 'border-[#ba1a1a]/40 bg-[#fff5f5]/60'
                  : isMedium
                  ? 'border-amber-300'
                  : 'border-[#dce9ff]'
              }`}
            >
              <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    isHigh || scriptInjected || typosquatSimulated
                      ? 'bg-[#ffdad6] text-[#93000a]'
                      : isMedium
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-[#85f8c4] text-[#002114]'
                  }`}
                >
                  {isHigh || scriptInjected || typosquatSimulated ? (
                    <ShieldAlert className="w-5 h-5 shrink-0" />
                  ) : isMedium ? (
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                  ) : (
                    <ShieldCheck className="w-5 h-5 shrink-0" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <span className="text-sm font-bold text-[#0b1c30] break-words">
                      {scriptInjected
                        ? 'AuthGuard Alert: Script Injection Flagged'
                        : typosquatSimulated
                        ? 'AuthGuard Alert: Lookalike Domain Flagged'
                        : scenario.simulator.overlayTitle}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tabular-nums shrink-0 ${
                        isHigh || scriptInjected || typosquatSimulated
                          ? 'bg-[#ba1a1a] text-white'
                          : isMedium
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-[#00563a] text-white'
                      }`}
                    >
                      SCORE {displayedScore}
                    </span>
                  </div>
                  <p className="text-xs text-[#444653] mt-0.5 break-words">
                    {scenario.simulator.overlayDesc}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  isHigh ? onBackToSafety() : onNavigateTab('report')
                }
                className={`w-full sm:w-auto px-3.5 py-2.5 rounded-lg text-xs font-semibold shadow-2xs shrink-0 self-start sm:self-center cursor-pointer text-center break-words min-w-0 leading-snug box-border ${
                  isHigh
                    ? 'bg-[#ba1a1a] hover:bg-[#93000a] text-white'
                    : isMedium
                    ? 'bg-[#565e74] hover:bg-[#444653] text-white'
                    : 'bg-[#00288e] hover:bg-[#1e40af] text-white'
                }`}
              >
                {scenario.simulator.overlayActionText}
              </button>
            </div>

            {/* Webpage Mock Authentication / Payment Card */}
            <div className="flex-1 flex flex-col items-center justify-center my-2 w-full min-w-0">
              <div className="w-full max-w-md bg-white rounded-xl border border-[#e5eeff] p-4 sm:p-6 shadow-xs relative overflow-hidden min-w-0 box-border">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-7 h-7 rounded flex items-center justify-center text-white text-sm font-bold shrink-0 ${
                        isHigh
                          ? 'bg-[#ba1a1a]'
                          : isMedium
                          ? 'bg-[#565e74]'
                          : 'bg-[#00288e]'
                      }`}
                    >
                      {scenario.simulator.mockBrandInitial}
                    </div>
                    <span className="text-sm font-semibold text-[#0b1c30] truncate">
                      {scenario.simulator.mockHeader}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#565e74] font-mono tabular-nums shrink-0">
                    {scenario.simulator.mockInvoiceOrRef}
                  </span>
                </div>

                <div className="space-y-4 mb-5 w-full min-w-0">
                  <div className="w-full min-w-0">
                    <label className="block text-[11px] font-semibold text-[#444653] mb-1">
                      {scenario.simulator.mockField1Label}
                    </label>
                    <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1.5 bg-[#eff4ff] p-2 rounded-lg w-full min-w-0 box-border">
                      <span className="text-xs text-[#0b1c30] font-mono truncate min-w-0 flex-1">
                        {scenario.simulator.mockField1Value}
                      </span>
                      <span
                        className={`self-start xs:self-auto flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 ${
                          isHigh
                            ? 'bg-[#ffdad6] text-[#93000a]'
                            : isMedium
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-[#e5eeff] text-[#00563a]'
                        }`}
                      >
                        <Shield className="w-3 h-3 shrink-0" />
                        <span>{scenario.simulator.mockField1Badge}</span>
                      </span>
                    </div>
                  </div>

                  <div className="w-full min-w-0">
                    <label className="block text-[11px] font-semibold text-[#444653] mb-1">
                      {scenario.simulator.mockField2Label}
                    </label>
                    <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1.5 bg-[#eff4ff] p-2 rounded-lg w-full min-w-0 box-border">
                      <span className="text-[11px] font-mono text-[#565e74] truncate min-w-0 flex-1">
                        [SIMULATED MASKED INPUT — NO REAL CREDENTIALS]
                      </span>
                      <span
                        className={`self-start xs:self-auto flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 ${
                          scriptInjected || isHigh
                            ? 'bg-[#ffdad6] text-[#93000a]'
                            : isMedium
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-[#e5eeff] text-[#00563a]'
                        }`}
                      >
                        {scriptInjected ? (
                          <>
                            <Bug className="w-3 h-3 shrink-0" />
                            <span>Hook Flagged</span>
                          </>
                        ) : (
                          <>
                            <Code2 className="w-3 h-3 shrink-0" />
                            <span>{scenario.simulator.mockField2Badge}</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSimulatedFormAction}
                  className={`w-full py-2.5 rounded-lg text-xs font-semibold shadow-2xs flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                    isHigh
                      ? 'bg-[#ba1a1a] hover:bg-[#93000a] text-white'
                      : isMedium
                      ? 'bg-[#565e74] hover:bg-[#444653] text-white'
                      : 'bg-[#00288e] hover:bg-[#1e40af] text-white'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{scenario.simulator.mockSubmitText}</span>
                </button>

                <div className="text-center text-[10px] text-[#565e74] mt-3">
                  DEMO DATA · Passwords and OTPs are never accepted, logged, or
                  transmitted
                </div>
              </div>
            </div>

            {/* Viewport Footer Metadata */}
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[#565e74] bg-white border border-[#e5eeff] px-4 py-2 rounded-lg tabular-nums">
              <span>Viewport: Emulated Authentication Sandbox (DEMO DATA)</span>
              <button
                type="button"
                onClick={() => onNavigateTab('report')}
                className="text-[#00288e] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Open Full Forensic Report</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANE: LIVE TELEMETRY INSPECTION PANEL (5 COLS) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          {/* Risk Score Matrix Card */}
          <div className="p-6 rounded-xl bg-white border border-[#e5eeff] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[10px] font-semibold text-[#565e74] uppercase tracking-wider">
                  Algorithmic Risk Decomposition
                </div>
                <div className="text-sm font-bold text-[#0b1c30]">
                  Calculated Trust Matrix (DEMO DATA)
                </div>
              </div>
              <div
                className={`px-3 py-1 rounded-lg text-base font-bold tabular-nums ${
                  isHigh || scriptInjected || typosquatSimulated
                    ? 'bg-[#ffdad6] text-[#93000a]'
                    : isMedium
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-[#85f8c4] text-[#002114]'
                }`}
              >
                {displayedScore}/100
              </div>
            </div>

            {/* Breakdown Bars */}
            <div className="space-y-3.5 text-xs tabular-nums">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[#0b1c30] font-medium">
                    Domain Age & Origin Rep (30% weight)
                  </span>
                  <span className="font-bold text-[#0b1c30]">
                    {weights.origin}%{' '}
                    {typosquatSimulated ? 'Degraded' : 'Passed'}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#e5eeff] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      typosquatSimulated ? 'bg-[#ba1a1a]' : barColorClass
                    }`}
                    style={{ width: `${weights.origin}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[#0b1c30] font-medium">
                    SSL/TLS Chain & SAN Cert (25% weight)
                  </span>
                  <span className="font-bold text-[#0b1c30]">
                    {weights.ssl}% Passed
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#e5eeff] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColorClass}`}
                    style={{ width: `${weights.ssl}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[#0b1c30] font-medium">
                    DOM Tree & Form Hygiene (25% weight)
                  </span>
                  <span className="font-bold text-[#0b1c30]">
                    {weights.dom}% {scriptInjected ? 'Flagged' : 'Passed'}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#e5eeff] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      scriptInjected ? 'bg-[#ba1a1a]' : barColorClass
                    }`}
                    style={{ width: `${weights.dom}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[#0b1c30] font-medium">
                    Script Execution & Listeners (20% weight)
                  </span>
                  <span className="font-bold text-[#0b1c30]">
                    {weights.script}% {scriptInjected ? 'Injected' : 'Passed'}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#e5eeff] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      scriptInjected ? 'bg-[#ba1a1a]' : barColorClass
                    }`}
                    style={{ width: `${weights.script}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Telemetry Event Feed & Anomaly Triggers */}
          <div className="p-6 rounded-xl bg-white border border-[#e5eeff] shadow-sm flex-1">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#00288e]" />
                <span className="text-sm font-bold text-[#0b1c30]">
                  Telemetry Event Feed
                </span>
              </div>
              <span className="text-[10px] font-mono font-semibold text-[#565e74]">
                SIMULATED STREAM
              </span>
            </div>

            <div className="h-48 overflow-y-auto space-y-2 p-3 bg-[#eff4ff] rounded-lg font-mono text-xs tabular-nums">
              {logs.map((log, idx) => {
                const textColor =
                  log.tone === 'safe'
                    ? 'text-[#00563a]'
                    : log.tone === 'caution'
                    ? 'text-amber-800 font-semibold'
                    : log.tone === 'danger'
                    ? 'text-[#ba1a1a] font-semibold'
                    : log.tone === 'primary'
                    ? 'text-[#00288e] font-bold'
                    : 'text-[#0b1c30]';

                return (
                  <div key={`${log.time}-${idx}`} className="flex items-start gap-2">
                    <span className="text-[#565e74] shrink-0">{log.time}</span>
                    <span className={textColor}>{log.text}</span>
                  </div>
                );
              })}
            </div>

            {/* Interactive Injection Triggers */}
            <div className="mt-4 pt-4 border-t border-[#eff4ff]">
              <div className="text-[10px] font-semibold text-[#565e74] uppercase tracking-wider mb-2.5">
                Simulate Real-Time Anomaly Triggers
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleTriggerScriptInjection}
                  className="px-3 py-2 rounded-lg bg-[#e5eeff] hover:bg-[#dce9ff] text-[#0b1c30] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Bug className="w-4 h-4 text-[#ba1a1a]" />
                  <span>Trigger Script Injection</span>
                </button>
                <button
                  type="button"
                  onClick={handleSimulateTyposquat}
                  className="px-3 py-2 rounded-lg bg-[#e5eeff] hover:bg-[#dce9ff] text-[#0b1c30] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <SpellCheck className="w-4 h-4 text-[#565e74]" />
                  <span>Simulate Typosquat</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleResetBaseline}
                className="mt-2 w-full py-2 rounded-lg bg-[#eff4ff] hover:bg-[#e5eeff] text-[#565e74] hover:text-[#0b1c30] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Baseline Telemetry</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Methodological Integrity & Privacy Guarantees Section */}
      <section className="p-6 md:p-8 rounded-xl bg-white border border-[#e5eeff] shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="text-[10px] text-[#00288e] uppercase tracking-wider font-bold">
              Methodological Integrity
            </div>
            <h2 className="text-base font-bold text-[#0b1c30] mt-0.5">
              Prototype Evaluation Parameters & Privacy Guarantees
            </h2>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded bg-[#e5eeff] text-[#0b1c30] text-xs font-semibold">
              Manifest V3 Architecture
            </span>
            <span className="px-2.5 py-1 rounded bg-[#dae2fd] text-[#3f465c] text-xs font-semibold">
              Zero-PII Storage
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 rounded-xl bg-[#eff4ff]">
            <div className="w-8 h-8 rounded-lg bg-[#00288e] text-white flex items-center justify-center mb-3">
              <Cpu className="w-4 h-4" />
            </div>
            <div className="text-sm font-semibold text-[#0b1c30] mb-1">
              Local Sandbox Design
            </div>
            <p className="text-xs text-[#444653] leading-relaxed">
              All lexical DOM and string-similarity demonstrations run locally
              in the browser preview. AuthGuard never collects, displays,
              logs, or transmits passwords, OTPs, or form values.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#eff4ff]">
            <div className="w-8 h-8 rounded-lg bg-[#00288e] text-white flex items-center justify-center mb-3">
              <ListChecks className="w-4 h-4" />
            </div>
            <div className="text-sm font-semibold text-[#0b1c30] mb-1">
              Transparent Simulation Weights
            </div>
            <p className="text-xs text-[#444653] leading-relaxed">
              Simulated risk scores demonstrate how certificate validity, WHOIS
              antiquity, form action targets, and homoglyph distance combine
              into a clear 0–100 trust index.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#eff4ff]">
            <div className="w-8 h-8 rounded-lg bg-[#00288e] text-white flex items-center justify-center mb-3">
              <EyeOff className="w-4 h-4" />
            </div>
            <div className="text-sm font-semibold text-[#0b1c30] mb-1">
              Ephemeral Session State
            </div>
            <p className="text-xs text-[#444653] leading-relaxed">
              Simulated history and whitelist overrides stay strictly in your
              local browser storage and can be wiped at any time from Scan
              History or Settings.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
