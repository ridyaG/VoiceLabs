import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';


const NAV_ITEMS = [
  { path: '/',            label: 'Overview',        icon: '⬡', tag: '' },
  { path: '/recognize',   label: 'Transcribe',      icon: '◈', tag: '681' },
  { path: '/speaker-id',  label: 'Identify Speaker',icon: '◉', tag: '682' },
  { path: '/verify',      label: 'Verify Identity', icon: '◎', tag: '683' },
  { path: '/emotion',     label: 'Detect Emotion',  icon: '◇', tag: '684' },
];

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className={`layout ${collapsed ? 'collapsed' : ''}`}>
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="logo">
            <span className="logo-icon">◈</span>
            {!collapsed && <span className="logo-text">VOI<em>LA</em></span>}
          </div>
          <button className="collapse-btn" onClick={() => setCollapsed(c => !c)}
            title={collapsed ? 'Expand' : 'Collapse'}>
            {collapsed ? '›' : '‹'}
          </button>
        </div>

        <nav className="nav">
          {NAV_ITEMS.map(item => (
            <NavLink key={item.path} to={item.path} end={item.path === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && (
                <span className="nav-label">
                  {item.label}
                  {item.tag && <span className="nav-tag">{item.tag}</span>}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          {!collapsed && (
            <div className="version-badge">
              <span className="dot" />
              API ONLINE
            </div>
          )}
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>

      <style>{`
        .layout {
          display: flex;
          min-height: 100vh;
          transition: all 0.3s ease;
        }
        .sidebar {
          width: 220px;
          min-height: 100vh;
          background: var(--bg2);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          padding: 0;
          position: sticky;
          top: 0;
          height: 100vh;
          transition: width 0.3s ease;
          flex-shrink: 0;
        }
        .layout.collapsed .sidebar { width: 60px; }
        .sidebar-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 16px 20px;
          border-bottom: 1px solid var(--border);
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          overflow: hidden;
        }
        .logo-icon {
          font-size: 22px;
          color: var(--accent);
          flex-shrink: 0;
          filter: drop-shadow(0 0 8px var(--accent));
        }
        .logo-text {
          font-family: var(--font-head);
          font-size: 18px;
          font-weight: 800;
          letter-spacing: 2px;
          color: var(--text);
          white-space: nowrap;
        }
        .logo-text em {
          color: var(--accent);
          font-style: normal;
        }
        .collapse-btn {
          background: transparent;
          color: var(--text-dim);
          font-size: 18px;
          padding: 2px 6px;
          border-radius: 4px;
          transition: color 0.2s;
          flex-shrink: 0;
        }
        .collapse-btn:hover { color: var(--accent); }
        .nav {
          flex: 1;
          padding: 16px 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: var(--radius);
          color: var(--text-dim);
          transition: all 0.2s;
          text-decoration: none;
          white-space: nowrap;
          overflow: hidden;
        }
        .nav-item:hover { background: var(--bg3); color: var(--text); }
        .nav-item.active {
          background: rgba(0,229,255,0.08);
          color: var(--accent);
          border-left: 2px solid var(--accent);
        }
        .nav-icon { font-size: 16px; flex-shrink: 0; }
        .nav-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-family: var(--font-head);
          font-weight: 600;
        }
        .nav-tag {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--text-dim);
          background: var(--bg3);
          padding: 1px 5px;
          border-radius: 3px;
          border: 1px solid var(--border);
        }
        .sidebar-footer {
          padding: 16px;
          border-top: 1px solid var(--border);
        }
        .version-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          color: var(--success);
          letter-spacing: 1px;
        }
        .dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: var(--success);
          animation: pulse-glow 2s infinite;
          flex-shrink: 0;
        }
        .main-content {
          flex: 1;
          min-width: 0;
          padding: 40px 48px;
          overflow-y: auto;
        }
        @media (max-width: 768px) {
          .sidebar { display: none; }
          .main-content { padding: 24px 20px; }
        }
      `}</style>
    </div>
  );
}
