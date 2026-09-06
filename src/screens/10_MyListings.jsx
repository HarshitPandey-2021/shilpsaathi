import React, { useEffect, useState } from 'react';
import { Package, RefreshCw, Inbox } from 'lucide-react';
import { useCraft } from '../context/CraftContext';
import { api } from '../utils/api';
import Card from '../components/ui/Card';

export default function MyListingsScreen() {
  const { getArtisanId, goToStep, t } = useCraft();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getProducts(getArtisanId());
      setProducts(res?.data || []);
    } catch (err) {
      setError('लिस्टिंग लोड नहीं हो सकी। कृपया दोबारा कोशिश करें।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchListings(); }, []);

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-charcoal">मेरी सूची / My Listings</h2>
          <p className="text-xs text-stone-500 mt-0.5">आपके सभी प्रकाशित उत्पाद</p>
        </div>
        <button onClick={fetchListings} className="p-2 rounded-full bg-stone-100 hover:bg-stone-200 active:scale-95 transition">
          <RefreshCw size={16} className={loading ? 'animate-spin text-terracotta' : 'text-stone-500'} />
        </button>
      </div>

      {loading && (
        <div className="space-y-2.5">
          {[1, 2].map(i => (
            <div key={i} className="h-20 rounded-2xl bg-stone-100 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && error && (
        <Card className="text-center text-xs text-amber-800 bg-amber-50 border-amber-200">{error}</Card>
      )}

      {!loading && !error && products.length === 0 && (
        <Card className="text-center py-8 space-y-2">
          <Inbox size={32} className="text-stone-300 mx-auto" />
          <p className="text-sm font-bold text-stone-700">अभी कोई लिस्टिंग नहीं है</p>
          <p className="text-xs text-stone-500">"नया शिल्प जोड़ें" पर टैप करके अपना पहला उत्पाद जोड़ें</p>
          <button onClick={() => goToStep(3)} className="mt-2 text-xs font-bold text-terracotta underline">
            + नया शिल्प जोड़ें
          </button>
        </Card>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="space-y-2.5">
          {products.map((p) => (
            <Card key={p.id} className="flex gap-3 items-center">
              <img src={p.image_url} alt={p.name} className="w-16 h-16 rounded-xl object-cover border border-stone-200 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-charcoal truncate">{p.name}</p>
                <p className="text-[10px] text-stone-400 uppercase font-bold">{p.category}</p>
                <p className="text-terracotta font-black text-sm mt-0.5">₹{p.final_price}</p>
              </div>
              <span className="text-[10px] font-bold text-forest bg-green-50 border border-green-200 px-2 py-0.5 rounded-full shrink-0">
                {p.status === 'published' ? 'Live' : p.status}
              </span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}