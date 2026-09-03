import React from 'react';
import { Loader2 } from 'lucide-react';
import { useCraft } from '../context/CraftContext';

export default function LoadingOverlay() {
  const { isLoading, loadingMessage } = useCraft();
  if (!isLoading) return null;

  return (
    <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs flex flex-col items-center justify-center p-6 z-50 animate-fade-in">
      <div className="bg-white p-6 rounded-3xl shadow-2xl flex flex-col items-center text-center max-w-xs border border-stone-100 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-terracotta flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-terracotta" />
        </div>
        <p className="text-xs font-semibold text-stone-800 leading-relaxed">{loadingMessage}</p>
      </div>
    </div>
  );
}