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
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Service + status badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900">{appt.serviceName}</span>
            <Badge status={appt.status} />
          </div>

          {/* Business name (customer view) or customer name (dashboard view) */}
          {customerView ? (
            <p className="mt-1 text-sm font-medium text-gray-700">{appt.businessName}</p>
          ) : (
            <p className="mt-1 text-sm text-gray-600">
              {appt.customerName} · with {appt.staffName}
            </p>
          )}

          {/* Staff name in customer view */}
          {customerView && appt.staffName && (
            <p className="mt-0.5 text-sm text-gray-500">with {appt.staffName}</p>
          )}

          {/* Date + time */}
          <p className="mt-1 text-sm text-gray-400">
            {formatDate(appt.startTime)} · {formatTime(appt.startTime)}–{formatTime(appt.endTime)}
          </p>

          {appt.notes && (
            <p className="mt-2 text-xs text-gray-400 italic border-l-2 border-gray-200 pl-2">
              {appt.notes}
            </p>
          )}
        </div>
      </div>

      {appt.status === 'BOOKED' && (onCancel ?? onComplete) && (
        <div className="mt-4 flex gap-2">
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
