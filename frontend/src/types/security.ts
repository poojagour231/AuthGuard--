export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type ScenarioId =
  | 'low'
  | 'medium'
  | 'high'
  | 'cloudvault'
  | 'cryptowallet'
  | 'github';

export type ActiveNavTab =
  | 'dashboard'
  | 'scanner'
  | 'report'
  | 'history'
  | 'popup'
  | 'demo'
  | 'settings'
  | 'about';

export type PopupViewState = 'IDLE' | 'ANALYZING';

export interface MicroIndicator {
  label: string;
  value: string;
  status: 'safe' | 'caution' | 'danger';
  iconName: 'check' | 'verified' | 'shield' | 'warning' | 'danger' | 'clock' | 'report';
}

export interface TelemetryDrawerItem {
  id: string;
  title: string;
  subtitle: string;
  badgeText: string;
  badgeStatus: 'safe' | 'caution' | 'danger' | 'neutral';
  iconType: 'ssl' | 'form' | 'domain' | 'scripts';
  details: Array<{
    label: string;
    value: string;
    isMono?: boolean;
    status?: 'safe' | 'caution' | 'danger' | 'neutral';
  }>;
}

export interface CriticalViolationItem {
  id: string;
  title: string;
  badgeText: string;
  badgeTone: 'solid' | 'tinted';
  description: string;
  iconType: 'key_off' | 'spoof' | 'untrusted';
  technicalEvidence: string;
}

export interface FormFieldAudit {
  index: number;
  selector: string;
  scopeBadge: string;
  description: string;
  codeTarget?: string;
  statusLabel: string;
  badgeText: string;
  status: 'safe' | 'caution' | 'danger';
}

export interface NetworkEndpointAudit {
  url: string;
  method: 'GET' | 'POST' | 'PUT';
  originScope: string;
  corsHeader: string;
  integrityBadge: string;
  status: 'safe' | 'caution' | 'danger';
}

export interface SecurityScenario {
  id: ScenarioId;
  shortLabel: string;
  scenarioCode: string;
  scenarioTitle: string;
  domain: string;
  fullUrl: string;
  tabInfo: string;
  ipAddress: string;
  scanTimestamp: string;
  protocolLabel: string;
  isHttps: boolean;
  riskLevel: RiskLevel;
  baseScore: number;
  riskBadgeText: string;
  headline: string;
  explanation: string;
  microIndicators: [MicroIndicator, MicroIndicator, MicroIndicator];
  vectorsSummaryText: string;
  telemetryDrawers: TelemetryDrawerItem[];
  criticalViolations?: CriticalViolationItem[];
  popupNotice: {
    title: string;
    body: string;
    tone: 'neutral' | 'caution' | 'danger';
  };
  // Detailed Report fields
  reportHero: {
    certBadge: string;
    originId: string;
    summary: string;
  };
  executiveSummary: {
    confidence: string;
    consensus: string;
    authPassedLabel: string;
    authHeadline: string;
    authDescription: string;
    tokenExchange: string;
    frameIsolation: string;
    provenanceTier: string;
    domainAgeHeadline: string;
    domainAgeDescription: string;
    dnssecStatus: string;
    certificateType: string;
    scriptRiskLabel: string;
    scriptsAudited: string;
    scriptsVerified: string;
    scriptsDescription: string;
    sriHashes: string;
    evalUsage: string;
  };
  sslSection: {
    gradeBadge: string;
    protocol: string;
    replayProtection: string;
    cipherSuite: string;
    keyExchange: string;
    issuingAuthority: string;
    serialNumber: string;
    validityWindow: string;
    expiryDetail: string;
    trustChain: {
      rootCa: string;
      intermediateCa: string;
      leafDomain: string;
      leafStatus: string;
    };
  };
  formAuditFields: FormFieldAudit[];
  domainHeuristics: {
    anomaliesBadge: string;
    punycodeTitle: string;
    punycodeDesc: string;
    levenshteinTitle: string;
    levenshteinDesc: string;
    brandMatchTarget: string;
    whoisTitle: string;
    whoisDesc: string;
  };
  networkEndpoints: NetworkEndpointAudit[];
  assessmentChecklist: Array<{
    title: string;
    detail: string;
    status: 'safe' | 'caution' | 'danger';
  }>;
  recommendedActions: Array<{
    title: string;
    detail: string;
    status: 'safe' | 'caution' | 'danger' | 'neutral';
  }>;
  auditMetadata: {
    sessionId: string;
    inspectorCore: string;
    latency: string;
    signature: string;
  };
  // Interactive Demo Simulator fields
  simulator: {
    overlayTitle: string;
    overlayDesc: string;
    overlayActionText: string;
    mockBrandInitial: string;
    mockHeader: string;
    mockInvoiceOrRef: string;
    mockField1Label: string;
    mockField1Value: string;
    mockField1Badge: string;
    mockField2Label: string;
    mockField2Badge: string;
    mockSubmitText: string;
    weights: {
      origin: number;
      ssl: number;
      dom: number;
      script: number;
    };
    logs: Array<{
      time: string;
      text: string;
      tone: 'safe' | 'caution' | 'danger' | 'primary' | 'neutral';
    }>;
  };
}

export interface ScanHistoryRecord {
  id: string;
  scenarioId: ScenarioId;
  domain: string;
  fullUrl: string;
  score: number;
  riskLevel: RiskLevel;
  verdictTag: 'VERIFIED' | 'SUSPICIOUS' | 'MALICIOUS';
  vectors: string[];
  timestamp: string;
  timeCategory: '24H' | '7D' | '30D';
  protocol: string;
  isHttps: boolean;
  sha256Digest: string;
  resolver: string;
}

export interface WhitelistEntry {
  id: string;
  domainPattern: string;
  scope: string;
  addedBy: string;
  verified: boolean;
}

export interface ExtensionSettings {
  heuristicDomAnalysis: boolean;
  punycodeDetection: boolean;
  formActionWarning: boolean;
  sensitivityPreset: 'relaxed' | 'balanced' | 'strict';
  localDiagnosticJournaling: boolean;
  retentionDays: '7' | '14' | '30' | '90' | 'never';
  watermarkLocked: boolean;
  defaultDemoScenario: 'cycle' | 'clean' | 'suspicious';
  blockUnverifiedTracking: boolean;
  autoFlagOverlays: boolean;
  protectionPausedUntil: number | null;
}

export type FindingSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export interface SecurityFinding {
  id: string;
  severity: FindingSeverity;
  category: 'PROTOCOL' | 'DOMAIN_HEURISTICS' | 'FORM_HYGIENE' | 'NETWORK' | 'REPUTATION';
  title: string;
  description: string;
  remediation: string;
  technicalDetail?: string;
}

export type ScanExecutionMode = 'CLIENT_HEURISTIC' | 'DEMO_SIMULATION';

export interface UrlValidationResult {
  isValid: boolean;
  error?: string;
  normalizedUrl?: string;
  domain?: string;
  isHttps?: boolean;
  protocol?: string;
  pathname?: string;
}

export interface SecurityScanResult {
  domain: string;
  fullUrl: string;
  normalizedUrl: string;
  riskLevel: RiskLevel;
  score: number;
  isHttps: boolean;
  protocol: string;
  timestamp: string;
  executionMode: ScanExecutionMode;
  findings: SecurityFinding[];
  safeChecks: string[];
  summaryExplanation: string;
  recommendedRemediation: string;
  matchedScenarioId: ScenarioId;
  scenario: SecurityScenario;
  auditHonesty: {
    clientHeuristicExecuted: boolean;
    remoteServerDeepInspectionSimulated: boolean;
    notice: string;
  };
  technicalDetails: {
    ipAddress: string;
    issuingAuthority: string;
    validityWindow: string;
    cipherSuite: string;
    monitoredFormFields: number;
    networkEndpointsCount: number;
    originScope: string;
  };
}

export type QuickCheckType = 'website' | 'email' | 'sms';

export type QuickCheckStatus = 'threat' | 'clean' | 'review'; // Red, Green, Amber

export interface QuickCheckResult {
  inputType: QuickCheckType;
  inputPreview: string;
  status: QuickCheckStatus;
  statusTitle: string;
  primaryReason: string;
  recommendedAction: string;
  isHeuristic: boolean;
  completedChecks: string[];
  flaggedIndicators: Array<{
    category: 'LINK' | 'URGENCY' | 'IMPERSONATION' | 'SCAM_PATTERN' | 'PROTOCOL';
    label: string;
    detail: string;
  }>;
  extractedUrls?: string[];
  matchedScenarioId?: ScenarioId;
  timestamp: string;
}

