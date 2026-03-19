import { cn } from '@/lib/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'gold' | 'emerald';
  className?: string;
}

const variants = {
  default: 'bg-white/[0.06] text-muted',
  gold: 'bg-gold-dim text-gold',
  emerald: 'bg-emerald/10 text-emerald',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  );
}
