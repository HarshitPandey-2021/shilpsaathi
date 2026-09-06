// 01_Onboarding.jsx — complete replacement
import React, { useState } from 'react';
import { Volume2, ArrowRight } from 'lucide-react';
import { useCraft } from '../context/CraftContext';
import { playNativeAudio } from '../utils/speech';
import IndiaFlag from '../components/ui/IndiaFlag';

export default function OnboardingScreen() {
  const { goToStep, t } = useCraft();
  const [isPlaying, setIsPlaying] = useState(false);
  const [phone, setPhone] = useState(localStorage.getItem('shilpsaathi_artisan_phone') || '');
  const audioCapableLang = t.code === 'hi-IN' || t.code === 'en-IN';

  const handleSpeech = async () => {
    if (!audioCapableLang) return;
    setIsPlaying(true);
    await playNativeAudio(t.speechText, t.code, () => setIsPlaying(true), () => setIsPlaying(false));
  };

  const handleStart = () => {
    if (phone.trim().length === 10) {
      localStorage.setItem('shilpsaathi_artisan_phone', phone.trim());
    }
    goToStep(2);
  };

  return (
    <div className="flex flex-col justify-between min-h-[85vh] text-charcoal animate-fade-in-up">

      <div className="flex items-center justify-center gap-2 pt-1">
        <IndiaFlag size={14} />
        <span className="text-[10px] font-bold text-stone-500 tracking-wide">
          Government of India Initiative • Ministry of Social Justice & Empowerment
        </span>
      </div>

      <div className="text-center space-y-2 py-4">
        <div className="flex items-center justify-center gap-2.5">
          <img src="/SIH.png" alt="ShilpSaathi" className="w-11 h-11 rounded-2xl object-contain shadow-md border-2 border-amber-200" />
          <h1 className="text-[28px] font-black tracking-tight text-charcoal">ShilpSaathi</h1>
        </div>
        <p className="text-xs font-bold text-terracotta uppercase tracking-[0.15em]">{t.tagline}</p>
        <p className="text-[13px] text-stone-600 max-w-xs mx-auto px-3 leading-relaxed pt-1">{t.desc}</p>

        <button
          onClick={handleSpeech}
          disabled={!audioCapableLang}
          className={`mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition active:scale-95 ${
            !audioCapableLang
              ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
              : isPlaying
                ? 'bg-mustard text-charcoal border-amber-200 ring-2 ring-terracotta/40 animate-pulse'
                : 'bg-amber-50 hover:bg-amber-100 text-terracotta border-amber-200'
          }`}
        >
          <Volume2 size={13} />
          {!audioCapableLang ? 'Audio N/A' : (isPlaying ? t.speaking : t.listen)}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs text-center">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-terracotta mx-auto flex items-center justify-center text-sm font-black mb-1.5">📷</div>
          <p className="text-[10px] font-bold text-stone-900 leading-tight">{t.f1}</p>
          <p className="text-[9px] text-stone-500 mt-0.5">{t.f1_sub}</p>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs text-center">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-mustard mx-auto flex items-center justify-center text-sm font-black mb-1.5">🎙️</div>
          <p className="text-[10px] font-bold text-stone-900 leading-tight">{t.f2}</p>
          <p className="text-[9px] text-stone-500 mt-0.5">{t.f2_sub}</p>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs text-center">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-forest mx-auto flex items-center justify-center text-sm font-black mb-1.5">⚖️</div>
          <p className="text-[10px] font-bold text-stone-900 leading-tight">{t.f3}</p>
          <p className="text-[9px] text-stone-500 mt-0.5">{t.f3_sub}</p>
        </div>
      </div>

      <div className="pt-4 space-y-2">
        <input
          type="tel"
          inputMode="numeric"
          maxLength={10}
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
          placeholder="मोबाइल नंबर दर्ज करें / Mobile Number"
          className="w-full py-3.5 px-4 rounded-2xl border border-stone-300 text-sm text-center font-bold outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/10 transition"
        />
        <button
          onClick={handleStart}
          className="w-full py-4 bg-terracotta hover:bg-[#8e3e29] text-white rounded-2xl font-bold shadow-lg shadow-terracotta/25 transition flex items-center justify-center gap-2 text-sm active:scale-[0.98]"
        >
          <span>{t.startBtn}</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}