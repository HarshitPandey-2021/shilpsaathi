import { Loader2, CheckCircle2, Circle } from 'lucide-react';
import { useCraft } from '../context/CraftContext';

const STAGE_LABELS = {
  starting: 'Image received',
  loaded: 'Image loaded',
  resizing: 'Resizing image...',
  quality: 'Analyzing image quality...',
  background: 'Removing background...',
  edges: 'Refining product edges...',
  cropping: 'Preparing product...',
  product_quality: 'Checking product quality...',
  upscaling: 'Enhancing image quality...',
  lighting: 'Improving lighting...',
  canvas: 'Creating marketplace-ready image...',
  enhancing: 'Finalizing enhanced image...',
  complete: 'Processing complete',
  stored: 'Image stored successfully',
};

const STAGE_ORDER = [
  'starting', 'loaded', 'resizing', 'quality', 'background', 'edges',
  'cropping', 'product_quality', 'upscaling', 'lighting', 'canvas',
  'enhancing', 'complete',
];

export default function LoadingOverlay() {
  const { isLoading, loadingMessage, processingStages, currentStage } = useCraft();
  const hasStages = processingStages.length > 0;
  const currentIndex = Math.max(0, STAGE_ORDER.indexOf(currentStage || processingStages.at(-1)?.stage));

  if (!isLoading && !hasStages) return null;

  return (
    <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs flex flex-col items-center justify-center p-6 z-50 animate-fade-in">
      <div className="bg-white p-6 rounded-3xl shadow-2xl flex flex-col items-center text-center max-w-xs border border-stone-100 space-y-4 w-full max-h-[80vh] overflow-y-auto">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-terracotta flex items-center justify-center">
          {hasStages && processingStages[processingStages.length - 1]?.stage === 'complete' ? (
            <CheckCircle2 className="w-6 h-6 text-forest" />
          ) : (
            <Loader2 className="w-6 h-6 animate-spin text-terracotta" />
          )}
        </div>

        {hasStages ? (
          <div className="w-full space-y-2">
            <p className="text-sm font-bold text-charcoal">Processing your image...</p>
            <div className="space-y-1.5 text-left">
              {STAGE_ORDER.slice(0, -1).map((stage, index) => {
                const isCurrent = stage === currentStage || (!currentStage && index === currentIndex);
                const isComplete = index < currentIndex;

                return (
                  <div key={stage} className={`flex items-center gap-2 text-xs transition-opacity duration-300 ${isComplete ? 'opacity-80' : isCurrent ? 'opacity-100' : 'opacity-45'}`}>
                    <span className="w-4 flex-shrink-0">
                      {isComplete ? (
                        <CheckCircle2 size={14} className="text-forest" />
                      ) : isCurrent ? (
                        <Loader2 size={14} className="animate-spin text-terracotta" />
                      ) : (
                        <Circle size={14} className="text-stone-400" />
                      )}
                    </span>
                    <span className={`${
                      isComplete ? 'text-forest font-medium' :
                      isCurrent ? 'text-charcoal font-semibold' :
                      'text-stone-400'
                    }`}>
                      {STAGE_LABELS[stage]}
                    </span>
                  </div>
                );
              })}
            </div>
            {currentStage === 'upscaling' && (
              <p className="text-[10px] text-stone-500 pt-2">
                AI is enhancing your product image. This may take a little longer for some images.
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs font-semibold text-stone-800 leading-relaxed">{loadingMessage}</p>
        )}
      </div>
    </div>
  );
}
