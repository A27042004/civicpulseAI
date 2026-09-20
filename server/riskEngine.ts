import { GrowthTrend, Incident, IncidentCategory, PriorityBreakdown, PublicWarning, Report, SeverityLevel } from '../src/types';

/**
 * Evaluates growth velocity and whether the cluster qualifies as an EMERGING INCIDENT
 */
export function evaluateEmergingStatus(reports: Report[]): {
  isEmerging: boolean;
  growthRate: GrowthTrend;
  reason: string;
} {
  const count = reports.length;
  if (count <= 1) {
    return {
      isEmerging: false,
      growthRate: 'STABLE',
      reason: 'Single isolated report currently recorded.',
    };
  }

  const now = Date.now();
  const sortedReports = [...reports].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const reportsInLast60Min = reports.filter(
    (r) => now - new Date(r.timestamp).getTime() <= 60 * 60 * 1000
  ).length;

  const criticalOrHighCount = reports.filter((r) => r.severity >= 4).length;
  const uniqueUsers = new Set(reports.map((r) => r.userId)).size;

  // Emerging Rule 1: 3 or more reports within 60 minutes
  const rapidCountTrigger = reportsInLast60Min >= 3;

  // Emerging Rule 2: High or critical severity with multiple independent reports
  const highSeverityMultiUser = criticalOrHighCount >= 2 && uniqueUsers >= 2;

  // Emerging Rule 3: High overall volume
  const highVolumeTrigger = count >= 6;

  const isEmerging = rapidCountTrigger || highSeverityMultiUser || highVolumeTrigger;

  let growthRate: GrowthTrend = 'STABLE';
  if (reportsInLast60Min >= 5 || (reportsInLast60Min >= 3 && count >= 5)) {
    growthRate = 'RAPIDLY INCREASING';
  } else if (reportsInLast60Min >= 2 || count >= 3) {
    growthRate = 'MODERATE';
  } else {
    growthRate = 'STABLE';
  }

  let reason = '';
  if (isEmerging) {
    if (rapidCountTrigger && highSeverityMultiUser) {
      reason = `${reportsInLast60Min} reports logged within the last 60 minutes with multiple independent observers corroborating critical hazard.`;
    } else if (rapidCountTrigger) {
      reason = `Spike in report velocity: ${reportsInLast60Min} citizen reports submitted within the past hour in close proximity.`;
    } else {
      reason = `Corroborated high-severity hazard confirmed by ${uniqueUsers} independent citizens across multiple nearby points.`;
    }
  }

  return { isEmerging, growthRate, reason };
}

/**
 * Computes explainable CivicPulse prototype prioritization score (0 - 100)
 */
export function calculatePriorityScore(
  category: IncidentCategory,
  severity: SeverityLevel,
  reports: Report[],
  isEmerging: boolean,
  growthRate: GrowthTrend
): PriorityBreakdown {
  let score = 0;
  const factors: PriorityBreakdown['factors'] = [];

  // Factor 1: Baseline AI Severity (Up to 35 pts)
  const severityPoints = severity * 7;
  score += severityPoints;
  factors.push({
    name: 'AI Severity Assessment',
    description: `Level ${severity} severity (${severity === 5 ? 'Critical' : severity === 4 ? 'High' : severity === 3 ? 'Significant' : 'Moderate/Low'})`,
    impact: severity >= 4 ? 'critical' : severity === 3 ? 'medium' : 'low',
    applied: true,
  });

  // Factor 2: Citizen Report Volume (Up to 25 pts)
  const reportCount = reports.length;
  const volumePoints = Math.min(25, reportCount * 3);
  score += volumePoints;
  factors.push({
    name: 'Report Volume & Corroboration',
    description: `${reportCount} independent citizen observations consolidated into cluster`,
    impact: reportCount >= 6 ? 'critical' : reportCount >= 3 ? 'high' : 'medium',
    applied: true,
  });

  // Factor 3: Emerging Velocity & Growth (Up to 20 pts)
  let growthPoints = 0;
  if (growthRate === 'RAPIDLY INCREASING') {
    growthPoints = 20;
    factors.push({
      name: 'Rapidly Increasing Growth Rate',
      description: 'Accelerating influx of reports indicating an active escalation',
      impact: 'critical',
      applied: true,
    });
  } else if (growthRate === 'MODERATE') {
    growthPoints = 10;
    factors.push({
      name: 'Moderate Influx Velocity',
      description: 'Steady trickle of reports within the current operational window',
      impact: 'medium',
      applied: true,
    });
  } else {
    growthPoints = 5;
  }
  score += growthPoints;

  // Factor 4: Category Criticality (Up to 20 pts)
  const categoryWeights: Record<IncidentCategory, number> = {
    'FIRE / HAZARD': 20,
    'WATER / FLOODING': 18,
    'AIR POLLUTION / SMOKE': 14,
    'INFRASTRUCTURE DAMAGE': 12,
    'TRAFFIC / OBSTRUCTION': 10,
    'GARBAGE / WASTE': 8,
  };
  const catPoints = categoryWeights[category] || 10;
  score += catPoints;
  factors.push({
    name: 'Domain Threat Profile',
    description: `Category "${category}" baseline public safety and infrastructure risk weight`,
    impact: catPoints >= 16 ? 'high' : 'medium',
    applied: true,
  });

  // Clamp 0 to 100
  score = Math.min(100, Math.max(5, Math.round(score)));

  let level: PriorityBreakdown['level'] = 'Low';
  if (score >= 76) level = 'Critical';
  else if (score >= 51) level = 'High';
  else if (score >= 26) level = 'Moderate';
  else level = 'Low';

  let explanationText = '';
  if (level === 'Critical') {
    explanationText = `CRITICAL PRIORITY: Rapid influx of ${reportCount} corroborating reports in category ${category} with severe community impact. Immediate dispatch required.`;
  } else if (level === 'High') {
    explanationText = `HIGH PRIORITY: Corroborated ${category} incident with ${reportCount} reports and significant infrastructure disruption.`;
  } else if (level === 'Moderate') {
    explanationText = `MODERATE PRIORITY: ${reportCount} reports logged; localized impact identified. Scheduled for municipal queue.`;
  } else {
    explanationText = `LOW PRIORITY: Early or isolated observation. Monitoring for subsequent corroboration.`;
  }

  return {
    score,
    level,
    factors,
    explanationText,
  };
}

/**
 * Heuristic Impact Radius Calculation (in meters)
 * clearly labeled in UI as "Estimated impact area"
 */
export function calculateImpactRadius(
  category: IncidentCategory,
  severity: SeverityLevel,
  reportCount: number,
  isEmerging: boolean
): number {
  let baseRadius = 300; // 300m default

  if (category === 'FIRE / HAZARD' || category === 'AIR POLLUTION / SMOKE') {
    baseRadius = 700; // Smoke/fire plume dispersion
  } else if (category === 'WATER / FLOODING') {
    baseRadius = 600; // Drainage runoff corridor
  } else if (category === 'TRAFFIC / OBSTRUCTION') {
    baseRadius = 500; // Queue tailback
  }

  const severityMultiplier = 1 + (severity - 1) * 0.3;
  const volumeMultiplier = 1 + Math.min(1.5, (reportCount - 1) * 0.1);
  const emergingMultiplier = isEmerging ? 1.25 : 1.0;

  const finalRadius = Math.round(baseRadius * severityMultiplier * volumeMultiplier * emergingMultiplier);
  return Math.min(2500, Math.max(250, finalRadius));
}

/**
 * Synthesizes public warning for high-priority incidents
 */
export function generatePublicWarning(incident: Partial<Incident>): PublicWarning | undefined {
  if (!incident.priorityScore || incident.priorityScore < 50) {
    return undefined;
  }

  const isCritical = incident.priorityScore >= 75;
  const headline = isCritical
    ? `URGENT WARNING: ${incident.title}`
    : `ADVISORY: ${incident.title}`;

  let message = `Multiple citizen reports corroborate ${incident.subtype || incident.category} near ${incident.locationName || 'the reported area'}. `;
  let recommendedAction = 'Exercise caution and consider alternate routes.';

  if (incident.category === 'WATER / FLOODING') {
    message += 'Submerged carriageways and localized inundation reported. Stalled vehicles possible.';
    recommendedAction = 'Avoid low-lying underpasses and use designated bypass corridors.';
  } else if (incident.category === 'FIRE / HAZARD') {
    message += 'Emergency responders engaged. Smoke and localized structural hazards active.';
    recommendedAction = 'Keep clear of emergency lanes. Close windows if downwind.';
  } else if (incident.category === 'AIR POLLUTION / SMOKE') {
    message += 'Air quality degradation reported with heavy particulate matter.';
    recommendedAction = 'Vulnerable individuals and children should stay indoors.';
  } else if (incident.category === 'TRAFFIC / OBSTRUCTION') {
    message += 'Severe vehicular queuing observed.';
    recommendedAction = 'Follow traffic warden diversions.';
  }

  return {
    id: `WARN-${incident.id || Math.floor(1000 + Math.random() * 9000)}`,
    headline,
    message,
    recommendedAction,
    issuedAt: new Date().toISOString(),
    severity: isCritical ? 'Critical' : 'High',
    affectedRoute: incident.locationName,
  };
}
