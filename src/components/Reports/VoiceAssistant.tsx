import React, { useEffect, useRef, useState } from 'react';
import { Check, Mic, MicOff, RotateCcw, Sparkles, Volume2, VolumeX, Radio } from 'lucide-react';
import { LanguageCode } from '../../types';
import { t } from '../../utils/i18n';

interface VoiceAssistantProps {
  language: LanguageCode;
  onTranscript: (text: string) => void;
  currentDescription: string;
}

// Sample voice phrases in each language for quick inspiration or testing
const QUICK_VOICE_PROMPTS: Record<LanguageCode, { text: string; label: string }[]> = {
  en: [
    { label: '🌊 Waterlogging', text: 'Heavy waterlogging near metro station blocking 2 lanes, water level around 2 feet.' },
    { label: '🕳️ Deep Pothole', text: 'Massive open pothole in the middle of the road causing two-wheeler accidents.' },
    { label: '🔥 Smoke Hazard', text: 'Thick black smoke and chemical smell coming from open garbage dumping area.' },
  ],
  hi: [
    { label: '🌊 जलभराव', text: 'मेट्रो स्टेशन के पास सड़क पर बहुत ज्यादा पानी भर गया है और गाड़ियां फंस रही हैं।' },
    { label: '🕳️ गहरा गड्ढा', text: 'सड़क के बीच में खतरनाक खुला गड्ढा और मैनहोल है, जिससे दुर्घटना हो सकती है।' },
    { label: '🔥 धुआं व कचरा', text: 'कूड़े के ढेर में आग लगी है और चारों तरफ काला धुआं फैल रहा है।' },
  ],
  mr: [
    { label: '🌊 पाणी साचले', text: 'रेल्वे स्टेशनजवळ रस्त्यावर खूप पाणी साचले आहे, वाहतूक पूर्णपणे ठप्प झाली आहे.' },
    { label: '🕳️ धोकादायक खड्डा', text: 'रस्त्याच्या मधोमध मोठा खड्डा पडला आहे आणि उघडे मॅनहोल अपघातास कारणीभूत ठरत आहे.' },
    { label: '🔥 कचरा व धूर', text: 'कचऱ्याच्या ढिगाऱ्याला आग लागली असून मोठ्या प्रमाणावर धूर पसरत आहे.' },
  ],
};

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  language,
  onTranscript,
  currentDescription,
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcriptPreview, setTranscriptPreview] = useState<string>('');
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isSpeakingGuide, setIsSpeakingGuide] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recentTranscribed, setRecentTranscribed] = useState<boolean>(false);
  const [completedSentence, setCompletedSentence] = useState<string>('');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [speechDetected, setSpeechDetected] = useState<boolean>(false);

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef<boolean>(false);
  const accumulatedFinalAcrossRestartsRef = useRef<string>('');
  const currentSessionSpokenRef = useRef<string>('');
  const initialTextAtStartRef = useRef<string>('');
  const onTranscriptRef = useRef(onTranscript);
  const currentDescriptionRef = useRef(currentDescription);

  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Keep callback refs fresh
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    currentDescriptionRef.current = currentDescription;
  }, [currentDescription]);

  // Check speech recognition support once on mount
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  // Map app language to optimal speech recognition BCP 47 code
  const getSpeechLocale = (lang: LanguageCode) => {
    if (lang === 'hi') return 'hi-IN';
    if (lang === 'mr') return 'mr-IN';
    const nav = typeof navigator !== 'undefined' ? navigator.language : '';
    if (nav && nav.toLowerCase().startsWith('en')) {
      return nav;
    }
    return 'en-US';
  };

  const commitTranscript = () => {
    const spoken = currentSessionSpokenRef.current.trim();
    if (spoken) {
      const base = initialTextAtStartRef.current.trim();
      const completeSentence = base ? `${base} ${spoken}` : spoken;
      onTranscriptRef.current(completeSentence);
      setCompletedSentence(spoken);
      setRecentTranscribed(true);
      setTimeout(() => setRecentTranscribed(false), 5000);
    }
  };

  // Start real-time audio volume analyzer to prime mic hardware with zero latency
  const startAudioAnalyser = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;

      const audioCtx = new AudioCtxClass();
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.5;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVolume = () => {
        if (!isListeningRef.current) return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const volumePercent = Math.min(100, Math.round((average / 128) * 100));
        setAudioLevel(volumePercent);
        if (volumePercent > 8) {
          setSpeechDetected(true);
        }
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();
    } catch (err) {
      console.warn('Microphone hardware warmup note:', err);
    }
  };

  const stopAudioAnalyser = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }
    setAudioLevel(0);
    setSpeechDetected(false);
  };

  // Always instantiate a FRESH SpeechRecognition instance per session
  // to avoid browser zombie states or InvalidStateError
  const startNewRecognitionSession = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    // Clean up any lingering old instance
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    rec.lang = getSpeechLocale(language);

    rec.onstart = () => {
      setIsListening(true);
      isListeningRef.current = true;
      setErrorMessage(null);
    };

    rec.onresult = (event: any) => {
      let sessionFinal = '';
      let sessionInterim = '';

      // Collect every word from index 0 to length - 1 so no spoken word is ever discarded
      for (let i = 0; i < event.results.length; ++i) {
        const result = event.results[i];
        const transcript = result[0]?.transcript || '';
        if (result.isFinal) {
          sessionFinal += transcript.trim() + ' ';
        } else {
          sessionInterim += transcript.trim() + ' ';
        }
      }

      const combinedSpoken = (
        accumulatedFinalAcrossRestartsRef.current +
        sessionFinal +
        sessionInterim
      ).trim();

      if (combinedSpoken) {
        currentSessionSpokenRef.current = combinedSpoken;
        setTranscriptPreview(combinedSpoken);
        setSpeechDetected(true);

        // Stream words into the target field instantly as spoken
        const base = initialTextAtStartRef.current.trim();
        const fullSentence = base ? `${base} ${combinedSpoken}` : combinedSpoken;
        onTranscriptRef.current(fullSentence);
      }
    };

    rec.onerror = (event: any) => {
      console.warn('Speech recognition event error:', event.error);
      if (event.error === 'not-allowed') {
        isListeningRef.current = false;
        setIsListening(false);
        stopAudioAnalyser();
        setErrorMessage(
          language === 'hi'
            ? 'माइक्रोफ़ोन की अनुमति अस्वीकृत। कृपया ब्राउज़र सेटिंग्स में माइक्रोफ़ोन की अनुमति दें।'
            : language === 'mr'
            ? 'मायक्रोफोन परवानगी नाकारली. कृपया ब्राउझरमध्ये मायक्रोफोन परवानगी द्या.'
            : 'Microphone access denied. Please allow microphone in browser permissions.'
        );
      } else if (event.error === 'no-speech') {
        // Natural pause in speech, keep session listening
      } else if (event.error !== 'aborted') {
        setErrorMessage(`Microphone notice: ${event.error}`);
      }
    };

    rec.onend = () => {
      // If user is still actively recording, restart fresh session immediately
      if (isListeningRef.current) {
        accumulatedFinalAcrossRestartsRef.current = currentSessionSpokenRef.current
          ? currentSessionSpokenRef.current + ' '
          : accumulatedFinalAcrossRestartsRef.current;
        setTimeout(() => {
          if (isListeningRef.current) {
            startNewRecognitionSession();
          }
        }, 80);
        return;
      }

      setIsListening(false);
      isListeningRef.current = false;
      stopAudioAnalyser();
      commitTranscript();
    };

    recognitionRef.current = rec;

    try {
      rec.start();
    } catch (err) {
      console.warn('Failed to start recognition instance:', err);
      isListeningRef.current = false;
      setIsListening(false);
      stopAudioAnalyser();
      setErrorMessage('Could not activate microphone. Please click Speak button again.');
    }
  };

  const startListening = () => {
    setErrorMessage(null);
    setTranscriptPreview('');
    setCompletedSentence('');
    accumulatedFinalAcrossRestartsRef.current = '';
    currentSessionSpokenRef.current = '';
    initialTextAtStartRef.current = currentDescriptionRef.current || '';
    isListeningRef.current = true;
    setIsListening(true);

    startAudioAnalyser();
    startNewRecognitionSession();
  };

  const stopListening = () => {
    isListeningRef.current = false;
    setIsListening(false);
    stopAudioAnalyser();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }

    commitTranscript();
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      stopAudioAnalyser();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  // Text-to-speech audio guidance for citizens
  const speakVoiceGuidance = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeakingGuide) {
      window.speechSynthesis.cancel();
      setIsSpeakingGuide(false);
      return;
    }

    let message =
      'Please speak the problem you are observing clearly. Describe what happened, like heavy waterlogging, thick smoke, open garbage, or broken road.';
    if (language === 'hi') {
      message =
        'कृपया अपनी समस्या स्पष्ट बोलकर बताएं। बताएं कि क्या हुआ है, जैसे भारी जलभराव, धुआं, खुला कचरा या टूटी हुई सड़क।';
    } else if (language === 'mr') {
      message =
        'कृपया आपली समस्या स्पष्टपणे बोलून सांगा. रस्त्यावर पाणी साचले आहे, कचरा आहे की रस्ता खचला आहे ते सांगा.';
    }

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = getSpeechLocale(language);
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeakingGuide(false);
    utterance.onerror = () => setIsSpeakingGuide(false);

    setIsSpeakingGuide(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleApplyPreset = (text: string) => {
    const base = currentDescriptionRef.current.trim();
    const updated = base ? `${base} ${text}` : text;
    onTranscriptRef.current(updated);
    setTranscriptPreview(text);
    setCompletedSentence(text);
    setRecentTranscribed(true);
    setTimeout(() => setRecentTranscribed(false), 3500);
  };

  const handleClearSpeech = () => {
    setTranscriptPreview('');
    setCompletedSentence('');
    currentSessionSpokenRef.current = '';
    accumulatedFinalAcrossRestartsRef.current = '';
  };

  const currentPrompts = QUICK_VOICE_PROMPTS[language] || QUICK_VOICE_PROMPTS.en;
  const wordCount = transcriptPreview.trim() ? transcriptPreview.trim().split(/\s+/).length : 0;

  return (
    <div className="mb-3 p-3.5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-800/95 to-cyan-950/40 border border-cyan-500/30 shadow-inner">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-xl transition-all ${
              isListening
                ? 'bg-rose-500/20 text-rose-400 ring-2 ring-rose-500/50 shadow-lg shadow-rose-500/20 animate-pulse'
                : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
            }`}
          >
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-xs tracking-wide flex items-center gap-1.5">
                {t('voiceAssistant', language)}
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-cyan-900/60 text-cyan-300 font-mono font-normal">
                  {language.toUpperCase()} • {getSpeechLocale(language)}
                </span>
              </span>
              {isListening && (
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                  LIVE RECORDING
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              {isListening
                ? language === 'hi'
                  ? 'माइक सक्रिय है... जैसे ही आप बोलेंगे, हर शब्द तुरंत नीचे और विवरण बॉक्स में दिखाई देगा।'
                  : language === 'mr'
                  ? 'माईक सुरू आहे... आपण बोलताच प्रत्येक शब्द त्वरित खाली व बॉक्समध्ये दिसेल.'
                  : 'Microphone active... start speaking, every word will stream into the box below.'
                : language === 'hi'
                ? 'माइक बटन दबाएं और अपनी समस्या बोलें — पूरा वाक्य अपने-आप दर्ज होगा'
                : language === 'mr'
                ? 'माईक बटण दाबा व समस्या बोला — संपूर्ण वाक्य आपोआप नोंदवले जाईल'
                : 'Click mic to speak your incident — every word is transcribed in real-time'}
            </p>
          </div>
        </div>

        {/* Action Controls: Audio Guide & Mic Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={speakVoiceGuidance}
            title={t('voiceGuidance', language)}
            className={`p-2 rounded-xl border text-xs transition-all cursor-pointer ${
              isSpeakingGuide
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
            }`}
          >
            {isSpeakingGuide ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            )}
          </button>

          <button
            type="button"
            id="voice-mic-trigger-btn"
            onClick={toggleListening}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer ${
              isListening
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/40 ring-2 ring-rose-400'
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-600/30'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4" />
                <span>{t('voiceStopListening', language)}</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span>{t('voiceSpeakPrompt', language)}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Real-time Visualizer & Live Transcription Display */}
      {isListening && (
        <div className="my-2.5 p-3 rounded-xl bg-slate-950 border border-rose-500/40 shadow-lg space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-400">
              {/* Dynamic Equalizer Bar responding to live audio level */}
              <div className="flex items-end gap-0.5 h-4 w-12 bg-slate-900 px-1 py-0.5 rounded border border-slate-800">
                <span
                  className="w-1.5 bg-cyan-400 rounded-t transition-all duration-75"
                  style={{ height: `${Math.max(20, audioLevel)}%` }}
                ></span>
                <span
                  className="w-1.5 bg-rose-500 rounded-t transition-all duration-75"
                  style={{ height: `${Math.max(30, Math.min(100, audioLevel * 1.3))}%` }}
                ></span>
                <span
                  className="w-1.5 bg-amber-400 rounded-t transition-all duration-75"
                  style={{ height: `${Math.max(15, Math.min(100, audioLevel * 0.9))}%` }}
                ></span>
                <span
                  className="w-1.5 bg-indigo-400 rounded-t transition-all duration-75"
                  style={{ height: `${Math.max(25, Math.min(100, audioLevel * 1.1))}%` }}
                ></span>
              </div>

              <span>
                {speechDetected
                  ? language === 'hi'
                    ? 'आवाज पहचानी गई — शब्द स्ट्रीम हो रहे हैं:'
                    : language === 'mr'
                    ? 'आवाज ओळखला — शब्द थेट येत आहेत:'
                    : 'Voice Detected — Streaming Words Live:'
                  : language === 'hi'
                  ? 'माइक तैयार है... कृपया बोलना शुरू करें'
                  : language === 'mr'
                  ? 'माईक तयार आहे... कृपया बोलायला सुरुवात करा'
                  : 'Microphone ready... please speak now'}
              </span>
            </div>

            <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
              {wordCount} {wordCount === 1 ? 'word' : 'words'}
            </span>
          </div>

          <div className="text-xs text-slate-100 font-sans leading-relaxed whitespace-pre-wrap break-words max-h-28 overflow-y-auto bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
            {transcriptPreview ? (
              <span className="text-white font-medium">{transcriptPreview}</span>
            ) : (
              <span className="text-slate-400 italic flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                {language === 'hi'
                  ? 'जैसे ही आप बोलेंगे, हर एक शब्द यहाँ और विवरण बॉक्स में दिखाई देगा...'
                  : language === 'mr'
                  ? 'आपण बोलताच प्रत्येक शब्द येथे व खालील बॉक्समध्ये दिसेल...'
                  : 'Start speaking... words will appear here and in the description box as you talk.'}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Completed Sentence Feedback after stopping */}
      {!isListening && completedSentence && (
        <div className="my-2 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-semibold">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {language === 'hi'
                  ? 'संपूर्ण वाक्य सफलतापूर्वक विवरण में दर्ज किया गया:'
                  : language === 'mr'
                  ? 'संपूर्ण वाक्य यशस्वीरित्या वर्णनात नोंदवले गेले:'
                  : 'Complete sentence recorded into description:'}
              </span>
            </div>
            <p className="text-xs text-slate-200 pl-5 italic font-sans break-words">
              "{completedSentence}"
            </p>
          </div>
          <button
            type="button"
            onClick={handleClearSpeech}
            title="Clear"
            className="p-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {recentTranscribed && !isListening && !completedSentence && (
        <div className="my-1.5 flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{t('voiceTranscribed', language)}</span>
        </div>
      )}

      {errorMessage && (
        <div className="my-1.5 text-xs text-rose-300 bg-rose-950/80 p-2 rounded-lg border border-rose-800">
          {errorMessage}
        </div>
      )}

      {!isSupported && (
        <div className="text-xs text-amber-300/90 bg-amber-950/40 p-2 rounded-lg border border-amber-800/50 mb-1.5">
          ⚠️ {t('voiceNotSupported', language)}
        </div>
      )}

      {/* Fast Voice/Problem Presets */}
      <div className="pt-1 flex items-center gap-1.5 flex-wrap">
        <span className="text-[11px] text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          {t('voiceQuickPresets', language)}
        </span>
        {currentPrompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleApplyPreset(p.text)}
            className="text-[11px] bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700 transition-colors cursor-pointer"
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
};


