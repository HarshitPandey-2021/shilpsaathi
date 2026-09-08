import React, { useEffect, useState } from 'react';
import { RefreshCw, Inbox, Plus, X, Share2, Check } from 'lucide-react';
import { useCraft } from '../context/CraftContext';
import { api } from '../utils/api';

export default function MyListingsScreen() {
  const { getArtisanId, startNewProduct, t } = useCraft();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchListings = async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.getProducts(getArtisanId());
      setProducts(res?.data || []);
    } catch { setError(t.loadError); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchListings(); }, []);

  const shareOne = async (p) => {
    const text = `${p.name}\n₹${p.final_price}\n${p.description_hi || p.description_en || ''}\n${p.image_url}`;
    if (navigator.share) {
      try { await navigator.share({ title: p.name, text }); return; } catch {}
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const total = products.reduce((sum, p) => sum + (Number(p.final_price) || 0), 0);

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-2xl font-black leading-tight text-charcoal">{t.listTitle}</h2>
          <p className="mt-0.5 text-xs text-stone-500">{t.listSub}</p>
        </div>
        <button
          onClick={fetchListings}
          aria-label="Refresh"
          className="tap flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-stone-100 text-stone-500"
        >
          <RefreshCw size={17} className={loading ? 'animate-spin text-terracotta' : ''} />
        </button>
      </div>

      {!loading && !error && products.length > 0 && (
        <div className="flex gap-2.5">
          <div className="flex-1 rounded-3xl border border-stone-200 bg-white p-3.5 shadow-card">
            <p className="font-display text-2xl font-black leading-none text-charcoal">{products.length}</p>
            <p className="mt-1 text-2xs font-bold text-stone-500">{t.myListings}</p>
          </div>
          <div className="flex-1 rounded-3xl border border-mustard-200 bg-mustard-50 p-3.5 shadow-card">
            <p className="font-display text-2xl font-black leading-none text-charcoal">₹{total}</p>
            <p className="mt-1 text-2xs font-bold text-mustard-700">{t.catalogValue}</p>
          </div>
        </div>
      )}

      <div className="motif-rule motif-fade opacity-50" />

      {loading && (
        <div className="space-y-2.5">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-24 rounded-3xl" />)}
        </div>
      )}

      {!loading && error && (
        <div className="space-y-2.5 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-center">
          <p className="text-xs font-semibold text-amber-800">{error}</p>
          <button onClick={fetchListings} className="text-2xs font-bold text-amber-900 underline">
            {t.retry}
          </button>
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
          <button
            onClick={startNewProduct}
            className="touch mx-auto flex items-center gap-2 rounded-3xl bg-craft px-5 text-xs font-bold text-white shadow-lift active:scale-[0.97]"
          >
            <Plus size={16} strokeWidth={2.8} /> {t.addFirst}
          </button>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="space-y-2.5">
          {products.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelected(p)}
              className="flex w-full gap-3 rounded-3xl border border-stone-200 bg-white p-3 text-left shadow-card transition active:scale-[0.98]"
            >
              <img
                src={p.image_url}
                alt=""
                className="h-[68px] w-[68px] shrink-0 rounded-2xl border border-stone-200 object-cover"
              />
              <div className="min-w-0 flex-1 self-center">
                <p className="truncate text-sm font-black text-charcoal">{p.name}</p>
                <p className="truncate text-[10px] font-bold uppercase tracking-wide text-stone-400">{p.category}</p>
                <p className="mt-0.5 font-display text-lg font-black leading-none text-terracotta">₹{p.final_price}</p>
              </div>
              <span className="chip h-fit shrink-0 self-center border-forest-200 bg-forest-50 text-forest">
                {p.status === 'published' ? t.live : p.status}
              </span>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div
          className="absolute inset-0 z-50 flex items-end bg-charcoal/50 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelected(null)}
        >
          <div
            className="max-h-[88%] w-full overflow-y-auto scrollbar-hide rounded-t-[2rem] bg-white pb-8 animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <img src={selected.image_url} alt="" className="h-60 w-full object-cover" />
              <button
                onClick={() => setSelected(null)}
                aria-label={t.close}
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-2xl bg-white/90 text-stone-600 shadow-card backdrop-blur-sm"
              >
                <X size={17} strokeWidth={2.6} />
              </button>
            </div>

            <div className="space-y-3.5 p-5">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wide text-mustard-500">
                  {selected.category}
                </span>
                <h3 className="font-display text-xl font-black leading-tight text-charcoal">{selected.name}</h3>
              </div>

              <div className="flex items-end justify-between rounded-2xl bg-stone-50 px-4 py-3">
                <span className="text-2xs font-black uppercase tracking-wide text-stone-400">{t.yourPrice}</span>
                <span className="font-display text-3xl font-black leading-none text-terracotta">
                  ₹{selected.final_price}
                </span>
              </div>

              {(selected.material || selected.colour) && (
                <div className="grid grid-cols-2 gap-2.5">
                  {selected.material && (
                    <div className="rounded-2xl border border-stone-200 p-3">
                      <p className="text-[10px] font-black uppercase tracking-wide text-stone-400">{t.fMaterial}</p>
                      <p className="mt-0.5 text-xs font-bold text-charcoal">{selected.material}</p>
                    </div>
                  )}
                  {selected.colour && (
                    <div className="rounded-2xl border border-stone-200 p-3">
                      <p className="text-[10px] font-black uppercase tracking-wide text-stone-400">{t.fColour}</p>
                      <p className="mt-0.5 text-xs font-bold text-charcoal">{selected.colour}</p>
                    </div>
                  )}
                </div>
              )}

              {selected.description_hi && (
                <p className="text-xs leading-relaxed text-stone-700">{selected.description_hi}</p>
              )}
              {selected.description_en && (
                <p className="text-xs leading-relaxed text-stone-500">{selected.description_en}</p>
              )}

              {(selected.keywords || []).length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selected.keywords.map((k) => (
                    <span key={k} className="chip border-stone-200 bg-stone-50 text-stone-600">{k}</span>
                  ))}
                </div>
              )}

              <button
                onClick={() => shareOne(selected)}
                className="touch flex w-full items-center justify-center gap-2 rounded-3xl bg-craft text-xs font-bold text-white shadow-lift active:scale-[0.97]"
              >
                {copied ? <Check size={16} /> : <Share2 size={16} />}
                {copied ? t.copied : t.shareWhatsapp}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}