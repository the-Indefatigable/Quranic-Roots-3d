'use client';

import { motion } from 'framer-motion';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, subtitle, eyebrow, children }: PageHeaderProps) {
  return (
    <motion.div
      className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div>
        {eyebrow && (
          <div
            className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: 'var(--color-primary)' }}
          >
            {eyebrow}
          </div>
        )}
        <h1
          className="text-3xl sm:text-4xl font-heading tracking-tight leading-[1.05]"
          style={{ color: 'var(--color-ivory)', textShadow: 'var(--glow-ivory)' }}
        >{title}</h1>
        {subtitle && (
          <motion.p
            className="mt-2 text-sm sm:text-[15px] text-text-secondary max-w-xl leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.3 }}
          >
            {subtitle}
          </motion.p>
        )}
      </div>
      {children && (
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          {children}
        </motion.div>
      )}
    </motion.div>
  );
}
