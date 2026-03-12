import React, { useMemo } from 'react';
import { verbRoots } from '../store/useStore';

export interface QuizStats {
  totalAnswered: number;
  totalCorrect: number;
  currentStreak: number;
  bestStreak: number;
  byType: Record<string, { answered: number; correct: number }>;
}

export const STATS_KEY = 'quranic_quiz_stats';

export function loadStats(): QuizStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) return JSON.parse(raw) as QuizStats;
  } catch { /* ignore */ }
  return { totalAnswered: 0, totalCorrect: 0, currentStreak: 0, bestStreak: 0, byType: {} };
}

export function saveStats(s: QuizStats) {
  try { localStorage.setItem(STATS_KEY, JSON.stringify(s)); } catch { /* ignore */ }
}

export function resetStats() {
  try { localStorage.removeItem(STATS_KEY); } catch { /* ignore */ }
}

const TYPE_LABELS: Record<string, string> = {
  root_meaning:   'Root Meaning',
  bab_pattern:    'Identify Bāb Pattern',
  tense_id:       'Identify Tense',
  person_id:      'Identify Person',
  form_from_desc: 'Find the Conjugation',
};

const StatCard: React.FC<{ label: string; value: string | number; sub?: string; color?: string }> = ({ label, value, sub, color = '#4a9eff' }) => (
  <div style={{
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '16px',
    padding: '20px 24px',
    flex: '1 1 140px',
  }}>
    <div style={{ fontSize: '11px', color: '#555577', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>{label}</div>
    <div style={{ fontSize: '32px', fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: '11px', color: '#444466', marginTop: '6px' }}>{sub}</div>}
  </div>
);

export const StatsPanel: React.FC = () => {
  const stats = useMemo(() => loadStats(), []);
  const pct = stats.totalAnswered > 0 ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100) : 0;

  const totalRoots    = verbRoots.length;
  const totalForms    = verbRoots.reduce((s, r) => s + r.babs.length, 0);
  const totalTenses   = verbRoots.reduce((s, r) => s + r.babs.reduce((b, bab) => b + bab.tenses.length, 0), 0);
  const totalConj     = verbRoots.reduce((s, r) => s + r.babs.reduce((b, bab) => b + bab.tenses.reduce((t, tense) => t + tense.conjugation.filter(c => c.arabic !== '-').length, 0), 0), 0);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 700,
      background: '#02050f',
      overflowY: 'auto',
      paddingBottom: '100px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '11px', color: '#4a9eff', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>Your Progress</div>
          <div style={{ fontSize: '28px', color: '#fff', fontWeight: 600 }}>Quiz Statistics</div>
        </div>

        {/* Quiz stats */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '28px' }}>
          <StatCard label="Total Answered"   value={stats.totalAnswered} color="#4a9eff" />
          <StatCard label="Correct"          value={`${pct}%`}          color={pct >= 80 ? '#22c55e' : pct >= 60 ? '#ffd700' : '#ff6b6b'} sub={`${stats.totalCorrect} correct`} />
          <StatCard label="Current Streak"   value={stats.currentStreak} color="#f97316" sub="in a row" />
          <StatCard label="Best Streak"      value={stats.bestStreak}    color="#a855f7" sub="all time" />
        </div>

        {/* By question type */}
        {Object.keys(stats.byType).length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <div style={{ fontSize: '11px', color: '#555577', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>By Question Type</div>
            {Object.entries(stats.byType).map(([type, d]) => {
              const p = d.answered > 0 ? Math.round((d.correct / d.answered) * 100) : 0;
              return (
                <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ flex: 1, fontSize: '13px', color: '#ccd' }}>{TYPE_LABELS[type] ?? type}</div>
                  <div style={{ width: '120px', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${p}%`, background: p >= 80 ? '#22c55e' : p >= 60 ? '#ffd700' : '#ff6b6b', borderRadius: '2px', transition: 'width 0.4s' }} />
                  </div>
                  <div style={{ fontSize: '12px', color: '#888899', minWidth: '40px', textAlign: 'right' }}>{p}%</div>
                  <div style={{ fontSize: '10px', color: '#444466', minWidth: '50px', textAlign: 'right' }}>{d.answered} done</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Dataset stats */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '11px', color: '#555577', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>Dataset</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <StatCard label="Roots"         value={totalRoots}  color="#ffd700" />
            <StatCard label="Verb Forms"    value={totalForms}  color="#f97316" />
            <StatCard label="Tenses"        value={totalTenses} color="#a855f7" />
            <StatCard label="Conjugations"  value={totalConj.toLocaleString()}  color="#22c55e" sub="filled forms" />
          </div>
        </div>

        {stats.totalAnswered > 0 && (
          <button
            onClick={() => { resetStats(); window.location.reload(); }}
            style={{
              marginTop: '8px',
              background: 'transparent',
              border: '1px solid rgba(255,100,100,0.25)',
              borderRadius: '10px',
              padding: '10px 20px',
              color: '#ff6b6b',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Reset quiz stats
          </button>
        )}
      </div>
    </div>
  );
};
