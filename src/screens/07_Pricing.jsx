import React from 'react';
import { useCraft } from '../context/CraftContext';
import ScreenHeader from '../components/ui/ScreenHeader';
import Card from '../components/ui/Card';
import PrimaryButton from '../components/ui/PrimaryButton';

export default function PricingScreen() {
  const { productData, updateProduct, nextStep, t } = useCraft();

  return (
    <div className="space-y-5 animate-fade-in-up">
      <ScreenHeader title={t.priceTitle} subtitle={t.priceSub} step={5} totalSteps={7} />

      <Card className="bg-amber-100/70 border-mustard/60 text-center rounded-3xl space-y-1">
        <span className="text-[11px] text-amber-900 font-bold uppercase tracking-wider">{t.suggestedRange}</span>
        <h3 className="text-3xl font-black text-charcoal">₹{productData.price_min} – ₹{productData.price_max}</h3>
        <p className="text-[11px] text-stone-600 pt-1">{productData.price_reasoning}</p>
      </Card>

      <Card>
        <label className="text-xs font-bold text-stone-400 block mb-1">{t.setFinalPrice}</label>
        <div className="flex items-center gap-1 border-b border-stone-300 pb-1">
          <span className="text-2xl font-bold text-stone-400">₹</span>
          <input
            type="number"
            min="1"
            value={productData.final_price}
            onChange={e => updateProduct({ final_price: Math.max(0, Number(e.target.value)) })}
            className="w-full text-2xl font-black outline-none text-terracotta"
          />
        </div>
      </Card>

      <PrimaryButton onClick={nextStep} disabled={productData.final_price <= 0}>
        {t.reviewBtn}
      </PrimaryButton>
    </div>
  );
}
