import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useCraft } from '../context/CraftContext';

export default function Header() {
  const { currentStep, prevStep } = useCraft();

  return (
    <header className="px-5 py-3.5 flex items-center justify-between border-b border-stone-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-20">
      <div className="flex items-center gap-2.5">
        {currentStep > 2 && (
          <button onClick={prevStep} className="p-1 -ml-1 text-stone-600 hover:text-black">
            <ChevronLeft size={20} />
          </button>
        )}
        <div className="w-8 h-8 rounded-xl bg-terracotta flex items-center justify-center text-white font-black text-sm shadow-sm">
          श
        </div>
        <div>
          <span className="font-extrabold tracking-tight text-charcoal text-base block leading-none">ShilpSaathi</span>
          <span className="text-[10px] text-stone-500 font-medium tracking-tight">शिल्पसाथी • Virtual Studio</span>
        </div>
      </div>
      <span className="text-[10px] font-bold tracking-wider bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full uppercase">
        Ministry MVP
      </span>
    </header>
  );
}