import React from 'react';
import { Home, Package, PlusCircle, User } from 'lucide-react';
import { useCraft } from '../context/CraftContext';

export default function BottomNav() {
  const { currentStep, goToStep } = useCraft();

  return (
    <nav className="absolute bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-stone-200 flex items-center justify-around text-stone-400 z-10">
      <button onClick={() => goToStep(2)} className={`flex flex-col items-center ${currentStep === 2 ? 'text-terracotta font-bold' : ''}`}>
        <Home size={20} /><span className="text-[10px] mt-0.5">Studio</span>
      </button>
      <button onClick={() => goToStep(8)} className="flex flex-col items-center">
        <Package size={20} /><span className="text-[10px] mt-0.5">Catalog</span>
      </button>
      <button onClick={() => goToStep(3)} className={`flex flex-col items-center ${currentStep === 3 ? 'text-terracotta font-bold' : ''}`}>
        <PlusCircle size={20} /><span className="text-[10px] mt-0.5">Add</span>
      </button>
      <button onClick={() => goToStep(1)} className="flex flex-col items-center">
        <User size={20} /><span className="text-[10px] mt-0.5">Profile</span>
      </button>
    </nav>
  );
}