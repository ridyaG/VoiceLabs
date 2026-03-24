import React, { useState, useEffect } from 'react';
import AudioDropzone from '../components/AudioDropzone';
import PageHeader from '../components/PageHeader';
import { getApiErrorMessage, listSpeakers, verifySpeaker } from '../api';
import { cardStyle, submitBtn, SectionLabel, ErrorBox, Spinner } from './RecognizePage';

export default function VerifyPage() {
  const [file, setFile]       = useState(null);
  const [name, setName]       = useState('');
  const [speakers, setSpeakers] = useState([]);
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const accent = '#00e676';

  useEffect(() => {
    listSpeakers().then(({ data }) => setSpeakers(data.speakers)).catch(() => {});
  }, []);

  const handleVerify = async () => {
    if (!file || !name) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const { data } = await verifySpeaker(file, name);
      setResult(data);
    } catch (e) {
      setError(getApiErrorMessage(e, 'Verification failed.'));
    } finally { setLoading(false); }
  };

  const scoreColor = result
    ? result.verified ? 'var(--success)' : 'var(--accent3)'
    : accent;

  return (
    <div>
      <PageHeader tag="683" icon="◎" accent={accent}
        title="Speaker Verification"
        subtitle="Biometric voice authentication — verify if an audio sample matches an enrolled speaker identity." />

      <div style={cardStyle}>
        <SectionLabel>Claim Identity</SectionLabel>
        {speakers.length === 0 ? (
          <div style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 16 }}>
            ⚠ No enrolled speakers found. Go to <strong style={{ color: 'var(--accent)' }}>Speaker ID → Enroll</strong> first.
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            <span style={{ color: 'var(--text-dim)', fontSize: 12, fontFamily: 'var(--font-mono)', alignSelf: 'center', letterSpacing: 1 }}>
              SELECT SPEAKER:
            </span>
            {speakers.map(s => (
              <button key={s} onClick={() => setName(s)} style={{
                background: name === s ? `${accent}20` : 'var(--bg3)',
                border: `1px solid ${name === s ? accent : 'var(--border)'}`,
                color: name === s ? accent : 'var(--text-dim)',
                padding: '6px 16px', borderRadius: 20,
                fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: 13,
                cursor: 'pointer', transition: 'all 0.2s'
              }}>{s}</button>
            ))}
          </div>
        )}

        {!name && speakers.length > 0 && (
          <p style={{ color: 'var(--text-dim)', fontSize: 12, marginBottom: 16 }}>Select a speaker above to verify against.</p>
        )}

        <SectionLabel>Voice Sample to Verify</SectionLabel>
        <AudioDropzone onFile={setFile} label="Drop audio to verify identity" />

        <button onClick={handleVerify} disabled={!file || !name || loading}
          style={submitBtn(accent, !file || !name || loading)}>
          {loading ? <><Spinner />Verifying…</> : '◎ Verify Identity'}
        </button>
        {error && <ErrorBox msg={error} />}
      </div>

      {result && (
        <div style={{
          ...cardStyle,
          border: `1px solid ${result.verified ? 'var(--success)' : 'var(--accent3)'}`,
          boxShadow: `0 0 32px ${result.verified ? 'rgba(0,230,118,0.1)' : 'rgba(255,59,107,0.1)'}`,
        }}>
          <div style={{ textAlign: 'center', padding: '20px 0 28px' }}>
            <div style={{ fontSize: 64, marginBottom: 12 }}>
              {result.verified ? '✅' : '❌'}
            </div>
            <h2 style={{
              fontFamily: 'var(--font-head)', fontSize: 28, fontWeight: 800,
              color: result.verified ? 'var(--success)' : 'var(--accent3)',
              marginBottom: 6
            }}>
              {result.verified ? 'Identity Confirmed' : 'Identity Rejected'}
            </h2>
            <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>
              Claimed: <strong style={{ color: 'var(--text)' }}>{result.speaker_name}</strong>
            </p>
          </div>

          {/* Score meter */}
          <SectionLabel>Similarity Score</SectionLabel>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ flex: 1, background: 'var(--bg3)', borderRadius: 8, height: 12, overflow: 'hidden' }}>
              <div style={{
                width: `${result.confidence_pct}%`, height: '100%',
                background: result.verified ? 'var(--success)' : 'var(--accent3)',
                borderRadius: 8, transition: 'width 0.8s ease'
              }} />
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 20, color: scoreColor, fontWeight: 700, minWidth: 60 }}>
              {result.confidence_pct}%
            </span>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <MiniStat label="Similarity Score" value={result.similarity_score} color={scoreColor} />
            <MiniStat label="Threshold" value={`${result.threshold * 100}%`} color="var(--text-dim)" />
            <MiniStat label="Result" value={result.verified ? 'PASS' : 'FAIL'} color={scoreColor} />
          </div>
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <div style={{
      background: 'var(--bg3)', borderRadius: 6, padding: '10px 16px',
      border: '1px solid var(--border)', minWidth: 100
    }}>
      <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, color, fontFamily: 'var(--font-head)', fontWeight: 700 }}>{value}</div>
    </div>
  );
}
