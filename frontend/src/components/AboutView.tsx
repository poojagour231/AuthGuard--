import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  EyeOff,
  FileText,
  Globe,
  HelpCircle,
  Info,
  Lock,
  Search,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { ActiveNavTab } from '../types/security';
import { AuthGuardLogo } from './AuthGuardLogo';

interface AboutViewProps {
  onNavigateTab: (tab: ActiveNavTab) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({
  onNavigateTab,
}) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* 1. Header Hero Card */}
      <div className="bg-white rounded-2xl border border-[#e5eeff] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <AuthGuardLogo size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0b1c30]">
                  AuthGuard
                </h1>
                <span className="text-[11px] font-semibold text-[#00288e] bg-[#eff4ff] border border-[#c8dbff] px-2 py-0.5 rounded-full">
                  v2.4.0
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#565e74] mt-0.5">
                Website Security & Authentication Risk Inspector
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigateTab('dashboard')}
              className="px-4 py-2 rounded-xl bg-[#00288e] hover:bg-[#1e40af] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Go to Dashboard</span>
            </button>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-[#f0f4ff] text-xs sm:text-sm text-[#444653] leading-relaxed">
          AuthGuard is designed to help users evaluate potentially suspicious websites, verify authentication and login forms, and detect deceptive techniques before sensitive credentials or personal details are entered.
        </div>
      </div>

      {/* 2. Core Privacy & Security Principles */}
      <div className="bg-white rounded-2xl border border-[#e5eeff] p-5 sm:p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-[#0b1c30] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#00288e]" />
            <span>Core Principles & Privacy</span>
          </h2>
          <p className="text-xs text-[#565e74] mt-0.5">
            How AuthGuard protects your safety without compromising your privacy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <div className="p-4 rounded-xl bg-[#f8f9ff] border border-[#e5eeff] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#eff4ff] border border-[#dce9ff] flex items-center justify-center text-[#00288e]">
              <EyeOff className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-[#0b1c30]">
              Zero Credential Collection
            </h3>
            <p className="text-[11px] text-[#565e74] leading-relaxed">
              AuthGuard never stores, logs, or transmits passwords, OTPs, credit cards, email content, or personal identifiers. All checks run transparently.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#f8f9ff] border border-[#e5eeff] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#eff4ff] border border-[#dce9ff] flex items-center justify-center text-[#00288e]">
              <Shield className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-[#0b1c30]">
              Honest Detections
            </h3>
            <p className="text-[11px] text-[#565e74] leading-relaxed">
              We never fabricate results or claim 100% safety. Checks that cannot be verified locally are explicitly labeled as <span className="font-semibold text-[#0b1c30]">Not Checked</span>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#f8f9ff] border border-[#e5eeff] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#eff4ff] border border-[#dce9ff] flex items-center justify-center text-[#00288e]">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-[#0b1c30]">
              No Background Spying
            </h3>
            <p className="text-[11px] text-[#565e74] leading-relaxed">
              No automatic browser-wide surveillance. Scans and security checks occur only on-demand when you explicitly submit a URL or request a check.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Security Checks & Methodology */}
      <div className="bg-white rounded-2xl border border-[#e5eeff] p-5 sm:p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-[#0b1c30] flex items-center gap-2">
            <Search className="w-4 h-4 text-[#00288e]" />
            <span>Inspection Methodology</span>
          </h2>
          <p className="text-xs text-[#565e74] mt-0.5">
            The security dimensions evaluated during website inspections.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl border border-[#e5eeff] bg-white flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#ecfdf5] border border-[#a7f3d0] flex items-center justify-center text-[#059669] shrink-0 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="font-semibold text-[#0b1c30]">Protocol & Transport Encryption</div>
              <div className="text-[11px] text-[#565e74] mt-0.5">
                Verifies standard HTTPS / TLS encryption to protect submitted authentication data from cleartext interception.
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-[#e5eeff] bg-white flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#ecfdf5] border border-[#a7f3d0] flex items-center justify-center text-[#059669] shrink-0 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="font-semibold text-[#0b1c30]">Brand & Homograph Heuristics</div>
              <div className="text-[11px] text-[#565e74] mt-0.5">
                Detects typosquatting, character substitutions, and deceptive domain names mimicking financial institutions and services.
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-[#e5eeff] bg-white flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#ecfdf5] border border-[#a7f3d0] flex items-center justify-center text-[#059669] shrink-0 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="font-semibold text-[#0b1c30]">TLD & IP Hostname Analysis</div>
              <div className="text-[11px] text-[#565e74] mt-0.5">
                Flags raw numerical IP addresses used as hosts and top-level domains frequently abused in disposable phishing campaigns.
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-[#e5eeff] bg-white flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#eff4ff] border border-[#c8dbff] flex items-center justify-center text-[#00288e] shrink-0 mt-0.5">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="font-semibold text-[#0b1c30]">User Safe List Management</div>
              <div className="text-[11px] text-[#565e74] mt-0.5">
                Allows organizations and individuals to manage verified trusted domains locally in settings with automatic scoring adjustments.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Technical System Information Table */}
      <div className="bg-white rounded-2xl border border-[#e5eeff] p-5 sm:p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-[#0b1c30] flex items-center gap-2">
            <Server className="w-4 h-4 text-[#00288e]" />
            <span>System Information</span>
          </h2>
          <p className="text-xs text-[#565e74] mt-0.5">
            Current build details and operational configuration.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-[#e5eeff] rounded-xl overflow-hidden">
            <tbody className="divide-y divide-[#e5eeff]">
              <tr className="bg-[#f8f9ff]">
                <td className="px-4 py-2.5 font-semibold text-[#565e74] w-48">Product Name</td>
                <td className="px-4 py-2.5 text-[#0b1c30] font-medium">AuthGuard</td>
              </tr>
              <tr className="bg-white">
                <td className="px-4 py-2.5 font-semibold text-[#565e74]">Version</td>
                <td className="px-4 py-2.5 text-[#0b1c30] font-mono">2.4.0 (Stable)</td>
              </tr>
              <tr className="bg-[#f8f9ff]">
                <td className="px-4 py-2.5 font-semibold text-[#565e74]">Inspection Engine</td>
                <td className="px-4 py-2.5 text-[#0b1c30]">Client-Side Heuristic & Policy Inspector</td>
              </tr>
              <tr className="bg-white">
                <td className="px-4 py-2.5 font-semibold text-[#565e74]">Data Persistence</td>
                <td className="px-4 py-2.5 text-[#0b1c30]">Browser Local Storage (Never sent off-device)</td>
              </tr>
              <tr className="bg-[#f8f9ff]">
                <td className="px-4 py-2.5 font-semibold text-[#565e74]">Threat Feed Integration</td>
                <td className="px-4 py-2.5 text-[#565e74] italic">
                  Local heuristic baseline (External threat intelligence feeds configurable in Settings)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
