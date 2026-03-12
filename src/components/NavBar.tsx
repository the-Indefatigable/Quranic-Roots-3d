import React from 'react';
import { useStore } from '../store/useStore';
import type { ViewMode } from '../store/useStore';

const TABS: { mode: ViewMode; icon: string; label: string }[] = [
  { mode: 'space',   icon: '🌌', label: 'Explore' },
  { mode: 'explore', icon: '🔍', label: 'Filter'  },
  { mode: 'quiz',    icon: '🎯', label: 'Quiz'    },
  { mode: 'stats',   icon: '📊', label: 'Stats'   },
];

export const NavBar: React.FC = () => {
  const { viewMode, setViewMode } = useStore();

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .navbar-inner { padding: 0 !important; border-radius: 0 !important; }
          .navbar-wrap { bottom: 0 !important; left: 0 !important; right: 0 !important; transform: none !important; border-radius: 0 !important; border-left: none !important; border-right: none !important; border-bottom: none !important; }
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
            const active = viewMode === mode;
            return (
              <button
                key={mode}
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
    </>
  );
};
