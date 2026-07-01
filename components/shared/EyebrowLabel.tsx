import { cn } from '@/lib/utils';

interface EyebrowLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function EyebrowLabel({ children, className }: EyebrowLabelProps) {
  return (
    <p
      className={cn(
        'font-mono text-xs uppercase tracking-[0.18em] text-[#b5904f]',
        className
      )}
    >
      {children}
    </p>
  );
}
