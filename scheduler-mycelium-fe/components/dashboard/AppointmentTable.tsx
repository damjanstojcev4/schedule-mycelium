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
      <div className="py-16 text-center">
        <svg className="h-10 w-10 text-zinc-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-sm font-semibold text-zinc-500">No appointments to show.</p>
        <p className="text-xs text-zinc-400 mt-1">Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-zinc-100 bg-zinc-50">
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-zinc-400">Date</th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-zinc-400">Service</th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-zinc-400">Customer</th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-zinc-400">Staff</th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-zinc-400">Status</th>
            {(onCancel ?? onComplete) && (
              <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-zinc-400">Actions</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {appointments.map((appt) => (
            <tr key={appt.publicId} className="hover:bg-zinc-50/60 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <p className="font-bold text-zinc-900">{formatDate(appt.startTime)}</p>
                <p className="text-xs text-zinc-500 font-medium mt-0.5">
                  {formatTime(appt.startTime)} – {formatTime(appt.endTime)}
                </p>
              </td>
              <td className="px-6 py-4 whitespace-nowrap font-semibold text-zinc-800">
                {appt.serviceName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <p className="font-medium text-zinc-800">{appt.customerName ?? appt.guestName ?? '—'}</p>
                {!appt.customerName && appt.guestName && (
                  <p className="text-xs text-zinc-400 font-medium mt-0.5">Guest</p>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-zinc-600 font-medium">
                {appt.staffName ?? '—'}
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
