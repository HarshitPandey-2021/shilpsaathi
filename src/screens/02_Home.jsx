import React from 'react';
import { PlusCircle, Sparkles, Store, TrendingUp, CalendarDays } from 'lucide-react';
import { useCraft } from '../context/CraftContext';

export default function HomeScreen() {
  const { goToStep, t } = useCraft();

  return (
    <div className="space-y-4">
      {/* Artisan Status Header */}
      <div>
        <span className="text-[11px] uppercase font-bold text-terracotta tracking-wider">
          {t.studioTitle} • Master Artisan
        </span>
        <h2 className="text-2xl font-black text-charcoal">Digital E-Storefront</h2>
      </div>

      {/* Official Trade Fair Problem Statement Callout */}
      <div className="bg-amber-100/70 border border-amber-300 p-3.5 rounded-2xl space-y-1.5 shadow-xs">
        <div className="flex items-center gap-1.5 font-bold text-xs text-amber-950">
          <Store size={15} className="text-terracotta" />
          <span>Beyond Physical Exhibitions</span>
        </div>
        <p className="text-[11px] text-amber-900 leading-relaxed font-medium">
          Sell your heritage crafts year-round. Overcome the seasonal limits of <strong>Surajkund Mela</strong>, <strong>Dilli Haat</strong>, and <strong>Shilp Samagam</strong> with permanent digital cataloging.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-xs">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{t.activeListings}</span>
          <p className="text-xl font-black text-charcoal mt-0.5">{t.itemsCount}</p>
          <span className="text-[10px] text-forest font-bold flex items-center gap-1 mt-0.5">
            <TrendingUp size={11} /> Ready to Order
          </span>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200/90 shadow-xs">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{t.benchmarkPrice}</span>
          <p className="text-xl font-black text-charcoal mt-0.5">₹920</p>
          <span className="text-[10px] text-amber-700 font-bold">Fair Market Rate</span>
        </div>
      </div>

      {/* Smart Assistant Tip */}
      <div className="bg-white p-3.5 rounded-2xl border border-stone-200 text-xs space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-stone-800">
          <Sparkles size={14} className="text-mustard" /> {t.assistantReady}
        </div>
        <p className="text-[11px] text-stone-600 leading-relaxed">
          {t.assistantHint}
        </p>
      </div>

      {/* Primary Action Button */}
      <button 
        onClick={() => goToStep(3)}
        className="w-full py-4 bg-terracotta text-white rounded-2xl font-bold flex items-center justify-center gap-2.5 shadow-lg shadow-terracotta/20 hover:bg-[#8e3e29] transition active:scale-[0.99] mt-2"
      >
        <PlusCircle size={20} /> {t.addBtn}
      </button>
    </div>
  );
}