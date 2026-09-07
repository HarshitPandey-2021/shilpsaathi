// components/BottomNav.jsx — complete replacement
import React from 'react';
import { Home, Package, PlusCircle } from 'lucide-react';
import { useCraft } from '../context/CraftContext';

export default function BottomNav() {
  const { currentStep, goToStep, t } = useCraft();

  return (
    <nav className="absolute bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-stone-200 flex items-center justify-around text-stone-400 z-10">
      <button onClick={() => goToStep(2)} className={`flex flex-col items-center gap-0.5 ${currentStep === 2 ? 'text-terracotta font-bold' : ''}`}>
        <Home size={20} /><span className="text-[10px]">होम / Home</span>
      </button>
      <button onClick={() => goToStep(10)} className={`flex flex-col items-center gap-0.5 ${currentStep === 10 ? 'text-terracotta font-bold' : ''}`}>
        <Package size={20} /><span className="text-[10px]">सूची / Listings</span>
      </button>
      <button onClick={() => goToStep(3)} className={`flex flex-col items-center gap-0.5 ${currentStep === 3 ? 'text-terracotta font-bold' : ''}`}>
        <PlusCircle size={20} /><span className="text-[10px]">नया / New</span>
      </button>
    </nav>
  );
}