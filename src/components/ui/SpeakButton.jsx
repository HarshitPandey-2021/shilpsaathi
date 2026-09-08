import React, { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { useCraft } from '../../context/CraftContext';
import { playNativeAudio } from '../../utils/speech';

export default function SpeakButton({ text, className = '' }) {
  const { t } = useCraft();
  const [playing, setPlaying] = useState(false);
  if (!text) return null;

  return (
    <button
      onClick={() => { setPlaying(true); playNativeAudio(text, t.code, () => setPlaying(true), () => setPlaying(false)); }}
      aria-label={t.listen}
      className={`tap flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border transition ${
        playing
          ? 'animate-breathe border-mustard-300 bg-mustard-400 text-charcoal'
          : 'border-mustard-200 bg-mustard-50 text-terracotta'
      } ${className}`}
    >
      <Volume2 size={16} strokeWidth={2.5} />
    </button>
  );
}