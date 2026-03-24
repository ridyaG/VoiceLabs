import React, { useState } from 'react';
import AudioDropzone from '../components/AudioDropzone';
import PageHeader from '../components/PageHeader';
import { detectEmotion } from '../api';
import { cardStyle, submitBtn, SectionLabel, ErrorBox, Spinner } from './RecognizePage';

export default function EmotionPage() {
  const [file, setFile]       = useState(null);
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const accent = '#ff3b6b';

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const { data } = await detectEmotion(file);
      setResult(data);
    } catch (e) {
      setError(e.response?.data?.detail || 'Emotion detection failed.');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <PageHeader tag="684" icon="◇" accent={accent}
        title="Emotion Detection"
        subtitle="Analyse the emotional tone of speech — detecting happiness, sadness, anger, fear, and more." />

      <div style={cardStyle}>
        <SectionLabel>Audio Input</SectionLabel>
        <AudioDropzone onFile={setFile} label="Drop audio to detect emotion" />
        <button onClick={handleSubmit} disabled={!file || loading}
          style={submitBtn(accent, !file || loading)}>
          {loading ? <><Spinner />Analysing…</> : '◇ Detect Emotion'}
        </button>
        {error && <ErrorBox msg={error} />}
      </div>

      {result && (
        <>
          {/* Primary result */}
          <div style={{
            ...cardStyle,
            border: `1px solid ${result.color}40`,
            boxShadow: `0 0 32px ${result.color}18`,
            textAlign: 'center', padding: '36px 26px'
          }}>
            <div style={{ fontSize: 72, marginBottom: 12 }}>{result.emoji}</div>
            <h2 style={{
              fontFamily: 'var(--font-head)', fontSize: 36, fontWeight: 800,
              color: result.color, textTransform: 'capitalize', marginBottom: 8
            }}>
              {result.predicted_emotion}
            </h2>
            <p style={{ color: 'var(--text-dim)', fontSize: 14, marginBottom: 16 }}>{result.description}</p>
            <div style={{
              display: 'inline-block',
              background: `${result.color}15`, border: `1px solid ${result.color}30`,
              borderRadius: 20, padding: '6px 20px',
              fontFamily: 'var(--font-mono)', fontSize: 14, color: result.color
            }}>
              {result.confidence_pct}% confidence
            </div>
          </div>

          {/* All emotions bar chart */}
          <div style={cardStyle}>
            <SectionLabel>Emotion Probability Breakdown</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {result.all_emotions?.map((e, i) => (
                <div key={e.emotion} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 24, fontSize: 16 }}>{e.emoji}</span>
                  <span style={{
                    width: 80, fontFamily: 'var(--font-head)', fontWeight: 600,
                    fontSize: 13, textTransform: 'capitalize',
                    color: i === 0 ? e.color : 'var(--text)'
                  }}>{e.emotion}</span>
                  <div style={{ flex: 1, background: 'var(--bg3)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                    <div style={{
                      width: `${e.probability}%`, height: '100%',
                      background: i === 0 ? e.color : 'var(--border)',
                      borderRadius: 4,
                      transition: `width ${0.4 + i * 0.08}s ease`
                    }} />
                  </div>
                  <span style={{
                    width: 48, textAlign: 'right',
                    fontFamily: 'var(--font-mono)', fontSize: 12,
                    color: i === 0 ? e.color : 'var(--text-dim)'
                  }}>{e.probability}%</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
