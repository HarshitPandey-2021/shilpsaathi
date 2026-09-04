import { useState, useRef } from 'react';
import { Camera } from 'lucide-react';
import { useCraft } from '../context/CraftContext';
import { api } from '../utils/api';

export default function CaptureScreen() {
  const { updateProduct, setOriginalPreview, nextStep, setIsLoading, setProcessingStages, setCurrentStage, t } = useCraft();
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || uploading) return;

    setUploading(true);
    setUploadError(null);
    setProcessingStages([]);
    setCurrentStage('');
    setPreview(setOriginalPreview(file));
    setIsLoading(true);
    let success = false;

    try {
      const response = await api.uploadImageStream(file);
      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.message || `Upload failed (${response.status})`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith('data: ')) continue;

          let eventData;
          try {
            eventData = JSON.parse(line.slice(6));
          } catch {
            continue;
          }

          if (eventData.stage === 'error') {
            throw new Error(eventData.message || 'Image processing failed. Please try again.');
          }

          setProcessingStages(prev => {
            const exists = prev.some(p => p.stage === eventData.stage);
            return exists ? prev : [...prev, { stage: eventData.stage, message: eventData.message }];
          });

          if (!eventData.stage?.includes('complete') && !eventData.stage?.includes('stored')) {
            setCurrentStage(eventData.stage);
          }

          if (eventData.stage === 'stored' && eventData.publicUrl) {
            success = true;
            setCurrentStage('');
            updateProduct({
              enhancedImage: eventData.publicUrl,
              original_image_url: null,
              image_url: eventData.publicUrl,
            });
          }
        }
      }
    } catch (err) {
      console.warn('Image upload/enhance failed:', err.message);
      setUploadError(err.message || 'Image processing failed. Please try again.');
    } finally {
      setIsLoading(false);
      setUploading(false);
      setProcessingStages([]);
      setCurrentStage('');
      if (success) {
        nextStep();
      }
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
        {uploadError && (
          <p className="text-[11px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3 font-semibold">
            {uploadError}
          </p>
        )}
        <label className="cursor-pointer bg-terracotta text-white px-6 py-3.5 rounded-xl font-bold text-sm shadow-md hover:bg-[#8e3e29] transition active:scale-95">
          {uploadError ? 'Choose Another Image' : t.photoBtn}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>
      <p className="text-[11px] text-stone-400">{t.supportedCrafts}</p>
    </div>
  );
}
