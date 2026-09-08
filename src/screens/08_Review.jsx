import React, { useState } from 'react';
import { CheckCircle2, Share2, Check, Package, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useCraft } from '../context/CraftContext';
import { api } from '../utils/api';
import ScreenHeader from '../components/ui/ScreenHeader';
import PrimaryButton from '../components/ui/PrimaryButton';

export default function ReviewScreen() {
  const { productData, updateProduct, goToStep, clearOriginalPreview, getArtisanId, t } = useCraft();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [phone, setPhone] = useState(localStorage.getItem('shilpsaathi_artisan_phone') || '');
  const [phoneSaved, setPhoneSaved] = useState(false);

  const handlePublish = async () => {
    setSaving(true); setSaveError(null);
    try {
      const imageB64 = productData.enhancedImageB64;
      let permanentImageUrl = productData.image_url;

      if (imageB64 && !permanentImageUrl) {
        const storeResult = await api.storePermanentImage(imageB64, 'image/jpeg');
        if (storeResult.success && storeResult.data?.publicUrl) {
          permanentImageUrl = storeResult.data.publicUrl;
          updateProduct({ image_url: permanentImageUrl });
        } else throw new Error('Image storage did not return a public URL');
      }

      const result = await api.createProduct({
        name: productData.name,
        category: productData.category,
        material: productData.material,
        colour: productData.colour,
        craft_type: productData.craft_type || 'handmade',
        description_hi: productData.description_hi,
        description_en: productData.description_en,
        keywords: productData.keywords?.length ? productData.keywords : ['handmade'],
        image_url: permanentImageUrl,
        price_min: productData.price_min,
        price_max: productData.price_max,
        final_price: productData.final_price,
        status: 'published',
        artisan_id: getArtisanId(),
      });

      if (!result.success) throw new Error(result.message || 'Save failed');
      updateProduct({ savedProductId: result.data.id });
      setSaved(true);
    } catch (err) {
      console.warn('Could not save product:', err.message, err.data);
      setSaveError(err.data?.errors?.join(', ') || err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    const shareText = `${productData.name}\n₹${productData.final_price}\n${productData.description_hi}`;
    try {
      const blob = await fetch(productData.enhancedImage || productData.originalImage).then((r) => r.blob());
      const file = new File([blob], 'product.jpg', { type: blob.type });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: productData.name, text: shareText, files: [file] });
        return;
      }
    } catch {}
    if (navigator.share) { try { await navigator.share({ title: productData.name, text: shareText }); } catch {} }
    else {
      await navigator.clipboard.writeText(shareText);
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    }
  };

  const goToListings = () => {
    clearOriginalPreview();
    updateProduct({ originalImage: null });
    goToStep(10);
  };

  return (
    <div className="space-y-4 animate-fade-in-up">
      <ScreenHeader title={t.verifyTitle} subtitle={t.verifySub} step={6} totalSteps={6} />

      <div className="overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white shadow-card">
        <img src={productData.enhancedImage || productData.originalImage} alt="" className="h-48 w-full object-cover" />
        <div className="space-y-2.5 p-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wide text-mustard-500">
              {productData.category}
            </span>
            <h3 className="font-display text-lg font-black leading-tight text-charcoal">{productData.name}</h3>
          </div>
          <p className="text-xs leading-relaxed text-stone-600">{productData.description_en}</p>
          <div className="flex items-end justify-between border-t border-stone-100 pt-3">
            <span className="text-2xs font-black uppercase tracking-wide text-stone-400">{t.yourPrice}</span>
            <span className="font-display text-3xl font-black leading-none text-terracotta">
              ₹{productData.final_price}
            </span>
          </div>
        </div>
      </div>

      {saveError && (
        <div className="flex gap-2.5 rounded-3xl border border-amber-200 bg-amber-50 p-3.5">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600" />
          <p className="text-2xs leading-relaxed text-amber-900">{t.saveFailed}: {saveError}</p>
        </div>
      )}

      {!saved ? (
        <PrimaryButton onClick={handlePublish} loading={saving} variant="success" icon={CheckCircle2}>
          {saving ? t.publishing : t.publishBtn}
        </PrimaryButton>
      ) : (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center gap-2.5 rounded-3xl border border-forest-200 bg-forest-50 p-4">
            <CheckCircle2 size={22} className="shrink-0 text-forest" />
            <div className="min-w-0">
              <p className="text-sm font-black text-forest-600">{t.publishedTitle}</p>
              <p className="text-2xs text-forest-600/80">{t.publishedSub}</p>
            </div>
          </div>

          <div className="flex gap-2.5">
            <button onClick={handleShare} className="touch flex flex-1 items-center justify-center gap-2 rounded-3xl bg-craft text-xs font-bold text-white shadow-lift active:scale-[0.97]">
              {copied ? <Check size={16} /> : <Share2 size={16} />} {copied ? t.copied : t.shareWhatsapp}
            </button>
            <button onClick={goToListings} className="touch flex flex-1 items-center justify-center gap-2 rounded-3xl bg-leaf text-xs font-bold text-white shadow-lift active:scale-[0.97]">
              <Package size={16} /> {t.viewList}
            </button>
          </div>

          {!phoneSaved && (
            <div className="space-y-2 rounded-3xl border border-stone-200 bg-white p-4 shadow-card">
              <p className="flex items-center gap-1.5 text-xs font-black text-charcoal">
                <ShieldCheck size={14} className="text-forest" /> {t.savePhoneTitle}
              </p>
              <p className="text-2xs leading-relaxed text-stone-500">{t.savePhoneSub}</p>
              <div className="flex gap-2">
                <input
                  type="tel" inputMode="numeric" maxLength={10} value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="10 digit"
                  className="field-input flex-1 text-center font-black tracking-widest"
                />
                <button
                  disabled={phone.length !== 10}
                  onClick={() => { localStorage.setItem('shilpsaathi_artisan_phone', phone); setPhoneSaved(true); }}
                  className="touch rounded-2xl bg-forest px-4 text-xs font-bold text-white disabled:bg-stone-200 disabled:text-stone-400"
                >
                  {t.savePhoneBtn}
                </button>
              </div>
              <button onClick={() => setPhoneSaved(true)} className="w-full text-center text-2xs font-bold text-stone-400 underline">
                {t.skipForNow}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}