import React from 'react';
import { Activity, AlertTriangle, BarChart3, CheckCircle2, Droplets, Flame, HardHat, Layers, Radio, Shield, Sparkles, TrendingUp, Users, Wind, X } from 'lucide-react';
import { AnalyticsSummary } from '../../types';

interface AnalyticsModalProps {
  analytics: AnalyticsSummary;
  onClose: () => void;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  analytics,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/95 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base sm:text-lg">
                Urban Incident Intelligence & Consolidation Analytics
              </h2>
              <p className="text-[11px] text-slate-400">
                Quantitative impact of spatial-temporal clustering and AI deduplication on city operations.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-slate-300">
          {/* Top 4 KPI Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
              <span className="text-[11px] text-slate-400 block font-medium">Total Citizen Reports</span>
              <span className="text-2xl font-black text-white mt-1 block">
                {analytics.totalReports}
              </span>
              <span className="text-[10px] text-cyan-400">Incoming raw signals</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
              <span className="text-[11px] text-slate-400 block font-medium">Consolidated Incidents</span>
              <span className="text-2xl font-black text-cyan-300 mt-1 block">
                {analytics.totalIncidents}
              </span>
              <span className="text-[10px] text-slate-400">Actionable intelligence units</span>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-800/60">
              <span className="text-[11px] text-emerald-300 block font-medium">Noise Reduction</span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block">
                +{analytics.consolidatedSavingsPercentage}%
              </span>
              <span className="text-[10px] text-emerald-500/90">Duplicate clutter filtered</span>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-rose-950/40 to-slate-900 border border-rose-800/60">
              <span className="text-[11px] text-rose-300 block font-medium">Emerging Threats</span>
              <span className="text-2xl font-black text-rose-400 mt-1 block">
                {analytics.emergingIncidentsCount}
              </span>
              <span className="text-[10px] text-rose-400/90">High report velocity detected</span>
            </div>
          </div>

          {/* Consolidation Efficiency Visual */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/70 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Signal-to-Noise Compression Ratio
              </span>
              <span className="font-mono text-cyan-300">
                {analytics.totalReports} Reports → {analytics.totalIncidents} Incidents
              </span>
            </div>

            <div className="w-full bg-slate-900 h-3.5 rounded-full overflow-hidden flex border border-slate-700">
              <div
                style={{ width: `${100 - analytics.consolidatedSavingsPercentage}%` }}
                className="bg-cyan-500 h-full"
                title="Consolidated Incidents"
              />
              <div
                style={{ width: `${analytics.consolidatedSavingsPercentage}%` }}
                className="bg-emerald-500/80 h-full"
                title="Filtered Duplicates & Noise"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
                <span>Active Clustered Incidents ({100 - analytics.consolidatedSavingsPercentage}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Consolidated Noise Saved ({analytics.consolidatedSavingsPercentage}%)</span>
              </div>
            </div>
          </div>

          {/* Incident Breakdown by Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
              <h3 className="font-bold text-white text-xs">Incident Distribution by Category</h3>

              <div className="space-y-2">
                {analytics.categoryBreakdown.map((cat) => (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-300">{cat.category}</span>
                      <span className="font-mono text-slate-400">
                        {cat.count} ({cat.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${cat.percentage}%` }}
                        className="bg-cyan-500 h-full rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Severity Distribution */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
              <h3 className="font-bold text-white text-xs">Incident Severity Distribution</h3>

              <div className="space-y-2">
                {analytics.severityBreakdown.map((sev) => {
                  const colors: Record<number, string> = {
                    1: 'bg-emerald-500',
                    2: 'bg-blue-500',
                    3: 'bg-amber-500',
                    4: 'bg-orange-500',
                    5: 'bg-rose-500',
                  };

                  const percentage =
                    analytics.totalIncidents > 0
                      ? Math.round((sev.count / analytics.totalIncidents) * 100)
                      : 0;

                  return (
                    <div key={sev.severity} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-300">
                          Level {sev.severity}: {sev.label}
                        </span>
                        <span className="font-mono text-slate-400">
                          {sev.count} incidents ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${percentage}%` }}
                          className={`${colors[sev.severity]} h-full rounded-full`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Operational Status Breakdown */}
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
            <h3 className="font-bold text-white text-xs">Municipal Response Status Breakdown</h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {analytics.statusBreakdown.map((st) => (
                <div key={st.status} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block truncate">{st.status}</span>
                  <span className="text-lg font-bold text-white mt-0.5 block">{st.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/95 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
          >
            Close Analytics
          </button>
        </div>
      </div>
    </div>
  );
};
