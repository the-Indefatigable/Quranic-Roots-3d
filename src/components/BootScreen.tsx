import React from 'react';

export const BootScreen: React.FC = () => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#020205',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#fff',
        zIndex: 9999,
      }}
    >
      {/* Central animated orb/root */}
      <div
        style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at center, rgba(74,158,255,0.2) 0%, rgba(74,158,255,0) 70%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '32px',
          animation: 'pulseGlow 2s infinite ease-in-out',
          boxShadow: '0 0 40px rgba(74,158,255,0.1)',
          border: '1px solid rgba(74,158,255,0.1)',
        }}
      >
        <span
          style={{
            fontFamily: "'Scheherazade New', serif",
            fontSize: '48px',
            color: '#4a9eff',
            textShadow: '0 0 20px rgba(74,158,255,0.8)',
          }}
        >
          ق و ل
        </span>
      </div>

      <div
        style={{
          fontSize: '14px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: '#888899',
          fontWeight: 500,
          animation: 'pulseText 2s infinite ease-in-out',
        }}
      >
        Initializing Morphology Engine
      </div>
      
      <div style={{ marginTop: '16px', display: 'flex', gap: '4px' }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#4a9eff',
              animation: `bounce 1.4s infinite ease-in-out both`,
              animationDelay: `${i * 0.16}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes pulseGlow {
          0%, 100% { transform: scale(1); opacity: 0.8; box-shadow: 0 0 40px rgba(74,158,255,0.1); }
          50% { transform: scale(1.05); opacity: 1; box-shadow: 0 0 60px rgba(74,158,255,0.3); }
        }
        @keyframes pulseText {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
