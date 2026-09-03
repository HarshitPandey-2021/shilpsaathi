import React from 'react';
import { Camera } from 'lucide-react';
import { useCraft } from '../context/CraftContext';

export default function CaptureScreen() {
  const { updateProduct, nextStep, setIsLoading, setLoadingMessage } = useCraft();

  const handleCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      updateProduct({ originalImage: url, enhancedImage: url });
      nextStep();
      setLoadingMessage("AI Image Studio: Isolating craft & removing clutter...");
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 1200);
    }
  };

  return (
    <div className="text-center space-y-5">
      <div>
        <h2 className="text-2xl font-black text-charcoal">Photograph Craft</h2>
        <p className="text-xs text-stone-600 mt-1">Our AI cleans cluttered backgrounds and fixes lighting</p>
      </div>
      <div className="border-2 border-dashed border-terracotta/40 rounded-3xl p-8 bg-white/70 flex flex-col items-center shadow-inner">
        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-terracotta mb-3 shadow-sm">
          <Camera size={32} />
        </div>
        <p className="text-xs font-semibold text-stone-700 mb-4">Click photo or select from phone gallery</p>
        <label className="cursor-pointer bg-terracotta text-white px-6 py-3.5 rounded-xl font-bold text-sm shadow-md hover:bg-[#8e3e29] transition active:scale-95">
          Capture Craft
          <input type="file" accept="image/*" className="hidden" onChange={handleCapture} />
        </label>
      </div>
      <p className="text-[11px] text-stone-400">Supported: Clay, Textiles, Woodwork, Metal & Handmade Crafts</p>
    </div>
  );
}