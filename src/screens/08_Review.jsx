import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useCraft } from '../context/CraftContext';

export default function ReviewScreen() {
  const { productData, nextStep, t } = useCraft();

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div>
        <h2 className="text-xl font-black">{t.verifyTitle}</h2>
        <p className="text-xs text-stone-500">{t.verifySub}</p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-3 text-xs shadow-sm">
        <img 
          src={productData.enhancedImage || productData.originalImage} 
          alt="Review" 
          className="w-full h-36 object-cover rounded-xl" 
        />
        <div>
          <span className="text-[10px] font-bold text-mustard uppercase">{productData.category}</span>
          <h3 className="font-bold text-sm text-charcoal">{productData.name}</h3>
        </div>
        <p className="text-stone-600">{productData.description_en}</p>
        <div className="flex justify-between items-center pt-2 border-t text-xs">
          <span className="text-stone-500 font-bold">Publish Price:</span>
          <span className="text-xl font-black text-terracotta">₹{productData.final_price}</span>
        </div>
      </div>

      <button 
        onClick={nextStep} 
        className="w-full py-4 bg-forest text-white rounded-2xl font-bold flex justify-center items-center gap-2 shadow-lg shadow-forest/25 hover:bg-[#326647]"
      >
        <CheckCircle2 size={20} /> {t.publishBtn}
      </button>
    </div>
  );
}