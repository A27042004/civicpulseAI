import { Incident, IncidentCategory, Report } from '../src/types';

// Configurable thresholds as requested in Section 6
export const CLUSTERING_CONFIG = {
  maxDistanceMeters: 800, // 800m spatial radius
  maxTimeDifferenceMs: 2.5 * 60 * 60 * 1000, // 2.5 hours
};

/**
 * Calculates distance between two latitude/longitude pairs using Haversine formula
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Checks if two categories are functionally or causally related
 * e.g. Fire causes Smoke; Flooding causes Traffic obstruction; Garbage chokes Drains
 */
export function areCategoriesRelated(cat1: IncidentCategory, cat2: IncidentCategory): boolean {
  if (cat1 === cat2) return true;

  // Cross-category causal linkages
  const relatedPairs: [IncidentCategory, IncidentCategory][] = [
    ['WATER / FLOODING', 'TRAFFIC / OBSTRUCTION'],
    ['WATER / FLOODING', 'INFRASTRUCTURE DAMAGE'],
    ['GARBAGE / WASTE', 'WATER / FLOODING'],
    ['FIRE / HAZARD', 'AIR POLLUTION / SMOKE'],
    ['FIRE / HAZARD', 'TRAFFIC / OBSTRUCTION'],
    ['INFRASTRUCTURE DAMAGE', 'TRAFFIC / OBSTRUCTION'],
  ];

  return relatedPairs.some(
    ([a, b]) => (cat1 === a && cat2 === b) || (cat1 === b && cat2 === a)
  );
}

/**
 * Determines text overlap score (0 to 1) based on word tokens
 */
export function calculateTextOverlap(textA: string, textB: string): number {
  const wordsA = new Set(textA.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(w => w.length > 3));
  const wordsB = new Set(textB.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(w => w.length > 3));

  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  let common = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) common++;
  }

  return common / Math.min(wordsA.size, wordsB.size);
}

export interface ClusterMatchResult {
  matchedIncident: Incident | null;
  matchScore: number;
  reason: string;
}

/**
 * Finds the best existing Incident cluster for an incoming report
 */
export function findMatchingIncident(
  report: Report,
  activeIncidents: Incident[]
): ClusterMatchResult {
  let bestIncident: Incident | null = null;
  let bestScore = 0;
  let bestReason = '';

  const reportTime = new Date(report.timestamp).getTime();

  for (const incident of activeIncidents) {
    // Only cluster with active/investigating incidents
    if (incident.status === 'Resolved' || incident.status === 'Dismissed') {
      continue;
    }

    const distance = calculateDistanceMeters(
      report.latitude,
      report.longitude,
      incident.latitude,
      incident.longitude
    );

    if (distance > CLUSTERING_CONFIG.maxDistanceMeters) {
      continue;
    }

    const incidentUpdatedTime = new Date(incident.lastUpdatedAt).getTime();
    const timeDiff = Math.abs(reportTime - incidentUpdatedTime);

    if (timeDiff > CLUSTERING_CONFIG.maxTimeDifferenceMs) {
      continue;
    }

    const categoryMatch = report.category === incident.category;
    const categoryRelated = areCategoriesRelated(report.category, incident.category);

    if (!categoryRelated) {
      continue;
    }

    // Distance factor (0 to 40 pts)
    const distanceScore = Math.max(0, 40 * (1 - distance / CLUSTERING_CONFIG.maxDistanceMeters));

    // Category factor (0 to 30 pts)
    const categoryScore = categoryMatch ? 30 : 15;

    // Time factor (0 to 20 pts)
    const timeScore = Math.max(0, 20 * (1 - timeDiff / CLUSTERING_CONFIG.maxTimeDifferenceMs));

    // Text correlation factor (0 to 10 pts)
    const textOverlap = calculateTextOverlap(report.description, incident.title);
    const textScore = textOverlap * 10;

    const totalScore = distanceScore + categoryScore + timeScore + textScore;

    if (totalScore > 50 && totalScore > bestScore) {
      bestScore = totalScore;
      bestIncident = incident;
      bestReason = `Matched within ${Math.round(distance)}m and ${Math.round(timeDiff / 60000)} mins (${categoryMatch ? 'exact category' : 'related category chain'}).`;
    }
  }

  return {
    matchedIncident: bestIncident,
    matchScore: bestScore,
    reason: bestReason,
  };
}
