import React, { useCallback, useEffect, useRef, useState } from 'react';

export default function AudioDropzone({ onFile, accept = '.wav,.mp3,.ogg,.flac,.m4a', label = 'Drop audio file here' }) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [recording, setRecording] = useState(false);
  const inputRef = useRef();
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const sourceRef = useRef(null);
  const processorRef = useRef(null);
  const chunksRef = useRef([]);
  const sampleRateRef = useRef(44100);

  const handleFile = useCallback((f) => {
    if (!f) return;
    setFile(f);
    onFile(f);
  }, [onFile]);

  const onDrop = useCallback(e => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const resetRecordingResources = useCallback(() => {
    processorRef.current?.disconnect();
    sourceRef.current?.disconnect();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    audioContextRef.current?.close();

    processorRef.current = null;
    sourceRef.current = null;
    streamRef.current = null;
    audioContextRef.current = null;
  }, []);

  useEffect(() => () => resetRecordingResources(), [resetRecordingResources]);

  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) {
        throw new Error('This browser does not support microphone recording.');
      }

      const audioContext = new AudioCtx();
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      chunksRef.current = [];
      sampleRateRef.current = audioContext.sampleRate;

      processor.onaudioprocess = (event) => {
        const input = event.inputBuffer.getChannelData(0);
        chunksRef.current.push(new Float32Array(input));
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      audioContextRef.current = audioContext;
      streamRef.current = stream;
      sourceRef.current = source;
      processorRef.current = processor;
      setRecording(true);
    } catch (error) {
      alert(error?.message || 'Microphone access denied.');
    }
  };

  const stopRec = () => {
    resetRecordingResources();

    if (chunksRef.current.length > 0) {
      const wavBlob = encodeWav(chunksRef.current, sampleRateRef.current);
      const recordedFile = new File([wavBlob], 'recording.wav', { type: 'audio/wav' });
      handleFile(recordedFile);
    }

    chunksRef.current = [];
    setRecording(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div
        className={`dropzone ${dragging ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? 'var(--accent)' : file ? 'var(--success)' : 'var(--border)'}`,
          borderRadius: 'var(--radius)',
          padding: '32px 24px',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragging ? 'rgba(0,229,255,0.04)' : 'var(--bg3)',
          transition: 'all 0.2s',
        }}>
        <input ref={inputRef} type="file" accept={accept} style={{ display: 'none' }}
          onChange={e => handleFile(e.target.files[0])} />
        {file ? (
          <>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🎵</div>
            <div style={{ color: 'var(--success)', fontFamily: 'var(--font-head)', fontWeight: 600 }}>{file.name}</div>
            <div style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 4 }}>
              {(file.size / 1024).toFixed(1)} KB · Click to replace
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.5 }}>◈</div>
            <div style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-head)' }}>{label}</div>
            <div style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 4 }}>WAV recommended · MP3 · OGG · FLAC · M4A</div>
          </>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>— or —</span>
        {recording ? (
          <button onClick={stopRec} style={recBtnStyle('#ff3b6b')}>
            ⏹ Stop Recording
          </button>
        ) : (
          <button onClick={startRec} style={recBtnStyle('var(--accent)')}>
            🎙 Record from Mic
          </button>
        )}
        {recording && (
          <span style={{ color: '#ff3b6b', fontSize: 12, animation: 'pulse-glow 1s infinite' }}>
            ● REC
          </span>
        )}
      </div>
    </div>
  );
}

const recBtnStyle = (color) => ({
  background: 'transparent',
  border: `1px solid ${color}`,
  color: color,
  padding: '6px 14px',
  borderRadius: 'var(--radius)',
  fontFamily: 'var(--font-mono)',
  fontSize: 12,
  cursor: 'pointer',
  transition: 'all 0.2s',
});

function encodeWav(chunks, sampleRate) {
  const samples = mergeChunks(chunks);
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i += 1) {
    const sample = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    offset += 2;
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

function mergeChunks(chunks) {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const merged = new Float32Array(totalLength);
  let offset = 0;

  chunks.forEach((chunk) => {
    merged.set(chunk, offset);
    offset += chunk.length;
  });

  return merged;
}

function writeString(view, offset, text) {
  for (let i = 0; i < text.length; i += 1) {
    view.setUint8(offset + i, text.charCodeAt(i));
  }
}
