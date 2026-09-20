import React, { useState } from 'react';
import { CheckCircle2, ChevronRight, Clock, Eye, FileCheck, Layers, MapPin, MessageSquare, Send, ShieldAlert, ShieldCheck, Sparkles, Wrench } from 'lucide-react';
import { api } from '../../services/apiService';
import { Incident, IncidentStatus, LanguageCode } from '../../types';
import { t, translateCategory, translateSeverity, translateStatus } from '../../utils/i18n';

interface AdminVerifyResolveViewProps {
  incidents: Incident[];
  language: LanguageCode;
  onRefreshData: () => void;
  onSelectIncident: (incident: Incident) => void;
}

export const AdminVerifyResolveView: React.FC<AdminVerifyResolveViewProps> = ({
  incidents,
  language,
  onRefreshData,
  onSelectIncident,
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'in_action' | 'resolved'>('pending');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const pendingVerification = incidents.filter(
    (i) => i.status === 'New' || i.status === 'Investigating'
  );
  const inActionIncidents = incidents.filter(
    (i) => i.status === 'Action Initiated' || i.status === 'Verified'
  );
  const resolvedIncidents = incidents.filter((i) => i.status === 'Resolved');

  const displayedIncidents =
    activeTab === 'pending'
      ? pendingVerification
      : activeTab === 'in_action'
      ? inActionIncidents
      : resolvedIncidents;

  const handleUpdateStatus = async (incidentId: string, newStatus: IncidentStatus, note?: string) => {
    setIsUpdating(true);
    setSuccessMessage(null);
    try {
      await api.updateIncident(incidentId, {
        status: newStatus,
      });
      setSuccessMessage(`Incident #${incidentId} status successfully updated to "${newStatus}"!`);
      setResolutionNote('');
      setSelectedIncidentId(null);
      onRefreshData();
    } catch (err: any) {
      console.error('Update failed:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              {t('verifyTitle', language)}
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              {t('verifySubtitle', language)}
            </p>
          </div>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1 rounded-xl text-xs">
          <button
            onClick={() => { setActiveTab('pending'); setSuccessMessage(null); }}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Pending Verification ({pendingVerification.length})
          </button>
          <button
            onClick={() => { setActiveTab('in_action'); setSuccessMessage(null); }}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'in_action'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Action In-Progress ({inActionIncidents.length})
          </button>
          <button
            onClick={() => { setActiveTab('resolved'); setSuccessMessage(null); }}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'resolved'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Resolved Archive ({resolvedIncidents.length})
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/60 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Incidents Queue */}
      {displayedIncidents.length === 0 ? (
        <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="text-base font-semibold text-white">Queue Clear!</h3>
          <p className="text-xs text-slate-400">
            No incidents currently in this pipeline stage.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedIncidents.map((incident) => {
            const isSelected = selectedIncidentId === incident.id;

            return (
              <div
                key={incident.id}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3 shadow-sm"
              >
                <div className="space-y-2.5">
                  {/* Category, Status & Priority */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-400">
                      #{incident.id}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs px-2 py-0.5 rounded font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {translateCategory(incident.category, language)}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                          incident.status === 'Resolved'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : incident.status === 'Action Initiated'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {translateStatus(incident.status, language)}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">
                      {incident.title}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {incident.priorityBreakdown?.explanationText || incident.title}
                    </p>
                  </div>

                  {/* Location & Corroboration */}
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1 text-xs text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{incident.locationName}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800">
                      <span className="text-slate-400">Supporting Reports: <strong className="text-cyan-300">{incident.reportCount}</strong></span>
                      <span className="text-slate-400">Priority Score: <strong className="text-amber-400">{incident.priorityScore}/100</strong></span>
                    </div>
                  </div>

                  {/* Operational Notes Entry when selected */}
                  {isSelected && (
                    <div className="p-3 rounded-xl bg-slate-950 border border-cyan-800 space-y-2">
                      <label className="block text-[11px] font-semibold text-slate-300">
                        Add Municipal Field / Resolution Note:
                      </label>
                      <textarea
                        rows={2}
                        value={resolutionNote}
                        onChange={(e) => setResolutionNote(e.target.value)}
                        placeholder="e.g. Field inspection completed. PWD water suction tanker deployed. Drains cleared."
                        className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedIncidentId(null)}
                          className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        {activeTab === 'pending' && (
                          <button
                            onClick={() => handleUpdateStatus(incident.id, 'Verified', resolutionNote)}
                            disabled={isUpdating}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                          >
                            Save & Mark Verified
                          </button>
                        )}
                        {activeTab === 'in_action' && (
                          <button
                            onClick={() => handleUpdateStatus(incident.id, 'Resolved', resolutionNote)}
                            disabled={isUpdating}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                          >
                            Save & Mark Fully Resolved
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Authority Action Triggers */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
                  <button
                    onClick={() => onSelectIncident(incident)}
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Live Map</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {incident.status === 'New' && (
                      <button
                        onClick={() => handleUpdateStatus(incident.id, 'Verified')}
                        disabled={isUpdating}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors cursor-pointer"
                      >
                        Verify Incident
                      </button>
                    )}

                    {(incident.status === 'Verified' || incident.status === 'New') && (
                      <button
                        onClick={() => handleUpdateStatus(incident.id, 'Action Initiated')}
                        disabled={isUpdating}
                        className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors cursor-pointer"
                      >
                        Dispatch Crew
                      </button>
                    )}

                    {incident.status !== 'Resolved' && (
                      <button
                        onClick={() => setSelectedIncidentId(isSelected ? null : incident.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors cursor-pointer"
                      >
                        Mark Resolved
                      </button>
                    )}

                    {incident.status === 'Resolved' && (
                      <span className="text-emerald-400 flex items-center gap-1 text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Closed & Resolved</span>
                      </span>
                    )}
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
