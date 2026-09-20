import React from 'react';
import { AlertTriangle, ArrowRight, Flame, Radio, ShieldAlert, Users } from 'lucide-react';
import { Incident, LanguageCode } from '../types';
import { t } from '../utils/i18n';

interface EmergingBannerProps {
  emergingIncidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
  language?: LanguageCode;
}

export const EmergingBanner: React.FC<EmergingBannerProps> = ({
  emergingIncidents,
  onSelectIncident,
  language = 'en',
}) => {
  if (emergingIncidents.length === 0) return null;

  const topIncident = emergingIncidents[0];

  return (
    <div className="bg-gradient-to-r from-rose-950/80 via-slate-900 to-amber-950/70 border-b border-rose-500/40 px-4 py-2.5 shadow-lg relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-96 h-full bg-rose-500/10 blur-2xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-rose-600/30 border border-rose-500/60 text-rose-300 shrink-0">
            <Radio className="w-4 h-4 animate-pulse text-rose-400" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold uppercase tracking-wider text-rose-400 bg-rose-950/90 px-2 py-0.5 rounded border border-rose-800/80 flex items-center gap-1 text-[11px]">
                <Flame className="w-3 h-3 text-rose-400" />
                {t('emergingBannerTitle', language)}
              </span>
              <span className="font-semibold text-white text-sm">
                #{topIncident.id}: {topIncident.title}
              </span>
              <span className="text-amber-400 font-medium px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/60 text-[11px]">
                {topIncident.growthRate}
              </span>
            </div>

            <p className="text-slate-300 text-xs mt-0.5 line-clamp-1">
              <strong className="text-cyan-300">{topIncident.reportCount} citizen reports</strong> consolidated into 1 incident cluster near {topIncident.locationName}. Priority Score: <strong className="text-rose-400">{topIncident.priorityScore}/100</strong> (Estimated Impact: {(topIncident.impactRadiusMeters / 1000).toFixed(1)} km radius).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          <button
            onClick={() => onSelectIncident(topIncident)}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold px-3 py-1.5 rounded-lg shadow transition-all cursor-pointer text-xs"
          >
            <span>{t('inspectIncident', language)}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
