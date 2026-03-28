import { cn } from '@/lib/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'emerald' | 'amber' | 'red' | 'sky' | 'stone';
  className?: string;
}

const variants = {
  default: 'bg-canvas text-text-secondary',
  emerald: 'bg-correct-light text-correct',
  amber: 'bg-accent-light text-accent',
  red: 'bg-wrong-light text-wrong',
  sky: 'bg-info-light text-info',
  stone: 'bg-border-light text-text-tertiary',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  );
}
