import React from 'react';
import { useCraft } from '../context/CraftContext';

export default function PricingScreen() {
  const { productData, updateProduct, nextStep, t } = useCraft();

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black">{t.priceTitle}</h2>
        <p className="text-xs text-stone-500">{t.priceSub}</p>
      </div>

      <div className="bg-amber-100/70 border border-mustard/60 p-5 rounded-3xl text-center space-y-1 shadow-sm">
        <span className="text-[11px] text-amber-900 font-bold uppercase tracking-wider">{t.suggestedRange}</span>
        <h3 className="text-3xl font-black text-charcoal">₹{productData.price_min} – ₹{productData.price_max}</h3>
        <p className="text-[11px] text-stone-600 pt-1">{productData.price_reasoning}</p>
      </div>
      
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
        <label className="text-xs font-bold text-stone-400 block mb-1">{t.setFinalPrice}</label>
        <div className="flex items-center gap-1 border-b border-stone-300 pb-1">
          <span className="text-2xl font-bold text-stone-400">₹</span>
          <input 
            type="number" 
            value={productData.final_price} 
            onChange={e => updateProduct({ final_price: Number(e.target.value) })}
            className="w-full text-2xl font-black outline-none text-terracotta"
          />
        </div>
      </div>

      <button 
        onClick={nextStep} 
        className="w-full py-4 bg-terracotta text-white rounded-2xl font-bold shadow-md hover:bg-[#8e3e29]"
      >
        {t.reviewBtn}
      </button>
    </div>
  );
}