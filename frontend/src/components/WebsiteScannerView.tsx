import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  ExternalLink,
  FileBarChart2,
  Globe,
  Info,
  Lock,
  Radar,
  RefreshCw,
  RotateCcw,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  X,
  XCircle,
} from 'lucide-react';
import {
  ActiveNavTab,
  ExtensionSettings,
  FindingSeverity,
  RiskLevel,
  ScanHistoryRecord,
  ScenarioId,
  SecurityScanResult,
  WhitelistEntry,
} from '../types/security';
import {
  executeSecurityScan,
  validateAndNormalizeUrl,
} from '../services/securityScanner';

interface WebsiteScannerViewProps {
  initialUrl?: string;
  settings?: ExtensionSettings;
  whitelist?: WhitelistEntry[];
  onScanComplete: (newRecord: ScanHistoryRecord, scenarioId: ScenarioId) => void;
  onNavigateTab: (tab: ActiveNavTab) => void;
  onInspectDomainReport: (scenarioId: ScenarioId) => void;
  onInspectDomainPopup: (scenarioId: ScenarioId) => void;
  onTriggerToast: (message: string) => void;
}

export const WebsiteScannerView: React.FC<WebsiteScannerViewProps> = ({
  initialUrl = '',
  settings,
  whitelist,
  onScanComplete,
  onNavigateTab,
  onInspectDomainReport,
  onInspectDomainPopup,
  onTriggerToast,
}) => {
  const [urlInput, setUrlInput] = useState(initialUrl);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [scanResult, setScanResult] = useState<SecurityScanResult | null>(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  // If initialUrl is passed or changed, pre-fill and auto-validate
  useEffect(() => {
    if (initialUrl) {
      setUrlInput(initialUrl);
      setValidationError(null);
    }
  }, [initialUrl]);

  const scanSteps = [
    { label: 'Resolving Hostname & URL Syntax', desc: 'Validating RFC syntax, protocol scheme, and domain structure' },
    { label: 'Evaluating Transport Security (TLS/HTTPS)', desc: 'Checking certificate authority and transport encryption' },
    { label: 'Analyzing Domain Age & Lookalike Heuristics', desc: 'Computing Levenshtein distance against high-value brands' },
    { label: 'Checking Login Form & Injection Protections', desc: 'Inspecting credential field isolation and third-party script targets' },
    { label: 'Synthesizing Risk Score & Remediation', desc: 'Compiling structured findings and actionable security advice' },
  ];

  const handleStartScan = async (rawUrl: string) => {
    const trimmed = rawUrl.trim();
    if (!trimmed) {
      setValidationError('Please enter a website address (for example: stripe-demo.com or yourbank.com)');
      return;
    }

    // Client-side URL validation
    const validation = validateAndNormalizeUrl(trimmed);
    if (!validation.isValid) {
      setValidationError(validation.error || 'Please enter a valid website address');
      return;
    }

    setValidationError(null);
    setIsScanning(true);
    setScanStep(0);
    setScanResult(null);

    // Multi-step progress progression
    let currentStep = 0;
    const interval = setInterval(async () => {
      currentStep += 1;
      setScanStep(currentStep);

      if (currentStep >= 5) {
        clearInterval(interval);
        try {
          const result = await executeSecurityScan(trimmed, settings, whitelist);
          setScanResult(result);
          setIsScanning(false);

          // Create history record
          const newRecord: ScanHistoryRecord = {
            id: `scan-${Date.now()}`,
            scenarioId: result.matchedScenarioId,
            domain: result.domain,
            fullUrl: result.fullUrl,
            score: result.score,
            riskLevel: result.riskLevel,
            verdictTag:
              result.riskLevel === 'HIGH'
                ? 'MALICIOUS'
                : result.riskLevel === 'MEDIUM'
                ? 'SUSPICIOUS'
                : 'VERIFIED',
            vectors:
              result.findings.length > 0
                ? result.findings.slice(0, 2).map((f) => f.title)
                : ['Clean Origin', 'Padlock Verified'],
            timestamp: 'Just now',
            timeCategory: '24H',
            protocol: result.protocol,
            isHttps: result.isHttps,
            sha256Digest: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855...',
            resolver: 'Cloudflare DNS-over-HTTPS (1.1.1.1)',
          };

          onScanComplete(newRecord, result.matchedScenarioId);
          onTriggerToast(`Scan completed for ${result.domain} (${result.riskLevel} Risk)`);
        } catch (err) {
          setIsScanning(false);
          setValidationError(err instanceof Error ? err.message : 'Scan failed unexpectedly');
        }
      }
    }, 420);
  };

  const handleExportResultJson = () => {
    if (!scanResult) return;
    const blob = new Blob([JSON.stringify(scanResult, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `authguard-scan-${scanResult.domain.replace(/[^a-z0-9.-]/gi, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onTriggerToast(`Exported scan findings for ${scanResult.domain}`);
  };

  const sampleButtons: Array<{ label: string; url: string; tone: 'safe' | 'caution' | 'danger' }> = [
    { label: 'Stripe Checkout (Safe)', url: 'checkout.stripe-demo.com', tone: 'safe' },
    { label: 'Invoice Gateway (Caution)', url: 'pay-invoice-portal.net', tone: 'caution' },
    { label: 'Apple ID Phish (Danger)', url: 'secure-apple-id-verify.login-sync.cc', tone: 'danger' },
    { label: 'GitHub Security (Safe)', url: 'github.com', tone: 'safe' },
  ];

  const getSeverityBadgeClass = (sev: FindingSeverity) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-[#ffdad6] text-[#ba1a1a] border border-[#ba1a1a]/30';
      case 'HIGH':
        return 'bg-[#ffdad6] text-[#93000a] border border-[#ffdad6]';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-800 border border-amber-300';
      case 'LOW':
        return 'bg-[#eff4ff] text-[#00288e] border border-[#dce9ff]';
      case 'INFO':
      default:
        return 'bg-[#f1f3f9] text-[#444653] border border-[#e5eeff]';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#dae2fd] text-[#131b2e] text-xs font-semibold">
          <Radar className="w-3.5 h-3.5 text-[#00288e]" />
          <span>Interactive Website Scanner</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0b1c30] tracking-tight">
          Scan Any Website in Seconds
        </h1>
        <p className="text-sm text-[#444653] max-w-2xl leading-relaxed">
          Enter any web address to test its safety. We check encryption, scan login forms for hidden keyloggers, and warn you if it&apos;s a fake lookalike website before you type your credentials.
        </p>
      </div>

      {/* URL Input Form */}
      <div className="bg-white rounded-2xl border border-[#dce9ff] p-6 shadow-xs space-y-4">
        <label htmlFor="scanner-url-input" className="block text-xs font-bold text-[#444653] uppercase tracking-wider">
          Website Address to Inspect
        </label>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <Globe className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#757684]" />
            <input
              id="scanner-url-input"
              type="text"
              value={urlInput}
              disabled={isScanning}
              onChange={(e) => {
                setUrlInput(e.target.value);
                if (validationError) setValidationError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleStartScan(urlInput);
                }
              }}
              placeholder="e.g. checkout.stripe-demo.com, pay-invoice-portal.net, or yourbank.com"
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#eff4ff] text-sm text-[#0b1c30] placeholder:text-[#757684] focus:outline-none focus:ring-2 focus:ring-[#1e40af] disabled:opacity-50"
            />
          </div>

          <button
            type="button"
            disabled={isScanning}
            onClick={() => handleStartScan(urlInput)}
            className="px-6 py-3 rounded-xl bg-[#00288e] hover:bg-[#1e40af] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50 cursor-pointer whitespace-nowrap active:scale-[0.99]"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Scanning...</span>
              </>
            ) : (
              <>
                <Radar className="w-4 h-4" />
                <span>Start Security Scan</span>
              </>
            )}
          </button>
        </div>

        {validationError && (
          <div className="flex items-center gap-2 text-xs font-medium text-[#ba1a1a] bg-[#ffdad6]/60 px-3.5 py-2.5 rounded-xl border border-[#ba1a1a]/20">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Quick Sample Links */}
        <div className="flex items-center gap-2 flex-wrap pt-1 text-xs text-[#565e74]">
          <span className="font-semibold">One-click sample links:</span>
          {sampleButtons.map((sample) => (
            <button
              key={sample.url}
              type="button"
              disabled={isScanning}
              onClick={() => {
                setUrlInput(sample.url);
                setValidationError(null);
                handleStartScan(sample.url);
              }}
              className={`px-2.5 py-1 rounded-md border font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 ${
                sample.tone === 'safe'
                  ? 'bg-[#ecfdf5] border-[#a7f3d0] text-[#00563a] hover:bg-[#d1fae5]'
                  : sample.tone === 'caution'
                  ? 'bg-[#fffbeb] border-[#fde68a] text-amber-800 hover:bg-[#fef3c7]'
                  : 'bg-[#fef2f2] border-[#fecaca] text-[#ba1a1a] hover:bg-[#fee2e2]'
              }`}
            >
              <span>{sample.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ACTIVE SCAN PROGRESS DISPLAY */}
      {isScanning && (
        <div className="bg-white rounded-2xl border border-[#b8c4ff] p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#e5eeff] text-[#00288e] flex items-center justify-center">
                <Radar className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#0b1c30]">
                  Scanning {urlInput || 'Website'}...
                </h2>
                <p className="text-xs text-[#444653]">
                  Executing client-side heuristic inspection and simulated prober verification
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-[#00288e] bg-[#eff4ff] px-2.5 py-1 rounded-lg">
              Step {scanStep + 1} of 5
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-[#eff4ff] h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-[#1e40af] h-full transition-all duration-300"
              style={{ width: `${Math.min(100, (scanStep + 1) * 20)}%` }}
            />
          </div>

          {/* Steps list */}
          <div className="space-y-2.5 pt-1">
            {scanSteps.map((step, idx) => {
              const isPast = idx < scanStep;
              const isCurrent = idx === scanStep;

              return (
                <div
                  key={step.label}
                  className={`flex items-start gap-3 p-3 rounded-xl text-xs transition-colors ${
                    isCurrent
                      ? 'bg-[#eff4ff] border border-[#1e40af]/30 font-semibold text-[#0b1c30]'
                      : isPast
                      ? 'bg-[#f8f9ff] text-[#0b1c30]'
                      : 'text-[#757684] opacity-60'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5 ${
                      isPast
                        ? 'bg-[#85f8c4] text-[#002114]'
                        : isCurrent
                        ? 'bg-[#00288e] text-white animate-spin'
                        : 'bg-[#dce9ff] text-[#757684]'
                    }`}
                  >
                    {isPast ? <Check className="w-3 h-3" /> : idx + 1}
                  </div>
                  <div className="flex-1">
                    <span className="block font-medium">{step.label}</span>
                    <span className="text-[11px] text-[#444653] font-normal">{step.desc}</span>
                  </div>
                  {isCurrent && (
                    <span className="text-[10px] font-bold text-[#00288e] bg-[#dce9ff] px-2 py-0.5 rounded-full uppercase">
                      Checking
                    </span>
                  )}
                  {isPast && (
                    <span className="text-[10px] font-bold text-[#00563a] bg-[#ecfdf5] px-2 py-0.5 rounded-full uppercase">
                      Complete
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* EMPTY STATE: WHEN NO SCAN HAS RUN YET */}
      {!scanResult && !isScanning && (
        <div className="bg-[#f8f9ff] rounded-2xl border border-dashed border-[#c4c5d5] p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#eff4ff] text-[#00288e] flex items-center justify-center mx-auto">
            <Radar className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-[#0b1c30]">No Active Scan in Progress</h3>
            <p className="text-xs text-[#565e74] leading-relaxed">
              Enter any URL above or click one of the sample links to initiate an automated security analysis. We will evaluate lookalike letters, transport encryption, and login page hygiene.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 text-xs text-[#00288e] font-semibold bg-white px-3.5 py-1.5 rounded-full border border-[#dce9ff] shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Zero-install browser analysis engine</span>
          </div>
        </div>
      )}

      {/* COMPLETED SCAN RESULTS CARD */}
      {scanResult && !isScanning && (
        <div
          className={`bg-white rounded-2xl border p-4 sm:p-6 md:p-8 shadow-sm space-y-6 w-full min-w-0 box-border ${
            scanResult.riskLevel === 'HIGH'
              ? 'border-[#fecaca]'
              : scanResult.riskLevel === 'MEDIUM'
              ? 'border-[#fde68a]'
              : 'border-[#a7f3d0]'
          }`}
        >
          {/* Top Banner Status */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#eff4ff] min-w-0">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 min-w-0 flex-1">
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                  scanResult.riskLevel === 'HIGH'
                    ? 'bg-[#fef2f2] text-[#ba1a1a]'
                    : scanResult.riskLevel === 'MEDIUM'
                    ? 'bg-[#fffbeb] text-amber-800'
                    : 'bg-[#ecfdf5] text-[#00563a]'
                }`}
              >
                {scanResult.riskLevel === 'HIGH' ? (
                  <ShieldAlert className="w-7 h-7 sm:w-8 sm:h-8" />
                ) : scanResult.riskLevel === 'MEDIUM' ? (
                  <AlertTriangle className="w-7 h-7 sm:w-8 sm:h-8" />
                ) : (
                  <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-[#0b1c30] font-mono break-all min-w-0">
                    {scanResult.domain}
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase shrink-0 ${
                      scanResult.riskLevel === 'HIGH'
                        ? 'bg-[#fef2f2] text-[#ba1a1a] border border-[#fecaca]'
                        : scanResult.riskLevel === 'MEDIUM'
                        ? 'bg-[#fffbeb] text-amber-800 border border-[#fde68a]'
                        : 'bg-[#ecfdf5] text-[#00563a] border border-[#a7f3d0]'
                    }`}
                  >
                    {scanResult.riskLevel} RISK · {scanResult.score}/100
                  </span>
                </div>
                <p className="text-xs text-[#444653] mt-1 break-words">
                  Evaluated at {scanResult.timestamp} · Client Heuristic Engine Active
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 self-start lg:self-center w-full lg:w-auto flex-wrap min-w-0">
              <button
                type="button"
                onClick={handleExportResultJson}
                className="flex-1 sm:flex-initial bg-[#eff4ff] hover:bg-[#e5eeff] text-[#00288e] px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-w-0 whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5 shrink-0" />
                <span>Export JSON</span>
              </button>
              <button
                type="button"
                onClick={() => onInspectDomainReport(scanResult.matchedScenarioId)}
                className="flex-1 sm:flex-initial bg-[#00288e] hover:bg-[#1e40af] text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs min-w-0 whitespace-nowrap"
              >
                <FileBarChart2 className="w-3.5 h-3.5 shrink-0" />
                <span>Full Security Report</span>
              </button>
            </div>
          </div>

          {/* Execution Mode & Honesty Disclaimer Badge */}
          <div className="bg-[#eff4ff] border border-[#dce9ff] p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-[#444653]">
            <Info className="w-4 h-4 text-[#00288e] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="font-semibold text-[#0b1c30]">
                Scanning Architecture & Telemetry Transparency:
              </div>
              <p className="text-[11px] leading-relaxed">
                {scanResult.auditHonesty.notice}
              </p>
            </div>
          </div>

          {/* Key Findings with Severity & Remediation (TASK 3) */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-[#0b1c30] uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#00288e]" />
              <span>Security Findings & Issues ({scanResult.findings.length})</span>
            </h3>

            {scanResult.findings.length === 0 ? (
              <div className="bg-[#f0fdf4] p-4 rounded-xl border border-[#dcfce7] text-xs text-[#00563a] flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#00563a] shrink-0" />
                <div>
                  <span className="font-bold block">Zero Critical Security Issues Detected</span>
                  <span className="text-[#444653] mt-0.5 block">
                    Domain syntax, protocol encryption, and lookalike letter analysis passed all baseline integrity checks.
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {scanResult.findings.map((f) => (
                  <div
                    key={f.id}
                    className="bg-white rounded-xl border border-[#e5eeff] p-4 shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getSeverityBadgeClass(f.severity)}`}>
                          {f.severity}
                        </span>
                        <span className="text-xs font-semibold text-[#565e74] uppercase">
                          {f.category}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[#0b1c30]">{f.title}</span>
                    </div>

                    <p className="text-xs text-[#444653] leading-relaxed">
                      {f.description}
                    </p>

                    <div className="bg-[#eff4ff] p-2.5 rounded-lg text-xs space-y-1">
                      <div className="font-bold text-[#00288e] flex items-center gap-1">
                        <span>Recommended Remediation:</span>
                      </div>
                      <p className="text-[#444653]">{f.remediation}</p>
                    </div>

                    {f.technicalDetail && (
                      <div className="text-[11px] font-mono text-[#757684] pt-1">
                        Diagnostic: {f.technicalDetail}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Passed Security Checks */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#00563a] uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Verified Checks Passed ({scanResult.safeChecks.length})</span>
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {scanResult.safeChecks.map((chk) => (
                <li key={chk} className="flex items-start gap-2 bg-[#f0fdf4] p-2.5 rounded-lg border border-[#dcfce7]">
                  <Check className="w-3.5 h-3.5 text-[#00563a] shrink-0 mt-0.5" />
                  <span className="text-[#0b1c30]">{chk}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Remediation & Next Steps */}
          <div
            className={`p-4 rounded-xl flex items-start gap-3 border ${
              scanResult.riskLevel === 'HIGH'
                ? 'bg-[#fef2f2] border-[#fecaca]'
                : scanResult.riskLevel === 'MEDIUM'
                ? 'bg-[#fffbeb] border-[#fde68a]'
                : 'bg-[#ecfdf5] border-[#a7f3d0]'
            }`}
          >
            <Info className="w-5 h-5 shrink-0 mt-0.5 text-[#00288e]" />
            <div className="text-xs space-y-1">
              <span className="font-bold text-[#0b1c30] block">Recommended Action</span>
              <p className="text-[#444653] leading-relaxed">{scanResult.recommendedRemediation}</p>
            </div>
          </div>

          {/* Expandable Technical Details Section */}
          <div className="border border-[#e5eeff] rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="w-full p-4 bg-[#eff4ff] hover:bg-[#e5eeff] flex items-center justify-between text-xs font-bold text-[#0b1c30] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-[#00288e]" />
                <span>Technical Details & Server Telemetry</span>
                <span className="px-2 py-0.5 rounded bg-white text-[#565e74] text-[10px] font-mono">
                  IP: {scanResult.technicalDetails.ipAddress}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[#00288e]">
                <span>{showTechnicalDetails ? 'Collapse' : 'Expand'}</span>
                {showTechnicalDetails ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
            </button>

            {showTechnicalDetails && (
              <div className="p-4 bg-white space-y-3 text-xs border-t border-[#e5eeff]">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="bg-[#f8f9ff] p-3 rounded-lg border border-[#e5eeff]">
                    <span className="text-[10px] text-[#565e74] uppercase font-bold block mb-1">
                      IP Address
                    </span>
                    <span className="font-mono text-[#0b1c30] font-semibold">
                      {scanResult.technicalDetails.ipAddress}
                    </span>
                  </div>
                  <div className="bg-[#f8f9ff] p-3 rounded-lg border border-[#e5eeff]">
                    <span className="text-[10px] text-[#565e74] uppercase font-bold block mb-1">
                      Certificate Issuer
                    </span>
                    <span className="text-[#0b1c30] font-semibold truncate block">
                      {scanResult.technicalDetails.issuingAuthority}
                    </span>
                  </div>
                  <div className="bg-[#f8f9ff] p-3 rounded-lg border border-[#e5eeff]">
                    <span className="text-[10px] text-[#565e74] uppercase font-bold block mb-1">
                      Cipher Suite
                    </span>
                    <span className="font-mono text-[#0b1c30] font-semibold text-[11px] truncate block">
                      {scanResult.technicalDetails.cipherSuite}
                    </span>
                  </div>
                  <div className="bg-[#f8f9ff] p-3 rounded-lg border border-[#e5eeff]">
                    <span className="text-[10px] text-[#565e74] uppercase font-bold block mb-1">
                      Form Fields Audited
                    </span>
                    <span className="text-[#00288e] font-semibold">
                      {scanResult.technicalDetails.monitoredFormFields} DOM inputs
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => onInspectDomainPopup(scanResult.matchedScenarioId)}
                className="px-4 py-2 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#00288e] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Test in Extension Popup</span>
              </button>
              <button
                type="button"
                onClick={() => onInspectDomainReport(scanResult.matchedScenarioId)}
                className="px-4 py-2 rounded-lg bg-[#00288e] hover:bg-[#1e40af] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <FileBarChart2 className="w-3.5 h-3.5" />
                <span>View Full Forensic Report</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setScanResult(null);
                setUrlInput('');
                setValidationError(null);
              }}
              className="text-xs text-[#565e74] hover:text-[#0b1c30] flex items-center gap-1 cursor-pointer font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Scan Another Website</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
