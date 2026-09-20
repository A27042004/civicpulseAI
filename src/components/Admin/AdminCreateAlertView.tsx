import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, BellRing, CheckCircle2, ChevronRight, Eye, MapPin, Navigation, Radio, Send, ShieldAlert, Sparkles, Trash2, Volume2 } from 'lucide-react';
import { api } from '../../services/apiService';
import { Incident, LanguageCode } from '../../types';
import { t, translateCategory } from '../../utils/i18n';

interface AdminCreateAlertViewProps {
  incidents: Incident[];
  language: LanguageCode;
  onRefreshData: () => void;
  onSelectIncident: (incident: Incident) => void;
}

export const AdminCreateAlertView: React.FC<AdminCreateAlertViewProps> = ({
  incidents,
  language,
  onRefreshData,
  onSelectIncident,
}) => {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(incidents[0]?.id || '');
  const [headline, setHeadline] = useState('');
  const [message, setMessage] = useState('');
  const [recommendedAction, setRecommendedAction] = useState('Avoid affected corridor. Use alternative arterial routes or public transit.');
  const [affectedRoute, setAffectedRoute] = useState('');
  const [severity, setSeverity] = useState<'Moderate' | 'High' | 'Critical'>('High');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Auto-fill template when incident is selected
  const handleSelectIncident = (id: string) => {
    setSelectedIncidentId(id);
    const inc = incidents.find((i) => i.id === id);
    if (inc) {
      setHeadline(`CIVIC ADVISORY: ${inc.title}`);
      setMessage(`Municipal advisory issued for ${inc.locationName}. Priority score ${inc.priorityScore}/100. Field teams responding.`);
      setAffectedRoute(inc.locationName);
      setSeverity(inc.priorityScore >= 75 ? 'Critical' : 'High');
    }
  };

  const handleBroadcastAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncidentId || !headline.trim() || !message.trim()) {
      alert('Please fill out the headline and message.');
      return;
    }

    setIsBroadcasting(true);
    setSuccessBanner(null);
    try {
      await api.updateIncident(selectedIncidentId, {
        publicWarning: {
          id: `warn-${Date.now()}`,
          headline,
          message,
          recommendedAction,
          affectedRoute,
          severity,
          issuedAt: new Date().toISOString(),
        },
      });
      setSuccessBanner(`Public Advisory successfully broadcasted for Incident #${selectedIncidentId}! It is now live in the Citizen Nearby Alerts feed.`);
      onRefreshData();
    } catch (err: any) {
      console.error('Failed to broadcast alert:', err);
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleRevokeAlert = async (incidentId: string) => {
    if (!confirm(`Revoke public advisory for Incident #${incidentId}?`)) return;
    try {
      await api.updateIncident(incidentId, {
        publicWarning: undefined,
      });
      setSuccessBanner(`Advisory for #${incidentId} revoked.`);
      onRefreshData();
    } catch (err: any) {
      alert(`Revoke failed: ${err.message}`);
    }
  };

  // Find active alerts
  const activeAlerts = incidents.filter((i) => !!i.publicWarning);

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-rose-950/30 to-slate-900 border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 shrink-0">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              {t('createAlertTitle', language)}
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold">
                Emergency Broadcast Studio
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              {t('createAlertSubtitle', language)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl">
          <BellRing className="w-4 h-4 text-rose-400" />
          <span>Active Broadcasts: <strong className="text-white">{activeAlerts.length}</strong></span>
        </div>
      </div>

      {/* Success Notification */}
      {successBanner && (
        <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/60 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="flex-1 font-medium">{successBanner}</span>
        </div>
      )}

      {/* Main Broadcast Form & Active List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Broadcast Studio Form */}
        <div className="lg:col-span-7 p-4 sm:p-5 rounded-2xl bg-slate-900/95 border border-slate-800 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2.5">
            <Send className="w-4 h-4 text-rose-400" />
            <span>Compose Public Advisory Broadcast</span>
          </h3>

          <form onSubmit={handleBroadcastAlert} className="space-y-3 text-xs">
            {/* Target Incident Selection */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Target Incident Cluster <span className="text-rose-400">*</span>
              </label>
              <select
                value={selectedIncidentId}
                onChange={(e) => handleSelectIncident(e.target.value)}
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
              >
                {incidents.map((i) => (
                  <option key={i.id} value={i.id}>
                    #{i.id} - [{i.category}] {i.title} (Priority: {i.priorityScore}/100)
                  </option>
                ))}
              </select>
            </div>

            {/* Severity Level */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Advisory Severity Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Moderate', 'High', 'Critical'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSeverity(lvl)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      severity === lvl
                        ? lvl === 'Critical'
                          ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30'
                          : lvl === 'High'
                          ? 'bg-amber-600 text-white border-amber-500'
                          : 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {lvl.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Headline */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Broadcast Headline <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. CIVIC ADVISORY: Flash Waterlogging on Eastern Express Corridor"
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Public Safety Message Details <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Explain the situation clearly for citizens and commuters..."
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            {/* Recommended Action / Detour */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Recommended Action & Commuter Detour Guidance
              </label>
              <input
                type="text"
                value={recommendedAction}
                onChange={(e) => setRecommendedAction(e.target.value)}
                placeholder="e.g. Use Western Highway or Metro Line 7. Avoid low-lying underpasses."
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            {/* Affected Route */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Affected Arterial Route / Street Landmark
              </label>
              <input
                type="text"
                value={affectedRoute}
                onChange={(e) => setAffectedRoute(e.target.value)}
                placeholder="e.g. Eastern Express Highway, Pillar 140 to 148"
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            {/* Broadcast Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isBroadcasting}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                <Radio className="w-4 h-4 animate-pulse" />
                <span>{isBroadcasting ? 'Broadcasting to Citizen Feed...' : 'Broadcast Public Advisory Now'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Currently Active Broadcasts List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Live Broadcasted Alerts ({activeAlerts.length})</span>
            </span>
          </div>

          {activeAlerts.length === 0 ? (
            <div className="p-6 text-center bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-400 space-y-1">
              <p>No active public alerts currently broadcasting.</p>
              <p className="text-[11px] text-slate-500">Select an incident on the left to issue one.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeAlerts.map((inc) => (
                <div
                  key={inc.id}
                  className="p-3.5 rounded-xl bg-slate-900 border border-rose-500/40 space-y-2 text-xs shadow-sm"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold text-[10px] uppercase tracking-wider">
                      {inc.publicWarning?.severity || 'HIGH'} ALERT
                    </span>
                    <span className="font-mono text-cyan-400 font-semibold text-[11px]">
                      #{inc.id}
                    </span>
                  </div>

                  <h4 className="font-bold text-white leading-snug">
                    {inc.publicWarning?.headline}
                  </h4>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {inc.publicWarning?.message}
                  </p>

                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-[10px] text-slate-400">
                    <div className="text-amber-300 font-semibold flex items-center gap-1">
                      <Navigation className="w-3 h-3" />
                      <span>{inc.publicWarning?.recommendedAction}</span>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between gap-2 text-xs border-t border-slate-800/80">
                    <button
                      onClick={() => onSelectIncident(inc)}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Live Map</span>
                    </button>

                    <button
                      onClick={() => handleRevokeAlert(inc.id)}
                      className="text-rose-400 hover:text-rose-300 flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Revoke Broadcast</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
