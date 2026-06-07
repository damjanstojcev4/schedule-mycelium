import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { Appointment } from '@/types/api';
import { formatDate, formatTime } from '@/lib/format';

interface AppointmentTableProps {
  appointments: Appointment[];
  onCancel?: (publicId: string) => void;
  onComplete?: (publicId: string) => void;
  loadingId?: string | null;
}

export function AppointmentTable({
  appointments,
  onCancel,
  onComplete,
  loadingId,
}: AppointmentTableProps) {
  if (appointments.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-400">No appointments to show.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
              Date / Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
              Service
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
              Customer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
              Staff
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
              Status
            </th>
            {(onCancel ?? onComplete) && (
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-400">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {appointments.map((appt) => (
            <tr key={appt.publicId} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <p className="font-medium text-gray-900">{formatDate(appt.startTime)}</p>
                <p className="text-xs text-gray-400">
                  {formatTime(appt.startTime)} – {formatTime(appt.endTime)}
                </p>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                {appt.serviceName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col">
                  <span className="text-gray-700">
                    {appt.customerName ?? appt.guestName ?? '—'}
                  </span>
                  {!appt.customerName && appt.guestName && (
                    <span className="text-xs text-gray-500 font-medium">Guest</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                {appt.staffName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge status={appt.status} />
              </td>
              {(onCancel ?? onComplete) && (
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {appt.status === 'BOOKED' && (
                    <div className="flex items-center justify-end gap-2">
                      {onComplete && (
                        <Button
                          id={`complete-${appt.publicId}`}
                          size="sm"
                          variant="secondary"
                          loading={loadingId === `complete-${appt.publicId}`}
                          onClick={() => onComplete(appt.publicId)}
                        >
                          Complete
                        </Button>
                      )}
                      {onCancel && (
                        <Button
                          id={`cancel-${appt.publicId}`}
                          size="sm"
                          variant="destructive"
                          loading={loadingId === `cancel-${appt.publicId}`}
                          onClick={() => onCancel(appt.publicId)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
