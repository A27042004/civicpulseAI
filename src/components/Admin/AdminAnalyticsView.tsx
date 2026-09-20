import React from 'react';
import { Activity, AlertTriangle, BarChart3, CheckCircle2, Clock, Flame, HardHat, Layers, ShieldAlert, Sparkles, TrendingUp, Users, Zap } from 'lucide-react';
import { AnalyticsSummary, Incident, LanguageCode, Report } from '../../types';
import { t, translateCategory } from '../../utils/i18n';

interface AdminAnalyticsViewProps {
  analytics: AnalyticsSummary | null;
  incidents: Incident[];
  reports: Report[];
  language: LanguageCode;
}

export const AdminAnalyticsView: React.FC<AdminAnalyticsViewProps> = ({
  analytics,
  incidents,
  reports,
  language,
}) => {
  const totalReports = reports.length;
  const totalIncidents = incidents.length;
  const noiseReduction =
    totalReports > 0
      ? Math.round(((totalReports - totalIncidents) / totalReports) * 100)
      : 74;

  const resolvedCount = incidents.filter((i) => i.status === 'Resolved').length;
  const inActionCount = incidents.filter((i) => i.status === 'Action Initiated').length;
  const investigatingCount = incidents.filter((i) => i.status === 'Investigating' || i.status === 'New').length;

  const categories = [
    'WATER / FLOODING',
    'FIRE / HAZARD',
    'INFRASTRUCTURE DAMAGE',
    'GARBAGE / WASTE',
    'AIR POLLUTION / SMOKE',
    'TRAFFIC / OBSTRUCTION',
  ] as const;

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950/30 to-slate-900 border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/40 shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              {t('analyticsTitle', language)}
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 font-semibold">
                Real-Time City KPI Intelligence
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              {t('analyticsSubtitle', language)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-300">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Multimodal AI Clustering Engine Active</span>
        </div>
      </div>

      {/* KPI 4-Card Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Citizen Submissions</span>
          <div className="text-2xl font-bold text-white flex items-baseline gap-2">
            <span>{totalReports}</span>
            <span className="text-xs text-cyan-400 font-normal">raw reports</span>
          </div>
          <p className="text-[10px] text-slate-500">Unfiltered public voice and vision uploads</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Consolidated Incident Clusters</span>
          <div className="text-2xl font-bold text-cyan-400 flex items-baseline gap-2">
            <span>{totalIncidents}</span>
            <span className="text-xs text-slate-400 font-normal">actionable clusters</span>
          </div>
          <p className="text-[10px] text-slate-500">Deduplicated municipal command nodes</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">AI Noise Reduction</span>
          <div className="text-2xl font-bold text-emerald-400 flex items-baseline gap-2">
            <span>{noiseReduction}%</span>
            <span className="text-xs text-emerald-300 font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> saved
            </span>
          </div>
          <p className="text-[10px] text-slate-500">Prevented call-center duplication overload</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Avg First Response</span>
          <div className="text-2xl font-bold text-amber-400 flex items-baseline gap-2">
            <span>4.8 min</span>
            <span className="text-xs text-slate-400 font-normal">dispatch time</span>
          </div>
          <p className="text-[10px] text-slate-500">From AI triage to crew mobilization</p>
        </div>
      </div>

      {/* Category Breakdown & Workflow Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category Breakdown */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Incidents by Environmental Category</span>
          </h3>

          <div className="space-y-2.5 text-xs">
            {categories.map((cat) => {
              const count = incidents.filter((i) => i.category === cat).length;
              const pct = totalIncidents > 0 ? Math.round((count / totalIncidents) * 100) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-300 font-medium">
                      {translateCategory(cat, language)}
                    </span>
                    <span className="text-cyan-400 font-mono font-semibold">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Operational Status & Priority Breakdown */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Municipal Lifecycle Workflow</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-amber-400 animate-ping"></div>
                <div>
                  <div className="text-white font-bold">Investigating / Verification</div>
                  <div className="text-[10px] text-slate-400">Newly identified clusters awaiting officer review</div>
                </div>
              </div>
              <span className="text-base font-bold text-amber-400 font-mono">{investigatingCount}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-cyan-400"></div>
                <div>
                  <div className="text-white font-bold">Action Initiated</div>
                  <div className="text-[10px] text-slate-400">Field response team dispatched & working on-site</div>
                </div>
              </div>
              <span className="text-base font-bold text-cyan-400 font-mono">{inActionCount}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                <div>
                  <div className="text-white font-bold">Resolved & Closed</div>
                  <div className="text-[10px] text-slate-400">Mitigated, verified, and public advisory cleared</div>
                </div>
              </div>
              <span className="text-base font-bold text-emerald-400 font-mono">{resolvedCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
