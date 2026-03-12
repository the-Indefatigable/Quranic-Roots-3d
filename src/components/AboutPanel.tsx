import React from 'react';

export const AboutPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'rgba(5, 8, 20, 0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'rgba(15, 15, 30, 0.95)',
          border: '1px solid rgba(74, 158, 255, 0.3)',
          borderRadius: '24px',
          padding: '40px',
          width: '100%',
          maxWidth: '500px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          position: 'relative',
          color: '#ffffff',
          fontFamily: 'system-ui, sans-serif',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: '#fff',
            width: '32px',
            height: '32px',
            borderRadius: '16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
          }}
        >
          ✕
        </button>

        <h2 style={{ marginTop: 0, fontSize: '24px', fontWeight: 600, color: '#4a9eff' }}>
          About This Project
        </h2>
        
        <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'rgba(255,255,255,0.9)' }}>
          <strong>As-salamu alaykum brothers and sisters,</strong>
        </p>

        <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'rgba(255,255,255,0.8)' }}>
          Welcome to the Quranic Verb Roots Explorer. This tool was built to help students of Arabic visually 
          map out the beautiful morphology of the Quran. By exploring the connections between Roots, 
          Forms (Babs), and Tenses, we hope this makes understanding the language of the Quran more accessible and profound.
        </p>

        <div style={{ marginTop: '32px', padding: '20px', background: 'rgba(74, 158, 255, 0.05)', borderRadius: '16px', border: '1px solid rgba(74, 158, 255, 0.15)' }}>
          <h3 style={{ marginTop: 0, fontSize: '16px', color: '#4a9eff' }}>Feedback & Errors</h3>
          <p style={{ fontSize: '14px', lineHeight: 1.5, color: 'rgba(255,255,255,0.7)', margin: 0, marginBottom: '16px' }}>
            This project is a work in progress. If you spot any grammatical errors, missing conjugations, or have ideas for new features, please let us know!
          </p>
          <a 
            href="mailto:contact@example.com" // Placeholder email, user can update
            style={{
              display: 'inline-block',
              padding: '10px 20px',
              background: 'rgba(74, 158, 255, 0.15)',
              border: '1px solid rgba(74, 158, 255, 0.4)',
              color: '#4a9eff',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              transition: 'background 0.2s',
            }}
          >
            Send Feedback
          </a>
        </div>
      </div>
    </div>
  );
};
