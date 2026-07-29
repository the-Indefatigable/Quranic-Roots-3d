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
    // lang="ar" matters as much as dir here: without it a screen reader keeps
    // its English voice and pronounces Arabic letter-by-letter or as gibberish.
    <span
      dir="rtl"
      lang="ar"
      className={cn('font-arabic leading-relaxed', sizeMap[size], className)}
      {...props}
    >
      {children}
    </span>
  );
}
