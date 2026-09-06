import React from 'react';
import { PlusCircle, Sparkles, Store, TrendingUp } from 'lucide-react';
import { useCraft } from '../context/CraftContext';
import Card from '../components/ui/Card';
import PrimaryButton from '../components/ui/PrimaryButton';

export default function HomeScreen() {
  const { goToStep, t } = useCraft();

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div>
        <span className="text-[11px] uppercase font-bold text-terracotta tracking-wider">
          {t.studioTitle} • Master Artisan
        </span>
        <h2 className="text-2xl font-black text-charcoal">Digital E-Storefront</h2>
      </div>

      <Card className="bg-amber-100/70 border-amber-300 space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold text-xs text-amber-950">
          <Store size={15} className="text-terracotta" />
          <span>{t.beyondTitle}</span>
        </div>
        <p className="text-[11px] text-amber-900 leading-relaxed font-medium">{t.beyondDesc}</p>
      </Card>

      <div className="grid grid-cols-2 gap-2.5">
        <Card>
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{t.activeListings}</span>
          <p className="text-xl font-black text-charcoal mt-0.5">{t.itemsCount}</p>
          <span className="text-[10px] text-forest font-bold flex items-center gap-1 mt-0.5">
            <TrendingUp size={11} /> Ready to Order
          </span>
        </Card>
        <Card>
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{t.benchmarkPrice}</span>
          <p className="text-xl font-black text-charcoal mt-0.5">₹920</p>
          <span className="text-[10px] text-amber-700 font-bold">Fair Market Rate</span>
        </Card>
      </div>

      <Card className="text-xs space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-stone-800">
          <Sparkles size={14} className="text-mustard" /> {t.assistantReady}
        </div>
        <p className="text-[11px] text-stone-600 leading-relaxed">{t.assistantHint}</p>
      </Card>

      <PrimaryButton onClick={() => goToStep(3)} icon={PlusCircle}>{t.addBtn}</PrimaryButton>
    </div>
  );
}