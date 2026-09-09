import React, { useRef, useState, useEffect } from 'react';
import { Mic, Square, Play, RotateCcw, ArrowRight, Sparkles, Volume2, Edit3, AlertCircle } from 'lucide-react';
import { useCraft } from '../context/CraftContext';
import { api } from '../utils/api';
import ScreenHeader from '../components/ui/ScreenHeader';

const SPEECH_LANG_OPTIONS = [
  { code: 'hi-IN', label: 'हिंदी' }, { code: 'en-IN', label: 'English' },
  { code: 'bn-IN', label: 'বাংলা' }, { code: 'ta-IN', label: 'தமிழ்' },
  { code: 'te-IN', label: 'తెలుగు' }, { code: 'mr-IN', label: 'मराठी' },
];
const VOICE_SAMPLES = {
  'hi-IN': [
      { label: '👜 काला बैग', text: 'यह हाथ से बना काला बैग है, सूती कपड़े का, 5 घंटे लगे और ₹300 का कच्चा माल लगा।' },
    { label: '🪔 पीतल का दीया', text: 'यह एक हाथ से बना हुआ पीतल का दीया है जिसमें सुनहरा रंग है, 4 घंटे लगे और ₹200 कच्चा माल खर्च हुआ।' },
    { label: '🏺 मिट्टी का फूलदान', text: 'यह एक हस्तनिर्मित टेराकोटा मिट्टी का फूलदान है जिसे चाक पर प्राकृतिक गेरुआ रंग से बनाया गया है, 5 घंटे लगे।' },
    { label: '🪵 लकड़ी का डिब्बा', text: 'यह शीशम की लकड़ी का हाथ से नक्काशी किया हुआ संदूक है, 7 घंटे लगे और ₹350 लागत आई।' },
    { label: '🧵 हथकरघा साड़ी', text: 'यह शुद्ध सूती हथकरघा बुनी हुई साड़ी है जिसमें प्राकृतिक नीला रंग है, 12 घंटे लगे।' },
  ],
  'en-IN': [
    { label: '👜 Black Bag', text: 'This is a handmade black bag made from cotton fabric, took 5 hours and ₹300 of raw material.' },
    { label: '🪔 Brass Diya', text: 'This is a handmade brass diya in golden colour, took 4 hours and ₹200 of raw material.' },
    { label: '🏺 Clay Vase', text: 'This is a handcrafted terracotta clay vase made on the wheel in natural ochre colour, took 5 hours.' },
    { label: '🪵 Wooden Box', text: 'This is a hand-carved sheesham wood box, took 7 hours and cost ₹350.' },
    { label: '🧵 Handloom Saree', text: 'This is a pure cotton handloom saree in natural blue colour, took 12 hours.' },
  ],
  'bn-IN': [
    { label: '🏺 মাটির ফুলদানি', text: 'এটি হাতে তৈরি টেরাকোটা মাটির ফুলদানি, প্রাকৃতিক গেরুয়া রঙের, ৫ ঘণ্টা লেগেছে।' },
    { label: '🧵 তাঁতের শাড়ি', text: 'এটি খাঁটি সুতির তাঁতের শাড়ি, নীল রঙের, ১২ ঘণ্টা লেগেছে।' },
  ],
  'ta-IN': [
    { label: '🏺 களிமண் ஜாடி', text: 'இது கையால் செய்யப்பட்ட களிமண் பூச்சாடி, இயற்கை மஞ்சள் நிறம், 5 மணி நேரம் ஆனது.' },
    { label: '🧵 கைத்தறி புடவை', text: 'இது தூய பருத்தி கைத்தறி புடவை, நீல நிறம், 12 மணி நேரம் ஆனது.' },
  ],
  'te-IN': [
    { label: '🏺 మట్టి కుండ', text: 'ఇది చేతితో తయారు చేసిన మట్టి కుండ, సహజ గోధుమ రంగు, 5 గంటలు పట్టింది.' },
    { label: '🧵 చేనేత చీర', text: 'ఇది స్వచ్ఛమైన పత్తి చేనేత చీర, నీలం రంగు, 12 గంటలు పట్టింది.' },
  ],
  'mr-IN': [
    { label: '🏺 मातीचे फुलदाणी', text: 'ही हाताने बनवलेली मातीची फुलदाणी आहे, नैसर्गिक गेरू रंगाची, ५ तास लागले.' },
    { label: '🧵 हातमाग साडी', text: 'ही शुद्ध सुती हातमाग साडी आहे, निळ्या रंगाची, १२ तास लागले.' },
  ],
};

export default function VoiceInputScreen() {
  const { updateProduct, nextStep, setIsLoading, setLoadingMessage, lang, t } = useCraft();
  const [speechLang, setSpeechLang] = useState(lang === 'en' ? 'en-IN' : `${lang}-IN`);
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [audioURL, setAudioURL] = useState(null);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [vol, setVol] = useState(0);

  const recorderRef = useRef(null);
  const recognitionRef = useRef(null);
  const playerRef = useRef(null);
  const bufferRef = useRef('');
  const blobRef = useRef(null);          // FIX: ref, not state — no stale closure
  const audioCtxRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => () => {
    try { recognitionRef.current?.abort(); } catch {}
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    audioCtxRef.current?.close().catch(() => {});
    if (audioURL) URL.revokeObjectURL(audioURL);
  }, [audioURL]);

  const startRecording = async () => {
    setStatus('recording');
    setErrorMessage('');
    bufferRef.current = liveTranscript.trim() ? liveTranscript.trim() + ' ' : '';

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      try {
        const r = new SR();
               r.continuous = true; r.interimResults = true; r.lang = speechLang; r.maxAlternatives = 3;
        r.onresult = (e) => {
          let fin = '', int = '';
          for (let i = 0; i < e.results.length; i++) {
            const res = e.results[i];
            if (res.isFinal) fin += res[0].transcript + ' '; else int += res[0].transcript;
          }
          const combined = (bufferRef.current + fin + int).trim();
          if (combined) setLiveTranscript(combined);
        };
        r.onerror = (e) => console.warn('[Voice] SR:', e.error);
        r.start();
        recognitionRef.current = r;
      } catch (e) { console.warn('[Voice] SR start:', e); }
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      const chunks = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      rec.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        blobRef.current = blob;
        setAudioURL(URL.createObjectURL(blob));
        stream.getTracks().forEach((tr) => tr.stop());
      };
      rec.start();
      recorderRef.current = rec;

      // FIX: real level meter instead of Math.random()
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      ctx.createMediaStreamSource(stream).connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (const v of data) sum += (v - 128) ** 2;
        setVol(Math.min(100, Math.sqrt(sum / data.length) * 4));
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch (err) {
      console.warn('[Voice] mic:', err.message);
      setErrorMessage(t.micError);
      setStatus('idle');
    }
  };

  const stopRecording = async () => {
    try { recognitionRef.current?.stop(); } catch {}
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    audioCtxRef.current?.close().catch(() => {});
    setVol(0);
    setStatus('recorded');

    await new Promise((r) => setTimeout(r, 250));   // let onstop populate blobRef

    if (!liveTranscript.trim() && blobRef.current?.size > 100) {
      setIsTranscribing(true);
      try {
        const res = await api.processVoice({ audioBlob: blobRef.current, language: speechLang.split('-')[0] });
        if (res?.data?.transcript?.trim()) setLiveTranscript(res.data.transcript.trim());
      } catch (e) { console.warn('[Voice] ASR fallback:', e.message); }
      finally { setIsTranscribing(false); }
    }
  };

  const retake = () => {
    if (audioURL) URL.revokeObjectURL(audioURL);
    setAudioURL(null); blobRef.current = null;
    setLiveTranscript(''); setErrorMessage(''); setVol(0); setStatus('idle');
  };

  const playAudio = () => {
    if (!audioURL) return;
    playerRef.current?.pause();
    const p = new Audio(audioURL);
    p.onended = () => setIsPlaying(false);
    playerRef.current = p; p.play(); setIsPlaying(true);
  };

  // ---- keep your existing extractor exactly as-is ----
  const parseClientSideTranscript = (text) => {
    const raw = (text || '').trim();
    const cleanPhrase = (s) => (!s ? '' : s.replace(/^[^\w\u0900-\u097F]+|[^\w\u0900-\u097F]+$/g, '').trim());
    const toTitleCase = (s) => (!s ? '' : s.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' '));
    const numWords = { 'एक':1,'दो':2,'तीन':3,'चार':4,'पांच':5,'पाँच':5,'छह':6,'सात':7,'आठ':8,'नौ':9,'दस':10,'पंद्रह':15,'बीस':20,'पच्चीस':25,'तीस':30,'चालीस':40,'पचास':50,'साठ':60,'सौ':100,'one':1,'two':2,'three':3,'four':4,'five':5,'six':6,'twenty':20,'fifty':50,'hundred':100 };

    let hours = 4;
    const hm = raw.match(/(\d+)\s*(?:hour|hr|ghante|घंटे|घंटा|दिन|day)/i);
    if (hm) hours = parseInt(hm[1], 10);
    else for (const [w, n] of Object.entries(numWords)) if (raw.includes(`${w} घंटे`) || raw.includes(`${w} घंटा`) || raw.includes(`${w} hours`)) { hours = n; break; }

    let explicitCost = null;
    const cm = raw.match(/(?:₹|rs\.?|inr|rupee|rupaye|रुपये|रुपया|लागत|कीमत|keemat|cost)\s*[:=]?\s*(\d+)/i) || raw.match(/(\d+)\s*(?:₹|rs\.?|inr|rupee|rupaye|रुपये|रुपया)/i);
    if (cm) explicitCost = parseInt(cm[1], 10);
    else for (const [w, n] of Object.entries(numWords)) if (raw.includes(`${w} रुपये`) || raw.includes(`${w} रुपया`) || raw.includes(`${w} rupees`)) { explicitCost = n; break; }

    let material = 'Not clearly identifiable';
    const mm = raw.match(/(?:ise\s+|ye\s+|yeh\s+|यह\s+|इसे\s+)?([a-z0-9\u0900-\u097F\s]{2,30}?)\s+(?:se\s+(?:haath\s+se\s+)?ban(?:a|i|e)|से\s+बन(?:ा|ी|े)|made\s+of|made\s+from)/i);
    if (mm) {
      const c = cleanPhrase(mm[1]).replace(/^(?:ek|ye|yeh|ise|kisi|एक|यह|इसे)\s+/i, '').trim();
      if (c && !['haath','haath se','ek','yeh','ye','kisi','हाथ','एक','यह'].includes(c.toLowerCase())) material = toTitleCase(c);
    }

    let item = '';
    const im = raw.match(/(?:se\s+ban(?:a|i|e)(?:ya\s+gaya|\s+hua|\s+hui|\s+hue)?|से\s+बन(?:ा|ी|े))\s+([a-z0-9\u0900-\u097F\s]{2,25}?)(?:\s+hai|\s+है|\s*,|\s*\.|\s+iska|\s+iski|\s+aur)/i)
      || raw.match(/(?:ye\s+ek\s+|yeh\s+ek\s+|यह\s+एक\s+)([a-z0-9\u0900-\u097F\s]{2,25}?)(?:\s+hai|\s+है|\s*,|\s*\.|\s+jise|\s+ise)/i);
    if (im) {
      const c = cleanPhrase(im[1]).replace(/^(?:ek|ye|yeh|ise|handmade|handcrafted|हस्तनिर्मित)\s+/i, '').trim();
      if (c && !['hua','hui','hue','gaya','hai','item','हुआ','हुई','हुए','गया','है'].includes(c.toLowerCase()) && c.toLowerCase() !== material.toLowerCase()) item = toTitleCase(c);
    }

    let color = 'Not clearly identifiable';
    const colm = raw.match(/(?:iska\s+rang|rang|color|colour|रंग)\s*(?:hai\s+)?[:=]?\s*([a-z0-9\u0900-\u097F\s]{2,20}?)(?:\s+hai|\s+है|\s+aur|\s+और|\s*,|\s*\.|\s*$|\s+iski|\s+iska)/i)
      || raw.match(/(?:^|\s)([a-z0-9\u0900-\u097F]+)\s+(?:rang\s+me|rang\s+mein|रंग\s+में|color\s+me|colour\s+me)/i);
    if (colm) color = toTitleCase(cleanPhrase(colm[1]));

    const title = item
      ? (material !== 'Not clearly identifiable' && !item.toLowerCase().includes(material.toLowerCase()) ? `Handcrafted ${material} ${item}` : `Handcrafted ${item}`)
      : 'Handcrafted Artisan Craft';
    const cost = explicitCost !== null ? explicitCost : 150;
    const parts = [
      material !== 'Not clearly identifiable' ? `made from ${material.toLowerCase()}` : null,
      color !== 'Not clearly identifiable' ? `${color.toLowerCase()} in colour` : null,
      explicitCost !== null ? `priced at INR ${explicitCost}` : null,
    ].filter(Boolean);
    const cleanItem = title.replace(/^Handcrafted\s+/i, '').toLowerCase();

    return {
      name: title, category: 'Handmade Home Decor', material, craft_type: 'handmade', colour: color,
      description_hi: raw.length > 5 ? `पारंपरिक तकनीक और कुशल हस्तशिल्प से तैयार किया गया प्रामाणिक ${cleanItem || 'शिल्प'}। 100% हस्तनिर्मित व टिकाऊ।` : `कारीगर द्वारा शुद्ध प्राकृतिक सामग्री से निर्मित उत्कृष्ट कलाकृति। 100% हस्तनिर्मित।`,
      description_en: parts.length ? `An authentic handcrafted ${cleanItem || 'heritage item'}, carefully made ${parts.join(', ')}.` : 'Authentic handcrafted heritage item made by traditional artisans.',
      keywords: [...new Set(['handmade', cleanItem, material !== 'Not clearly identifiable' ? material.toLowerCase() : null].filter(Boolean))],
      raw_material_cost: cost, hours_spent: hours,
      extracted_facts: { labor_hours: hours, material_cost_inr: cost, explicit_price: explicitCost },
      price_min: explicitCost ?? Math.round(cost * 1.5 + hours * 100),
      price_max: explicitCost ?? Math.round(cost * 2.2 + hours * 150),
      final_price: explicitCost ?? Math.round(cost * 1.8 + hours * 125),
      explicit_price: explicitCost,
      price_reasoning: explicitCost !== null ? `Price provided by artisan: INR ${explicitCost}.` : `₹${cost} materials + ${hours} hrs labour + 25% fair margin.`,
      spoken_transcript: raw,
      is_ai_generated: false,
      pricing_method: 'heuristic',
    };
  };

  const submitVoice = async () => {
    setLoadingMessage(t.genCatalog);
    setIsLoading(true);
    const tr = liveTranscript.trim();
    const sourceLanguage = speechLang.split('-')[0] || lang || 'hi';
    const targetLanguage = lang === 'hi' ? 'en' : lang;

    try {
      const result = await api.processVoice({
        audioBlob: blobRef.current,
        transcript: tr || null,
        language: sourceLanguage,
        targetLanguage,
      });
      if (!result?.success || !result.data) throw new Error('no structured data');

      const serverCatalog = result.data.catalog || {};
      const facts = result.data.extracted_facts || serverCatalog.extracted_facts || {};
      const labHours = Number(facts.labor_hours ?? facts.laborHours ?? serverCatalog.hours_spent ?? 4);
      const matCost = Number(facts.material_cost_inr ?? facts.materialCostINR ?? serverCatalog.raw_material_cost ?? 150);

      updateProduct({
        ...serverCatalog,
        raw_material_cost: matCost,
        hours_spent: labHours,
        extracted_facts: facts,
        spoken_transcript: tr || result.data.transcript || serverCatalog.spoken_transcript,
        is_ai_generated: result.data.is_ai_generated ?? serverCatalog.is_ai_generated ?? false,
        llm_provider: result.data.llm_provider ?? serverCatalog.llm_provider ?? 'none',
        ai_pricing: result.data.ai_pricing || null,
        heuristic_pricing: result.data.heuristic_pricing || result.data.pricing || null,
        pricing_method: result.data.ai_pricing?.is_ai_available ? 'ai' : 'heuristic',
        final_price: serverCatalog.final_price || result.data.ai_pricing?.suggested_price || result.data.heuristic_pricing?.suggested_price || 0,
        price_min: serverCatalog.price_min || result.data.ai_pricing?.price_min || result.data.heuristic_pricing?.price_min || 0,
        price_max: serverCatalog.price_max || result.data.ai_pricing?.price_max || result.data.heuristic_pricing?.price_max || 0,
        price_reasoning: serverCatalog.price_reasoning || result.data.ai_pricing?.reasoning || result.data.heuristic_pricing?.reasoning || '',
      });
    } catch (err) {
      console.warn('[Voice] fallback extractor:', err.message);
      const ex = parseClientSideTranscript(tr);
      updateProduct({
        ...ex,
        spoken_transcript: tr,
        is_ai_generated: false,
        llm_provider: 'none',
      });
    } finally {
      setIsLoading(false);
      nextStep();
    }
  };

  return (
    <div className="space-y-4 animate-fade-in-up">
      <ScreenHeader title={t.voiceTitle} subtitle={t.voiceSub} step={3} totalSteps={6} speak={t.voiceExample} />

      <div className="flex flex-wrap justify-center gap-1.5">
        {SPEECH_LANG_OPTIONS.map((o) => (
          <button
            key={o.code}
            onClick={() => setSpeechLang(o.code)}
            className={`chip ${speechLang === o.code ? 'border-terracotta bg-terracotta text-white' : 'border-stone-200 bg-white text-stone-600'}`}
          >
            {o.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center gap-3 py-2">
        {status !== 'recorded' && (
          <button
            onClick={status === 'recording' ? stopRecording : startRecording}
            className={`relative flex h-36 w-36 flex-col items-center justify-center gap-2 rounded-full border-4 shadow-lift transition active:scale-95 ${
              status === 'recording' ? 'border-red-500 bg-red-50 text-red-600' : 'border-terracotta bg-terracotta-50 text-terracotta'
            }`}
          >
            {status === 'recording' && (
              <span
                className="pointer-events-none absolute inset-0 rounded-full bg-red-400/25 transition-transform duration-75"
                style={{ transform: `scale(${1 + vol / 130})` }}
              />
            )}
            {status === 'recording' ? <Square size={36} /> : <Mic size={42} strokeWidth={2.2} />}
            <span className="text-[11px] font-black uppercase tracking-wider">
              {status === 'recording' ? t.stopRec : t.tapSpeak}
            </span>
          </button>
        )}

        {status === 'recording' && (
          <p className="flex items-center gap-2 text-xs font-bold text-red-600">
            <span className="h-2 w-2 animate-ping rounded-full bg-red-600" /> {t.listeningNow}
          </p>
        )}

        {isTranscribing && (
          <p className="chip animate-breathe border-mustard-200 bg-mustard-50 text-mustard-700">
            <span className="h-2.5 w-2.5 animate-spin rounded-full border-2 border-mustard-500 border-t-transparent" />
            {t.transcribing}
          </p>
        )}

        {errorMessage && (
          <div className="flex w-full gap-2.5 rounded-3xl border border-amber-200 bg-amber-50 p-3.5 text-left">
            <AlertCircle size={17} className="mt-0.5 shrink-0 text-amber-600" />
            <p className="text-2xs leading-relaxed text-amber-900">{errorMessage}</p>
          </div>
        )}

        {status === 'recorded' && (
          <div className="flex items-center gap-3 animate-fade-in">
            <button onClick={playAudio} className={`flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lift active:scale-95 ${isPlaying ? 'animate-breathe bg-mustard-500' : 'bg-forest'}`}>
              {isPlaying ? <Volume2 size={22} /> : <Play size={22} className="ml-0.5" />}
            </button>
            <button onClick={retake} className="flex h-14 w-14 items-center justify-center rounded-full bg-stone-200 text-stone-700 shadow-card active:scale-95">
              <RotateCcw size={20} />
            </button>
          </div>
        )}
      </div>

      <div className="space-y-2.5 rounded-3xl border border-stone-200 bg-white p-4 text-left shadow-card">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-black text-charcoal">
            <Sparkles size={14} className="text-mustard-500" /> {t.yourVoice}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-stone-400">
            <Edit3 size={11} /> {t.editHint}
          </span>
        </div>
        <textarea
          rows="3"
          value={liveTranscript}
          onChange={(e) => setLiveTranscript(e.target.value)}
          placeholder={t.voiceExample}
          className="field-input resize-none text-xs leading-relaxed"
        />
        <div>
          <p className="mb-1.5 text-[10px] font-bold text-stone-500">{t.quickTests}</p>
          <div className="flex flex-wrap gap-1.5">
                        {(VOICE_SAMPLES[speechLang] || VOICE_SAMPLES['en-IN']).map((s, i) => (
              <button
                key={i}
                onClick={() => { setLiveTranscript(s.text); setStatus('recorded'); }}
                className="chip border-stone-200 bg-stone-50 text-stone-700 hover:bg-terracotta hover:text-white"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>
            {liveTranscript.trim().length > 0 && liveTranscript.trim().length < 25 && (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-2xs font-semibold text-amber-800">
          {t.sayMore}
        </p>
      )}

      {(status === 'recorded' || liveTranscript.trim()) && (
        <button
          onClick={submitVoice}
          className="touch flex w-full items-center justify-center gap-2 rounded-3xl bg-craft px-5 py-4 text-sm font-bold text-white shadow-lift active:scale-[0.98]"
        >
          <Sparkles size={18} /> {t.genCatalog} <ArrowRight size={18} />
        </button>
      )}
    </div>
  );
}