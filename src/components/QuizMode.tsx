/**
 * QuizMode — Root-by-root structured quiz.
 *
 * For each root a fixed batch of questions is generated in order:
 *   Q1  — What does this root mean?          (meaning)
 *   Q2  — Which bāb is this pattern?         (bāb identification)
 *   Q3  — What is the māḍī form for "he"?   (past tense 3ms)
 *   Q4  — What is the muḍāriʿ form for "he"?(present tense 3ms)
 *   Q5  — What is the amr form for "you"?    (imperative 2ms, if tense exists)
 *   Q6  — What is the passive past for "he"? (majhūl māḍī 3ms, if tense exists)
 *   Q7  — What is the passive present for "he"? (majhūl muḍāriʿ 3ms, if tense exists)
 *
 * After each root's batch, a summary card is shown then it moves to the next root.
 * Roots are shuffled; when all are done the deck reshuffles and repeats.
 */
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { verbRoots } from '../store/useStore';
import type { VerbRoot, Bab, Tense, ConjugationForm } from '../data/verbs';
import { TENSE_COLORS } from '../data/verbs';
import { loadStats, saveStats } from './StatsPanel';
import type { QuizStats } from './StatsPanel';
import { useSwipeGesture } from '../hooks/useSwipeGesture';

// ── Constants ────────────────────────────────────────────────────────────────
const FORM_MEANINGS: Record<string, string> = {
  I: 'Base form (root meaning)',
  II: 'Intensification / Causative',
  III: 'Mutual action / Effort',
  IV: 'Causative / Transitive',
  V: 'Reflexive of Form II',
  VI: 'Reciprocal of Form III',
  VII: 'Passive / Reflexive',
  VIII: 'Reflexive / Intentional',
  IX: 'Colors & Physical Traits',
  X: 'Seeking / Deeming',
};

const ALL_FORMS = ['I','II','III','IV','V','VI','VII','VIII','IX','X'];

const TENSE_CONFIG: Record<string, { label: string; person: string; personLabel: string }> = {
  madi:          { label: 'Māḍī (Past)',           person: '3ms', personLabel: 'He (3ms)'    },
  mudari:        { label: 'Muḍāriʿ (Present)',     person: '3ms', personLabel: 'He (3ms)'    },
  amr:           { label: 'Amr (Imperative)',       person: '2ms', personLabel: 'You (2ms)'   },
  passive_madi:  { label: 'Majhūl Māḍī (Pass. Past)',    person: '3ms', personLabel: 'He (3ms)'    },
  passive_mudari:{ label: 'Majhūl Muḍāriʿ (Pass. Pres.)',person: '3ms', personLabel: 'He (3ms)'    },
};

// Fixed order of tenses to quiz
const TENSE_ORDER = ['madi','mudari','amr','passive_madi','passive_mudari'];

// ── Types ────────────────────────────────────────────────────────────────────
type QType = 'meaning' | 'bab' | 'conjugation';

interface Option { id: string; text: string; arabic?: string; sub?: string; }

interface Question {
  type: QType;
  tenseType?: string;           // for conjugation questions
  heading: string;
  arabicDisplay: string;
  subtitle: string;
  question: string;
  options: Option[];
  correctId: string;
}

// ── Spaced-Repetition System ─────────────────────────────────────────────────
const SRS_KEY = 'quranic_srs_v1';

interface SRSRecord {
  mastery: number;      // 0–5
  nextReview: number;   // epoch ms
}

type SRSData = Record<string, SRSRecord>;

// Intervals in ms by mastery level
const SRS_INTERVALS = [
  0,                  // 0 — immediate / unseen
  1  * 86_400_000,    // 1 — 1 day
  3  * 86_400_000,    // 2 — 3 days
  7  * 86_400_000,    // 3 — 1 week
  14 * 86_400_000,    // 4 — 2 weeks
  30 * 86_400_000,    // 5 — 1 month
];

function loadSRS(): SRSData {
  try {
    const raw = localStorage.getItem(SRS_KEY);
    if (raw) return JSON.parse(raw) as SRSData;
  } catch { /* ignore */ }
  return {};
}

function saveSRS(data: SRSData) {
  try { localStorage.setItem(SRS_KEY, JSON.stringify(data)); } catch { /* ignore */ }
}

function updateSRS(data: SRSData, rootId: string, correct: number, total: number): SRSData {
  const rec = data[rootId] ?? { mastery: 0, nextReview: 0 };
  const ratio = correct / Math.max(total, 1);
  let newMastery: number;
  let intervalMultiplier: number;

  if (ratio === 1) {
    newMastery = Math.min(5, rec.mastery + 1);
    intervalMultiplier = 1;
  } else if (ratio >= 0.5) {
    newMastery = rec.mastery;
    intervalMultiplier = 0.5;
  } else {
    newMastery = Math.max(0, rec.mastery - 1);
    intervalMultiplier = 0; // 1-hour retry
  }

  const interval = newMastery === 0 && intervalMultiplier === 0
    ? 3_600_000
    : Math.round(SRS_INTERVALS[newMastery] * intervalMultiplier || SRS_INTERVALS[newMastery]);

  return {
    ...data,
    [rootId]: { mastery: newMastery, nextReview: Date.now() + interval },
  };
}

/** Sort roots by SRS priority: overdue → new → upcoming */
function buildSRSQueue(srsData: SRSData): VerbRoot[] {
  const now = Date.now();
  const overdue: VerbRoot[] = [];
  const unseen:  VerbRoot[] = [];
  const upcoming: VerbRoot[] = [];

  for (const root of verbRoots) {
    const rec = srsData[root.id];
    if (!rec) {
      unseen.push(root);
    } else if (rec.nextReview <= now) {
      overdue.push(root);
    } else {
      upcoming.push(root);
    }
  }

  // Sort overdue by most overdue first; upcoming by soonest first
  overdue.sort((a, b) => (srsData[a.id]?.nextReview ?? 0) - (srsData[b.id]?.nextReview ?? 0));
  upcoming.sort((a, b) => (srsData[a.id]?.nextReview ?? 0) - (srsData[b.id]?.nextReview ?? 0));

  return [...overdue, ...shuffle(unseen), ...upcoming];
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickN<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

function randOtherStrings(pool: string[], exclude: string, count: number): string[] {
  return pickN(pool.filter(x => x !== exclude), count);
}

// ── Question builders ─────────────────────────────────────────────────────────
function buildMeaningQuestion(root: VerbRoot): Question {
  const correct  = root.meaning;
  const wrongs   = randOtherStrings(verbRoots.map(r => r.meaning), correct, 3);
  const shuffled = shuffle([
    { id: 'c', text: correct },
    ...wrongs.map((w, i) => ({ id: `w${i}`, text: w })),
  ]);
  return {
    type: 'meaning',
    heading: 'Root Meaning',
    arabicDisplay: root.root,
    subtitle: root.rootLetters.join(' · ') + ' · ' + (root.totalFreq ?? 0) + ' occurrences in the Quran',
    question: 'What does this verb root mean?',
    options: shuffled,
    correctId: shuffled.find(o => o.text === correct)!.id,
  };
}

function buildBabQuestion(root: VerbRoot, bab: Bab): Question {
  const correctForm = bab.form;
  const wrongs      = randOtherStrings(ALL_FORMS, correctForm, 3);
  const shuffled    = shuffle([
    { id: 'c', text: `Form ${correctForm}`, sub: FORM_MEANINGS[correctForm] ?? '' },
    ...wrongs.map((f, i) => ({ id: `w${i}`, text: `Form ${f}`, sub: FORM_MEANINGS[f] ?? '' })),
  ]);
  // Show the actual māḍī 3ms of THIS root in this bāb, not the abstract pattern
  const madiForm = bab.tenses.find(t => t.type === 'madi')?.conjugation.find(c => c.person === '3ms' && c.arabic !== '-')?.arabic ?? bab.arabicPattern;
  return {
    type: 'bab',
    heading: 'Identify the Bāb',
    arabicDisplay: madiForm,
    subtitle: `Root: ${root.root} — ${root.meaning} · Pattern: ${bab.arabicPattern}`,
    question: 'Which verb form (bāb) is this?',
    options: shuffled,
    correctId: shuffled.find(o => o.text === `Form ${correctForm}`)!.id,
  };
}

function buildConjugationQuestion(root: VerbRoot, bab: Bab, tense: Tense, conj: ConjugationForm): Question {
  const cfg     = TENSE_CONFIG[tense.type];
  const correct = conj.arabic;

  // Wrong options: other conjugations from different roots (same tense type if possible)
  const otherForms: string[] = [];
  for (const r of verbRoots) {
    if (r.id === root.id) continue;
    for (const b of r.babs) {
      for (const t of b.tenses) {
        if (t.type === tense.type) {
          const c = t.conjugation.find(x => x.person === conj.person && x.arabic !== '-');
          if (c && c.arabic !== correct) otherForms.push(c.arabic);
        }
      }
    }
    if (otherForms.length >= 20) break;
  }

  const wrongs   = pickN(otherForms.length >= 3 ? otherForms : otherForms.concat(
    tense.conjugation.filter(c => c.arabic !== '-' && c.arabic !== correct).map(c => c.arabic)
  ), 3);

  const shuffled = shuffle([
    { id: 'c', arabic: correct, text: correct },
    ...wrongs.slice(0, 3).map((w, i) => ({ id: `w${i}`, arabic: w, text: w })),
  ]);

  return {
    type: 'conjugation',
    tenseType: tense.type,
    heading: cfg.label,
    arabicDisplay: root.root,
    subtitle: `Form ${bab.romanNumeral} · ${cfg.personLabel}`,
    question: `What is the ${cfg.label} form for "${cfg.personLabel}"?`,
    options: shuffled,
    correctId: shuffled.find(o => o.text === correct)!.id,
  };
}

// Build the full question batch for one root (primary bāb)
function buildRootBatch(root: VerbRoot): Question[] {
  if (!root.babs.length) return [];
  const bab = root.babs[0]; // primary bāb (most frequent)
  const questions: Question[] = [];

  // Q1: meaning
  questions.push(buildMeaningQuestion(root));

  // Q2: bāb
  questions.push(buildBabQuestion(root, bab));

  // Q3–Q7: one per tense in fixed order
  for (const tenseType of TENSE_ORDER) {
    const tense = bab.tenses.find(t => t.type === tenseType);
    if (!tense) continue;
    const cfg   = TENSE_CONFIG[tenseType];
    const conj  = tense.conjugation.find(c => c.person === cfg.person && c.arabic !== '-');
    if (!conj) continue;
    questions.push(buildConjugationQuestion(root, bab, tense, conj));
  }

  return questions;
}

// ── Main component ────────────────────────────────────────────────────────────
export const QuizMode: React.FC = () => {
  const rootQueueRef  = useRef<VerbRoot[]>([]);
  const statsRef      = useRef<QuizStats>(loadStats());
  const srsRef        = useRef<SRSData>(loadSRS());

  // Current root batch state
  const [currentRoot,    setCurrentRoot]    = useState<VerbRoot | null>(null);
  const [batch,          setBatch]          = useState<Question[]>([]);
  const [batchIdx,       setBatchIdx]       = useState(0);
  const [selected,       setSelected]       = useState<string | null>(null);
  const [revealed,       setRevealed]       = useState(false);
  const [showSummary,    setShowSummary]    = useState(false);
  const [batchCorrect,   setBatchCorrect]   = useState(0);
  const [score,          setScore]          = useState({ answered: 0, correct: 0, streak: 0, best: 0 });
  const [rootsCompleted, setRootsCompleted] = useState(0);
  const [srsInfo,        setSrsInfo]        = useState<{ mastery: number; dueLabel: string } | null>(null);

  // Build initial SRS-ordered queue
  useEffect(() => {
    const s = loadStats();
    statsRef.current = s;
    srsRef.current = loadSRS();
    setScore({ answered: s.totalAnswered, correct: s.totalCorrect, streak: s.currentStreak, best: s.bestStreak });
    loadNextRoot(buildSRSQueue(srsRef.current), 0);
  }, []);

  const loadNextRoot = useCallback((queue: VerbRoot[], completed: number) => {
    let q = queue;
    if (q.length === 0) {
      q = buildSRSQueue(srsRef.current);
    }
    const root       = q[0];
    const remaining  = q.slice(1);
    const newBatch   = buildRootBatch(root);

    if (newBatch.length === 0) {
      loadNextRoot(remaining, completed);
      return;
    }

    // SRS display info
    const rec = srsRef.current[root.id];
    const mastery = rec?.mastery ?? 0;
    const due = rec?.nextReview;
    let dueLabel = 'New';
    if (due) {
      const diff = due - Date.now();
      if (diff <= 0) dueLabel = 'Due';
      else if (diff < 86_400_000) dueLabel = 'Due today';
      else dueLabel = `Due in ${Math.ceil(diff / 86_400_000)}d`;
    }
    setSrsInfo({ mastery, dueLabel });

    rootQueueRef.current = remaining;
    setCurrentRoot(root);
    setBatch(newBatch);
    setBatchIdx(0);
    setSelected(null);
    setRevealed(false);
    setShowSummary(false);
    setBatchCorrect(0);
    setRootsCompleted(completed);
  }, []);

  const handleSelect = useCallback((optId: string) => {
    if (revealed || !batch[batchIdx]) return;
    setSelected(optId);
    setRevealed(true);

    const q         = batch[batchIdx];
    const isCorrect = optId === q.correctId;
    const stats     = statsRef.current;
    const newStreak = isCorrect ? stats.currentStreak + 1 : 0;
    const updated: QuizStats = {
      totalAnswered: stats.totalAnswered + 1,
      totalCorrect:  stats.totalCorrect + (isCorrect ? 1 : 0),
      currentStreak: newStreak,
      bestStreak:    Math.max(stats.bestStreak, newStreak),
      byType: {
        ...stats.byType,
        [q.type]: {
          answered: (stats.byType[q.type]?.answered ?? 0) + 1,
          correct:  (stats.byType[q.type]?.correct ?? 0) + (isCorrect ? 1 : 0),
        },
      },
    };
    statsRef.current = updated;
    saveStats(updated);
    setScore({ answered: updated.totalAnswered, correct: updated.totalCorrect, streak: newStreak, best: updated.bestStreak });
    if (isCorrect) setBatchCorrect(prev => prev + 1);
  }, [revealed, batch, batchIdx]);

  const handleNext = useCallback(() => {
    if (!revealed) return;
    const nextIdx = batchIdx + 1;
    if (nextIdx >= batch.length) {
      // Batch done — show summary
      setShowSummary(true);
    } else {
      setBatchIdx(nextIdx);
      setSelected(null);
      setRevealed(false);
    }
  }, [revealed, batchIdx, batch.length]);

  const handleNextRoot = useCallback(() => {
    // Update SRS for the just-completed root
    if (currentRoot) {
      const updated = updateSRS(srsRef.current, currentRoot.id, batchCorrect, batch.length);
      srsRef.current = updated;
      saveSRS(updated);
    }
    loadNextRoot(rootQueueRef.current, rootsCompleted + 1);
  }, [loadNextRoot, rootsCompleted, currentRoot, batchCorrect, batch.length]);

  // Swipe right = next after reveal
  useSwipeGesture({
    onSwipeRight: () => {
      if (showSummary) handleNextRoot();
      else if (revealed) handleNext();
    },
  });

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (showSummary) { handleNextRoot(); return; }
        if (revealed) { handleNext(); return; }
      }
      if (!revealed && !showSummary && batch[batchIdx]) {
        const keys = ['a','b','c','d'];
        const idx  = keys.indexOf(e.key.toLowerCase());
        if (idx >= 0 && idx < batch[batchIdx].options.length) {
          handleSelect(batch[batchIdx].options[idx].id);
        }
        const num = parseInt(e.key) - 1;
        if (num >= 0 && num < batch[batchIdx].options.length) {
          handleSelect(batch[batchIdx].options[num].id);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [revealed, showSummary, batch, batchIdx, handleSelect, handleNext, handleNextRoot]);

  if (!currentRoot || batch.length === 0) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 700, background: '#02050f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', fontFamily: 'system-ui, sans-serif' }}>
        Loading quiz...
      </div>
    );
  }

  const pct = score.answered > 0 ? Math.round((score.correct / score.answered) * 100) : 0;
  const q   = batch[batchIdx];
  const accentColor = q?.tenseType ? (TENSE_COLORS[q.tenseType] ?? '#4a9eff') : q?.type === 'bab' ? '#f97316' : '#4a9eff';

  // ── Summary screen ────────────────────────────────────────────────────────
  if (showSummary) {
    const perfect = batchCorrect === batch.length;
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 700, background: '#02050f',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '24px', fontFamily: 'system-ui, sans-serif', paddingBottom: '90px',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>{perfect ? '🌟' : batchCorrect >= batch.length / 2 ? '✅' : '📖'}</div>
        <div style={{ fontSize: '14px', color: '#555577', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Root Complete</div>
        <div style={{ fontSize: '52px', fontFamily: "'Scheherazade New', serif", color: '#fff', direction: 'rtl', textShadow: '0 0 20px rgba(255,153,0,0.4)', marginBottom: '6px' }}>
          {currentRoot.root}
        </div>
        <div style={{ fontSize: '18px', color: '#aabbdd', fontStyle: 'italic', marginBottom: '24px' }}>{currentRoot.meaning}</div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', padding: '14px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontSize: '26px', fontWeight: 700, color: perfect ? '#22c55e' : '#ffd700' }}>{batchCorrect}/{batch.length}</div>
            <div style={{ fontSize: '11px', color: '#555577', marginTop: '4px' }}>this root</div>
          </div>
          <div style={{ textAlign: 'center', padding: '14px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontSize: '26px', fontWeight: 700, color: '#f97316' }}>{score.streak} 🔥</div>
            <div style={{ fontSize: '11px', color: '#555577', marginTop: '4px' }}>streak</div>
          </div>
          <div style={{ textAlign: 'center', padding: '14px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontSize: '26px', fontWeight: 700, color: '#4a9eff' }}>{rootsCompleted + 1}</div>
            <div style={{ fontSize: '11px', color: '#555577', marginTop: '4px' }}>roots done</div>
          </div>
          {srsInfo && (
            <div style={{ textAlign: 'center', padding: '14px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ fontSize: '18px', letterSpacing: '2px' }}>{'★'.repeat(srsInfo.mastery + (perfect ? 1 : 0) > 5 ? 5 : srsInfo.mastery + (perfect ? 1 : 0))+'☆'.repeat(5 - Math.min(5, srsInfo.mastery + (perfect ? 1 : 0)))}</div>
              <div style={{ fontSize: '11px', color: '#555577', marginTop: '4px' }}>mastery</div>
            </div>
          )}
        </div>

        <button
          onClick={handleNextRoot}
          style={{
            padding: '16px 40px', borderRadius: '14px',
            background: 'rgba(74,158,255,0.15)', border: '1px solid rgba(74,158,255,0.35)',
            color: '#4a9eff', cursor: 'pointer', fontSize: '16px', fontWeight: 600,
            letterSpacing: '0.05em', transition: 'all 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(74,158,255,0.25)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(74,158,255,0.15)')}
        >
          Next Root → <span style={{ fontSize: '11px', opacity: 0.5, fontWeight: 400 }}>Enter / Swipe</span>
        </button>
      </div>
    );
  }

  // ── Question screen ───────────────────────────────────────────────────────
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 700, background: '#02050f',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      paddingBottom: '80px', overflowY: 'auto',
    }}>
      {/* Score bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Stat label="Score"  value={`${pct}%`}        color={pct >= 80 ? '#22c55e' : pct >= 60 ? '#ffd700' : '#ff6b6b'} />
          <Stat label="Streak" value={`${score.streak} 🔥`} color="#f97316" />
          <Stat label="Best"   value={String(score.best)}   color="#a855f7" />
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '11px', color: '#333355' }}>{score.answered} answered</div>
          <div style={{ fontSize: '10px', color: '#222244' }}>Root #{rootsCompleted + 1}</div>
        </div>
      </div>

      {/* Root + progress header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', flexShrink: 0,
        background: 'rgba(255,255,255,0.01)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontFamily: "'Scheherazade New', serif", fontSize: '28px', color: '#ffd700', direction: 'rtl' }}>
            {currentRoot.root}
          </span>
          <div>
            <span style={{ fontSize: '13px', color: '#666688', fontStyle: 'italic' }}>{currentRoot.meaning}</span>
            {srsInfo && (
              <div style={{ fontSize: '10px', color: srsInfo.dueLabel === 'New' ? '#4a9eff' : srsInfo.dueLabel === 'Due' ? '#f97316' : '#555577', marginTop: '2px' }}>
                {srsInfo.dueLabel} · {'★'.repeat(srsInfo.mastery)}{'☆'.repeat(5 - srsInfo.mastery)}
              </div>
            )}
          </div>
        </div>
        {/* Progress dots */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {batch.map((bq, i) => (
            <div
              key={i}
              style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: i < batchIdx
                  ? '#22c55e'
                  : i === batchIdx
                  ? accentColor
                  : 'rgba(255,255,255,0.1)',
                transition: 'all 0.2s',
              }}
            />
          ))}
          <span style={{ fontSize: '10px', color: '#333355', marginLeft: '4px' }}>
            {batchIdx + 1}/{batch.length}
          </span>
        </div>
      </div>

      {/* Question body */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', maxWidth: '640px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

        {/* Type badge */}
        <div style={{
          alignSelf: 'flex-start', marginBottom: '20px',
          fontSize: '11px', color: accentColor, letterSpacing: '0.15em',
          textTransform: 'uppercase', fontWeight: 700,
          background: accentColor + '15', padding: '4px 12px',
          borderRadius: '20px', border: `1px solid ${accentColor}33`,
        }}>
          {q.heading}
        </div>

        {/* Arabic display */}
        <div style={{
          fontSize: '68px', fontFamily: "'Scheherazade New', serif",
          color: '#ffffff', direction: 'rtl', textAlign: 'center',
          textShadow: `0 0 30px ${accentColor}55, 0 0 60px ${accentColor}22`,
          lineHeight: 1.3, marginBottom: '10px', letterSpacing: '6px',
        }}>
          {q.arabicDisplay}
        </div>

        {/* Subtitle */}
        <div style={{ fontSize: '13px', color: '#555577', textAlign: 'center', marginBottom: '6px' }}>
          {q.subtitle}
        </div>

        {/* Question */}
        <div style={{ fontSize: '16px', color: '#aabbdd', textAlign: 'center', marginBottom: '24px', fontWeight: 500 }}>
          {q.question}
        </div>

        {/* Options */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {q.options.map((opt, idx) => {
            const isSelected = selected === opt.id;
            const isCorrect  = opt.id === q.correctId;
            let bg     = 'rgba(255,255,255,0.03)';
            let border = 'rgba(255,255,255,0.08)';
            let color  = '#ccd';
            if (revealed) {
              if (isCorrect)                      { bg = 'rgba(34,197,94,0.14)';  border = '#22c55e66'; color = '#22c55e'; }
              else if (isSelected && !isCorrect)  { bg = 'rgba(239,68,68,0.12)';  border = '#ef444466'; color = '#ef4444'; }
            } else if (isSelected) {
              bg = accentColor + '18'; border = accentColor + '66'; color = accentColor;
            }
            return (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                disabled={revealed}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '14px 18px', borderRadius: '14px',
                  border: `1px solid ${border}`, background: bg, color,
                  cursor: revealed ? 'default' : 'pointer',
                  textAlign: 'left', transition: 'all 0.18s',
                  width: '100%', boxSizing: 'border-box',
                }}
              >
                <span style={{
                  width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
                  border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 700,
                }}>
                  {revealed && isCorrect ? '✓' : revealed && isSelected ? '✗' : ['A','B','C','D'][idx]}
                </span>
                <div style={{ flex: 1 }}>
                  {opt.arabic ? (
                    <div style={{ fontFamily: "'Scheherazade New', serif", fontSize: '28px', direction: 'rtl', lineHeight: 1.4 }}>
                      {opt.arabic}
                    </div>
                  ) : (
                    <div style={{ fontSize: '15px', fontWeight: 500 }}>{opt.text}</div>
                  )}
                  {opt.sub && <div style={{ fontSize: '11px', color: '#555577', marginTop: '2px' }}>{opt.sub}</div>}
                </div>
              </button>
            );
          })}
        </div>

        {/* After reveal: answer context + Next button */}
        {revealed && (
          <div style={{ width: '100%', marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{
              padding: '14px 16px', borderRadius: '12px',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              fontSize: '12px', color: '#666688', lineHeight: 1.8,
            }}>
              {q.type === 'meaning' && (
                <>
                  <span style={{ color: '#ffd700', fontFamily: "'Scheherazade New', serif", fontSize: '18px', direction: 'rtl' }}>{currentRoot.root}</span>
                  {' '}means: <span style={{ color: '#aabbdd' }}>{currentRoot.meaning}</span>
                </>
              )}
              {q.type === 'bab' && (
                <>
                  Pattern <span style={{ fontFamily: "'Scheherazade New', serif", fontSize: '18px', color: '#fff', direction: 'rtl' }}>{currentRoot.babs[0].arabicPattern}</span>
                  {' '}is <span style={{ color: '#f97316', fontWeight: 700 }}>Form {currentRoot.babs[0].romanNumeral}</span>
                  {' '}— {FORM_MEANINGS[currentRoot.babs[0].form] ?? ''}
                </>
              )}
              {q.type === 'conjugation' && q.tenseType && (() => {
                const cfg  = TENSE_CONFIG[q.tenseType];
                const bab  = currentRoot.babs[0];
                const tense = bab?.tenses.find(t => t.type === q.tenseType);
                const conj  = tense?.conjugation.find(c => c.person === cfg.person);
                return (
                  <>
                    <span style={{ color: TENSE_COLORS[q.tenseType], fontWeight: 600 }}>{cfg.label}</span> of{' '}
                    <span style={{ fontFamily: "'Scheherazade New', serif", fontSize: '18px', color: '#ffd700', direction: 'rtl' }}>{currentRoot.root}</span>
                    {' '}for {cfg.personLabel} is{' '}
                    <span style={{ fontFamily: "'Scheherazade New', serif", fontSize: '20px', color: '#fff', direction: 'rtl' }}>{conj?.arabic}</span>
                    {conj?.transliteration && conj.transliteration !== '-' && (
                      <span style={{ color: '#888' }}> ({conj.transliteration})</span>
                    )}
                  </>
                );
              })()}
            </div>

            <button
              onClick={handleNext}
              style={{
                padding: '14px', borderRadius: '14px',
                background: 'rgba(74,158,255,0.15)', border: '1px solid rgba(74,158,255,0.35)',
                color: '#4a9eff', cursor: 'pointer', fontSize: '15px', fontWeight: 600,
                transition: 'all 0.2s', letterSpacing: '0.04em',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(74,158,255,0.25)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(74,158,255,0.15)')}
            >
              {batchIdx + 1 < batch.length ? 'Next Question' : 'See Results'} →
              <span style={{ fontSize: '11px', opacity: 0.4, fontWeight: 400, marginLeft: '8px' }}>Enter / Swipe</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Small stat widget ─────────────────────────────────────────────────────────
const Stat: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div>
    <div style={{ fontSize: '10px', color: '#555577', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
    <div style={{ fontSize: '17px', fontWeight: 700, color }}>{value}</div>
  </div>
);
