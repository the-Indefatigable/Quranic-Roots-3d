import React, { useState, useEffect } from 'react';

interface Props {
  onStart: () => void;
}

export const WelcomeScreen: React.FC<Props> = ({ onStart }) => {
  const [visible, setVisible] = useState(false);
  const [btnHover, setBtnHover] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

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
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#fff',
        zIndex: 9999,
        overflow: 'hidden',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.8s ease',
      }}
    >
      {/* Background glow orbs */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(74,158,255,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '10%',
        left: '30%',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,153,0,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Stars */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${(i * 37 + 11) % 100}%`,
              top: `${(i * 53 + 7) % 100}%`,
              width: i % 5 === 0 ? '2px' : '1px',
              height: i % 5 === 0 ? '2px' : '1px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.4)',
              animation: `twinkle ${2 + (i % 3)}s infinite ease-in-out`,
              animationDelay: `${(i * 0.13) % 2}s`,
            }}
          />
        ))}
      </div>

      {/* Bismillah */}
      <div
        style={{
          fontFamily: "'Scheherazade New', serif",
          fontSize: 'clamp(28px, 6vw, 52px)',
          color: '#ffd080',
          direction: 'rtl',
          textShadow: '0 0 30px rgba(255,208,80,0.5), 0 0 60px rgba(255,153,0,0.2)',
          marginBottom: '16px',
          letterSpacing: '4px',
          lineHeight: 1.4,
          textAlign: 'center',
          padding: '0 20px',
          animation: 'floatUp 0.9s ease-out both',
          animationDelay: '0.2s',
        }}
      >
        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
      </div>

      {/* Divider */}
      <div style={{
        width: '120px',
        height: '1px',
        background: 'linear-gradient(to right, transparent, rgba(255,208,80,0.4), transparent)',
        marginBottom: '40px',
        animation: 'floatUp 0.9s ease-out both',
        animationDelay: '0.35s',
      }} />

      {/* App title */}
      <div
        style={{
          fontSize: 'clamp(36px, 8vw, 64px)',
          fontWeight: 700,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          background: 'linear-gradient(135deg, #ffffff 0%, #4a9eff 50%, #ffffff 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '12px',
          animation: 'floatUp 0.9s ease-out both',
          animationDelay: '0.45s',
        }}
      >
        QURoots
      </div>

      {/* Tagline */}
      <div
        style={{
          fontSize: 'clamp(13px, 2.5vw, 16px)',
          color: '#7788aa',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: '56px',
          textAlign: 'center',
          padding: '0 20px',
          animation: 'floatUp 0.9s ease-out both',
          animationDelay: '0.55s',
        }}
      >
        Explore the language of the Quran
      </div>

      {/* Start button */}
      <button
        onClick={onStart}
        onMouseEnter={() => setBtnHover(true)}
        onMouseLeave={() => setBtnHover(false)}
        style={{
          padding: '16px 56px',
          fontSize: '15px',
          fontWeight: 600,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: btnHover ? '#ffffff' : '#c8e0ff',
          background: btnHover
            ? 'rgba(74,158,255,0.25)'
            : 'rgba(74,158,255,0.1)',
          border: `1px solid ${btnHover ? 'rgba(74,158,255,0.8)' : 'rgba(74,158,255,0.35)'}`,
          borderRadius: '50px',
          cursor: 'pointer',
          transition: 'all 0.25s ease',
          boxShadow: btnHover
            ? '0 0 30px rgba(74,158,255,0.3), inset 0 0 20px rgba(74,158,255,0.05)'
            : '0 0 0px transparent',
          animation: 'floatUp 0.9s ease-out both',
          animationDelay: '0.7s',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        Begin
      </button>

      {/* Bottom credit */}
      <div
        style={{
          position: 'absolute',
          bottom: '24px',
          fontSize: '11px',
          color: '#333355',
          letterSpacing: '0.08em',
          animation: 'floatUp 0.9s ease-out both',
          animationDelay: '0.9s',
        }}
      >
        quroots.com
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;700&display=swap');
        @keyframes floatUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50%       { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};
