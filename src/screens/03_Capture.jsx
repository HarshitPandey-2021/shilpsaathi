import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import { useCraft } from '../context/CraftContext';
import { api } from '../utils/api';

export default function CaptureScreen() {
  const { updateProduct, nextStep, setIsLoading, setLoadingMessage, t } = useCraft();
  const [preview, setPreview] = useState(null);

  const handleCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      updateProduct({ originalImage: url, enhancedImage: url });
      nextStep();
      setLoadingMessage("AI Image Studio: Isolating craft & removing clutter...");
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 1200);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreview(url);
    updateProduct({ originalImage: url, enhancedImage: url });
    setLoadingMessage("Uploading image to studio...");
    setIsLoading(true);

    try {
      const result = await api.uploadImage(file);
      if (result.success) {
        updateProduct({
          originalImage: result.data.publicUrl,
          enhancedImage: result.data.publicUrl,
          original_image_url: result.data.publicUrl,
          image_url: result.data.publicUrl,
        });
      }
    } catch (err) {
      console.warn('Image upload failed, using local preview:', err.message);
    } finally {
      setIsLoading(false);
      nextStep();
      setLoadingMessage("AI Image Studio: Isolating craft & removing clutter...");
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 1200);
    }
  };

  return (
    <div className="text-center space-y-5 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-black text-charcoal">{t.photoTitle}</h2>
        <p className="text-xs text-stone-600 mt-1">{t.photoSub}</p>
      </div>
      <div className="border-2 border-dashed border-terracotta/40 rounded-3xl p-8 bg-white/70 flex flex-col items-center shadow-inner">
        {preview ? (
          <img src={preview} alt="Preview" className="w-full h-40 object-cover rounded-xl mb-4" />
        ) : (
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-terracotta mb-3 shadow-sm">
            <Camera size={32} />
          </div>
        )}
        <p className="text-xs font-semibold text-stone-700 mb-4">{t.photoBtn}</p>
        <label className="cursor-pointer bg-terracotta text-white px-6 py-3.5 rounded-xl font-bold text-sm shadow-md hover:bg-[#8e3e29] transition active:scale-95">
          {t.photoBtn}
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </label>
      </div>
      <p className="text-[11px] text-stone-400">{t.supportedCrafts}</p>
    </div>
  );
}