import React, { useState } from 'react';
import { AlertCircle, ArrowRight, CheckCircle2, ChevronRight, Combine, Eye, Layers, MapPin, Merge, Sparkles } from 'lucide-react';
import { api } from '../../services/apiService';
import { Incident, LanguageCode } from '../../types';
import { t, translateCategory, translateSeverity, translateStatus } from '../../utils/i18n';

interface AdminMergeDuplicatesViewProps {
  incidents: Incident[];
  language: LanguageCode;
  onRefreshData: () => void;
  onSelectIncident: (incident: Incident) => void;
}

export const AdminMergeDuplicatesView: React.FC<AdminMergeDuplicatesViewProps> = ({
  incidents,
  language,
  onRefreshData,
  onSelectIncident,
}) => {
  const [primaryId, setPrimaryId] = useState<string>(incidents[0]?.id || '');
  const [secondaryId, setSecondaryId] = useState<string>(incidents[1]?.id || '');
  const [isMerging, setIsMerging] = useState(false);
  const [mergeSuccess, setMergeSuccess] = useState<string | null>(null);

  // Find candidate pairs with matching category or close coordinates
  const candidatePairs: { inc1: Incident; inc2: Incident; reason: string }[] = [];
  for (let i = 0; i < incidents.length; i++) {
    for (let j = i + 1; j < incidents.length; j++) {
      const inc1 = incidents[i];
      const inc2 = incidents[j];
      const latDiff = Math.abs(inc1.latitude - inc2.latitude);
      const lngDiff = Math.abs(inc1.longitude - inc2.longitude);

      if (inc1.category === inc2.category && latDiff < 0.04 && lngDiff < 0.04) {
        candidatePairs.push({
          inc1,
          inc2,
          reason: `Matching Category (${inc1.category}) within ~2.5km distance`,
        });
      }
    }
  }

  const primaryIncident = incidents.find((i) => i.id === primaryId);
  const secondaryIncident = incidents.find((i) => i.id === secondaryId);

  const handleMerge = async () => {
    if (!primaryId || !secondaryId || primaryId === secondaryId) {
      alert('Please select two distinct incidents to merge.');
      return;
    }

    setIsMerging(true);
    setMergeSuccess(null);
    try {
      const merged = await api.mergeIncidents(primaryId, secondaryId);
      setMergeSuccess(
        `Successfully merged #${secondaryId} into #${primaryId}! Combined reports: ${merged.reportCount}, New Priority: ${merged.priorityScore}/100.`
      );
      onRefreshData();
    } catch (err: any) {
      alert(`Merge failed: ${err.message}`);
    } finally {
      setIsMerging(false);
    }
  };

  const handleSelectPair = (pair: { inc1: Incident; inc2: Incident }) => {
    setPrimaryId(pair.inc1.id);
    setSecondaryId(pair.inc2.id);
    setMergeSuccess(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950/30 to-slate-900 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40 shrink-0">
            <Combine className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              {t('mergeTitle', language)}
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-semibold">
                AI Deduplication Engine
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              {t('mergeSubtitle', language)}
            </p>
          </div>
        </div>

        {candidatePairs.length > 0 && (
          <div className="px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-800 text-purple-300 text-xs font-semibold">
            {candidatePairs.length} Suspected Duplicate Pairs Detected
          </div>
        )}
      </div>

      {/* Suggested Duplicate Pairs Quick Selector */}
      {candidatePairs.length > 0 && (
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-400" />
            AI Suggested Duplicate Pairs for Immediate Consolidation:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {candidatePairs.slice(0, 4).map((pair, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectPair(pair)}
                className="p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition-colors cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span className="text-purple-300 font-mono">#{pair.inc1.id}</span>
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                    <span className="text-purple-300 font-mono">#{pair.inc2.id}</span>
                    <span className="text-[11px] text-slate-400">({pair.inc1.category})</span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">
                    {pair.reason}
                  </div>
                </div>
                <span className="text-[11px] text-cyan-400 font-semibold shrink-0 ml-2">
                  Load Pair
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Success Notification */}
      {mergeSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="flex-1 font-medium">{mergeSuccess}</span>
        </div>
      )}

      {/* Side-by-Side Merge Workstation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PRIMARY INCIDENT (Keep) */}
        <div className="p-4 rounded-2xl bg-slate-900 border-2 border-cyan-500/50 space-y-3 shadow-md">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold text-xs uppercase tracking-wider">
                Primary Incident (Target to Retain)
              </span>
            </div>
            <select
              value={primaryId}
              onChange={(e) => setPrimaryId(e.target.value)}
              className="bg-slate-800 text-white text-xs rounded-lg px-2.5 py-1 border border-slate-700 focus:outline-none"
            >
              {incidents.map((i) => (
                <option key={i.id} value={i.id} disabled={i.id === secondaryId}>
                  #{i.id} - {i.title.slice(0, 32)}...
                </option>
              ))}
            </select>
          </div>

          {primaryIncident ? (
            <div className="space-y-2.5 text-xs">
              <div>
                <h3 className="text-sm font-bold text-white">
                  #{primaryIncident.id}: {primaryIncident.title}
                </h3>
                <p className="text-slate-400 text-xs mt-1">
                  {primaryIncident.priorityBreakdown?.explanationText || primaryIncident.title}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-slate-300 text-[11px]">
                <div className="flex items-center justify-between">
                  <span>Category:</span>
                  <span className="font-semibold text-white">{primaryIncident.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Location:</span>
                  <span className="font-semibold text-white">{primaryIncident.locationName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Supporting Reports:</span>
                  <span className="font-bold text-cyan-400">{primaryIncident.reportCount} reports</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Priority Score:</span>
                  <span className="font-bold text-amber-400">{primaryIncident.priorityScore}/100</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Status:</span>
                  <span className="font-semibold text-emerald-400">{primaryIncident.status}</span>
                </div>
              </div>

              <button
                onClick={() => onSelectIncident(primaryIncident)}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Inspect on Live Map</span>
              </button>
            </div>
          ) : (
            <div className="p-6 text-center text-slate-500 text-xs">Select Primary Incident</div>
          )}
        </div>

        {/* SECONDARY INCIDENT (Merge into Primary & Remove) */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-purple-500/50 space-y-3 shadow-md">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold text-xs uppercase tracking-wider">
                Secondary Incident (To Be Merged & Removed)
              </span>
            </div>
            <select
              value={secondaryId}
              onChange={(e) => setSecondaryId(e.target.value)}
              className="bg-slate-800 text-white text-xs rounded-lg px-2.5 py-1 border border-slate-700 focus:outline-none"
            >
              {incidents.map((i) => (
                <option key={i.id} value={i.id} disabled={i.id === primaryId}>
                  #{i.id} - {i.title.slice(0, 32)}...
                </option>
              ))}
            </select>
          </div>

          {secondaryIncident ? (
            <div className="space-y-2.5 text-xs">
              <div>
                <h3 className="text-sm font-bold text-white">
                  #{secondaryIncident.id}: {secondaryIncident.title}
                </h3>
                <p className="text-slate-400 text-xs mt-1">
                  {secondaryIncident.priorityBreakdown?.explanationText || secondaryIncident.title}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-slate-300 text-[11px]">
                <div className="flex items-center justify-between">
                  <span>Category:</span>
                  <span className="font-semibold text-white">{secondaryIncident.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Location:</span>
                  <span className="font-semibold text-white">{secondaryIncident.locationName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Supporting Reports:</span>
                  <span className="font-bold text-purple-400">{secondaryIncident.reportCount} reports</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Priority Score:</span>
                  <span className="font-bold text-amber-400">{secondaryIncident.priorityScore}/100</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Status:</span>
                  <span className="font-semibold text-emerald-400">{secondaryIncident.status}</span>
                </div>
              </div>

              <button
                onClick={() => onSelectIncident(secondaryIncident)}
                className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Inspect on Live Map</span>
              </button>
            </div>
          ) : (
            <div className="p-6 text-center text-slate-500 text-xs">Select Secondary Incident</div>
          )}
        </div>
      </div>

      {/* Action Merge Button */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-slate-300">
          <strong>Merge Action Impact:</strong> Supporting reports from #{secondaryId} will transfer into #{primaryId}. Incident priority score will recalculate and cluster timeline will record the merge event.
        </div>

        <button
          onClick={handleMerge}
          disabled={isMerging || !primaryId || !secondaryId || primaryId === secondaryId}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50 shrink-0"
        >
          <Merge className="w-4 h-4" />
          <span>{isMerging ? 'Merging Clusters...' : 'Merge & Consolidate Duplicates'}</span>
        </button>
      </div>
    </div>
  );
};
