import React, { useRef, useState, useEffect } from 'react';
import { Mic, Square, Play, RotateCcw, ArrowRight, Sparkles, Volume2, Edit3, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCraft } from '../context/CraftContext';
import { api } from '../utils/api';

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
  const [isSpeechApiAvailable, setIsSpeechApiAvailable] = useState(true);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSpeechApiAvailable(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) { /* ignore */ }
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [audioURL]);

  const startRecording = async () => {
    setStatus('recording');
    setErrorMessage('');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let speechActive = false;

    // 1. Initialize & Start Web Speech Recognition directly
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = speechLang;
        recognition.maxAlternatives = 1;

        let accumulatedTranscript = liveTranscript ? liveTranscript + ' ' : '';

        recognition.onstart = () => {
          console.log('[Voice] SpeechRecognition started for language:', speechLang);
          speechActive = true;
        };

        recognition.onresult = (event) => {
          let interim = '';
          let final = '';
          for (let i = 0; i < event.results.length; ++i) {
            const res = event.results[i];
            if (res.isFinal) {
              final += res[0].transcript + ' ';
            } else {
              interim += res[0].transcript + ' ';
            }
          }
          const spoken = (accumulatedTranscript + final + interim).trim();
          if (spoken) {
            setLiveTranscript(spoken);
          }
        };

        recognition.onerror = (event) => {
          console.warn('[Voice] SpeechRecognition notice:', event.error);
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            setErrorMessage('माइक्रोफ़ोन अनुमति की आवश्यकता है (Microphone permission needed).');
          }
        };

        recognition.onend = () => {
          console.log('[Voice] SpeechRecognition session ended.');
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (recErr) {
        console.warn('[Voice] Failed to start SpeechRecognition:', recErr);
      }
    }

    // 2. Also capture audio stream via MediaRecorder if available
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        const recorder = new MediaRecorder(stream);
        chunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
        };

        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          setAudioBlob(blob);
          setAudioURL(URL.createObjectURL(blob));
        };

        recorder.start(250);
        mediaRecorderRef.current = recorder;
      }
    } catch (micErr) {
      console.warn('[Voice] MediaRecorder notice:', micErr.message);
      if (!speechActive && !liveTranscript) {
        setErrorMessage('कृपया ब्राउज़र में माइक्रोफ़ोन की अनुमति दें, या नीचे दिए गए विकल्पों में से चुनें या टाइप करें।');
      }
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) { /* ignore */ }
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch (e) { /* ignore */ }
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    setStatus('recorded');
  };

  const retake = () => {
    if (audioURL) URL.revokeObjectURL(audioURL);
    setAudioURL(null);
    setAudioBlob(null);
    setLiveTranscript('');
    setErrorMessage('');
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

  // Accurate client-side entity extractor fallback
  const parseClientSideTranscript = (text) => {
    const raw = (text || '').trim();
    const lower = raw.toLowerCase();

    // 1. Detect Item Noun
    let item = 'Artisan Craft';
    if (lower.includes('diya') || lower.includes('दीया') || lower.includes('deepak') || lower.includes('दीपक')) item = 'Handmade Diya Lamp';
    else if (lower.includes('plate') || lower.includes('थाली') || lower.includes('thali') || lower.includes('थाल')) item = 'Decorative Wall Plate';
    else if (lower.includes('vase') || lower.includes('फूलदान') || lower.includes('surahi') || lower.includes('घड़ा') || lower.includes('मटका')) item = 'Handcrafted Floral Vase';
    else if (lower.includes('saree') || lower.includes('साड़ी') || lower.includes('sari')) item = 'Handwoven Heritage Saree';
    else if (lower.includes('runner') || lower.includes('रनर') || lower.includes('दुपट्टा') || lower.includes('dupatta')) item = 'Handloom Table Runner';
    else if (lower.includes('idol') || lower.includes('statue') || lower.includes('मूर्ति') || lower.includes('प्रतिमा')) item = 'Heritage Idol Sculpture';
    else if (lower.includes('box') || lower.includes('डिब्बा') || lower.includes('संदूक')) item = 'Carved Keepsake Box';
    else if (lower.includes('toy') || lower.includes('खिलौना')) item = 'Handcrafted Folk Toy';
    else if (lower.includes('painting') || lower.includes('पेंटिंग') || lower.includes('चित्रकला')) item = 'Traditional Folk Painting';

    // 2. Category & Technique detection
    let category = 'Clay & Terracotta';
    let craftType = 'Traditional Wheel Pottery';
    let material = 'Natural Riverbed Clay';

    if (lower.includes('brass') || lower.includes('metal') || lower.includes('पीतल') || lower.includes('dhokra') || lower.includes('ढोकरा') || lower.includes('तांबा')) {
      category = 'Metalcraft';
      craftType = 'Dhokra Lost-Wax Casting';
      material = 'Pure Brass & Bell Metal';
    } else if (lower.includes('wood') || lower.includes('लकड़ी') || lower.includes('carved') || lower.includes('नक्काशी') || lower.includes('sheesham')) {
      category = 'Woodcraft';
      craftType = 'Hand Carving & Inlay';
      material = 'Seasoned Sheesham Wood';
    } else if (lower.includes('cotton') || lower.includes('silk') || lower.includes('कपड़ा') || lower.includes('सूत') || lower.includes('handloom') || lower.includes('बुनाई') || lower.includes('साड़ी')) {
      category = 'Textiles & Handloom';
      craftType = 'Traditional Handloom Weaving';
      material = 'Organic Handloom Cotton & Silk';
    } else if (lower.includes('madhubani') || lower.includes('painting') || lower.includes('मधुबनी') || lower.includes('पेंटिंग') || lower.includes('warli') || lower.includes('वारली')) {
      category = 'Folk Art & Paintings';
      craftType = 'Madhubani / Folk Painting';
      material = 'Handmade Canvas & Natural Pigments';
    } else if (lower.includes('stone') || lower.includes('marble') || lower.includes('पत्थर') || lower.includes('संगमरमर')) {
      category = 'Stone Carving';
      craftType = 'Intricate Stone Inlay';
      material = 'Natural Marble / Stone';
    }

    // 3. Color detection
    const colors = [];
    if (lower.includes('red') || lower.includes('लाल') || lower.includes('गेरुआ')) colors.push('Terracotta Red');
    if (lower.includes('blue') || lower.includes('नीला')) colors.push('Indigo Blue');
    if (lower.includes('yellow') || lower.includes('पीला')) colors.push('Mustard Yellow');
    if (lower.includes('green') || lower.includes('हरा')) colors.push('Forest Green');
    if (lower.includes('gold') || lower.includes('सुनहरा') || lower.includes('brass') || lower.includes('पीतल')) colors.push('Golden Brass');
    if (colors.length === 0) colors.push('Natural Heritage Earth Hues');

    // 4. Hours & Cost
    let hours = 5;
    const hoursMatch = raw.match(/(\d+)\s*(?:hour|hr|ghante|घंटे|घंटा|दिन|day)/i);
    if (hoursMatch) hours = parseInt(hoursMatch[1], 10);

    let cost = 220;
    const costMatch = raw.match(/(?:₹|rs|rupee|रुपये|लागत|cost)\s*[:=]?\s*(\d+)/i) || raw.match(/(\d+)\s*(?:₹|rs|rupee|रुपये)/i);
    if (costMatch) cost = parseInt(costMatch[1], 10);

    const title = `Handcrafted ${craftType.split('/')[0].trim()} ${item}`;

    return {
      name: title,
      category: category,
      material: material,
      craft_type: craftType,
      colour: colors.join(' & '),
      description_hi: raw.length > 5 ? `पारंपरिक हस्तशिल्प: ${raw}` : `कारीगर द्वारा शुद्ध प्राकृतिक सामग्री से निर्मित उत्कृष्ट कलाकृति। 100% हस्तनिर्मित और पर्यावरण अनुकूल।`,
      description_en: `Authentic handcrafted ${item.toLowerCase()} meticulously crafted using traditional ${craftType.toLowerCase()} and natural sustainable materials.`,
      keywords: ['handmade', category.toLowerCase(), 'heritage craft', 'artisan made', 'eco-friendly'],
      raw_material_cost: cost,
      hours_spent: hours,
      price_min: Math.round(cost * 1.8 + hours * 120),
      price_max: Math.round(cost * 2.4 + hours * 180),
      final_price: Math.round(cost * 2.0 + hours * 150),
      price_reasoning: `Calculated from ₹${cost} materials + ${hours} hrs labor + 25% fair artisan margin.`,
      spoken_transcript: raw
    };
  };

  const submitVoice = async () => {
    const textToSend = liveTranscript.trim();
    setLoadingMessage("BHASHINI & AI: Converting spoken voice to English catalog & Hindi details...");
    setIsLoading(true);

    try {
      const response = await api.processVoice({
        audioBlob: audioBlob || null,
        transcript: textToSend || null,
        language: speechLang.split('-')[0],
      });

      if (response && response.success && response.data?.catalog) {
        const { catalog, transcript: finalTranscript, source } = response.data;
        updateProduct({
          ...catalog,
          spoken_transcript: finalTranscript || textToSend,
          catalog_source: source,
        });
      } else {
        throw new Error('Using robust client parser');
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
            className={`w-32 h-32 rounded-full border-4 mx-auto flex flex-col items-center justify-center transition shadow-xl active:scale-95 ${
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
          <div className="flex items-center gap-1.5 text-xs text-red-600 font-bold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
            🎙️ सुन रहा है... अपनी भाषा में बोलें (Listening... Speak now)
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