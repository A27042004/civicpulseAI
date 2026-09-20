import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, ChevronRight, Clock, Eye, Filter, Layers, MapPin, Search, ShieldAlert, Sparkles, Trash2, User, XCircle } from 'lucide-react';
import { api } from '../../services/apiService';
import { Incident, LanguageCode, Report } from '../../types';
import { t, translateCategory } from '../../utils/i18n';

interface AdminInspectReportsViewProps {
  reports: Report[];
  incidents: Incident[];
  language: LanguageCode;
  onRefreshData: () => void;
  onSelectIncident: (incident: Incident) => void;
}

export const AdminInspectReportsView: React.FC<AdminInspectReportsViewProps> = ({
  reports,
  incidents,
  language,
  onRefreshData,
  onSelectIncident,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'clustered' | 'pending' | 'dismissed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dismissingId, setDismissingId] = useState<string | null>(null);

  const filteredReports = reports.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = `${r.id} ${r.description} ${r.locationName} ${r.userName || ''} ${r.subtype}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  const handleDismissReport = async (reportId: string) => {
    if (!confirm(`Dismiss report #${reportId} as false alarm or duplicate?`)) return;
    setDismissingId(reportId);
    try {
      await api.dismissReport(reportId);
      onRefreshData();
    } catch (err) {
      console.error(err);
    } finally {
      setDismissingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              {t('inspectTitle', language)}
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold">
                {reports.length} Total Submissions
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              {t('inspectSubtitle', language)}
            </p>
          </div>
        </div>

        {/* Quick Triage Counts */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
            {reports.filter((r) => r.status === 'clustered').length} Clustered
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 font-medium">
            {reports.filter((r) => r.status === 'pending').length} Pending
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 font-medium">
            {reports.filter((r) => r.status === 'dismissed').length} Dismissed
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row gap-2.5 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by report ID, street, citizen..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Triage Statuses</option>
            <option value="clustered">Clustered</option>
            <option value="pending">Pending Triage</option>
            <option value="dismissed">Dismissed</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Categories</option>
            <option value="WATER / FLOODING">Water / Flooding</option>
            <option value="FIRE / HAZARD">Fire / Hazard</option>
            <option value="GARBAGE / WASTE">Garbage / Waste</option>
            <option value="INFRASTRUCTURE DAMAGE">Infrastructure</option>
            <option value="TRAFFIC / OBSTRUCTION">Traffic / Obstruction</option>
          </select>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredReports.map((report) => {
          const matchedIncident = incidents.find(
            (i) => i.id === report.incidentId || i.supportingReportIds.includes(report.id)
          );

          const isDismissed = report.status === 'dismissed';

          return (
            <div
              key={report.id}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                isDismissed
                  ? 'bg-slate-900/50 border-slate-800 opacity-60'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header: ID, Badge, Timestamp */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-400">
                      #{report.id}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded font-medium bg-slate-800 text-slate-300 border border-slate-700">
                      {translateCategory(report.category, language)}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Main Content */}
                <div className="flex gap-3">
                  {report.imageUrl && (
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-black shrink-0 border border-slate-800">
                      <img
                        src={report.imageUrl}
                        alt="Citizen Upload"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex-1 space-y-1">
                    <p className="text-xs text-slate-200 leading-relaxed font-sans line-clamp-3">
                      "{report.description}"
                    </p>

                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span className="truncate">{report.locationName}</span>
                    </div>

                    <div className="text-[10px] text-slate-400 flex items-center gap-2 pt-0.5">
                      <span className="flex items-center gap-1 text-slate-300">
                        <User className="w-3 h-3 text-slate-500" />
                        {report.userName || 'Citizen Observer'}
                      </span>
                      <span>•</span>
                      <span className="font-mono text-cyan-300">AI Conf: {report.aiConfidence}%</span>
                      <span>•</span>
                      <span className="font-mono text-amber-300">Severity: {report.severity}/5</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer / Cluster Link & Triage Buttons */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                {matchedIncident ? (
                  <button
                    onClick={() => onSelectIncident(matchedIncident)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                  >
                    <Layers className="w-3 h-3" />
                    <span>Linked to Cluster #{matchedIncident.id}</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                ) : (
                  <span className="text-[11px] text-amber-400 font-medium">
                    Orphan / Unclustered
                  </span>
                )}

                <div className="flex items-center gap-1.5">
                  {!isDismissed && (
                    <button
                      onClick={() => handleDismissReport(report.id)}
                      disabled={dismissingId === report.id}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      {dismissingId === report.id ? 'Dismissing...' : 'Dismiss'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
