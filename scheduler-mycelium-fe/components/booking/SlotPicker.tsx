'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useBooking } from '@/contexts/BookingContext';
import { Spinner } from '@/components/ui/Spinner';
import { todayISO } from '@/lib/format';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface SlotPickerProps {
  slug: string;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function toISO(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function parseHour(time: string): number {
  return parseInt(time.split(':')[0], 10);
}

export function SlotPicker({ slug }: SlotPickerProps) {
  const { selectedService, selectedStaff, selectedSlot, setSelectedSlot, nextStep } = useBooking();

  const today = todayISO();
  const todayDate = new Date(today);

  const [viewYear, setViewYear] = useState(todayDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(todayDate.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(
    () => selectedSlot?.date ?? null
  );
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState('');

  useEffect(() => {
    if (!selectedDate || !selectedService) return;
    void (async () => {
      setLoadingSlots(true);
      setSlotsError('');
      setSlots([]);
      try {
        const result = await api.getAvailableSlots(
          slug,
          selectedService.publicId,
          selectedDate,
          selectedStaff?.publicId,
        );
        setSlots(result.availableSlots.map((t) => t.slice(0, 5)));
      } catch (e) {
        setSlotsError(e instanceof Error ? e.message : 'Failed to load slots.');
      } finally {
        setLoadingSlots(false);
      }
    })();
  }, [selectedDate, selectedService, selectedStaff, slug]);

  function handleDateSelect(dateStr: string) {
    if (dateStr < today) return;
    setSelectedDate(dateStr);
    setSlots([]);
  }

  function handleSlotSelect(time: string) {
    if (!selectedDate) return;
    setSelectedSlot({ date: selectedDate, time });
    setTimeout(() => nextStep(), 150);
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const cells: (number | null)[] = [
    ...Array<null>(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Group slots by AM / PM
  const amSlots = slots.filter((t) => parseHour(t) < 12);
  const pmSlots = slots.filter((t) => parseHour(t) >= 12);

  const selectedDateFormatted = selectedDate
    ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-GB', {
        weekday: 'long', day: 'numeric', month: 'long',
      })
    : null;

  return (
    <div>
      {/* Calendar */}
      <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm">
        {/* Month nav */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <button
            type="button"
            id="cal-prev-month"
            onClick={prevMonth}
            className="h-9 w-9 flex items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-100 transition-colors active:scale-95"
            aria-label="Previous month"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-base font-bold text-zinc-900">
            {MONTHS[viewMonth]} {viewYear}
          </span>
          <button
            type="button"
            id="cal-next-month"
            onClick={nextMonth}
            className="h-9 w-9 flex items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-100 transition-colors active:scale-95"
            aria-label="Next month"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Calendar grid */}
        <div className="px-4 pt-2 pb-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAY_LABELS.map((d, i) => (
              <div key={`${d}-${i}`} className="text-center text-xs font-semibold text-zinc-400 py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-y-1">
            {cells.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} />;
              const dateStr = toISO(viewYear, viewMonth, day);
              const isPast = dateStr < today;
              const isToday = dateStr === today;
              const isSelected = dateStr === selectedDate;

              return (
                <button
                  key={dateStr}
                  id={`cal-day-${dateStr}`}
                  type="button"
                  disabled={isPast}
                  onClick={() => handleDateSelect(dateStr)}
                  className={[
                    'mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-all duration-150 active:scale-90',
                    isPast
                      ? 'cursor-not-allowed text-zinc-200'
                      : isSelected
                      ? 'bg-zinc-900 text-white font-bold shadow-md scale-110'
                      : isToday
                      ? 'ring-2 ring-zinc-900 text-zinc-900 font-bold hover:bg-zinc-100'
                      : 'text-zinc-700 hover:bg-zinc-100',
                  ].join(' ')}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div className="mt-6 animate-slide-up">
          {/* Selected date label */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-zinc-900">{selectedDateFormatted}</p>
              {!loadingSlots && slots.length > 0 && (
                <p className="text-xs text-zinc-500 mt-0.5">{slots.length} time{slots.length !== 1 ? 's' : ''} available</p>
              )}
            </div>
            {loadingSlots && <Spinner className="h-5 w-5 text-zinc-900" />}
          </div>

          {slotsError && (
            <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 font-medium">
              {slotsError}
            </div>
          )}

          {!loadingSlots && !slotsError && slots.length === 0 && (
            <div className="rounded-2xl border border-dashed border-zinc-200 py-10 text-center">
              <svg className="h-8 w-8 text-zinc-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium text-zinc-500">No available times</p>
              <p className="text-xs text-zinc-400 mt-1">Try selecting another day</p>
            </div>
          )}

          {!loadingSlots && slots.length > 0 && (
            <div className="space-y-4">
              {/* AM slots */}
              {amSlots.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Morning</p>
                  <div className="flex flex-wrap gap-2">
                    {amSlots.map((time) => {
                      const isSelected = selectedSlot?.date === selectedDate && selectedSlot.time === time;
                      return (
                        <button
                          key={time}
                          id={`slot-${time}`}
                          type="button"
                          onClick={() => handleSlotSelect(time)}
                          className={[
                            'px-4 py-2.5 rounded-2xl border text-sm font-semibold transition-all duration-150 active:scale-95',
                            isSelected
                              ? 'bg-zinc-900 border-zinc-900 text-white shadow-md'
                              : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-900 hover:text-zinc-900',
                          ].join(' ')}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* PM slots */}
              {pmSlots.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Afternoon & Evening</p>
                  <div className="flex flex-wrap gap-2">
                    {pmSlots.map((time) => {
                      const isSelected = selectedSlot?.date === selectedDate && selectedSlot.time === time;
                      return (
                        <button
                          key={time}
                          id={`slot-${time}`}
                          type="button"
                          onClick={() => handleSlotSelect(time)}
                          className={[
                            'px-4 py-2.5 rounded-2xl border text-sm font-semibold transition-all duration-150 active:scale-95',
                            isSelected
                              ? 'bg-zinc-900 border-zinc-900 text-white shadow-md'
                              : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-900 hover:text-zinc-900',
                          ].join(' ')}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!selectedDate && (
        <div className="mt-6 rounded-2xl border border-dashed border-zinc-200 py-8 text-center">
          <svg className="h-8 w-8 text-zinc-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm font-medium text-zinc-500">Select a date to see available times</p>
        </div>
      )}
    </div>
  );
}
