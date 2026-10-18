import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  Globe,
  Info,
  Lock,
  RotateCcw,
  Server,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import {
  ActiveNavTab,
  ScenarioId,
  SecurityScenario,
} from '../types/security';

interface SecurityReportViewProps {
  scenario?: SecurityScenario | null;
  hasActualScan?: boolean;
  effectiveScore: number;
  isWhitelisted?: boolean;
  onToggleWhitelist?: (domain: string, scope: string) => void;
  onSelectScenario?: (id: ScenarioId) => void;
  onNavigateTab: (tab: ActiveNavTab) => void;
  onTriggerToast: (message: string) => void;
}

export const SecurityReportView: React.FC<SecurityReportViewProps> = ({
  scenario,
  hasActualScan = true,
  onNavigateTab,
  onTriggerToast,
}) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  if (!scenario || !hasActualScan) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 box-border overflow-hidden">
        <div className="flex items-center justify-between gap-3 min-w-0">
          <button
            type="button"
            onClick={() => onNavigateTab('dashboard')}
            className="text-xs font-semibold text-[#00288e] hover:text-[#1e40af] flex items-center gap-1.5 cursor-pointer py-1"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>Go to Dashboard</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-[#e5eeff] p-8 sm:p-12 text-center shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#eff4ff] text-[#00288e] flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-[#0b1c30]">
            Your security report will appear here after a scan.
          </h2>
          <p className="text-xs sm:text-sm text-[#565e74] max-w-md mx-auto">
            Run an on-demand security check on the Dashboard to inspect website encryption, origin safety, and authentication risks.
          </p>
          <button
            type="button"
            onClick={() => onNavigateTab('dashboard')}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00288e] hover:bg-[#1e40af] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <span>Go to Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  const isLow = scenario.riskLevel === 'LOW';
  const isMedium = scenario.riskLevel === 'MEDIUM';
  const isHigh = scenario.riskLevel === 'HIGH';

  const handleExportJson = () => {
    const reportPayload = {
      domain: scenario.domain,
      fullUrl: scenario.fullUrl,
      riskLevel: scenario.riskLevel,
      score: scenario.baseScore,
      protocol: scenario.protocolLabel,
      isHttps: scenario.isHttps,
      ipAddress: scenario.ipAddress,
      scanTimestamp: scenario.scanTimestamp,
      headline: scenario.headline,
      explanation: scenario.explanation,
      sslCertificate: {
        issuingAuthority: scenario.sslSection.issuingAuthority,
        validityWindow: scenario.sslSection.validityWindow,
        cipherSuite: scenario.sslSection.cipherSuite,
      },
      recommendedActions: scenario.recommendedActions,
    };

    const blob = new Blob([JSON.stringify(reportPayload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `authguard-report-${scenario.domain.replace(/[^a-z0-9.-]/gi, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onTriggerToast(`Exported report for ${scenario.domain}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 box-border overflow-hidden">
      {/* Navigation Breadcrumb / Back Action */}
      <div className="flex items-center justify-between gap-3 min-w-0">
        <button
          type="button"
          onClick={() => onNavigateTab('history')}
          className="text-xs font-semibold text-[#00288e] hover:text-[#1e40af] flex items-center gap-1.5 cursor-pointer py-1"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span>Back to Scan History</span>
        </button>

        <button
          type="button"
          onClick={handleExportJson}
          className="px-3 py-1.5 rounded-lg border border-[#dce9ff] bg-white hover:bg-[#f8faff] text-xs font-medium text-[#0b1c30] flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <Download className="w-3.5 h-3.5 text-[#565e74]" />
          <span>Export JSON</span>
        </button>
      </div>

      {/* Main Security Status Card */}
      <section
        className={`w-full rounded-2xl border p-5 sm:p-6 md:p-8 space-y-6 shadow-xs box-border min-w-0 ${
          isHigh
            ? 'bg-[#fef2f2]/60 border-[#fecaca]'
            : isMedium
            ? 'bg-[#fffbeb]/60 border-[#fde68a]'
            : 'bg-[#f0fdf4]/60 border-[#bbf7d0]'
        }`}
      >
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 min-w-0 border-b border-black/5 pb-5">
          <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
            <div
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                isHigh
                  ? 'bg-[#fee2e2] text-[#991b1b]'
                  : isMedium
                  ? 'bg-[#fef3c7] text-[#92400e]'
                  : 'bg-[#dcfce7] text-[#166534]'
              }`}
            >
              {isHigh ? (
                <ShieldAlert className="w-7 h-7 sm:w-8 sm:h-8" />
              ) : isMedium ? (
                <AlertTriangle className="w-7 h-7 sm:w-8 sm:h-8" />
              ) : (
                <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide shrink-0 ${
                    isHigh
                      ? 'bg-[#fee2e2] text-[#991b1b]'
                      : isMedium
                      ? 'bg-[#fef3c7] text-[#92400e]'
                      : 'bg-[#dcfce7] text-[#166534]'
                  }`}
                >
                  {isHigh ? 'High Risk' : isMedium ? 'Suspicious' : 'Low Risk'}
                </span>
                <span className="text-xs text-[#565e74]">
                  {scenario.scanTimestamp}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-[#0b1c30] mt-1 break-words">
                {isLow
                  ? "You're all set."
                  : isMedium
                  ? 'We noticed something unusual.'
                  : 'Review this website before continuing.'}
              </h1>

              <div className="text-xs sm:text-sm font-mono text-[#444653] mt-1 break-all">
                {scenario.domain}
              </div>
            </div>
          </div>
        </div>

        {/* Human-Friendly Summary & Recommendation */}
        <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-[#0b1c30]">
          <div className="bg-white/80 p-4 rounded-xl border border-black/5 space-y-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#565e74]">
              What we observed
            </h2>
            <p className="text-sm text-[#0b1c30]">
              {scenario.explanation}
            </p>
          </div>

          <div
            className={`p-4 rounded-xl border space-y-1 ${
              isHigh
                ? 'bg-white border-[#fecaca] text-[#991b1b]'
                : isMedium
                ? 'bg-white border-[#fde68a] text-[#92400e]'
                : 'bg-white border-[#bbf7d0] text-[#166534]'
            }`}
          >
            <h2 className="text-xs font-bold uppercase tracking-wider">
              Recommended action
            </h2>
            <p className="text-sm text-[#0b1c30]">
              {isHigh
                ? 'Do not enter passwords, credit card numbers, or personal details on this website.'
                : isMedium
                ? 'Double-check the web address before submitting credentials or downloading files.'
                : 'Safe to proceed with normal browsing and authentication.'}
            </p>
          </div>
        </div>

        {/* Reasons & Checklist */}
        <div className="space-y-3 pt-2">
          <h2 className="text-xs font-bold text-[#565e74] uppercase tracking-wider">
            Safety Checks
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {scenario.microIndicators.map((indicator) => (
              <div
                key={indicator.label}
                className="bg-white p-3 rounded-xl border border-black/5 flex items-center justify-between gap-2 text-xs"
              >
                <span className="text-[#565e74] font-medium">{indicator.label}</span>
                <span
                  className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                    indicator.status === 'safe'
                      ? 'bg-[#f0fdf4] text-[#166534]'
                      : indicator.status === 'caution'
                      ? 'bg-[#fffbeb] text-[#92400e]'
                      : 'bg-[#fef2f2] text-[#991b1b]'
                  }`}
                >
                  {indicator.value}
                </span>
              </div>
            ))}

            <div className="bg-white p-3 rounded-xl border border-black/5 flex items-center justify-between gap-2 text-xs">
              <span className="text-[#565e74] font-medium">Connection Security</span>
              <span
                className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                  scenario.isHttps
                    ? 'bg-[#f0fdf4] text-[#166534]'
                    : 'bg-[#fef2f2] text-[#991b1b]'
                }`}
              >
                {scenario.isHttps ? 'Encrypted (HTTPS)' : 'Unencrypted (HTTP)'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Expandable Technical Details (Keeps main interface simple) */}
      <section className="bg-white rounded-2xl border border-[#e5eeff] overflow-hidden">
        <button
          type="button"
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="w-full p-4 flex items-center justify-between text-xs font-semibold text-[#0b1c30] hover:bg-[#f8faff] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-[#565e74]" />
            <span>Technical Details</span>
          </div>
          <div className="flex items-center gap-1 text-[#00288e]">
            <span>{showTechnicalDetails ? 'Hide' : 'Show'}</span>
            {showTechnicalDetails ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </button>

        {showTechnicalDetails && (
          <div className="p-4 sm:p-5 border-t border-[#e5eeff] space-y-3 bg-[#f8faff]/50 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="bg-white p-3 rounded-xl border border-[#e5eeff]">
                <div className="text-[10px] text-[#757684] uppercase font-semibold">
                  IP Address
                </div>
                <div className="font-mono text-sm text-[#0b1c30] mt-0.5 truncate">
                  {scenario.ipAddress}
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-[#e5eeff]">
                <div className="text-[10px] text-[#757684] uppercase font-semibold">
                  Protocol
                </div>
                <div className="font-mono text-sm text-[#0b1c30] mt-0.5">
                  {scenario.protocolLabel}
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-[#e5eeff]">
                <div className="text-[10px] text-[#757684] uppercase font-semibold">
                  Certificate Issuer
                </div>
                <div className="text-xs font-medium text-[#0b1c30] mt-0.5 truncate">
                  {scenario.sslSection.issuingAuthority}
                </div>
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-[#e5eeff] space-y-1">
              <div className="text-[10px] text-[#757684] uppercase font-semibold">
                Full URL Inspected
              </div>
              <div className="font-mono text-xs text-[#0b1c30] break-all">
                {scenario.fullUrl}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => onNavigateTab('dashboard')}
          className="text-xs text-[#00288e] hover:underline flex items-center gap-1 cursor-pointer font-medium"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Scan another website</span>
        </button>
      </div>
    </div>
  );
};
