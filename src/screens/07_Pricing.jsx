import React, { useState, useEffect, useId } from 'react';
import { Calculator, Sparkles, TrendingUp, ShieldCheck, Check, ArrowRight } from 'lucide-react';
import { useCraft } from '../context/CraftContext';
import { api } from '../utils/api';

const SKILL_LEVELS = [
  { id: 'basic', label: 'साधारण (Basic)', rate: 120, desc: 'बुनियादी शिल्प' },
  { id: 'skilled', label: 'कुशल (Skilled)', rate: 180, desc: 'विस्तृत नक्काशी / बुनाई' },
  { id: 'master', label: 'मास्टर (Master)', rate: 260, desc: 'पारंपरिक धरोहर कला' },
];

export default function PricingScreen() {
  const { productData, updateProduct, nextStep, t, lang } = useCraft();
  const materialInputId = useId();
  const laborHoursInputId = useId();

  const [rawCost, setRawCost] = useState(productData.raw_material_cost || 220);
  const [hours, setHours] = useState(productData.hours_spent || 5);
  const [skill, setSkill] = useState(productData.skill_level || 'skilled');
  const [breakdown, setBreakdown] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Re-calculate whenever inputs change
  useEffect(() => {
    let isMounted = true;
    const calculate = async () => {
      setIsCalculating(true);
      try {
        const res = await api.calculatePrice({
          rawMaterialCost: rawCost,
          hoursSpent: hours,
          skillLevel: skill,
          category: productData.category || 'Clay & Terracotta'
        });

        if (isMounted && res?.data) {
          setBreakdown(res.data);
          updateProduct({
            raw_material_cost: rawCost,
            hours_spent: hours,
            skill_level: skill,
            price_min: res.data.price_min,
            price_max: res.data.price_max,
            final_price: productData.final_price || res.data.suggested_price,
            price_reasoning: lang === 'hi' ? res.data.reasoning_hi : res.data.reasoning_en
          });
        }
      } catch (e) {
        // Local calculation fallback
        const hourlyRate = skill === 'master' ? 260 : (skill === 'basic' ? 120 : 180);
        const labor = Math.round(hours * hourlyRate);
        const overhead = Math.round((rawCost + labor) * 0.12);
        const prodCost = rawCost + labor + overhead;
        const margin = Math.round(prodCost * 0.25);
        const suggested = Math.round((prodCost + margin) / 10) * 10;
        const minP = Math.round((suggested * 0.9) / 10) * 10;
        const maxP = Math.round((suggested * 1.25) / 10) * 10;

        if (isMounted) {
          setBreakdown({
            raw_material_cost: rawCost,
            labor_cost: labor,
            overhead_cost: overhead,
            production_cost: prodCost,
            artisan_margin: margin,
            price_min: minP,
            price_max: maxP,
            suggested_price: suggested,
            hourly_rate: hourlyRate
          });
          updateProduct({
            price_min: minP,
            price_max: maxP,
            final_price: productData.final_price || suggested
          });
        }
      } finally {
        if (isMounted) setIsCalculating(false);
      }
    };

    calculate();
    return () => { isMounted = false; };
  }, [rawCost, hours, skill, productData.category, lang]);

  const applySuggested = () => {
    if (breakdown?.suggested_price) {
      updateProduct({ final_price: breakdown.suggested_price });
    }
  };

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black flex items-center gap-1.5">
            <Calculator className="text-terracotta" size={20} /> {t.priceTitle}
          </h2>
          <p className="text-xs text-stone-500">{t.priceSub}</p>
        </div>
        <span className="text-[10px] bg-forest/10 text-forest border border-forest/30 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
          <ShieldCheck size={12} /> Fair Trade Fair Wage
        </span>
      </div>

      {/* Suggested Range Hero Card */}
      <div className="bg-amber-100/80 border border-mustard/60 p-4 rounded-3xl text-center space-y-2 shadow-sm">
        <span className="text-[11px] text-amber-900 font-bold uppercase tracking-wider">{t.suggestedRange}</span>
        <div className="flex items-center justify-center gap-2">
          <h3 className="text-3xl font-black text-charcoal">
            ₹{breakdown?.price_min || productData.price_min} – ₹{breakdown?.price_max || productData.price_max}
          </h3>
        </div>
        <div className="flex items-center justify-center gap-2 pt-1">
          <span className="text-xs text-stone-600 font-medium">अनुशंसित (Recommended):</span>
          <span className="text-sm font-black text-terracotta bg-white px-2.5 py-0.5 rounded-full border border-terracotta/30 shadow-xs">
            ₹{breakdown?.suggested_price || productData.final_price}
          </span>
          <button
            onClick={applySuggested}
            className="text-[10px] font-bold text-forest bg-green-100 hover:bg-green-200 border border-green-300 px-2 py-0.5 rounded-md transition"
          >
            लागू करें (Apply)
          </button>
        </div>
      </div>

      {/* Interactive Fair Pricing Inputs */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-3 text-xs shadow-sm">
        <h4 className="font-bold text-stone-800 text-xs uppercase tracking-wide flex items-center gap-1">
          <Sparkles size={14} className="text-mustard" /> लागत एवं श्रम गणना (Cost & Labor Inputs)
        </h4>

        {/* Raw Material Cost */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor={materialInputId} className="font-semibold text-stone-600">कच्चा माल खर्च (Raw Material Cost)</label>
            <span className="font-black text-terracotta">₹{rawCost}</span>
          </div>
          <input
            id={materialInputId}
            type="range"
            min="50"
            max="3000"
            step="10"
            value={rawCost}
            onChange={e => setRawCost(Number(e.target.value))}
            className="w-full accent-terracotta cursor-pointer"
          />
        </div>

        {/* Hours Spent */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor={laborHoursInputId} className="font-semibold text-stone-600">मेहनत के घंटे (Labor Hours Spent)</label>
            <span className="font-black text-terracotta">{hours} hrs</span>
          </div>
          <input
            id={laborHoursInputId}
            type="range"
            min="1"
            max="40"
            step="0.5"
            value={hours}
            onChange={e => setHours(Number(e.target.value))}
            className="w-full accent-terracotta cursor-pointer"
          />
        </div>

        {/* Skill / Craft Level Selection */}
        <div>
          <label className="font-semibold text-stone-600 block mb-1">कारीगरी का स्तर (Skill Level & Hourly Rate)</label>
          <div className="grid grid-cols-3 gap-1.5">
            {SKILL_LEVELS.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSkill(item.id)}
                className={`p-2 rounded-xl border text-center transition ${
                  skill === item.id
                    ? 'border-terracotta bg-terracotta/10 text-terracotta font-bold ring-1 ring-terracotta'
                    : 'border-stone-200 text-stone-600 bg-stone-50 hover:bg-stone-100'
                }`}
              >
                <div className="text-[11px] font-bold">{item.label}</div>
                <div className="text-[10px] text-stone-500">₹{item.rate}/घंटा</div>
              </button>
            ))}
          </div>
        </div>

        {/* Transparent Breakdown Pill */}
        {breakdown && (
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-2.5 space-y-1 text-[11px] text-stone-600">
            <div className="flex justify-between">
              <span>कच्चा माल (Material):</span>
              <span className="font-semibold text-stone-800">₹{breakdown.raw_material_cost}</span>
            </div>
            <div className="flex justify-between">
              <span>कुशल श्रम (Labor {hours}h @ ₹{breakdown.hourly_rate}/h):</span>
              <span className="font-semibold text-stone-800">₹{breakdown.labor_cost}</span>
            </div>
            <div className="flex justify-between">
              <span>औजार / भट्टी / ऊर्जा खर्च (12%):</span>
              <span className="font-semibold text-stone-800">₹{breakdown.overhead_cost}</span>
            </div>
            <div className="flex justify-between text-forest font-bold pt-1 border-t border-stone-200">
              <span>उचित कारीगर लाभ (25% Fair Margin):</span>
              <span>+₹{breakdown.artisan_margin}</span>
            </div>
          </div>
        )}
      </div>

      {/* Set Final Price */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
        <label className="text-xs font-bold text-stone-500 block mb-1">{t.setFinalPrice}</label>
        <div className="flex items-center gap-1 border-b-2 border-terracotta pb-1">
          <span className="text-2xl font-bold text-stone-400">₹</span>
          <input 
            type="number" 
            value={productData.final_price || ''} 
            onChange={e => updateProduct({ final_price: Number(e.target.value) })}
            className="w-full text-2xl font-black outline-none text-terracotta"
            placeholder="890"
          />
        </div>
      </div>

      <button 
        onClick={nextStep} 
        className="w-full py-4 bg-terracotta hover:bg-[#8e3e29] text-white rounded-2xl font-bold flex justify-center items-center gap-2 shadow-lg shadow-terracotta/25 active:scale-[0.98] transition"
      >
        <Check size={18} /> {t.reviewBtn} <ArrowRight size={18} />
      </button>
    </div>
  );
}