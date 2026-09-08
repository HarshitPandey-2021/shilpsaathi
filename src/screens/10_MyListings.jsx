import React, { useEffect, useState } from 'react';
import { RefreshCw, Inbox, Plus } from 'lucide-react';
import { useCraft } from '../context/CraftContext';
import { api } from '../utils/api';

export default function MyListingsScreen() {
  const { getArtisanId, goToStep, t } = useCraft();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchListings = async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.getProducts(getArtisanId());
      setProducts(res?.data || []);
    } catch { setError(t.loadError); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchListings(); }, []);

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-2xl font-black leading-tight text-charcoal">{t.listTitle}</h2>
          <p className="mt-0.5 text-xs text-stone-500">{t.listSub}</p>
        </div>
        <button onClick={fetchListings} className="tap flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-stone-100 text-stone-500">
          <RefreshCw size={17} className={loading ? 'animate-spin text-terracotta' : ''} />
        </button>
      </div>

      <div className="motif-rule motif-fade opacity-50" />

      {loading && (
        <div className="space-y-2.5">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-24 rounded-3xl" />)}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-center text-xs font-semibold text-amber-800">
          {error}
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="space-y-3 rounded-3xl border border-stone-200 bg-white px-5 py-10 text-center shadow-card">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-stone-100 text-stone-300">
            <Inbox size={30} />
          </span>
          <div>
            <p className="text-sm font-black text-charcoal">{t.noListings}</p>
            <p className="mt-1 text-xs text-stone-500">{t.noListingsHint}</p>
          </div>
          <button onClick={() => goToStep(3)} className="touch mx-auto flex items-center gap-2 rounded-3xl bg-craft px-5 text-xs font-bold text-white shadow-lift active:scale-[0.97]">
            <Plus size={16} strokeWidth={2.8} /> {t.addFirst}
          </button>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="space-y-2.5">
          {products.map((p) => (
            <div key={p.id} className="flex gap-3 rounded-3xl border border-stone-200 bg-white p-3 shadow-card">
              <img src={p.image_url} alt="" className="h-[68px] w-[68px] shrink-0 rounded-2xl border border-stone-200 object-cover" />
              <div className="min-w-0 flex-1 self-center">
                <p className="truncate text-sm font-black text-charcoal">{p.name}</p>
                <p className="truncate text-[10px] font-bold uppercase tracking-wide text-stone-400">{p.category}</p>
                <p className="mt-0.5 font-display text-lg font-black leading-none text-terracotta">₹{p.final_price}</p>
              </div>
              <span className="chip h-fit shrink-0 self-center border-forest-200 bg-forest-50 text-forest">
                {p.status === 'published' ? t.live : p.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}