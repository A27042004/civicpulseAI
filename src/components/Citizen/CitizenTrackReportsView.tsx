import React, { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, Clock, ExternalLink, Eye, FileText, Layers, MapPin, Plus, ShieldCheck, Sparkles } from 'lucide-react';
import { Incident, LanguageCode, Report } from '../../types';
import { t, translateCategory, translateStatus } from '../../utils/i18n';

interface CitizenTrackReportsViewProps {
  reports: Report[];
  incidents: Incident[];
  language: LanguageCode;
  onOpenReportModal: () => void;
  onSelectIncident: (incident: Incident) => void;
}

export const CitizenTrackReportsView: React.FC<CitizenTrackReportsViewProps> = ({
  reports,
  incidents,
  language,
  onOpenReportModal,
  onSelectIncident,
}) => {
  const [trackedReportIds, setTrackedReportIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('civicpulse_my_reports') || '[]');
      if (Array.isArray(saved) && saved.length > 0) {
        setTrackedReportIds(saved);
      } else {
        // Pre-populate with first 3 reports so user immediately sees how tracking works!
        const defaultIds = reports.slice(0, 3).map((r) => r.id);
        setTrackedReportIds(defaultIds);
      }
    } catch {
      setTrackedReportIds(reports.slice(0, 3).map((r) => r.id));
    }
  }, [reports]);

  // Find matching report objects
  const trackedReports = reports.filter((r) => trackedReportIds.includes(r.id));

  // Determine the 4-stage progress step
  const getStageStep = (report: Report, matchedIncident?: Incident) => {
    if (!matchedIncident) return 2; // Analyzed
    if (matchedIncident.status === 'Resolved') return 4; // Resolved
    if (matchedIncident.status === 'Action Initiated' || matchedIncident.status === 'Investigating' || matchedIncident.status === 'Verified') {
      return 3; // Action initiated
    }
    return 2; // Clustered
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950/30 to-slate-900 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              {t('trackTitle', language)}
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold">
                {trackedReports.length} Tracked
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              {t('trackSubtitle', language)}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenReportModal}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md shadow-cyan-600/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{t('reportIncident', language)}</span>
        </button>
      </div>

      {/* Reports List */}
      {trackedReports.length === 0 ? (
        <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
          <Layers className="w-10 h-10 text-cyan-400 mx-auto" />
          <h3 className="text-base font-semibold text-white">No Reports Submitted Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {t('noTrackedReports', language)}
          </p>
          <button
            onClick={onOpenReportModal}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md"
          >
            {t('reportIncident', language)}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {trackedReports.map((report) => {
            const matchedIncident = incidents.find(
              (i) => i.id === report.incidentId || i.supportingReportIds.includes(report.id)
            );
            const currentStep = getStageStep(report, matchedIncident);

            return (
              <div
                key={report.id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-sm"
              >
                {/* Header: ID, Category, Time */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-cyan-400">
                      #{report.id}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200">
                      {translateCategory(report.category, language)}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {matchedIncident && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Cluster Status:</span>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                        {translateStatus(matchedIncident.status, language)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Body: Photo & Description */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {report.imageUrl && (
                    <div className="w-full sm:w-24 h-24 rounded-xl overflow-hidden bg-black shrink-0 border border-slate-800">
                      <img
                        src={report.imageUrl}
                        alt="Citizen Evidence"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 space-y-1.5">
                    <div className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{report.locationName}</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed font-sans">
                      {report.description}
                    </p>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-1">
                      <span className="flex items-center gap-1 text-cyan-300">
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        AI Summary: {report.aiSummary || report.subtype}
                      </span>
                      <span>•</span>
                      <span className="font-mono text-slate-400">Confidence: {report.aiConfidence}%</span>
                    </div>
                  </div>
                </div>

                {/* 4-Stage Visual Progress Bar */}
                <div className="pt-2">
                  <div className="grid grid-cols-4 gap-2 text-center text-[10px] sm:text-xs">
                    {/* 1. Submitted */}
                    <div className="space-y-1">
                      <div className="h-1.5 w-full rounded-full bg-emerald-500"></div>
                      <div className="font-semibold text-emerald-400 flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{t('stageSubmitted', language)}</span>
                      </div>
                    </div>

                    {/* 2. AI Analyzed */}
                    <div className="space-y-1">
                      <div className={`h-1.5 w-full rounded-full ${currentStep >= 2 ? 'bg-emerald-500' : 'bg-slate-800'}`}></div>
                      <div className={`font-semibold flex items-center justify-center gap-1 ${currentStep >= 2 ? 'text-emerald-400' : 'text-slate-500'}`}>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{t('stageAnalyzed', language)}</span>
                      </div>
                    </div>

                    {/* 3. Clustered */}
                    <div className="space-y-1">
                      <div className={`h-1.5 w-full rounded-full ${currentStep >= 2 ? 'bg-cyan-500' : 'bg-slate-800'}`}></div>
                      <div className={`font-semibold flex items-center justify-center gap-1 ${currentStep >= 2 ? 'text-cyan-400' : 'text-slate-500'}`}>
                        <Layers className="w-3 h-3" />
                        <span>{t('stageClustered', language)}</span>
                      </div>
                    </div>

                    {/* 4. Action / Resolved */}
                    <div className="space-y-1">
                      <div className={`h-1.5 w-full rounded-full ${currentStep >= 4 ? 'bg-emerald-500' : currentStep === 3 ? 'bg-amber-500 animate-pulse' : 'bg-slate-800'}`}></div>
                      <div className={`font-semibold flex items-center justify-center gap-1 ${currentStep >= 4 ? 'text-emerald-400' : currentStep === 3 ? 'text-amber-400' : 'text-slate-500'}`}>
                        <ShieldCheck className="w-3 h-3" />
                        <span>{currentStep >= 4 ? t('stageResolved', language) : t('stageAction', language)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Linked Master Incident Action */}
                {matchedIncident && (
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="text-[11px] text-slate-400">Merged into Consolidated City Incident:</div>
                      <div className="text-xs font-bold text-white">
                        #{matchedIncident.id}: {matchedIncident.title}
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectIncident(matchedIncident)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-medium transition-colors cursor-pointer self-start sm:self-auto"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Live Incident & Map</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
