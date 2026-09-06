import { useState, useRef } from 'react';
import { Camera, Sparkles, ArrowRight, RotateCcw } from 'lucide-react';
import { useCraft } from '../context/CraftContext';
import { api } from '../utils/api';
import ScreenHeader from '../components/ui/ScreenHeader';

export default function CaptureScreen() {
  const { updateProduct, setOriginalPreview, nextStep, setIsLoading, setProcessingStages, setCurrentStage, t } = useCraft();
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || uploading) return;

    let success = false;
    let localPreviewUrl = null;

    try {
      setUploading(true);
      localPreviewUrl = setOriginalPreview(file);
      setPreview(localPreviewUrl);
      updateProduct({
        originalImage: localPreviewUrl,
        enhancedImage: localPreviewUrl,
        original_image_url: localPreviewUrl,
      });

      // Attempt streaming enhancement with a 5-second network timeout safeguard
      const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s ceiling for image AI

try {
  // MUST pass signal to forward abort control to the fetch call
  const response = await api.uploadImageStream(file, { signal: controller.signal });
  clearTimeout(timeoutId);

        if (response && response.ok && response.body) {
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
                break;
              }

              setProcessingStages(prev => {
                const exists = prev.some(p => p.stage === eventData.stage);
                return exists ? prev : [...prev, { stage: eventData.stage, message: eventData.message }];
              });

              if (!eventData.stage?.includes('complete') && !eventData.stage?.includes('stored')) {
                setCurrentStage(eventData.stage);
              }

              if (eventData.stage === 'complete' && eventData.image_b64) {
                success = true;
                setCurrentStage('');
                const dataUrl = `data:${eventData.mimeType || 'image/jpeg'};base64,${eventData.image_b64}`;
                updateProduct({
                  enhancedImage: dataUrl,
                  enhancedImageB64: eventData.image_b64,
                  original_image_url: localPreviewUrl,
                  // NOTE: image_url is NOT set here — it is only set at final submission
                  // after permanent storage succeeds
                });
              }
            }
          }
        }
      } catch (streamErr) {
        console.log('[Capture] Local image mode active:', streamErr.message);
      }
    } catch (err) {
      console.warn('[Capture] Notice:', err.message);
    } finally {
      setIsLoading(false);
      setUploading(false);
      setProcessingStages([]);
      setCurrentStage('');
      // Always proceed to next step smoothly
      nextStep();
    }
  };

  return (
    <div className="text-center space-y-5 animate-fade-in-up">
      <ScreenHeader title={t.photoTitle} subtitle={t.photoSub} step={1} totalSteps={7} />

      <div className="border-2 border-dashed border-terracotta/40 rounded-3xl p-6 bg-white/70 flex flex-col items-center shadow-inner">
        {preview ? (
          <div className="w-full space-y-3">
            <img src={preview} alt="Selected Craft" className="w-full h-48 object-cover rounded-2xl shadow-md border border-stone-200" />
            <div className="flex gap-2">
              <label className="flex-1 cursor-pointer bg-stone-100 hover:bg-stone-200 text-stone-700 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition">
                <RotateCcw size={14} /> दूसरी फोटो चुनें
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUpload}
                />
              </label>
              <button
                onClick={nextStep}
                className="flex-1 bg-terracotta hover:bg-[#8e3e29] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition"
              >
                आगे बढ़ें <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-terracotta mb-3 shadow-sm">
              <Camera size={32} />
            </div>
            <p className="text-xs font-semibold text-stone-700 mb-4">{t.photoBtn}</p>

            <label className="cursor-pointer bg-terracotta text-white px-6 py-3.5 rounded-xl font-bold text-sm shadow-md hover:bg-[#8e3e29] transition active:scale-95 flex items-center gap-2">
              <Camera size={18} /> {t.photoBtn}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
              />
            </label>
          </>
        )}
      </div>
      <p className="text-[11px] text-stone-400">{t.supportedCrafts}</p>
    </div>
  );
}

