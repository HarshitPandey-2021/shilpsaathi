import React from 'react';
import { CheckCircle2, Share2 } from 'lucide-react';
import { useCraft } from '../context/CraftContext';

export default function FinalListingScreen() {
  const { productData, goToStep } = useCraft();

  return (
    <div className="space-y-4 text-center">
      <div className="inline-flex p-3 bg-green-100 rounded-full text-forest">
        <CheckCircle2 size={32} />
      </div>
      <div>
        <h2 className="text-2xl font-black">Listing Published!</h2>
        <p className="text-xs text-stone-500">Your craft is now digital and ready to share</p>
      </div>
      
      <div className="bg-white p-4 rounded-3xl border border-stone-200 text-left shadow-lg space-y-2">
        <img 
          src={productData.enhancedImage || productData.originalImage} 
          alt="Final Product" 
          className="w-full h-48 object-cover rounded-2xl" 
        />
        <span className="text-[10px] font-bold text-mustard uppercase tracking-wide block">{productData.category}</span>
        <h3 className="font-bold text-base leading-snug">{productData.name}</h3>
        <p className="text-xs text-stone-500 line-clamp-2">{productData.description_hi}</p>
        <div className="flex items-baseline justify-between pt-1">
          <p className="text-2xl font-black text-terracotta">₹{productData.final_price}</p>
          <span className="text-[10px] text-forest font-bold bg-green-50 px-2 py-0.5 rounded-md border border-green-200">Ready to Order</span>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button 
          onClick={() => alert("WhatsApp catalogue link copied to clipboard!")}
          className="flex-1 py-4 bg-terracotta text-white rounded-2xl font-bold flex items-center justify-center gap-2 text-xs shadow-md hover:bg-[#8e3e29]"
        >
          <Share2 size={16} /> Share on WhatsApp
        </button>
        <button 
          onClick={() => goToStep(2)} 
          className="px-5 py-4 bg-stone-200 hover:bg-stone-300 rounded-2xl font-bold text-xs"
        >
          Home
        </button>
      </div>
    </div>
  );
}