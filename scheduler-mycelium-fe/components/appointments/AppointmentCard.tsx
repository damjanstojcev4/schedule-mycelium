import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { Appointment } from '@/types/api';
import { formatDate, formatTime } from '@/lib/format';

interface AppointmentCardProps {
  appointment: Appointment;
  /** Customer-facing mode: shows business name instead of customer name */
  customerView?: boolean;
  onCancel?: (publicId: string) => void;
  onComplete?: (publicId: string) => void;
  loading?: boolean;
}

export function AppointmentCard({
  appointment: appt,
  customerView = false,
  onCancel,
  onComplete,
  loading,
}: AppointmentCardProps) {
  const dateObj = new Date(appt.startTime);
  const dayNum = dateObj.getDate();
  const monthShort = dateObj.toLocaleDateString('en-GB', { month: 'short' });
  const dayShort = dateObj.toLocaleDateString('en-GB', { weekday: 'short' });

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden transition-all duration-200 hover:shadow-md">
      <div className="flex items-stretch">
        {/* Date column */}
        <div className="flex flex-col items-center justify-center px-4 py-4 bg-zinc-950 min-w-[64px] shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{dayShort}</span>
          <span className="text-2xl font-black text-white leading-none mt-0.5">{dayNum}</span>
          <span className="text-[10px] font-semibold text-zinc-500 mt-0.5 uppercase">{monthShort}</span>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0 px-4 py-4">
          {/* Service + badge */}
          <div className="flex items-start justify-between gap-2">
            <p className="font-bold text-zinc-900 text-base leading-tight">{appt.serviceName}</p>
            <Badge status={appt.status} />
          </div>

          {/* Who */}
          {customerView ? (
            <p className="mt-1 text-sm font-semibold text-zinc-700">{appt.businessName}</p>
          ) : (
            <p className="mt-1 text-sm text-zinc-600">
              {appt.customerName || appt.guestName}
              {appt.guestName && !appt.customerName && (
                <span className="text-xs text-zinc-400 font-medium ml-1">(guest)</span>
              )}
            </p>
          )}

          {/* Staff (customer view) */}
          {customerView && appt.staffName && (
            <p className="mt-0.5 text-sm text-zinc-500">with {appt.staffName}</p>
          )}

          {/* Time */}
          <div className="mt-2 flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-semibold text-zinc-500">
              {formatTime(appt.startTime)} – {formatTime(appt.endTime)}
            </span>
          </div>

          {/* Notes */}
          {appt.notes && (
            <div className="mt-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
              <p className="text-xs text-amber-800 italic">{appt.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {appt.status === 'BOOKED' && (onCancel ?? onComplete) && (
        <div className="border-t border-zinc-100 px-4 py-3 flex gap-2">
          {onComplete && (
            <Button
              id={`complete-card-${appt.publicId}`}
              size="sm"
              variant="secondary"
              loading={loading}
              onClick={() => onComplete(appt.publicId)}
            >
              Mark complete
            </Button>
          )}
          {onCancel && (
            <Button
              id={`cancel-card-${appt.publicId}`}
              size="sm"
              variant="destructive"
              loading={loading}
              onClick={() => onCancel(appt.publicId)}
            >
              Cancel
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
