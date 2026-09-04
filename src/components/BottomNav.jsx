import React from 'react';
import { Home, Package, PlusCircle, Globe } from 'lucide-react';
import { useCraft } from '../context/CraftContext';

export default function BottomNav() {
  const { currentStep, goToStep, productData, setShowLangModal, t } = useCraft();
  const catalogUnlocked = !!productData.originalImage;

  return (
    <nav className="absolute bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-stone-200 flex items-center justify-around text-stone-400 z-10">
      <button onClick={() => goToStep(2)} className={`flex flex-col items-center ${currentStep === 2 ? 'text-terracotta font-bold' : ''}`}>
        <Home size={20} /><span className="text-[10px] mt-0.5">{t.navStudio}</span>
      </button>
      <button
        onClick={() => catalogUnlocked && goToStep(6)}
        className={`flex flex-col items-center ${catalogUnlocked ? '' : 'opacity-30 pointer-events-none'}`}
      >
        <Package size={20} /><span className="text-[10px] mt-0.5">{t.navCatalog}</span>
      </button>
      <button onClick={() => goToStep(3)} className={`flex flex-col items-center ${currentStep === 3 ? 'text-terracotta font-bold' : ''}`}>
        <PlusCircle size={20} /><span className="text-[10px] mt-0.5">{t.navAdd}</span>
      </button>
      <button onClick={() => setShowLangModal(true)} className="flex flex-col items-center">
        <Globe size={20} /><span className="text-[10px] mt-0.5">{t.navProfile}</span>
      </button>
    </nav>
  );
}