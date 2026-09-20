import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronRight, Layers, Sparkles, X } from 'lucide-react';

interface DemoTourModalProps {
  onClose: () => void;
  onTriggerStepAction?: (stepNumber: number) => void;
}

interface Step {
  number: number;
  title: string;
  actionText: string;
  description: string;
  highlightTag: string;
}

export const DemoTourModal: React.FC<DemoTourModalProps> = ({
  onClose,
  onTriggerStepAction,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const steps: Step[] = [
    {
      number: 1,
      title: 'Platform Overview',
      actionText: 'Inspect Dashboard Shell',
      description: 'CivicPulse AI is an AI-powered urban and environmental incident intelligence platform. It transforms noisy, duplicate citizen reports into structured, prioritized, actionable incidents.',
      highlightTag: 'Core Mission',
    },
    {
      number: 2,
      title: 'Load Demo Data',
      actionText: 'Initialize 30+ Corroborated Reports',
      description: 'Click "Load Demo Data" in the top bar to populate realistic multi-category urban incidents (Flooding, Fire, Garbage, Infrastructure, Traffic) across the city grid.',
      highlightTag: 'Data Ingestion',
    },
    {
      number: 3,
      title: 'Live Interactive Map',
      actionText: 'Explore Clusters & Impact Radii',
      description: 'The map displays color-coded incident clusters (green=low, yellow=mod, orange=high, red=critical) with estimated impact radius rings (~1.4 km).',
      highlightTag: 'Spatial Context',
    },
    {
      number: 4,
      title: 'The Core Differentiator',
      actionText: 'Notice 32 Reports → 5 Incidents',
      description: 'Notice the intelligence metric: 32 citizen reports are consolidated into 5 actionable incidents, achieving an immediate 84% reduction in dispatch noise.',
      highlightTag: 'Noise Filter',
    },
    {
      number: 5,
      title: 'Category Filtering',
      actionText: 'Filter by WATER / FLOODING',
      description: 'Use the category filter chips to isolate specific operational domains such as Urban Flooding or Garbage / Waste Accumulation.',
      highlightTag: 'Operational Triage',
    },
    {
      number: 6,
      title: 'Inspect Critical Incident #CP-1042',
      actionText: 'Open Incident Inspector',
      description: 'Click on incident #CP-1042: "Severe Waterlogging & Inundation at Eastern Express Underpass" with 11 supporting reports.',
      highlightTag: 'Consolidated Cluster',
    },
    {
      number: 7,
      title: 'Explainable Prioritization (94/100)',
      actionText: 'Review "Why is this High Priority?"',
      description: 'Examine the transparent scoring breakdown: 11 reports within 65 minutes, multiple independent observers, major highway compromised, submerged electrical transformer.',
      highlightTag: 'Risk Engine',
    },
    {
      number: 8,
      title: 'Chronological Incident Timeline',
      actionText: 'Inspect Timeline Tab',
      description: 'View the timeline tab to see the sequence from first report received at 08:15, cluster creation at 08:30, to escalation at 09:10.',
      highlightTag: 'Temporal Evolution',
    },
    {
      number: 9,
      title: 'Incident Relationship Graph (WOW Feature)',
      actionText: 'Open Relationship Graph Tab',
      description: 'Inspect the causal chain linking: Heavy Precipitation → Drain Blockage → Urban Waterlogging → Arterial Traffic Gridlock.',
      highlightTag: 'Causal Intelligence',
    },
    {
      number: 10,
      title: 'Submit New Citizen Report',
      actionText: 'Click "+ Report Incident"',
      description: 'Click "+ Report Incident", choose a quick demo preset, and run the real-time multimodal Gemini AI analysis.',
      highlightTag: 'Citizen Engagement',
    },
    {
      number: 11,
      title: 'Real-Time Spatial Clustering',
      actionText: 'Observe Auto-Consolidation',
      description: 'Submit the report and watch CivicPulse AI automatically correlate the coordinates and attach it to existing cluster #CP-1042 without creating a duplicate ticket!',
      highlightTag: 'Spatial-Temporal Engine',
    },
    {
      number: 12,
      title: 'Authority Admin Mode',
      actionText: 'Switch to Authority View',
      description: 'Switch roles from "Citizen" to "Authority" in the header to unlock official triage controls and update operational status to "Action Initiated".',
      highlightTag: 'Municipal Workflow',
    },
    {
      number: 13,
      title: 'Broadcast Public Warning',
      actionText: 'View Shareable Alert Card',
      description: 'Review the generated public warning card with clear safety instructions, detour routes, and instant copy/broadcast capability.',
      highlightTag: 'Citizen Safety',
    },
  ];

  const current = steps[currentStepIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/95 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">
                CivicPulse AI Hackathon Evaluation Guide
              </h3>
              <p className="text-[11px] text-slate-400">
                Step {currentStepIndex + 1} of {steps.length}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              STEP {current.number}
            </span>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
              {current.highlightTag}
            </span>
          </div>

          <h4 className="text-base font-bold text-white">
            {current.title}
          </h4>

          <p className="text-xs text-slate-300 leading-relaxed">
            {current.description}
          </p>

          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80 text-cyan-300 font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Target Action: {current.actionText}</span>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/95 flex items-center justify-between">
          <button
            disabled={currentStepIndex === 0}
            onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-1">
            {steps.map((_, idx) => (
              <span
                key={idx}
                onClick={() => setCurrentStepIndex(idx)}
                className={`w-2 h-2 rounded-full cursor-pointer transition-colors ${
                  idx === currentStepIndex ? 'bg-cyan-400 w-4' : 'bg-slate-700 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>

          {currentStepIndex < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1))}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition-colors"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
            >
              Finish Tour
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
