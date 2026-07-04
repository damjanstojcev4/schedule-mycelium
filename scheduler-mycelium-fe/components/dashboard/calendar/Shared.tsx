import React from 'react';
import type { Appointment, StaffMember, TimeBlockResponse, StaffScheduleResponseDTO } from '@/types/api';
import { formatTime } from '@/lib/format';
import { Badge } from '@/components/ui/Badge';

export interface CalendarViewProps {
  mode: 'day' | 'week' | 'month';
  appointments: Appointment[];
  staffList: StaffMember[];
  timeBlocks?: Record<string, TimeBlockResponse[]>;
  schedules?: Record<string, StaffScheduleResponseDTO>;
  currentDate: string; // YYYY-MM-DD
  onCancel: (id: string) => void;
  onComplete: (id: string) => void;
  onSlotClick?: (staffPublicId: string, timeString: string, dateString?: string) => void;
  loadingId: string | null;
}

export const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8:00 to 20:00

export const timeToHour = (timeString: string) => {
  if (!timeString) return 0;
  const [h, m] = timeString.split(':').map(Number);
  return h + m / 60;
};

export const getSlotStyle = (startHr: number, endHr: number) => {
  const top = (startHr - 8) * 96; // 96px per hour
  const height = (endHr - startHr) * 96;
  return { top: `${top}px`, height: `${height}px` };
};

export function AppointmentModal({
  selectedAppt,
  onClose,
  onComplete,
  onCancel,
  loadingId
}: {
  selectedAppt: Appointment;
  onClose: () => void;
  onComplete: (id: string) => void;
  onCancel: (id: string) => void;
  loadingId: string | null;
}) {
  const color = selectedAppt.serviceColor || '#3b82f6';
  const customerLabel = selectedAppt.customerName ?? selectedAppt.guestName ?? 'Walk-in';
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="h-2 w-full" style={{ backgroundColor: color }} />
        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-zinc-900">{selectedAppt.serviceName}</h3>
              <p className="text-sm text-zinc-500 mt-0.5">{selectedAppt.staffName}</p>
            </div>
            <Badge status={selectedAppt.status} size="md" />
          </div>
          <div className="space-y-3 mb-5">
            <div className="flex items-center gap-3 text-sm">
              <span className="text-zinc-400 text-xs font-semibold w-14 shrink-0">Date</span>
              <span className="text-zinc-700 font-medium">
                {new Date(selectedAppt.startTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-zinc-400 text-xs font-semibold w-14 shrink-0">Time</span>
              <span className="text-zinc-700 font-medium">
                {formatTime(selectedAppt.startTime)} – {formatTime(selectedAppt.endTime)}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-zinc-400 text-xs font-semibold w-14 shrink-0">Client</span>
              <span className="text-zinc-700 font-medium">{customerLabel}</span>
            </div>
            {selectedAppt.guestEmail && (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-zinc-400 text-xs font-semibold w-14 shrink-0">Email</span>
                <span className="text-zinc-700">{selectedAppt.guestEmail}</span>
              </div>
            )}
            {selectedAppt.guestPhone && (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-zinc-400 text-xs font-semibold w-14 shrink-0">Phone</span>
                <span className="text-zinc-700">{selectedAppt.guestPhone}</span>
              </div>
            )}
            {selectedAppt.notes && (
              <div className="flex items-start gap-3 text-sm">
                <span className="text-zinc-400 text-xs font-semibold w-14 shrink-0 mt-0.5">Notes</span>
                <span className="text-zinc-600 italic">{selectedAppt.notes}</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {selectedAppt.status === 'BOOKED' && (
              <>
                <button onClick={() => { onComplete(selectedAppt.publicId); onClose(); }} disabled={!!loadingId} className="flex-1 py-2.5 bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-sm hover:bg-emerald-600 active:bg-emerald-700 transition-colors disabled:opacity-50">Mark Complete</button>
                <button onClick={() => { onCancel(selectedAppt.publicId); onClose(); }} disabled={!!loadingId} className="flex-1 py-2.5 bg-red-50 text-red-600 border border-red-200 text-sm font-bold rounded-xl shadow-sm hover:bg-red-100 active:bg-red-200 transition-colors disabled:opacity-50">Cancel</button>
              </>
            )}
            <button onClick={onClose} className={`${selectedAppt.status !== 'BOOKED' ? 'flex-1' : ''} py-2.5 px-4 bg-zinc-100 text-zinc-600 text-sm font-medium rounded-xl hover:bg-zinc-200 transition-colors`}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
