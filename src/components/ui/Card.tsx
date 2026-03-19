import { cn } from '@/lib/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
}

export function Card({ children, hover = true, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-card border border-border rounded-2xl p-5',
        hover && 'transition-colors hover:border-white/[0.12] hover:bg-elevated',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
