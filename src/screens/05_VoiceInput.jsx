import React, { useRef, useState } from 'react';
import { Mic, Square, Play, RotateCcw, ArrowRight } from 'lucide-react';
import { useCraft } from '../context/CraftContext';

export default function VoiceInputScreen() {
  const { nextStep, setIsLoading, setLoadingMessage, t } = useCraft();
  const [status, setStatus] = useState('idle'); // idle | recording | recorded | error
  const [audioURL, setAudioURL] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioURL(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
        setStatus('recorded');
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setStatus('recording');
    } catch (err) {
      console.error('Mic permission denied or unavailable:', err);
      setStatus('error');
    }
  };

  const stopRecording = () => mediaRecorderRef.current?.stop();
  const retake = () => { setAudioURL(null); setStatus('idle'); };

  const submitVoice = () => {
    setLoadingMessage("BHASHINI: Transcribing audio to structured catalog...");
    setIsLoading(true);
    // TODO: POST the blob at audioURL to /api/process-voice here
    setTimeout(() => { setIsLoading(false); nextStep(); }, 1400);
  };

  return (
    <div className="text-center space-y-6">
      <div>
        <h2 className="text-2xl font-black text-charcoal">{t.voiceTitle}</h2>
        <p className="text-xs text-stone-600 mt-1">{t.voiceSub}</p>
      </div>

      <div className="my-6 flex flex-col items-center gap-3">
        {status !== 'recorded' && (
          <button
            onClick={status === 'recording' ? stopRecording : startRecording}
            aria-label={status === 'recording' ? 'Stop recording' : 'Start recording'}
            className={`w-32 h-32 rounded-full border-4 mx-auto flex flex-col items-center justify-center transition shadow-xl active:scale-95 ${
              status === 'recording'
                ? 'border-red-600 bg-red-50 text-red-600 animate-pulse'
                : 'border-terracotta bg-terracotta/10 text-terracotta hover:scale-105'
            }`}
          >
            {status === 'recording' ? <Square size={40} /> : <Mic size={44} />}
            <span className="text-[11px] font-bold mt-1 uppercase tracking-wider">
              {status === 'recording' ? 'सुन रहा है...' : t.tapSpeak}
            </span>
          </button>
        )}

        {status === 'error' && (
          <p className="text-[11px] text-red-600 font-semibold">
            माइक्रोफ़ोन की अनुमति नहीं मिली। कृपया ब्राउज़र सेटिंग जांचें।
          </p>
        )}

        {status === 'recorded' && (
          <div className="flex items-center gap-3">
            <button onClick={() => new Audio(audioURL).play()} className="w-14 h-14 rounded-full bg-forest text-white flex items-center justify-center shadow-md active:scale-95">
              <Play size={22} />
            </button>
            <button onClick={retake} className="w-14 h-14 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center shadow-md active:scale-95">
              <RotateCcw size={20} />
            </button>
          </div>
        )}
      </div>

      <div className="bg-white p-4 rounded-2xl border border-stone-200 text-left text-xs space-y-1 text-stone-600 shadow-sm">
        <span className="font-bold text-stone-800 block">Prompt:</span>
        <p className="italic">{t.voiceExample}</p>
      </div>

      {status === 'recorded' && (
        <button onClick={submitVoice} className="w-full py-4 bg-terracotta text-white rounded-2xl font-bold flex justify-center items-center gap-2 shadow-md hover:bg-[#8e3e29]">
          कैटलॉग बनाएं <ArrowRight size={18} />
        </button>
      )}
    </div>
  );
}