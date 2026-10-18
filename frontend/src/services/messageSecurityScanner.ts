import { QuickCheckResult, QuickCheckStatus } from '../types/security';

/**
 * Client-Side Heuristic Analyzer for Email and SMS Messages
 *
 * PRIVACY NOTICE:
 * - Content is analyzed strictly in browser memory upon explicit user submission.
 * - Message bodies, passwords, OTPs, and phone numbers are NEVER persisted to localStorage
 *   or logged to consoles.
 * - Content is NEVER transmitted to external APIs or network endpoints.
 *
 * BACKEND NOTICE:
 * - Currently operates via client-side pattern heuristics.
 * - To connect a real threat intelligence service (e.g. spam/phishing classification API),
 *   a dedicated backend endpoint would be required (e.g. POST /api/v1/analyze-message),
 *   as the existing website scanning service only accepts website domain/URL schemas.
 */

// Known URL shorteners that conceal the actual destination
const URL_SHORTENERS = [
  'bit.ly',
  'tinyurl.com',
  't.co',
  'is.gd',
  'cutt.ly',
  'rb.gy',
  'shorturl.at',
  'ow.ly',
  'buff.ly',
  'goo.gl',
];

// High-abuse top level domains often seen in disposable phishing and spam campaigns
const SUSPICIOUS_TLDS = [
  '.cc',
  '.tk',
  '.ml',
  '.ga',
  '.cf',
  '.top',
  '.xyz',
  '.buzz',
  '.click',
  '.monster',
  '.su',
  '.work',
  '.cam',
];

// High-value impersonated brands
const IMPERSONATION_TARGETS = [
  { name: 'USPS', keywords: ['usps', 'postal service'], domainHints: ['usps.com'] },
  { name: 'FedEx', keywords: ['fedex'], domainHints: ['fedex.com'] },
  { name: 'UPS', keywords: ['ups delivery', 'ups tracking'], domainHints: ['ups.com'] },
  { name: 'DHL', keywords: ['dhl express', 'dhl parcel'], domainHints: ['dhl.com'] },
  { name: 'Apple', keywords: ['apple support', 'apple id', 'icloud security'], domainHints: ['apple.com'] },
  { name: 'PayPal', keywords: ['paypal security', 'paypal support', 'paypal payment'], domainHints: ['paypal.com'] },
  { name: 'Chase Bank', keywords: ['chase alert', 'chase bank', 'chase fraud'], domainHints: ['chase.com'] },
  { name: 'Bank of America', keywords: ['bank of america', 'bofa alert'], domainHints: ['bankofamerica.com'] },
  { name: 'Wells Fargo', keywords: ['wells fargo'], domainHints: ['wellsfargo.com'] },
  { name: 'Amazon', keywords: ['amazon customer', 'amazon order', 'amazon prime'], domainHints: ['amazon.com'] },
  { name: 'Netflix', keywords: ['netflix account', 'netflix subscription'], domainHints: ['netflix.com'] },
  { name: 'IRS / Tax Authority', keywords: ['irs notice', 'internal revenue', 'tax refund', 'tax audit'], domainHints: ['irs.gov'] },
  { name: 'Geek Squad', keywords: ['geek squad', 'best buy renewal', 'anti-virus subscription'], domainHints: ['bestbuy.com'] },
  { name: 'MetaMask / Crypto', keywords: ['metamask', 'seed phrase', 'recovery phrase', 'wallet validation', 'trust wallet'], domainHints: ['metamask.io'] },
];

/**
 * Extracts URLs and domain names from unstructured message text.
 */
function extractUrlsAndDomains(text: string): string[] {
  // Regex matching http/https URLs and bare domains with paths or extensions
  const urlRegex = /(?:https?:\/\/[^\s<>"'{}|\\^`]+|[a-zA-Z0-9][-a-zA-Z0-9]*\.[a-zA-Z]{2,}(?:\/[^\s<>"'{}|\\^`]*)?)/gi;
  const matches = text.match(urlRegex) || [];
  return Array.from(new Set(matches.map((m) => m.replace(/[.,;:!?)]+$/, ''))));
}

/**
 * Extracts the base hostname from an extracted URL or domain string.
 */
function extractHostname(urlString: string): string {
  try {
    const withScheme = /^https?:\/\//i.test(urlString) ? urlString : `https://${urlString}`;
    const url = new URL(withScheme);
    return url.hostname.toLowerCase();
  } catch {
    return urlString.toLowerCase().split('/')[0];
  }
}

/**
 * Analyzes Email or SMS message text using client-side heuristic inspection.
 */
export function analyzeMessageHeuristics(
  rawText: string,
  type: 'email' | 'sms'
): QuickCheckResult {
  const text = (rawText || '').trim();
  const lower = text.toLowerCase();

  const flaggedIndicators: Array<{
    category: 'LINK' | 'URGENCY' | 'IMPERSONATION' | 'SCAM_PATTERN' | 'PROTOCOL';
    label: string;
    detail: string;
  }> = [];

  const completedChecks: string[] = [];

  // Minimum content check
  if (text.length < 15) {
    return {
      inputType: type,
      inputPreview: text || 'Empty message',
      status: 'review',
      statusTitle: 'Information unavailable',
      primaryReason: 'The provided message text is too short to perform a reliable security evaluation.',
      recommendedAction: 'Paste the full message or email body including any links or instructions.',
      isHeuristic: true,
      completedChecks: ['Length verification: Message is under minimum threshold (15 characters)'],
      flaggedIndicators: [
        {
          category: 'SCAM_PATTERN',
          label: 'Insufficient Content',
          detail: 'Text does not contain enough context or structural data to inspect.',
        },
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }

  // 1. LINK AND DOMAIN INSPECTION
  completedChecks.push('Link & Domain Extraction: Scanning for embedded URLs, IP addresses, and domain patterns');
  const extractedUrls = extractUrlsAndDomains(text);

  let hasThreatLink = false;
  let hasShortenerLink = false;
  let hasIpLink = false;

  for (const urlStr of extractedUrls) {
    const hostname = extractHostname(urlStr);
    const isUnencryptedHttp = /^http:\/\//i.test(urlStr);

    // IP address host check
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
      hasIpLink = true;
      hasThreatLink = true;
      flaggedIndicators.push({
        category: 'LINK',
        label: `Direct IP Address in Link (${hostname})`,
        detail: 'Phishing attacks frequently use raw IP addresses rather than registered domain names to evade security filters.',
      });
    }

    // URL Shortener check (Amber / Review condition client-side)
    if (URL_SHORTENERS.some((s) => hostname === s || hostname.endsWith(`.${s}`))) {
      hasShortenerLink = true;
      flaggedIndicators.push({
        category: 'LINK',
        label: `Obfuscated URL Shortener (${hostname})`,
        detail: 'The destination website is concealed behind a URL shortener and cannot be inspected client-side without backend unshortening.',
      });
    }

    // High-risk TLD check
    if (SUSPICIOUS_TLDS.some((tld) => hostname.endsWith(tld))) {
      hasThreatLink = true;
      flaggedIndicators.push({
        category: 'LINK',
        label: `High-Risk Top-Level Domain (${hostname})`,
        detail: 'Link points to a domain extension heavily associated with disposable phishing campaigns and automated spam.',
      });
    }

    // Unencrypted HTTP in message link
    if (isUnencryptedHttp) {
      flaggedIndicators.push({
        category: 'PROTOCOL',
        label: `Insecure HTTP Link (${urlStr})`,
        detail: 'Link uses unencrypted HTTP protocol without TLS transport encryption.',
      });
    }

    // Lookalike brand domain inside links
    for (const target of IMPERSONATION_TARGETS) {
      const containsBrandKw = target.keywords.some((kw) => hostname.includes(kw.replace(/\s+/g, '')));
      const matchesLegitDomain = target.domainHints.some((d) => hostname === d || hostname.endsWith(`.${d}`));

      if (containsBrandKw && !matchesLegitDomain) {
        hasThreatLink = true;
        flaggedIndicators.push({
          category: 'IMPERSONATION',
          label: `Deceptive ${target.name} Lookalike Link (${hostname})`,
          detail: `The link references ${target.name} but does not lead to the official domain (${target.domainHints[0]}).`,
        });
      }
    }
  }

  // 2. URGENCY & COERCION TACTICS
  completedChecks.push('Urgency Analysis: Checking for coercive deadlines, threats of account closure, or legal action');
  const urgencyPatterns = [
    { pattern: /\b(?:within\s+\d+\s*(?:hours?|hrs?|minutes?|mins?)|in\s+24\s*hours?)\b/i, desc: 'Artificial countdown deadline' },
    { pattern: /\b(?:account\s+(?:suspended|locked|terminated|frozen|restricted|disabled))\b/i, desc: 'Claim of immediate account suspension' },
    { pattern: /\b(?:urgent\s+action\s+required|immediate\s+action\s+required|act\s+now|final\s+notice)\b/i, desc: 'High-pressure call to action' },
    { pattern: /\b(?:unauthorized\s+transaction|suspicious\s+login\s+detected|security\s+breach)\b/i, desc: 'Unverified security scare lure' },
    { pattern: /\b(?:arrest\s+warrant|legal\s+action\s+will\s+be\s+taken|law\s+enforcement)\b/i, desc: 'Coercive legal or arrest threat' },
  ];

  let hasUrgency = false;
  for (const { pattern, desc } of urgencyPatterns) {
    if (pattern.test(text)) {
      hasUrgency = true;
      flaggedIndicators.push({
        category: 'URGENCY',
        label: 'Urgency & Pressure Tactic',
        detail: `Message utilizes psychological pressure tactics (${desc}) to provoke hasty action before verification.`,
      });
      break;
    }
  }

  // 3. IMPERSONATION INDICATORS
  completedChecks.push('Organization Impersonation: Evaluating claims of official authority, delivery services, or institutions');
  let impersonatedBrand: string | null = null;
  for (const target of IMPERSONATION_TARGETS) {
    const mentionsBrand = target.keywords.some((kw) => lower.includes(kw));
    if (mentionsBrand) {
      impersonatedBrand = target.name;
      // If brand is mentioned AND there are external links that don't match official domain
      const hasForeignLinks = extractedUrls.some((u) => {
        const h = extractHostname(u);
        return !target.domainHints.some((hint) => h === hint || h.endsWith(`.${hint}`));
      });

      if (hasForeignLinks) {
        hasThreatLink = true;
        flaggedIndicators.push({
          category: 'IMPERSONATION',
          label: `Possible ${target.name} Impersonation`,
          detail: `Message claims to be from or references ${target.name}, but directs you to external web links outside their official domain (${target.domainHints[0]}).`,
        });
      }
      break;
    }
  }

  // 4. COMMON SCAM PATTERNS
  completedChecks.push('Scam Signature Matching: Inspecting for credential harvesting, OTP requests, and fake refund lures');

  // Pattern: OTP / Verification Code harvesting
  if (
    /\b(?:one[- ]time\s+(?:passcode|pin|code)|otp|verification\s+code|6-digit\s+code)\b/i.test(text) &&
    /\b(?:reply\s+with|send\s+(?:back|us)|share\s+this\s+code|enter\s+the\s+code)\b/i.test(text)
  ) {
    flaggedIndicators.push({
      category: 'SCAM_PATTERN',
      label: 'Authentication Code (OTP) Harvesting Request',
      detail: 'Legitimate institutions never ask you to reply with or share one-time security codes. Attackers use this to bypass two-factor authentication.',
    });
  }

  // Pattern: Fake invoice / Renewal scam with callback phone number
  if (
    /\b(?:invoice|renewal|auto-renew(?:al)?|payment\s+authorized|deducted\s+from\s+your\s+account)\b/i.test(text) &&
    /\b(?:to\s+(?:cancel|refund|dispute)\s+call|call\s+(?:us|our\s+support|helpdesk|customer\s+service)\s+(?:at|on)?)\b/i.test(text)
  ) {
    flaggedIndicators.push({
      category: 'SCAM_PATTERN',
      label: 'Fake Invoice & Phone Call-Back Lure',
      detail: 'Directs you to call a phone number to dispute a non-existent charge (e.g. Geek Squad or anti-virus subscription scam).',
    });
  }

  // Pattern: Parcel delivery fee / Incomplete address lure (Common SMS smishing)
  if (
    /\b(?:parcel|package|delivery|shipment)\b/i.test(text) &&
    /\b(?:incomplete\s+address|unpaid\s+(?:customs|fee|postage)|held\s+at\s+warehouse|reschedule)\b/i.test(text)
  ) {
    flaggedIndicators.push({
      category: 'SCAM_PATTERN',
      label: 'Package Delivery Smishing Signature',
      detail: 'Classic delivery fee or invalid address lure used to trick victims into paying a small fee and harvesting credit card details.',
    });
  }

  // Pattern: Crypto recovery / Seed phrase
  if (/\b(?:seed\s+phrase|12\s+words|private\s+key|wallet\s+phrase)\b/i.test(text)) {
    flaggedIndicators.push({
      category: 'SCAM_PATTERN',
      label: 'Cryptocurrency Secret Key / Seed Phrase Request',
      detail: 'Never enter your recovery seed phrase or private key into any form or message reply. Doing so results in irreversible asset loss.',
    });
  }

  // 5. DETERMINE CLASSIFICATION
  let status: QuickCheckStatus = 'clean';
  let statusTitle = 'No suspicious indicators found in completed checks';
  let primaryReason = 'No known phishing links, high-urgency threats, or credential harvesting patterns were found in the evaluated text.';
  let recommendedAction = 'Proceed with normal caution. Note: This heuristic check does not guarantee that the content is genuine.';

  const criticalCategories = ['IMPERSONATION', 'LINK', 'SCAM_PATTERN'];
  const hasCriticalIndicator = flaggedIndicators.some(
    (f) =>
      criticalCategories.includes(f.category) &&
      !f.label.includes('URL Shortener') &&
      !f.label.includes('Insecure HTTP')
  );

  if (hasThreatLink || hasCriticalIndicator) {
    status = 'threat'; // RED
    statusTitle = 'Potential threat detected';
    const topThreat = flaggedIndicators.find((f) => criticalCategories.includes(f.category)) || flaggedIndicators[0];
    primaryReason = topThreat
      ? `${topThreat.label}: ${topThreat.detail}`
      : 'Deceptive indicators consistent with credential harvesting or social engineering were detected.';
    recommendedAction = 'Do not click links, reply with personal codes, or call provided numbers. Report and delete this message.';
  } else if (hasShortenerLink || hasUrgency || flaggedIndicators.length > 0) {
    status = 'review'; // AMBER
    statusTitle = 'Review required';
    const topFlag = flaggedIndicators[0];
    if (hasShortenerLink) {
      primaryReason = 'Contains an obfuscated short link. The destination web address cannot be verified client-side without a backend link expansion service.';
      recommendedAction = 'Do not follow the link directly. Confirm the communication through the sender\'s official app or verified contact details.';
    } else if (hasUrgency) {
      primaryReason = 'Message employs urgent or threatening language to provoke a fast reaction, although no confirmed malicious links were detected.';
      recommendedAction = 'Verify the authenticity of this request independently before taking any action or providing information.';
    } else {
      primaryReason = topFlag ? topFlag.detail : 'Certain attributes warrant human review before proceeding.';
      recommendedAction = 'Review the sender address carefully and do not enter account credentials.';
    }
  }

  const previewSnippet = text.length > 80 ? `${text.slice(0, 77)}...` : text;

  return {
    inputType: type,
    inputPreview: previewSnippet,
    status,
    statusTitle,
    primaryReason,
    recommendedAction,
    isHeuristic: true,
    completedChecks,
    flaggedIndicators,
    extractedUrls,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}
