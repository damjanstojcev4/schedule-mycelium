'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import type { Appointment, BusinessBookingPage } from '@/types/api';
import { todayISO, formatTime, localDateISO } from '@/lib/format';

function CalendarTodayIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function WeekIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function startOfWeekISO(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return localDateISO(d);
}

export default function DashboardOverviewPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;
    // Fetch booking page to get soloOperator for sidebar
    api.getBookingPage(slug).then((biz: BusinessBookingPage) => {
      sessionStorage.setItem(`solo-${slug}`, String(biz.soloOperator));
    }).catch(() => { /* non-critical */ });

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
        const sorted = autoCompleted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        setAppointments(sorted);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  const today = todayISO();
  const weekStart = startOfWeekISO();

  // Stats Counts
  const todayCount = appointments.filter(
    (a) => a.startTime.slice(0, 10) === today,
  ).length;
  const weekCount = appointments.filter(
    (a) => a.startTime.slice(0, 10) >= weekStart && a.startTime.slice(0, 10) <= today,
  ).length;
  const pendingCount = appointments.filter((a) => a.status === 'BOOKED').length;
  const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length;

  // Today's Agenda Appointments
  const todayAppointments = [...appointments]
    .filter((a) => a.startTime.slice(0, 10) === today)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Service Popularity calculations (Top 5 services)
  const serviceCounts: Record<string, number> = {};
  appointments.forEach((appt) => {
    serviceCounts[appt.serviceName] = (serviceCounts[appt.serviceName] || 0) + 1;
  });

  const totalBookings = appointments.length;
  const popularServices = Object.entries(serviceCounts)
    .map(([name, count]) => ({
      name,
      count,
      percentage: totalBookings > 0 ? Math.round((count / totalBookings) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  async function copyBookingLink() {
    const url = `${window.location.origin}/book/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <PageHeader
        title="Overview"
        action={
          <div className="flex gap-2">
            <Button
              id="copy-booking-link"
              variant="primary"
              size="sm"
              onClick={copyBookingLink}
            >
              {copied ? '✓ Copied!' : 'Share Booking Link'}
            </Button>
          </div>
        }
      />

      {loading && (
        <div className="flex justify-center py-20">
          <Spinner className="h-8 w-8 text-gray-900" />
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-6">
          {error}
        </div>
      )}

      {!loading && (
        <div className="space-y-6">
          {/* Stats Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard label="Today" value={todayCount} icon={<CalendarTodayIcon />} color="blue" />
            <StatsCard label="This Week" value={weekCount} icon={<WeekIcon />} color="gray" />
            <StatsCard label="Pending" value={pendingCount} icon={<ClockIcon />} color="yellow" />
            <StatsCard label="Completed" value={completedCount} icon={<CheckIcon />} color="green" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Agenda & Popularity */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Today's Agenda */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                  <h2 className="text-sm font-semibold text-gray-900">Today's Agenda</h2>
                  <span className="text-xs text-gray-500 font-medium">
                    {todayAppointments.length} scheduled
                  </span>
                </div>
                <div className="p-6">
                  {todayAppointments.length === 0 ? (
                    <div className="text-center py-10">
                      <svg className="h-10 w-10 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm font-semibold text-gray-500">No appointments scheduled for today.</p>
                      <p className="text-xs text-gray-400 mt-1">Keep sharing your booking page to get slots filled!</p>
                    </div>
                  ) : (
                    <div className="flow-root">
                      <ul className="-mb-8">
                        {todayAppointments.map((appt, idx) => (
                          <li key={appt.publicId}>
                            <div className="relative pb-8">
                              {idx !== todayAppointments.length - 1 && (
                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                              )}
                              <div className="relative flex space-x-3">
                                <div>
                                  <span className="h-8 w-8 rounded-full bg-gray-900 flex items-center justify-center ring-8 ring-white text-xs font-bold text-white">
                                    {formatTime(appt.startTime)}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                                  <div>
                                    <p className="text-sm font-semibold text-gray-900">
                                      {appt.serviceName}{' '}
                                      <span className="font-normal text-gray-500">
                                        for {appt.customerName ?? appt.guestName ?? 'Guest'}
                                      </span>
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                      Duration: {appt.endTime ? `${formatTime(appt.startTime)} – ${formatTime(appt.endTime)}` : '—'} · Staff: {appt.staffName ?? '—'}
                                    </p>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <Badge status={appt.status} />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Service Popularity Widget */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                  <h2 className="text-sm font-semibold text-gray-900">Service Popularity</h2>
                  <span className="text-xs text-gray-500 font-medium">All-time bookings</span>
                </div>
                <div className="p-6">
                  {popularServices.length === 0 ? (
                    <div className="text-center py-6 text-sm text-gray-500">
                      No service stats available yet.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {popularServices.map((svc) => (
                        <div key={svc.name} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-gray-700">{svc.name}</span>
                            <span className="text-gray-500">{svc.count} ({svc.percentage}%)</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                              className="bg-gray-900 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${svc.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Right Column: Quick Actions Hub */}
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h2 className="text-sm font-semibold text-gray-900">Quick Access Hub</h2>
                </div>
                <div className="p-6 space-y-3">
                  <Link href={`/dashboard/${slug}/appointments`} className="block">
                    <button type="button" className="w-full flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                      <span>Calendar Appointments</span>
                      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </Link>

                  <Link href={`/dashboard/${slug}/services`} className="block">
                    <button type="button" className="w-full flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                      <span>Manage Services</span>
                      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </Link>

                  <Link href={`/dashboard/${slug}/settings`} className="block">
                    <button type="button" className="w-full flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                      <span>Settings & Hours</span>
                      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </Link>

                  <a href={`/book/${slug}`} target="_blank" rel="noopener noreferrer" className="block">
                    <button type="button" className="w-full flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                      <span>View Live Booking Page</span>
                      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
