import React, { useState, useEffect } from 'react';
import AudioDropzone from '../components/AudioDropzone';
import PageHeader from '../components/PageHeader';
import { enrollSpeaker, identifySpeaker, listSpeakers, removeSpeaker } from '../api';
import { cardStyle, submitBtn, SectionLabel, StatPill, ErrorBox, Spinner } from './RecognizePage';

export default function SpeakerIdPage() {
  const [tab, setTab]           = useState('enroll'); // 'enroll' | 'identify'
  const [file, setFile]         = useState(null);
  const [name, setName]         = useState('');
  const [speakers, setSpeakers] = useState([]);
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [success, setSuccess]   = useState(null);

  useEffect(() => { fetchSpeakers(); }, []);

  const fetchSpeakers = async () => {
    try { const { data } = await listSpeakers(); setSpeakers(data.speakers); }
    catch {}
  };

  const handleEnroll = async () => {
    if (!file || !name.trim()) return;
    setLoading(true); setError(null); setSuccess(null);
    try {
      const { data } = await enrollSpeaker(file, name.trim());
      setSuccess(`✅ "${name}" enrolled! Total speakers: ${data.total_speakers}`);
      setName(''); setFile(null);
      fetchSpeakers();
    } catch (e) {
      setError(e.response?.data?.detail || 'Enrollment failed.');
    } finally { setLoading(false); }
  };

  const handleIdentify = async () => {
    if (!file) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const { data } = await identifySpeaker(file);
      setResult(data);
    } catch (e) {
      setError(e.response?.data?.detail || 'Identification failed.');
    } finally { setLoading(false); }
  };

  const handleRemove = async (n) => {
    try { await removeSpeaker(n); fetchSpeakers(); }
    catch {}
  };

  const accent = '#7c3aed';

  return (
    <div>
      <PageHeader tag="682" icon="◉" accent={accent}
        title="Speaker Identification"
        subtitle="Enroll speaker voice profiles, then identify unknown voices by comparing MFCC features." />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '1px solid var(--border)' }}>
        {['enroll', 'identify'].map(t => (
          <button key={t} onClick={() => { setTab(t); setResult(null); setError(null); setSuccess(null); }}
            style={{
              background: 'transparent', padding: '10px 24px',
              borderBottom: tab === t ? `2px solid ${accent}` : '2px solid transparent',
              color: tab === t ? accent : 'var(--text-dim)',
              fontFamily: 'var(--font-head)', fontWeight: 600, fontSize: 14,
              cursor: 'pointer', transition: 'all 0.2s', textTransform: 'capitalize'
            }}>
            {t === 'enroll' ? '+ Enroll Speaker' : '◉ Identify Speaker'}
          </button>
        ))}
      </div>

      {/* Enrolled speakers pill row */}
      <div style={cardStyle}>
        <SectionLabel>Enrolled Speakers ({speakers.length})</SectionLabel>
        {speakers.length === 0 ? (
          <p style={{ color: 'var(--text-dim)', fontSize: 13 }}>No speakers enrolled yet. Use the Enroll tab to add voices.</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {speakers.map(s => (
              <div key={s} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: `${accent}12`, border: `1px solid ${accent}30`,
                borderRadius: 20, padding: '5px 14px'
              }}>
                <span style={{ color: accent, fontSize: 13, fontFamily: 'var(--font-head)' }}>◉ {s}</span>
                <button onClick={() => handleRemove(s)}
                  style={{ background: 'none', color: 'var(--text-dim)', fontSize: 14, cursor: 'pointer', lineHeight: 1 }}>
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Enroll Tab */}
      {tab === 'enroll' && (
        <div style={cardStyle}>
          <SectionLabel>Voice Sample</SectionLabel>
          <AudioDropzone onFile={setFile} label="Drop audio sample for enrollment" />
          <div style={{ marginTop: 16 }}>
            <label style={{ display: 'block', color: 'var(--text-dim)', fontSize: 12,
              fontFamily: 'var(--font-mono)', letterSpacing: 1, marginBottom: 8 }}>
              SPEAKER NAME
            </label>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Alice"
              style={{
                width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)',
                borderRadius: 6, padding: '10px 14px', color: 'var(--text)',
                fontFamily: 'var(--font-mono)', fontSize: 14, outline: 'none'
              }} />
          </div>
          <button onClick={handleEnroll} disabled={!file || !name.trim() || loading}
            style={submitBtn(accent, !file || !name.trim() || loading)}>
            {loading ? <><Spinner />Enrolling…</> : '+ Enroll Speaker'}
          </button>
          {success && <div style={{ marginTop: 14, color: 'var(--success)', fontSize: 13, fontFamily: 'var(--font-mono)' }}>{success}</div>}
          {error && <ErrorBox msg={error} />}
        </div>
      )}

      {/* Identify Tab */}
      {tab === 'identify' && (
        <div style={cardStyle}>
          <SectionLabel>Unknown Audio</SectionLabel>
          <AudioDropzone onFile={setFile} label="Drop audio to identify the speaker" />
          <button onClick={handleIdentify} disabled={!file || loading}
            style={submitBtn(accent, !file || loading)}>
            {loading ? <><Spinner />Identifying…</> : '◉ Identify Speaker'}
          </button>
          {error && <ErrorBox msg={error} />}
        </div>
      )}

      {result && (
        <div style={cardStyle}>
          <SectionLabel>Identification Result</SectionLabel>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{ fontSize: 48 }}>◉</div>
            <div>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: 28, fontWeight: 800, color: accent }}>
                {result.identified_speaker}
              </div>
              <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>{result.confidence_pct}% confidence</div>
            </div>
          </div>

          <SectionLabel>All Rankings</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {result.rankings?.map((r, i) => (
              <div key={r.speaker} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: i === 0 ? `${accent}10` : 'transparent',
                border: `1px solid ${i === 0 ? accent + '30' : 'var(--border)'}`,
                borderRadius: 8, padding: '10px 14px'
              }}>
                <span style={{ color: 'var(--text-dim)', fontSize: 12, width: 20, textAlign: 'center' }}>#{i+1}</span>
                <span style={{ flex: 1, fontFamily: 'var(--font-head)', fontWeight: 600 }}>{r.speaker}</span>
                <div style={{ flex: 2, background: 'var(--bg3)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                  <div style={{ width: `${r.pct}%`, height: '100%', background: accent, borderRadius: 4, transition: 'width 0.6s ease' }} />
                </div>
                <span style={{ color: accent, fontFamily: 'var(--font-mono)', fontSize: 13, width: 52, textAlign: 'right' }}>
                  {r.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
