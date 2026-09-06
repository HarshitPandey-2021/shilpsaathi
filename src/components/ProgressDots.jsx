import React from 'react';
import { useCraft } from '../context/CraftContext';

const FLOW_STEPS = [2, 3, 4, 5, 6, 7, 8, 9];

export default function ProgressDots() {
  const { currentStep } = useCraft();
  if (currentStep < 2) return null;
  const activeIndex = FLOW_STEPS.indexOf(currentStep);
  return (
    <div className="flex items-center justify-center gap-1.5 py-2 bg-ivory">
      {FLOW_STEPS.map((step, i) => (
        <div key={step} className={`h-1.5 rounded-full transition-all ${
          i === activeIndex ? 'w-5 bg-terracotta' : i < activeIndex ? 'w-1.5 bg-terracotta/50' : 'w-1.5 bg-stone-200'
        }`} />
      ))}
    </div>
  );
}