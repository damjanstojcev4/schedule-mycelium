'use client';

import { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';
import { TimeBlockResponse, Appointment, StaffMember } from '@/types/api';
import { Modal } from '@/components/ui/Modal';
import { useParams } from 'next/navigation';
import { localDateISO } from '@/lib/format';
import { PageHeader } from '@/components/layout/PageHeader';

/* ── Icons ─────────────────────────────────────────────────────── */

function ChevronLeftIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function ClockSmallIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function BlockIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

/* ── Duration presets ───────────────────────────────────────────── */

const DURATION_PRESETS = [
  { label: '30m', minutes: 30 },
  { label: '1h',  minutes: 60 },
  { label: '2h',  minutes: 120 },
  { label: 'Half Day', minutes: 240 },
  { label: 'Full Day', minutes: 780 },
];

function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + mins;
  const fh = Math.min(Math.floor(total / 60), 20);
  const fm = total % 60;
  return `${String(fh).padStart(2, '0')}:${String(fm).padStart(2, '0')}`;
}

/* ── Main Component ─────────────────────────────────────────────── */

export default function SchedulePage() {
  const { slug } = useParams() as { slug: string };
  const [currentDate, setCurrentDate]   = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [blocks, setBlocks]             = useState<TimeBlockResponse[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staffList, setStaffList]       = useState<StaffMember[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');

  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError]               = useState('');
  const [soloOperator, setSoloOperator] = useState(false);

  const [fromTime, setFromTime] = useState('09:00');
  const [toTime, setToTime]     = useState('10:00');
  const [reason, setReason]     = useState('');
  const [blockMode, setBlockMode]       = useState<'TIME' | 'OFF_DAYS'>('TIME');
  const [offStartDate, setOffStartDate] = useState(localDateISO(new Date()));
  const [offEndDate, setOffEndDate]     = useState(localDateISO(new Date()));
  
  const [hoverSlot, setHoverSlot]       = useState<{ top: number, timeString: string } | null>(null);

  /* ── Load ─────────────────────────────────────────────────────── */

  useEffect(() => {
    const raw = sessionStorage.getItem(`solo-${slug}`);
    if (raw === 'true') setSoloOperator(true);
    api.getDashboardAppointments().then(setAppointments).catch(console.error);
    api.getBusinesses().then(businesses => {
      const biz = businesses.find(b => b.slug === slug);
      if (biz) {
        api.getStaff(biz.publicId).then(staff => {
          setStaffList(staff);
          if (staff.length > 0) setSelectedStaffId(staff[0].publicId);
        }).catch(console.error);
      }
    });
  }, [slug]);

  const loadBlocks = async (date: Date, staffId: string) => {
    if (!staffId) return;
    try {
      const businesses = await api.getBusinesses();
      const biz = businesses.find(b => b.slug === slug);
      if (!biz) return;
      const res = await api.getTimeBlocks(biz.publicId, staffId, localDateISO(date));
      setBlocks(res);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { loadBlocks(selectedDate, selectedStaffId); }, [selectedDate, selectedStaffId, slug]);

  /* ── Calendar ─────────────────────────────────────────────────── */

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const startingDay = firstDay === 0 ? 6 : firstDay - 1;
    const days: (Date | null)[] = [];
    for (let i = 0; i < startingDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const selectedDateStr = localDateISO(selectedDate);

  useEffect(() => {
    if (isModalOpen) {
      setOffStartDate(selectedDateStr);
      setOffEndDate(selectedDateStr);
      setBlockMode('TIME');
    }
  }, [isModalOpen, selectedDateStr]);

  /* ── Derived data ─────────────────────────────────────────────── */

  const todaysAppointments = appointments.filter(a =>
    a.startTime.startsWith(selectedDateStr) &&
    (selectedStaffId
      ? a.staffName === staffList.find(s => s.publicId === selectedStaffId)?.name
      : true)
  );

  const datesWithEvents = useMemo(() => {
    const set = new Set<string>();
    appointments.forEach(a => {
      if (selectedStaffId) {
        const name = staffList.find(s => s.publicId === selectedStaffId)?.name;
        if (a.staffName === name) set.add(a.startTime.slice(0, 10));
      } else {
        set.add(a.startTime.slice(0, 10));
      }
    });
    blocks.forEach(b => set.add(b.blockDate));
    return set;
  }, [appointments, blocks, selectedStaffId, staffList]);

  const totalBlockedMinutes = blocks.reduce((acc, b) => {
    const [sh, sm] = b.startTime.split(':').map(Number);
    const [eh, em] = b.endTime.split(':').map(Number);
    return acc + (eh * 60 + em) - (sh * 60 + sm);
  }, 0);

  /* ── Handlers ─────────────────────────────────────────────────── */

  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (blockMode === 'TIME') {
      if (fromTime >= toTime) { setError('Start time must be before end time'); return; }
      const today = new Date(); today.setHours(0,0,0,0);
      if (selectedDate < today) { setError('Cannot block time in the past'); return; }
    } else {
      if (offStartDate > offEndDate) { setError('Start date must be before or equal to end date'); return; }
    }
    setIsSubmitting(true);
    try {
      const businesses = await api.getBusinesses();
      const biz = businesses.find(b => b.slug === slug);
      if (!biz) throw new Error('Business not found');
      if (blockMode === 'TIME') {
        await api.createTimeBlock(biz.publicId, selectedStaffId, {
          blockDate: selectedDateStr, startTime: fromTime + ':00', endTime: toTime + ':00', reason
        });
      } else {
        const start = new Date(offStartDate), end = new Date(offEndDate);
        const promises = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          promises.push(api.createTimeBlock(biz.publicId, selectedStaffId, {
            blockDate: localDateISO(d), startTime: '00:00:00', endTime: '23:59:59',
            reason: reason || 'Off day'
          }));
        }
        await Promise.all(promises);
      }
      setIsModalOpen(false); setFromTime('09:00'); setToTime('10:00'); setReason('');
      loadBlocks(selectedDate, selectedStaffId);
    } catch (err: any) { setError(err.message || 'Failed to create block'); }
    finally { setIsSubmitting(false); }
  };

  const handleDeleteBlock = async (blockPublicId: string) => {
    if (!confirm('Delete this time block?')) return;
    try {
      const businesses = await api.getBusinesses();
      const biz = businesses.find(b => b.slug === slug);
      if (!biz) return;
      await api.deleteTimeBlock(biz.publicId, selectedStaffId, blockPublicId);
      loadBlocks(selectedDate, selectedStaffId);
    } catch { alert('Failed to delete block'); }
  };

  /* ── Timeline helpers ─────────────────────────────────────────── */

  const hours = Array.from({ length: 13 }, (_, i) => i + 8);

  const getTop = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const rh = Math.max(8, h), rm = h < 8 ? 0 : m;
    return { top: `${((rh - 8) * 60 + rm) / 60 * 4}rem` };
  };

  const getHeight = (startStr: string, endStr: string) => {
    const [sh, sm] = startStr.split(':').map(Number);
    const [eh, em] = endStr.split(':').map(Number);
    const start = Math.max(8 * 60, sh * 60 + sm);
    const end   = Math.min(21 * 60, eh * 60 + em);
    return { height: `${Math.max(0, end - start) / 60 * 4}rem` };
  };

  /* ── Current time line ────────────────────────────────────────── */

  const now = new Date();
  const isToday = isSameDay(selectedDate, now);
  const showTimeLine = isToday && now.getHours() >= 8 && now.getHours() <= 20;
  const timeLineTop  = ((now.getHours() - 8) * 60 + now.getMinutes()) / 60 * 4;

  /* ── Time options ─────────────────────────────────────────────── */

  const timeOptions = useMemo(() =>
    Array.from({ length: 13 }, (_, h) => h + 8).flatMap(h =>
      [0, 15, 30, 45].map(m =>
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      )
    ), []);

  const blockedHours = Math.floor(totalBlockedMinutes / 60);
  const blockedMins  = totalBlockedMinutes % 60;

  /* ── Render ───────────────────────────────────────────────────── */

  return (
    <div>
      <PageHeader
        title="Block Time"
        description="Manage your schedule by blocking off unavailable time slots"
        action={
          !soloOperator && staffList.length > 0 ? (
            <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-xl px-3 py-2 shadow-sm">
              <UserIcon />
              <select
                className="bg-transparent text-sm font-medium text-zinc-800 border-none focus:ring-0 focus:outline-none cursor-pointer"
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
              >
                {staffList.map(s => (
                  <option key={s.publicId} value={s.publicId}>{s.name}</option>
                ))}
              </select>
            </div>
          ) : undefined
        }
      />

      <div className="flex flex-col lg:flex-row gap-5">

        {/* ── Left: Calendar + Summary ──────────────────────── */}
        <div className="w-full lg:w-72 shrink-0 space-y-4">

          {/* Calendar card — matches Appointments tab style */}
          <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
            {/* Month header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
              <span className="text-sm font-bold text-zinc-900">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                  className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors"
                >
                  <ChevronLeftIcon />
                </button>
                <button
                  onClick={() => { setCurrentDate(new Date()); setSelectedDate(new Date()); }}
                  className="px-2.5 py-1 text-xs font-semibold bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                  className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors"
                >
                  <ChevronRightIcon />
                </button>
              </div>
            </div>

            {/* Day grid */}
            <div className="px-3 pt-2 pb-3">
              <div className="grid grid-cols-7 text-center mb-1">
                {['Mo','Tu','We','Th','Fr','Sa','Su'].map(d => (
                  <div key={d} className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 text-center gap-y-0.5">
                {generateCalendar().map((date, i) => {
                  if (!date) return <div key={`e-${i}`} />;
                  const isSelected = isSameDay(date, selectedDate);
                  const isTodayDate = isSameDay(date, new Date());
                  const isPast = date < new Date(new Date().setHours(0,0,0,0));
                  const hasEvents = datesWithEvents.has(localDateISO(date));

                  return (
                    <button
                      key={localDateISO(date)}
                      onClick={() => setSelectedDate(date)}
                      className={[
                        'relative mx-auto w-8 h-8 flex flex-col items-center justify-center rounded-lg text-sm font-medium transition-colors',
                        isSelected  ? 'bg-zinc-950 text-white' :
                        isTodayDate ? 'bg-zinc-100 text-zinc-900 ring-2 ring-inset ring-zinc-900' :
                        isPast      ? 'text-zinc-300 hover:bg-zinc-50' :
                                      'text-zinc-700 hover:bg-zinc-50',
                      ].join(' ')}
                    >
                      <span className="leading-none text-xs">{date.getDate()}</span>
                      {hasEvents && !isSelected && (
                        <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-zinc-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Summary card */}
          <div className="bg-white border border-zinc-200 rounded-xl shadow-sm p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
              {selectedDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-3">
                <p className="text-2xl font-black text-zinc-900">{todaysAppointments.length}</p>
                <p className="text-xs font-semibold text-zinc-500 mt-0.5">Appointments</p>
              </div>
              <div className="rounded-lg border border-zinc-100 bg-zinc-50 p-3">
                <p className="text-2xl font-black text-zinc-900">{blocks.length}</p>
                <p className="text-xs font-semibold text-zinc-500 mt-0.5">Blocks</p>
              </div>
            </div>
            {totalBlockedMinutes > 0 && (
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <ClockSmallIcon />
                <span>
                  <span className="font-semibold text-zinc-800">
                    {blockedHours > 0 ? `${blockedHours}h ` : ''}{blockedMins > 0 ? `${blockedMins}m` : ''}
                  </span>{' '}blocked
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Day View ───────────────────────────────── */}
        <div className="lg:flex-1 bg-white border border-zinc-200 rounded-xl shadow-sm flex flex-col h-[640px] overflow-hidden">

          {/* Day view header */}
          <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
            <div>
              <p className="text-sm font-bold text-zinc-900">
                {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              {isToday && (
                <p className="text-xs text-zinc-500 mt-0.5">
                  {now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={!selectedStaffId}
              className="inline-flex items-center gap-1.5 bg-zinc-900 text-white px-3.5 py-2 rounded-xl text-sm font-semibold hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors active:scale-[0.97]"
            >
              <PlusIcon />
              Block Time
            </button>
          </div>

          {/* Timeline */}
          <div className="flex-1 overflow-y-auto relative">
            <div className="absolute top-0 left-0 w-16 h-full border-r border-zinc-100 bg-zinc-50/40" />

            <div className="relative min-h-full" style={{ height: `${13 * 4}rem` }}>
              <div className="absolute inset-0 z-0 cursor-pointer hidden md:block"
                onMouseMove={(e) => {
                  if (!selectedStaffId) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const y = e.clientY - rect.top;
                  // Snap to 15-minute intervals (1rem = 16px = 15 mins)
                  const snappedY = Math.floor(y / 16) * 16;
                  // Convert 64px per hour (4rem) to hours
                  const hoursFrom8 = snappedY / 64;
                  const totalHours = 8 + hoursFrom8;
                  const hr = Math.floor(totalHours);
                  const min = Math.round((totalHours - hr) * 60);
                  let finalHr = hr;
                  let finalMin = min;
                  if (finalMin >= 60) { finalHr++; finalMin = 0; }
                  if (finalHr >= 21) return;
                  const timeString = `${String(finalHr).padStart(2, '0')}:${String(finalMin).padStart(2, '0')}`;
                  setHoverSlot({ top: snappedY, timeString });
                }}
                onMouseLeave={() => setHoverSlot(null)}
                onClick={() => {
                  if (hoverSlot && selectedStaffId) {
                    setFromTime(hoverSlot.timeString);
                    setToTime(addMinutes(hoverSlot.timeString, 60));
                    setBlockMode('TIME');
                    setIsModalOpen(true);
                  }
                }}
              >
                {hoverSlot && selectedStaffId && (
                  <div 
                    className="absolute left-16 right-4 ml-2 mr-2 h-[4rem] rounded-lg border border-zinc-300 bg-zinc-100/50 pointer-events-none flex items-center justify-center z-10 shadow-sm" 
                    style={{ top: `${hoverSlot.top / 16}rem` }}
                  >
                     <span className="text-xs font-bold text-zinc-500 bg-white/80 px-2 py-1 rounded shadow-sm">+ Block at {hoverSlot.timeString}</span>
                  </div>
                )}
              </div>
              {/* Hour rows */}
              {hours.map((hour, i) => (
                <div key={hour} className="absolute w-full border-t border-zinc-100 flex pointer-events-none" style={{ top: `${i * 4}rem`, height: '4rem' }}>
                  <div className="w-16 shrink-0 text-right pr-3 pt-2 text-xs text-zinc-400 font-medium select-none">
                    {String(hour).padStart(2, '0')}:00
                  </div>
                </div>
              ))}

              {/* Current time line */}
              {showTimeLine && (
                <div className="absolute left-0 right-0 z-30 flex items-center pointer-events-none"
                  style={{ top: `${timeLineTop}rem` }}>
                  <div className="w-16 flex justify-end pr-1.5">
                    <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                      {String(now.getHours()).padStart(2,'0')}:{String(now.getMinutes()).padStart(2,'0')}
                    </span>
                  </div>
                  <div className="flex-1 h-0.5 bg-red-400 relative">
                    <div className="absolute -left-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500" />
                  </div>
                </div>
              )}

              {/* Appointments */}
              {todaysAppointments.map(app => {
                const startTime = app.startTime.split('T')[1];
                const endTime   = app.endTime.split('T')[1];
                const [sh, sm]  = startTime.split(':').map(Number);
                const [eh, em]  = endTime.split(':').map(Number);
                const diff = (eh * 60 + em) - (sh * 60 + sm);
                const isSmall = diff <= 30;
                const color = app.serviceColor || '#6366f1';

                return (
                  <div
                    key={app.publicId}
                    className={`absolute left-16 right-4 ml-2 mr-2 rounded-lg overflow-hidden transition-all hover:shadow-sm pointer-events-auto ${
                      isSmall ? 'flex flex-row items-center gap-2 px-3 py-1' : 'flex flex-col p-2.5'
                    }`}
                    style={{
                      ...getTop(startTime), ...getHeight(startTime, endTime),
                      minHeight: diff <= 15 ? '1.75rem' : undefined,
                      zIndex: diff <= 15 ? 10 : 2,
                      backgroundColor: `${color}18`,
                      borderLeft: `3px solid ${color}`,
                      border: `1px solid ${color}28`,
                      borderLeftWidth: '3px',
                      borderLeftColor: color,
                    }}
                  >
                    <div className="text-xs font-bold truncate" style={{ color }}>{app.serviceName}</div>
                    <div className={`text-xs truncate ${isSmall ? '' : 'mt-0.5'}`} style={{ color: `${color}bb` }}>
                      {isSmall ? '· ' : ''}{app.customerName || app.guestName || 'Walk-in'}
                    </div>
                    {!isSmall && (
                      <div className="text-[10px] mt-1 flex items-center gap-1" style={{ color: `${color}88` }}>
                        <ClockSmallIcon />
                        {startTime.slice(0,5)} – {endTime.slice(0,5)}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Time blocks */}
              {blocks.map(block => {
                const [sh, sm] = block.startTime.split(':').map(Number);
                const [eh, em] = block.endTime.split(':').map(Number);
                const diff = (eh * 60 + em) - (sh * 60 + sm);
                const isSmall = diff <= 30;

                return (
                  <div
                    key={block.publicId}
                    className={`absolute left-16 right-4 ml-2 mr-2 rounded-lg overflow-hidden group cursor-pointer transition-all hover:shadow-sm border border-zinc-200 border-l-[3px] border-l-zinc-400 pointer-events-auto ${
                      isSmall ? 'flex flex-row items-center px-3 py-1 gap-2' : 'flex flex-col p-2.5'
                    }`}
                    style={{
                      ...getTop(block.startTime), ...getHeight(block.startTime, block.endTime),
                      minHeight: diff <= 15 ? '1.75rem' : undefined,
                      zIndex: diff <= 15 ? 5 : 1,
                      backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 6px, rgba(0,0,0,0.03) 6px, rgba(0,0,0,0.03) 12px)',
                    }}
                  >
                    <div className={`flex ${isSmall ? 'items-center gap-2' : 'items-start justify-between'} w-full`}>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-zinc-400 shrink-0"><BlockIcon /></span>
                        <span className="text-xs font-semibold text-zinc-600">Blocked</span>
                        {block.reason && isSmall && (
                          <span className="text-xs text-zinc-400 truncate">· {block.reason}</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteBlock(block.publicId)}
                        className={`text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all ${isSmall ? 'ml-auto' : ''}`}
                        title="Remove block"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                    {!isSmall && block.reason && (
                      <p className="text-xs text-zinc-400 mt-0.5 truncate">{block.reason}</p>
                    )}
                    {!isSmall && (
                      <p className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1">
                        <ClockSmallIcon />
                        {block.startTime.slice(0,5)} – {block.endTime.slice(0,5)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal ─────────────────────────────────────────────── */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Block Time">
        <form onSubmit={handleCreateBlock} className="space-y-4">

          {/* Segmented control */}
          <div className="relative flex bg-zinc-100 p-1 rounded-xl border border-zinc-200">
            <div
              className="absolute top-1 bottom-1 rounded-lg bg-white shadow-sm transition-all duration-200 ease-out"
              style={{ left: blockMode === 'TIME' ? '0.25rem' : '50%', width: 'calc(50% - 0.25rem)' }}
            />
            {(['TIME', 'OFF_DAYS'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setBlockMode(mode)}
                className={`relative z-10 flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  blockMode === mode ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'
                }`}
              >
                {mode === 'TIME' ? 'Specific Time' : 'Off Days'}
              </button>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 rounded-xl border border-red-200">
              <svg className="h-4 w-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              {error}
            </div>
          )}

          {blockMode === 'TIME' ? (
            <>
              {/* Date display */}
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Date</label>
                <div className="flex items-center gap-2 bg-zinc-50 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm text-zinc-600">
                  <CalendarIcon />
                  {selectedDate.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>

              {/* Quick presets */}
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-2">Quick Select</label>
                <div className="flex flex-wrap gap-2">
                  {DURATION_PRESETS.map(preset => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        if (preset.minutes >= 720) { setFromTime('08:00'); setToTime('20:00'); }
                        else if (preset.minutes >= 240) { setFromTime('08:00'); setToTime('12:00'); }
                        else setToTime(addMinutes(fromTime, preset.minutes));
                      }}
                      className="px-3 py-1.5 text-xs font-semibold bg-zinc-50 hover:bg-zinc-100 text-zinc-700 rounded-lg border border-zinc-200 hover:border-zinc-300 transition-colors active:scale-95"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time selectors */}
              <div className="grid grid-cols-2 gap-4">
                {[{ label: 'From', value: fromTime, set: setFromTime }, { label: 'To', value: toTime, set: setToTime }].map(({ label, value, set }) => (
                  <div key={label}>
                    <label className="block text-sm font-semibold text-zinc-700 mb-1.5">{label}</label>
                    <select
                      required value={value}
                      onChange={e => set(e.target.value)}
                      className="block w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm font-medium shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-colors"
                    >
                      {timeOptions.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Start Date', value: offStartDate, set: setOffStartDate },
                { label: 'End Date',   value: offEndDate,   set: setOffEndDate   },
              ].map(({ label, value, set }) => (
                <div key={label}>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1.5">{label}</label>
                  <input
                    type="date" required value={value}
                    onChange={e => set(e.target.value)}
                    className="block w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm font-medium shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-colors"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Reason (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Meeting, Personal, Training"
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="block w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-colors placeholder:text-zinc-400"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors active:scale-[0.97] shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-40 transition-colors active:scale-[0.97] shadow-sm"
            >
              {isSubmitting
                ? <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Saving…
                  </span>
                : 'Save Block'
              }
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
