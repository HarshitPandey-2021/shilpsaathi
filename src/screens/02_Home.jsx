import React, { useEffect, useState } from 'react';
import { PlusCircle, Sparkles, Package, TrendingUp, ChevronRight, Camera, Mic, IndianRupee } from 'lucide-react';
import { useCraft } from '../context/CraftContext';
import { api } from '../utils/api';
import Card from '../components/ui/Card';
import IndiaFlag from '../components/ui/IndiaFlag';

const STEPS = [
  { icon: Camera,      key: 'stepPhoto' },
  { icon: Mic,         key: 'stepVoice' },
  { icon: IndianRupee, key: 'stepPrice' },
];
export default function HomeScreen() {
  const { goToStep, getArtisanId, t } = useCraft();
  const [listingCount, setListingCount] = useState(null);

  useEffect(() => {
    api.getProducts(getArtisanId())
      .then(res => setListingCount((res?.data || []).length))
      .catch(() => setListingCount(null));
  }, []);

  return (
    <div className="space-y-4 animate-fade-in-up">

      <div className="flex items-center gap-1.5">
        <IndiaFlag size={12} />
        <span className="text-[10px] font-bold uppercase tracking-wide text-stone-400">
                 MoSJE · {t.govInit}
        </span>
      </div>

      <div>
        <p className="text-2xs font-black uppercase tracking-[0.15em] text-terracotta">
          {t.studioTitle}
        </p>
        <h2 className="mt-0.5 font-display text-3xl font-black leading-tight text-charcoal">
                   {t.greeting}
        </h2>
        <p className="mt-1 text-xs text-stone-500">{t.greetingSub}</p>
      </div>

      {/* PRIMARY ACTION — the whole card is the button */}
      <button
        onClick={() => goToStep(3)}
        className="group relative w-full overflow-hidden rounded-4xl bg-craft p-5 text-left text-white shadow-lift transition active:scale-[0.98]"
      >
        <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-mustard-400/20 blur-2xl" />
        <div className="relative flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
            <PlusCircle size={24} strokeWidth={2.3} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-base font-black leading-tight">{t.addBtn}</p>
            <p className="mt-0.5 text-xs text-white/75">
                           {t.quickSteps}
            </p>
          </div>
          <ChevronRight size={20} className="mt-3 shrink-0 opacity-70 transition group-hover:translate-x-0.5" />
        </div>

        <div className="relative mt-4 flex items-center gap-1.5">
            {STEPS.map(({ icon: Icon, key }, i) => (
            <React.Fragment key={key}>
              <div className="flex flex-1 flex-col items-center gap-1.5 rounded-2xl bg-white/10 py-3">
                <Icon size={16} strokeWidth={2.4} />
                <span className="text-[11px] font-bold leading-none">{t[key]}</span>
              </div>
              {i < STEPS.length - 1 && <span className="text-white/30">›</span>}
            </React.Fragment>
          ))}
        </div>
      </button>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-2.5">
        <Card
          interactive
          onClick={() => goToStep(10)}
          as="button"
          className="flex flex-col items-start text-left"
        >
          <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-2xl bg-forest-50 text-forest">
            <Package size={17} strokeWidth={2.4} />
          </span>
          <p className="font-display text-3xl font-black leading-none text-charcoal">
            {listingCount === null ? '—' : listingCount}
          </p>
               <p className="mt-1 text-2xs font-bold text-stone-500">{t.myListings}</p>
          <span className="mt-1.5 inline-flex items-center gap-0.5 text-[10px] font-bold text-terracotta">
            {t.view} <ChevronRight size={11} strokeWidth={3} />
          </span>
        </Card>

        <Card tone="warm" className="flex flex-col items-start">
          <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-2xl bg-white/70 text-mustard-500">
            <TrendingUp size={17} strokeWidth={2.4} />
          </span>
          <p className="font-display text-3xl font-black leading-none text-charcoal">24×7</p>
              <p className="mt-1 text-2xs font-bold text-mustard-700">{t.alwaysOpen}</p>
          <span className="mt-1.5 text-[10px] leading-tight text-mustard-700/80">
            {t.noWaiting}
          </span>
        </Card>
      </div>

      <div className="motif-rule motif-fade opacity-50" />

      {/* AI ASSISTANT */}
      <Card className="flex gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-mustard-50 text-mustard-500">
          <Sparkles size={17} strokeWidth={2.4} />
        </span>
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-xs font-black text-charcoal">
            {t.assistantReady}
            <span className="h-1.5 w-1.5 rounded-full bg-forest animate-breathe" />
          </p>
          <p className="mt-1 text-2xs leading-relaxed text-stone-500">{t.assistantHint}</p>
        </div>
      </Card>

      <Card tone="clay" className="space-y-1">
        <p className="text-xs font-black text-terracotta-700">{t.beyondTitle}</p>
        <p className="text-2xs leading-relaxed text-terracotta-800/80">{t.beyondDesc}</p>
      </Card>
    </div>
  );
}