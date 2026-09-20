import React, { useState } from 'react';
import { Activity, AlertCircle, AlertTriangle, ArrowDown, ArrowRight, CheckCircle2, ChevronRight, Clock, Copy, Download, ExternalLink, Flame, GitCommit, Layers, MapPin, Radio, Share2, Shield, ShieldAlert, Sparkles, User, Users, Volume2, X } from 'lucide-react';
import { Incident, IncidentStatus, LanguageCode, UserRole } from '../../types';
import { t, translateCategory, translateSeverity, translateStatus } from '../../utils/i18n';

interface IncidentDetailModalProps {
  incident: Incident;
  onClose: () => void;
  userRole: UserRole;
  onUpdateStatus: (incidentId: string, newStatus: IncidentStatus) => void;
  language?: LanguageCode;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incident,
  onClose,
  userRole,
  onUpdateStatus,
  language = 'en',
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'graph' | 'reports' | 'timeline' | 'warning'>('overview');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [copiedAlert, setCopiedAlert] = useState(false);

  const handleStatusChange = async (newStatus: IncidentStatus) => {
    setIsUpdatingStatus(true);
    await onUpdateStatus(incident.id, newStatus);
    setIsUpdatingStatus(false);
  };

  const handleCopyAlert = () => {
    if (!incident.publicWarning) return;
    const text = `🚨 CIVICPULSE AI PUBLIC ADVISORY 🚨\n\n${incident.publicWarning.headline}\n\n${incident.publicWarning.message}\n\nRecommended Action: ${incident.publicWarning.recommendedAction}\n\nAffected: ${incident.publicWarning.affectedRoute || incident.locationName}\nTime: ${new Date(incident.publicWarning.issuedAt).toLocaleTimeString()}`;
    navigator.clipboard.writeText(text);
    setCopiedAlert(true);
    setTimeout(() => setCopiedAlert(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/95 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                #{incident.id}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {translateCategory(incident.category, language)}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                {incident.subtype}
              </span>
              {incident.isEmerging && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 animate-pulse">
                  ⚡ {incident.growthRate}
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-white leading-tight">
              {incident.title}
            </h2>

            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>{incident.locationName}</span>
              <span>•</span>
              <span>Impact Radius: ~{(incident.impactRadiusMeters / 1000).toFixed(1)} km</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Intelligence Metric Banner: "11 reports → 1 consolidated incident" */}
        <div className="bg-gradient-to-r from-cyan-950/80 via-slate-900 to-indigo-950/80 px-5 py-2.5 border-b border-cyan-800/40 flex items-center justify-between text-xs flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping"></span>
            <strong className="text-cyan-300 font-semibold">
              {incident.reportCount} Citizen Reports
            </strong>
            <span className="text-slate-400">→</span>
            <strong className="text-white font-semibold">
              1 Consolidated Urban Intelligence Incident
            </strong>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="text-slate-400">
              Confidence: <strong className="text-emerald-400">{incident.confidence}%</strong>
            </span>
            <span className="text-slate-400">
              Prioritization Score: <strong className="text-rose-400">{incident.priorityScore}/100 ({incident.priorityLevel})</strong>
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 border-b border-slate-800 bg-slate-900/60 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2.5 font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview & Risk Breakdown
          </button>
          <button
            onClick={() => setActiveTab('graph')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'graph'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Relationship Graph
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3.5 py-2.5 font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'reports'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Supporting Reports ({incident.supportingReports?.length || incident.reportCount})
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3.5 py-2.5 font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'timeline'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Timeline ({incident.timeline?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('warning')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'warning'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3 h-3 text-rose-400" />
            Public Warning Card
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-slate-300">
          {/* TAB 1: OVERVIEW & EXPLAINABLE RISK */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* "Why Flagged" / Priority Breakdown */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/70 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    Why is this {incident.priorityLevel.toUpperCase()} Priority?
                  </h3>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800">
                    Priority Score: {incident.priorityScore}/100
                  </span>
                </div>

                <p className="text-xs text-slate-300 italic">
                  "{incident.priorityBreakdown?.explanationText || 'High-priority incident detected with multiple corroborating reports.'}"
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {incident.priorityBreakdown?.factors.map((factor, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start gap-2.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-xs text-white">{factor.name}</div>
                        <div className="text-[11px] text-slate-400 leading-relaxed mt-0.5">{factor.description}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-1 text-[11px] text-slate-500 italic">
                  * Note: CivicPulse prototype prioritization score, calculated via report velocity, proximity, infrastructure impact, and multimodal AI analysis.
                </div>
              </div>

              {/* Key Indicators Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                  <span className="text-slate-400 block text-[11px]">Severity Level</span>
                  <span className="text-base font-bold text-white mt-0.5 block">
                    {incident.severity} / 5
                  </span>
                  <span className="text-[10px] text-slate-400">AI Multimodal</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                  <span className="text-slate-400 block text-[11px]">Growth Trend</span>
                  <span className={`text-sm font-bold mt-0.5 block ${
                    incident.growthRate === 'RAPIDLY INCREASING' ? 'text-rose-400' : 'text-amber-400'
                  }`}>
                    {incident.growthRate}
                  </span>
                  <span className="text-[10px] text-slate-400">Time Velocity</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                  <span className="text-slate-400 block text-[11px]">Impact Radius</span>
                  <span className="text-base font-bold text-cyan-300 mt-0.5 block">
                    ~{(incident.impactRadiusMeters / 1000).toFixed(1)} km
                  </span>
                  <span className="text-[10px] text-slate-400">Estimated Area</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                  <span className="text-slate-400 block text-[11px]">Current Status</span>
                  <span className="text-base font-bold text-white mt-0.5 block">
                    {incident.status}
                  </span>
                  <span className="text-[10px] text-slate-400">Field Operations</span>
                </div>
              </div>

              {/* Affected Infrastructure & Root Causes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                  <h4 className="font-semibold text-slate-200">Affected Infrastructure Corridors:</h4>
                  <ul className="space-y-1 text-slate-300">
                    {incident.affectedInfrastructure?.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                  <h4 className="font-semibold text-slate-200">Corroborated Contributing Causes:</h4>
                  <ul className="space-y-1 text-slate-300">
                    {incident.relatedCauses?.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Admin Actions Panel */}
              {userRole === 'admin' && (
                <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-700/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-indigo-200 text-xs flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-indigo-400" />
                      Authority / Admin Control Panel
                    </h4>
                    <span className="text-[10px] text-indigo-300">Official Municipal Triage</span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {(['New', 'Investigating', 'Verified', 'Action Initiated', 'Resolved', 'Dismissed'] as IncidentStatus[]).map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        disabled={isUpdatingStatus || incident.status === status}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                          incident.status === status
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INCIDENT RELATIONSHIP GRAPH (WOW FEATURE) */}
          {activeTab === 'graph' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-xs flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    Incident Relationship Graph Engine
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {incident.relationshipGraph?.summary || 'Causal chain linking root triggers to downstream urban impact.'}
                  </p>
                </div>
              </div>

              {/* Visual Node-and-Link Interactive Diagram */}
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center min-h-[320px]">
                <div className="w-full max-w-2xl space-y-6">
                  {/* Visual Chain representation */}
                  <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4">
                    {incident.relationshipGraph?.nodes.map((node, idx) => {
                      const isIncident = node.type === 'incident';
                      const isCause = node.type === 'cause';
                      const isImpact = node.type === 'impact';
                      const isSecondary = node.type === 'secondary_impact';

                      let nodeBg = 'bg-slate-800 border-slate-700 text-slate-200';
                      let typeLabel = 'Event';

                      if (isCause) {
                        nodeBg = 'bg-amber-950/70 border-amber-700/80 text-amber-200';
                        typeLabel = 'ROOT CAUSE';
                      } else if (isIncident) {
                        nodeBg = 'bg-cyan-950 border-cyan-500 text-cyan-200 ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-500/20';
                        typeLabel = 'CONSOLIDATED INCIDENT';
                      } else if (isImpact) {
                        nodeBg = 'bg-rose-950/70 border-rose-700/80 text-rose-200';
                        typeLabel = 'DIRECT IMPACT';
                      } else if (isSecondary) {
                        nodeBg = 'bg-purple-950/70 border-purple-700/80 text-purple-200';
                        typeLabel = 'SECONDARY IMPACT';
                      }

                      return (
                        <React.Fragment key={node.id}>
                          <div className={`p-3.5 rounded-xl border flex flex-col items-center text-center max-w-[190px] shadow-sm transition-transform hover:scale-105 ${nodeBg}`}>
                            <span className="text-[9px] uppercase tracking-wider font-extrabold opacity-80 mb-1">
                              {typeLabel}
                            </span>
                            <span className="font-bold text-xs leading-snug">
                              {node.label}
                            </span>
                            {node.description && (
                              <span className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                                {node.description}
                              </span>
                            )}
                          </div>

                          {idx < (incident.relationshipGraph?.nodes.length || 0) - 1 && (
                            <div className="flex items-center justify-center text-slate-500">
                              <ArrowRight className="w-4 h-4 hidden md:block text-cyan-400/80" />
                              <ArrowDown className="w-4 h-4 md:hidden text-cyan-400/80" />
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* Chain Explanation Box */}
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
                    <strong className="text-cyan-400">Intelligence Synthesis: </strong>
                    Individual citizen reports rarely capture the full chain. By correlating reports across multiple coordinates and categories, CivicPulse AI constructs the underlying causal network to prevent secondary cascades.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SUPPORTING CITIZEN REPORTS & IMAGES */}
          {activeTab === 'reports' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                <span>
                  Showing all <strong className="text-white">{incident.supportingReports?.length || 0}</strong> citizen reports consolidated into this incident.
                </span>
                <span className="text-cyan-400 font-mono text-[11px]">
                  Cluster ID: #{incident.id}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {incident.supportingReports?.map((report) => (
                  <div
                    key={report.id}
                    className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2.5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                          {report.id}
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          {new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-cyan-300 font-medium mb-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{report.userName || 'Citizen Observer'}</span>
                      </div>

                      <p className="text-xs text-white leading-relaxed">
                        "{report.description}"
                      </p>

                      {/* Photo if attached */}
                      {report.imageUrl && (
                        <div className="mt-2 rounded-lg overflow-hidden border border-slate-700 max-h-40 bg-black">
                          <img
                            src={report.imageUrl}
                            alt="Incident Evidence"
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="truncate max-w-[180px]">📍 {report.locationName}</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-300">
                        Sev: {report.severity}/5
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: INCIDENT TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs text-slate-300">
                Chronological intelligence reconstruction of incident emergence and escalation.
              </div>

              <div className="relative pl-6 border-l-2 border-slate-800 space-y-5 my-2">
                {incident.timeline?.map((evt, idx) => (
                  <div key={evt.id || idx} className="relative group">
                    {/* Circle on the line */}
                    <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-slate-900 border-2 border-cyan-500 group-hover:scale-125 transition-transform"></div>

                    <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white text-xs">{evt.title}</span>
                        <span className="text-[11px] font-mono text-cyan-400">{evt.timeFormatted}</span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {evt.description}
                      </p>

                      {evt.actor && (
                        <div className="text-[10px] text-slate-400 pt-1">
                          Source: <span className="text-slate-200">{evt.actor}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: PUBLIC WARNING CARD */}
          {activeTab === 'warning' && (
            <div className="space-y-4">
              {incident.publicWarning ? (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-950/80 via-slate-900 to-amber-950/80 border-2 border-rose-500/60 shadow-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded bg-rose-600 text-white font-black text-xs uppercase tracking-widest flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5 animate-pulse" />
                        OFFICIAL PUBLIC ADVISORY
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        Issued: {new Date(incident.publicWarning.issuedAt).toLocaleTimeString()}
                      </span>
                    </div>

                    <h3 className="text-lg font-extrabold text-white">
                      {incident.publicWarning.headline}
                    </h3>

                    <p className="text-xs text-slate-200 leading-relaxed">
                      {incident.publicWarning.message}
                    </p>

                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700 text-xs">
                      <strong className="text-amber-400">Recommended Citizen Action: </strong>
                      <span className="text-slate-200">{incident.publicWarning.recommendedAction}</span>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                      <span>Affected Corridor: <strong className="text-slate-200">{incident.publicWarning.affectedRoute || incident.locationName}</strong></span>
                      <button
                        onClick={handleCopyAlert}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer text-xs"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedAlert ? 'Copied Alert!' : 'Copy Alert Card'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs text-slate-400">
                    💡 This public warning is automatically generated from multi-source citizen corroboration and is ready to broadcast via municipal push notifications, navigation apps, and public social channels.
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-xs text-slate-400">
                  <ShieldAlert className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p>No active public warning has been issued for this incident yet.</p>
                  <p className="text-slate-500 mt-1">Warnings are automatically triggered when priority score reaches high thresholds.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/95 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono">
            First reported: {new Date(incident.firstReportedAt).toLocaleTimeString()}
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
