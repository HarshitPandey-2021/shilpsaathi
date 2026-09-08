import React from 'react';
import { ChevronLeft, Globe, Check, X, User } from 'lucide-react';
import { useCraft, TRANSLATIONS } from '../context/CraftContext';

const WIZARD_KEYS = { 3: 'wPhoto', 4: 'wStudio', 5: 'wVoice', 6: 'wDetails', 7: 'wPrice', 8: 'wPublish' };
export default function Header({ isWizard = false }) {
  const { currentStep, prevStep, goToStep, lang, setLang, t, showLangModal, setShowLangModal } = useCraft();

  return (
    <>
      <header className="relative z-20 flex h-14 shrink-0 items-center gap-2.5 border-b border-stone-200/70 bg-white/85 px-4 backdrop-blur-md">
        {isWizard ? (
          <>
                        <button onClick={prevStep} aria-label={t.back}
              className="tap -ml-1.5 flex h-9 w-9 items-center justify-center rounded-2xl bg-stone-100 text-stone-600">
              <ChevronLeft size={19} strokeWidth={2.5} />
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black leading-tight text-charcoal">
                {t[WIZARD_KEYS[currentStep]]}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">{t.addBtn}</p>
            </div>
            <button onClick={() => goToStep(2)} aria-label={t.close}
              className="tap flex h-9 w-9 items-center justify-center rounded-2xl bg-stone-100 text-stone-500">
              <X size={17} strokeWidth={2.5} />
            </button>
          </>
        ) : (
          <>
            <img
              src="/SIH.png"
              alt=""
              className="h-9 w-9 shrink-0 rounded-2xl border border-mustard-200 object-contain shadow-xs"
            />
            <div className="min-w-0 flex-1">
              <p className="font-display text-base font-black leading-none tracking-tight text-royal">
                ShilpSaathi
              </p>
                            <p className="mt-0.5 text-[10px] font-medium text-stone-500">शिल्पसाथी · {t.appSub}</p>
            </div>
                       <div className="flex shrink-0 items-center gap-1.5">
              <button
                onClick={() => setShowLangModal(true)}
                className="chip touch border-mustard-200 bg-mustard-50 px-3 text-terracotta-600"
              >
                <Globe size={13} strokeWidth={2.6} />
                {t.name}
              </button>
              <button
                onClick={() => goToStep(11)}
                aria-label={t.navProfile}
                className={`tap flex h-9 w-9 items-center justify-center rounded-2xl border transition ${
                  currentStep === 11
                    ? 'border-terracotta bg-terracotta text-white'
                    : 'border-stone-200 bg-white text-stone-500'
                }`}
              >
                <User size={16} strokeWidth={2.5} />
              </button>
            </div>
          </>
        )}
      </header>

      {showLangModal && (
        <div
          className="absolute inset-0 z-50 flex items-end justify-center bg-stone-900/50 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowLangModal(false)}
        >
          <div
            className="w-full space-y-4 rounded-t-[2rem] bg-white p-5 pb-8 shadow-2xl animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="mx-auto block h-1 w-10 rounded-full bg-stone-300" />
                       <div>
              <h3 className="font-display text-lg font-black text-charcoal">{t.chooseLang}</h3>
              <p className="text-2xs text-stone-500">{t.chooseLangSub}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(TRANSLATIONS).map((key) => (
                <button
                  key={key}
                  onClick={() => { setLang(key); setShowLangModal(false); }}
                  className={`touch flex items-center justify-between rounded-2xl border px-4 text-left transition active:scale-[0.97] ${
                    lang === key
                      ? 'border-terracotta bg-terracotta-50 font-black text-terracotta'
                      : 'border-stone-200 bg-white font-semibold text-stone-700'
                  }`}
                >
                  <span className="text-sm">{TRANSLATIONS[key].name}</span>
                  {lang === key && <Check size={15} strokeWidth={3} />}
                </button>
                          ))}
            </div>

            <button
              onClick={() => { setShowLangModal(false); goToStep(1); }}
              className="w-full pt-1 text-center text-2xs font-bold text-terracotta underline underline-offset-2"
            >
              {t.viewWelcome}
            </button>
          </div>
        </div>
      )}
    </>
  );
}