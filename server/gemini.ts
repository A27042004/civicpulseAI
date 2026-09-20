import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { IncidentCategory, SeverityLevel } from '../src/types';

dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export interface AIAnalysisResult {
  category: IncidentCategory;
  subtype: string;
  title: string;
  summary: string;
  severity: SeverityLevel;
  confidence: number;
  tags: string[];
  possible_causes: string[];
  recommended_action: string;
  safety_verification_note: string;
}

/**
 * Robust fallback analyzer when Gemini API key is absent or API call is throttled.
 */
function heuristicFallbackAnalysis(description: string, categoryHint?: IncidentCategory): AIAnalysisResult {
  const text = (description || '').toLowerCase();

  let category: IncidentCategory = categoryHint || 'INFRASTRUCTURE DAMAGE';
  let subtype = 'damaged road';
  let severity: SeverityLevel = 2;
  let confidence = 86;
  const tags: string[] = [];
  const possible_causes: string[] = ['Local environmental degradation', 'Aging civic infrastructure'];
  let recommended_action = 'Municipal inspection team recommended to inspect and verify within 24 hours.';
  let safety_verification_note = 'Preliminary algorithmic classification based on reported keywords. Official verification required.';

  // Water / Flooding
  if (text.includes('flood') || text.includes('water') || text.includes('drain') || text.includes('submerge') || text.includes('waterlog')) {
    category = 'WATER / FLOODING';
    if (text.includes('drain') || text.includes('sewer')) {
      subtype = 'drain overflow';
      tags.push('drain overflow', 'sewer backflow');
    } else if (text.includes('leak') || text.includes('pipe')) {
      subtype = 'water pipeline leakage';
      tags.push('pipe rupture', 'clean water loss');
    } else {
      subtype = 'urban flooding';
      tags.push('flooding', 'waterlogging', 'monsoon runoff');
    }
    severity = text.includes('knee') || text.includes('submerged') || text.includes('stranded') ? 4 : 3;
    recommended_action = 'Dispatch stormwater drainage clearance crew and deploy auxiliary sump pumps.';
    safety_verification_note = 'Report indicates water accumulation. Ground depth and current velocity require municipal verification.';
  }
  // Garbage / Waste
  else if (text.includes('garbage') || text.includes('trash') || text.includes('waste') || text.includes('dump') || text.includes('debris') || text.includes('plastic')) {
    category = 'GARBAGE / WASTE';
    if (text.includes('burn')) {
      subtype = 'garbage burning';
      severity = 4;
      tags.push('open burning', 'smoke emission');
      recommended_action = 'Dispatch fire control or sanitation marshal to suppress open burning.';
    } else if (text.includes('drain')) {
      subtype = 'waste blocking drainage';
      severity = 3;
      tags.push('drain choke', 'debris accumulation');
      recommended_action = 'Clear intake grates before upcoming precipitation.';
    } else {
      subtype = 'garbage pile';
      severity = 2;
      tags.push('uncollected waste', 'sanitation nuisance');
      recommended_action = 'Schedule expedited municipal compactor truck visit.';
    }
    safety_verification_note = 'Reported refuse accumulation requires sanitary field verification.';
  }
  // Fire / Hazard
  else if (text.includes('fire') || text.includes('flame') || text.includes('spark') || text.includes('wire') || text.includes('explosion') || text.includes('electric')) {
    category = 'FIRE / HAZARD';
    if (text.includes('wire') || text.includes('spark') || text.includes('electric')) {
      subtype = 'dangerous exposed wiring';
      severity = 4;
      tags.push('electrical hazard', 'sparking', 'electrocution risk');
      recommended_action = 'Urgent power utility isolation required.';
    } else if (text.includes('chemical') || text.includes('toxic')) {
      subtype = 'chemical spill/leak report';
      severity = 5;
      tags.push('chemical hazard', 'evacuation advisory');
      recommended_action = 'Hazmat containment protocol suggested.';
    } else {
      subtype = 'building fire';
      severity = 5;
      tags.push('active fire', 'emergency suppression');
      recommended_action = 'Immediate fire department dispatch.';
    }
    safety_verification_note = 'Potential life-safety thermal hazard reported. Emergency authority verification required.';
  }
  // Air Pollution / Smoke
  else if (text.includes('smoke') || text.includes('fume') || text.includes('smell') || text.includes('dust') || text.includes('smog') || text.includes('air')) {
    category = 'AIR POLLUTION / SMOKE';
    if (text.includes('chemical') || text.includes('fume') || text.includes('sting')) {
      subtype = 'unusual fumes';
      severity = 4;
      tags.push('airborne irritants', 'chemical fumes');
      recommended_action = 'Issue downwind advisory and investigate industrial discharge.';
    } else if (text.includes('dust') || text.includes('construction')) {
      subtype = 'construction dust';
      severity = 2;
      tags.push('air quality', 'particulate matter');
      recommended_action = 'Enforce dust suppression water sprays on construction contractor.';
    } else {
      subtype = 'heavy smoke';
      severity = 3;
      tags.push('smoke plume', 'reduced visibility');
      recommended_action = 'Locate combustion source and assess air quality sensor readouts.';
    }
    safety_verification_note = 'Reported air quality degradation requires ambient monitoring verification.';
  }
  // Traffic / Obstruction
  else if (text.includes('traffic') || text.includes('jam') || text.includes('blocked') || text.includes('stuck') || text.includes('tree') || text.includes('gridlock')) {
    category = 'TRAFFIC / OBSTRUCTION';
    if (text.includes('tree')) {
      subtype = 'fallen tree';
      severity = 3;
      tags.push('tree fall', 'carriageway blocked');
      recommended_action = 'Deploy horticulture disaster management crew with chain cutters.';
    } else if (text.includes('accident') || text.includes('crash')) {
      subtype = 'accident obstruction';
      severity = 4;
      tags.push('vehicular collision', 'tow truck needed');
      recommended_action = 'Dispatch traffic police and towing unit.';
    } else {
      subtype = 'traffic congestion';
      severity = 3;
      tags.push('corridor delay', 'choke point');
      recommended_action = 'Re-time junction signal cycle and deploy traffic wardens.';
    }
    safety_verification_note = 'Reported vehicular delay requires real-time corridor verification.';
  }
  // Infrastructure Damage
  else {
    category = 'INFRASTRUCTURE DAMAGE';
    if (text.includes('pothole') || text.includes('crater')) {
      subtype = 'pothole';
      severity = text.includes('deep') || text.includes('rebar') || text.includes('puncture') ? 4 : 2;
      tags.push('pothole', 'pavement failure', 'transit hazard');
      recommended_action = 'Issue emergency asphalt cold-patch work order.';
    } else if (text.includes('manhole')) {
      subtype = 'open manhole';
      severity = 5;
      tags.push('open manhole', 'critical puncture trap');
      recommended_action = 'Urgent barricading and replacement of chamber cover.';
    } else if (text.includes('signal') || text.includes('light')) {
      subtype = 'damaged traffic signal';
      severity = 3;
      tags.push('signal dark', 'intersection risk');
      recommended_action = 'Dispatch signal technician to inspect controller junction.';
    } else {
      subtype = 'damaged road';
      severity = 2;
      tags.push('surface degradation');
      recommended_action = 'Inspect and schedule municipal repair.';
    }
    safety_verification_note = 'Reported structural defect requires physical civil engineering verification.';
  }

  const titleWords = description.split(' ').slice(0, 7).join(' ');
  const title = `${category} - ${titleWords ? titleWords + '...' : subtype}`;
  const summary = description.length > 20 ? description : `Reported ${subtype} observed at location. Preliminary observation suggests ${category.toLowerCase()} impact.`;

  return {
    category,
    subtype,
    title,
    summary,
    severity,
    confidence,
    tags,
    possible_causes,
    recommended_action,
    safety_verification_note,
  };
}

/**
 * Analyzes multimodal citizen report using Gemini API (gemini-3.8-flash)
 */
export async function analyzeReportWithGemini(
  description: string,
  imageBase64?: string,
  imageMimeType: string = 'image/jpeg',
  categoryHint?: IncidentCategory
): Promise<AIAnalysisResult> {
  const client = getAiClient();

  if (!client) {
    console.log('[CivicPulse AI] No GEMINI_API_KEY found, using intelligent fallback analysis.');
    return heuristicFallbackAnalysis(description, categoryHint);
  }

  try {
    const prompt = `You are the CivicPulse AI Multimodal Incident Intelligence Engine.
Analyze this citizen report for an urban and environmental incident management system.

Citizen Description: "${description || 'No text provided, examine image if attached.'}"
User Category Hint: "${categoryHint || 'None'}"

CRITICAL RULES:
1. Category MUST be exactly one of these six primary MVP categories:
   - "WATER / FLOODING"
   - "GARBAGE / WASTE"
   - "AIR POLLUTION / SMOKE"
   - "INFRASTRUCTURE DAMAGE"
   - "FIRE / HAZARD"
   - "TRAFFIC / OBSTRUCTION"
2. Severity must be an integer from 1 to 5:
   1 = Low, 2 = Moderate, 3 = Significant, 4 = High, 5 = Critical
3. Confidence must be an integer from 0 to 100.
4. IMPORTANT SAFETY TONE: Never state uncertain visual observations as proven facts.
   Example: Instead of "Dam will fail" or "Chemical contamination proven", use:
   "Visible damage may indicate a potential structural hazard and requires official verification."
5. Return strictly valid JSON conforming to this format:
{
  "category": "WATER / FLOODING",
  "subtype": "urban flooding",
  "title": "Concise 5-8 word title",
  "summary": "1-2 sentence professional analytical summary of the issue",
  "severity": 3,
  "confidence": 92,
  "tags": ["tag1", "tag2", "tag3"],
  "possible_causes": ["Cause A", "Cause B"],
  "recommended_action": "Action for city operations",
  "safety_verification_note": "Carefully worded note reminding that official municipal verification is required"
}`;

    let contentsPayload: any;

    if (imageBase64) {
      // Strip data URI prefix if present
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
      contentsPayload = {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: imageMimeType,
            },
          },
          { text: prompt },
        ],
      };
    } else {
      contentsPayload = prompt;
    }

    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contentsPayload,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const text = response.text?.trim() || '';
    const parsed = JSON.parse(text);

    // Validate category
    const validCategories: IncidentCategory[] = [
      'WATER / FLOODING',
      'GARBAGE / WASTE',
      'AIR POLLUTION / SMOKE',
      'INFRASTRUCTURE DAMAGE',
      'FIRE / HAZARD',
      'TRAFFIC / OBSTRUCTION',
    ];

    const finalCategory = validCategories.includes(parsed.category)
      ? (parsed.category as IncidentCategory)
      : categoryHint || 'INFRASTRUCTURE DAMAGE';

    const severityVal = Number(parsed.severity);
    const validSeverity = (severityVal >= 1 && severityVal <= 5 ? severityVal : 3) as SeverityLevel;
    const confidenceVal = Math.min(100, Math.max(10, Number(parsed.confidence) || 85));

    return {
      category: finalCategory,
      subtype: parsed.subtype || 'general issue',
      title: parsed.title || `${finalCategory} Report`,
      summary: parsed.summary || description,
      severity: validSeverity,
      confidence: confidenceVal,
      tags: Array.isArray(parsed.tags) ? parsed.tags : ['incident'],
      possible_causes: Array.isArray(parsed.possible_causes) ? parsed.possible_causes : ['Civic infrastructure stress'],
      recommended_action: parsed.recommended_action || 'Inspect area and coordinate field resolution.',
      safety_verification_note: parsed.safety_verification_note || 'Ground verification required by municipal authorities.',
    };
  } catch (err) {
    console.error('[CivicPulse AI] Gemini analysis error, falling back to heuristic:', err);
    return heuristicFallbackAnalysis(description, categoryHint);
  }
}
