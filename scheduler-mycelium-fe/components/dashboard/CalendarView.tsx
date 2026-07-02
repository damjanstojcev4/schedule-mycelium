import React from 'react';
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

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8:00 to 20:00

const TIME_SLOTS = HOURS.flatMap(h => {
  if (h === 20) return [];
  return [
    { time: `${String(h).padStart(2, '0')}:00`, top: (h - 8) * 96 },
    { time: `${String(h).padStart(2, '0')}:30`, top: (h - 8) * 96 + 48 }
  ];
});

export function CalendarView({
  appointments,
  staffList,
  timeBlocks = {},
  currentDate,
  onCancel,
  onComplete,
  onSlotClick,
  loadingId,
}: CalendarViewProps) {
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
    <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
      <div className="overflow-auto min-h-[600px] max-h-[800px] relative w-full scrollbar-none">
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

              const breakStartHr = staff.breakStart ? timeToHour(staff.breakStart) : null;
              const breakEndHr = staff.breakEnd ? timeToHour(staff.breakEnd) : null;
              const workStartHr = staff.workStart ? timeToHour(staff.workStart) : 8;
              const workEndHr = staff.workEnd ? timeToHour(staff.workEnd) : 20;

              return (
                <div key={staff.publicId} className="flex-1 border-r border-zinc-200 relative min-w-[200px]">
                  <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-zinc-200 h-14 flex flex-col items-center justify-center">
                    <h3 className="text-sm font-bold text-zinc-800 leading-tight">{staff.name}</h3>
                    <p className="text-[10px] text-zinc-500 leading-tight">{staff.roleTitle}</p>
                  </div>

                  <div className="relative h-[1248px]"> {/* 13 hours * 96px */}
                    
                    {/* Clickable empty slots */}
                    <div className="absolute inset-0">
                      {TIME_SLOTS.map((slot) => (
                        <div
                          key={slot.time}
                          onClick={() => onSlotClick?.(staff.publicId, slot.time)}
                          className="absolute left-1 right-1 h-[48px] rounded-lg cursor-pointer border border-transparent hover:bg-zinc-100/50 hover:border-zinc-300 transition-colors group z-0"
                          style={{ top: `${slot.top}px` }}
                        >
                          <span className="opacity-0 group-hover:opacity-100 absolute inset-0 flex items-center justify-center text-xs font-bold text-zinc-400">
                            + Add
                          </span>
                        </div>
                      ))}
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
                      if (end <= start) end = start + 0.5; // fallback duration

                      // Don't render if outside our 8-20 range (or clip it)
                      if (start >= 20 || end <= 8) return null;
                      const displayStart = Math.max(start, 8);
                      const displayEnd = Math.min(end, 20);

                      return (
                        <div
                          key={appt.publicId}
                          className="absolute left-1 right-1 rounded-lg border border-blue-200 bg-blue-50 p-2 overflow-hidden hover:ring-2 hover:ring-blue-400 hover:z-10 transition-all shadow-sm flex flex-col"
                          style={getSlotStyle(displayStart, displayEnd)}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-bold text-blue-900 truncate pr-2">
                              {formatTime(appt.startTime)} - {formatTime(appt.endTime)}
                            </span>
                            <Badge status={appt.status} className="scale-75 origin-top-right shrink-0" />
                          </div>
                          <p className="text-sm font-semibold text-zinc-900 truncate">{appt.serviceName}</p>
                          <p className="text-xs text-zinc-600 truncate mt-0.5">{appt.customerName ?? appt.guestName ?? 'Guest'}</p>
                          
                          {/* Hover actions if enough space */}
                          <div className="mt-auto pt-2 flex gap-1 opacity-0 hover:opacity-100 transition-opacity">
                            {appt.status === 'BOOKED' && (
                              <>
                                <button
                                  onClick={() => onComplete(appt.publicId)}
                                  disabled={!!loadingId}
                                  className="flex-1 bg-white border border-zinc-200 text-xs font-semibold py-1 rounded hover:bg-emerald-50 hover:text-emerald-700 transition-colors disabled:opacity-50"
                                >
                                  Done
                                </button>
                                <button
                                  onClick={() => onCancel(appt.publicId)}
                                  disabled={!!loadingId}
                                  className="flex-1 bg-white border border-zinc-200 text-xs font-semibold py-1 rounded hover:bg-red-50 hover:text-red-700 transition-colors disabled:opacity-50"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
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
    </div>
  );
}
