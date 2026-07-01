import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[#b5904f]/15 text-[#b5904f]',
        green: 'bg-green-100 text-green-800',
        amber: 'bg-amber-100 text-amber-800',
        blue: 'bg-blue-100 text-blue-800',
        red: 'bg-red-100 text-red-700',
        grey: 'bg-gray-100 text-gray-600',
        dark: 'bg-[#2e2823] text-[#FAF6EF]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
