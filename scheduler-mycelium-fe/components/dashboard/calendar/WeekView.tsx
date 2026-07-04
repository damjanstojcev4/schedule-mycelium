import React, { useState, useMemo } from 'react';
import type { Appointment } from '@/types/api';
import { formatTime, localDateISO } from '@/lib/format';
import { Badge } from '@/components/ui/Badge';
import { CalendarViewProps, HOURS, timeToHour, getSlotStyle, AppointmentModal } from './Shared';

export function WeekView(props: CalendarViewProps) {
  const { appointments, currentDate, onCancel, onComplete, onSlotClick, loadingId } = props;
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [hoverSlot, setHoverSlot] = useState<{ date: string, top: number, timeString: string } | null>(null);

  // Generate the 7 days of the week containing currentDate (Sunday to Saturday)
  const weekDays = useMemo(() => {
    const d = new Date(currentDate);
    const day = d.getDay();
    const diff = d.getDate() - day;
    const sunday = new Date(d.setDate(diff));
    
    return Array.from({ length: 7 }).map((_, i) => {
      const nextDay = new Date(sunday);
      nextDay.setDate(sunday.getDate() + i);
      return localDateISO(nextDay);
    });
  }, [currentDate]);

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
            {weekDays.map((dateStr) => {
              const dayAppts = appointments.filter(a => a.startTime.startsWith(dateStr) && a.status !== 'CANCELLED');
              const dObj = new Date(dateStr + 'T00:00:00');
              const dayName = dObj.toLocaleDateString('en-US', { weekday: 'short' });
              const dayNumber = dObj.getDate();
              const isToday = dateStr === localDateISO(new Date());

              return (
                <div key={dateStr} className="flex-1 border-r border-zinc-200 relative min-w-[120px] snap-start">
                  <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-zinc-200 h-14 flex flex-col items-center justify-center">
                    <h3 className={`text-xs font-bold leading-tight ${isToday ? 'text-blue-600' : 'text-zinc-500'}`}>{dayName}</h3>
                    <p className={`text-lg font-black leading-tight ${isToday ? 'text-blue-600' : 'text-zinc-900'}`}>{dayNumber}</p>
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
                        setHoverSlot({ date: dateStr, top: snappedY, timeString });
                      }}
                      onMouseLeave={() => setHoverSlot(null)}
                      onClick={() => {
                        if (hoverSlot?.date === dateStr && props.staffList.length > 0) {
                          // Default to first staff member in week view if clicked
                          onSlotClick?.(props.staffList[0].publicId, hoverSlot.timeString, dateStr);
                        }
                      }}
                    >
                      {hoverSlot?.date === dateStr && (
                        <div className="absolute left-1 right-1 h-[48px] rounded-lg border border-zinc-300 bg-zinc-100/50 pointer-events-none flex items-center justify-center z-10" style={{ top: `${hoverSlot.top}px` }}>
                           <span className="text-[10px] font-bold text-zinc-500 bg-white/80 px-2 py-1 rounded shadow-sm">+ Add {hoverSlot.timeString}</span>
                        </div>
                      )}
                    </div>
                    {dayAppts.map((appt) => {
                      const start = timeToHour(appt.startTime.slice(11, 16));
                      let end = timeToHour(appt.endTime.slice(11, 16));
                      if (end <= start) end = start + 0.5;
                      if (start >= 20 || end <= 8) return null;
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
                          <div className="px-1.5 py-1 flex flex-col gap-0.5 overflow-hidden h-full">
                            <span className="text-[9px] font-bold truncate leading-none" style={{ color }}>{formatTime(appt.startTime)}</span>
                            <span className="text-[10px] font-semibold text-zinc-900 truncate leading-none mt-0.5">{appt.serviceName}</span>
                            <span className="text-[9px] text-zinc-500 truncate leading-none">{appt.staffName}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {selectedAppt && (
        <AppointmentModal selectedAppt={selectedAppt} onClose={() => setSelectedAppt(null)} onComplete={onComplete} onCancel={onCancel} loadingId={loadingId} />
      )}
    </div>
  );
}
