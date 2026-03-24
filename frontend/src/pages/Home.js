import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { healthCheck } from '../api';

const MODULES = [
  {
    path: '/recognize',
    tag: '681',
    icon: '◈',
    title: 'Speech Recognition',
    desc: 'Transcribe any audio file or live mic recording into text using Google Speech API.',
    accent: '#00e5ff',
    features: ['Live mic recording', 'File upload', 'Google STT engine'],
  },
  {
    path: '/speaker-id',
    tag: '682',
    icon: '◉',
    title: 'Speaker Identification',
    desc: 'Enroll voice profiles and identify unknown speakers from audio using MFCC + cosine similarity.',
    accent: '#7c3aed',
    features: ['Multi-speaker enroll', 'Ranked confidence scores', 'Persistent session store'],
  },
  {
    path: '/verify',
    tag: '683',
    icon: '◎',
    title: 'Speaker Verification',
    desc: 'Biometric voice authentication — verify if the speaker matches a claimed identity.',
    accent: '#00e676',
    features: ['Cosine similarity match', 'Configurable threshold', 'Pass / Fail verdict'],
  },
  {
    path: '/emotion',
    tag: '684',
    icon: '◇',
    title: 'Emotion Detection',
    desc: 'Detect emotional state from speech — happy, sad, angry, fearful, neutral and more.',
    accent: '#ff3b6b',
    features: ['7 emotion classes', 'Probability breakdown', 'Rich feature extraction'],
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    healthCheck()
      .then(() => setApiStatus('online'))
      .catch(() => setApiStatus('offline'));
  }, []);

  return (
    <div>
      {/* Hero */}
      <div style={{ marginBottom: 56 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)',
            letterSpacing: 3, background: 'rgba(0,229,255,0.08)', padding: '4px 10px',
            border: '1px solid rgba(0,229,255,0.2)', borderRadius: 4 }}>
            SPEECH INTELLIGENCE PLATFORM
          </span>
          <span style={{
            fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: 2,
            color: apiStatus === 'online' ? 'var(--success)' : apiStatus === 'offline' ? 'var(--accent3)' : 'var(--text-dim)',
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: apiStatus === 'online' ? 'var(--success)' : apiStatus === 'offline' ? 'var(--accent3)' : 'var(--text-dim)',
              display: 'inline-block'
            }} />
            API {apiStatus.toUpperCase()}
          </span>
        </div>

        <h1 style={{
          fontFamily: 'var(--font-head)', fontSize: 'clamp(42px, 6vw, 72px)',
          fontWeight: 800, lineHeight: 1.05, letterSpacing: '-1px',
          marginBottom: 20
        }}>
          Voice<em style={{ color: 'var(--accent)', fontStyle: 'normal' }}>Lab</em>
        </h1>

        <p style={{ color: 'var(--text-dim)', maxWidth: 560, fontSize: 15, lineHeight: 1.7 }}>
          An end-to-end speech intelligence platform combining transcription, speaker identification,
          biometric verification, and emotion recognition in a single unified interface.
        </p>

        {/* Waveform decoration */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 28, height: 32 }}>
          {Array.from({ length: 32 }).map((_, i) => (
            <div key={i} style={{
              width: 3, borderRadius: 2,
              background: `hsl(${180 + i * 3}, 90%, 55%)`,
              height: `${Math.sin(i * 0.6) * 12 + 16}px`,
              opacity: 0.6,
              animation: `waveform ${0.6 + (i % 5) * 0.15}s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.04}s`
            }} />
          ))}
        </div>
      </div>

      {/* Module Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 20
      }}>
        {MODULES.map(mod => (
          <ModuleCard key={mod.path} mod={mod} onClick={() => navigate(mod.path)} />
        ))}
      </div>

      {/* Tech stack footer */}
      <div style={{
        marginTop: 56, paddingTop: 32,
        borderTop: '1px solid var(--border)',
        display: 'flex', flexWrap: 'wrap', gap: 12
      }}>
        {['FastAPI', 'React 18', 'librosa', 'scikit-learn', 'SpeechRecognition', 'Render'].map(t => (
          <span key={t} style={{
            fontFamily: 'var(--font-mono)', fontSize: 11,
            color: 'var(--text-dim)', background: 'var(--bg3)',
            padding: '4px 10px', borderRadius: 4,
            border: '1px solid var(--border)'
          }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

function ModuleCard({ mod, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--bg2)',
        border: `1px solid ${hovered ? mod.accent : 'var(--border)'}`,
        borderRadius: 12,
        padding: '24px 22px',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        transform: hovered ? 'translateY(-3px)' : 'none',
        boxShadow: hovered ? `0 8px 32px ${mod.accent}22` : 'none',
        position: 'relative', overflow: 'hidden'
      }}>
      {/* Top glow strip */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: mod.accent, opacity: hovered ? 1 : 0, transition: 'opacity 0.25s'
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <span style={{ fontSize: 26, color: mod.accent }}>{mod.icon}</span>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 10,
          color: mod.accent, background: `${mod.accent}15`,
          padding: '3px 8px', borderRadius: 4, border: `1px solid ${mod.accent}30`
        }}>#{mod.tag}</span>
      </div>

      <h3 style={{
        fontFamily: 'var(--font-head)', fontWeight: 700,
        fontSize: 17, marginBottom: 8, color: 'var(--text)'
      }}>{mod.title}</h3>

      <p style={{ color: 'var(--text-dim)', fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>
        {mod.desc}
      </p>

      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 5 }}>
        {mod.features.map(f => (
          <li key={f} style={{
            fontSize: 12, color: 'var(--text-dim)',
            display: 'flex', alignItems: 'center', gap: 8
          }}>
            <span style={{ color: mod.accent, fontSize: 10 }}>▸</span> {f}
          </li>
        ))}
      </ul>
    </div>
  );
}
