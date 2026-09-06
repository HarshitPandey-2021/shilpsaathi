let voicesLoaded = false;
let availableVoices = [];

// Ensure voices are actively loaded across Chromium, Safari & Firefox
function loadVoices() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    availableVoices = window.speechSynthesis.getVoices();
    if (availableVoices.length > 0) {
      voicesLoaded = true;
    }
  }
}

loadVoices();

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    loadVoices();
  };
}

export function playNativeAudio(text, langCode = 'hi-IN', onStart, onEnd) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    alert("Audio speech is not supported in this browser environment.");
    if (onEnd) onEnd();
    return;
  }

  // Force cancel any stuck/pending utterance
  window.speechSynthesis.cancel();

  // Reload voices if empty
  if (availableVoices.length === 0) {
    availableVoices = window.speechSynthesis.getVoices();
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.85; // Slightly slower, deliberate pace for artisans
  utterance.pitch = 1.0;

  // 1. Try finding regional match (e.g. 'ta', 'te', 'bn', 'hi')
  const basePrefix = langCode.slice(0, 2).toLowerCase();
  let matchedVoice = availableVoices.find(v => 
    v.lang.toLowerCase() === langCode.toLowerCase() || 
    v.lang.toLowerCase().startsWith(basePrefix)
  );

  // 2. Reliable Fallback: Indian English or Hindi if OS lacks regional packs
  if (!matchedVoice) {
    matchedVoice = availableVoices.find(v => 
      v.lang.toLowerCase().includes('in') || 
      v.lang.toLowerCase().includes('hi')
    ) || availableVoices[0];
  }

  if (matchedVoice) {
    utterance.voice = matchedVoice;
    utterance.lang = matchedVoice.lang;
  }

  utterance.onstart = () => {
    if (onStart) onStart();
  };

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  utterance.onerror = (e) => {
    console.warn("Speech playback error/cancelled:", e);
    if (onEnd) onEnd();
  };

  // Immediate dispatch with small tick to circumvent Chromium engine pause bug
  setTimeout(() => {
    window.speechSynthesis.speak(utterance);
  }, 60);
}