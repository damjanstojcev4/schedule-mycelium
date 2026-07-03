'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { AppointmentCard } from '@/components/appointments/AppointmentCard';
import { AppointmentTable } from '@/components/dashboard/AppointmentTable';
import { CalendarView } from '@/components/dashboard/CalendarView';
import { SlotActionModal } from '@/components/dashboard/SlotActionModal';
import { Spinner } from '@/components/ui/Spinner';
import type { Appointment, StaffMember, Service, TimeBlockResponse, StaffScheduleResponseDTO } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';
import { localDateISO } from '@/lib/format';

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
  const { auth } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [dateFilter, setDateFilter] = useState<DateFilter>('ALL');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [calendarDate, setCalendarDate] = useState(localDateISO(new Date()));
  const [selectedSlot, setSelectedSlot] = useState<{ staff: StaffMember; timeString: string } | null>(null);
  const [timeBlocks, setTimeBlocks] = useState<Record<string, TimeBlockResponse[]>>({});
  const [schedules, setSchedules] = useState<Record<string, StaffScheduleResponseDTO>>({});

  const fetchData = useCallback(() => {
    if (!auth?.businessPublicId) return;
    const fetchAppointments = api.getDashboardAppointments();
    const fetchStaff = api.getStaff(auth.businessPublicId);
    const fetchServices = api.getServices(auth.businessPublicId);

    Promise.all([fetchAppointments, fetchStaff, fetchServices])
      .then(([apptsData, staffData, servicesData]) => {
        const now = new Date().getTime();
        const autoCompleted = apptsData.map((appt) => {
          if (appt.status === 'BOOKED' && new Date(appt.endTime).getTime() <= now) {
            return { ...appt, status: 'COMPLETED' as const };
          }
          return appt;
        });
        const apptsWithColors = autoCompleted.map((appt) => {
          if (appt.serviceColor && appt.serviceColor !== '#3b82f6') return appt; // Already has custom color
          const matchingService = servicesData.find(s => s.name === appt.serviceName);
          return {
            ...appt,
            serviceColor: matchingService?.color || '#3b82f6'
          };
        });

        const sorted = apptsWithColors.sort(
          (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );
        setAppointments(sorted);
        setStaffList(staffData);
        setServices(servicesData);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [auth]);

  const fetchTimeBlocks = useCallback(() => {
    if (!auth?.businessPublicId || staffList.length === 0) return;
    const fetchAllBlocks = staffList.map(staff => 
      api.getTimeBlocks(auth.businessPublicId!, staff.publicId, calendarDate)
        .then(blocks => ({ staffId: staff.publicId, blocks }))
    );
    Promise.all(fetchAllBlocks).then(results => {
      const newBlocks: Record<string, TimeBlockResponse[]> = {};
      results.forEach(r => newBlocks[r.staffId] = r.blocks);
      setTimeBlocks(newBlocks);
    });
  }, [auth, staffList, calendarDate]);

  const fetchSchedules = useCallback(() => {
    if (!auth?.businessPublicId || staffList.length === 0) return;
    const fetchAll = staffList.map(staff => 
      api.getStaffSchedule(auth.businessPublicId!, staff.publicId)
        .then(schedule => ({ staffId: staff.publicId, schedule }))
    );
    Promise.all(fetchAll).then(results => {
      const newSchedules: Record<string, StaffScheduleResponseDTO> = {};
      results.forEach(r => newSchedules[r.staffId] = r.schedule);
      setSchedules(newSchedules);
    });
  }, [auth, staffList]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchTimeBlocks();
  }, [fetchTimeBlocks]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
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
      <PageHeader 
        title="Appointments" 
        description="Manage all bookings for your business."
        action={
          <div className="flex bg-zinc-100 p-1 rounded-lg border border-zinc-200">
            <button 
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              List View
            </button>
            <button 
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-all ${viewMode === 'calendar' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              Calendar View
            </button>
          </div>
        }
      />

      {viewMode === 'list' && !loading && (
        <>
          {/* Stats row */}
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
        </>
      )}

      {!loading && viewMode === 'calendar' && (
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-zinc-200 p-4 rounded-xl shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-zinc-900">
              {new Date(calendarDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
            <p className="text-xs text-zinc-500">Select a day to view schedule</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <button
              onClick={() => {
                const d = new Date(calendarDate);
                d.setDate(d.getDate() - 1);
                setCalendarDate(localDateISO(d));
              }}
              className="p-2 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
            >
              <svg className="w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <input
              type="date"
              value={calendarDate}
              onChange={(e) => setCalendarDate(e.target.value)}
              className="px-3 py-2 border border-zinc-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-zinc-900 focus:outline-none"
            />
            <button
              onClick={() => {
                const d = new Date(calendarDate);
                d.setDate(d.getDate() + 1);
                setCalendarDate(localDateISO(d));
              }}
              className="p-2 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
            >
              <svg className="w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={() => setCalendarDate(localDateISO(new Date()))}
              className="px-3 py-2 bg-zinc-900 text-white text-sm font-semibold rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Today
            </button>
          </div>
        </div>
      )}

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

      {!loading && viewMode === 'list' && (
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
      
      {!loading && viewMode === 'calendar' && (
        <CalendarView
          appointments={appointments}
          staffList={staffList}
          timeBlocks={timeBlocks}
          schedules={schedules}
          currentDate={calendarDate}
          onCancel={handleCancel}
          onComplete={handleComplete}
          onSlotClick={(staffPublicId, timeString) => {
            const staff = staffList.find(s => s.publicId === staffPublicId);
            if (staff) setSelectedSlot({ staff, timeString });
          }}
          loadingId={loadingId}
        />
      )}

      {selectedSlot && auth?.businessPublicId && auth?.slug && (
        <SlotActionModal
          isOpen={true}
          onClose={() => setSelectedSlot(null)}
          staff={selectedSlot.staff}
          timeString={selectedSlot.timeString}
          dateString={calendarDate}
          services={services}
          businessSlug={auth.slug}
          businessPublicId={auth.businessPublicId}
          onSuccess={() => {
            setSelectedSlot(null);
            fetchData();
            fetchTimeBlocks();
          }}
        />
      )}
    </div>
  );
}
