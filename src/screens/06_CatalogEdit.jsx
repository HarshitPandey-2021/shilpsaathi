import React from 'react';
import { Sparkles, Tag, Layers, Palette, ArrowRight } from 'lucide-react';
import { useCraft } from '../context/CraftContext';

const CRAFT_CATEGORY_OPTIONS = [
  'Clay & Terracotta',
  'Textiles & Handloom',
  'Woodcraft',
  'Metalcraft',
  'Folk Art & Paintings',
  'Leather Craft',
  'Stone Carving',
  'Handmade Home Decor'
];

export default function CatalogEditScreen() {
  const { productData, updateProduct, nextStep, t } = useCraft();

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black">{t.catalogTitle}</h2>
          <p className="text-xs text-stone-500">{t.catalogSub}</p>
        </div>
        <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
          <Sparkles size={10} /> AI Structured
        </span>
      </div>

      <div className="space-y-3 bg-white p-4 rounded-2xl border border-stone-200 text-xs shadow-sm">
        {/* Product Title */}
        <div>
          <label className="text-stone-500 font-bold block mb-1">उत्पाद का नाम / Product Title</label>
          <input 
            className="w-full font-bold text-stone-800 border rounded-lg px-3 py-2 outline-none text-sm focus:border-terracotta focus:ring-1 focus:ring-terracotta bg-stone-50/50" 
            value={productData.name || ''} 
            onChange={e => updateProduct({ name: e.target.value })} 
          />
        </div>

        {/* Category Selector */}
        <div>
          <label className="text-stone-500 font-bold block mb-1 flex items-center gap-1">
            <Layers size={12} className="text-terracotta" /> शिल्प श्रेणी / Category
          </label>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {CRAFT_CATEGORY_OPTIONS.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => updateProduct({ category: cat })}
                className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold transition ${
                  productData.category === cat
                    ? 'bg-terracotta text-white border-terracotta shadow-sm'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Material & Colors */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-stone-500 font-bold block mb-1">सामग्री / Material</label>
            <input 
              className="w-full font-medium border rounded-lg px-2.5 py-1.5 outline-none text-stone-800 focus:border-terracotta bg-stone-50/50" 
              value={productData.material || ''} 
              onChange={e => updateProduct({ material: e.target.value })} 
              placeholder="e.g. Terracotta Clay"
            />
          </div>
          <div>
            <label className="text-stone-500 font-bold block mb-1 flex items-center gap-1">
              <Palette size={12} className="text-terracotta" /> रंग / Colour
            </label>
            <input 
              className="w-full font-medium border rounded-lg px-2.5 py-1.5 outline-none text-stone-800 focus:border-terracotta bg-stone-50/50" 
              value={productData.colour || ''} 
              onChange={e => updateProduct({ colour: e.target.value })} 
              placeholder="e.g. Terracotta & Ochre"
            />
          </div>
        </div>

        {/* Native Language Description */}
        <div>
          <label className="text-stone-500 font-bold block mb-1">विवरण (हिंदी / मातृभाषा)</label>
          <textarea 
            className="w-full border rounded-lg p-2.5 outline-none leading-relaxed text-xs focus:border-terracotta bg-stone-50/50" 
            rows="2" 
            value={productData.description_hi || ''} 
            onChange={e => updateProduct({ description_hi: e.target.value })} 
          />
        </div>

        {/* English Translation */}
        <div>
          <label className="text-stone-500 font-bold block mb-1">English E-Commerce Description</label>
          <textarea 
            className="w-full border rounded-lg p-2.5 outline-none text-stone-700 leading-relaxed text-xs focus:border-terracotta bg-stone-50/50" 
            rows="2" 
            value={productData.description_en || ''} 
            onChange={e => updateProduct({ description_en: e.target.value })} 
          />
        </div>

        {/* Tags / Keywords */}
        {productData.keywords && productData.keywords.length > 0 && (
          <div>
            <label className="text-stone-500 font-bold block mb-1 flex items-center gap-1">
              <Tag size={12} className="text-terracotta" /> खोज शब्द (Keywords / Tags)
            </label>
            <div className="flex flex-wrap gap-1">
              {productData.keywords.map((kw, i) => (
                <span key={i} className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md border border-stone-200 font-medium">
                  #{kw}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <button 
        onClick={nextStep} 
        className="w-full py-4 bg-terracotta hover:bg-[#8e3e29] text-white rounded-2xl font-bold flex justify-center items-center gap-2 shadow-lg shadow-terracotta/25 active:scale-[0.98] transition"
      >
        <Sparkles size={18} /> {t.calcPriceBtn} <ArrowRight size={18} />
      </button>
    </div>
  );
}