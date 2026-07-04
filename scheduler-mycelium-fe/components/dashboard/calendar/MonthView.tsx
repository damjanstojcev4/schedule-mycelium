import React, { useState, useMemo } from 'react';
import type { Appointment } from '@/types/api';
import { localDateISO } from '@/lib/format';
import { CalendarViewProps, AppointmentModal } from './Shared';

export function MonthView(props: CalendarViewProps) {
  const { appointments, currentDate, onCancel, onComplete, loadingId } = props;
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);

  const daysInMonth = useMemo(() => {
    const date = new Date(currentDate);
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startPadding = firstDay.getDay(); // 0 (Sun) to 6 (Sat)
    const totalDays = lastDay.getDate();
    
    // We render a fixed 42 cell grid (6 weeks * 7 days)
    return Array.from({ length: 42 }).map((_, i) => {
      if (i < startPadding || i >= startPadding + totalDays) {
        return null; // Empty cell
      }
      const d = new Date(year, month, i - startPadding + 1);
      return localDateISO(d);
    });
  }, [currentDate]);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[calc(100vh-200px)] min-h-[500px]">
      <div className="grid grid-cols-7 border-b border-zinc-200 bg-zinc-50 shrink-0">
        {daysOfWeek.map(day => (
          <div key={day} className="py-2 text-center text-xs font-bold text-zinc-500">
            {day}
          </div>
        ))}
      </div>
      
      <div className="flex-1 grid grid-cols-7 grid-rows-6">
        {daysInMonth.map((dateStr, idx) => {
          if (!dateStr) {
            return <div key={`empty-${idx}`} className="border-r border-b border-zinc-100 bg-zinc-50/50" />;
          }

          const isToday = dateStr === localDateISO(new Date());
          const dayNumber = parseInt(dateStr.split('-')[2], 10);
          const dayAppts = appointments.filter(a => a.startTime.startsWith(dateStr) && a.status !== 'CANCELLED');

          return (
            <div key={dateStr} className={`border-r border-b border-zinc-100 p-1.5 flex flex-col min-h-0 ${isToday ? 'bg-blue-50/30' : 'bg-white'}`}>
              <div className="flex justify-between items-start mb-1">
                <span className={`text-xs font-bold h-6 w-6 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white shadow-sm' : 'text-zinc-700'}`}>
                  {dayNumber}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1 scrollbar-none pb-1">
                {dayAppts.map(appt => {
                  const color = appt.serviceColor || '#3b82f6';
                  return (
                    <div 
                      key={appt.publicId} 
                      onClick={() => setSelectedAppt(appt)}
                      className="px-1.5 py-1 rounded cursor-pointer transition-colors hover:brightness-95 flex items-center gap-1.5 border"
                      style={{ backgroundColor: `${color}15`, borderColor: `${color}30` }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-[9px] font-bold text-zinc-800 truncate">{appt.serviceName}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      {selectedAppt && (
        <AppointmentModal selectedAppt={selectedAppt} onClose={() => setSelectedAppt(null)} onComplete={onComplete} onCancel={onCancel} loadingId={loadingId} />
      )}
    </div>
  );
}
