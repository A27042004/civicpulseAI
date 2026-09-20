import React, { useRef, useState } from 'react';
import { AlertCircle, Camera, CheckCircle2, Crosshair, Droplets, Flame, HardHat, Image as ImageIcon, Info, Layers, Loader2, MapPin, Mic, MicOff, Sparkles, Trash2, Upload, Wind, X, Zap } from 'lucide-react';
import { api } from '../../services/apiService';
import { AIAnalysisResult, Incident, IncidentCategory, LanguageCode, Report } from '../../types';
import { t, translateCategory } from '../../utils/i18n';
import { VoiceAssistant } from './VoiceAssistant';

interface ReportModalProps {
  onClose: () => void;
  onReportSubmitted: (result: { report: Report; incident: Incident; isNewCluster: boolean; matchedReason?: string }) => void;
  language?: LanguageCode;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  onClose,
  onReportSubmitted,
  language = 'en',
}) => {
  const [description, setDescription] = useState('');
  const [imageBase64, setImageBase64] = useState<string | undefined>();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [categoryHint, setCategoryHint] = useState<IncidentCategory | ''>('');
  const [latitude, setLatitude] = useState<number>(19.0765);
  const [longitude, setLongitude] = useState<number>(72.8778);
  const [locationName, setLocationName] = useState<string>('Eastern Express Corridor');
  const [userName, setUserName] = useState<string>('Citizen Observer');
  const [isLocationListening, setIsLocationListening] = useState<boolean>(false);
  const locationRecognitionRef = useRef<any>(null);
  const isLocationListeningRef = useRef<boolean>(false);

  // AI & submission states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    report: Report;
    incident: Incident;
    isNewCluster: boolean;
    matchedReason?: string;
  } | null>(null);

  // Quick Preset Samples for Hackathon Evaluator ease of testing!
  const sampleScenarios = [
    {
      label: '🌊 Flood Report (Highway Underpass)',
      desc: 'Water is starting to collect on the low-lying stretch of Eastern Express Road near Pillar 143. Drains look blocked.',
      cat: 'WATER / FLOODING' as IncidentCategory,
      loc: 'Eastern Express Highway, Pillar 143',
      lat: 19.0763,
      lng: 72.8779,
    },
    {
      label: '🔥 Smoke & Warehouse Fire',
      desc: 'Heavy black smoke billowing from industrial godown in MIDC Phase 2. Burning chemical odor reaching housing society.',
      cat: 'FIRE / HAZARD' as IncidentCategory,
      loc: 'MIDC Phase 2, Plot 85',
      lat: 19.1193,
      lng: 72.9058,
    },
    {
      label: '🗑️ Garbage Choking Street Drain',
      desc: 'Piles of uncollected plastic waste overflowing from market alley into the stormwater inlet drain.',
      cat: 'GARBAGE / WASTE' as IncidentCategory,
      loc: 'Old Market Yard, Sector 4',
      lat: 19.1141,
      lng: 72.8703,
    },
    {
      label: '🚦 Dead Signal at Intersection',
      desc: 'Traffic lights completely offline at major crossroad. Massive 4-way gridlock forming.',
      cat: 'TRAFFIC / OBSTRUCTION' as IncidentCategory,
      loc: 'Shivaji Chowk 4-Way Junction',
      lat: 19.0180,
      lng: 72.8479,
    },
  ];

  const handleApplyPreset = (preset: typeof sampleScenarios[0]) => {
    setDescription(preset.desc);
    setCategoryHint(preset.cat);
    setLocationName(preset.loc);
    setLatitude(preset.lat);
    setLongitude(preset.lng);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const b64 = reader.result as string;
      setImageBase64(b64);
      setImagePreview(b64);
    };
    reader.readAsDataURL(file);
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(Number(pos.coords.latitude.toFixed(4)));
        setLongitude(Number(pos.coords.longitude.toFixed(4)));
        setLocationName(`Current GPS (${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)})`);
      },
      (err) => {
        alert(`Location permission denied or unavailable: ${err.message}`);
      }
    );
  };

  const stopLocationListening = () => {
    isLocationListeningRef.current = false;
    setIsLocationListening(false);
    if (locationRecognitionRef.current) {
      try {
        locationRecognitionRef.current.stop();
      } catch {}
      locationRecognitionRef.current = null;
    }
  };

  const handleToggleLocationVoice = () => {
    if (isLocationListening) {
      stopLocationListening();
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (locationRecognitionRef.current) {
      try {
        locationRecognitionRef.current.abort();
      } catch {}
      locationRecognitionRef.current = null;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    let chosenLocale = 'en-US';
    if (language === 'hi') chosenLocale = 'hi-IN';
    else if (language === 'mr') chosenLocale = 'mr-IN';
    else {
      const nav = typeof navigator !== 'undefined' ? navigator.language : '';
      if (nav && nav.toLowerCase().startsWith('en')) {
        chosenLocale = nav;
      }
    }
    rec.lang = chosenLocale;

    rec.onstart = () => {
      setIsLocationListening(true);
      isLocationListeningRef.current = true;
    };

    rec.onresult = (event: any) => {
      let finalStr = '';
      let interimStr = '';
      for (let i = 0; i < event.results.length; i++) {
        const text = event.results[i][0]?.transcript || '';
        if (event.results[i].isFinal) {
          finalStr += text.trim() + ' ';
        } else {
          interimStr += text.trim() + ' ';
        }
      }
      const combined = (finalStr + interimStr).trim();
      if (combined) {
        setLocationName(combined);
      }
    };

    rec.onerror = (e: any) => {
      console.warn('Location speech recognition error:', e);
      setIsLocationListening(false);
      isLocationListeningRef.current = false;
    };

    rec.onend = () => {
      setIsLocationListening(false);
      isLocationListeningRef.current = false;
    };

    locationRecognitionRef.current = rec;
    try {
      rec.start();
    } catch (err) {
      console.warn('Location recognition start error:', err);
      setIsLocationListening(false);
      isLocationListeningRef.current = false;
    }
  };

  // Run AI analysis preview
  const handleAnalyzeWithAI = async () => {
    if (!description.trim() && !imageBase64) {
      alert('Please enter a description or upload an image first.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await api.analyzeReportAI(
        description,
        imageBase64,
        'image/jpeg',
        categoryHint || undefined
      );
      setAiResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Submit report to system
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      alert('Please enter a brief description of the incident.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Analyze first if not analyzed yet
      let analysis = aiResult;
      if (!analysis) {
        analysis = await api.analyzeReportAI(
          description,
          imageBase64,
          'image/jpeg',
          categoryHint || undefined
        );
      }

      const result = await api.submitReport({
        description,
        imageUrl: imagePreview || undefined,
        latitude,
        longitude,
        locationName,
        category: analysis?.category || categoryHint || 'INFRASTRUCTURE DAMAGE',
        subtype: analysis?.subtype,
        aiSummary: analysis?.summary,
        aiConfidence: analysis?.confidence,
        severity: analysis?.severity,
        tags: analysis?.tags,
        userName,
      });

      setSubmissionResult(result);
      try {
        const saved = JSON.parse(localStorage.getItem('civicpulse_my_reports') || '[]');
        if (!saved.includes(result.report.id)) {
          saved.unshift(result.report.id);
          localStorage.setItem('civicpulse_my_reports', JSON.stringify(saved));
        }
      } catch (e) {
        console.warn('Could not save to localStorage', e);
      }
      onReportSubmitted(result);
    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/95 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base sm:text-lg">
                {t('reportIncident', language)}
              </h2>
              <p className="text-[11px] text-slate-400">
                {t('appSubtitle', language)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {submissionResult ? (
            /* SUCCESS CONFIRMATION & CLUSTERING FEEDBACK */
            <div className="py-6 px-4 text-center space-y-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">
                  {language === 'hi'
                    ? 'रिपोर्ट प्राप्त हुई और एआई द्वारा विश्लेषित की गई!'
                    : language === 'mr'
                    ? 'तक्रार प्राप्त झाली आणि एआय द्वारे तपासली गेली!'
                    : 'Report Received & Analyzed by AI!'}
                </h3>
                <p className="text-slate-400 text-xs mt-1">
                  Report ID: <span className="font-mono text-cyan-400 font-semibold">{submissionResult.report.id}</span>
                </p>
              </div>

              {/* Clustering Intelligence Feedback */}
              <div className="p-4 rounded-xl bg-slate-800/80 border border-cyan-800/60 max-w-lg mx-auto text-left space-y-2">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>
                    {submissionResult.isNewCluster
                      ? language === 'hi'
                        ? 'नया घटना क्लस्टर बनाया गया'
                        : language === 'mr'
                        ? 'नवीन घटना क्लस्टर तयार झाला'
                        : 'New Incident Cluster Created'
                      : language === 'hi'
                        ? 'मौजूदा घटना क्लस्टर में स्वचालित रूप से समूहीकृत किया गया'
                        : language === 'mr'
                        ? 'विद्यमान घटना क्लस्टरमध्ये स्वयंचलितपणे समाविष्ट केले'
                        : 'Automatically Clustered into Existing Incident'}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                  <div className="font-semibold text-white">
                    #{submissionResult.incident.id}: {submissionResult.incident.title}
                  </div>
                  <div className="text-slate-400 mt-0.5">
                    Location: {submissionResult.incident.locationName}
                  </div>
                  <div className="text-cyan-400 font-mono text-[11px] mt-1 font-semibold">
                    Total Supporting Reports: {submissionResult.incident.reportCount}
                  </div>
                </div>

                {submissionResult.matchedReason && (
                  <p className="text-[11px] text-slate-400 italic">
                    Reason: {submissionResult.matchedReason}
                  </p>
                )}
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md transition-colors cursor-pointer"
                >
                  {language === 'hi' ? 'लाइव शहर मानचित्र पर देखें' : language === 'mr' ? 'थेट शहर नकाशावर पहा' : 'View on Live City Map'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Quick Sample Presets */}
              <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1.5">
                <span className="text-slate-400 font-medium block text-[11px]">
                  💡 {language === 'hi' ? 'त्वरित डेमो परिदृश्य (ऑटोफिल के लिए क्लिक करें):' : language === 'mr' ? 'झटपट डेमो पर्याय (ऑटोफिलसाठी क्लिक करा):' : 'Quick Demo Presets (Click to autofill realistic scenario):'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {sampleScenarios.map((sc, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(sc)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-300 text-left text-[11px] truncate transition-colors cursor-pointer"
                    >
                      {sc.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description Field with Voice Assistant */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="describe-what-you-see-input" className="text-slate-200 font-semibold text-xs">
                    {t('descriptionLabel', language)} <span className="text-rose-400">*</span>
                  </label>
                  {description.trim() && (
                    <span className="text-[10px] text-cyan-400 font-mono">
                      {description.trim().split(/\s+/).length} words • {description.length} chars
                    </span>
                  )}
                </div>

                {/* Embedded Voice Assistant */}
                <VoiceAssistant
                  language={language}
                  onTranscript={(text) => setDescription(text)}
                  currentDescription={description}
                />

                <textarea
                  id="describe-what-you-see-input"
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('descriptionPlaceholder', language)}
                  className="w-full p-3 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-sans leading-relaxed shadow-inner"
                />
              </div>

              {/* Multimodal Photo Upload (Drag & Drop or Click) */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1 text-xs">
                  Evidence Photo (Optional, analyzed by Gemini AI Vision)
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-700 hover:border-cyan-500/80 rounded-xl bg-slate-800/50 hover:bg-slate-800 cursor-pointer transition-all">
                    <Upload className="w-5 h-5 text-slate-400 mb-1" />
                    <span className="text-[11px] text-slate-300 font-medium">Click to upload photo</span>
                    <span className="text-[10px] text-slate-500">PNG, JPG or WEBP (Max 10MB)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>

                  {imagePreview && (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-700 shrink-0 bg-black">
                      <img
                        src={imagePreview}
                        alt="Upload Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageBase64(undefined);
                          setImagePreview(null);
                        }}
                        className="absolute top-1 right-1 bg-black/70 hover:bg-black p-0.5 rounded text-white text-[10px]"
                      >
                        &times;
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Location Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                    <label className="text-slate-300 font-semibold text-xs">
                      {t('locationLabel', language)} <span className="text-rose-400">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        id="speak-location-btn"
                        onClick={handleToggleLocationVoice}
                        className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                          isLocationListening
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse ring-1 ring-rose-500/50'
                            : 'bg-slate-800 hover:bg-slate-700 text-cyan-400 border-slate-700'
                        }`}
                      >
                        {isLocationListening ? (
                          <>
                            <MicOff className="w-3 h-3 text-rose-400" />
                            <span>{t('speakingLocation', language)}</span>
                          </>
                        ) : (
                          <>
                            <Mic className="w-3 h-3 text-cyan-400" />
                            <span>{t('speakLocationPrompt', language)}</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleLocateMe}
                        className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px] font-medium cursor-pointer"
                      >
                        <Crosshair className="w-3 h-3" />
                        <span>{t('locateMe', language)}</span>
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    required
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder={t('locationPlaceholder', language)}
                    className={`w-full p-2.5 bg-slate-800 border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-sans transition-all ${
                      isLocationListening ? 'border-rose-500/60 ring-1 ring-rose-500/40' : 'border-slate-700'
                    }`}
                  />
                  {isLocationListening && (
                    <span className="text-[10px] text-rose-400 font-medium block mt-1 animate-pulse">
                      🎙️ {language === 'hi' ? 'स्थान सुन रहे हैं... जैसे ही आप बोलेंगे तुरंत दर्ज होगा' : language === 'mr' ? 'स्थान ऐकत आहोत... आपण बोलताच थेट नोंदवले जाईल' : 'Listening for location... speaking updates this field live'}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 text-xs">
                    {t('observerNameLabel', language)}
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder={t('observerNamePlaceholder', language)}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-sans"
                  />
                </div>
              </div>

              {/* Category Hint / Selector */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1 text-xs">
                  {t('categoryLabel', language)}
                </label>
                <select
                  value={categoryHint}
                  onChange={(e) => setCategoryHint(e.target.value as any)}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
                >
                  <option value="">{t('autoCategoryOption', language)}</option>
                  <option value="WATER / FLOODING">{translateCategory('WATER / FLOODING', language)}</option>
                  <option value="GARBAGE / WASTE">{translateCategory('GARBAGE / WASTE', language)}</option>
                  <option value="AIR POLLUTION / SMOKE">{translateCategory('AIR POLLUTION / SMOKE', language)}</option>
                  <option value="INFRASTRUCTURE DAMAGE">{translateCategory('INFRASTRUCTURE DAMAGE', language)}</option>
                  <option value="FIRE / HAZARD">{translateCategory('FIRE / HAZARD', language)}</option>
                  <option value="TRAFFIC / OBSTRUCTION">{translateCategory('TRAFFIC / OBSTRUCTION', language)}</option>
                </select>
              </div>

              {/* Real-time AI Multimodal Analysis Trigger & Preview */}
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-semibold text-white text-xs">
                      Gemini Multimodal AI Analysis
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAnalyzeWithAI}
                    disabled={isAnalyzing}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <span>{t('aiAnalyzeBtn', language)}</span>
                    )}
                  </button>
                </div>

                {aiResult && (
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5 text-slate-300">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">
                        {translateCategory(aiResult.category, language)} ({aiResult.subtype})
                      </span>
                      <span className="font-mono text-cyan-400 text-[11px]">
                        Severity: {aiResult.severity}/5 • Confidence: {aiResult.confidence}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Summary: {aiResult.summary}
                    </p>
                    <p className="text-[10px] text-amber-300/80 italic">
                      🛡️ Note: {aiResult.safety_verification_note}
                    </p>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
                >
                  {t('cancel', language)}
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-lg shadow-cyan-600/20 transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{t('submittingReport', language)}</span>
                    </>
                  ) : (
                    <span>{t('submitReportBtn', language)}</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
