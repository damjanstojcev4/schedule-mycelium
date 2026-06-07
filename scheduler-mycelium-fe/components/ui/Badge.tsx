type AppointmentStatus = 'BOOKED' | 'CANCELLED' | 'COMPLETED';

const statusConfig: Record<
  AppointmentStatus,
  { label: string; className: string }
> = {
  BOOKED: {
    label: 'Booked',
    className: 'bg-gray-100 text-black',
  },
  COMPLETED: {
    label: 'Completed',
    className: 'bg-green-100 text-green-700',
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-red-100 text-red-700',
  },
};

interface BadgeProps {
  status: AppointmentStatus;
}

export function Badge({ status }: BadgeProps) {
  const config = statusConfig[status] ?? {
    label: status,
    className: 'bg-gray-100 text-gray-700',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

// Generic text badge for roles / categories
interface TextBadgeProps {
  label: string;
  variant?: 'gray' | 'blue' | 'green' | 'red' | 'yellow';
}

const textBadgeVariants: Record<string, string> = {
  gray: 'bg-gray-100 text-gray-700',
  blue: 'bg-gray-100 text-black',
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
  yellow: 'bg-yellow-100 text-yellow-700',
};

export function TextBadge({ label, variant = 'gray' }: TextBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${textBadgeVariants[variant]}`}
    >
      {label}
    </span>
  );
}
