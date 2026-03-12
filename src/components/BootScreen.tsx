import React from 'react';

export const BootScreen: React.FC = () => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#020208',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <div
        style={{
          fontFamily: "'Scheherazade New', serif",
          fontSize: 'clamp(26px, 5vw, 44px)',
          color: '#ffd080',
          direction: 'rtl',
          textShadow: '0 0 30px rgba(255,208,80,0.5), 0 0 60px rgba(255,153,0,0.2)',
          letterSpacing: '4px',
          lineHeight: 1.5,
          textAlign: 'center',
          padding: '0 24px',
          animation: 'bismillahPulse 2.5s infinite ease-in-out',
        }}
      >
        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
      </div>

      <div style={{ marginTop: '32px', display: 'flex', gap: '6px' }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: 'rgba(255,208,80,0.5)',
              animation: 'dotBounce 1.4s infinite ease-in-out both',
              animationDelay: `${i * 0.18}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;700&display=swap');
        @keyframes bismillahPulse {
          0%, 100% { opacity: 0.7; text-shadow: 0 0 20px rgba(255,208,80,0.3); }
          50%       { opacity: 1;   text-shadow: 0 0 40px rgba(255,208,80,0.7), 0 0 80px rgba(255,153,0,0.3); }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: scale(0); opacity: 0.2; }
          40%            { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
