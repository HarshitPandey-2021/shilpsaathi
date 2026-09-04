import React from 'react';
import { ChevronLeft, Globe, Check } from 'lucide-react';
import { useCraft, TRANSLATIONS } from '../context/CraftContext';

export default function Header() {
  const { currentStep, prevStep, lang, setLang, t, showLangModal, setShowLangModal } = useCraft();
  const audioCapableLang = lang === 'hi' || lang === 'en';

  return (
    <>
      <header className="px-5 py-3.5 flex items-center justify-between border-b border-stone-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-2.5">
          {currentStep > 2 && (
            <button onClick={prevStep} className="p-1 -ml-1 text-stone-600 hover:text-black" aria-label="Back">
              <ChevronLeft size={20} />
            </button>
          )}
          <div className="w-8 h-8 rounded-xl bg-terracotta flex items-center justify-center text-white font-black text-sm shadow-sm border border-amber-200">
            श
          </div>
          <div>
            <span className="font-extrabold tracking-tight text-charcoal text-base block leading-none">ShilpSaathi</span>
            <span className="text-[10px] text-stone-500 font-medium tracking-tight">शिल्पसाथी • Virtual Studio</span>
          </div>
        </div>

        <button
          onClick={() => setShowLangModal(true)}
          className="flex items-center gap-1 bg-amber-50 border border-stone-300 hover:border-terracotta px-2.5 py-1 rounded-full shadow-xs transition"
        >
          <Globe size={11} className="text-terracotta" />
          <span className="text-[11px] font-bold text-charcoal">{t.name}</span>
        </button>
      </header>

      {showLangModal && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-xs rounded-2xl p-5 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-charcoal">अपनी भाषा चुनें / Select Language</h3>
              <button onClick={() => setShowLangModal(false)} className="text-xs text-stone-400 font-bold px-1">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(TRANSLATIONS).map((key) => (
                <button
                  key={key}
                  onClick={() => { setLang(key); setShowLangModal(false); }}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition ${
                    lang === key
                      ? 'border-terracotta bg-amber-50 text-terracotta font-bold'
                      : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <span className="text-xs">{TRANSLATIONS[key].name}</span>
                  {lang === key && <Check size={14} className="text-terracotta" />}
                </button>
              ))}
            </div>
            {!audioCapableLang && (
              <p className="text-[10px] text-stone-400 text-center pt-1">
                🔈 Spoken audio guidance available in हिंदी / English for now
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}