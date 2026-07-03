import React, { useState } from 'react';
import type { Appointment, StaffMember, TimeBlockResponse } from '@/types/api';
import { formatTime } from '@/lib/format';
import { Badge } from '@/components/ui/Badge';

interface CalendarViewProps {
  appointments: Appointment[];
  staffList: StaffMember[];
  timeBlocks?: Record<string, TimeBlockResponse[]>;
  currentDate: string; // YYYY-MM-DD
  onCancel: (id: string) => void;
  onComplete: (id: string) => void;
  onSlotClick?: (staffPublicId: string, timeString: string) => void;
  loadingId: string | null;
}

import { StaffScheduleResponseDTO } from '@/types/api';

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8:00 to 20:00

export function CalendarView({
  appointments,
  staffList,
  timeBlocks = {},
  schedules = {},
  currentDate,
  onCancel,
  onComplete,
  onSlotClick,
  loadingId,
}: CalendarViewProps & { schedules?: Record<string, StaffScheduleResponseDTO> }) {
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [hoverSlot, setHoverSlot] = useState<{ staffId: string, top: number, timeString: string } | null>(null);

  // Filter appointments for the current date
  const dayAppointments = appointments.filter((appt) => appt.startTime.startsWith(currentDate));

  // Helper to convert "HH:mm" or "HH:mm:ss" to fractional hour (e.g. "09:30" -> 9.5)
  const timeToHour = (timeString: string) => {
    if (!timeString) return 0;
    const [h, m] = timeString.split(':').map(Number);
    return h + m / 60;
  };

  const getSlotStyle = (startHr: number, endHr: number) => {
    const top = (startHr - 8) * 96; // 96px per hour
    const height = (endHr - startHr) * 96;
    return { top: `${top}px`, height: `${height}px` };
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[calc(100vh-200px)] min-h-[500px]">
      <div className="flex-1 overflow-y-auto relative w-full scrollbar-none">
        <div className="min-w-full flex">
          {/* Time axis */}
          <div className="w-14 shrink-0 border-r border-zinc-200 bg-zinc-50 relative flex flex-col">
            <div className="h-14 border-b border-zinc-200 sticky top-0 z-30 bg-zinc-50" />
            {HOURS.map((hour) => (
              <React.Fragment key={hour}>
                <div className="h-12 border-b border-zinc-200 relative">
                  <span className="absolute top-0 -translate-y-1/2 right-1 text-[10px] font-semibold text-zinc-500 bg-zinc-50 px-1">
                    {hour.toString().padStart(2, '0')}:00
                  </span>
                </div>
                <div className="h-12 border-b border-zinc-200 relative">
                  <span className="absolute top-0 -translate-y-1/2 right-1 text-[10px] font-semibold text-zinc-400 bg-zinc-50 px-1">
                    {hour.toString().padStart(2, '0')}:30
                  </span>
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* Grid area */}
          <div className="flex-1 relative flex">
            {/* Horizontal lines */}
            <div className="absolute inset-x-0 top-14 bottom-0 pointer-events-none">
              {HOURS.map((hour) => (
                <React.Fragment key={hour}>
                  <div className="h-12 border-b border-zinc-100" />
                  <div className="h-12 border-b border-zinc-100 border-dashed" />
                </React.Fragment>
              ))}
            </div>

            {/* Columns for each staff member */}
            {staffList.map((staff) => {
              const staffAppts = dayAppointments.filter(
                (a) => a.staffName === staff.name || (!a.staffName && staffList.length === 1)
              );

              const dayObj = new Date(currentDate + 'T00:00:00');
              const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as const;
              const dayOfWeek = days[dayObj.getDay()];

              let workStartHr = 8;
              let workEndHr = 20;
              let breakStartHr: number | null = null;
              let breakEndHr: number | null = null;
              let isWorking = false;

              const staffSchedule = schedules?.[staff.publicId]?.schedule?.find(s => s.dayOfWeek === dayOfWeek);
              if (staffSchedule && staffSchedule.isWorking) {
                isWorking = true;
                workStartHr = staffSchedule.workStart ? timeToHour(staffSchedule.workStart) : 8;
                workEndHr = staffSchedule.workEnd ? timeToHour(staffSchedule.workEnd) : 20;
                breakStartHr = staffSchedule.breakStart ? timeToHour(staffSchedule.breakStart) : null;
                breakEndHr = staffSchedule.breakEnd ? timeToHour(staffSchedule.breakEnd) : null;
              } else if (staffSchedule && !staffSchedule.isWorking) {
                workStartHr = 20; // Will grey out the whole day
                workEndHr = 8;
              } else if (!staffSchedule) {
                 // Fallback if no schedule data, assume standard hours so it's not entirely greyed out by default
                 workStartHr = 9;
                 workEndHr = 17;
              }

              return (
                <div key={staff.publicId} className="flex-1 border-r border-zinc-200 relative min-w-[200px]">
                  <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-zinc-200 h-14 flex flex-col items-center justify-center">
                    <h3 className="text-sm font-bold text-zinc-800 leading-tight">{staff.name}</h3>
                    <p className="text-[10px] text-zinc-500 leading-tight">{staff.roleTitle}</p>
                  </div>

                  <div className="relative h-[1248px]"> {/* 13 hours * 96px */}
                    
                    {/* Clickable empty slots */}
                    <div 
                      className="absolute inset-0 z-0 cursor-pointer"
                      onMouseMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const y = e.clientY - rect.top;
                        const snappedY = Math.floor(y / 8) * 8; // Snap to 5 mins (8px)
                        const hoursFrom8 = snappedY / 96;
                        const totalHours = 8 + hoursFrom8;
                        const hr = Math.floor(totalHours);
                        const min = Math.round((totalHours - hr) * 60);
                        let finalHr = hr;
                        let finalMin = min;
                        if (finalMin >= 60) {
                          finalHr++;
                          finalMin = 0;
                        }
                        const timeString = `${String(finalHr).padStart(2, '0')}:${String(finalMin).padStart(2, '0')}`;
                        setHoverSlot({ staffId: staff.publicId, top: snappedY, timeString });
                      }}
                      onMouseLeave={() => setHoverSlot(null)}
                      onClick={() => {
                        if (hoverSlot?.staffId === staff.publicId) {
                          onSlotClick?.(staff.publicId, hoverSlot.timeString);
                        }
                      }}
                    >
                      {hoverSlot?.staffId === staff.publicId && (
                        <div 
                          className="absolute left-1 right-1 h-[48px] rounded-lg border border-zinc-300 bg-zinc-100/50 pointer-events-none flex items-center justify-center z-10"
                          style={{ top: `${hoverSlot.top}px` }}
                        >
                           <span className="text-xs font-bold text-zinc-500 bg-white/80 px-2 py-1 rounded shadow-sm">
                             + Add at {hoverSlot.timeString}
                           </span>
                        </div>
                      )}
                    </div>

                    {/* Out of office hours */}
                    {workStartHr > 8 && (
                       <div 
                         className="absolute left-0 right-0 bg-zinc-100/50 flex items-center justify-center pointer-events-none"
                         style={getSlotStyle(8, Math.min(workStartHr, 20))}
                       >
                         <span className="text-xs text-zinc-400 font-medium rotate-[-90deg]">OFF</span>
                       </div>
                    )}
                    {workEndHr < 20 && (
                       <div 
                         className="absolute left-0 right-0 bg-zinc-100/50 flex items-center justify-center pointer-events-none"
                         style={getSlotStyle(Math.max(workEndHr, 8), 20)}
                       >
                         <span className="text-xs text-zinc-400 font-medium rotate-[-90deg]">OFF</span>
                       </div>
                    )}

                    {/* Break time */}
                    {breakStartHr !== null && breakEndHr !== null && breakStartHr >= 8 && breakEndHr <= 20 && (
                      <div
                        className="absolute left-0 right-0 bg-[repeating-linear-gradient(45deg,#f4f4f5,#f4f4f5_10px,#fafafa_10px,#fafafa_20px)] border-y border-zinc-200 opacity-60 flex items-center justify-center pointer-events-none"
                        style={getSlotStyle(breakStartHr, breakEndHr)}
                      >
                        <span className="bg-white px-2 py-0.5 rounded text-xs text-zinc-500 font-bold shadow-sm">Break</span>
                      </div>
                    )}

                    {/* Custom Time Blocks */}
                    {(timeBlocks[staff.publicId] || []).map(block => {
                      const start = timeToHour(block.startTime.slice(0, 5));
                      let end = timeToHour(block.endTime.slice(0, 5));
                      if (end <= start) end = start + 0.5;

                      if (start >= 20 || end <= 8) return null;
                      const displayStart = Math.max(start, 8);
                      const displayEnd = Math.min(end, 20);

                      return (
                        <div
                          key={block.publicId}
                          className="absolute left-1 right-1 rounded-lg border border-red-200 bg-[repeating-linear-gradient(45deg,#fef2f2,#fef2f2_10px,#fee2e2_10px,#fee2e2_20px)] p-2 overflow-hidden hover:z-10 shadow-sm flex flex-col pointer-events-auto"
                          style={getSlotStyle(displayStart, displayEnd)}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-bold text-red-900 truncate pr-2 bg-white/50 px-1 rounded">Break</span>
                            <span className="text-[10px] font-medium text-red-600 bg-red-100 px-1.5 rounded-full shrink-0 shadow-sm border border-red-200">
                              {block.startTime.slice(0, 5)} - {block.endTime.slice(0, 5)}
                            </span>
                          </div>
                          {block.reason && <p className="text-[10px] text-red-700 truncate bg-white/50 px-1 rounded mt-1">{block.reason}</p>}
                        </div>
                      );
                    })}

                    {/* Appointments */}
                    {staffAppts.map((appt) => {
                      const start = timeToHour(appt.startTime.slice(11, 16));
                      let end = timeToHour(appt.endTime.slice(11, 16));
                      if (end <= start) end = start + 0.5;

                      if (start >= 20 || end <= 8) return null;
                      if (appt.status === 'CANCELLED') return null;
                      const displayStart = Math.max(start, 8);
                      const displayEnd = Math.min(end, 20);
                      const color = appt.serviceColor || '#3b82f6';
                      const customerLabel = appt.customerName ?? appt.guestName ?? 'Walk-in';

                      return (
                        <div
                          key={appt.publicId}
                          className="absolute left-1 right-1 rounded-lg overflow-hidden hover:ring-2 hover:z-10 transition-all shadow-sm cursor-pointer hover:shadow-md active:scale-[0.98]"
                          style={{
                            ...getSlotStyle(displayStart, displayEnd),
                            backgroundColor: `${color}18`,
                            borderLeft: `3px solid ${color}`,
                            borderTop: `1px solid ${color}40`,
                            borderRight: `1px solid ${color}40`,
                            borderBottom: `1px solid ${color}40`,
                            // @ts-expect-error CSS custom property for ring
                            '--tw-ring-color': color,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAppt(appt);
                          }}
                        >
                          <div className="px-2 py-1 flex items-center justify-between gap-1 overflow-hidden h-full">
                            <span className="text-[10px] font-bold truncate" style={{ color }}>
                              {formatTime(appt.startTime)} – {formatTime(appt.endTime)}
                            </span>
                            <Badge status={appt.status} className="scale-75 origin-top-right shrink-0" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            
            {staffList.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                <p className="text-zinc-500 font-medium">No staff found for this business.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppt && (() => {
        const color = selectedAppt.serviceColor || '#3b82f6';
        const customerLabel = selectedAppt.customerName ?? selectedAppt.guestName ?? 'Walk-in';
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            aria-modal="true"
            role="dialog"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
              onClick={() => setSelectedAppt(null)}
            />

            {/* Panel */}
            <div className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {/* Colored header bar */}
              <div className="h-2 w-full" style={{ backgroundColor: color }} />

              <div className="p-5">
                {/* Status + service */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900">{selectedAppt.serviceName}</h3>
                    <p className="text-sm text-zinc-500 mt-0.5">{selectedAppt.staffName}</p>
                  </div>
                  <Badge status={selectedAppt.status} size="md" />
                </div>

                {/* Details grid */}
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

                {/* Actions */}
                <div className="flex gap-2">
                  {selectedAppt.status === 'BOOKED' && (
                    <>
                      <button
                        onClick={() => { onComplete(selectedAppt.publicId); setSelectedAppt(null); }}
                        disabled={!!loadingId}
                        className="flex-1 py-2.5 bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-sm hover:bg-emerald-600 active:bg-emerald-700 transition-colors disabled:opacity-50"
                      >
                        Mark Complete
                      </button>
                      <button
                        onClick={() => { onCancel(selectedAppt.publicId); setSelectedAppt(null); }}
                        disabled={!!loadingId}
                        className="flex-1 py-2.5 bg-red-50 text-red-600 border border-red-200 text-sm font-bold rounded-xl shadow-sm hover:bg-red-100 active:bg-red-200 transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setSelectedAppt(null)}
                    className={`${selectedAppt.status !== 'BOOKED' ? 'flex-1' : ''} py-2.5 px-4 bg-zinc-100 text-zinc-600 text-sm font-medium rounded-xl hover:bg-zinc-200 transition-colors`}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
