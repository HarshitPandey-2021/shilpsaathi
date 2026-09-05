/**
 * Pure JavaScript 16kHz 16-bit Mono WAV Audio Recorder & Encoder
 * ShilpSaathi (शिल्पसाथी)
 */

export class WavAudioRecorder {
  constructor(targetSampleRate = 16000) {
    this.targetSampleRate = targetSampleRate;
    this.audioContext = null;
    this.mediaStream = null;
    this.scriptProcessor = null;
    this.audioBuffers = [];
    this.isRecording = false;
  }

  async start() {
    this.audioBuffers = [];
    this.isRecording = true;

    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioContextClass();
    const source = this.audioContext.createMediaStreamSource(this.mediaStream);

    // 4096 sample buffer size for smooth recording
    this.scriptProcessor = this.audioContext.createScriptProcessor(4096, 1, 1);

    this.scriptProcessor.onaudioprocess = (event) => {
      if (!this.isRecording) return;
      const inputData = event.inputBuffer.getChannelData(0);
      this.audioBuffers.push(new Float32Array(inputData));
    };

    source.connect(this.scriptProcessor);
    this.scriptProcessor.connect(this.audioContext.destination);
  }

  stop() {
    this.isRecording = false;

    if (this.scriptProcessor) {
      try { this.scriptProcessor.disconnect(); } catch (e) { /* ignore */ }
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
    }

    const inputSampleRate = this.audioContext ? this.audioContext.sampleRate : 44100;
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try { this.audioContext.close(); } catch (e) { /* ignore */ }
    }

    return this.encodeWAV(this.audioBuffers, inputSampleRate, this.targetSampleRate);
  }

  encodeWAV(buffers, inputSampleRate, outputSampleRate) {
    // 1. Flatten all float chunks
    let totalLength = 0;
    for (const buf of buffers) totalLength += buf.length;

    const merged = new Float32Array(totalLength);
    let offset = 0;
    for (const buf of buffers) {
      merged.set(buf, offset);
      offset += buf.length;
    }

    // 2. Resample to target rate (16kHz for Bhashini ASR)
    const resampled = this.downsampleBuffer(merged, inputSampleRate, outputSampleRate);

    // 3. Create 16-bit PCM WAV ArrayBuffer (44 byte header + 16-bit samples)
    const wavBuffer = new ArrayBuffer(44 + resampled.length * 2);
    const view = new DataView(wavBuffer);

    // RIFF chunk descriptor
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + resampled.length * 2, true);
    this.writeString(view, 8, 'WAVE');

    // fmt sub-chunk
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
    view.setUint16(22, 1, true); // NumChannels (1 = Mono)
    view.setUint32(24, outputSampleRate, true); // SampleRate (16000)
    view.setUint32(28, outputSampleRate * 2, true); // ByteRate (SampleRate * 1 * 16 / 8)
    view.setUint16(32, 2, true); // BlockAlign (1 * 16 / 8)
    view.setUint16(34, 16, true); // BitsPerSample (16)

    // data sub-chunk
    this.writeString(view, 36, 'data');
    view.setUint32(40, resampled.length * 2, true);

    // 4. Write 16-bit PCM samples
    let sampleOffset = 44;
    for (let i = 0; i < resampled.length; i++, sampleOffset += 2) {
      let s = Math.max(-1, Math.min(1, resampled[i]));
      view.setInt16(sampleOffset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }

    return new Blob([wavBuffer], { type: 'audio/wav' });
  }

  downsampleBuffer(buffer, inputSampleRate, outputSampleRate) {
    if (outputSampleRate >= inputSampleRate) {
      return buffer;
    }
    const sampleRateRatio = inputSampleRate / outputSampleRate;
    const newLength = Math.round(buffer.length / sampleRateRatio);
    const result = new Float32Array(newLength);
    let offsetResult = 0;
    let offsetBuffer = 0;

    while (offsetResult < result.length) {
      const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
      let accum = 0;
      let count = 0;
      for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
        accum += buffer[i];
        count++;
      }
      result[offsetResult] = count > 0 ? accum / count : 0;
      offsetResult++;
      offsetBuffer = nextOffsetBuffer;
    }
    return result;
  }

  writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
}
