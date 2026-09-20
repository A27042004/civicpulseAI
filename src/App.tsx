import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  GitMerge,
  Layers,
  Map as MapIcon,
  MapPin,
  Mic,
  Radio,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  UserCheck,
} from 'lucide-react';
import { AnalyticsModal } from './components/Analytics/AnalyticsModal';
import { DemoTourModal } from './components/DemoTourModal';
import { EmergingBanner } from './components/EmergingBanner';
import { Header } from './components/Header';
import { IncidentDetailModal } from './components/Incidents/IncidentDetailModal';
import { IncidentList } from './components/Incidents/IncidentList';
import { IncidentMap } from './components/Map/IncidentMap';
import { ReportModal } from './components/Reports/ReportModal';
import { CitizenNearbyAlertsView } from './components/Citizen/CitizenNearbyAlertsView';
import { CitizenTrackReportsView } from './components/Citizen/CitizenTrackReportsView';
import { AdminInspectReportsView } from './components/Admin/AdminInspectReportsView';
import { AdminMergeDuplicatesView } from './components/Admin/AdminMergeDuplicatesView';
import { AdminVerifyResolveView } from './components/Admin/AdminVerifyResolveView';
import { AdminCreateAlertView } from './components/Admin/AdminCreateAlertView';
import { AdminAnalyticsView } from './components/Admin/AdminAnalyticsView';
import { INITIAL_INCIDENTS, INITIAL_REPORTS } from './data/seedData';
import { api } from './services/apiService';
import {
  AnalyticsSummary,
  FilterState,
  Incident,
  IncidentStatus,
  LanguageCode,
  PublicWarning,
  Report,
  UserRole,
} from './types';
import { t } from './utils/i18n';

type CitizenTab = 'viewIncidents' | 'submitReports' | 'nearbyAlerts' | 'trackReports';
type AdminTab =
  | 'manageIncidents'
  | 'inspectReports'
  | 'mergeDuplicates'
  | 'verify'
  | 'resolve'
  | 'createAlerts'
  | 'analytics';

export function App() {
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [reports, setReports] = useState<Report[]>(INITIAL_REPORTS);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [showImpactRadius, setShowImpactRadius] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<UserRole>('citizen');
  const [language, setLanguage] = useState<LanguageCode>('en');

  // Dedicated Tab Navigation state per role
  const [citizenTab, setCitizenTab] = useState<CitizenTab>('viewIncidents');
  const [adminTab, setAdminTab] = useState<AdminTab>('manageIncidents');

  // Active view on mobile screens when in map/feed: 'map' or 'list'
  const [mobileView, setMobileView] = useState<'map' | 'list'>('map');

  // Modals state
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState<boolean>(false);
  const [isDemoTourOpen, setIsDemoTourOpen] = useState<boolean>(false);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);

  // Filters
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    severities: [],
    statuses: [],
    searchQuery: '',
    onlyEmerging: false,
    timeRange: 'all',
  });

  // Fetch initial state
  const reloadData = async () => {
    try {
      const [fetchedIncidents, fetchedReports, fetchedAnalytics] = await Promise.all([
        api.getIncidents(),
        api.getReports(),
        api.getAnalytics(),
      ]);
      setIncidents(fetchedIncidents);
      setReports(fetchedReports);
      setAnalytics(fetchedAnalytics);
    } catch (err) {
      console.error('Error reloading data:', err);
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  // Demo Data Reset
  const handleLoadDemoData = async () => {
    setIsSeeding(true);
    try {
      await api.seedDemoData();
      await reloadData();
    } catch (err) {
      console.error('Failed to seed demo data:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  // Emerging incidents
  const emergingIncidents = useMemo(() => {
    return incidents.filter((inc) => inc.isEmerging);
  }, [incidents]);

  // Handle report submitted by citizen
  const handleReportSubmitted = async (result: {
    report: Report;
    incident: Incident;
    isNewCluster: boolean;
  }) => {
    await reloadData();
    setSelectedIncident(result.incident);
    setCitizenTab('trackReports');
  };

  // Handle admin status update
  const handleUpdateStatus = async (incidentId: string, newStatus: IncidentStatus) => {
    try {
      const updated = await api.updateIncident(incidentId, { status: newStatus });
      setIncidents((prev) => prev.map((inc) => (inc.id === incidentId ? updated : inc)));
      if (selectedIncident?.id === incidentId) {
        setSelectedIncident(updated);
      }
      api.getAnalytics().then(setAnalytics);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Handle merging duplicate incidents
  const handleMergeIncidents = async (primaryId: string, duplicateIds: string[]) => {
    try {
      let updatedPrimary: Incident | null = null;
      for (const dupId of duplicateIds) {
        updatedPrimary = await api.mergeIncidents(primaryId, dupId);
      }
      if (updatedPrimary) {
        const finalPrimary = updatedPrimary;
        setIncidents((prev) =>
          prev
            .filter((inc) => !duplicateIds.includes(inc.id))
            .map((inc) => (inc.id === primaryId ? finalPrimary : inc))
        );
        if (selectedIncident && duplicateIds.includes(selectedIncident.id)) {
          setSelectedIncident(finalPrimary);
        }
      }
      api.getAnalytics().then(setAnalytics);
    } catch (err) {
      console.error('Failed to merge incidents:', err);
    }
  };

  // Handle dismissing / archiving a report
  const handleDismissReport = async (reportId: string) => {
    try {
      await api.dismissReport(reportId);
      setReports((prev) => prev.filter((r) => r.id !== reportId));
    } catch (err) {
      console.error('Failed to dismiss report:', err);
    }
  };

  // Handle broadcast alert
  const handleBroadcastAlert = async (incidentId: string, warning: PublicWarning) => {
    try {
      const updated = await api.updateIncident(incidentId, { publicWarning: warning });
      setIncidents((prev) => prev.map((inc) => (inc.id === incidentId ? updated : inc)));
      if (selectedIncident?.id === incidentId) {
        setSelectedIncident(updated);
      }
      api.getAnalytics().then(setAnalytics);
    } catch (err) {
      console.error('Failed to broadcast alert:', err);
    }
  };

  // Handle selecting an incident from custom sub-views
  const handleSelectIncidentFromSubView = (incident: Incident) => {
    setSelectedIncident(incident);
    if (userRole === 'citizen') {
      setCitizenTab('viewIncidents');
    } else {
      setAdminTab('manageIncidents');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* 1. Top Header Bar */}
      <Header
        userRole={userRole}
        onToggleRole={(newRole) => {
          setUserRole(newRole);
          // Set sensible defaults when switching role
          if (newRole === 'citizen') {
            setCitizenTab('viewIncidents');
          } else {
            setAdminTab('manageIncidents');
          }
        }}
        language={language}
        onChangeLanguage={setLanguage}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenAnalyticsModal={() => setIsAnalyticsModalOpen(true)}
        onOpenDemoTour={() => setIsDemoTourOpen(true)}
        onLoadDemoData={handleLoadDemoData}
        isSeeding={isSeeding}
        totalReports={reports.length}
        totalIncidents={incidents.length}
        emergingCount={emergingIncidents.length}
      />

      {/* 2. Emerging Threat Alert Banner */}
      <EmergingBanner
        emergingIncidents={emergingIncidents}
        onSelectIncident={(inc) => {
          setSelectedIncident(inc);
          if (userRole === 'citizen') {
            setCitizenTab('viewIncidents');
          } else {
            setAdminTab('manageIncidents');
          }
        }}
        language={language}
      />

      {/* 3. Role-Based Navigation Sub-Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Role Status Pill & Title */}
          <div className="flex items-center gap-2.5">
            <div
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                userRole === 'citizen'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
              }`}
            >
              {userRole === 'citizen' ? (
                <>
                  <User className="w-3.5 h-3.5" />
                  <span>{t('citizenWorkspace', language)}</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{t('authorityWorkspace', language)}</span>
                </>
              )}
            </div>
            <span className="text-xs text-slate-400 hidden md:inline">
              {userRole === 'citizen'
                ? t('citizenPortalSubtitle', language)
                : t('adminConsoleSubtitle', language)}
            </span>
          </div>

          {/* Citizen Dedicated Tabs */}
          {userRole === 'citizen' && (
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs">
              <button
                id="citizen-tab-view-incidents"
                onClick={() => setCitizenTab('viewIncidents')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  citizenTab === 'viewIncidents'
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>{t('citizenTabViewIncidents', language)}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-900/80 text-cyan-200">
                  {incidents.length}
                </span>
              </button>

              <button
                id="citizen-tab-submit-report"
                onClick={() => {
                  setCitizenTab('submitReports');
                  setIsReportModalOpen(true);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  citizenTab === 'submitReports'
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                }`}
              >
                <Mic className="w-3.5 h-3.5 text-cyan-300" />
                <span>{t('citizenTabSubmitReport', language)}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-bold">
                  Voice AI
                </span>
              </button>

              <button
                id="citizen-tab-nearby-alerts"
                onClick={() => setCitizenTab('nearbyAlerts')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  citizenTab === 'nearbyAlerts'
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                }`}
              >
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('citizenTabNearbyAlerts', language)}</span>
                {emergingIncidents.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-bold animate-pulse">
                    {emergingIncidents.length}
                  </span>
                )}
              </button>

              <button
                id="citizen-tab-track-reports"
                onClick={() => setCitizenTab('trackReports')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  citizenTab === 'trackReports'
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t('citizenTabTrackReports', language)}</span>
              </button>
            </div>
          )}

          {/* Admin Dedicated Tabs */}
          {userRole === 'admin' && (
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs">
              <button
                id="admin-tab-manage-incidents"
                onClick={() => setAdminTab('manageIncidents')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  adminTab === 'manageIncidents'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{t('adminTabManageIncidents', language)}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-900 text-indigo-200">
                  {incidents.length}
                </span>
              </button>

              <button
                id="admin-tab-inspect-reports"
                onClick={() => setAdminTab('inspectReports')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  adminTab === 'inspectReports'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                }`}
              >
                <Search className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t('adminTabInspectReports', language)}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-700 text-slate-200 font-mono">
                  {reports.length}
                </span>
              </button>

              <button
                id="admin-tab-merge-duplicates"
                onClick={() => setAdminTab('mergeDuplicates')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  adminTab === 'mergeDuplicates'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                }`}
              >
                <GitMerge className="w-3.5 h-3.5 text-violet-400" />
                <span>{t('adminTabMergeDuplicates', language)}</span>
              </button>

              <button
                id="admin-tab-verify-resolve"
                onClick={() => setAdminTab('verify')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  adminTab === 'verify' || adminTab === 'resolve'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('adminTabVerifyResolve', language)}</span>
              </button>

              <button
                id="admin-tab-create-alerts"
                onClick={() => setAdminTab('createAlerts')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  adminTab === 'createAlerts'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-rose-400" />
                <span>{t('adminTabCreateAlerts', language)}</span>
              </button>

              <button
                id="admin-tab-analytics"
                onClick={() => setAdminTab('analytics')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  adminTab === 'analytics'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('adminTabAnalytics', language)}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. Main Dynamic Body based on Active Role & Tab */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 lg:p-6">
        {/* CITIZEN FLOW */}
        {userRole === 'citizen' && (
          <>
            {/* View Incidents (Interactive Map & Incident Clusters) */}
            {citizenTab === 'viewIncidents' && (
              <div className="space-y-4">
                {/* Mobile Tab Switcher */}
                <div className="md:hidden flex items-center justify-around bg-slate-900 border border-slate-800 rounded-xl p-1.5 text-xs">
                  <button
                    onClick={() => setMobileView('map')}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-medium transition-colors ${
                      mobileView === 'map'
                        ? 'bg-cyan-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <MapIcon className="w-3.5 h-3.5" />
                    <span>City Grid Map</span>
                  </button>
                  <button
                    onClick={() => setMobileView('list')}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-medium transition-colors ${
                      mobileView === 'list'
                        ? 'bg-cyan-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Incidents ({incidents.length})</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Map Workspace (7 cols on desktop) */}
                  <section
                    className={`h-[480px] md:h-[calc(100vh-220px)] md:col-span-7 lg:col-span-7 flex flex-col ${
                      mobileView === 'list' ? 'hidden md:flex' : 'flex'
                    }`}
                  >
                    <IncidentMap
                      incidents={incidents}
                      selectedIncident={selectedIncident}
                      onSelectIncident={(inc) => setSelectedIncident(inc)}
                      showImpactRadius={showImpactRadius}
                      onToggleImpactRadius={() => setShowImpactRadius((prev) => !prev)}
                    />
                  </section>

                  {/* Incident Clusters Feed (5 cols on desktop) */}
                  <section
                    className={`h-[520px] md:h-[calc(100vh-220px)] md:col-span-5 lg:col-span-5 flex flex-col ${
                      mobileView === 'map' ? 'hidden md:flex' : 'flex'
                    }`}
                  >
                    <IncidentList
                      incidents={incidents}
                      selectedIncident={selectedIncident}
                      onSelectIncident={(inc) => setSelectedIncident(inc)}
                      filters={filters}
                      onUpdateFilters={(f) => setFilters((prev) => ({ ...prev, ...f }))}
                      totalReportsCount={reports.length}
                      language={language}
                    />
                  </section>
                </div>
              </div>
            )}

            {/* Submit Reports: Quick trigger action card + modal */}
            {citizenTab === 'submitReports' && (
              <div className="p-6 sm:p-10 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 text-center max-w-2xl mx-auto space-y-5 shadow-2xl">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 mx-auto flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <Mic className="w-8 h-8 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    {t('reportIncidentModalTitle', language)}
                  </h2>
                  <p className="text-sm text-slate-300 max-w-lg mx-auto">
                    {language === 'hi'
                      ? 'नागरिक सीधे बोलकर या विवरण लिखकर जलभराव, आग, कचरा या प्रदूषण की रिपोर्ट कर सकते हैं।'
                      : language === 'mr'
                      ? 'नागरिक थेट बोलून किंवा माहिती लिहून पाणी साचणे, आग, कचरा किंवा प्रदूषणाची तक्रार करू शकतात.'
                      : 'Citizens can report waterlogging, fire hazards, garbage, or road obstructions using both Voice Speech-to-Text and Camera Photo uploads.'}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setIsReportModalOpen(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-cyan-500/30 transition-all cursor-pointer text-sm"
                  >
                    <Mic className="w-4 h-4 text-cyan-200" />
                    <span>{t('reportIncident', language)} (Voice + Photo)</span>
                  </button>

                  <button
                    onClick={() => setCitizenTab('viewIncidents')}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-medium transition-all text-sm cursor-pointer"
                  >
                    {t('citizenTabViewIncidents', language)}
                  </button>
                </div>
              </div>
            )}

            {/* See Nearby Alerts */}
            {citizenTab === 'nearbyAlerts' && (
              <CitizenNearbyAlertsView
                incidents={incidents}
                language={language}
                onSelectIncident={handleSelectIncidentFromSubView}
                onNavigateToMap={() => setCitizenTab('viewIncidents')}
              />
            )}

            {/* Track Own Reports */}
            {citizenTab === 'trackReports' && (
              <CitizenTrackReportsView
                reports={reports}
                incidents={incidents}
                language={language}
                onSelectIncident={handleSelectIncidentFromSubView}
                onOpenReportModal={() => setIsReportModalOpen(true)}
              />
            )}
          </>
        )}

        {/* ADMIN FLOW */}
        {userRole === 'admin' && (
          <>
            {/* Manage Incidents (Map + Command Feed) */}
            {adminTab === 'manageIncidents' && (
              <div className="space-y-4">
                {/* Mobile Tab Switcher */}
                <div className="md:hidden flex items-center justify-around bg-slate-900 border border-slate-800 rounded-xl p-1.5 text-xs">
                  <button
                    onClick={() => setMobileView('map')}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-medium transition-colors ${
                      mobileView === 'map'
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <MapIcon className="w-3.5 h-3.5" />
                    <span>City Grid Map</span>
                  </button>
                  <button
                    onClick={() => setMobileView('list')}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-medium transition-colors ${
                      mobileView === 'list'
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Incident Clusters ({incidents.length})</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <section
                    className={`h-[480px] md:h-[calc(100vh-220px)] md:col-span-7 lg:col-span-7 flex flex-col ${
                      mobileView === 'list' ? 'hidden md:flex' : 'flex'
                    }`}
                  >
                    <IncidentMap
                      incidents={incidents}
                      selectedIncident={selectedIncident}
                      onSelectIncident={(inc) => setSelectedIncident(inc)}
                      showImpactRadius={showImpactRadius}
                      onToggleImpactRadius={() => setShowImpactRadius((prev) => !prev)}
                    />
                  </section>

                  <section
                    className={`h-[520px] md:h-[calc(100vh-220px)] md:col-span-5 lg:col-span-5 flex flex-col ${
                      mobileView === 'map' ? 'hidden md:flex' : 'flex'
                    }`}
                  >
                    <IncidentList
                      incidents={incidents}
                      selectedIncident={selectedIncident}
                      onSelectIncident={(inc) => setSelectedIncident(inc)}
                      filters={filters}
                      onUpdateFilters={(f) => setFilters((prev) => ({ ...prev, ...f }))}
                      totalReportsCount={reports.length}
                      language={language}
                    />
                  </section>
                </div>
              </div>
            )}

            {/* Inspect Reports */}
            {adminTab === 'inspectReports' && (
              <AdminInspectReportsView
                reports={reports}
                incidents={incidents}
                language={language}
                onRefreshData={reloadData}
                onSelectIncident={handleSelectIncidentFromSubView}
              />
            )}

            {/* Merge Duplicates */}
            {adminTab === 'mergeDuplicates' && (
              <AdminMergeDuplicatesView
                incidents={incidents}
                language={language}
                onRefreshData={reloadData}
                onSelectIncident={handleSelectIncidentFromSubView}
              />
            )}

            {/* Verify & Resolve */}
            {(adminTab === 'verify' || adminTab === 'resolve') && (
              <AdminVerifyResolveView
                incidents={incidents}
                language={language}
                onRefreshData={reloadData}
                onSelectIncident={handleSelectIncidentFromSubView}
              />
            )}

            {/* Create Alerts */}
            {adminTab === 'createAlerts' && (
              <AdminCreateAlertView
                incidents={incidents}
                language={language}
                onRefreshData={reloadData}
                onSelectIncident={handleSelectIncidentFromSubView}
              />
            )}

            {/* View Analytics */}
            {adminTab === 'analytics' && (
              <AdminAnalyticsView
                analytics={analytics}
                incidents={incidents}
                reports={reports}
                language={language}
              />
            )}
          </>
        )}
      </main>

      {/* 5. Incident Detail Modal (Inspector) */}
      {selectedIncident && (
        <IncidentDetailModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          userRole={userRole}
          onUpdateStatus={handleUpdateStatus}
          language={language}
        />
      )}

      {/* 6. Citizen Report Submission Modal */}
      {isReportModalOpen && (
        <ReportModal
          onClose={() => setIsReportModalOpen(false)}
          onReportSubmitted={handleReportSubmitted}
          language={language}
        />
      )}

      {/* 7. Global Analytics Modal */}
      {isAnalyticsModalOpen && analytics && (
        <AnalyticsModal
          analytics={analytics}
          onClose={() => setIsAnalyticsModalOpen(false)}
        />
      )}

      {/* 8. Hackathon Demo Walkthrough Guide Modal */}
      {isDemoTourOpen && (
        <DemoTourModal
          onClose={() => setIsDemoTourOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
