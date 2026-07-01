import { cn } from '@/lib/utils';

type Status =
  | 'confirmed'
  | 'pending'
  | 'pending_approval'
  | 'in_progress'
  | 'in_chair'
  | 'checked_in'
  | 'cancelled'
  | 'no_show'
  | 'draft'
  | 'completed'
  | 'active'
  | 'archived'
  | (string & {});

const statusConfig: Record<string, { label: string; className: string }> = {
  confirmed:        { label: 'Confirmed',        className: 'bg-green-100 text-green-800' },
  pending:          { label: 'Pending',           className: 'bg-amber-100 text-amber-800' },
  pending_approval: { label: 'Pending approval',  className: 'bg-amber-100 text-amber-800' },
  in_progress:      { label: 'In progress',       className: 'bg-blue-100 text-blue-800' },
  in_chair:         { label: 'In chair',          className: 'bg-blue-100 text-blue-800' },
  checked_in:       { label: 'Checked in',        className: 'bg-blue-100 text-blue-800' },
  cancelled:        { label: 'Cancelled',         className: 'bg-red-100 text-red-700' },
  no_show:          { label: 'No show',           className: 'bg-red-100 text-red-700' },
  draft:            { label: 'Draft',             className: 'bg-gray-100 text-gray-600' },
  archived:         { label: 'Archived',          className: 'bg-gray-100 text-gray-500' },
  completed:        { label: 'Completed',         className: 'bg-[#2e2823] text-[#FAF6EF]' },
  active:           { label: 'Active',            className: 'bg-green-100 text-green-800' },
};

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: status,
    className: 'bg-gray-100 text-gray-600',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
