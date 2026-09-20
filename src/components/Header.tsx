import React from 'react';
import { Activity, AlertTriangle, BarChart3, Database, Globe, Plus, ShieldCheck, Sparkles, User } from 'lucide-react';
import { LanguageCode, UserRole } from '../types';
import { t } from '../utils/i18n';

interface HeaderProps {
  userRole: UserRole;
  onToggleRole: (role: UserRole) => void;
  language: LanguageCode;
  onChangeLanguage: (lang: LanguageCode) => void;
  onOpenReportModal: () => void;
  onOpenAnalyticsModal: () => void;
  onOpenDemoTour: () => void;
  onLoadDemoData: () => void;
  isSeeding: boolean;
  totalReports: number;
  totalIncidents: number;
  emergingCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  userRole,
  onToggleRole,
  language,
  onChangeLanguage,
  onOpenReportModal,
  onOpenAnalyticsModal,
  onOpenDemoTour,
  onLoadDemoData,
  isSeeding,
  totalReports,
  totalIncidents,
  emergingCount,
}) => {
  const noiseReduction = totalReports > 0 ? Math.round(((totalReports - totalIncidents) / totalReports) * 100) : 0;

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 lg:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Mission Tagline */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 shadow-lg shadow-cyan-500/20 text-white font-black text-lg">
              CP
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-500 border-2 border-slate-900"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  CIVICPULSE <span className="text-cyan-400 font-extrabold text-sm px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60">AI</span>
                </h1>
                {emergingCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 border border-rose-500/40 text-rose-300 animate-pulse">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                    {emergingCount} {t('emergingBadge', language)}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                {t('appSubtitle', language)}
              </p>
            </div>
          </div>

          {/* Quick Stats Pill for Mobile */}
          <div className="flex items-center gap-1.5 md:hidden text-xs bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
            <span className="text-slate-400">Ratio:</span>
            <span className="text-cyan-300 font-mono font-semibold">{totalReports} → {totalIncidents}</span>
          </div>
        </div>

        {/* Intelligence Consolidation Metric (Desktop) */}
        <div className="hidden lg:flex items-center gap-4 bg-slate-800/60 border border-slate-700/60 rounded-xl px-3.5 py-1.5 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <div>
              <span className="text-slate-400">{t('reportsConsolidated', language)}: </span>
              <span className="font-semibold text-white">{totalReports}</span>
              <span className="text-slate-500 mx-1.5">→</span>
              <span className="font-semibold text-cyan-400">{totalIncidents}</span>
            </div>
          </div>
          <div className="h-3.5 w-px bg-slate-700"></div>
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-400 font-medium">+{noiseReduction}%</span>
            <span className="text-slate-400">{t('noiseFiltered', language)}</span>
          </div>
        </div>

        {/* Global Controls: Demo Seed, Role, Analytics, Report CTA */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
          {/* Demo Mode Button */}
          <button
            id="load-demo-btn"
            onClick={onLoadDemoData}
            disabled={isSeeding}
            className="flex items-center gap-1.5 text-xs font-medium bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-lg transition-all shadow-sm cursor-pointer"
            title="Reload verified 20+ report hackathon demo scenarios"
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isSeeding ? 'Loading...' : t('loadDemoData', language)}</span>
          </button>

          {/* Hackathon Tour Walkthrough */}
          <button
            id="demo-flow-btn"
            onClick={onOpenDemoTour}
            className="hidden sm:flex items-center gap-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
            title="Step-by-step hackathon demo flow guide"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>{language === 'hi' ? 'डेमो गाइड' : language === 'mr' ? 'डेमो मार्गदर्शक' : 'Demo Guide'}</span>
          </button>

          {/* Analytics Modal Button */}
          <button
            id="analytics-btn"
            onClick={onOpenAnalyticsModal}
            className="flex items-center gap-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
            title="View Incident Analytics & Intelligence Metrics"
          >
            <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">{t('analytics', language)}</span>
          </button>

          {/* Role Switcher */}
          <div className="flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700 text-xs">
            <button
              onClick={() => onToggleRole('citizen')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all font-medium cursor-pointer ${
                userRole === 'citizen'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3 h-3" />
              <span>{t('citizenRole', language)}</span>
            </button>
            <button
              onClick={() => onToggleRole('admin')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all font-medium cursor-pointer ${
                userRole === 'admin'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              <span>{t('authorityRole', language)}</span>
            </button>
          </div>

          {/* Language Selector */}
          <div className="relative flex items-center bg-slate-800 border border-slate-700 rounded-lg px-2 py-1">
            <Globe className="w-3.5 h-3.5 text-cyan-400 mr-1.5" />
            <select
              value={language}
              onChange={(e) => onChangeLanguage(e.target.value as LanguageCode)}
              aria-label="Select language"
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer font-medium"
            >
              <option value="en" className="bg-slate-900 text-white">English (EN)</option>
              <option value="hi" className="bg-slate-900 text-white">हिंदी (HI)</option>
              <option value="mr" className="bg-slate-900 text-white">मराठी (MR)</option>
            </select>
          </div>

          {/* Report Incident CTA */}
          <button
            id="report-incident-top-btn"
            onClick={onOpenReportModal}
            className="flex items-center gap-1.5 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white px-3.5 py-1.5 rounded-lg shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{t('reportIncident', language)}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
