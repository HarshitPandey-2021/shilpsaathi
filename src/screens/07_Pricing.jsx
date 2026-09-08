import React from 'react';
import { ArrowRight, IndianRupee, TrendingUp, Info } from 'lucide-react';
import { useCraft } from '../context/CraftContext';
import ScreenHeader from '../components/ui/ScreenHeader';
import PrimaryButton from '../components/ui/PrimaryButton';

export default function PricingScreen() {
  const { productData, updateProduct, nextStep, t } = useCraft();

  const min = Number(productData.price_min) || 0;
  const max = Number(productData.price_max) || 0;
  const price = Number(productData.final_price) || 0;

  const verdict =
    price < min ? { text: t.belowRange, tone: 'text-amber-700 bg-amber-50 border-amber-200' }
    : price > max ? { text: t.aboveRange, tone: 'text-amber-700 bg-amber-50 border-amber-200' }
    : { text: t.inRange, tone: 'text-forest bg-forest-50 border-forest-200' };

  const span = Math.max(1, max - min);
  const markerPct = Math.max(0, Math.min(100, ((price - min) / span) * 100));

  return (
    <div className="space-y-4 animate-fade-in-up">
      <ScreenHeader title={t.priceTitle} subtitle={t.priceSub} icon={TrendingUp} step={5} totalSteps={6} />

      <div className="relative overflow-hidden rounded-[1.75rem] bg-gold p-5 text-center shadow-lift">
        <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/25 blur-2xl" />
        <p className="relative text-2xs font-black uppercase tracking-[0.15em] text-mustard-800">
          {t.suggestedRange}
        </p>
        <p className="relative mt-1.5 font-display text-4xl font-black leading-none text-charcoal">
          ₹{min} – ₹{max}
        </p>
      </div>

      <div className="space-y-3 rounded-3xl border border-stone-200 bg-white p-4 shadow-card">
        <label className="block text-2xs font-black uppercase tracking-wide text-stone-400">
          {t.setFinalPrice}
        </label>
        <div className="flex items-center gap-2 rounded-2xl bg-stone-50 px-4 py-3">
          <IndianRupee size={26} className="shrink-0 text-stone-400" strokeWidth={2.5} />
          <input
            type="number"
            min="1"
            value={productData.final_price}
            onChange={(e) => updateProduct({ final_price: Math.max(0, Number(e.target.value)) })}
            className="w-full bg-transparent font-display text-4xl font-black text-terracotta outline-none"
          />
        </div>

        {max > min && (
          <div className="pt-1">
            <div className="relative h-2 rounded-full bg-stone-200">
              <div className="absolute inset-y-0 left-0 right-0 rounded-full bg-forest-200" />
              <span
                className="absolute -top-1 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-white bg-terracotta shadow-card transition-all duration-300"
                style={{ left: `${markerPct}%` }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[10px] font-bold text-stone-400">
              <span>₹{min}</span><span>₹{max}</span>
            </div>
          </div>
        )}

        <p className={`rounded-2xl border px-3 py-2 text-center text-xs font-black ${verdict.tone}`}>
          {verdict.text}
        </p>
      </div>

      {productData.price_reasoning && (
        <div className="flex gap-2.5 rounded-3xl border border-stone-200 bg-white p-3.5 shadow-card">
          <Info size={16} className="mt-0.5 shrink-0 text-stone-400" />
          <div className="min-w-0">
            <p className="text-2xs font-black uppercase tracking-wide text-stone-400">{t.costBreakdown}</p>
            <p className="mt-1 text-xs leading-relaxed text-stone-600">{productData.price_reasoning}</p>
          </div>
        </div>
      )}

      <PrimaryButton onClick={nextStep} disabled={price <= 0} iconRight={ArrowRight}>
        {t.reviewBtn}
      </PrimaryButton>
    </div>
  );
}