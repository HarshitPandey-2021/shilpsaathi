import React, { useState } from 'react';
import { Sparkles, ArrowRight, Check, Info } from 'lucide-react';
import { useCraft } from '../context/CraftContext';
import ScreenHeader from '../components/ui/ScreenHeader';
import PrimaryButton from '../components/ui/PrimaryButton';

export default function ImageStudioScreen() {
  const { productData, nextStep, t } = useCraft();
  const [showOriginal, setShowOriginal] = useState(false);

  const enhanced = Boolean(productData.isEnhanced && productData.enhancedImage);

  return (
    <div className="space-y-4 animate-fade-in-up">
      <ScreenHeader title={t.f1} subtitle={t.f1_sub} icon={Sparkles} step={2} totalSteps={6} />

      {enhanced ? (
        <>
          <div className="overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white shadow-card">
            <img
              src={showOriginal ? productData.originalImage : productData.enhancedImage}
              alt=""
              className="h-72 w-full object-cover transition-opacity duration-300"
            />
          </div>

          <div className="flex gap-2 rounded-3xl bg-stone-100 p-1.5">
            <button
              onClick={() => setShowOriginal(true)}
              className={`touch flex-1 rounded-2xl text-sm font-black transition ${
                showOriginal ? 'bg-white text-charcoal shadow-card' : 'text-stone-500'
              }`}
            >
              {t.before}
            </button>
            <button
              onClick={() => setShowOriginal(false)}
              className={`touch flex-1 rounded-2xl text-sm font-black transition ${
                !showOriginal ? 'bg-forest text-white shadow-card' : 'text-stone-500'
              }`}
            >
              {t.after}
            </button>
          </div>

          <div className="flex gap-2.5 rounded-3xl border border-forest-200 bg-forest-50 p-3.5">
            <Check size={17} className="mt-0.5 shrink-0 text-forest" strokeWidth={3} />
            <div className="min-w-0">
              <p className="text-xs font-black text-forest-600">{t.studioCleaned}</p>
              <p className="mt-0.5 text-2xs leading-relaxed text-forest-600/80">{t.photoSub}</p>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white shadow-card">
            <img src={productData.originalImage} alt="" className="h-72 w-full object-cover" />
          </div>
          <div className="flex gap-2.5 rounded-3xl border border-amber-200 bg-amber-50 p-3.5">
            <Info size={17} className="mt-0.5 shrink-0 text-amber-600" />
            <div className="min-w-0">
              <p className="text-xs font-black text-amber-900">{t.enhanceFail}</p>
              <p className="mt-0.5 text-2xs leading-relaxed text-amber-800/80">{t.enhanceFailSub}</p>
            </div>
          </div>
        </>
      )}

      <PrimaryButton onClick={nextStep} iconRight={ArrowRight}>{t.continueVoice}</PrimaryButton>
    </div>
  );
}