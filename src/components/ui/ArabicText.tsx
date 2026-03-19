import { cn } from '@/lib/cn';

interface ArabicTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  size?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
}

const sizeMap = {
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
};

export function ArabicText({ children, size = 'xl', className, ...props }: ArabicTextProps) {
  return (
    <span
      dir="rtl"
      className={cn('font-arabic leading-relaxed', sizeMap[size], className)}
      {...props}
    >
      {children}
    </span>
  );
}
