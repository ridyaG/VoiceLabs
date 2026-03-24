import React, { useState } from 'react';
import AudioDropzone from '../components/AudioDropzone';
import { getApiErrorMessage, recognizeSpeech } from '../api';
import PageHeader from '../components/PageHeader';

export default function RecognizePage() {
  const [file, setFile]       = useState(null);
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const { data } = await recognizeSpeech(file);
      setResult(data);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Recognition failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const wordCount = result?.transcript?.trim().split(/\s+/).filter(Boolean).length || 0;

  return (
    <div>
      <PageHeader
        tag="681" icon="◈" accent="#00e5ff"
        title="Speech Recognition"
        subtitle="Upload or record audio to transcribe it into text using Google Speech-to-Text."
      />

      <div style={cardStyle}>
        <SectionLabel>Audio Input</SectionLabel>
        <AudioDropzone onFile={setFile} label="Drop your audio file to transcribe" />

        <button onClick={handleSubmit} disabled={!file || loading} style={submitBtn('#00e5ff', !file || loading)}>
          {loading ? <><Spinner /> Transcribing…</> : '◈ Transcribe Audio'}
        </button>
      </div>

      {error && <ErrorBox msg={error} />}

      {result && (
        <div style={cardStyle}>
          <SectionLabel>Transcript</SectionLabel>
          <div style={{
            background: 'var(--bg)', border: '1px solid var(--border)',
            borderRadius: 8, padding: 24, fontSize: 16,
            lineHeight: 1.8, color: 'var(--text)',
            fontFamily: 'var(--font-head)', letterSpacing: '0.2px',
            minHeight: 80
          }}>
            {result.transcript}
          </div>

          <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
            <StatPill label="Words" value={wordCount} color="#00e5ff" />
            <StatPill label="Characters" value={result.transcript.length} color="#00e5ff" />
            <StatPill label="Confidence" value={result.confidence} color="#00e676" />
          </div>

          <button onClick={() => navigator.clipboard.writeText(result.transcript)}
            style={{ marginTop: 16, background: 'transparent', border: '1px solid var(--border)',
              color: 'var(--text-dim)', padding: '6px 14px', borderRadius: 6,
              fontFamily: 'var(--font-mono)', fontSize: 12, cursor: 'pointer' }}>
            ⧉ Copy to clipboard
          </button>
        </div>
      )}
    </div>
  );
}

// ── Shared utility components (imported by other pages) ───────────────────────

export function SectionLabel({ children }) {
  return (
    <div style={{
      fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 2,
      color: 'var(--text-dim)', marginBottom: 14,
      textTransform: 'uppercase', borderBottom: '1px solid var(--border)',
      paddingBottom: 8
    }}>{children}</div>
  );
}

export function StatPill({ label, value, color }) {
  return (
    <div style={{
      background: 'var(--bg3)', border: `1px solid ${color}30`,
      borderRadius: 6, padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: 2
    }}>
      <span style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', letterSpacing: 1 }}>{label}</span>
      <span style={{ fontSize: 18, color, fontFamily: 'var(--font-head)', fontWeight: 700 }}>{value}</span>
    </div>
  );
}

export function ErrorBox({ msg }) {
  return (
    <div style={{
      background: 'rgba(255,59,107,0.08)', border: '1px solid rgba(255,59,107,0.3)',
      borderRadius: 8, padding: '14px 18px', color: '#ff3b6b',
      fontFamily: 'var(--font-mono)', fontSize: 13, marginBottom: 20
    }}>
      ⚠ {msg}
    </div>
  );
}

export function Spinner() {
  return <span style={{
    display: 'inline-block', width: 14, height: 14,
    border: '2px solid rgba(255,255,255,0.2)',
    borderTopColor: 'white', borderRadius: '50%',
    animation: 'spin 0.7s linear infinite', marginRight: 8
  }} />;
}

export const cardStyle = {
  background: 'var(--bg2)', border: '1px solid var(--border)',
  borderRadius: 12, padding: '28px 26px', marginBottom: 20
};

export const submitBtn = (color, disabled) => ({
  marginTop: 20, padding: '12px 28px',
  background: disabled ? 'var(--bg3)' : `${color}18`,
  border: `1px solid ${disabled ? 'var(--border)' : color}`,
  color: disabled ? 'var(--text-dim)' : color,
  borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: 14,
  cursor: disabled ? 'not-allowed' : 'pointer',
  transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8,
  letterSpacing: 1
});

// Inject spinner keyframe once
if (!document.getElementById('voicelab-spin-style')) {
  const styleEl = document.createElement('style');
  styleEl.id = 'voicelab-spin-style';
  styleEl.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
  document.head.appendChild(styleEl);
}
