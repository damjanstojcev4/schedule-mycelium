'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getStoredAuth } from '@/lib/auth';
import { AppointmentCard } from '@/components/appointments/AppointmentCard';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Appointment } from '@/types/api';
import { formatDate, todayISO } from '@/lib/format';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function toISO(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function StaffSchedulePage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();

  const today = todayISO();
  const todayDate = new Date(today);

  const [selectedDate, setSelectedDate] = useState(today);
  const [viewYear, setViewYear] = useState(todayDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(todayDate.getMonth());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    const auth = getStoredAuth();
    if (!auth || auth.role !== 'STAFF') {
      router.replace('/login');
    }
  }, [router]);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError('');
      try {
        const appts = await api.getStaffSchedule(slug, selectedDate);
        setAppointments(appts.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load.');
      } finally {
        setLoading(false);
      }
    })();
  }, [slug, selectedDate]);

  async function handleComplete(publicId: string) {
    setLoadingId(publicId);
    try {
      await api.completeAppointment(publicId);
      setAppointments((prev) =>
        prev.map((a) => (a.publicId === publicId ? { ...a, status: 'COMPLETED' } : a)),
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to complete.');
    } finally {
      setLoadingId(null);
    }
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  }

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const cells: (number | null)[] = [
    ...Array<null>(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-5">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Staff Portal</p>
          <h1 className="text-xl font-semibold text-gray-900 mt-1">My Schedule</h1>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* Calendar */}
        <div className="lg:w-72 shrink-0">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="mb-3 flex items-center justify-between">
              <button type="button" id="staff-cal-prev" onClick={prevMonth}
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
                aria-label="Previous month">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-sm font-semibold text-gray-900">
                {MONTHS[viewMonth]} {viewYear}
              </span>
              <button type="button" id="staff-cal-next" onClick={nextMonth}
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
                aria-label="Next month">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-7 mb-1">
              {DAY_LABELS.map((d) => (
                <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, i) => {
                if (!day) return <div key={`e-${i}`} />;
                const dateStr = toISO(viewYear, viewMonth, day);
                const isToday = dateStr === today;
                const isSelected = dateStr === selectedDate;
                return (
                  <button
                    key={dateStr}
                    id={`staff-day-${dateStr}`}
                    type="button"
                    onClick={() => setSelectedDate(dateStr)}
                    className={[
                      'flex h-8 w-full items-center justify-center rounded-lg text-sm transition-colors',
                      isSelected
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
        </div>

        {/* Appointments list */}
        <div className="flex-1">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">
            {selectedDate === today ? "Today's appointments" : `Appointments on ${formatDate(selectedDate + 'T00:00:00')}`}
          </h2>

          {loading && (
            <div className="flex justify-center py-12">
              <Spinner className="h-6 w-6 text-gray-900" />
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && appointments.length === 0 && (
            <EmptyState
              title="No appointments"
              description="You have no appointments scheduled for this day."
            />
          )}

          {!loading && appointments.length > 0 && (
            <div className="space-y-3">
              {appointments.map((appt) => (
                <AppointmentCard
                  key={appt.publicId}
                  appointment={appt}
                  onComplete={handleComplete}
                  loading={loadingId === appt.publicId}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
