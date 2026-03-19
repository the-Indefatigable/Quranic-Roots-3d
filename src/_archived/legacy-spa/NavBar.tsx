import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import type { ViewMode } from '../store/useStore';

const TABS: { mode: ViewMode; icon: string; label: string }[] = [
  { mode: 'explore', icon: '🌌', label: 'Explore' },
  { mode: 'quiz',    icon: '🎯', label: 'Quiz'    },
  { mode: 'stats',   icon: '📊', label: 'Stats'   },
];

export const NavBar: React.FC = () => {
  const { viewMode, setViewMode, isAdmin, adminLogin, adminLogout } = useStore();
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .navbar-inner { padding: 0 !important; border-radius: 0 !important; justify-content: space-around !important; width: 100% !important; }
          .navbar-wrap { bottom: 0 !important; left: 0 !important; right: 0 !important; transform: none !important; border-radius: 0 !important; border-left: none !important; border-right: none !important; border-bottom: none !important; width: 100%; box-sizing: border-box; }
          .nav-btn { flex: 1; padding: 14px 0 !important; border-radius: 0 !important; min-width: 0 !important; }
        }
      `}</style>
      <div
        className="navbar-wrap"
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 800,
          background: 'rgba(5, 8, 20, 0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '36px',
          padding: '4px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        }}
      >
        <div
          className="navbar-inner"
          style={{ display: 'flex', alignItems: 'center', gap: '2px', padding: '0 4px' }}
        >
          {TABS.map(({ mode, icon, label }) => {
            const active = viewMode === mode || (mode === 'explore' && viewMode === 'space');
            return (
              <button
                key={mode}
                className="nav-btn"
                onClick={() => setViewMode(mode)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                  padding: '10px 20px',
                  borderRadius: '30px',
                  border: 'none',
                  cursor: 'pointer',
                  background: active ? 'rgba(74,158,255,0.18)' : 'transparent',
                  color: active ? '#4a9eff' : 'rgba(255,255,255,0.4)',
                  transition: 'all 0.2s',
                  minWidth: '64px',
                }}
              >
                <span style={{ fontSize: '18px', lineHeight: 1 }}>{icon}</span>
                <span style={{ fontSize: '10px', fontWeight: active ? 700 : 400, letterSpacing: '0.05em', fontFamily: 'system-ui, sans-serif' }}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Admin button — top right */}
      <button
        onClick={() => isAdmin ? adminLogout() : setShowLogin(true)}
        style={{
          position: 'fixed', top: '12px', right: '12px', zIndex: 900,
          background: isAdmin ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${isAdmin ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: '10px', padding: '6px 12px', cursor: 'pointer',
          color: isAdmin ? '#22c55e' : 'rgba(255,255,255,0.3)',
          fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em',
          transition: 'all 0.2s',
        }}
      >
        {isAdmin ? 'Admin (logout)' : 'Admin'}
      </button>

      {/* Login modal */}
      {showLogin && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => { setShowLogin(false); setError(false); setPassword(''); }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'rgba(15,15,30,0.95)', border: '1px solid rgba(74,158,255,0.3)', borderRadius: '20px', padding: '32px', width: '300px', textAlign: 'center' }}>
            <div style={{ fontSize: '14px', color: '#aabbdd', marginBottom: '16px', fontWeight: 600 }}>Admin Login</div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(false); }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  if (adminLogin(password)) { setShowLogin(false); setPassword(''); setError(false); }
                  else setError(true);
                }
              }}
              autoFocus
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '10px', border: `1px solid ${error ? '#ef4444' : 'rgba(255,255,255,0.15)'}`,
                background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
              }}
            />
            {error && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px' }}>Wrong password</div>}
            <button
              onClick={() => {
                if (adminLogin(password)) { setShowLogin(false); setPassword(''); setError(false); }
                else setError(true);
              }}
              style={{
                marginTop: '16px', padding: '10px 24px', borderRadius: '10px', border: 'none',
                background: 'rgba(74,158,255,0.2)', color: '#4a9eff', cursor: 'pointer',
                fontSize: '13px', fontWeight: 600,
              }}
            >
              Login
            </button>
          </div>
        </div>
      )}
    </>
  );
};
