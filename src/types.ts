/**
 * CivicPulse AI - Urban & Environmental Incident Intelligence Platform
 * Shared TypeScript Definitions
 */

export type IncidentCategory =
  | 'WATER / FLOODING'
  | 'GARBAGE / WASTE'
  | 'AIR POLLUTION / SMOKE'
  | 'INFRASTRUCTURE DAMAGE'
  | 'FIRE / HAZARD'
  | 'TRAFFIC / OBSTRUCTION';

export type IncidentSubtype =
  // Water / Flooding
  | 'waterlogging'
  | 'urban flooding'
  | 'drain overflow'
  | 'sewage overflow'
  | 'water pipeline leakage'
  | 'blocked drainage'
  | 'river/lake overflow'
  | 'contaminated water report'
  // Garbage / Waste
  | 'overflowing garbage bin'
  | 'illegal dumping'
  | 'garbage pile'
  | 'construction debris'
  | 'plastic waste'
  | 'waste blocking drainage'
  | 'garbage burning'
  // Air Pollution / Smoke
  | 'heavy smoke'
  | 'dust pollution'
  | 'construction dust'
  | 'industrial smoke'
  | 'unusual fumes'
  | 'smog/haze'
  // Infrastructure Damage
  | 'pothole'
  | 'damaged road'
  | 'broken sidewalk'
  | 'broken streetlight'
  | 'damaged traffic signal'
  | 'open manhole'
  | 'damaged railing'
  | 'fallen electric pole'
  | 'damaged bridge/road structure'
  // Fire / Hazard
  | 'building fire'
  | 'vehicle fire'
  | 'industrial fire'
  | 'electrical fire'
  | 'smoke event'
  | 'chemical spill/leak report'
  | 'fallen hazardous object'
  | 'dangerous exposed wiring'
  // Traffic / Obstruction
  | 'traffic congestion'
  | 'blocked road'
  | 'accident obstruction'
  | 'fallen tree'
  | 'waterlogged road'
  | 'road closure'
  | 'construction obstruction';

export type IncidentStatus =
  | 'New'
  | 'Investigating'
  | 'Verified'
  | 'Action Initiated'
  | 'Resolved'
  | 'Dismissed';

export type SeverityLevel = 1 | 2 | 3 | 4 | 5;
// 1 = Low, 2 = Moderate, 3 = Significant, 4 = High, 5 = Critical

export type GrowthTrend = 'STABLE' | 'MODERATE' | 'RAPIDLY INCREASING' | 'SUBSIDING';

export interface TimelineEvent {
  id: string;
  timestamp: string; // ISO string
  timeFormatted: string; // e.g., "10:05 AM"
  title: string;
  description: string;
  type: 'report' | 'ai_analysis' | 'cluster_created' | 'velocity_spike' | 'status_change' | 'warning_generated';
  actor?: string;
}

export interface Report {
  id: string;
  userId: string;
  userName?: string;
  description: string;
  imageUrl?: string;
  latitude: number;
  longitude: number;
  locationName: string;
  timestamp: string; // ISO string
  category: IncidentCategory;
  subtype: IncidentSubtype | string;
  aiSummary: string;
  aiConfidence: number; // 0 - 100
  severity: SeverityLevel;
  tags: string[];
  incidentId?: string;
  status: 'pending' | 'clustered' | 'dismissed';
}

export interface PriorityBreakdown {
  score: number; // 0 - 100
  level: 'Low' | 'Moderate' | 'High' | 'Critical';
  factors: {
    name: string;
    description: string;
    impact: 'low' | 'medium' | 'high' | 'critical';
    applied: boolean;
  }[];
  explanationText: string;
}

export interface RelationshipNode {
  id: string;
  label: string;
  type: 'cause' | 'incident' | 'impact' | 'secondary_impact';
  description?: string;
}

export interface RelationshipLink {
  source: string;
  target: string;
  label: string;
}

export interface IncidentRelationshipGraph {
  nodes: RelationshipNode[];
  links: RelationshipLink[];
  summary: string;
}

export interface PublicWarning {
  id: string;
  headline: string;
  message: string;
  recommendedAction: string;
  issuedAt: string;
  severity: 'Moderate' | 'High' | 'Critical';
  affectedRoute?: string;
}

export interface Incident {
  id: string;
  title: string;
  category: IncidentCategory;
  subtype: IncidentSubtype | string;
  latitude: number;
  longitude: number;
  locationName: string;
  severity: SeverityLevel;
  confidence: number; // 0 - 100
  priorityScore: number; // 0 - 100
  priorityLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  reportCount: number;
  status: IncidentStatus;
  firstReportedAt: string; // ISO string
  lastUpdatedAt: string; // ISO string
  growthRate: GrowthTrend;
  isEmerging: boolean;
  emergingReason?: string;
  impactRadiusMeters: number; // e.g. 800m, 1200m
  assignedAgency?: string;
  supportingReportIds: string[];
  supportingReports?: Report[];
  priorityBreakdown: PriorityBreakdown;
  timeline: TimelineEvent[];
  relationshipGraph: IncidentRelationshipGraph;
  relatedCauses: string[];
  affectedInfrastructure: string[];
  publicWarning?: PublicWarning;
}

export type UserRole = 'citizen' | 'admin';

export type LanguageCode = 'en' | 'hi' | 'mr';

export interface FilterState {
  searchQuery: string;
  categories: IncidentCategory[];
  severities: SeverityLevel[];
  statuses: IncidentStatus[];
  onlyEmerging: boolean;
  timeRange: 'all' | '1h' | '6h' | '24h' | '7d';
}

export interface AnalyticsSummary {
  totalReports: number;
  totalIncidents: number;
  consolidatedSavingsPercentage: number;
  activeIncidentsCount: number;
  emergingIncidentsCount: number;
  criticalIncidentsCount: number;
  categoryBreakdown: { category: IncidentCategory; count: number; percentage: number }[];
  severityBreakdown: { severity: SeverityLevel; label: string; count: number }[];
  statusBreakdown: { status: IncidentStatus; count: number }[];
}

export interface AIAnalysisResult {
  category: IncidentCategory;
  subtype: string;
  title: string;
  summary: string;
  severity: SeverityLevel;
  confidence: number; // 0 - 100
  tags: string[];
  possible_causes: string[];
  recommended_action: string;
  safety_verification_note: string;
}
