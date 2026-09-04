import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useCraft } from '../context/CraftContext';

export default function ImageStudioScreen() {
  const { productData, nextStep, t } = useCraft();
  const [showOriginal, setShowOriginal] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black flex items-center gap-1.5">
            <Sparkles className="text-mustard" size={18} /> {t.f1}
          </h2>
          <p className="text-[11px] text-stone-500">{t.f1_sub}</p>
        </div>
        <span className="text-[10px] bg-forest/10 text-forest border border-forest/30 font-bold px-2 py-0.5 rounded-full">
          Enhanced ✓
        </span>
      </div>

      <div className="relative rounded-2xl overflow-hidden border border-stone-300 shadow-md bg-white">
        <img
          src={showOriginal ? productData.originalImage : (productData.enhancedImage || productData.originalImage)}
          alt={showOriginal ? "Original" : "Enhanced Craft"}
          className="w-full h-64 object-cover"
        />
        <div className="absolute top-3 left-3 bg-forest text-white text-[10px] px-2.5 py-1 rounded-full font-bold shadow">
          {showOriginal ? "Original" : t.studioCleaned}
        </div>
        <button
          onClick={() => setShowOriginal(s => !s)}
          className="absolute bottom-3 right-3 bg-white/90 text-charcoal text-[10px] font-bold px-3 py-1.5 rounded-full shadow border border-stone-200 active:scale-95"
        >
          {showOriginal ? "Show Enhanced →" : "← Show Original"}
        </button>
      </div>

      <div className="bg-stone-100 p-3 rounded-xl text-center">
        <p className="text-xs text-stone-600 font-medium">✨ {t.photoSub}</p>
      </div>

      <button onClick={nextStep} className="w-full py-4 bg-terracotta text-white rounded-2xl font-bold flex justify-center items-center gap-2 shadow-md hover:bg-[#8e3e29]">
        {t.continueVoice} <ArrowRight size={18} />
      </button>
    </div>
  );
}