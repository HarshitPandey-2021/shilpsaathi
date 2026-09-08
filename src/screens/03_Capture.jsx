import React, { useState, useRef } from 'react';
import { Camera, Images, RotateCcw, ArrowRight, AlertTriangle, Sparkles } from 'lucide-react';
import { useCraft } from '../context/CraftContext';
import { api } from '../utils/api';
import ScreenHeader from '../components/ui/ScreenHeader';

const STAGE_ORDER = [
  'starting', 'loaded', 'resizing', 'quality', 'background', 'edges',
  'cropping', 'product_quality', 'upscaling', 'lighting', 'canvas', 'enhancing', 'complete',
];

const STAGE_LABELS = {
  starting: 'Receiving image', loaded: 'Image loaded', resizing: 'Resizing',
  quality: 'Analysing quality', background: 'Removing background', edges: 'Refining edges',
  cropping: 'Cropping product', product_quality: 'Checking product', upscaling: 'Upscaling (Real-ESRGAN)',
  lighting: 'Correcting lighting', canvas: 'Building 1080×1080 canvas', enhancing: 'Finalising', complete: 'Done',
};

export default function CaptureScreen() {
  const { updateProduct, setOriginalPreview, nextStep, t } = useCraft();
  const [preview, setPreview] = useState(null);
  const [phase, setPhase] = useState('idle');   // idle | working | failed
  const [stage, setStage] = useState('');
  const [done, setDone] = useState([]);
  const galleryRef = useRef(null);

  const pct = stage ? Math.round(((STAGE_ORDER.indexOf(stage) + 1) / STAGE_ORDER.length) * 100) : 0;

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || phase === 'working') return;

    setPhase('working');
    setStage('');
    setDone([]);

    let ok = false;
       const localUrl = setOriginalPreview(file);
    setPreview(localUrl);
    updateProduct({ originalImage: localUrl, enhancedImage: null, isEnhanced: false, original_image_url: localUrl });

    // keep a base64 copy so publishing works even if enhancement fails
    try {
      const b64 = await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result).split(',')[1]);
        r.onerror = reject;
        r.readAsDataURL(file);
      });
      updateProduct({ originalB64: b64 });
    } catch { /* non-fatal */ }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const response = await api.uploadImageStream(file, { signal: controller.signal });
      if (!response?.ok || !response.body) throw new Error('stream unavailable');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done: finished, value } = await reader.read();
        if (finished) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith('data: ')) continue;
          let ev;
          try { ev = JSON.parse(line.slice(6)); } catch { continue; }

          if (ev.stage === 'error') throw new Error(ev.message || 'pipeline error');
          if (ev.stage) {
            setStage(ev.stage);
            setDone((p) => (p.includes(ev.stage) ? p : [...p, ev.stage]));
          }
          if (ev.stage === 'complete' && ev.image_b64) {
            ok = true;
            updateProduct({
              enhancedImage: `data:${ev.mimeType || 'image/jpeg'};base64,${ev.image_b64}`,
              enhancedImageB64: ev.image_b64,
              isEnhanced: true,
              original_image_url: localUrl,
            });
          }
        }
      }
    } catch (err) {
      console.warn('[Capture] enhancement failed:', err.message);
    } finally {
      clearTimeout(timeoutId);
    }

    if (ok) { setPhase('idle'); nextStep(); }
    else { setPhase('failed'); }
  };

  const Picker = ({ icon: Icon, label, capture, primary }) => (
    <label
      className={`touch flex flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-3xl px-3 py-5 text-center font-bold transition active:scale-[0.97] ${
        primary
          ? 'bg-craft text-white shadow-lift'
          : 'border border-stone-200 bg-white text-stone-700 shadow-card'
      }`}
    >
      <Icon size={26} strokeWidth={2.3} />
      <span className="text-xs leading-tight">{label}</span>
      <input
        type="file"
        accept="image/*"
        {...(capture ? { capture: 'environment' } : {})}
        className="hidden"
        onChange={handleUpload}
        disabled={phase === 'working'}
      />
    </label>
  );

  return (
    <div className="space-y-5 animate-fade-in-up">
      <ScreenHeader title={t.photoTitle} subtitle={t.photoSub} step={1} totalSteps={6} />

      {/* preview / dropzone */}
      <div className="relative overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white shadow-card">
        {preview ? (
          <img src={preview} alt="" className="h-56 w-full object-cover" />
        ) : (
          <div className="flex h-56 flex-col items-center justify-center gap-3 bg-gradient-to-b from-terracotta-50/60 to-white">
            <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-terracotta shadow-card">
              <Camera size={30} strokeWidth={2.2} />
            </span>
            <p className="max-w-[15rem] text-center text-xs font-semibold leading-relaxed text-stone-500">
              {t.supportedCrafts}
            </p>
          </div>
        )}

        {phase === 'working' && (
          <div className="absolute inset-0 flex flex-col justify-end bg-charcoal/70 p-4 backdrop-blur-[2px] animate-fade-in">
            <div className="space-y-2.5 rounded-2xl bg-white/95 p-3.5 shadow-lift">
              <div className="flex items-center gap-2">
                <Sparkles size={15} className="shrink-0 text-terracotta animate-breathe" />
                <p className="flex-1 text-xs font-black text-charcoal">{t.aiWorking}</p>
                <span className="text-xs font-black tabular-nums text-terracotta">{pct}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-stone-200">
                <div
                  className="h-full rounded-full bg-craft transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-stone-500">
                {STAGE_LABELS[stage] || '…'} · {done.length}/{STAGE_ORDER.length}
              </p>
            </div>
          </div>
        )}
      </div>

      {phase === 'failed' && (
        <div className="flex gap-2.5 rounded-3xl border border-amber-200 bg-amber-50 p-3.5 animate-fade-in">
          <AlertTriangle size={17} className="mt-0.5 shrink-0 text-amber-600" />
          <div className="min-w-0">
            <p className="text-xs font-black text-amber-900">{t.enhanceFail}</p>
            <p className="mt-0.5 text-2xs leading-relaxed text-amber-800/80">{t.enhanceFailSub}</p>
          </div>
        </div>
      )}

      {phase === 'failed' ? (
        <div className="flex gap-2.5">
          <button
            onClick={() => galleryRef.current?.click()}
            className="touch flex flex-1 items-center justify-center gap-2 rounded-3xl border border-stone-200 bg-white text-xs font-bold text-stone-700 shadow-card active:scale-[0.97]"
          >
            <RotateCcw size={15} strokeWidth={2.5} /> {t.retry}
          </button>
          <button
            onClick={nextStep}
            className="touch flex flex-1 items-center justify-center gap-2 rounded-3xl bg-craft text-xs font-bold text-white shadow-lift active:scale-[0.97]"
          >
            {t.continueAnyway} <ArrowRight size={15} strokeWidth={2.5} />
          </button>
        </div>
      ) : (
        <div className="flex gap-2.5">
          <Picker icon={Camera} label={t.photoBtn} capture primary />
          <Picker icon={Images} label={t.retakePhoto} />
        </div>
      )}

      <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
    </div>
  );
}