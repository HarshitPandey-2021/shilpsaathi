import React, { useState, useRef, useCallback } from 'react';
import { Sparkles, ArrowRight, Check, Info, MoveHorizontal } from 'lucide-react';
import { useCraft } from '../context/CraftContext';
import ScreenHeader from '../components/ui/ScreenHeader';
import PrimaryButton from '../components/ui/PrimaryButton';

export default function ImageStudioScreen() {
  const { productData, nextStep, t } = useCraft();
  const [split, setSplit] = useState(55);
  const boxRef = useRef(null);
  const dragging = useRef(false);

  const enhanced = Boolean(productData.isEnhanced && productData.enhancedImage);

  const move = useCallback((clientX) => {
    const box = boxRef.current;
    if (!box) return;
    const { left, width } = box.getBoundingClientRect();
    setSplit(Math.max(0, Math.min(100, ((clientX - left) / width) * 100)));
  }, []);

  const onDown = (e) => { dragging.current = true; move(e.clientX); };
  const onMove = (e) => { if (dragging.current) move(e.clientX); };
  const onUp = () => { dragging.current = false; };

  return (
    <div className="space-y-5 animate-fade-in-up">
      <ScreenHeader title={t.f1} subtitle={t.f1_sub} icon={Sparkles} step={2} totalSteps={6} />

      {enhanced ? (
        <>
          <div
            ref={boxRef}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerLeave={onUp}
            className="relative h-72 w-full cursor-ew-resize touch-none select-none overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white shadow-card"
          >
            <img
              src={productData.enhancedImage}
              alt=""
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 overflow-hidden" style={{ width: `${split}%` }}>
              <img
                src={productData.originalImage}
                alt=""
                draggable={false}
                style={{ width: boxRef.current?.offsetWidth || '100%' }}
                className="h-full max-w-none object-cover"
              />
            </div>

            <div
              className="absolute inset-y-0 z-10 w-0.5 bg-white shadow-[0_0_0_1px_rgba(41,37,36,.15)]"
              style={{ left: `${split}%` }}
            >
              <span className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-terracotta shadow-lift">
                <MoveHorizontal size={19} strokeWidth={2.6} />
              </span>
            </div>

            <span className="absolute left-3 top-3 rounded-full bg-charcoal/70 px-2.5 py-1 text-[10px] font-black text-white backdrop-blur-sm">
              {t.before}
            </span>
            <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-forest px-2.5 py-1 text-[10px] font-black text-white">
              <Check size={11} strokeWidth={3.5} /> {t.after}
            </span>
          </div>

          <p className="flex items-center justify-center gap-1.5 text-2xs font-semibold text-stone-400">
            <MoveHorizontal size={13} /> {t.dragCompare}
          </p>

          <div className="flex gap-2.5 rounded-3xl border border-forest-200 bg-forest-50 p-3.5">
            <Check size={17} className="mt-0.5 shrink-0 text-forest" strokeWidth={3} />
            <div className="min-w-0">
              <p className="text-xs font-black text-forest-600">{t.studioCleaned}</p>
              <p className="mt-0.5 text-2xs leading-relaxed text-forest-600/80">{t.photoSub}</p>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white shadow-card">
            <img
              src={productData.originalImage}
              alt=""
              className="h-72 w-full object-cover"
            />
          </div>
          <div className="flex gap-2.5 rounded-3xl border border-amber-200 bg-amber-50 p-3.5">
            <Info size={17} className="mt-0.5 shrink-0 text-amber-600" />
            <div className="min-w-0">
              <p className="text-xs font-black text-amber-900">{t.enhanceFail}</p>
              <p className="mt-0.5 text-2xs leading-relaxed text-amber-800/80">{t.enhanceFailSub}</p>
            </div>
          </div>
        </>
      )}

      <PrimaryButton onClick={nextStep} iconRight={ArrowRight}>{t.continueVoice}</PrimaryButton>
    </div>
  );
}