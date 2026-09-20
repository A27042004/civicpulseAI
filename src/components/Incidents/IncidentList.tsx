import React, { useMemo } from 'react';
import { AlertCircle, AlertTriangle, ArrowUpRight, CheckCircle, Clock, Droplets, Flame, HardHat, Info, Layers, MapPin, Search, ShieldAlert, SlidersHorizontal, Sparkles, Trash2, Wind, Zap } from 'lucide-react';
import { FilterState, Incident, IncidentCategory, LanguageCode, SeverityLevel } from '../../types';
import { t, translateCategory, translateSeverity, translateStatus } from '../../utils/i18n';

interface IncidentListProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident) => void;
  filters: FilterState;
  onUpdateFilters: (filters: Partial<FilterState>) => void;
  totalReportsCount: number;
  language?: LanguageCode;
}

export const IncidentList: React.FC<IncidentListProps> = ({
  incidents,
  selectedIncident,
  onSelectIncident,
  filters,
  onUpdateFilters,
  totalReportsCount,
  language = 'en',
}) => {
  const categories: IncidentCategory[] = [
    'WATER / FLOODING',
    'GARBAGE / WASTE',
    'AIR POLLUTION / SMOKE',
    'INFRASTRUCTURE DAMAGE',
    'FIRE / HAZARD',
    'TRAFFIC / OBSTRUCTION',
  ];

  // Filtered incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      // Search
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchTitle = inc.title.toLowerCase().includes(q);
        const matchLoc = inc.locationName.toLowerCase().includes(q);
        const matchId = inc.id.toLowerCase().includes(q);
        const matchSub = inc.subtype.toLowerCase().includes(q);
        if (!matchTitle && !matchLoc && !matchId && !matchSub) return false;
      }

      // Categories
      if (filters.categories.length > 0 && !filters.categories.includes(inc.category)) {
        return false;
      }

      // Severities
      if (filters.severities.length > 0 && !filters.severities.includes(inc.severity)) {
        return false;
      }

      // Emerging
      if (filters.onlyEmerging && !inc.isEmerging) {
        return false;
      }

      // Status
      if (filters.statuses.length > 0 && !filters.statuses.includes(inc.status)) {
        return false;
      }

      return true;
    });
  }, [incidents, filters]);

  const getCategoryIcon = (category: IncidentCategory) => {
    switch (category) {
      case 'WATER / FLOODING':
        return <Droplets className="w-3.5 h-3.5 text-blue-400" />;
      case 'GARBAGE / WASTE':
        return <Trash2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'AIR POLLUTION / SMOKE':
        return <Wind className="w-3.5 h-3.5 text-slate-300" />;
      case 'INFRASTRUCTURE DAMAGE':
        return <HardHat className="w-3.5 h-3.5 text-amber-400" />;
      case 'FIRE / HAZARD':
        return <Flame className="w-3.5 h-3.5 text-rose-400" />;
      case 'TRAFFIC / OBSTRUCTION':
        return <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />;
      default:
        return <AlertCircle className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  const getSeverityBadge = (sev: SeverityLevel) => {
    switch (sev) {
      case 5:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">Critical</span>;
      case 4:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/40">High</span>;
      case 3:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">Significant</span>;
      case 2:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">Moderate</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">Low</span>;
    }
  };

  const toggleCategory = (cat: IncidentCategory) => {
    const active = filters.categories.includes(cat);
    const updated = active
      ? filters.categories.filter((c) => c !== cat)
      : [...filters.categories, cat];
    onUpdateFilters({ categories: updated });
  };

  const getRelativeTime = (iso: string) => {
    const diffMin = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.round(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.round(diffHours / 24)}d ago`;
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
      {/* Header & Intelligence Pill */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/95 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              {t('incidentsTitle', language)}
            </h3>
            <p className="text-[11px] text-slate-400">
              Showing {filteredIncidents.length} active incident clusters
            </p>
          </div>

          {/* Core differentiator pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-800/80 text-[11px] text-cyan-300">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span className="font-mono font-semibold">{totalReportsCount} Reports → {incidents.length} Incidents</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={language === 'hi' ? 'घटना, सड़क या आईडी खोजें...' : language === 'mr' ? 'घटना, रस्ता किंवा आयडी शोधा...' : 'Search incidents, road, or ID (#CP-1042)...'}
            value={filters.searchQuery}
            onChange={(e) => onUpdateFilters({ searchQuery: e.target.value })}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 font-sans"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onUpdateFilters({ searchQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              &times;
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin text-[11px]">
          <button
            onClick={() => onUpdateFilters({ categories: [] })}
            className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors border cursor-pointer ${
              filters.categories.length === 0
                ? 'bg-slate-700 text-white border-slate-600 font-semibold'
                : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200'
            }`}
          >
            {t('allCategories', language)}
          </button>
          {categories.map((cat) => {
            const isActive = filters.categories.includes(cat);
            return (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg whitespace-nowrap transition-colors border cursor-pointer ${
                  isActive
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-700 font-semibold'
                    : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200'
                }`}
              >
                {getCategoryIcon(cat)}
                <span>{translateCategory(cat, language)}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Toggles: Emerging Only, Clear */}
        <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-200">
            <input
              type="checkbox"
              checked={filters.onlyEmerging}
              onChange={(e) => onUpdateFilters({ onlyEmerging: e.target.checked })}
              className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
            />
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-rose-400" />
              Only Rapidly Emerging
            </span>
          </label>

          {(filters.categories.length > 0 || filters.searchQuery || filters.onlyEmerging) && (
            <button
              onClick={() => onUpdateFilters({ categories: [], searchQuery: '', onlyEmerging: false })}
              className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Incident Cards Scrollable List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredIncidents.length === 0 ? (
          <div className="text-center py-12 px-4">
            <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-medium text-slate-300">No matching incident clusters</p>
            <p className="text-[11px] text-slate-500 mt-1">Try resetting search keywords or category filters.</p>
          </div>
        ) : (
          filteredIncidents.map((incident) => {
            const isSelected = selectedIncident?.id === incident.id;
            return (
              <div
                key={incident.id}
                onClick={() => onSelectIncident(incident)}
                className={`p-3 rounded-xl border transition-all cursor-pointer relative group ${
                  isSelected
                    ? 'bg-slate-800/90 border-cyan-500 shadow-md shadow-cyan-950/30 ring-1 ring-cyan-500/50'
                    : 'bg-slate-800/40 hover:bg-slate-800/80 border-slate-700/60'
                }`}
              >
                {/* Top row: ID, Category, Priority Score */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                      #{incident.id}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      {getCategoryIcon(incident.category)}
                      <span className="font-medium text-slate-300">{incident.category}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {getSeverityBadge(incident.severity)}
                    <span className="font-mono text-[11px] font-bold text-white bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-700">
                      {incident.priorityScore}
                      <span className="text-[9px] text-slate-400 font-normal">/100</span>
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h4 className="font-bold text-xs text-white leading-snug group-hover:text-cyan-300 transition-colors mb-1.5">
                  {incident.title}
                </h4>

                {/* CORE DIFFERENTIATOR VISIBLE BADGE */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-800 text-[11px] text-cyan-300 font-semibold">
                    <Layers className="w-3 h-3 text-cyan-400" />
                    <span>{incident.reportCount} reports → 1 consolidated incident</span>
                  </div>

                  {incident.isEmerging && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-950/80 border border-rose-800 text-rose-300 animate-pulse">
                      <Zap className="w-2.5 h-2.5" />
                      {incident.growthRate}
                    </span>
                  )}
                </div>

                {/* Location & Time info */}
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1 max-w-[70%] truncate">
                    <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="truncate">{incident.locationName}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500 shrink-0 font-mono text-[10px]">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{getRelativeTime(incident.lastUpdatedAt)}</span>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="mt-2 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">
                    Status: <strong className="text-slate-200">{incident.status}</strong>
                  </span>
                  <span className="text-cyan-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    <span>Inspect Details</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
