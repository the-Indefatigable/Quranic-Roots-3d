'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArabicText } from '@/components/ui/ArabicText';
import { Badge } from '@/components/ui/Badge';
import { TenseAccordion } from './ConjugationGrid';

interface FormData {
  id: string;
  formNumber: string;
  arabicPattern: string;
  meaning: string;
  verbMeaning: string;
  semanticMeaning: string;
  masdar: string;
  faaeil: string;
  mafool: string;
  tenses: {
    type: string;
    arabicName: string;
    englishName: string;
    occurrences: number;
    conjugation: { person: string; arabic: string; transliteration: string }[];
  }[];
}

export function RootDetailClient({ forms }: { forms: FormData[] }) {
  const [openForm, setOpenForm] = useState<string | null>(forms[0]?.id || null);

  return (
    <div className="space-y-3">
      {forms.map((form) => {
        const isOpen = openForm === form.id;
        const totalOccurrences = form.tenses.reduce((sum, t) => sum + t.occurrences, 0);

        return (
          <div
            key={form.id}
            className="bg-white/[0.02] border border-white/[0.04] rounded-2xl overflow-hidden"
          >
            {/* Form header */}
            <button
              onClick={() => setOpenForm(isOpen ? null : form.id)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gold-dim">
                  <span className="text-xs text-gold font-semibold">{form.formNumber}</span>
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <ArabicText size="xl" className="text-white">{form.arabicPattern}</ArabicText>
                    {form.masdar && (
                      <ArabicText size="base" className="text-gold/60">{form.masdar}</ArabicText>
                    )}
                  </div>
                  <p className="text-xs text-muted mt-0.5 line-clamp-1">
                    {form.verbMeaning || form.meaning || form.semanticMeaning}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {totalOccurrences > 0 && (
                  <Badge variant="amber">{totalOccurrences}x</Badge>
                )}
                <svg
                  className={`w-4 h-4 text-muted-more transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </button>

            {/* Expanded content */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 border-t border-white/[0.04]">
                    {/* Form details */}
                    <div className="flex flex-wrap gap-x-8 gap-y-3 py-4 text-sm">
                      {form.meaning && (
                        <div>
                          <span className="text-[10px] text-muted-more uppercase tracking-wider block mb-0.5">Meaning</span>
                          <span className="text-white/70">{form.meaning}</span>
                        </div>
                      )}
                      {form.masdar && (
                        <div>
                          <span className="text-[10px] text-muted-more uppercase tracking-wider block mb-0.5">Masdar</span>
                          <ArabicText size="base" className="text-gold">{form.masdar}</ArabicText>
                        </div>
                      )}
                      {form.faaeil && (
                        <div>
                          <span className="text-[10px] text-muted-more uppercase tracking-wider block mb-0.5">Active Part.</span>
                          <ArabicText size="base" className="text-white/70">{form.faaeil}</ArabicText>
                        </div>
                      )}
                      {form.mafool && (
                        <div>
                          <span className="text-[10px] text-muted-more uppercase tracking-wider block mb-0.5">Passive Part.</span>
                          <ArabicText size="base" className="text-white/70">{form.mafool}</ArabicText>
                        </div>
                      )}
                    </div>

                    {/* Tense conjugation grids */}
                    {form.tenses.length > 0 && (
                      <TenseAccordion tenses={form.tenses} />
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
