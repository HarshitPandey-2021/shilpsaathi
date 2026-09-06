import React from 'react';
import { useCraft } from '../context/CraftContext';
import ScreenHeader from '../components/ui/ScreenHeader';
import Card from '../components/ui/Card';
import PrimaryButton from '../components/ui/PrimaryButton';

export default function CatalogEditScreen() {
  const { productData, updateProduct, nextStep, t } = useCraft();

  return (
    <div className="space-y-4 animate-fade-in-up">
    <ScreenHeader title={t.catalogTitle} subtitle={t.catalogSub} step={4} totalSteps={7} />

      <img
        src={productData.enhancedImage || productData.originalImage}
        alt={productData.name}
        className="w-full h-40 object-cover rounded-2xl border border-stone-200 shadow-sm"
      />

      <Card className="space-y-3 text-xs">
        <div>
          <label className="text-stone-400 font-bold block mb-0.5">Product Title</label>
          <input className="w-full font-bold text-stone-800 border-b pb-1 outline-none text-sm focus:border-terracotta"
            value={productData.name} onChange={e => updateProduct({ name: e.target.value })} />
        </div>
        <div>
          <label className="text-stone-400 font-bold block mb-0.5">Material & Craft Technique</label>
          <input className="w-full font-medium border-b pb-1 outline-none text-stone-700 focus:border-terracotta"
            value={productData.material} onChange={e => updateProduct({ material: e.target.value })} />
        </div>
        <div>
          <label className="text-stone-400 font-bold block mb-0.5">Description (Native)</label>
          <textarea className="w-full border rounded-lg p-2 outline-none leading-relaxed text-xs focus:border-terracotta"
            rows="2" value={productData.description_hi} onChange={e => updateProduct({ description_hi: e.target.value })} />
        </div>
        <div>
          <label className="text-stone-400 font-bold block mb-0.5">English Translation</label>
          <textarea className="w-full border rounded-lg p-2 outline-none text-stone-700 leading-relaxed text-xs focus:border-terracotta"
            rows="2" value={productData.description_en} onChange={e => updateProduct({ description_en: e.target.value })} />
        </div>
      </Card>

      <PrimaryButton onClick={nextStep}>{t.calcPriceBtn}</PrimaryButton>
    </div>
  );
}
