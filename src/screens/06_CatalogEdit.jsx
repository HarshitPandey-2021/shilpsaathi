import React from 'react';
import { ArrowRight, Sparkles, Tag, X, Check, AlertCircle, Bot } from 'lucide-react';
import { useCraft } from '../context/CraftContext';
import ScreenHeader from '../components/ui/ScreenHeader';
import PrimaryButton from '../components/ui/PrimaryButton';

function Field({ label, value, onChange, rows, placeholder }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-2xs font-black uppercase tracking-wide text-stone-400">{label}</label>
      {rows ? (
        <textarea rows={rows} value={value || ''} placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="field-input resize-none text-xs leading-relaxed" />
      ) : (
        <input value={value || ''} placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="field-input font-semibold" />
      )}
    </div>
  );
}

export default function CatalogEditScreen() {
  const { productData, updateProduct, nextStep, t } = useCraft();
  const keywords = productData.keywords || [];

  const removeKeyword = (k) => updateProduct({ keywords: keywords.filter((x) => x !== k) });

  return (
    <div className="space-y-4 animate-fade-in-up">
      <ScreenHeader title={t.catalogTitle} subtitle={t.catalogSub} icon={Sparkles} step={4} totalSteps={6} />

      {/* AI vs Heuristic Generation Banner */}
      <div className={`flex items-center justify-between rounded-2xl border px-3.5 py-2 text-2xs font-bold ${
        productData.is_ai_generated !== false
          ? 'border-forest-200 bg-forest-50 text-forest-700'
          : 'border-amber-200 bg-amber-50 text-amber-800'
      }`}>
        <span className="flex items-center gap-1.5">
          {productData.is_ai_generated !== false ? (
            <>
              <Sparkles size={13} className="text-forest" />
              {t.aiVerified || 'AI Verified Catalog'}
            </>
          ) : (
            <>
              <AlertCircle size={13} className="text-amber-600" />
              {t.autoFilledReview || 'Auto-filled, please review details'}
            </>
          )}
        </span>
        {productData.llm_provider && (
          <span className="text-[10px] opacity-75 font-mono uppercase">
            via {productData.llm_provider}
          </span>
        )}
      </div>

      {productData.spoken_transcript && (
        <div className="space-y-2 rounded-3xl border border-mustard-200 bg-mustard-50 p-4 animate-scale-in">
          <p className="flex items-center gap-1.5 text-2xs font-black uppercase tracking-wide text-mustard-700">
            <Sparkles size={12} /> {t.aiHeard}
          </p>
          <p className="text-xs italic leading-relaxed text-mustard-800">"{productData.spoken_transcript}"</p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[
              productData.material && productData.material !== 'Not clearly identifiable' && productData.material,
              productData.colour && productData.colour !== 'Not clearly identifiable' && productData.colour,
              productData.category,
              productData.hours_spent && `${productData.hours_spent} hrs`,
            ].filter(Boolean).map((v, i) => (
              <span key={i} className="chip animate-pop border-white bg-white text-mustard-700" style={{ animationDelay: `${i * 80}ms` }}>
                <Check size={11} strokeWidth={3} className="text-forest" /> {v}
              </span>
            ))}
          </div>
        </div>
      )}
      <div className="flex gap-3 rounded-3xl border border-stone-200 bg-white p-3 shadow-card">
        <img
          src={productData.enhancedImage || productData.originalImage}
          alt=""
          className="h-20 w-20 shrink-0 rounded-2xl border border-stone-200 object-cover"
        />
        <div className="min-w-0 flex-1 self-center">
          <p className="truncate text-sm font-black text-charcoal">{productData.name || t.untitled || 'Handcrafted Product'}</p>
          <p className="mt-0.5 truncate text-2xs text-stone-500">{productData.material || productData.category || ''}</p>
          {productData.isEnhanced && (
            <span className="chip mt-1.5 border-forest-200 bg-forest-50 text-forest">
              <Sparkles size={11} /> AI Enhanced
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3.5 rounded-3xl border border-stone-200 bg-white p-4 shadow-card">
        <Field label={t.fTitle}    value={productData.name}     placeholder={t.untitled} onChange={(v) => updateProduct({ name: v })} />
        <div className="grid grid-cols-2 gap-3">
          <Field label={t.fCategory} value={productData.category} placeholder="Category" onChange={(v) => updateProduct({ category: v })} />
          <Field label={t.fColour}   value={productData.colour}   placeholder="Colour" onChange={(v) => updateProduct({ colour: v })} />
        </div>
        <Field label={t.fMaterial}   value={productData.material} placeholder="Material" onChange={(v) => updateProduct({ material: v })} />
        <Field label={t.fDescNative} value={productData.description_hi} rows={3} placeholder={t.fDescNative} onChange={(v) => updateProduct({ description_hi: v })} />
        <Field label={t.fDescEn}     value={productData.description_en} rows={3} placeholder={t.fDescEn} onChange={(v) => updateProduct({ description_en: v })} />

        {keywords.length > 0 && (
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-2xs font-black uppercase tracking-wide text-stone-400">
              <Tag size={11} /> {t.fKeywords}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {keywords.map((k) => (
                <button key={k} onClick={() => removeKeyword(k)}
                  className="chip border-mustard-200 bg-mustard-50 text-mustard-700">
                  {k} <X size={11} strokeWidth={3} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <PrimaryButton onClick={nextStep} iconRight={ArrowRight}>{t.calcPriceBtn}</PrimaryButton>
    </div>
  );
}