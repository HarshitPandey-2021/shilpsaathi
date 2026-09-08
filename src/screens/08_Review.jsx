import React, { useState } from 'react';
import { CheckCircle2, Share2, Check, Package, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useCraft } from '../context/CraftContext';
import { api } from '../utils/api';
import ScreenHeader from '../components/ui/ScreenHeader';
import PrimaryButton from '../components/ui/PrimaryButton';

export default function ReviewScreen() {
  const { productData, updateProduct, goToStep, clearOriginalPreview, getArtisanId, resolveArtisan, linkPhone, t, confirmedPhone } = useCraft();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneState, setPhoneState] = useState('idle');

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(''), 2600); }

  const handlePublish = async () => {
    setSaving(true); setSaveError(null); setValidationErrors({});
    try {
      // Frontend Validation
      const errors = {};
      if (!productData.name?.trim()) errors.name = 'Product name is required';
      if (!productData.final_price || isNaN(Number(productData.final_price)) || Number(productData.final_price) < 0) {
        errors.price = 'A valid final price is required';
      }
      if (!productData.image_url && !productData.enhancedImageB64 && !productData.originalB64) {
        errors.image = 'Product image is required';
      }

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        throw new Error('Please fix validation errors');
      }

      const artisanId = getArtisanId() || (await resolveArtisan());
      if (!artisanId) throw new Error('Could not identify your shop. Check the server is running.');

      let imageUrl = productData.image_url;
      const b64 = productData.enhancedImageB64 || productData.originalB64;
      if (!imageUrl && b64) {
        try {
          const store = await api.storePermanentImage(b64, 'image/jpeg');
          if (store?.success && store.data?.publicUrl) {
            imageUrl = store.data.publicUrl;
            updateProduct({ image_url: imageUrl });
          }
        } catch (e) {
          console.warn('[Review] Permanent store fallback:', e.message);
          // Fallback to enhanced / original preview data URL if permanent bucket is offline
          imageUrl = productData.enhancedImage || productData.originalImage || `data:image/jpeg;base64,${b64}`;
          updateProduct({ image_url: imageUrl });
        }
      }
      if (!imageUrl) {
        imageUrl = productData.enhancedImage || productData.originalImage;
      }
      if (!imageUrl) throw new Error('No image could be stored. Please re-take the photo.');

      const result = await api.createProduct({
        name: (productData.name || '').trim() || t.untitled,
        category: productData.category || 'Handmade Home Decor',
        material: productData.material || '',
        colour: productData.colour || '',
        craft_type: productData.craft_type || 'handmade',
        description_hi: productData.description_hi || productData.spoken_transcript || '',
        description_en: productData.description_en || '',
        keywords: productData.keywords?.length ? productData.keywords : ['handmade'],
        image_url: imageUrl,
        original_image_url: null,
        price_min: Number(productData.price_min) || Number(productData.final_price) || 0,
        price_max: Number(productData.price_max) || Number(productData.final_price) || 0,
        final_price: Number(productData.final_price) || 0,
        status: 'published',
        artisan_id: artisanId,
      });

      if (!result?.success) throw new Error(result?.message || 'Save failed');
      updateProduct({ savedProductId: result.data.id });
      setSaved(true);
      showToast(t.publishToast);
    } catch (err) {
      if (err.message === 'Please fix validation errors') {
        setSaving(false);
        return;
      }
      const e = err.data?.errors;
      const detail = e
        ? (Array.isArray(e) ? e.join(', ') : Object.entries(e).map(([k, v]) => `${k}: ${v}`).join(' · '))
        : err.message;
      console.warn('Publish failed:', detail);
      setSaveError(detail);
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    const text = `${productData.name}\n₹${productData.final_price}\n${productData.description_hi || ''}`;
    try {
      const blob = await fetch(productData.enhancedImage || productData.originalImage).then((r) => r.blob());
      const file = new File([blob], 'product.jpg', { type: blob.type });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: productData.name, text, files: [file] });
        return;
      }
    } catch {}
    if (navigator.share) { try { await navigator.share({ title: productData.name, text }); } catch {} }
    else { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  const doLink = async () => {
    setPhoneState('saving');
    const ok = await linkPhone(phone);
    setPhoneState(ok ? 'done' : 'error');
    showToast(ok ? t.phoneLinked : t.phoneFail);
  };

  return (
    <div className="space-y-4 animate-fade-in-up">
      <ScreenHeader title={t.verifyTitle} subtitle={t.verifySub} step={6} totalSteps={6} />

      <div className="overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white shadow-card">
        <img src={productData.enhancedImage || productData.originalImage} alt="" className="h-48 w-full object-cover" />
        <div className="space-y-2.5 p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wide text-mustard-500">{productData.category || 'Handicraft'}</span>
              <h3 className="font-display text-lg font-black leading-tight text-charcoal">
                {productData.name || t.untitled}
              </h3>
            </div>
            {productData.pricing_method && (
              <span className={`chip shrink-0 text-[10px] font-bold ${
                productData.pricing_method === 'ai'
                  ? 'border-forest-200 bg-forest-50 text-forest-700'
                  : 'border-mustard-200 bg-mustard-50 text-mustard-700'
              }`}>
                {productData.pricing_method === 'ai' ? '🤖 AI Advisor' : productData.pricing_method === 'heuristic' ? '📊 Fair Cost' : '✍️ Custom'}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-1">
            {productData.material && productData.material !== 'Not clearly identifiable' && (
              <span className="chip border-stone-200 bg-stone-50 text-[10px] text-stone-600">{productData.material}</span>
            )}
            {productData.colour && productData.colour !== 'Not clearly identifiable' && (
              <span className="chip border-stone-200 bg-stone-50 text-[10px] text-stone-600">{productData.colour}</span>
            )}
          </div>

          {productData.description_en && (
            <p className="text-xs leading-relaxed text-stone-600">{productData.description_en}</p>
          )}
          <div className="flex items-end justify-between border-t border-stone-100 pt-3">
            <div>
              <span className="text-2xs font-black uppercase tracking-wide text-stone-400">{t.yourPrice}</span>
              {productData.price_reasoning && (
                <p className="text-[10px] text-stone-400 max-w-[200px] truncate">{productData.price_reasoning}</p>
              )}
            </div>
            <span className="font-display text-3xl font-black leading-none text-terracotta">₹{productData.final_price}</span>
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
        <>
          {Object.keys(validationErrors).length > 0 && (
            <div className="flex gap-2.5 rounded-3xl border border-red-200 bg-red-50 p-3.5 animate-fade-in">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-600" />
              <div className="flex flex-col gap-0.5">
                <p className="text-xs font-black text-red-900">Please check the following:</p>
                {Object.entries(validationErrors).map(([key, msg]) => (
                  <p key={key} className="text-2xs leading-relaxed text-red-800/80">• {msg}</p>
                ))}
              </div>
            </div>
          )}
          <PrimaryButton onClick={handlePublish} loading={saving} variant="success" icon={CheckCircle2}>
            {saving ? t.publishing : t.publishBtn}
          </PrimaryButton>
        </>
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
            <button onClick={() => { clearOriginalPreview(); goToStep(10); }} className="touch flex flex-1 items-center justify-center gap-2 rounded-3xl bg-leaf text-xs font-bold text-white shadow-lift active:scale-[0.97]">
              <Package size={16} /> {t.viewList}
            </button>
          </div>

          {!confirmedPhone && phoneState !== 'done' && (
            <div className="space-y-2 rounded-3xl border border-stone-200 bg-white p-4 shadow-card">
              <p className="flex items-center gap-1.5 text-xs font-black text-charcoal">
                <ShieldCheck size={14} className="text-forest" /> {t.savePhoneTitle}
              </p>
              <p className="text-2xs leading-relaxed text-stone-500">{t.savePhoneSub}</p>
              <div className="flex gap-2">
                <input type="tel" inputMode="numeric" maxLength={10} value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="10 digit"
                  className="field-input flex-1 text-center font-black tracking-widest" />
                <button disabled={phone.length !== 10 || phoneState === 'saving'} onClick={doLink}
                  className="touch rounded-2xl bg-forest px-4 text-xs font-bold text-white disabled:bg-stone-200 disabled:text-stone-400">
                  {phoneState === 'saving' ? '...' : t.savePhoneBtn}
                </button>
              </div>
              <button onClick={() => setPhoneState('done')} className="w-full text-center text-2xs font-bold text-stone-400 underline">
                {t.skipForNow}
              </button>
            </div>
          )}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-charcoal px-4 py-2.5 text-xs font-bold text-white shadow-lift animate-fade-in-up">
          <CheckCircle2 size={15} className="text-forest-200" /> {toast}
        </div>
      )}
    </div>
  );
}