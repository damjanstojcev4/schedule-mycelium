import React, { useState } from 'react';
import type { Appointment } from '@/types/api';
import { formatTime } from '@/lib/format';
import { Badge } from '@/components/ui/Badge';
import { CalendarViewProps, HOURS, timeToHour, getSlotStyle, AppointmentModal } from './Shared';

export function StaffDayView(props: CalendarViewProps) {
  const { appointments, staffList, timeBlocks = {}, schedules = {}, currentDate, onCancel, onComplete, onSlotClick, loadingId } = props;
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [hoverSlot, setHoverSlot] = useState<{ staffId: string, top: number, timeString: string } | null>(null);

  const dayAppointments = appointments.filter((appt) => appt.startTime.startsWith(currentDate));

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[calc(100vh-200px)] min-h-[500px]">
      <div className="flex-1 overflow-x-auto overflow-y-auto relative w-full scrollbar-none snap-x snap-mandatory">
        <div className="min-w-full flex">
          <div className="w-14 shrink-0 border-r border-zinc-200 bg-zinc-50 relative flex flex-col">
            <div className="h-14 border-b border-zinc-200 sticky top-0 z-30 bg-zinc-50" />
            {HOURS.map((hour) => (
              <React.Fragment key={hour}>
                <div className="h-12 border-b border-zinc-200 relative">
                  <span className="absolute top-0 -translate-y-1/2 right-1 text-[10px] font-semibold text-zinc-500 bg-zinc-50 px-1">{hour.toString().padStart(2, '0')}:00</span>
                </div>
                <div className="h-12 border-b border-zinc-200 relative">
                  <span className="absolute top-0 -translate-y-1/2 right-1 text-[10px] font-semibold text-zinc-400 bg-zinc-50 px-1">{hour.toString().padStart(2, '0')}:30</span>
                </div>
              </React.Fragment>
            ))}
          </div>
          <div className="flex-1 relative flex">
            <div className="absolute inset-x-0 top-14 bottom-0 pointer-events-none">
              {HOURS.map((hour) => (
                <React.Fragment key={hour}>
                  <div className="h-12 border-b border-zinc-100" />
                  <div className="h-12 border-b border-zinc-100 border-dashed" />
                </React.Fragment>
              ))}
            </div>
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
                workStartHr = 20;
                workEndHr = 8;
              } else if (!staffSchedule) {
                 workStartHr = 9;
                 workEndHr = 17;
              }

              return (
                <div key={staff.publicId} className="flex-1 border-r border-zinc-200 relative min-w-[200px] snap-start">
                  <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-zinc-200 h-14 flex flex-col items-center justify-center">
                    <h3 className="text-sm font-bold text-zinc-800 leading-tight">{staff.name}</h3>
                    <p className="text-[10px] text-zinc-500 leading-tight">{staff.roleTitle}</p>
                  </div>
                  <div className="relative h-[1248px]">
                    <div className="absolute inset-0 z-0 cursor-pointer"
                      onMouseMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const y = e.clientY - rect.top;
                        const snappedY = Math.floor(y / 8) * 8;
                        const hoursFrom8 = snappedY / 96;
                        const totalHours = 8 + hoursFrom8;
                        const hr = Math.floor(totalHours);
                        const min = Math.round((totalHours - hr) * 60);
                        let finalHr = hr;
                        let finalMin = min;
                        if (finalMin >= 60) { finalHr++; finalMin = 0; }
                        const timeString = `${String(finalHr).padStart(2, '0')}:${String(finalMin).padStart(2, '0')}`;
                        setHoverSlot({ staffId: staff.publicId, top: snappedY, timeString });
                      }}
                      onMouseLeave={() => setHoverSlot(null)}
                      onClick={() => {
                        if (hoverSlot?.staffId === staff.publicId) {
                          onSlotClick?.(staff.publicId, hoverSlot.timeString, currentDate);
                        }
                      }}
                    >
                      {hoverSlot?.staffId === staff.publicId && (
                        <div className="absolute left-1 right-1 h-[48px] rounded-lg border border-zinc-300 bg-zinc-100/50 pointer-events-none flex items-center justify-center z-10" style={{ top: `${hoverSlot.top}px` }}>
                           <span className="text-xs font-bold text-zinc-500 bg-white/80 px-2 py-1 rounded shadow-sm">+ Add at {hoverSlot.timeString}</span>
                        </div>
                      )}
                    </div>
                    {workStartHr > 8 && (
                       <div className="absolute left-0 right-0 bg-zinc-100/50 flex items-center justify-center pointer-events-none" style={getSlotStyle(8, Math.min(workStartHr, 20))}>
                         <span className="text-xs text-zinc-400 font-medium rotate-[-90deg]">OFF</span>
                       </div>
                    )}
                    {workEndHr < 20 && (
                       <div className="absolute left-0 right-0 bg-zinc-100/50 flex items-center justify-center pointer-events-none" style={getSlotStyle(Math.max(workEndHr, 8), 20)}>
                         <span className="text-xs text-zinc-400 font-medium rotate-[-90deg]">OFF</span>
                       </div>
                    )}
                    {breakStartHr !== null && breakEndHr !== null && breakStartHr >= 8 && breakEndHr <= 20 && (
                      <div className="absolute left-0 right-0 bg-[repeating-linear-gradient(45deg,#f4f4f5,#f4f4f5_10px,#fafafa_10px,#fafafa_20px)] border-y border-zinc-200 opacity-60 flex items-center justify-center pointer-events-none" style={getSlotStyle(breakStartHr, breakEndHr)}>
                        <span className="bg-white px-2 py-0.5 rounded text-xs text-zinc-500 font-bold shadow-sm">Break</span>
                      </div>
                    )}
                    {(timeBlocks[staff.publicId] || []).map(block => {
                      const start = timeToHour(block.startTime.slice(0, 5));
                      let end = timeToHour(block.endTime.slice(0, 5));
                      if (end <= start) end = start + 0.5;
                      if (start >= 20 || end <= 8) return null;
                      const displayStart = Math.max(start, 8);
                      const displayEnd = Math.min(end, 20);
                      return (
                        <div key={block.publicId} className="absolute left-1 right-1 rounded-lg border border-red-200 bg-[repeating-linear-gradient(45deg,#fef2f2,#fef2f2_10px,#fee2e2_10px,#fee2e2_20px)] p-2 overflow-hidden hover:z-10 shadow-sm flex flex-col pointer-events-auto" style={getSlotStyle(displayStart, displayEnd)}>
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-bold text-red-900 truncate pr-2 bg-white/50 px-1 rounded">Break</span>
                            <span className="text-[10px] font-medium text-red-600 bg-red-100 px-1.5 rounded-full shrink-0 shadow-sm border border-red-200">{block.startTime.slice(0, 5)} - {block.endTime.slice(0, 5)}</span>
                          </div>
                          {block.reason && <p className="text-[10px] text-red-700 truncate bg-white/50 px-1 rounded mt-1">{block.reason}</p>}
                        </div>
                      );
                    })}
                    {staffAppts.map((appt) => {
                      const start = timeToHour(appt.startTime.slice(11, 16));
                      let end = timeToHour(appt.endTime.slice(11, 16));
                      if (end <= start) end = start + 0.5;
                      if (start >= 20 || end <= 8) return null;
                      if (appt.status === 'CANCELLED') return null;
                      const displayStart = Math.max(start, 8);
                      const displayEnd = Math.min(end, 20);
                      const color = appt.serviceColor || '#3b82f6';
                      return (
                        <div key={appt.publicId} className="absolute left-1 right-1 rounded-lg overflow-hidden hover:ring-2 hover:z-10 transition-all shadow-sm cursor-pointer hover:shadow-md active:scale-[0.98]"
                          style={{
                            ...getSlotStyle(displayStart, displayEnd),
                            backgroundColor: `${color}18`, borderLeft: `3px solid ${color}`, borderTop: `1px solid ${color}40`, borderRight: `1px solid ${color}40`, borderBottom: `1px solid ${color}40`,
                            // @ts-expect-error CSS custom property
                            '--tw-ring-color': color,
                          }}
                          onClick={(e) => { e.stopPropagation(); setSelectedAppt(appt); }}
                        >
                          <div className="px-2 py-1 flex items-center justify-between gap-1 overflow-hidden h-full">
                            <span className="text-[10px] font-bold truncate" style={{ color }}>{formatTime(appt.startTime)} – {formatTime(appt.endTime)}</span>
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
      {selectedAppt && (
        <AppointmentModal selectedAppt={selectedAppt} onClose={() => setSelectedAppt(null)} onComplete={onComplete} onCancel={onCancel} loadingId={loadingId} />
      )}
    </div>
  );
}
