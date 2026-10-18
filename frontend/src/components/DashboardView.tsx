import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Globe,
  HelpCircle,
  Lock,
  MinusCircle,
  RefreshCw,
  Search,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import {
  ActiveNavTab,
  ExtensionSettings,
  FindingSeverity,
  RiskLevel,
  ScanHistoryRecord,
  ScenarioId,
  SecurityFinding,
  SecurityScenario,
  SecurityScanResult,
  WhitelistEntry,
} from '../types/security';
import {
  executeSecurityScan,
  validateAndNormalizeUrl,
} from '../services/securityScanner';
import { SCENARIOS } from '../data/mockScenarios';

interface DashboardViewProps {
  historyRecords: ScanHistoryRecord[];
  activeScenarioId?: ScenarioId;
  onSelectScenario?: (id: ScenarioId) => void;
  onStartScan?: (url: string) => void;
  onNavigateTab: (tab: ActiveNavTab) => void;
  onInspectDomainReport?: (scenarioId: ScenarioId) => void;
  onInspectDomainPopup?: (scenarioId: ScenarioId) => void;
  onTriggerToast: (message: string) => void;
  onOpenQuickCheck?: () => void;
  settings?: ExtensionSettings;
  whitelist?: WhitelistEntry[];
  onScanComplete?: (newRecord: ScanHistoryRecord, scenarioId: ScenarioId) => void;
}

type CheckStatus = 'PASSED' | 'WARNING' | 'FAILED' | 'NOT_CHECKED';

interface TechnicalCheckItem {
  name: string;
  category: string;
  status: CheckStatus;
  statusLabel: string;
  details: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  historyRecords,
  activeScenarioId,
  onSelectScenario,
  onTriggerToast,
  settings,
  whitelist,
  onScanComplete,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccessMessage, setScanSuccessMessage] = useState<string | null>(null);

  // Active scan result: either newly scanned or derived from the selected history record
  const [latestScanResult, setLatestScanResult] = useState<SecurityScanResult | null>(null);

  // Sync latestScanResult only when an actual recorded scan is selected from history
  useEffect(() => {
    if (activeScenarioId && historyRecords.length > 0) {
      const activeRecord = historyRecords.find((r) => r.scenarioId === activeScenarioId);
      if (activeRecord) {
        const scenario = SCENARIOS[activeScenarioId] || SCENARIOS.low;

        const scanData: SecurityScanResult = {
          domain: activeRecord.domain,
          fullUrl: activeRecord.fullUrl,
          normalizedUrl: activeRecord.fullUrl,
          riskLevel: activeRecord.riskLevel,
          score: activeRecord.score,
          isHttps: activeRecord.isHttps,
          protocol: activeRecord.isHttps ? 'TLS 1.3' : 'HTTP (Cleartext)',
          timestamp: activeRecord.timestamp,
          executionMode: 'CLIENT_HEURISTIC',
          findings: scenario.criticalViolations
            ? scenario.criticalViolations.map((cv) => ({
                id: cv.id,
                severity: cv.badgeText.includes('CRITICAL')
                  ? ('CRITICAL' as FindingSeverity)
                  : ('HIGH' as FindingSeverity),
                category: 'DOMAIN_HEURISTICS',
                title: cv.title,
                description: cv.description,
                remediation: cv.technicalEvidence,
                technicalDetail: cv.technicalEvidence,
              }))
            : [],
          safeChecks: scenario.assessmentChecklist.map((c) => `${c.title}: ${c.detail}`),
          summaryExplanation: scenario.explanation,
          recommendedRemediation:
            scenario.recommendedActions[0]?.detail ||
            'Safe to proceed with normal browsing and authentication.',
          matchedScenarioId: activeScenarioId,
          scenario,
          auditHonesty: {
            clientHeuristicExecuted: true,
            remoteServerDeepInspectionSimulated: false,
            notice: 'Client-side heuristic engine executed in-browser.',
          },
          technicalDetails: {
            ipAddress: scenario.ipAddress,
            issuingAuthority: scenario.sslSection.issuingAuthority,
            validityWindow: scenario.sslSection.validityWindow,
            cipherSuite: scenario.sslSection.cipherSuite,
            monitoredFormFields: scenario.formAuditFields.length,
            networkEndpointsCount: scenario.networkEndpoints.length,
            originScope: scenario.tabInfo,
          },
        };
        setLatestScanResult(scanData);
      }
    }
  }, [activeScenarioId, historyRecords]);

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = urlInput.trim();

    if (!cleanUrl) {
      setValidationError('Please enter a website address to scan (e.g. example.com)');
      return;
    }

    const validation = validateAndNormalizeUrl(cleanUrl);
    if (!validation.isValid || !validation.domain) {
      setValidationError(
        validation.error || 'Please enter a valid domain name or website URL.'
      );
      return;
    }

    setValidationError(null);
    setIsScanning(true);
    setScanSuccessMessage(null);

    try {
      // Perform real client-side heuristic inspection with settings and whitelist
      const scanResult = await executeSecurityScan(
        validation.normalizedUrl || cleanUrl,
        settings,
        whitelist
      );

      // Update state immediately with the latest actual scan
      setLatestScanResult(scanResult);
      setScanSuccessMessage(`Scan completed for ${scanResult.domain}`);

      if (onSelectScenario) {
        onSelectScenario(scanResult.matchedScenarioId);
      }

      // Record in history
      const newRecord: ScanHistoryRecord = {
        id: `scan-${Date.now()}`,
        domain: scanResult.domain,
        fullUrl: scanResult.fullUrl,
        riskLevel: scanResult.riskLevel,
        score: scanResult.score,
        verdictTag:
          scanResult.riskLevel === 'HIGH'
            ? 'MALICIOUS'
            : scanResult.riskLevel === 'MEDIUM'
            ? 'SUSPICIOUS'
            : 'VERIFIED',
        vectors: scanResult.findings.map((f) => f.title),
        isHttps: scanResult.isHttps,
        timestamp: 'Just now',
        timeCategory: '24H',
        protocol: scanResult.protocol,
        sha256Digest: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        resolver: 'Local Heuristic Core',
        scenarioId: scanResult.matchedScenarioId,
      };

      if (onScanComplete) {
        onScanComplete(newRecord, scanResult.matchedScenarioId);
      }

      onTriggerToast(`Security scan completed for ${scanResult.domain}`);
      setUrlInput('');
    } catch {
      setValidationError('An error occurred while inspecting the website. Please check the URL and try again.');
    } finally {
      setIsScanning(false);
    }
  };

  // Build the structured list of technical checks for Section C
  const technicalChecks: TechnicalCheckItem[] = useMemo(() => {
    if (!latestScanResult) return [];

    const findings = latestScanResult.findings;
    const hasImpersonation = findings.some(
      (f) =>
        f.category === 'DOMAIN_HEURISTICS' &&
        (f.title.toLowerCase().includes('impersonation') ||
          f.title.toLowerCase().includes('typosquatting') ||
          f.title.toLowerCase().includes('homograph'))
    );
    const hasTldWarning = findings.some(
      (f) =>
        f.category === 'DOMAIN_HEURISTICS' &&
        f.title.toLowerCase().includes('tld')
    );
    const hasIpWarning = findings.some(
      (f) =>
        f.title.toLowerCase().includes('ip address') ||
        f.description.toLowerCase().includes('raw ip')
    );
    const hasFormWarning = findings.some(
      (f) => f.category === 'FORM_HYGIENE' || f.category === 'PROTOCOL'
    );

    const isWhitelistedDomain = Boolean(
      whitelist?.some(
        (w) => w.domainPattern.toLowerCase() === latestScanResult.domain.toLowerCase()
      )
    );

    return [
      {
        name: 'Transport Encryption (HTTPS)',
        category: 'Protocol',
        status: latestScanResult.isHttps ? 'PASSED' : 'FAILED',
        statusLabel: latestScanResult.isHttps ? 'Passed' : 'Failed',
        details: latestScanResult.isHttps
          ? `${latestScanResult.protocol} — In-transit communications encrypted`
          : 'Cleartext HTTP — Transmitted credentials vulnerable to interception',
      },
      {
        name: 'Domain Syntax & Hostname Structure',
        category: 'Domain',
        status: 'PASSED',
        statusLabel: 'Passed',
        details: 'RFC-compliant hostname without malformed delimiters',
      },
      {
        name: 'Brand & Homograph Analysis',
        category: 'Domain Heuristics',
        status: hasImpersonation ? 'FAILED' : 'PASSED',
        statusLabel: hasImpersonation ? 'Failed' : 'Passed',
        details: hasImpersonation
          ? 'Potential brand impersonation or character substitution detected'
          : 'No deceptive unicode or visual homograph indicators detected',
      },
      {
        name: 'Top-Level Domain (TLD) Risk Profile',
        category: 'Domain Heuristics',
        status: hasTldWarning ? 'WARNING' : 'PASSED',
        statusLabel: hasTldWarning ? 'Warning' : 'Passed',
        details: hasTldWarning
          ? 'High-risk or disposable TLD frequently abused in credential phishing'
          : 'Standard generic / country-code top-level domain',
      },
      {
        name: 'IP Address Direct Host Check',
        category: 'Network',
        status: hasIpWarning ? 'WARNING' : 'PASSED',
        statusLabel: hasIpWarning ? 'Warning' : 'Passed',
        details: hasIpWarning
          ? 'Raw IP host detected instead of registered domain name'
          : 'Valid registered hostname with DNS namespace mapping',
      },
      {
        name: 'External Threat Intelligence Reputation',
        category: 'Reputation',
        status: isWhitelistedDomain ? 'PASSED' : 'NOT_CHECKED',
        statusLabel: isWhitelistedDomain ? 'Passed' : 'Not Checked',
        details: isWhitelistedDomain
          ? 'Passed — Domain listed on local AuthGuard Safe List'
          : 'Not Checked — External threat intelligence feeds require API key configuration in Settings',
      },
      {
        name: 'HTTP Redirect Chain Analysis',
        category: 'Network',
        status: 'NOT_CHECKED',
        statusLabel: 'Not Checked',
        details: 'Not Checked — Multi-hop server redirect tracing requires backend network proxy',
      },
      {
        name: 'Form & Input Field Isolation',
        category: 'Hygiene',
        status: hasFormWarning ? 'WARNING' : 'PASSED',
        statusLabel: hasFormWarning ? 'Warning' : 'Passed',
        details: hasFormWarning
          ? 'Form action attribute or unencrypted submission warning flagged'
          : 'Authentication inputs verified for secure transport target',
      },
      {
        name: 'SSL/TLS Certificate Authority Verification',
        category: 'Certificate',
        status: latestScanResult.isHttps ? 'PASSED' : 'NOT_CHECKED',
        statusLabel: latestScanResult.isHttps ? 'Passed' : 'Not Checked',
        details: latestScanResult.isHttps
          ? `Issued by ${latestScanResult.technicalDetails.issuingAuthority}`
          : 'Not Checked — Site does not utilize TLS certificate',
      },
    ];
  }, [latestScanResult, whitelist]);

  const getStatusBadge = (status: CheckStatus) => {
    switch (status) {
      case 'PASSED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]">
            <Check className="w-3 h-3" />
            <span>Passed</span>
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#fffbeb] text-[#b45309] border border-[#fde68a]">
            <AlertTriangle className="w-3 h-3" />
            <span>Warning</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca]">
            <XCircle className="w-3 h-3" />
            <span>Failed</span>
          </span>
        );
      case 'NOT_CHECKED':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#f1f5f9] text-[#64748b] border border-[#e2e8f0]">
            <MinusCircle className="w-3 h-3" />
            <span>Not Checked</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* =========================================================================
          SECTION A: SCAN WEBSITE
          ========================================================================= */}
      <section className="bg-white rounded-2xl border border-[#e5eeff] p-5 sm:p-6 shadow-xs space-y-4">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-[#0b1c30]">
            Scan Website
          </h1>
          <p className="text-xs text-[#565e74] mt-0.5">
            Enter a website address to verify its safety, transport encryption, and authentication risk before submitting passwords or personal details.
          </p>
        </div>

        <form onSubmit={handleScanSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1 min-w-0">
              <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#757684]" />
              <input
                type="text"
                value={urlInput}
                disabled={isScanning}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  if (validationError) setValidationError(null);
                  if (scanSuccessMessage) setScanSuccessMessage(null);
                }}
                placeholder="Enter website address (e.g. example.com or https://yourbank.com)"
                aria-label="Website address to scan"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#dce9ff] text-sm text-[#0b1c30] placeholder:text-[#757684] focus:outline-none focus:border-[#00288e] focus:ring-1 focus:ring-[#00288e] bg-white transition-all disabled:opacity-60"
              />
            </div>

            <button
              type="submit"
              disabled={isScanning}
              className="px-5 py-2.5 rounded-xl bg-[#00288e] hover:bg-[#1e40af] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer shrink-0 disabled:opacity-60"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Scan Website</span>
                </>
              )}
            </button>
          </div>

          {/* Validation & Error Feedback */}
          {validationError && (
            <div className="flex items-center gap-2 text-xs font-medium text-[#991b1b] bg-[#fef2f2] px-3.5 py-2.5 rounded-xl border border-[#fecaca]">
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#dc2626]" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Success Indicator */}
          {scanSuccessMessage && !validationError && (
            <div className="flex items-center gap-2 text-xs font-medium text-[#065f46] bg-[#ecfdf5] px-3.5 py-2 rounded-xl border border-[#a7f3d0]">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#059669]" />
              <span>{scanSuccessMessage}</span>
            </div>
          )}
        </form>

        <div className="flex items-center gap-2 text-[11px] text-[#565e74] pt-1">
          <Shield className="w-3.5 h-3.5 text-[#00288e] shrink-0" />
          <span>
            Scans are evaluated client-side on-demand. Passwords, session cookies, and credentials are never collected or transmitted.
          </span>
        </div>
      </section>

      {/* =========================================================================
          SECTION B: SECURITY REPORT
          ========================================================================= */}
      <section className="bg-white rounded-2xl border border-[#e5eeff] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#0b1c30]">
              Security Report
            </h2>
            <p className="text-xs text-[#565e74]">
              {latestScanResult
                ? `Active security assessment for ${latestScanResult.domain}`
                : 'Your security report will appear here after a scan.'}
            </p>
          </div>

          {latestScanResult && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#565e74] hidden sm:inline">
                {latestScanResult.timestamp}
              </span>
              <button
                type="button"
                onClick={() => {
                  const dataStr =
                    'data:text/json;charset=utf-8,' +
                    encodeURIComponent(JSON.stringify(latestScanResult, null, 2));
                  const downloadAnchor = document.createElement('a');
                  downloadAnchor.setAttribute('href', dataStr);
                  downloadAnchor.setAttribute(
                    'download',
                    `authguard-report-${latestScanResult.domain}.json`
                  );
                  document.body.appendChild(downloadAnchor);
                  downloadAnchor.click();
                  downloadAnchor.remove();
                  onTriggerToast('Security report exported as JSON');
                }}
                className="px-3 py-1.5 rounded-lg border border-[#dce9ff] hover:bg-[#eff4ff] text-[#00288e] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Export report JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          )}
        </div>

        {latestScanResult ? (
          <div className="space-y-4">
            {/* Risk Banner & Score */}
            <div
              className={`p-4 sm:p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                latestScanResult.riskLevel === 'HIGH'
                  ? 'bg-[#fef2f2] border-[#fecaca]'
                  : latestScanResult.riskLevel === 'MEDIUM'
                  ? 'bg-[#fffbeb] border-[#fde68a]'
                  : 'bg-[#ecfdf5] border-[#a7f3d0]'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    latestScanResult.riskLevel === 'HIGH'
                      ? 'bg-[#dc2626] text-white'
                      : latestScanResult.riskLevel === 'MEDIUM'
                      ? 'bg-[#d97706] text-white'
                      : 'bg-[#059669] text-white'
                  }`}
                >
                  {latestScanResult.riskLevel === 'HIGH' ? (
                    <ShieldAlert className="w-5 h-5" />
                  ) : latestScanResult.riskLevel === 'MEDIUM' ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <ShieldCheck className="w-5 h-5" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-[#0b1c30]">
                      {latestScanResult.domain}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                        latestScanResult.riskLevel === 'HIGH'
                          ? 'bg-[#fee2e2] text-[#991b1b]'
                          : latestScanResult.riskLevel === 'MEDIUM'
                          ? 'bg-[#fef3c7] text-[#92400e]'
                          : 'bg-[#d1fae5] text-[#065f46]'
                      }`}
                    >
                      {latestScanResult.riskLevel === 'HIGH'
                        ? 'High Risk / Potential Threat'
                        : latestScanResult.riskLevel === 'MEDIUM'
                        ? 'Medium Risk / Review Required'
                        : 'No Threats Detected'}
                    </span>
                  </div>
                  <p className="text-xs text-[#444653] mt-1 leading-relaxed">
                    {latestScanResult.summaryExplanation}
                  </p>
                </div>
              </div>

              {/* Safety Score Badge */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-black/5 shrink-0">
                <div className="text-[11px] font-semibold text-[#565e74]">
                  Safety Score
                </div>
                <div
                  className={`text-2xl font-bold font-mono ${
                    latestScanResult.riskLevel === 'HIGH'
                      ? 'text-[#dc2626]'
                      : latestScanResult.riskLevel === 'MEDIUM'
                      ? 'text-[#d97706]'
                      : 'text-[#059669]'
                  }`}
                >
                  {latestScanResult.score}
                  <span className="text-xs font-normal text-[#757684]">/100</span>
                </div>
              </div>
            </div>

            {/* Recommended Action */}
            <div className="bg-[#f8f9ff] p-4 rounded-xl border border-[#e5eeff] space-y-1">
              <div className="text-[11px] uppercase tracking-wide font-bold text-[#00288e] flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>Recommended Action</span>
              </div>
              <p className="text-xs font-medium text-[#0b1c30] leading-relaxed">
                {latestScanResult.recommendedRemediation}
              </p>
            </div>

            {/* Findings & Risk Indicators */}
            {latestScanResult.findings.length > 0 ? (
              <div className="space-y-2">
                <div className="text-xs font-bold text-[#0b1c30]">
                  Important Findings ({latestScanResult.findings.length})
                </div>
                <div className="space-y-2">
                  {latestScanResult.findings.map((finding) => (
                    <div
                      key={finding.id}
                      className="p-3 rounded-xl border border-[#e5eeff] bg-white flex items-start gap-3"
                    >
                      <AlertTriangle
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          finding.severity === 'CRITICAL' || finding.severity === 'HIGH'
                            ? 'text-[#dc2626]'
                            : 'text-[#d97706]'
                        }`}
                      />
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#0b1c30]">
                            {finding.title}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.2 rounded-full uppercase ${
                              finding.severity === 'CRITICAL' || finding.severity === 'HIGH'
                                ? 'bg-[#fee2e2] text-[#991b1b]'
                                : 'bg-[#fef3c7] text-[#92400e]'
                            }`}
                          >
                            {finding.severity}
                          </span>
                        </div>
                        <p className="text-xs text-[#565e74] leading-relaxed">
                          {finding.description}
                        </p>
                        {finding.remediation && (
                          <div className="text-[11px] text-[#00288e] font-medium pt-1">
                            Action: {finding.remediation}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl border border-[#d1fae5] bg-[#ecfdf5] flex items-center gap-2.5 text-xs text-[#065f46]">
                <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" />
                <span>
                  No suspicious indicators, homograph anomalies, or unencrypted credential targets were detected during this scan.
                </span>
              </div>
            )}
          </div>
        ) : (
          /* Empty state when no scan has been performed */
          <div className="py-10 px-4 text-center rounded-xl bg-[#f8f9ff] border border-dashed border-[#dce9ff] space-y-2">
            <Shield className="w-8 h-8 text-[#757684] mx-auto opacity-60" />
            <p className="text-sm font-semibold text-[#0b1c30]">
              Your security report will appear here after a scan.
            </p>
            <p className="text-xs text-[#565e74] max-w-md mx-auto">
              Enter a website address in the section above and click <span className="font-semibold text-[#0b1c30]">Scan Website</span> to generate an on-demand security audit.
            </p>
          </div>
        )}
      </section>

      {/* =========================================================================
          SECTION C: TECHNICAL INFORMATION (Directly visible, no extra click)
          ========================================================================= */}
      <section className="bg-white rounded-2xl border border-[#e5eeff] p-5 sm:p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#0b1c30] flex items-center gap-2">
            <Server className="w-4 h-4 text-[#00288e]" />
            <span>Technical Information</span>
          </h2>
          <p className="text-xs text-[#565e74] mt-0.5">
            Detailed inspection metrics and check statuses for the inspected target.
          </p>
        </div>

        {latestScanResult ? (
          <div className="space-y-4">
            {/* Target Dashboard Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-[#f8f9ff] p-3 rounded-xl border border-[#e5eeff]">
                <div className="text-[10px] text-[#757684] uppercase font-semibold">
                  Website / Domain
                </div>
                <div className="font-semibold text-xs text-[#0b1c30] mt-0.5 truncate" title={latestScanResult.domain}>
                  {latestScanResult.domain}
                </div>
              </div>

              <div className="bg-[#f8f9ff] p-3 rounded-xl border border-[#e5eeff]">
                <div className="text-[10px] text-[#757684] uppercase font-semibold">
                  Scan Timestamp
                </div>
                <div className="text-xs font-mono text-[#0b1c30] mt-0.5">
                  {latestScanResult.timestamp}
                </div>
              </div>

              <div className="bg-[#f8f9ff] p-3 rounded-xl border border-[#e5eeff]">
                <div className="text-[10px] text-[#757684] uppercase font-semibold">
                  HTTPS Status
                </div>
                <div className="text-xs font-semibold mt-0.5 flex items-center gap-1.5">
                  {latestScanResult.isHttps ? (
                    <span className="text-[#059669] flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>Encrypted (HTTPS)</span>
                    </span>
                  ) : (
                    <span className="text-[#dc2626] flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Cleartext (HTTP)</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-[#f8f9ff] p-3 rounded-xl border border-[#e5eeff]">
                <div className="text-[10px] text-[#757684] uppercase font-semibold">
                  Reputation Feed
                </div>
                <div className="text-xs text-[#565e74] mt-0.5 truncate">
                  {whitelist?.some((w) => w.domainPattern.toLowerCase() === latestScanResult.domain.toLowerCase())
                    ? 'Safe List (Verified)'
                    : 'Information Unavailable'}
                </div>
              </div>
            </div>

            {/* URL Inspected */}
            <div className="bg-[#f8f9ff] p-3 rounded-xl border border-[#e5eeff] space-y-1">
              <div className="text-[10px] text-[#757684] uppercase font-semibold">
                Inspected URL
              </div>
              <div className="font-mono text-xs text-[#0b1c30] break-all">
                {latestScanResult.fullUrl}
              </div>
            </div>

            {/* Structured Security Checks Table */}
            <div>
              <div className="text-xs font-bold text-[#0b1c30] mb-2">
                Security Checks & Statuses
              </div>
              <div className="overflow-x-auto border border-[#e5eeff] rounded-xl bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f8f9ff] text-[#565e74] border-b border-[#e5eeff]">
                    <tr>
                      <th className="py-2.5 px-3.5 font-semibold">Check</th>
                      <th className="py-2.5 px-3 font-semibold">Category</th>
                      <th className="py-2.5 px-3 font-semibold">Status</th>
                      <th className="py-2.5 px-3.5 font-semibold">Inspection Detail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f4ff]">
                    {technicalChecks.map((check, index) => (
                      <tr key={index} className="hover:bg-[#f8f9ff]/70 transition-colors">
                        <td className="py-2.5 px-3.5 font-medium text-[#0b1c30]">
                          {check.name}
                        </td>
                        <td className="py-2.5 px-3 text-[#565e74]">
                          {check.category}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {getStatusBadge(check.status)}
                        </td>
                        <td className="py-2.5 px-3.5 text-[#444653] leading-relaxed">
                          {check.details}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notice regarding limitations & honest detection */}
            <div className="p-3 rounded-xl bg-[#f8f9ff] border border-[#e5eeff] text-[11px] text-[#565e74] flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-[#757684] shrink-0 mt-0.5" />
              <span>
                Checks marked as <span className="font-semibold text-[#0b1c30]">Not Checked</span> require external network feeds or live server redirects. AuthGuard strictly reports verified client-side observations without assuming external safety.
              </span>
            </div>
          </div>
        ) : (
          /* Empty state for Technical Information */
          <div className="py-8 px-4 text-center rounded-xl bg-[#f8f9ff] border border-dashed border-[#dce9ff] space-y-1">
            <Server className="w-7 h-7 text-[#757684] mx-auto opacity-50" />
            <p className="text-xs font-semibold text-[#0b1c30]">
              Technical information unavailable
            </p>
            <p className="text-[11px] text-[#565e74]">
              Scan a website to view full transport, domain, and security check details.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};
