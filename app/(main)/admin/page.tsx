'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

type Tab = 'roots' | 'nouns' | 'particles';

interface ConjugationEntry {
  person: string;
  arabic: string;
  transliteration?: string;
}

interface TenseData {
  id: string;
  formId: string;
  type: string;
  arabicName: string;
  englishName: string;
  conjugations: ConjugationEntry[];
}

interface FormData {
  id: string;
  rootId: string;
  formNumber: string;
  arabicPattern: string;
  meaning: string | null;
  semanticMeaning: string | null;
  verbMeaning: string | null;
  masdar: string | null;
  faaeil: string | null;
  mafool: string | null;
  tenses: TenseData[];
}

interface RootItem {
  id: string;
  root: string;
  meaning: string;
  totalFreq: number;
  forms: FormData[];
}

interface NounItem {
  id: string;
  lemma: string;
  lemmaClean: string;
  type: string;
  typeAr: string | null;
  baab: string | null;
  meaning: string | null;
  totalFreq: number;
}

interface ParticleItem {
  id: string;
  form: string;
  formBuckwalter: string;
  type: string;
  meaning: string | null;
  frequency: number;
}

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();
  const [tab, setTab] = useState<Tab>('roots');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ tab, q: query, page: String(page) });
      const res = await fetch(`/api/admin/search?${params}`);
      if (!res.ok) {
        if (res.status === 401) {
          setItems([]);
          return;
        }
        throw new Error('Failed to fetch');
      }
      const data = await res.json();
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      console.error('Admin search error:', err);
    } finally {
      setLoading(false);
    }
  }, [tab, query, page]);

  const isAdmin = !authLoading && user?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [fetchData, isAdmin]);

  useEffect(() => {
    setPage(1);
    setExpandedId(null);
  }, [tab]);

  const handleSearch = (value: string) => {
    setQuery(value);
    setPage(1);
    setExpandedId(null);
  };

  const debouncedSearch = (value: string) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => handleSearch(value), 300);
  };

  const saveField = async (table: string, id: string, updates: Record<string, any>) => {
    setSaving(id);
    try {
      const res = await fetch('/api/admin/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table, id, updates }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setToast('Saved');
      setTimeout(() => setToast(null), 2000);

      // Refresh data
      await fetchData();
    } catch (err: any) {
      setToast(`Error: ${err.message}`);
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSaving(null);
    }
  };

  const totalPages = Math.ceil(total / 30);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 mb-4">Admin access required</p>
          <button onClick={() => router.push('/')} className="text-gold hover:underline">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 px-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Admin Editor</h1>
        <p className="text-sm text-white/40">Edit roots, nouns, particles, forms & conjugations</p>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-sm font-medium shadow-lg ${
            toast.startsWith('Error') ? 'bg-red-500/90 text-white' : 'bg-emerald-500/90 text-white'
          }`}
        >
          {toast}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-white/[0.04] rounded-xl p-1">
        {(['roots', 'nouns', 'particles'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all capitalize ${
              tab === t
                ? 'bg-gold/20 text-gold'
                : 'text-white/50 hover:text-white/70'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder={`Search ${tab}...`}
          onChange={(e) => debouncedSearch(e.target.value)}
          className="w-full bg-card border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-gold/40"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Results count + Pagination */}
      <div className="flex items-center justify-between mb-3 text-xs text-white/40">
        <span>{total} results</span>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2 py-1 rounded bg-white/[0.06] disabled:opacity-30 hover:bg-white/[0.1]"
            >
              Prev
            </button>
            <span>
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-2 py-1 rounded bg-white/[0.06] disabled:opacity-30 hover:bg-white/[0.1]"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Items List */}
      <div className="space-y-2">
        {items.map((item: any) => (
          <div key={item.id} className="bg-card border border-white/[0.08] rounded-xl overflow-hidden">
            {/* Row header - clickable to expand */}
            <button
              onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
              className="w-full text-left px-4 py-3 flex items-center gap-4 hover:bg-white/[0.02] transition-colors"
            >
              <span
                className={`text-[10px] transition-transform ${
                  expandedId === item.id ? 'rotate-90' : ''
                }`}
              >
                ▶
              </span>

              {tab === 'roots' && (
                <>
                  <span className="text-lg font-arabic text-gold min-w-[80px]">{item.root}</span>
                  <span className="text-white/70 text-sm flex-1 truncate">{item.meaning}</span>
                  <span className="text-white/30 text-xs">{item.forms?.length || 0} forms</span>
                  <span className="text-white/20 text-xs">freq: {item.totalFreq}</span>
                </>
              )}
              {tab === 'nouns' && (
                <>
                  <span className="text-lg font-arabic text-gold min-w-[80px]">{item.lemma}</span>
                  <span className="text-white/70 text-sm flex-1 truncate">{item.meaning || '—'}</span>
                  <span className="text-white/30 text-xs">{item.type}</span>
                </>
              )}
              {tab === 'particles' && (
                <>
                  <span className="text-lg font-arabic text-gold min-w-[80px]">{item.form}</span>
                  <span className="text-white/70 text-sm flex-1 truncate">{item.meaning || '—'}</span>
                  <span className="text-white/30 text-xs">{item.type}</span>
                </>
              )}
            </button>

            {/* Expanded editor */}
            {expandedId === item.id && (
              <div className="border-t border-white/[0.06] px-4 py-4">
                {tab === 'roots' && (
                  <RootEditor root={item} onSave={saveField} saving={saving} />
                )}
                {tab === 'nouns' && (
                  <NounEditor noun={item} onSave={saveField} saving={saving} />
                )}
                {tab === 'particles' && (
                  <ParticleEditor particle={item} onSave={saveField} saving={saving} />
                )}
              </div>
            )}
          </div>
        ))}

        {!loading && items.length === 0 && (
          <div className="text-center py-12 text-white/30">No results found</div>
        )}
      </div>
    </div>
  );
}

// ── Inline Field Component ──────────────────────────

function InlineField({
  label,
  value,
  onChange,
  arabic,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  arabic?: boolean;
  multiline?: boolean;
}) {
  const base =
    'w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold/40';
  const fontClass = arabic ? 'font-arabic text-right text-lg' : '';

  return (
    <div>
      <label className="block text-[11px] uppercase tracking-wider text-white/30 mb-1">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          className={`${base} ${fontClass} resize-y`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${base} ${fontClass}`}
        />
      )}
    </div>
  );
}

function SaveButton({
  onClick,
  saving,
  id,
}: {
  onClick: () => void;
  saving: string | null;
  id: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={saving === id}
      className="px-4 py-2 bg-gold/20 text-gold rounded-lg text-sm font-medium hover:bg-gold/30 transition-colors disabled:opacity-50"
    >
      {saving === id ? 'Saving...' : 'Save Changes'}
    </button>
  );
}

// ── Root Editor ─────────────────────────────────────

function RootEditor({
  root,
  onSave,
  saving,
}: {
  root: RootItem;
  onSave: (table: string, id: string, updates: Record<string, any>) => void;
  saving: string | null;
}) {
  const [meaning, setMeaning] = useState(root.meaning || '');
  const [rootText, setRootText] = useState(root.root || '');

  return (
    <div className="space-y-6">
      {/* Root fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <InlineField label="Root (Arabic)" value={rootText} onChange={setRootText} arabic />
        <InlineField label="Meaning" value={meaning} onChange={setMeaning} />
      </div>
      <SaveButton
        onClick={() => onSave('roots', root.id, { root: rootText, meaning })}
        saving={saving}
        id={root.id}
      />

      {/* Forms */}
      {root.forms?.map((form) => (
        <FormEditor key={form.id} form={form} onSave={onSave} saving={saving} />
      ))}
    </div>
  );
}

// ── Form Editor ─────────────────────────────────────

function FormEditor({
  form,
  onSave,
  saving,
}: {
  form: FormData;
  onSave: (table: string, id: string, updates: Record<string, any>) => void;
  saving: string | null;
}) {
  const [meaning, setMeaning] = useState(form.meaning || '');
  const [semanticMeaning, setSemanticMeaning] = useState(form.semanticMeaning || '');
  const [verbMeaning, setVerbMeaning] = useState(form.verbMeaning || '');
  const [arabicPattern, setArabicPattern] = useState(form.arabicPattern || '');
  const [masdar, setMasdar] = useState(form.masdar || '');
  const [faaeil, setFaaeil] = useState(form.faaeil || '');
  const [mafool, setMafool] = useState(form.mafool || '');
  const [showTenses, setShowTenses] = useState(false);

  return (
    <div className="border border-white/[0.06] rounded-xl p-4 bg-white/[0.02]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white/70">
          Form {form.formNumber}{' '}
          <span className="font-arabic text-gold ml-2">{form.arabicPattern}</span>
        </h3>
        <button
          onClick={() => setShowTenses(!showTenses)}
          className="text-xs text-white/40 hover:text-white/60"
        >
          {showTenses ? 'Hide' : 'Show'} Tenses ({form.tenses?.length || 0})
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <InlineField label="Arabic Pattern" value={arabicPattern} onChange={setArabicPattern} arabic />
        <InlineField label="Meaning" value={meaning} onChange={setMeaning} />
        <InlineField label="Semantic Meaning" value={semanticMeaning} onChange={setSemanticMeaning} />
        <InlineField label="Verb Meaning" value={verbMeaning} onChange={setVerbMeaning} />
        <InlineField label="Masdar" value={masdar} onChange={setMasdar} arabic />
        <InlineField label="Faa'il" value={faaeil} onChange={setFaaeil} arabic />
        <InlineField label="Maf'ool" value={mafool} onChange={setMafool} arabic />
      </div>

      <SaveButton
        onClick={() =>
          onSave('forms', form.id, {
            meaning,
            semanticMeaning,
            verbMeaning,
            arabicPattern,
            masdar,
            faaeil,
            mafool,
          })
        }
        saving={saving}
        id={form.id}
      />

      {/* Tenses */}
      {showTenses &&
        form.tenses?.map((tense) => (
          <TenseEditor key={tense.id} tense={tense} onSave={onSave} saving={saving} />
        ))}
    </div>
  );
}

// ── Tense + Conjugation Editor ──────────────────────

function TenseEditor({
  tense,
  onSave,
  saving,
}: {
  tense: TenseData;
  onSave: (table: string, id: string, updates: Record<string, any>) => void;
  saving: string | null;
}) {
  const [englishName, setEnglishName] = useState(tense.englishName || '');
  const [arabicName, setArabicName] = useState(tense.arabicName || '');
  const conjugationsList = Array.isArray(tense.conjugations) ? tense.conjugations : [];
  const [conjugations, setConjugations] = useState<ConjugationEntry[]>(conjugationsList);

  const updateConjugation = (index: number, field: keyof ConjugationEntry, value: string) => {
    setConjugations((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const PERSON_LABELS: Record<string, string> = {
    '1s': 'I',
    '2ms': 'you (m.s.)',
    '2fs': 'you (f.s.)',
    '3ms': 'he',
    '3fs': 'she',
    '1p': 'we',
    '2mp': 'you (m.p.)',
    '2fp': 'you (f.p.)',
    '3mp': 'they (m.)',
    '3fp': 'they (f.)',
  };

  return (
    <div className="mt-4 border border-white/[0.04] rounded-lg p-3 bg-white/[0.01]">
      <h4 className="text-xs font-semibold text-white/50 mb-3">
        {tense.type.toUpperCase()} — <span className="font-arabic text-gold">{tense.arabicName}</span>
      </h4>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <InlineField label="English Name" value={englishName} onChange={setEnglishName} />
        <InlineField label="Arabic Name" value={arabicName} onChange={setArabicName} arabic />
      </div>

      {/* Conjugations grid */}
      {conjugations.length > 0 && (
        <div className="space-y-1.5 mb-3">
          <label className="block text-[11px] uppercase tracking-wider text-white/30">
            Conjugations
          </label>
          <div className="grid gap-1.5">
            {conjugations.map((conj, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[11px] text-white/30 w-20 shrink-0">
                  {PERSON_LABELS[conj.person] || conj.person}
                </span>
                <input
                  type="text"
                  value={conj.arabic}
                  onChange={(e) => updateConjugation(i, 'arabic', e.target.value)}
                  className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded px-2 py-1.5 text-sm font-arabic text-right text-white focus:outline-none focus:border-gold/40"
                />
                <input
                  type="text"
                  value={conj.transliteration || ''}
                  onChange={(e) => updateConjugation(i, 'transliteration', e.target.value)}
                  placeholder="translit."
                  className="w-32 bg-white/[0.04] border border-white/[0.08] rounded px-2 py-1.5 text-sm text-white/60 focus:outline-none focus:border-gold/40"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <SaveButton
        onClick={() =>
          onSave('tenses', tense.id, {
            englishName,
            arabicName,
            conjugations,
          })
        }
        saving={saving}
        id={tense.id}
      />
    </div>
  );
}

// ── Noun Editor ─────────────────────────────────────

function NounEditor({
  noun,
  onSave,
  saving,
}: {
  noun: NounItem;
  onSave: (table: string, id: string, updates: Record<string, any>) => void;
  saving: string | null;
}) {
  const [lemma, setLemma] = useState(noun.lemma || '');
  const [lemmaClean, setLemmaClean] = useState(noun.lemmaClean || '');
  const [meaning, setMeaning] = useState(noun.meaning || '');
  const [type, setType] = useState(noun.type || '');
  const [typeAr, setTypeAr] = useState(noun.typeAr || '');
  const [baab, setBaab] = useState(noun.baab || '');

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <InlineField label="Lemma (Arabic)" value={lemma} onChange={setLemma} arabic />
        <InlineField label="Lemma Clean" value={lemmaClean} onChange={setLemmaClean} arabic />
        <InlineField label="Meaning" value={meaning} onChange={setMeaning} />
        <InlineField label="Type" value={type} onChange={setType} />
        <InlineField label="Type (Arabic)" value={typeAr} onChange={setTypeAr} arabic />
        <InlineField label="Baab" value={baab} onChange={setBaab} />
      </div>
      <SaveButton
        onClick={() =>
          onSave('nouns', noun.id, { lemma, lemmaClean, meaning, type, typeAr, baab })
        }
        saving={saving}
        id={noun.id}
      />
    </div>
  );
}

// ── Particle Editor ─────────────────────────────────

function ParticleEditor({
  particle,
  onSave,
  saving,
}: {
  particle: ParticleItem;
  onSave: (table: string, id: string, updates: Record<string, any>) => void;
  saving: string | null;
}) {
  const [form, setForm] = useState(particle.form || '');
  const [meaning, setMeaning] = useState(particle.meaning || '');
  const [type, setType] = useState(particle.type || '');

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <InlineField label="Form (Arabic)" value={form} onChange={setForm} arabic />
        <InlineField label="Meaning" value={meaning} onChange={setMeaning} />
        <InlineField label="Type" value={type} onChange={setType} />
      </div>
      <SaveButton
        onClick={() => onSave('particles', particle.id, { form, meaning, type })}
        saving={saving}
        id={particle.id}
      />
    </div>
  );
}
