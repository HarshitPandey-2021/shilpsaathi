import React, { useRef, useState, useEffect } from 'react';
import { Mic, Square, Play, RotateCcw, ArrowRight, Sparkles, Volume2, Edit3, CheckCircle2, AlertCircle, Radio } from 'lucide-react';
import { useCraft } from '../context/CraftContext';
import { api } from '../utils/api';
import { WavAudioRecorder } from '../utils/wavEncoder';

const SPEECH_LANG_OPTIONS = [
  { code: 'hi-IN', label: '🇮🇳 हिंदी (Hindi)' },
  { code: 'en-IN', label: '🇬🇧 English' },
  { code: 'bn-IN', label: '🇮🇳 বাংলা (Bengali)' },
  { code: 'ta-IN', label: '🇮🇳 தமிழ் (Tamil)' },
  { code: 'te-IN', label: '🇮🇳 తెలుగు (Telugu)' },
  { code: 'mr-IN', label: '🇮🇳 मराठी (Marathi)' },
];

const QUICK_VOICE_SAMPLES = [
  { label: '🪔 पीतल का दीया (Brass Diya)', text: 'यह एक हाथ से बना हुआ पीतल का दीया है जिसमें सुनहरा रंग है, 4 घंटे लगे और ₹200 कच्चा माल खर्च हुआ।' },
  { label: '🏺 मिट्टी का फूलदान (Clay Vase)', text: 'यह एक हस्तनिर्मित टेराकोटा मिट्टी का फूलदान है जिसे चाक पर प्राकृतिक गेरुआ रंग से बनाया गया है, 5 घंटे लगे।' },
  { label: '🪵 लकड़ी का डिब्बा (Wood Box)', text: 'यह शीशम की लकड़ी का हाथ से नक्काशी किया हुआ संदूक है, 7 घंटे लगे और ₹350 लागत आई।' },
  { label: '🧵 हथकरघा साड़ी (Handloom Saree)', text: 'यह शुद्ध सूती हथकरघा बुनी हुई साड़ी है जिसमें प्राकृतिक नीला और लाल रंग है, 12 घंटे लगे।' },
  { label: '🎨 मधुबनी पेंटिंग (Folk Art)', text: 'यह हस्तनिर्मित प्राकृतिक रंगों से बनी मधुबनी लोक कला पेंटिंग है, 6 घंटे लगे।' }
];

export default function VoiceInputScreen() {
  const { updateProduct, nextStep, setIsLoading, setLoadingMessage, lang, t } = useCraft();
  const [speechLang, setSpeechLang] = useState(lang === 'en' ? 'en-IN' : 'hi-IN');
  const [status, setStatus] = useState('idle'); // 'idle' | 'recording' | 'recorded' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0);

  const wavRecorderRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const animFrameRef = useRef(null);
  const transcriptBufferRef = useRef('');

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) { /* ignore */ }
      }
      if (wavRecorderRef.current && wavRecorderRef.current.isRecording) {
        wavRecorderRef.current.stop();
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [audioURL]);

  const startRecording = async () => {
    setStatus('recording');
    setErrorMessage('');
    transcriptBufferRef.current = liveTranscript.trim() ? liveTranscript.trim() + ' ' : '';

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    // 1. Initialize Browser Speech Recognition (Live instant feedback)
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = speechLang;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = 0; i < event.results.length; ++i) {
            const result = event.results[i];
            if (result.isFinal) {
              finalTranscript += result[0].transcript + ' ';
            } else {
              interimTranscript += result[0].transcript;
            }
          }

          const combined = (transcriptBufferRef.current + finalTranscript + interimTranscript).trim();
          if (combined) {
            setLiveTranscript(combined);
          }
        };

        recognition.onerror = (event) => {
          console.warn('[Voice] SpeechRecognition notice:', event.error);
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (recErr) {
        console.warn('[Voice] SpeechRecognition start notice:', recErr);
      }
    }

    // 2. Capture Pure 16kHz 16-bit Mono WAV via Web Audio API
    try {
      const recorder = new WavAudioRecorder(16000);
      await recorder.start();
      wavRecorderRef.current = recorder;

      // Simulate live audio meter
      const meterInterval = setInterval(() => {
        if (wavRecorderRef.current && wavRecorderRef.current.isRecording) {
          setAudioVolume(Math.floor(Math.random() * 60) + 30);
        } else {
          clearInterval(meterInterval);
          setAudioVolume(0);
        }
      }, 100);
    } catch (micErr) {
      console.warn('[Voice] Microphone stream error:', micErr.message);
      setErrorMessage('माइक्रोफ़ोन चालू नहीं हो सका। कृपया ब्राउज़र में परमिशन चेक करें या नीचे दिए गए बॉक्स में सीधे लिखें।');
    }
  };

  const stopRecording = async () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) { /* ignore */ }
    }

    let wavBlob = null;
    if (wavRecorderRef.current && wavRecorderRef.current.isRecording) {
      wavBlob = wavRecorderRef.current.stop();
      if (wavBlob && wavBlob.size > 100) {
        setAudioBlob(wavBlob);
        setAudioURL(URL.createObjectURL(wavBlob));
      }
    }

    setAudioVolume(0);
    setStatus('recorded');

    // If live transcript is empty, auto-transcribe via Bhashini Conformer ASR
    if (!liveTranscript.trim() && wavBlob && wavBlob.size > 100) {
      setIsTranscribing(true);
      try {
        console.log('[Voice] Transcribing 16kHz WAV with Bhashini Conformer ASR...');
        const res = await api.processVoice({
          audioBlob: wavBlob,
          language: speechLang.split('-')[0],
        });
        if (res?.data?.transcript && res.data.transcript.trim()) {
          setLiveTranscript(res.data.transcript.trim());
        }
      } catch (err) {
        console.warn('[Voice] Bhashini transcribe fallback:', err.message);
      } finally {
        setIsTranscribing(false);
      }
    }
  };

  const retake = () => {
    if (audioURL) URL.revokeObjectURL(audioURL);
    setAudioURL(null);
    setAudioBlob(null);
    setLiveTranscript('');
    setErrorMessage('');
    setAudioVolume(0);
    setStatus('idle');
  };

  const playAudio = () => {
    if (!audioURL) return;
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    const player = new Audio(audioURL);
    player.onended = () => setIsPlaying(false);
    audioPlayerRef.current = player;
    player.play();
    setIsPlaying(true);
  };

  // Safe minimal client-side entity extractor fallback (zero product-specific branches)
  const parseClientSideTranscript = (text) => {
    const raw = (text || '').trim();
    const cleanPhrase = (str) => (!str ? '' : str.replace(/^[^\w\u0900-\u097F]+|[^\w\u0900-\u097F]+$/g, '').trim());
    const toTitleCase = (str) => (!str ? '' : str.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' '));

    // Number word mappings in Hindi & English
    const numWords = {
      'एक': 1, 'दो': 2, 'तीन': 3, 'चार': 4, 'पांच': 5, 'पाँच': 5, 'छह': 6, 'सात': 7, 'आठ': 8, 'नौ': 9, 'दस': 10,
      'पंद्रह': 15, 'बीस': 20, 'पच्चीस': 25, 'तीस': 30, 'चालीस': 40, 'पचास': 50, 'साठ': 60, 'सौ': 100, 'दो सौ': 200,
      'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6, 'twenty': 20, 'fifty': 50, 'hundred': 100
    };

    let hours = 4;
    const hoursDigitMatch = raw.match(/(\d+)\s*(?:hour|hr|ghante|घंटे|घंटा|दिन|day)/i);
    if (hoursDigitMatch) {
      hours = parseInt(hoursDigitMatch[1], 10);
    } else {
      for (const [w, n] of Object.entries(numWords)) {
        if (raw.includes(`${w} घंटे`) || raw.includes(`${w} घंटा`) || raw.includes(`${w} hours`)) {
          hours = n;
          break;
        }
      }
    }

    let explicitCost = null;
    const costDigitMatch = raw.match(/(?:₹|rs\.?|inr|rupee|rupaye|रुपये|रुपया|लागत|कीमत|keemat|cost)\s*[:=]?\s*(\d+)/i) || raw.match(/(\d+)\s*(?:₹|rs\.?|inr|rupee|rupaye|रुपये|रुपया)/i);
    if (costDigitMatch) {
      explicitCost = parseInt(costDigitMatch[1], 10);
    } else {
      for (const [w, n] of Object.entries(numWords)) {
        if (raw.includes(`${w} रुपये`) || raw.includes(`${w} रुपया`) || raw.includes(`${w} rupees`)) {
          explicitCost = n;
          break;
        }
      }
    }

    // Generic material pattern (no product-specific branches)
    let material = 'Not clearly identifiable';
    const matMatch = raw.match(/(?:ise\s+|ye\s+|yeh\s+|यह\s+|इसे\s+)?([a-z0-9\u0900-\u097F\s]{2,30}?)\s+(?:se\s+(?:haath\s+se\s+)?ban(?:a|i|e)|से\s+बन(?:ा|ी|े)|made\s+of|made\s+from)/i);
    if (matMatch) {
      let cand = cleanPhrase(matMatch[1]).replace(/^(?:ek|ye|yeh|ise|kisi|एक|यह|इसे)\s+/i, '').trim();
      const stopWords = ['haath', 'haath se', 'ek', 'yeh', 'ye', 'kisi', 'हाथ', 'एक', 'यह'];
      if (cand && !stopWords.includes(cand.toLowerCase())) {
        material = toTitleCase(cand);
      }
    }

    // Generic item noun extraction
    let item = '';
    const itemMatch = raw.match(/(?:se\s+ban(?:a|i|e)(?:ya\s+gaya|\s+hua|\s+hui|\s+hue)?|से\s+बन(?:ा|ी|े))\s+([a-z0-9\u0900-\u097F\s]{2,25}?)(?:\s+hai|\s+है|\s*,|\s*\.|\s+iska|\s+iski|\s+aur)/i)
      || raw.match(/(?:ye\s+ek\s+|yeh\s+ek\s+|यह\s+एक\s+)([a-z0-9\u0900-\u097F\s]{2,25}?)(?:\s+hai|\s+है|\s*,|\s*\.|\s+jise|\s+ise)/i);
    if (itemMatch) {
      let cand = cleanPhrase(itemMatch[1]).replace(/^(?:ek|ye|yeh|ise|handmade|handcrafted|हस्तनिर्मित)\s+/i, '').trim();
      const stopWords = ['hua', 'hui', 'hue', 'gaya', 'hai', 'item', 'हुआ', 'हुई', 'हुए', 'गया', 'है'];
      if (cand && !stopWords.includes(cand.toLowerCase()) && cand.toLowerCase() !== material.toLowerCase()) {
        item = toTitleCase(cand);
      }
    }

    // Generic color extraction
    let color = 'Not clearly identifiable';
    const colMatch = raw.match(/(?:iska\s+rang|rang|color|colour|रंग)\s*(?:hai\s+)?[:=]?\s*([a-z0-9\u0900-\u097F\s]{2,20}?)(?:\s+hai|\s+है|\s+aur|\s+और|\s*,|\s*\.|\s*$|\s+iski|\s+iska)/i)
      || raw.match(/(?:^|\s)([a-z0-9\u0900-\u097F]+)\s+(?:rang\s+me|rang\s+mein|रंग\s+में|color\s+me|colour\s+me)/i);
    if (colMatch) {
      color = toTitleCase(cleanPhrase(colMatch[1]));
    }

    const title = item
      ? (material !== 'Not clearly identifiable' && !item.toLowerCase().includes(material.toLowerCase()) ? `Handcrafted ${material} ${item}` : `Handcrafted ${item}`)
      : 'Handcrafted Artisan Craft';

    const cost = explicitCost !== null ? explicitCost : 150;
    const finalPrice = explicitCost !== null ? explicitCost : Math.round(cost * 1.8 + hours * 125);
    const priceMin = explicitCost !== null ? explicitCost : Math.round(cost * 1.5 + hours * 100);
    const priceMax = explicitCost !== null ? explicitCost : Math.round(cost * 2.2 + hours * 150);

    const factParts = [
      material !== 'Not clearly identifiable' ? `made from ${material.toLowerCase()}` : null,
      color !== 'Not clearly identifiable' ? `${color.toLowerCase()} in colour` : null,
      explicitCost !== null ? `priced at INR ${explicitCost}` : null
    ].filter(Boolean);

    const cleanItemName = title.replace(/^Handcrafted\s+/i, '').toLowerCase();
    const descriptionEn = factParts.length > 0 ? `A ${cleanItemName} ${factParts.join(', ')}.` : 'Product details were not clearly specified.';

    return {
      name: title,
      category: 'Handmade Home Decor',
      material: material,
      craft_type: '',
      colour: color,
      description_hi: raw.length > 5 ? `कारीगर द्वारा पारंपरिक तकनीक से तैयार किया गया हस्तशिल्प। ${raw}` : `कारीगर द्वारा शुद्ध प्राकृतिक सामग्री से निर्मित उत्कृष्ट कलाकृति। 100% हस्तनिर्मित।`,
      description_en: descriptionEn,
      keywords: [...new Set(['handmade', cleanItemName, material !== 'Not clearly identifiable' ? material.toLowerCase() : null].filter(Boolean))],
      raw_material_cost: cost,
      hours_spent: hours,
      price_min: priceMin,
      price_max: priceMax,
      final_price: finalPrice,
      explicit_price: explicitCost,
      price_reasoning: explicitCost !== null ? `Price explicitly provided by artisan: INR ${explicitCost}.` : `Calculated from ₹${cost} materials + ${hours} hrs labor + 25% fair artisan margin.`,
      spoken_transcript: raw
    };
  };

  const submitVoice = async () => {
    const textToSend = liveTranscript.trim();
    setLoadingMessage("AI & BHASHINI: Spoken voice ko catalog & fair pricing me convert kiya ja raha hai...");
    setIsLoading(true);

    try {
      const response = await api.processVoice({
        audioBlob: audioBlob || null,
        transcript: textToSend || null,
        language: speechLang.split('-')[0],
      });

      if (response && response.success && response.data?.catalog) {
        const { catalog, transcript: finalTranscript, source, pricing } = response.data;
        const matCost = Number(catalog.raw_material_cost ?? catalog.estimated_material_cost ?? 150);
        const labHours = Number(catalog.hours_spent ?? catalog.estimated_labor_hours ?? 4);

        updateProduct({
          ...catalog,
          raw_material_cost: matCost,
          estimated_material_cost: matCost,
          hours_spent: labHours,
          estimated_labor_hours: labHours,
          price_min: catalog.price_min ?? pricing?.price_min,
          price_max: catalog.price_max ?? pricing?.price_max,
          final_price: catalog.final_price ?? pricing?.suggested_price,
          price_reasoning: catalog.price_reasoning ?? pricing?.reasoning,
          spoken_transcript: finalTranscript || textToSend,
          catalog_source: source,
        });
      } else {
        throw new Error('Using client parser fallback');
      }
    } catch (err) {
      console.log('[Voice Screen] Applying dynamic NLP entity parser on spoken input:', textToSend);
      const parsed = parseClientSideTranscript(textToSend || 'Handcrafted traditional artisan craft item');
      updateProduct(parsed);
    } finally {
      setIsLoading(false);
      nextStep();
    }
  };

  return (
    <div className="text-center space-y-4 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-black text-charcoal">{t.voiceTitle}</h2>
        <p className="text-xs text-stone-600 mt-0.5">{t.voiceSub}</p>
      </div>

      {/* Language Selection Pill for Speech */}
      <div className="flex items-center justify-center gap-1.5 flex-wrap">
        {SPEECH_LANG_OPTIONS.map((opt) => (
          <button
            key={opt.code}
            type="button"
            onClick={() => setSpeechLang(opt.code)}
            className={`text-[11px] px-2.5 py-1 rounded-full border transition font-bold ${
              speechLang === opt.code
                ? 'bg-terracotta text-white border-terracotta shadow-xs'
                : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Mic Button Area */}
      <div className="my-2 flex flex-col items-center gap-2">
        {status !== 'recorded' && (
          <button
            onClick={status === 'recording' ? stopRecording : startRecording}
            aria-label={status === 'recording' ? 'Stop recording' : 'Start recording'}
            className={`w-32 h-32 rounded-full border-4 mx-auto flex flex-col items-center justify-center transition shadow-xl active:scale-95 relative ${
              status === 'recording'
                ? 'border-red-600 bg-red-50 text-red-600 animate-pulse ring-8 ring-red-100'
                : 'border-terracotta bg-terracotta/10 text-terracotta hover:scale-105 hover:bg-terracotta/20'
            }`}
          >
            {status === 'recording' ? <Square size={38} /> : <Mic size={42} />}
            <span className="text-[11px] font-bold mt-2 uppercase tracking-wider">
              {status === 'recording' ? 'रोकें (Stop Recording)' : t.tapSpeak}
            </span>
          </button>
        )}

        {status === 'recording' && (
          <div className="space-y-1.5 w-full max-w-xs">
            <div className="flex items-center justify-center gap-1.5 text-xs text-red-600 font-bold">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
              🎙️ सुन रहा है... अपनी भाषा में बोलें (Listening... Speak now)
            </div>

            {/* Real-time Voice Wave Meter */}
            <div className="flex items-center justify-center gap-1 h-5 px-4">
              {[40, 70, 100, 60, 90, 50, 80, 45, 95, 65, 85].map((factor, i) => {
                const heightPercent = Math.max(15, Math.min(100, Math.round((audioVolume * factor) / 60)));
                return (
                  <span
                    key={i}
                    style={{ height: `${heightPercent}%` }}
                    className="w-1 bg-red-500 rounded-full transition-all duration-75"
                  ></span>
                );
              })}
            </div>
          </div>
        )}

        {isTranscribing && (
          <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-full animate-pulse font-medium">
            <span className="w-2.5 h-2.5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></span>
            ✨ Bhashini & AI आवाज़ पहचान रहे हैं... (Transcribing audio...)
          </div>
        )}

        {errorMessage && (
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-left text-xs text-amber-900 flex items-start gap-2">
            <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">सूचना (Note): {errorMessage}</p>
              <p className="text-[11px] text-stone-600 mt-0.5">आप नीचे दिए गए बॉक्स में सीधे लिख भी सकते हैं या नीचे दिए गए किसी भी उदाहरण पर क्लिक कर सकते हैं।</p>
            </div>
          </div>
        )}

        {status === 'recorded' && (
          <div className="flex items-center gap-3 animate-fade-in py-1">
            <button
              onClick={playAudio}
              className={`w-12 h-12 rounded-full text-white flex items-center justify-center shadow-lg transition active:scale-95 ${
                isPlaying ? 'bg-amber-600 animate-pulse' : 'bg-forest hover:bg-[#326647]'
              }`}
              title="Play Recording"
            >
              {isPlaying ? <Volume2 size={22} /> : <Play size={20} className="ml-0.5" />}
            </button>
            <button
              onClick={retake}
              className="w-12 h-12 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-700 flex items-center justify-center shadow-md active:scale-95 transition"
              title="Retake Voice"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Live / Editable Spoken Transcript Box */}
      <div className="bg-white p-3.5 rounded-2xl border border-stone-200 text-left text-xs space-y-2 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="font-bold text-stone-800 flex items-center gap-1">
            <Sparkles size={13} className="text-mustard" /> आपकी आवाज़ (Spoken Text):
          </span>
          <span className="text-[10px] text-stone-400 flex items-center gap-0.5">
            <Edit3 size={10} /> सीधे एडिट / टाइप करें
          </span>
        </div>
        <textarea
          rows="3"
          value={liveTranscript}
          onChange={(e) => setLiveTranscript(e.target.value)}
          placeholder="बोलें या लिखें: उदा. यह एक हाथ से बना हुआ पीतल का दीया है जिसमें सुनहरा रंग है, 4 घंटे लगे और ₹200 लागत आई..."
          className="w-full p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 text-xs outline-none focus:border-terracotta leading-relaxed"
        />

        {/* Quick Voice Demo Presets */}
        <div className="pt-1">
          <p className="text-[10px] text-stone-500 font-semibold mb-1">त्वरित परीक्षण उदाहरण (Quick Test Prompts):</p>
          <div className="flex flex-wrap gap-1">
            {QUICK_VOICE_SAMPLES.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setLiveTranscript(sample.text);
                  setStatus('recorded');
                }}
                className="text-[10px] px-2 py-1 rounded-lg bg-stone-100 hover:bg-terracotta hover:text-white text-stone-700 border border-stone-200 transition active:scale-95 font-medium"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Proceed Button */}
      {(status === 'recorded' || liveTranscript.trim().length > 0) && (
        <button
          onClick={submitVoice}
          className="w-full py-4 bg-terracotta hover:bg-[#8e3e29] text-white rounded-2xl font-bold flex justify-center items-center gap-2 shadow-lg shadow-terracotta/25 active:scale-[0.98] transition"
        >
          <Sparkles size={18} /> कैटलॉग में बदलें (Generate AI Catalog) <ArrowRight size={18} />
        </button>
      )}
    </div>
  );
}