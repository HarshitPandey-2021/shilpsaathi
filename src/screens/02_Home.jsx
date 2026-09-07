// 02_Home.jsx — complete replacement
import React, { useEffect, useState } from 'react';
import { PlusCircle, Sparkles, Store, TrendingUp } from 'lucide-react';
import { useCraft } from '../context/CraftContext';
import { api } from '../utils/api';
import Card from '../components/ui/Card';
import PrimaryButton from '../components/ui/PrimaryButton';
import IndiaFlag from '../components/ui/IndiaFlag';

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
        <IndiaFlag size={13} />
        <span className="text-[10px] font-bold text-stone-500">
          Ministry of Social Justice & Empowerment Initiative
        </span>
      </div>

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

      <Card className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Your Listings</span>
          <p className="text-xl font-black text-charcoal mt-0.5">
            {listingCount === null ? '—' : listingCount}
          </p>
        </div>
        <TrendingUp size={20} className="text-forest" />
      </Card>

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