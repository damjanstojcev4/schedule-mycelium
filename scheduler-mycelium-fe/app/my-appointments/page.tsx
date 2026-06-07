'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { getStoredAuth } from '@/lib/auth';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import type { Appointment } from '@/types/api';
import { formatDate, formatTime } from '@/lib/format';

type Tab = 'upcoming' | 'past';

function isUpcoming(appt: Appointment): boolean {
  return (
    appt.status === 'BOOKED' &&
    new Date(appt.startTime) > new Date()
  );
}

function isPast(appt: Appointment): boolean {
  return appt.status === 'COMPLETED' || appt.status === 'CANCELLED' ||
    (appt.status === 'BOOKED' && new Date(appt.startTime) <= new Date());
}

export default function MyAppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('upcoming');

  useEffect(() => {
    const auth = getStoredAuth();
    if (!auth || auth.role !== 'CUSTOMER') {
      router.replace('/login');
      return;
    }
    api
      .getMyAppointments()
      .then((data) => {
        const sorted = [...data].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        setAppointments(sorted);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleCancel(publicId: string) {
    setCancellingId(publicId);
    try {
      await api.cancelMyAppointment(publicId);
      setAppointments((prev) =>
        prev.map((a) =>
          a.publicId === publicId ? { ...a, status: 'CANCELLED' as const } : a,
        ),
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to cancel appointment.');
    } finally {
      setCancellingId(null);
    }
  }

  const upcomingList = appointments.filter(isUpcoming);
  const pastList = appointments.filter(isPast);
  const displayList = activeTab === 'upcoming' ? upcomingList : pastList;

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />

      <main className="mx-auto max-w-2xl px-4 py-10">
        {/* Header */}
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
          <p className="mt-1 text-sm text-gray-500">Your upcoming and past bookings.</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm w-fit">
          {(['upcoming', 'past'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              id={`tab-${tab}`}
              onClick={() => setActiveTab(tab)}
              className={[
                'rounded-lg px-5 py-2 text-sm font-medium capitalize transition-all',
                activeTab === tab
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900',
              ].join(' ')}
            >
              {tab}
              {tab === 'upcoming' && upcomingList.length > 0 && (
                <span className={`ml-2 rounded-full px-1.5 py-0.5 text-xs font-semibold ${activeTab === 'upcoming' ? 'bg-gray-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {upcomingList.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <Spinner className="h-8 w-8 text-gray-900" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && displayList.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="mb-4">
              {activeTab === 'upcoming' ? (
                <svg className="h-12 w-12 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              ) : (
                <svg className="h-12 w-12 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
              )}
            </div>
            <h2 className="text-base font-semibold text-gray-700">
              {activeTab === 'upcoming' ? 'No upcoming appointments' : 'No past appointments'}
            </h2>
            {activeTab === 'upcoming' && (
              <p className="mt-1 text-sm text-gray-400">
                Ready to book something?{' '}
                <Link href="/" className="text-gray-900 hover:underline">
                  Find a business →
                </Link>
              </p>
            )}
          </div>
        )}

        {/* Appointment list */}
        {!loading && displayList.length > 0 && (
          <div className="space-y-3">
            {displayList.map((appt) => (
              <div
                key={appt.publicId}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Service + badge */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900">{appt.serviceName}</span>
                      <Badge status={appt.status} />
                    </div>

                    {/* Business name */}
                    <p className="mt-1 text-sm font-medium text-gray-700">{appt.businessName}</p>

                    {/* Staff */}
                    {appt.staffName && (
                      <p className="mt-0.5 text-sm text-gray-500">with {appt.staffName}</p>
                    )}

                    {/* Date & time */}
                    <p className="mt-1 text-sm text-gray-400">
                      {formatDate(appt.startTime)} · {formatTime(appt.startTime)}–{formatTime(appt.endTime)}
                    </p>

                    {appt.notes && (
                      <p className="mt-2 text-xs italic text-gray-400">{appt.notes}</p>
                    )}
                  </div>

                  {/* Cancel button — only for upcoming BOOKED */}
                  {appt.status === 'BOOKED' && isUpcoming(appt) && (
                    <Button
                      id={`cancel-appt-${appt.publicId}`}
                      variant="destructive"
                      size="sm"
                      loading={cancellingId === appt.publicId}
                      onClick={() => handleCancel(appt.publicId)}
                      className="shrink-0"
                    >
                      Cancel
                    </Button>
                  )}
                </div>

                {/* Rebook link */}
                {appt.businessSlug && (
                  <div className="mt-3 border-t border-gray-100 pt-3">
                    <Link
                      href={`/book/${appt.businessSlug}`}
                      className="text-xs font-medium text-gray-900 hover:underline"
                    >
                      Book again at {appt.businessName} →
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
