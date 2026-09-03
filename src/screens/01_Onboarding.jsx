import React from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';
import { useCraft } from '../context/CraftContext';

export default function OnboardingScreen() {
  const { goToStep } = useCraft();

  return (
    <div className="text-center space-y-6">
      <div className="relative mx-auto w-24 h-24">
        <div className="w-24 h-24 bg-terracotta text-ivory rounded-3xl mx-auto flex items-center justify-center font-black text-5xl shadow-xl border-4 border-amber-100/50">
          श
        </div>
        <div className="absolute -bottom-2 -right-2 bg-mustard p-2 rounded-xl text-white shadow">
          <Sparkles size={16} />
        </div>
      </div>
      
      <div className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight text-charcoal">ShilpSaathi</h1>
        <p className="text-xs font-semibold text-terracotta uppercase tracking-widest">Your Craft • Your Story • Your Market</p>
        <p className="text-xs text-stone-600 pt-2 max-w-xs mx-auto">
          AI-Powered Virtual Business Manager for India's Artisans. Create professional digital listings without typing or photo editing.
        </p>
      </div>

      <div className="bg-white/90 p-4 rounded-2xl border border-stone-200 text-left shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-stone-700">
          <ShieldCheck size={16} className="text-forest" /> 100% Voice & Visual Driven
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-stone-700">
          <ShieldCheck size={16} className="text-forest" /> Multilingual BHASHINI AI Support
        </div>
      </div>

      <button 
        onClick={() => goToStep(2)} 
        className="w-full py-4 bg-terracotta text-white rounded-2xl font-bold shadow-lg shadow-terracotta/25 hover:bg-[#8e3e29] transition active:scale-[0.99]"
      >
        शुरू करें / Launch Studio
      </button>
    </div>
  );
}