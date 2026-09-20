import { INITIAL_INCIDENTS, INITIAL_REPORTS } from '../data/seedData';
import { AIAnalysisResult, AnalyticsSummary, Incident, IncidentStatus, Report } from '../types';

export class ApiService {
  private isOfflineFallback = false;
  private localReports: Report[] = [...INITIAL_REPORTS];
  private localIncidents: Incident[] = [...INITIAL_INCIDENTS];

  // Fetch all incidents
  async getIncidents(): Promise<Incident[]> {
    try {
      const res = await fetch('/api/incidents');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.warn('[ApiService] Falling back to local state:', err);
      this.isOfflineFallback = true;
      return this.localIncidents;
    }
  }

  // Fetch single incident
  async getIncidentById(id: string): Promise<Incident | null> {
    try {
      const res = await fetch(`/api/incidents/${id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[ApiService] Local incident lookup:', err);
      return this.localIncidents.find((inc) => inc.id === id) || null;
    }
  }

  // Fetch all reports
  async getReports(): Promise<Report[]> {
    try {
      const res = await fetch('/api/reports');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[ApiService] Local reports lookup:', err);
      return this.localReports;
    }
  }

  // Call Gemini multimodal AI analysis
  async analyzeReportAI(
    description: string,
    imageBase64?: string,
    imageMimeType?: string,
    categoryHint?: string
  ): Promise<AIAnalysisResult> {
    try {
      const res = await fetch('/api/ai/analyze-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          imageBase64,
          imageMimeType: imageMimeType || 'image/jpeg',
          categoryHint,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.analysis;
    } catch (err) {
      console.warn('[ApiService] Fallback AI analysis:', err);
      return {
        category: 'WATER / FLOODING',
        subtype: 'urban flooding',
        title: 'Road Waterlogging & Inundation',
        summary: description || 'Water accumulation observed on street surface.',
        severity: 3,
        confidence: 88,
        tags: ['waterlogging', 'road-hazard'],
        possible_causes: ['Excess rainfall', 'Drainage blockage'],
        recommended_action: 'Dispatch ward drainage maintenance vehicle.',
        safety_verification_note: 'Preliminary analysis requires municipal verification.',
      };
    }
  }

  // Submit citizen report
  async submitReport(reportData: {
    description: string;
    imageUrl?: string;
    latitude: number;
    longitude: number;
    locationName: string;
    category?: string;
    subtype?: string;
    aiSummary?: string;
    aiConfidence?: number;
    severity?: number;
    tags?: string[];
    userName?: string;
  }): Promise<{
    report: Report;
    incident: Incident;
    isNewCluster: boolean;
    matchedReason?: string;
  }> {
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[ApiService] Fallback report creation:', err);
      const newReport: Report = {
        id: `REP-${Math.floor(1000 + Math.random() * 9000)}`,
        userId: 'user-local',
        userName: reportData.userName || 'Citizen Observer',
        description: reportData.description,
        imageUrl: reportData.imageUrl,
        latitude: reportData.latitude,
        longitude: reportData.longitude,
        locationName: reportData.locationName,
        timestamp: new Date().toISOString(),
        category: (reportData.category as any) || 'WATER / FLOODING',
        subtype: reportData.subtype || 'general issue',
        aiSummary: reportData.aiSummary || reportData.description,
        aiConfidence: reportData.aiConfidence || 90,
        severity: (reportData.severity as any) || 3,
        tags: reportData.tags || ['incident'],
        incidentId: 'CP-1042',
        status: 'clustered',
      };
      this.localReports.push(newReport);
      const matched = this.localIncidents[0];
      return {
        report: newReport,
        incident: matched,
        isNewCluster: false,
        matchedReason: 'Consolidated into primary local incident cluster.',
      };
    }
  }

  // Admin update status
  async updateIncident(id: string, updates: Partial<Incident>): Promise<Incident> {
    try {
      const res = await fetch(`/api/incidents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[ApiService] Local incident update:', err);
      const inc = this.localIncidents.find((i) => i.id === id);
      if (inc) Object.assign(inc, updates);
      return inc || (this.localIncidents[0] as Incident);
    }
  }

  // Merge duplicate incidents
  async mergeIncidents(primaryIncidentId: string, secondaryIncidentId: string): Promise<Incident> {
    try {
      const res = await fetch('/api/incidents/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ primaryIncidentId, secondaryIncidentId }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.mergedIncident;
    } catch (err) {
      console.warn('[ApiService] Fallback local merge:', err);
      const primary = this.localIncidents.find((i) => i.id === primaryIncidentId);
      const secondary = this.localIncidents.find((i) => i.id === secondaryIncidentId);
      if (primary && secondary) {
        primary.supportingReportIds = Array.from(new Set([...primary.supportingReportIds, ...secondary.supportingReportIds]));
        primary.reportCount = primary.supportingReportIds.length;
        this.localIncidents = this.localIncidents.filter((i) => i.id !== secondaryIncidentId);
        return primary;
      }
      return this.localIncidents[0];
    }
  }

  // Dismiss report
  async dismissReport(reportId: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/reports/${reportId}/dismiss`, { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return true;
    } catch (err) {
      console.warn('[ApiService] Fallback local report dismiss:', err);
      const rep = this.localReports.find((r) => r.id === reportId);
      if (rep) rep.status = 'dismissed';
      return true;
    }
  }

  // Reset / Seed Demo
  async seedDemoData(): Promise<{ success: boolean; reportsCount: number; incidentsCount: number }> {
    try {
      const res = await fetch('/api/demo/seed', { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[ApiService] Local demo reset:', err);
      this.localReports = JSON.parse(JSON.stringify(INITIAL_REPORTS));
      this.localIncidents = JSON.parse(JSON.stringify(INITIAL_INCIDENTS));
      return { success: true, reportsCount: this.localReports.length, incidentsCount: this.localIncidents.length };
    }
  }

  // Analytics
  async getAnalytics(): Promise<AnalyticsSummary> {
    try {
      const res = await fetch('/api/analytics');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('[ApiService] Local analytics fallback:', err);
      return {
        totalReports: 32,
        totalIncidents: 5,
        consolidatedSavingsPercentage: 84,
        activeIncidentsCount: 5,
        emergingIncidentsCount: 2,
        criticalIncidentsCount: 2,
        categoryBreakdown: [
          { category: 'WATER / FLOODING', count: 1, percentage: 20 },
          { category: 'FIRE / HAZARD', count: 1, percentage: 20 },
          { category: 'GARBAGE / WASTE', count: 1, percentage: 20 },
          { category: 'TRAFFIC / OBSTRUCTION', count: 1, percentage: 20 },
          { category: 'INFRASTRUCTURE DAMAGE', count: 1, percentage: 20 },
        ],
        severityBreakdown: [
          { severity: 1, label: 'Low', count: 0 },
          { severity: 2, label: 'Moderate', count: 0 },
          { severity: 3, label: 'Significant', count: 0 },
          { severity: 4, label: 'High', count: 2 },
          { severity: 5, label: 'Critical', count: 3 },
        ],
        statusBreakdown: [
          { status: 'New', count: 0 },
          { status: 'Investigating', count: 1 },
          { status: 'Verified', count: 2 },
          { status: 'Action Initiated', count: 2 },
          { status: 'Resolved', count: 0 },
          { status: 'Dismissed', count: 0 },
        ],
      };
    }
  }
}

export const api = new ApiService();
