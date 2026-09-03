import React from 'react';
import { Mic } from 'lucide-react';
import { useCraft } from '../context/CraftContext';

export default function VoiceInputScreen() {
  const { nextStep, setIsLoading, setLoadingMessage } = useCraft();

  const handleVoice = () => {
    setLoadingMessage("BHASHINI: Transcribing Hindi audio to structured bilingual catalog...");
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      nextStep();
    }, 1400);
  };

  return (
    <div className="text-center space-y-6">
      <div>
        <h2 className="text-2xl font-black text-charcoal">Speak Your Craft's Story</h2>
        <p className="text-xs text-stone-600 mt-1">Speak freely in Hindi. BHASHINI converts voice to catalog data.</p>
      </div>
      <div className="my-6">
        <button 
          onClick={handleVoice}
          className="w-32 h-32 rounded-full border-4 border-terracotta bg-terracotta/10 text-terracotta mx-auto flex flex-col items-center justify-center hover:scale-105 active:scale-95 transition shadow-xl"
        >
          <Mic size={44} />
          <span className="text-[11px] font-bold mt-1 uppercase tracking-wider">Tap to Speak</span>
        </button>
      </div>
      <div className="bg-white p-4 rounded-2xl border border-stone-200 text-left text-xs space-y-1 text-stone-600 shadow-sm">
        <span className="font-bold text-stone-800 block">Example to speak out loud:</span>
        <p className="italic">"यह एक हस्तनिर्मित मिट्टी का फूलदान है, जिसे पारंपरिक चाक पर बनाया गया है..."</p>
      </div>
    </div>
  );
}