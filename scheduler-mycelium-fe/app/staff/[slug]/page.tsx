'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import type { Appointment } from '@/types/api';
import { formatTime, todayISO } from '@/lib/format';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function toISO(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function parseMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

// Get 7 days starting from a given date
function getWeekDays(fromDate: string): { iso: string; label: string; dayNum: number; dayName: string }[] {
  const base = new Date(fromDate + 'T00:00:00');
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return {
      iso,
      label: SHORT_MONTHS[d.getMonth()] + ' ' + d.getDate(),
      dayNum: d.getDate(),
      dayName: SHORT_DAYS[d.getDay()],
    };
  });
}

// Timeline constants
const TIMELINE_START_HOUR = 7;   // 7 AM
const TIMELINE_END_HOUR   = 20;  // 8 PM
const HOUR_HEIGHT_PX      = 64;  // px per hour

const SLOT_COLORS = [
  { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-900', dot: 'bg-blue-500' },
  { bg: 'bg-violet-100', border: 'border-violet-400', text: 'text-violet-900', dot: 'bg-violet-500' },
  { bg: 'bg-amber-100', border: 'border-amber-400', text: 'text-amber-900', dot: 'bg-amber-500' },
  { bg: 'bg-emerald-100', border: 'border-emerald-400', text: 'text-emerald-900', dot: 'bg-emerald-500' },
  { bg: 'bg-rose-100', border: 'border-rose-400', text: 'text-rose-900', dot: 'bg-rose-500' },
];

export default function StaffSchedulePage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();
  const { auth, logout } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);

  const today = todayISO();
  const todayDate = new Date(today + 'T00:00:00');

  const [selectedDate, setSelectedDate] = useState(today);
  const [weekStart, setWeekStart] = useState(today);
  const [viewYear, setViewYear] = useState(todayDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(todayDate.getMonth());
  const [showCalendar, setShowCalendar] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (auth === null) return;
    if (!auth || auth.role !== 'STAFF') {
      router.replace('/login');
    }
  }, [auth, router]);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError('');
      try {
        const appts = await api.getStaffSchedule(slug, selectedDate);
        const now = new Date().getTime();
        const autoCompleted = appts.map((appt) => {
          if (appt.status === 'BOOKED' && new Date(appt.endTime).getTime() <= now) {
            return { ...appt, status: 'COMPLETED' as const };
          }
          return appt;
        });
        setAppointments(autoCompleted.sort((a, b) => parseMinutes(formatTime(a.startTime)) - parseMinutes(formatTime(b.startTime))));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load.');
      } finally {
        setLoading(false);
      }
    })();
  }, [slug, selectedDate]);

  // Scroll timeline to current hour on load
  useEffect(() => {
    if (scrollRef.current) {
      const now = new Date();
      const currentHour = now.getHours();
      const scrollTo = Math.max(0, (currentHour - TIMELINE_START_HOUR - 1) * HOUR_HEIGHT_PX);
      scrollRef.current.scrollTop = scrollTo;
    }
  }, [loading]);

  async function handleComplete(publicId: string) {
    setLoadingId(publicId);
    try {
      await api.completeAppointment(publicId);
      setAppointments((prev) =>
        prev.map((a) => (a.publicId === publicId ? { ...a, status: 'COMPLETED' } : a)),
      );
      window.location.reload();
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

  const weekDays = getWeekDays(weekStart);

  function goToPrevWeek() {
    const d = new Date(weekStart + 'T00:00:00');
    d.setDate(d.getDate() - 7);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    setWeekStart(iso);
  }

  function goToNextWeek() {
    const d = new Date(weekStart + 'T00:00:00');
    d.setDate(d.getDate() + 7);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    setWeekStart(iso);
  }

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const cells: (number | null)[] = [
    ...Array<null>(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const totalHours = TIMELINE_END_HOUR - TIMELINE_START_HOUR;
  const hours = Array.from({ length: totalHours + 1 }, (_, i) => TIMELINE_START_HOUR + i);

  // Build timeline blocks for each appointment
  function getTimelineBlock(appt: Appointment, idx: number) {
    const startMin = parseMinutes(formatTime(appt.startTime));
    const endMin = parseMinutes(formatTime(appt.endTime));
    const startRef = TIMELINE_START_HOUR * 60;
    const topPx = ((startMin - startRef) / 60) * HOUR_HEIGHT_PX;
    const heightPx = Math.max(((endMin - startMin) / 60) * HOUR_HEIGHT_PX, 28);
    const color = SLOT_COLORS[idx % SLOT_COLORS.length];
    return { topPx, heightPx, color };
  }

  const isToday = selectedDate === today;
  const selectedDateObj = new Date(selectedDate + 'T00:00:00');
  const selectedDateLabel = selectedDateObj.toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  return (
    <div className="flex flex-col h-screen bg-zinc-50 overflow-hidden">
      {/* ── Top Header ── */}
      <header className="bg-zinc-950 text-white px-4 pt-safe-top">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Staff Portal</p>
              <h1 className="text-lg font-bold text-white leading-tight">My Schedule</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-xs text-zinc-400 font-medium">{auth?.email}</span>
              <button
                onClick={logout}
                className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-zinc-500"
              >
                Log out
              </button>
            </div>
          </div>

          {/* ── Week strip ── */}
          <div className="pb-3">
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                onClick={goToPrevWeek}
                className="h-7 w-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => setShowCalendar(!showCalendar)}
                className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
              >
                {MONTHS[viewMonth]} {viewYear}
                <svg className={['h-3 w-3 transition-transform', showCalendar ? 'rotate-180' : ''].join(' ')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <button
                type="button"
                onClick={goToNextWeek}
                className="h-7 w-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* 7-day horizontal scroll strip */}
            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
              {weekDays.map((day) => {
                const isSelected = day.iso === selectedDate;
                const isDayToday = day.iso === today;
                return (
                  <button
                    key={day.iso}
                    id={`staff-day-${day.iso}`}
                    type="button"
                    onClick={() => setSelectedDate(day.iso)}
                    className={[
                      'flex flex-col items-center gap-1 min-w-[44px] py-2 rounded-xl flex-1 transition-all duration-200 active:scale-95',
                      isSelected ? 'bg-white text-zinc-900' : 'hover:bg-zinc-800 text-zinc-400',
                    ].join(' ')}
                  >
                    <span className={['text-[10px] font-semibold uppercase', isSelected ? 'text-zinc-500' : ''].join(' ')}>
                      {day.dayName}
                    </span>
                    <span className={[
                      'text-base font-black leading-none',
                      isSelected ? 'text-zinc-900' : isDayToday ? 'text-white' : '',
                    ].join(' ')}>
                      {day.dayNum}
                    </span>
                    {isDayToday && !isSelected && (
                      <span className="h-1 w-1 rounded-full bg-blue-500 mt-0.5" />
                    )}
                    {isDayToday && isSelected && (
                      <span className="h-1 w-1 rounded-full bg-blue-500 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* ── Full-month calendar (collapsible) ── */}
      {showCalendar && (
        <div className="bg-zinc-900 border-b border-zinc-800 animate-slide-up">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <button onClick={prevMonth} className="h-8 w-8 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 transition-colors">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-sm font-bold text-white">{MONTHS[viewMonth]} {viewYear}</span>
              <button onClick={nextMonth} className="h-8 w-8 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 transition-colors">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-7 mb-1">
              {DAY_LABELS.map((d) => (
                <div key={d} className="text-center text-[10px] font-semibold text-zinc-500 py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-y-1">
              {cells.map((day, i) => {
                if (!day) return <div key={`e-${i}`} />;
                const dateStr = toISO(viewYear, viewMonth, day);
                const isSelected = dateStr === selectedDate;
                const isDayToday = dateStr === today;
                return (
                  <button
                    key={dateStr}
                    id={`staff-cal-day-${dateStr}`}
                    type="button"
                    onClick={() => {
                      setSelectedDate(dateStr);
                      setShowCalendar(false);
                      // Update week strip to show this date
                      const d = new Date(dateStr + 'T00:00:00');
                      d.setDate(d.getDate() - d.getDay()); // go to Sunday of that week
                      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                      setWeekStart(iso);
                      setViewYear(new Date(dateStr + 'T00:00:00').getFullYear());
                      setViewMonth(new Date(dateStr + 'T00:00:00').getMonth());
                    }}
                    className={[
                      'mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-all',
                      isSelected ? 'bg-white text-zinc-900 font-bold' : isDayToday ? 'ring-1 ring-white text-white font-bold' : 'text-zinc-400 hover:bg-zinc-700',
                    ].join(' ')}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Timeline ── */}
      <main className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto h-full flex flex-col px-4">
          {/* Date label */}
          <div className="flex items-center justify-between py-3 shrink-0">
            <div>
              <p className="text-sm font-bold text-zinc-900">
                {isToday ? 'Today' : selectedDateLabel}
              </p>
              {!loading && (
                <p className="text-xs text-zinc-500 mt-0.5">
                  {appointments.length === 0
                    ? 'No appointments'
                    : `${appointments.length} appointment${appointments.length !== 1 ? 's' : ''}`}
                </p>
              )}
            </div>
            {isToday && (
              <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full ring-1 ring-blue-200">Today</span>
            )}
          </div>

          {loading && (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Spinner className="h-7 w-7 text-zinc-900" />
                <p className="text-sm text-zinc-500">Loading schedule...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3.5 text-sm text-red-600 font-medium">
              {error}
            </div>
          )}

          {/* Timeline scroll area */}
          {!loading && !error && (
            <div ref={scrollRef} className="flex-1 overflow-y-auto">
              <div
                className="relative"
                style={{ height: `${totalHours * HOUR_HEIGHT_PX}px` }}
              >
                {/* Hour lines */}
                {hours.map((hour) => {
                  const isPast = isToday && hour < new Date().getHours();
                  const isCurrent = isToday && hour === new Date().getHours();
                  return (
                    <div
                      key={hour}
                      className="absolute left-0 right-0 flex items-start"
                      style={{ top: `${(hour - TIMELINE_START_HOUR) * HOUR_HEIGHT_PX}px` }}
                    >
                      {/* Hour label */}
                      <div className="w-14 shrink-0 text-right pr-3">
                        <span className={['text-xs font-semibold tabular-nums', isPast ? 'text-zinc-300' : isCurrent ? 'text-blue-600' : 'text-zinc-400'].join(' ')}>
                          {hour === 12 ? '12pm' : hour > 12 ? `${hour - 12}pm` : `${hour}am`}
                        </span>
                      </div>
                      {/* Hour line */}
                      <div className={['flex-1 border-t mt-2.5', isCurrent ? 'border-blue-400' : 'border-zinc-100'].join(' ')} />
                    </div>
                  );
                })}

                {/* Current time indicator */}
                {isToday && (() => {
                  const now = new Date();
                  const nowMin = now.getHours() * 60 + now.getMinutes();
                  const startMin = TIMELINE_START_HOUR * 60;
                  const topPx = ((nowMin - startMin) / 60) * HOUR_HEIGHT_PX;
                  if (topPx < 0 || topPx > totalHours * HOUR_HEIGHT_PX) return null;
                  return (
                    <div
                      className="absolute left-14 right-0 flex items-center z-10 pointer-events-none"
                      style={{ top: `${topPx}px` }}
                    >
                      <div className="h-2.5 w-2.5 rounded-full bg-blue-500 -ml-1.5 shrink-0 shadow-sm" />
                      <div className="flex-1 border-t-2 border-blue-500" />
                    </div>
                  );
                })()}

                {/* Appointment blocks */}
                <div className="absolute left-14 right-0 top-0 bottom-0">
                  {appointments.length === 0 && (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center py-10">
                        <svg className="h-10 w-10 text-zinc-200 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm font-medium text-zinc-400">No appointments today</p>
                        <p className="text-xs text-zinc-300 mt-1">Enjoy your free time!</p>
                      </div>
                    </div>
                  )}

                  {appointments.map((appt, idx) => {
                    const { topPx, heightPx, color } = getTimelineBlock(appt, idx);
                    const isCompleted = appt.status === 'COMPLETED';
                    const isCancelled = appt.status === 'CANCELLED';
                    return (
                      <div
                        key={appt.publicId}
                        className={[
                          'absolute left-1 right-2 rounded-2xl border-l-4 px-3 py-2 overflow-hidden transition-all duration-200',
                          isCompleted ? 'bg-zinc-100 border-zinc-300 opacity-60' :
                          isCancelled ? 'bg-zinc-50 border-zinc-200 opacity-40' :
                          color.bg + ' ' + color.border,
                        ].join(' ')}
                        style={{ top: `${topPx}px`, height: `${heightPx}px` }}
                      >
                        <div className="flex items-start justify-between gap-2 h-full">
                          <div className="min-w-0 flex-1">
                            <p className={[
                              'text-xs font-bold leading-tight truncate',
                              isCompleted || isCancelled ? 'text-zinc-500' : color.text,
                            ].join(' ')}>
                              {appt.serviceName}
                            </p>
                            {heightPx > 40 && (
                              <p className={[
                                'text-[11px] mt-0.5 truncate',
                                isCompleted || isCancelled ? 'text-zinc-400' : color.text + '/70',
                              ].join(' ')}>
                                {appt.customerName || appt.guestName}
                              </p>
                            )}
                            {heightPx > 56 && (
                              <p className="text-[10px] text-zinc-500 mt-0.5">
                                {formatTime(appt.startTime)} – {formatTime(appt.endTime)}
                              </p>
                            )}
                          </div>
                          {/* Complete button */}
                          {appt.status === 'BOOKED' && heightPx > 44 && (
                            <button
                              type="button"
                              onClick={() => handleComplete(appt.publicId)}
                              disabled={loadingId === appt.publicId}
                              className={[
                                'shrink-0 h-7 w-7 rounded-full flex items-center justify-center transition-all active:scale-90',
                                color.bg,
                                'border border-white/50 hover:bg-white/50',
                              ].join(' ')}
                              aria-label="Mark complete"
                            >
                              {loadingId === appt.publicId ? (
                                <div className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                              ) : (
                                <svg className={['h-3.5 w-3.5', color.text].join(' ')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
