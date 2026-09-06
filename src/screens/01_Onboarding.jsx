import React, { useState } from 'react';
import { Sparkles, Volume2, ArrowRight } from 'lucide-react';
import { useCraft } from '../context/CraftContext';
import { playNativeAudio } from '../utils/speech';

export default function OnboardingScreen() {
  const { goToStep, t } = useCraft();
  const [isPlaying, setIsPlaying] = useState(false);
const audioCapableLang = t.code === 'hi-IN' || t.code === 'en-IN';

const handleSpeech = () => {
  if (!audioCapableLang) return;
  setIsPlaying(true);
  playNativeAudio(t.speechText, t.code, () => setIsPlaying(true), () => setIsPlaying(false));
};

  return (
  <div className="flex flex-col justify-between text-charcoal animate-fade-in-up">
      
      {/* Visual Craft Banner */}
      <div className="relative my-2">
        <div className="relative h-44 w-full rounded-2xl overflow-hidden shadow-md border border-stone-300/80 bg-stone-900">
          <img 
            src="https://images.unsplash.com/photo-1590736969955-71cc94801759?w=800&auto=format&fit=crop" 
            alt="Indian Handicrafts" 
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent flex flex-col justify-end p-3.5 text-white">
            <span className="text-[10px] font-bold text-mustard uppercase tracking-widest flex items-center gap-1 mb-0.5">
              <Sparkles size={11} /> PM-VIKAS & Hastshilp Aligned
            </span>
            <p className="text-sm font-black leading-snug">{t.heroText}</p>
          </div>
        </div>

        {/* Native Audio Prompt Button */}
        <button 
  onClick={handleSpeech}
  disabled={!audioCapableLang}
  className={`absolute -bottom-3 right-3 px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg border transition active:scale-95 ${
    !audioCapableLang
      ? 'bg-stone-200 text-stone-400 border-stone-300 cursor-not-allowed'
      : isPlaying
        ? 'bg-mustard text-charcoal border-amber-100 ring-2 ring-red-600 animate-pulse'
        : 'bg-mustard hover:bg-[#c49824] text-charcoal border-amber-100'
  }`}
>
  <Volume2 size={14} />
  <span>{!audioCapableLang ? 'Audio N/A' : (isPlaying ? t.speaking : t.listen)}</span>
</button>
      </div>

      {/* Brand Title & Tagline */}
      <div className="text-center space-y-1.5 pt-2">
        <div className="flex items-center justify-center gap-2">
         <img src="/SIH.png" alt="ShilpSaathi" className="w-9 h-9 rounded-xl object-contain shadow-md border-2 border-amber-200" />
          <h1 className="text-2xl font-black tracking-tight text-charcoal">ShilpSaathi</h1>
        </div>

        <p className="text-[11px] font-bold text-terracotta uppercase tracking-wider">{t.tagline}</p>
        <p className="text-xs text-stone-600 max-w-xs mx-auto px-2 leading-relaxed">{t.desc}</p>
      </div>

      {/* Pillars */}
      <div className="grid grid-cols-3 gap-2 my-2 text-center">
        <div className="bg-white p-2.5 rounded-xl border border-stone-200/90 shadow-xs">
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-terracotta mx-auto flex items-center justify-center text-xs font-black mb-1">📷</div>
          <p className="text-[10px] font-bold text-stone-900 leading-tight">{t.f1}</p>
          <p className="text-[9px] text-stone-500 mt-0.5">{t.f1_sub}</p>
        </div>
        <div className="bg-white p-2.5 rounded-xl border border-stone-200/90 shadow-xs">
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-mustard mx-auto flex items-center justify-center text-xs font-black mb-1">🎙️</div>
          <p className="text-[10px] font-bold text-stone-900 leading-tight">{t.f2}</p>
          <p className="text-[9px] text-stone-500 mt-0.5">{t.f2_sub}</p>
        </div>
        <div className="bg-white p-2.5 rounded-xl border border-stone-200/90 shadow-xs">
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-forest mx-auto flex items-center justify-center text-xs font-black mb-1">⚖️</div>
          <p className="text-[10px] font-bold text-stone-900 leading-tight">{t.f3}</p>
          <p className="text-[9px] text-stone-500 mt-0.5">{t.f3_sub}</p>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="pt-2">
        <button 
          onClick={() => goToStep(2)} 
          className="w-full py-3.5 bg-terracotta hover:bg-[#8e3e29] text-white rounded-xl font-bold shadow-md shadow-terracotta/25 transition flex items-center justify-center gap-2 text-sm active:scale-[0.99]"
        >
          <span>{t.startBtn}</span>
          <ArrowRight size={16} />
        </button>
      </div>

    </div>
  );
}