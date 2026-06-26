type AppointmentStatus = 'BOOKED' | 'CANCELLED' | 'COMPLETED';

const statusConfig: Record<AppointmentStatus, { label: string; dot: string; pill: string }> = {
  BOOKED: {
    label: 'Confirmed',
    dot: 'bg-blue-500',
    pill: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  },
  COMPLETED: {
    label: 'Completed',
    dot: 'bg-emerald-500',
    pill: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  },
  CANCELLED: {
    label: 'Cancelled',
    dot: 'bg-zinc-400',
    pill: 'bg-zinc-100 text-zinc-500 ring-1 ring-zinc-200',
  },
};

interface BadgeProps {
  status: AppointmentStatus;
  size?: 'sm' | 'md';
}

export function Badge({ status, size = 'sm' }: BadgeProps) {
  const config = statusConfig[status] ?? {
    label: status,
    dot: 'bg-zinc-400',
    pill: 'bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200',
  };

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        config.pill,
      ].join(' ')}
    >
      <span className={['rounded-full shrink-0', config.dot, size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2'].join(' ')} />
      {config.label}
    </span>
  );
}

// Generic text badge
interface TextBadgeProps {
  label: string;
  variant?: 'default' | 'blue' | 'green' | 'red' | 'yellow' | 'purple';
}

const textBadgeVariants: Record<string, string> = {
  default: 'bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200',
  blue:    'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  green:   'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  red:     'bg-red-50 text-red-700 ring-1 ring-red-200',
  yellow:  'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  purple:  'bg-violet-50 text-violet-700 ring-1 ring-violet-200',
};

export function TextBadge({ label, variant = 'default' }: TextBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${textBadgeVariants[variant]}`}>
      {label}
    </span>
  );
}
