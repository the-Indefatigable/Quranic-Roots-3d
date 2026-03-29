'use client';

import { motion } from 'framer-motion';

interface TeachContent {
  title?: string;
  explanation?: string;
  arabic?: string;
  transliteration?: string;
  examples?: Array<{ ar: string; tr: string; en: string }>;
  quran_ref?: string | null;
  fun_fact?: string | null;
}

interface TeachStepProps {
  content: Record<string, unknown>;
  onContinue: () => void;
}

/**
 * Renders simple markdown to JSX:
 * - **bold** → <strong>
 * - *italic* → <em>
 * - \n\n → paragraph breaks
 * - \n → line breaks
 * - - item / * item → bullet lists
 * - 1. item → ordered lists
 */
function renderMarkdown(text: string) {
  // Split into paragraphs
  const paragraphs = text.split(/\n\n+/);
  
  return paragraphs.map((para, pIdx) => {
    const trimmed = para.trim();
    if (!trimmed) return null;

    // Check if this paragraph is a list
    const lines = trimmed.split('\n');
    const isUnordered = lines.every(l => /^[-*•] /.test(l.trim()) || l.trim() === '');
    const isOrdered = lines.every(l => /^\d+\. /.test(l.trim()) || l.trim() === '');

    if (isUnordered) {
      return (
        <ul key={pIdx} className="space-y-2 text-left my-3">
          {lines.filter(l => l.trim()).map((line, i) => (
            <li key={i} className="flex gap-2.5 text-sm text-white/70 leading-relaxed">
              <span className="text-primary mt-0.5 shrink-0">•</span>
              <span>{renderInline(line.replace(/^[-*•]\s*/, ''))}</span>
            </li>
          ))}
        </ul>
      );
    }

    if (isOrdered) {
      return (
        <ol key={pIdx} className="space-y-2 text-left my-3">
          {lines.filter(l => l.trim()).map((line, i) => (
            <li key={i} className="flex gap-2.5 text-sm text-white/70 leading-relaxed">
              <span className="text-primary font-bold mt-0.5 shrink-0 w-5 text-center">{i + 1}</span>
              <span>{renderInline(line.replace(/^\d+\.\s*/, ''))}</span>
            </li>
          ))}
        </ol>
      );
    }

    // Regular paragraph — may contain line breaks
    return (
      <p key={pIdx} className="text-sm text-white/70 leading-relaxed my-2">
        {lines.map((line, lIdx) => (
          <span key={lIdx}>
            {lIdx > 0 && <br />}
            {renderInline(line)}
          </span>
        ))}
      </p>
    );
  });
}

function renderInline(text: string) {
  // Process **bold** and *italic* and `code`
  const parts: (string | React.ReactNode)[] = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining.length > 0) {
    // Bold: **text**
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    if (boldMatch && boldMatch.index !== undefined) {
      if (boldMatch.index > 0) {
        parts.push(remaining.slice(0, boldMatch.index));
      }
      parts.push(<strong key={keyIdx++} className="text-white font-semibold">{boldMatch[1]}</strong>);
      remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
      continue;
    }

    // Emoji-prefixed items (🎵, 🤗, etc.) — make them stand out
    // Just push the rest as-is
    parts.push(remaining);
    break;
  }

  return <>{parts}</>;
}

export function TeachStep({ content, onContinue }: TeachStepProps) {
  const data = content as unknown as TeachContent;

  return (
    <div className="flex flex-col items-center gap-5 max-w-md w-full">
      {data.title && (
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl sm:text-2xl font-bold text-white text-center leading-snug"
        >
          {data.title}
        </motion.h2>
      )}

      {data.explanation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="w-full px-1 text-center"
        >
          {renderMarkdown(data.explanation)}
        </motion.div>
      )}

      {data.arabic && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="py-4"
        >
          <p className="text-5xl font-arabic text-[#58CC02] mb-2">{data.arabic}</p>
          {data.transliteration && (
            <p className="text-lg text-white/50 italic">{data.transliteration}</p>
          )}
        </motion.div>
      )}

      {data.examples && data.examples.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full space-y-3"
        >
          {data.examples.map((ex, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-5 py-3 rounded-xl bg-surface border border-border"
            >
              <div className="text-left">
                <span className="text-sm text-white/50">{ex.en}</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-arabic text-white">{ex.ar}</span>
                <span className="text-sm text-white/40 italic ml-2">{ex.tr}</span>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {data.quran_ref && (
        <p className="text-xs text-[#1CB0F6]">📖 Quran {data.quran_ref}</p>
      )}

      {data.fun_fact && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="px-4 py-3 rounded-xl bg-[#FFC800]/10 border border-[#FFC800]/20 text-sm text-[#FFC800]"
        >
          💡 {data.fun_fact}
        </motion.div>
      )}

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        onClick={onContinue}
        className="w-full max-w-xs py-4 rounded-2xl bg-[#58CC02] text-white font-bold text-lg shadow-[0_4px_0_#46a302] hover:shadow-[0_2px_0_#46a302] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all mt-2"
      >
        Continue
      </motion.button>
    </div>
  );
}
