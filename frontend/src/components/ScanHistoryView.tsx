import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Download,
  Globe,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import {
  ActiveNavTab,
  RiskLevel,
  ScanHistoryRecord,
  ScenarioId,
} from '../types/security';

interface ScanHistoryViewProps {
  historyRecords: ScanHistoryRecord[];
  onClearHistory: () => void;
  onRestoreHistory?: () => void;
  onInspectDomainReport: (scenarioId: ScenarioId) => void;
  onInspectDomainPopup?: (scenarioId: ScenarioId) => void;
  onNavigateTab: (tab: ActiveNavTab) => void;
  onTriggerToast: (message: string) => void;
}

export const ScanHistoryView: React.FC<ScanHistoryViewProps> = ({
  historyRecords,
  onClearHistory,
  onInspectDomainReport,
  onNavigateTab,
  onTriggerToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<'ALL' | RiskLevel>('ALL');
  const [confirmClear, setConfirmClear] = useState(false);

  const filteredRecords = useMemo(() => {
    return historyRecords.filter((rec) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        rec.domain.toLowerCase().includes(q) ||
        rec.fullUrl.toLowerCase().includes(q) ||
        rec.vectors.some((v) => v.toLowerCase().includes(q));

      const matchesRisk =
        riskFilter === 'ALL' || rec.riskLevel === riskFilter;

      return matchesSearch && matchesRisk;
    });
  }, [historyRecords, searchQuery, riskFilter]);

  const handleExportCsv = () => {
    if (filteredRecords.length === 0) {
      onTriggerToast('No scan history records to export');
      return;
    }
    const headers = ['Domain', 'Full URL', 'Risk Level', 'Score', 'Timestamp'];
    const rows = filteredRecords.map((r) => [
      `"${r.domain}"`,
      `"${r.fullUrl}"`,
      r.riskLevel,
      r.score,
      `"${r.timestamp}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'authguard_scan_history.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onTriggerToast(`Exported ${filteredRecords.length} scan records`);
  };

  const getStatusBadge = (risk: RiskLevel) => {
    switch (risk) {
      case 'LOW':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
            <span>Low Risk</span>
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#fffbeb] text-[#92400e] border border-[#fde68a]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
            <span>Suspicious</span>
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#fef2f2] text-[#991b1b] border border-[#fecaca]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#dc2626]" />
            <span>High Risk</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#f3f4f6] text-[#4b5563] border border-[#e5e7eb]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9ca3af]" />
            <span>Unable to Check</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 box-border">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0b1c30]">
            Scan History
          </h1>
          <p className="text-xs sm:text-sm text-[#565e74] mt-0.5">
            Websites you have evaluated. Select any scan to open its security report.
          </p>
        </div>

        {historyRecords.length > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3 py-1.5 rounded-lg border border-[#dce9ff] bg-white hover:bg-[#f8faff] text-xs font-medium text-[#0b1c30] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#565e74]" />
              <span>Export CSV</span>
            </button>

            {confirmClear ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onClearHistory();
                    setConfirmClear(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#ba1a1a] text-white text-xs font-medium hover:bg-[#991b1b] transition-colors cursor-pointer"
                >
                  Confirm Clear
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="px-2.5 py-1.5 rounded-lg border border-[#dce9ff] text-xs text-[#565e74] hover:bg-[#f8faff] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="px-3 py-1.5 rounded-lg border border-[#fecaca] text-[#ba1a1a] hover:bg-[#fef2f2] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      {historyRecords.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#e5eeff]">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#757684]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by domain..."
              aria-label="Filter scan history"
              className="w-full pl-9 pr-3 py-1.5 text-xs text-[#0b1c30] placeholder:text-[#757684] bg-transparent outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#757684] hover:text-[#0b1c30]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto shrink-0 pb-1 sm:pb-0">
            {(['ALL', 'LOW', 'MEDIUM', 'HIGH'] as const).map((filter) => {
              const label =
                filter === 'ALL'
                  ? 'All'
                  : filter === 'LOW'
                  ? 'Low Risk'
                  : filter === 'MEDIUM'
                  ? 'Suspicious'
                  : 'High Risk';
              const active = riskFilter === filter;

              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setRiskFilter(filter)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-[#00288e] text-white'
                      : 'bg-[#f0f4ff] text-[#444653] hover:bg-[#e5eeff]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Scans List / Empty State */}
      {filteredRecords.length === 0 ? (
        <div className="py-12 px-4 text-center rounded-2xl bg-white border border-[#e5eeff] space-y-3">
          <Globe className="w-10 h-10 text-[#757684] mx-auto opacity-60" />
          <h2 className="text-base font-semibold text-[#0b1c30]">
            {historyRecords.length === 0
              ? 'No scan history yet'
              : 'No matching website scans found'}
          </h2>
          <p className="text-xs text-[#565e74] max-w-sm mx-auto">
            {historyRecords.length === 0
              ? 'Websites you scan will appear here so you can review their safety records at any time.'
              : 'Try clearing your filter or searching for a different website name.'}
          </p>
          {historyRecords.length === 0 && (
            <button
              type="button"
              onClick={() => onNavigateTab('dashboard')}
              className="mt-2 px-4 py-2 rounded-xl bg-[#00288e] text-white text-xs font-semibold hover:bg-[#1e40af] transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>Scan a Website</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#e5eeff] divide-y divide-[#f0f4ff] overflow-hidden shadow-xs">
          {filteredRecords.map((scan) => (
            <div
              key={scan.id}
              onClick={() => onInspectDomainReport(scan.scenarioId)}
              className="p-4 hover:bg-[#f8faff] transition-colors flex items-center justify-between gap-3 cursor-pointer group min-w-0"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onInspectDomainReport(scan.scenarioId);
                }
              }}
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-xl bg-[#eff4ff] text-[#00288e] flex items-center justify-center shrink-0">
                  {scan.riskLevel === 'HIGH' ? (
                    <ShieldAlert className="w-4 h-4 text-[#ba1a1a]" />
                  ) : scan.riskLevel === 'MEDIUM' ? (
                    <AlertTriangle className="w-4 h-4 text-[#b45309]" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-[#166534]" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-[#0b1c30] group-hover:text-[#00288e] transition-colors truncate">
                      {scan.domain}
                    </span>
                    <span className="text-[11px] text-[#757684]">
                      {scan.timestamp}
                    </span>
                  </div>

                  <div className="text-xs text-[#565e74] truncate mt-0.5">
                    {scan.vectors && scan.vectors.length > 0
                      ? scan.vectors.join(' · ')
                      : scan.fullUrl}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {getStatusBadge(scan.riskLevel)}
                <div className="hidden sm:flex items-center gap-1 text-xs font-semibold text-[#00288e] group-hover:translate-x-0.5 transition-transform">
                  <span>Report</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
