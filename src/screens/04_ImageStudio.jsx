import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useCraft } from '../context/CraftContext';
import ScreenHeader from '../components/ui/ScreenHeader';
import PrimaryButton from '../components/ui/PrimaryButton';

export default function ImageStudioScreen() {
  const { productData, nextStep, t } = useCraft();
  const [showOriginal, setShowOriginal] = useState(false);

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <ScreenHeader title={t.f1} subtitle={t.f1_sub} icon={Sparkles} step={2} totalSteps={7} />
        <span className="text-[10px] bg-forest/10 text-forest border border-forest/30 font-bold px-2 py-0.5 rounded-full h-fit">
          Enhanced ✓
        </span>
      </div>

      <div className="relative rounded-2xl overflow-hidden border border-stone-300 shadow-md bg-white">
        <img
          src={showOriginal ? productData.originalImage : (productData.enhancedImage || productData.originalImage)}
          alt={showOriginal ? "Original" : "Enhanced Craft"}
          className="w-full h-64 object-cover transition-opacity duration-300"
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

      <PrimaryButton onClick={nextStep} icon={ArrowRight}>{t.continueVoice}</PrimaryButton>
    </div>
  );
}