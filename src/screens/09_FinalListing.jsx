import React, { useState } from 'react';
import { CheckCircle2, Share2, Copy, Check } from 'lucide-react';
import { useCraft } from '../context/CraftContext';
import { api } from '../utils/api';

export default function FinalListingScreen() {
  const { productData, updateProduct, goToStep, t } = useCraft();
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const handlePublish = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const productPayload = {
        name: productData.name,
        category: productData.category,
        material: productData.material,
        colour: productData.colour,
        craft_type: productData.craft_type,
        description_hi: productData.description_hi,
        description_en: productData.description_en,
        keywords: productData.keywords,
        image_url: productData.enhancedImage || productData.originalImage,
        original_image_url: productData.originalImage,
        price_min: productData.price_min,
        price_max: productData.price_max,
        final_price: productData.final_price,
        status: 'published',
      };

      const result = await api.createProduct(productPayload);
      if (result.success) {
        updateProduct({ savedProductId: result.data.id });
        setSaved(true);
      }
    } catch (err) {
      console.warn('Could not save product to backend:', err.message);
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
  const shareText = `${productData.name}\n₹${productData.final_price}\n${productData.description_hi}`;
  try {
    const imgBlob = await fetch(productData.enhancedImage || productData.originalImage).then(r => r.blob());
    const file = new File([imgBlob], 'product.jpg', { type: imgBlob.type });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ title: productData.name, text: shareText, files: [file] });
      return;
    }
  } catch {}
  // fallback: text-only share or clipboard
  if (navigator.share) {
    try { await navigator.share({ title: productData.name, text: shareText }); } catch {}
  } else {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
};

  return (
    <div className="space-y-4 text-center animate-fade-in-up">
      <div className="inline-flex p-3 bg-green-100 rounded-full text-forest">
        <CheckCircle2 size={32} />
      </div>
      <div>
        <h2 className="text-2xl font-black">{t.publishedTitle}</h2>
        <p className="text-xs text-stone-500">{t.publishedSub}</p>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-stone-200 text-left shadow-lg space-y-2">
        <img
          src={productData.enhancedImage || productData.originalImage}
          alt="Final Product"
          className="w-full h-48 object-cover rounded-2xl"
        />
        <span className="text-[10px] font-bold text-mustard uppercase tracking-wide block">{productData.category}</span>
        <h3 className="font-bold text-base leading-snug">{productData.name}</h3>
        <p className="text-xs text-stone-500 line-clamp-2">{productData.description_hi}</p>
        <div className="flex items-baseline justify-between pt-1">
          <p className="text-2xl font-black text-terracotta">₹{productData.final_price}</p>
          <span className="text-[10px] text-forest font-bold bg-green-50 px-2 py-0.5 rounded-md border border-green-200">
            {saved ? 'Saved' : 'Ready'}
          </span>
        </div>
      </div>

      {saveError && (
        <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
          Saved locally. Backend sync pending.
        </p>
      )}

      <div className="flex gap-2 pt-2">
        <button
          onClick={handlePublish}
          disabled={saving || saved}
          className="flex-1 py-3 bg-forest text-white rounded-2xl font-bold flex items-center justify-center gap-2 text-xs shadow-md hover:bg-[#326647] active:scale-[0.98] transition disabled:opacity-60"
        >
          <CheckCircle2 size={16} />
          {saved ? 'Published ✓' : saving ? 'Publishing...' : t.publishBtn}
        </button>
        <button
          onClick={handleShare}
          className="flex-1 py-3 bg-terracotta text-white rounded-2xl font-bold flex items-center justify-center gap-2 text-xs shadow-md hover:bg-[#8e3e29] active:scale-[0.98] transition"
        >
          {copied ? <Check size={16} /> : <Share2 size={16} />}
          {copied ? 'Copied!' : t.shareWhatsapp}
        </button>
      </div>
      <button
        onClick={() => goToStep(2)}
        className="w-full py-3 bg-stone-200 hover:bg-stone-300 rounded-2xl font-bold text-xs active:scale-[0.98] transition"
      >
        {t.homeBtn}
      </button>
    </div>
  );
}