'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { AppointmentCard } from '@/components/appointments/AppointmentCard';
import { AppointmentTable } from '@/components/dashboard/AppointmentTable';
import { Spinner } from '@/components/ui/Spinner';
import type { Appointment } from '@/types/api';

type StatusFilter = 'ALL' | 'BOOKED' | 'COMPLETED' | 'CANCELLED';
type DateFilter = 'TODAY' | 'WEEK' | 'ALL';

const STATUS_FILTERS: StatusFilter[] = ['ALL', 'BOOKED', 'COMPLETED', 'CANCELLED'];
const DATE_FILTER_LABELS: Record<DateFilter, string> = {
  TODAY: 'Today',
  WEEK: 'This Week',
  ALL: 'All Time',
};

function isTodayAppt(appt: Appointment): boolean {
  const today = new Date();
  const d = new Date(appt.startTime);
  return d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
}

function isThisWeekAppt(appt: Appointment): boolean {
  const now = new Date();
  const d = new Date(appt.startTime);
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  return d >= weekStart && d < weekEnd;
}

const STATUS_CONFIG: Record<StatusFilter, { label: string; dot?: string }> = {
  ALL: { label: 'All' },
  BOOKED: { label: 'Confirmed', dot: 'bg-blue-500' },
  COMPLETED: { label: 'Completed', dot: 'bg-emerald-500' },
  CANCELLED: { label: 'Cancelled', dot: 'bg-zinc-400' },
};

export default function DashboardAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [dateFilter, setDateFilter] = useState<DateFilter>('ALL');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    api
      .getDashboardAppointments()
      .then((data) => {
        const now = new Date().getTime();
        const autoCompleted = data.map((appt) => {
          if (appt.status === 'BOOKED' && new Date(appt.endTime).getTime() <= now) {
            return { ...appt, status: 'COMPLETED' as const };
          }
          return appt;
        });
        const sorted = autoCompleted.sort(
          (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );
        setAppointments(sorted);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleCancel(publicId: string) {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }
    setLoadingId(`cancel-${publicId}`);
    try {
      await api.cancelAppointment(publicId);
      setAppointments((prev) =>
        prev.map((a) => (a.publicId === publicId ? { ...a, status: 'CANCELLED' } : a)),
      );
      window.location.reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to cancel.');
    } finally {
      setLoadingId(null);
    }
  }

  async function handleComplete(publicId: string) {
    setLoadingId(`complete-${publicId}`);
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

  // Apply both date and status filters
  let filtered = appointments;
  if (dateFilter === 'TODAY') filtered = filtered.filter(isTodayAppt);
  if (dateFilter === 'WEEK') filtered = filtered.filter(isThisWeekAppt);
  if (statusFilter !== 'ALL') filtered = filtered.filter((a) => a.status === statusFilter);

  // Count by status for current date filter
  const dateFiltered = dateFilter === 'TODAY'
    ? appointments.filter(isTodayAppt)
    : dateFilter === 'WEEK'
    ? appointments.filter(isThisWeekAppt)
    : appointments;

  const counts: Record<StatusFilter, number> = {
    ALL: dateFiltered.length,
    BOOKED: dateFiltered.filter((a) => a.status === 'BOOKED').length,
    COMPLETED: dateFiltered.filter((a) => a.status === 'COMPLETED').length,
    CANCELLED: dateFiltered.filter((a) => a.status === 'CANCELLED').length,
  };

  return (
    <div>
      <PageHeader title="Appointments" description="Manage all bookings for your business." />

      {/* Stats row */}
      {!loading && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {([
            { label: 'Today', value: appointments.filter(isTodayAppt).length, onClick: () => setDateFilter('TODAY'), active: dateFilter === 'TODAY' },
            { label: 'This week', value: appointments.filter(isThisWeekAppt).length, onClick: () => setDateFilter('WEEK'), active: dateFilter === 'WEEK' },
            { label: 'All time', value: appointments.length, onClick: () => setDateFilter('ALL'), active: dateFilter === 'ALL' },
          ]).map((stat) => (
            <button
              key={stat.label}
              type="button"
              onClick={stat.onClick}
              className={[
                'rounded-2xl border p-4 text-left transition-all duration-150 active:scale-[0.98]',
                stat.active ? 'bg-zinc-950 border-zinc-950 text-white' : 'bg-white border-zinc-200 hover:border-zinc-400',
              ].join(' ')}
            >
              <p className={['text-2xl font-black', stat.active ? 'text-white' : 'text-zinc-900'].join(' ')}>{stat.value}</p>
              <p className={['text-xs font-semibold mt-0.5', stat.active ? 'text-zinc-400' : 'text-zinc-500'].join(' ')}>{stat.label}</p>
            </button>
          ))}
        </div>
      )}

      {/* Status filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-5 scrollbar-none">
        {STATUS_FILTERS.map((f) => {
          const cfg = STATUS_CONFIG[f];
          const isActive = statusFilter === f;
          return (
            <button
              key={f}
              id={`filter-${f.toLowerCase()}`}
              type="button"
              onClick={() => setStatusFilter(f)}
              className={[
                'shrink-0 flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition-all duration-150 border active:scale-95',
                isActive
                  ? 'bg-zinc-900 border-zinc-900 text-white'
                  : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-900 hover:text-zinc-900',
              ].join(' ')}
            >
              {cfg.dot && <span className={['h-2 w-2 rounded-full shrink-0', isActive ? 'bg-white' : cfg.dot].join(' ')} />}
              {cfg.label}
              {counts[f] > 0 && (
                <span className={['text-xs rounded-full px-1.5', isActive ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-500'].join(' ')}>
                  {counts[f]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <Spinner className="h-8 w-8 text-zinc-900" />
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3.5 text-sm text-red-600 font-medium mb-4">
          {error}
        </div>
      )}

      {!loading && (
        <>
          {/* Mobile: card list */}
          <div className="md:hidden space-y-3 stagger-children">
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-sm font-semibold text-zinc-500">No appointments found.</p>
                <p className="text-xs text-zinc-400 mt-1">Try adjusting your filters.</p>
              </div>
            ) : (
              filtered.map((appt) => (
                <AppointmentCard
                  key={appt.publicId}
                  appointment={appt}
                  onCancel={handleCancel}
                  onComplete={handleComplete}
                  loading={loadingId === `cancel-${appt.publicId}` || loadingId === `complete-${appt.publicId}`}
                />
              ))
            )}
          </div>

          {/* Desktop: table */}
          <div className="hidden md:block bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
            <AppointmentTable
              appointments={filtered}
              onCancel={handleCancel}
              onComplete={handleComplete}
              loadingId={loadingId}
            />
          </div>
        </>
      )}
    </div>
  );
}
