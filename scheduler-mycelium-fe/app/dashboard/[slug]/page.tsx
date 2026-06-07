'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { AppointmentTable } from '@/components/dashboard/AppointmentTable';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import type { Appointment, BusinessBookingPage } from '@/types/api';
import { todayISO } from '@/lib/format';

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
  return d.toISOString().slice(0, 10);
}

export default function DashboardOverviewPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Fetch booking page to get soloOperator for sidebar
    api.getBookingPage(slug).then((biz: BusinessBookingPage) => {
      sessionStorage.setItem(`solo-${slug}`, String(biz.soloOperator));
    }).catch(() => { /* non-critical */ });

    api
      .getDashboardAppointments()
      .then((data) => {
        const sorted = [...data].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        setAppointments(sorted);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  const today = todayISO();
  const weekStart = startOfWeekISO();

  const todayCount = appointments.filter(
    (a) => a.startTime.slice(0, 10) === today,
  ).length;
  const weekCount = appointments.filter(
    (a) => a.startTime.slice(0, 10) >= weekStart && a.startTime.slice(0, 10) <= today,
  ).length;
  const pendingCount = appointments.filter((a) => a.status === 'BOOKED').length;
  const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length;

  const recent = [...appointments]
    .sort((a, b) => b.startTime.localeCompare(a.startTime))
    .slice(0, 10);

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
        description={`Booking link: /book/${slug}`}
        action={
          <div className="flex gap-2">
            <Link href={`/dashboard/${slug}/services`}>
              <Button id="add-service-quick" variant="secondary" size="sm">
                + Add Service
              </Button>
            </Link>
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
        <>
          {/* Stats */}
          <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatsCard label="Today" value={todayCount} icon={<CalendarTodayIcon />} color="blue" />
            <StatsCard label="This Week" value={weekCount} icon={<WeekIcon />} color="gray" />
            <StatsCard label="Pending" value={pendingCount} icon={<ClockIcon />} color="yellow" />
            <StatsCard label="Completed" value={completedCount} icon={<CheckIcon />} color="green" />
          </div>

          {/* Recent appointments */}
          <div className="bg-white border border-gray-200 rounded-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-sm font-semibold text-gray-900">Recent Appointments</h2>
              <Link
                href={`/dashboard/${slug}/appointments`}
                className="text-sm text-gray-900 hover:text-black hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="px-0">
              <AppointmentTable appointments={recent} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
