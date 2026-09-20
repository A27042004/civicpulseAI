import { INITIAL_INCIDENTS, INITIAL_REPORTS } from '../src/data/seedData';
import { AnalyticsSummary, Incident, IncidentStatus, Report } from '../src/types';
import { findMatchingIncident } from './clustering';
import { buildRelationshipGraph } from './relationships';
import { calculateImpactRadius, calculatePriorityScore, evaluateEmergingStatus, generatePublicWarning } from './riskEngine';

class DataStore {
  private reports: Report[] = [];
  private incidents: Incident[] = [];
  private incidentCounter = 1060;

  constructor() {
    this.resetToSeed();
  }

  public resetToSeed(): { reportsCount: number; incidentsCount: number } {
    // Deep clone initial seed data
    this.reports = JSON.parse(JSON.stringify(INITIAL_REPORTS));
    this.incidents = JSON.parse(JSON.stringify(INITIAL_INCIDENTS));
    this.attachSupportingReports();
    return {
      reportsCount: this.reports.length,
      incidentsCount: this.incidents.length,
    };
  }

  private attachSupportingReports() {
    const reportMap = new Map<string, Report>();
    for (const r of this.reports) {
      reportMap.set(r.id, r);
    }

    for (const inc of this.incidents) {
      inc.supportingReports = inc.supportingReportIds
        .map((id) => reportMap.get(id))
        .filter((r): r is Report => Boolean(r));
    }
  }

  public getReports(): Report[] {
    return this.reports;
  }

  public getIncidents(): Incident[] {
    this.attachSupportingReports();
    return this.incidents;
  }

  public getIncidentById(id: string): Incident | undefined {
    this.attachSupportingReports();
    return this.incidents.find((inc) => inc.id === id);
  }

  public updateIncident(id: string, updates: Partial<Incident>): Incident | null {
    const index = this.incidents.findIndex((inc) => inc.id === id);
    if (index === -1) return null;

    const existing = this.incidents[index];
    const updated: Incident = {
      ...existing,
      ...updates,
      lastUpdatedAt: new Date().toISOString(),
    };

    if (updates.status && updates.status !== existing.status) {
      updated.timeline.push({
        id: `t-${Date.now()}`,
        timestamp: new Date().toISOString(),
        timeFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        title: `Status Updated to ${updates.status}`,
        description: `Authority / Administrator modified status from ${existing.status} to ${updates.status}.`,
        type: 'status_change',
        actor: 'City Operations Admin',
      });
    }

    this.incidents[index] = updated;
    this.attachSupportingReports();
    return updated;
  }

  public addReport(newReportData: Omit<Report, 'id' | 'incidentId' | 'status'>): {
    report: Report;
    incident: Incident;
    isNewCluster: boolean;
    matchedReason?: string;
  } {
    const reportId = `REP-${Date.now().toString().slice(-4)}`;
    const report: Report = {
      ...newReportData,
      id: reportId,
      status: 'pending',
    };

    // Find if it fits an existing incident cluster
    const clusterMatch = findMatchingIncident(report, this.incidents);

    if (clusterMatch.matchedIncident) {
      // Attach to existing cluster
      const target = clusterMatch.matchedIncident;
      report.incidentId = target.id;
      report.status = 'clustered';
      this.reports.push(report);

      target.supportingReportIds.push(report.id);
      target.reportCount = target.supportingReportIds.length;
      target.lastUpdatedAt = new Date().toISOString();

      // Corroborated reports for this cluster
      const allClusterReports = this.reports.filter((r) => r.incidentId === target.id);

      // Re-evaluate emerging status
      const emergingCheck = evaluateEmergingStatus(allClusterReports);
      target.isEmerging = emergingCheck.isEmerging;
      target.growthRate = emergingCheck.growthRate;
      if (emergingCheck.reason) {
        target.emergingReason = emergingCheck.reason;
      }

      // Re-calculate priority score
      target.priorityBreakdown = calculatePriorityScore(
        target.category,
        Math.max(target.severity, report.severity) as any,
        allClusterReports,
        target.isEmerging,
        target.growthRate
      );
      target.priorityScore = target.priorityBreakdown.score;
      target.priorityLevel = target.priorityBreakdown.level;

      // Re-calculate impact radius
      target.impactRadiusMeters = calculateImpactRadius(
        target.category,
        target.severity,
        target.reportCount,
        target.isEmerging
      );

      // Add timeline event
      target.timeline.push({
        id: `t-${Date.now()}`,
        timestamp: new Date().toISOString(),
        timeFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        title: `Related Report #${report.id} Consolidated`,
        description: `Corroborating observation added from ${report.locationName}: "${report.description.slice(0, 70)}..."`,
        type: 'report',
        actor: report.userName || 'Citizen',
      });

      // Update public warning if critical
      if (target.priorityScore >= 70 && !target.publicWarning) {
        target.publicWarning = generatePublicWarning(target);
      }

      this.attachSupportingReports();

      return {
        report,
        incident: target,
        isNewCluster: false,
        matchedReason: clusterMatch.reason,
      };
    } else {
      // Create new incident cluster
      this.incidentCounter++;
      const incidentId = `CP-${this.incidentCounter}`;
      report.incidentId = incidentId;
      report.status = 'clustered';
      this.reports.push(report);

      const relationshipGraph = buildRelationshipGraph(
        report.category,
        report.subtype,
        report.aiSummary || report.description.slice(0, 40)
      );

      const priorityBreakdown = calculatePriorityScore(
        report.category,
        report.severity,
        [report],
        false,
        'STABLE'
      );

      const impactRadius = calculateImpactRadius(report.category, report.severity, 1, false);

      const newIncident: Incident = {
        id: incidentId,
        title: `${report.category}: ${report.subtype || 'Incident'}`,
        category: report.category,
        subtype: report.subtype,
        latitude: report.latitude,
        longitude: report.longitude,
        locationName: report.locationName,
        severity: report.severity,
        confidence: report.aiConfidence,
        priorityScore: priorityBreakdown.score,
        priorityLevel: priorityBreakdown.level,
        reportCount: 1,
        status: 'New',
        firstReportedAt: report.timestamp,
        lastUpdatedAt: report.timestamp,
        growthRate: 'STABLE',
        isEmerging: false,
        impactRadiusMeters: impactRadius,
        supportingReportIds: [report.id],
        priorityBreakdown,
        timeline: [
          {
            id: `t-${Date.now()}`,
            timestamp: report.timestamp,
            timeFormatted: new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            title: 'Initial Citizen Report Registered',
            description: `Initial report logged at ${report.locationName}.`,
            type: 'report',
            actor: report.userName || 'Citizen',
          },
          {
            id: `t-${Date.now() + 1}`,
            timestamp: report.timestamp,
            timeFormatted: new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            title: `Incident Cluster #${incidentId} Initialized`,
            description: 'Spatial-temporal intelligence anchor created.',
            type: 'cluster_created',
          },
        ],
        relationshipGraph,
        relatedCauses: [report.subtype, 'Environmental condition'],
        affectedInfrastructure: [report.locationName],
        publicWarning: priorityBreakdown.score >= 70 ? generatePublicWarning({ ...report, id: incidentId } as any) : undefined,
      };

      this.incidents.unshift(newIncident);
      this.attachSupportingReports();

      return {
        report,
        incident: newIncident,
        isNewCluster: true,
      };
    }
  }

  public mergeIncidents(primaryId: string, secondaryId: string): Incident | null {
    const primaryIdx = this.incidents.findIndex((i) => i.id === primaryId);
    const secondaryIdx = this.incidents.findIndex((i) => i.id === secondaryId);

    if (primaryIdx === -1 || secondaryIdx === -1 || primaryId === secondaryId) {
      return null;
    }

    const primary = this.incidents[primaryIdx];
    const secondary = this.incidents[secondaryIdx];

    // Combine supporting report IDs
    const combinedReportIds = Array.from(
      new Set([...primary.supportingReportIds, ...secondary.supportingReportIds])
    );

    // Update reports in store to point to primary incident
    for (const r of this.reports) {
      if (r.incidentId === secondaryId) {
        r.incidentId = primaryId;
      }
    }

    // Combine timeline events
    const combinedTimeline = [...primary.timeline, ...secondary.timeline].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    combinedTimeline.push({
      id: `evt-${Date.now()}`,
      timestamp: new Date().toISOString(),
      timeFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title: 'Incidents Merged by Authority',
      description: `Authority merged duplicate incident #${secondaryId} (${secondary.title}) into this incident cluster. Combined supporting reports: ${combinedReportIds.length}.`,
      type: 'status_change',
      actor: 'City Operations Authority',
    });

    primary.supportingReportIds = combinedReportIds;
    primary.reportCount = combinedReportIds.length;
    primary.lastUpdatedAt = new Date().toISOString();
    primary.timeline = combinedTimeline;

    // Recalculate priority
    const priorityBreakdown = calculatePriorityScore(
      primary.category,
      primary.severity,
      primary.supportingReports || [],
      primary.isEmerging,
      primary.growthRate
    );
    primary.priorityScore = priorityBreakdown.score;
    primary.priorityLevel = priorityBreakdown.level;
    primary.priorityBreakdown = priorityBreakdown;

    // Remove secondary incident
    this.incidents.splice(secondaryIdx, 1);

    this.attachSupportingReports();
    return primary;
  }

  public dismissReport(reportId: string): boolean {
    const report = this.reports.find((r) => r.id === reportId);
    if (!report) return false;

    report.status = 'dismissed';
    return true;
  }

  public getAnalytics(): AnalyticsSummary {
    const totalReports = this.reports.length;
    const totalIncidents = this.incidents.length;

    // Consolidation noise reduction percentage: (Reports - Incidents) / Reports * 100
    const consolidatedSavingsPercentage =
      totalReports > 0 ? Math.round(((totalReports - totalIncidents) / totalReports) * 100) : 0;

    const activeIncidentsCount = this.incidents.filter(
      (inc) => inc.status !== 'Resolved' && inc.status !== 'Dismissed'
    ).length;

    const emergingIncidentsCount = this.incidents.filter((inc) => inc.isEmerging).length;
    const criticalIncidentsCount = this.incidents.filter((inc) => inc.priorityScore >= 76).length;

    // Category breakdown
    const categoryMap = new Map<string, number>();
    for (const inc of this.incidents) {
      categoryMap.set(inc.category, (categoryMap.get(inc.category) || 0) + 1);
    }
    const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, count]) => ({
      category: category as any,
      count,
      percentage: Math.round((count / totalIncidents) * 100),
    }));

    // Severity breakdown
    const severityLabels: Record<number, string> = {
      1: 'Low',
      2: 'Moderate',
      3: 'Significant',
      4: 'High',
      5: 'Critical',
    };
    const severityMap = new Map<number, number>();
    for (const inc of this.incidents) {
      severityMap.set(inc.severity, (severityMap.get(inc.severity) || 0) + 1);
    }
    const severityBreakdown = [1, 2, 3, 4, 5].map((sev) => ({
      severity: sev as any,
      label: severityLabels[sev],
      count: severityMap.get(sev) || 0,
    }));

    // Status breakdown
    const statusMap = new Map<IncidentStatus, number>();
    for (const inc of this.incidents) {
      statusMap.set(inc.status, (statusMap.get(inc.status) || 0) + 1);
    }
    const statuses: IncidentStatus[] = [
      'New',
      'Investigating',
      'Verified',
      'Action Initiated',
      'Resolved',
      'Dismissed',
    ];
    const statusBreakdown = statuses.map((status) => ({
      status,
      count: statusMap.get(status) || 0,
    }));

    return {
      totalReports,
      totalIncidents,
      consolidatedSavingsPercentage,
      activeIncidentsCount,
      emergingIncidentsCount,
      criticalIncidentsCount,
      categoryBreakdown,
      severityBreakdown,
      statusBreakdown,
    };
  }
}

export const store = new DataStore();
