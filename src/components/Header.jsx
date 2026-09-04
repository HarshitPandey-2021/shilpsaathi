import React, { useState, useEffect } from 'react';
import { ChevronLeft, Globe, Check, Download, Smartphone, X } from 'lucide-react';
import { useCraft, TRANSLATIONS } from '../context/CraftContext';

export default function Header() {
  const { currentStep, prevStep, lang, setLang, t, showLangModal, setShowLangModal } = useCraft();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const audioCapableLang = lang === 'hi' || lang === 'en';

  useEffect(() => {
    // Check if app is running standalone
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstalled(true);
    }

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setShowInstallModal(true);
    }
  };

  return (
    <>
      <header className="px-4 py-3 flex items-center justify-between border-b border-stone-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-2">
          {currentStep > 2 && (
            <button onClick={prevStep} className="p-1 -ml-1 text-stone-600 hover:text-black" aria-label="Back">
              <ChevronLeft size={20} />
            </button>
          )}
          <div className="w-8 h-8 rounded-xl bg-terracotta flex items-center justify-center text-white font-black text-sm shadow-sm border border-amber-200">
            श
          </div>
          <div>
            <span className="font-extrabold tracking-tight text-charcoal text-sm sm:text-base block leading-none">ShilpSaathi</span>
            <span className="text-[10px] text-stone-500 font-medium tracking-tight">शिल्पसाथी • Virtual Studio</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {!isInstalled && (
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1 bg-forest/10 hover:bg-forest/20 text-forest border border-forest/30 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-xs transition active:scale-95"
              title="Install ShilpSaathi App"
            >
              <Download size={11} />
              <span>ऐप डाउनलोड</span>
            </button>
          )}

          <button
            onClick={() => setShowLangModal(true)}
            className="flex items-center gap-1 bg-amber-50 border border-stone-300 hover:border-terracotta px-2.5 py-1 rounded-full shadow-xs transition"
          >
            <Globe size={11} className="text-terracotta" />
            <span className="text-[11px] font-bold text-charcoal">{t.name}</span>
          </button>
        </div>
      </header>

      {/* Language Modal */}
      {showLangModal && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
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

      {/* PWA Install Instructions Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-stone-200 space-y-3.5 text-left">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 rounded-xl text-terracotta">
                  <Smartphone size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-charcoal">ऐप डाउनलोड करें (Install PWA)</h3>
                  <p className="text-[10px] text-stone-500">बिना प्ले स्टोर के सीधे फोन में चलाएं</p>
                </div>
              </div>
              <button onClick={() => setShowInstallModal(false)} className="p-1 rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-stone-700 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
              <div className="flex items-start gap-2">
                <span className="font-bold text-terracotta bg-white px-1.5 py-0.5 rounded-md border border-stone-200 shadow-xs">Android:</span>
                <p>Chrome में ऊपर दाएं <b>⋮ (3 डॉट्स)</b> दबाएं $\rightarrow$ <b>"Install app"</b> या <b>"Add to Home screen"</b> चुनें।</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-forest bg-white px-1.5 py-0.5 rounded-md border border-stone-200 shadow-xs">iPhone:</span>
                <p>Safari में नीचे <b>Share (शेयर)</b> आइकन दबाएं $\rightarrow$ <b>"Add to Home Screen"</b> चुनें।</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-amber-800 bg-white px-1.5 py-0.5 rounded-md border border-stone-200 shadow-xs">Laptop:</span>
                <p>URL बार के दाएं कोने में <b>🖥️ Install ShilpSaathi</b> आइकन पर क्लिक करें।</p>
              </div>
            </div>

            <button
              onClick={() => setShowInstallModal(false)}
              className="w-full py-3 bg-terracotta text-white rounded-xl font-bold text-xs shadow-md active:scale-95 transition"
            >
              समझ गया / Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}