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
const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

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

  // Fetch slots when date changes
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
    nextStep();
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

  return (
    <div>
      <h2 className="mb-4 text-base font-semibold text-gray-900">Pick a date & time</h2>

      {/* Calendar */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        {/* Month nav */}
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            id="cal-prev-month"
            onClick={prevMonth}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Previous month"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-gray-900">
            {MONTHS[viewMonth]} {viewYear}
          </span>
          <button
            type="button"
            id="cal-next-month"
            onClick={nextMonth}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Next month"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Day headers */}
        <div className="mb-1 grid grid-cols-7 text-center">
          {DAY_LABELS.map((d) => (
            <div key={d} className="text-xs font-medium text-gray-400 py-1">{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
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
                  'flex h-9 w-full items-center justify-center rounded-lg text-sm transition-colors',
                  isPast
                    ? 'cursor-not-allowed text-gray-300'
                    : isSelected
                    ? 'bg-gray-900 text-white font-semibold'
                    : isToday
                    ? 'border border-gray-900 text-gray-900 font-semibold hover:bg-gray-50'
                    : 'text-gray-700 hover:bg-gray-100',
                ].join(' ')}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div className="mt-5">
          <p className="mb-3 text-sm font-medium text-gray-700">
            Available times on{' '}
            <span className="text-gray-900">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-GB', {
                day: '2-digit', month: 'short', year: 'numeric',
              })}
            </span>
          </p>

          {loadingSlots && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Spinner className="h-4 w-4 text-gray-900" />
              Loading available times…
            </div>
          )}

          {slotsError && (
            <p className="text-sm text-red-500">{slotsError}</p>
          )}

          {!loadingSlots && !slotsError && slots.length === 0 && (
            <p className="text-sm text-gray-500">
              No available slots on this date. Try another day.
            </p>
          )}

          {!loadingSlots && slots.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {slots.map((time) => {
                const isSelected =
                  selectedSlot?.date === selectedDate && selectedSlot.time === time;
                return (
                  <button
                    key={time}
                    id={`slot-${time}`}
                    type="button"
                    onClick={() => handleSlotSelect(time)}
                    className={[
                      'rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                      isSelected
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400 hover:text-gray-900',
                    ].join(' ')}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
