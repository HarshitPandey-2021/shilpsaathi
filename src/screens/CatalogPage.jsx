import React, { useMemo, useState } from 'react';
import { Package, Search, ArrowRight, ImageOff, CheckCircle2, Clock } from 'lucide-react';
import { useCraft } from '../context/CraftContext';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'published', label: 'Published' },
  { id: 'draft', label: 'Draft' },
];

function StatusPill({ status }) {
  const isPublished = status === 'published';
  return (
    <span
      className={`absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold shadow-sm ${
        isPublished ? 'bg-forest text-white' : 'bg-mustard text-[#402f08]'
      }`}
    >
      {isPublished ? <CheckCircle2 size={9} strokeWidth={3} /> : <Clock size={9} strokeWidth={3} />}
      {isPublished ? 'Published' : 'Draft'}
    </span>
  );
}

function ListingTile({ listing, onOpen }) {
  return (
    <button
      onClick={() => onOpen(listing)}
      className="text-left rounded-2xl border border-stone-300 shadow-md bg-white overflow-hidden active:scale-[0.97] transition"
    >
      <div className="relative aspect-square w-full bg-stone-100">
        {listing.image ? (
          <img src={listing.image} alt={listing.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-terracotta/10">
            <ImageOff size={30} className="text-terracotta" strokeWidth={1.5} />
          </div>
        )}
        <StatusPill status={listing.status} />
      </div>
      <div className="p-2.5">
        <p className="text-[12.5px] font-bold text-charcoal leading-tight truncate">{listing.name}</p>
        <p className="text-[10.5px] text-stone-500 leading-tight truncate">{listing.category}</p>
        {listing.final_price != null && (
          <p className="text-[12px] font-bold text-terracotta mt-1">₹{listing.final_price}</p>
        )}
      </div>
    </button>
  );
}

function EmptyState({ onAddNew }) {
  return (
    <div className="col-span-2 flex flex-col items-center text-center rounded-2xl border border-dashed border-stone-300 bg-white/60 px-6 py-10">
      <div className="w-14 h-14 rounded-full bg-terracotta/10 flex items-center justify-center mb-3">
        <Package size={22} className="text-terracotta" strokeWidth={1.75} />
      </div>
      <p className="text-[15px] font-bold text-charcoal">No products yet</p>
      <p className="text-[13px] text-stone-500 mt-1 max-w-[220px]">
        Your record is empty. Add your first craft to see it here.
      </p>
      <button
        onClick={onAddNew}
        className="mt-4 inline-flex items-center gap-1.5 bg-terracotta text-white text-[13px] font-bold px-4 py-2 rounded-full"
      >
        Add your first craft <ArrowRight size={14} strokeWidth={2.5} />
      </button>
    </div>
  );
}

export default function CatalogPage() {
  const { listings, openListing, setShowCatalog, goToStep, t } = useCraft();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      const matchesFilter = filter === 'all' || l.status === filter;
      const q = query.trim().toLowerCase();
      const matchesQuery = !q || l.name.toLowerCase().includes(q) || l.category.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [listings, query, filter]);

  const publishedCount = listings.filter((l) => l.status === 'published').length;

  const handleAddNew = () => {
    setShowCatalog(false);
    goToStep(3);
  };

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black flex items-center gap-1.5">
            <Package className="text-mustard" size={18} /> {t.navCatalog}
          </h2>
          <p className="text-[11px] text-stone-500">
            {listings.length} products · {publishedCount} published
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-3 py-2">
        <Search size={16} className="text-stone-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your products"
          className="w-full bg-transparent text-sm text-charcoal outline-none placeholder:text-stone-400"
        />
      </div>

      <div className="flex gap-2">
        {FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-bold transition ${
                active ? 'bg-terracotta text-white' : 'border border-stone-300 bg-white text-charcoal'
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3 pb-2">
        {filtered.length > 0 ? (
          filtered.map((listing) => (
            <ListingTile key={listing.id} listing={listing} onOpen={openListing} />
          ))
        ) : listings.length === 0 ? (
          <EmptyState onAddNew={handleAddNew} />
        ) : (
          <p className="col-span-2 text-center text-[13px] text-stone-500 pt-6">
            No products match your search.
          </p>
        )}
      </div>

      <button
        onClick={handleAddNew}
        className="w-full py-4 bg-terracotta text-white rounded-2xl font-bold flex justify-center items-center gap-2 shadow-md hover:bg-[#8e3e29]"
      >
        Add new craft <ArrowRight size={18} />
      </button>
    </div>
  );
}