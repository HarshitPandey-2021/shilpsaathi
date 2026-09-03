import React from 'react';
import { PlusCircle, Sparkles } from 'lucide-react';
import { useCraft } from '../context/CraftContext';

export default function HomeScreen() {
  const { goToStep } = useCraft();

  return (
    <div className="space-y-5">
      <div>
        <span className="text-xs uppercase font-bold text-terracotta tracking-wider">कलाकार डैशबोर्ड</span>
        <h2 className="text-2xl font-black text-charcoal">Artisan Studio</h2>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-[11px] font-bold text-stone-400 uppercase">Live Listings</span>
          <p className="text-2xl font-black text-charcoal mt-0.5">3 Items</p>
          <span className="text-[10px] text-forest font-bold">Active in Catalog</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-[11px] font-bold text-stone-400 uppercase">Avg. Benchmark</span>
          <p className="text-2xl font-black text-charcoal mt-0.5">₹920</p>
          <span className="text-[10px] text-amber-700 font-bold">Fair Market Rate</span>
        </div>
      </div>

      <div className="bg-amber-100/60 border border-amber-300/80 p-4 rounded-2xl space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-xs text-amber-950">
          <Sparkles size={14} className="text-mustard" /> Smart Assistant Ready
        </div>
        <p className="text-xs text-amber-900 leading-relaxed">
          Have a new craft item ready? Take one clear photo, speak its story in Hindi, and we will prepare a shareable market card.
        </p>
      </div>

      <button 
        onClick={() => goToStep(3)}
        className="w-full py-4 bg-terracotta text-white rounded-2xl font-bold flex items-center justify-center gap-2.5 shadow-lg shadow-terracotta/20 hover:bg-[#8e3e29] transition active:scale-[0.99]"
      >
        <PlusCircle size={20} /> Add New Craft Item
      </button>
    </div>
  );
}