import React, { useState } from 'react';
import { Volume2, ArrowRight, Camera, Mic, IndianRupee, Check } from 'lucide-react';
import { useCraft, TRANSLATIONS } from '../context/CraftContext';
import { playNativeAudio } from '../utils/speech';
import IndiaFlag from '../components/ui/IndiaFlag';

const FEATURES = [
  { icon: Camera,      tone: 'bg-terracotta-50 text-terracotta',   k: 'f1' },
  { icon: Mic,         tone: 'bg-mustard-50 text-mustard-500',     k: 'f2' },
  { icon: IndianRupee, tone: 'bg-forest-50 text-forest',           k: 'f3' },
];

export default function OnboardingScreen() {
  const { goToStep, lang, setLang, t, getArtisanId, resolveArtisan, confirmedPhone } = useCraft();
  const [isPlaying, setIsPlaying] = useState(false);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const audioCapableLang = t.code === 'hi-IN' || t.code === 'en-IN';

  const handleSpeech = async () => {
    if (!audioCapableLang) return;
    setIsPlaying(true);
    await playNativeAudio(t.speechText, t.code, () => setIsPlaying(true), () => setIsPlaying(false));
  };

  const handleStart = async () => {
    setError('');
    if (!confirmedPhone) {
      if (phone.length !== 10) {
        setError('Please enter a valid 10-digit mobile number');
        return;
      }
      const id = await resolveArtisan(phone);
      if (!id) {
        setError('Could not verify mobile number. Please try again.');
        return;
      }
    }
    goToStep(2);
  };

  return (
    <div className="-m-5 flex min-h-full flex-col animate-fade-in">

      <div className="relative overflow-hidden bg-craft px-6 pb-12 pt-8 text-white">
        <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-mustard-400/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 top-28 h-44 w-44 rounded-full bg-terracotta-300/20 blur-3xl" />

               <div className="relative mx-auto flex w-fit items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
          <IndiaFlag size={20} />
          <span className="text-[11px] font-bold leading-tight text-white/90">
            {t.govInit}
          </span>
        </div>

        <div className="relative mt-6 flex flex-col items-center text-center">
          <img
            src="/SIH.png"
            alt=""
            className="h-[68px] w-[68px] rounded-[1.6rem] border-2 border-white/25 bg-white/10 object-contain p-2 shadow-lift"
          />
          <h1 className="mt-4 font-display text-[2.6rem] font-black leading-none tracking-tight">
            ShilpSaathi
          </h1>
          <p className="mt-2 text-2xs font-bold uppercase tracking-[0.22em] text-mustard-200">
            {t.tagline}
          </p>
          <p className="mt-3.5 max-w-[17rem] text-sm leading-relaxed text-white/80">{t.desc}</p>

          <button
            onClick={handleSpeech}
            disabled={!audioCapableLang}
            className={`chip touch mt-5 px-4 ${
              !audioCapableLang
                ? 'cursor-not-allowed border-white/15 bg-white/10 text-white/40'
                : isPlaying
                  ? 'animate-breathe border-mustard-300 bg-mustard-400 text-charcoal'
                  : 'border-white/25 bg-white/15 text-white hover:bg-white/25'
            }`}
          >
            <Volume2 size={15} strokeWidth={2.6} />
            {!audioCapableLang ? 'Audio N/A' : isPlaying ? t.speaking : t.listen}
          </button>
        </div>

        <svg className="absolute -bottom-px left-0 w-full text-ivory" viewBox="0 0 400 30" preserveAspectRatio="none" aria-hidden>
          <path d="M0 30V13c45 10 85 10 125 2s78-9 118-1 82 11 157 3v13z" fill="currentColor" />
        </svg>
      </div>

      <div className="flex flex-1 flex-col gap-5 px-5 pb-7 pt-5">

        <div className="grid grid-cols-3 gap-2.5">
          {FEATURES.map(({ icon: Icon, tone, k }) => (
            <div key={k} className="rounded-3xl border border-stone-200/90 bg-white p-3 text-center shadow-card">
              <span className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-2xl ${tone}`}>
                <Icon size={19} strokeWidth={2.3} />
              </span>
              <p className="text-2xs font-bold leading-tight text-charcoal">{t[k]}</p>
            </div>
          ))}
        </div>

        <div className="motif-rule motif-fade opacity-60" />

        <div className="space-y-2.5">
          <div>
                       <p className="text-sm font-black text-charcoal">{t.chooseLang}</p>
            <p className="text-2xs text-stone-500">{t.chooseLangSub}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(TRANSLATIONS).map((key) => (
              <button
                key={key}
                onClick={() => setLang(key)}
                className={`touch flex items-center justify-between rounded-2xl border px-4 text-left transition active:scale-[0.97] ${
                  lang === key
                    ? 'border-terracotta bg-terracotta-50 font-black text-terracotta shadow-glow'
                    : 'border-stone-200 bg-white font-semibold text-stone-700'
                }`}
              >
                <span className="text-sm">{TRANSLATIONS[key].name}</span>
                {lang === key && <Check size={15} strokeWidth={3} className="shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        {!confirmedPhone && (
          <div className="mt-4 space-y-2 animate-fade-in">
            <p className="text-center text-xs font-bold text-charcoal">Enter Mobile Number to Continue</p>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="10 digit mobile number"
              className="field-input w-full text-center font-black tracking-widest py-3"
            />
            {error && <p className="text-center text-xs font-bold text-red-500">{error}</p>}
          </div>
        )}

        <button
          onClick={handleStart}
          className="touch mt-auto flex w-full items-center justify-center gap-2 rounded-3xl bg-craft px-5 py-4 text-sm font-bold text-white shadow-lift transition active:scale-[0.98] hover:brightness-110"
        >
          {t.startBtn}
          <ArrowRight size={18} strokeWidth={2.6} />
        </button>

        <p className="text-center text-[10px] leading-relaxed text-stone-400">
                    {t.noAccount}
        </p>
      </div>
    </div>
  );
}