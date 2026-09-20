import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, ArrowRight, CheckCircle2, ChevronRight, Compass, Info, MapPin, Navigation, Phone, ShieldAlert, Sparkles, Volume2 } from 'lucide-react';
import { Incident, LanguageCode } from '../../types';
import { t, translateCategory, translateSeverity } from '../../utils/i18n';

interface CitizenNearbyAlertsViewProps {
  incidents: Incident[];
  language: LanguageCode;
  onSelectIncident: (incident: Incident) => void;
  onNavigateToMap: () => void;
}

export const CitizenNearbyAlertsView: React.FC<CitizenNearbyAlertsViewProps> = ({
  incidents,
  language,
  onSelectIncident,
  onNavigateToMap,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  // Find all incidents that have active public warnings or critical priority
  const alertIncidents = incidents.filter(
    (inc) => inc.publicWarning || inc.priorityScore >= 70 || inc.isEmerging
  );

  const filteredAlerts = alertIncidents.filter((inc) => {
    if (filterCategory === 'ALL') return true;
    return inc.category === filterCategory;
  });

  const speakAlert = (headline: string, text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`${headline}. ${text}`);
    utterance.lang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 shrink-0">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              {t('alertsTitle', language)}
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold">
                {alertIncidents.length} Active
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              {t('alertsSubtitle', language)}
            </p>
          </div>
        </div>

        {/* Emergency Helplines Pill */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 shrink-0">
          <Phone className="w-4 h-4 text-rose-400" />
          <div>
            <div className="text-[10px] text-slate-400 font-medium">{t('emergencyHelpline', language)}</div>
            <div className="text-white font-mono font-bold flex gap-2">
              <span>Disaster: 1916</span>
              <span>•</span>
              <span>Police: 100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setFilterCategory('ALL')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer shrink-0 ${
            filterCategory === 'ALL'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
          }`}
        >
          {t('allCategories', language)} ({alertIncidents.length})
        </button>
        {['WATER / FLOODING', 'FIRE / HAZARD', 'INFRASTRUCTURE DAMAGE', 'TRAFFIC / OBSTRUCTION'].map(
          (cat) => {
            const count = alertIncidents.filter((i) => i.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer shrink-0 ${
                  filterCategory === cat
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                }`}
              >
                {translateCategory(cat as any, language)} ({count})
              </button>
            );
          }
        )}
      </div>

      {/* Alerts Feed */}
      {filteredAlerts.length === 0 ? (
        <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="text-base font-semibold text-white">{t('noAlerts', language)}</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Municipal sensors and corroborating citizen reports show no critical street inundations or hazard disruptions currently.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAlerts.map((incident) => {
            const warning = incident.publicWarning || {
              headline: `Public Safety Alert: ${incident.title}`,
              message: `High risk incident detected at ${incident.locationName}. Priority Score ${incident.priorityScore}/100 based on ${incident.reportCount} citizen reports.`,
              recommendedAction: 'Avoid affected corridor. Use parallel arterial roads or public transit detours.',
              affectedRoute: incident.locationName,
              severity: incident.priorityScore >= 80 ? 'Critical' : 'High',
            };

            const isCritical = warning.severity === 'Critical' || incident.priorityScore >= 80;

            return (
              <div
                key={incident.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                  isCritical
                    ? 'bg-gradient-to-b from-rose-950/50 to-slate-900 border-rose-500/50 shadow-lg shadow-rose-950/30'
                    : 'bg-slate-900/80 border-amber-500/40'
                }`}
              >
                <div>
                  {/* Alert Tag & Priority */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isCritical
                          ? 'bg-rose-500 text-white animate-pulse'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {warning.severity.toUpperCase()} ADVISORY
                    </span>

                    <span className="text-xs font-mono text-cyan-400 font-semibold">
                      #{incident.id} • {translateCategory(incident.category, language)}
                    </span>
                  </div>

                  {/* Headline & Audio Listen */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug">
                      {warning.headline}
                    </h3>
                    <button
                      onClick={() => speakAlert(warning.headline, warning.message)}
                      title="Listen Alert"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 shrink-0 cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4 text-cyan-400" />
                    </button>
                  </div>

                  {/* Message */}
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    {warning.message}
                  </p>

                  {/* Recommended Detour Box */}
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                      <Navigation className="w-3.5 h-3.5" />
                      <span>{t('detourAdvice', language)}</span>
                    </div>
                    <p className="text-xs text-slate-200">
                      {warning.recommendedAction}
                    </p>
                    {warning.affectedRoute && (
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 pt-0.5">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>Affected Route: <strong className="text-slate-200">{warning.affectedRoute}</strong></span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div className="text-slate-400 text-[11px]">
                    Corroborated by <span className="font-semibold text-cyan-300">{incident.reportCount} reports</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectIncident(incident)}
                      className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
                    >
                      <span>{t('viewDetails', language)}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
