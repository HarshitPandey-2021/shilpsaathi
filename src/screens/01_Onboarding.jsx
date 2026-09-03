import React, { useState } from 'react';
import { Sparkles, Volume2, Globe, ShieldCheck, ArrowRight } from 'lucide-react';
import { useCraft } from '../context/CraftContext';

export default function OnboardingScreen() {
  const { goToStep } = useCraft();
  const [lang, setLang] = useState('hi');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const playVoiceGuidance = () => {
    setIsPlayingAudio(true);
    // Simple Web Speech Synthesis demo for judges to hear native voice assist
    if ('speechSynthesis' in window) {
      const text = lang === 'hi' 
        ? "शिल्पसाथी में आपका स्वागत है। अपने हस्तशिल्प की तस्वीर लें और बोलकर विवरण दर्ज करें।"
        : "Welcome to ShilpSaathi. Photograph your craft and speak to create your digital catalog.";
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.onend = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsPlayingAudio(false), 2000);
    }
  };

  return (
    <div className="flex flex-col justify-between min-h-[82vh] text-charcoal">
      
      {/* 1. Official Government Header Strip */}
      <div className="flex items-center justify-between border-b border-stone-200/80 pb-3">
        <div className="flex items-center gap-2">
          {/* Ashoka Chakra / Tricolor Accent Dot */}
          <div className="flex flex-col gap-0.5">
            <div className="w-3 h-0.5 bg-[#FF9933] rounded-full"></div>
            <div className="w-3 h-0.5 bg-white border border-stone-300 rounded-full"></div>
            <div className="w-3 h-0.5 bg-[#138808] rounded-full"></div>
          </div>
          <span className="text-[9px] font-bold tracking-wider text-stone-600 uppercase">
            Ministry of Social Justice & Empowerment • Govt. of India
          </span>
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-1 bg-white border border-stone-200 px-2 py-1 rounded-full shadow-xs">
          <Globe size={11} className="text-stone-500" />
          <button 
            onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')} 
            className="text-[10px] font-black text-terracotta"
          >
            {lang === 'hi' ? 'हिंदी' : 'English'}
          </button>
        </div>
      </div>

      {/* 2. Visual Craft Hero Banner with Heritage Badge */}
      <div className="relative my-2">
        <div className="relative h-44 w-full rounded-2xl overflow-hidden shadow-md border border-stone-200">
          <img 
            src="https://images.unsplash.com/photo-1590736969955-71cc94801759?w=800&auto=format&fit=crop" 
            alt="Indian Handicrafts" 
            className="w-full h-full object-cover brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent flex flex-col justify-end p-3.5 text-white">
            <span className="text-[10px] font-bold text-mustard uppercase tracking-widest flex items-center gap-1">
              <Sparkles size={11} /> PM VIKAS & DAKSH Aligned
            </span>
            <p className="text-sm font-black leading-tight">
              {lang === 'hi' ? 'कारीगर से व्यापारी तक का डिजिटल सफर' : 'From Rural Artisan to Global Market'}
            </p>
          </div>
        </div>

        {/* Floating Audio Guidance Button (Key for low literacy) */}
        <button 
          onClick={playVoiceGuidance}
          className={`absolute -bottom-3 right-3 bg-mustard text-charcoal px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg border border-amber-200 transition active:scale-95 ${
            isPlayingAudio ? 'animate-bounce' : ''
          }`}
        >
          <Volume2 size={14} className={isPlayingAudio ? 'text-red-700' : 'text-charcoal'} />
          <span>{isPlayingAudio ? 'बोल रहा है...' : (lang === 'hi' ? 'सुनिए (Audio)' : 'Listen')}</span>
        </button>
      </div>

      {/* 3. Title & Core Value Proposition */}
      <div className="text-center space-y-1">
        <div className="flex items-center justify-center gap-2">
          <div className="w-7 h-7 bg-terracotta text-ivory rounded-lg flex items-center justify-center font-black text-sm shadow">
            श
          </div>
          <h1 className="text-2xl font-black tracking-tight text-charcoal">ShilpSaathi</h1>
        </div>
        <p className="text-[11px] font-bold text-terracotta uppercase tracking-wider">
          {lang === 'hi' ? 'आपका शिल्प • आपकी कहानी • आपका बाज़ार' : 'Your Craft • Your Story • Your Market'}
        </p>
        <p className="text-xs text-stone-600 max-w-xs mx-auto pt-1">
          {lang === 'hi' 
            ? 'बिना टाइपिंग या फोटो एडिटिंग, अपनी मातृभाषा में बोलकर ई-कॉमर्स लिस्टिंग बनाएं।'
            : 'Create professional e-commerce listings by simply speaking in your mother tongue.'}
        </p>
      </div>

      {/* 4. Three Pillars of the Solution (Visual Badges) */}
      <div className="grid grid-cols-3 gap-2 my-2 text-center">
        <div className="bg-white p-2.5 rounded-xl border border-stone-200/80 shadow-xs space-y-1">
          <div className="w-6 h-6 rounded-md bg-amber-50 text-terracotta mx-auto flex items-center justify-center text-xs font-black">
            1
          </div>
          <p className="text-[10px] font-bold text-stone-800 leading-tight">
            {lang === 'hi' ? 'फोटो स्टूडियो' : 'AI Cleanup'}
          </p>
          <p className="text-[9px] text-stone-400">Auto Light</p>
        </div>

        <div className="bg-white p-2.5 rounded-xl border border-stone-200/80 shadow-xs space-y-1">
          <div className="w-6 h-6 rounded-md bg-amber-50 text-mustard mx-auto flex items-center justify-center text-xs font-black">
            2
          </div>
          <p className="text-[10px] font-bold text-stone-800 leading-tight">
            {lang === 'hi' ? 'भाषिणी वॉइस' : 'BHASHINI Voice'}
          </p>
          <p className="text-[9px] text-stone-400">No Typing</p>
        </div>

        <div className="bg-white p-2.5 rounded-xl border border-stone-200/80 shadow-xs space-y-1">
          <div className="w-6 h-6 rounded-md bg-amber-50 text-forest mx-auto flex items-center justify-center text-xs font-black">
            3
          </div>
          <p className="text-[10px] font-bold text-stone-800 leading-tight">
            {lang === 'hi' ? 'उचित मूल्य' : 'Fair Price'}
          </p>
          <p className="text-[9px] text-stone-400">Heuristic</p>
        </div>
      </div>

      {/* 5. Direct Launch Action */}
      <div className="space-y-2">
        <button 
          onClick={() => goToStep(2)} 
          className="w-full py-3.5 bg-terracotta text-white rounded-xl font-bold shadow-md shadow-terracotta/20 hover:bg-[#8e3e29] transition flex items-center justify-center gap-2 text-sm active:scale-[0.99]"
        >
          <span>{lang === 'hi' ? 'शुरू करें / Launch Studio' : 'Get Started / शुरू करें'}</span>
          <ArrowRight size={16} />
        </button>
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-stone-500">
          <ShieldCheck size={12} className="text-forest" />
          <span>Zero Commission • Free for Registered Artisans</span>
        </div>
      </div>

    </div>
  );
}