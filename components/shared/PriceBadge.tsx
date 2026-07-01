import { cn } from '@/lib/utils';

interface PriceBadgeProps {
  percent: number;
  className?: string;
}

export function PriceBadge({ percent, className }: PriceBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-green-100 text-green-700 px-2.5 py-0.5 text-xs font-medium',
        className
      )}
    >
      Save {percent}%
    </span>
  );
}
