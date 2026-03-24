import React from 'react';

export default function PageHeader({ tag, icon, accent, title, subtitle }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 24, color: accent }}>{icon}</span>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, color: accent,
          background: `${accent}15`, padding: '3px 10px',
          border: `1px solid ${accent}30`, borderRadius: 4, letterSpacing: 2
        }}>PROJECT {tag}</span>
      </div>
      <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 32, fontWeight: 800, marginBottom: 8 }}>{title}</h1>
      <p style={{ color: 'var(--text-dim)', fontSize: 14, maxWidth: 520 }}>{subtitle}</p>
    </div>
  );
}
