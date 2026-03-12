import React, { useState } from 'react';
import { useStore, verbRoots } from '../store/useStore';

export const SimulationHUD: React.FC = () => {
  const {
    simulationActive,
    simulationIndex,
    startSimulation,
    stopSimulation,
    nextSimStep,
    prevSimStep,
    jumpToSimStep
  } = useStore();

  const total = verbRoots.length;
  const [startHovered, setStartHovered] = useState(false);

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .mobile-sim-hud {
            bottom: 80px !important;
            padding: 8px 12px !important;
            gap: 6px !important;
            flex-wrap: wrap !important;
            justify-content: center !important;
            max-width: calc(100% - 32px) !important;
            border-radius: 20px !important;
          }
        }
      `}</style>
      <div
        className="mobile-sim-hud"
        style={{
          position: 'fixed',
          bottom: '88px',
          left: '50%',
          transform: 'translateX(-50%)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      background: 'rgba(5, 8, 20, 0.7)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '40px',
      padding: '8px 16px',
      zIndex: 1000,
      boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {!simulationActive ? (
        <button
          onClick={startSimulation}
          onMouseEnter={() => setStartHovered(true)}
          onMouseLeave={() => setStartHovered(false)}
          style={{
            background: startHovered ? 'rgba(74, 158, 255, 0.25)' : 'rgba(74, 158, 255, 0.15)',
            border: '1px solid rgba(74, 158, 255, 0.3)',
            color: '#4a9eff',
            padding: '8px 24px',
            borderRadius: '24px',
            cursor: 'pointer',
            fontWeight: 600,
            letterSpacing: '0.05em',
            transition: 'all 0.2s ease',
          }}
        >
          ▶ START SIMULATION
        </button>
      ) : (
        <>
          <button onClick={stopSimulation} style={btnStyle}>⏹ STOP</button>
          <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
          
          <button onClick={prevSimStep} disabled={simulationIndex === 0} style={btnStyle}>
            ‹ PREV
          </button>
          
          <div style={{ 
            color: '#e2e8f0', 
            fontSize: '14px', 
            fontWeight: 500, 
            minWidth: '100px', 
            textAlign: 'center',
            letterSpacing: '0.05em'
          }}>
            ROOT {simulationIndex + 1} / {total}
          </div>
          
          <button onClick={nextSimStep} disabled={simulationIndex === total - 1} style={btnStyle}>
            NEXT ›
          </button>

          <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
          
          <input 
            type="number" 
            min={1} 
            max={total}
            placeholder="#"
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (!isNaN(val) && val >= 1 && val <= total) {
                jumpToSimStep(val - 1);
              }
            }}
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
              borderRadius: '8px',
              padding: '6px 12px',
              width: '60px',
              textAlign: 'center',
              outline: 'none',
              fontFamily: 'monospace'
            }}
          />
        </>
      )}
      </div>
    </>
  );
};

const btnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#e2e8f0',
  padding: '6px 16px',
  borderRadius: '20px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: 600,
  letterSpacing: '0.05em',
  transition: 'all 0.2s',
};
