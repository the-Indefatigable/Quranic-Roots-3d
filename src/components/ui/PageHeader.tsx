'use client';

import { motion } from 'framer-motion';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <motion.div
      className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div>
        <h1
          className="text-2xl sm:text-3xl font-heading tracking-tight"
          style={{ color: '#F0E4CA', textShadow: '0 0 40px rgba(212,162,70,0.15)' }}
        >{title}</h1>
        {subtitle && (
          <motion.p
            className="mt-1.5 text-sm text-text-secondary"
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
