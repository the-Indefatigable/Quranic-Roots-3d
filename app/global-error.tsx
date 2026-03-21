'use client';

import './globals.css';

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: '#020617', margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center', padding: '24px' }}>
          <p style={{ fontSize: '28px', color: 'rgba(212,165,116,0.4)', marginBottom: '16px', fontFamily: 'serif' }}>
            إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ
          </p>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>
            Something went wrong.
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)', marginBottom: '32px' }}>
            Please check your connection and try again.
          </p>
          <button
            onClick={reset}
            style={{
              background: 'rgba(212,165,116,0.15)',
              color: '#D4A574',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 24px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
