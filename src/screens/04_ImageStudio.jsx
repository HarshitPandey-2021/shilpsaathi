import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useCraft } from '../context/CraftContext';

export default function ImageStudioScreen() {
  const { productData, nextStep } = useCraft();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black flex items-center gap-1.5">
            <Sparkles className="text-mustard" size={18} /> AI Image Studio
          </h2>
          <p className="text-[11px] text-stone-500">Auto background removal + shadow correction</p>
        </div>
        <span className="text-[10px] bg-forest/10 text-forest border border-forest/30 font-bold px-2 py-0.5 rounded-full">
          Enhanced ✓
        </span>
      </div>
      
      <div className="relative rounded-2xl overflow-hidden border border-stone-300 shadow-md bg-white">
        <img 
          src={productData.enhancedImage || productData.originalImage} 
          alt="Enhanced Craft" 
          className="w-full h-64 object-cover" 
        />
        <div className="absolute top-3 left-3 bg-forest text-white text-[10px] px-2.5 py-1 rounded-full font-bold shadow">
          Studio Cleaned
        </div>
      </div>

      <div className="bg-stone-100 p-3 rounded-xl text-center">
        <p className="text-xs text-stone-600 font-medium">✨ Background normalized for e-commerce readiness</p>
      </div>

      <button 
        onClick={nextStep} 
        className="w-full py-4 bg-terracotta text-white rounded-2xl font-bold flex justify-center items-center gap-2 shadow-md hover:bg-[#8e3e29]"
      >
        Proceed to Voice Cataloging <ArrowRight size={18} />
      </button>
    </div>
  );
}