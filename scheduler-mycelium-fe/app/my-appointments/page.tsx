'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { getStoredAuth } from '@/lib/auth';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import type { Appointment } from '@/types/api';
import { formatDate, formatTime } from '@/lib/format';

type Tab = 'upcoming' | 'past';

function isUpcoming(appt: Appointment): boolean {
  return (
    appt.status === 'BOOKED' &&
    new Date(appt.endTime) > new Date()
  );
}

function isPast(appt: Appointment): boolean {
  return appt.status === 'COMPLETED' || appt.status === 'CANCELLED' ||
    (appt.status === 'BOOKED' && new Date(appt.endTime) <= new Date());
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
        const sorted = [...data].sort(
          (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
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
      window.location.reload();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to cancel appointment.');
    } finally {
      setCancellingId(null);
    }
  }

  const upcomingList = appointments.filter(isUpcoming);
  const pastList = appointments.filter(isPast);
  const displayList = activeTab === 'upcoming' ? upcomingList : pastList;
  const nextAppt = upcomingList[0];

  return (
    <div className="min-h-screen bg-zinc-50">
      <PublicNavbar />

      <main className="max-w-xl mx-auto px-4 pb-12 pt-20">
        {/* Header */}
        <div className="pt-4 mb-6">
          <h1 className="text-2xl font-black text-zinc-900">My Appointments</h1>
          <p className="mt-1 text-sm text-zinc-500">Upcoming and past bookings.</p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <Spinner className="h-7 w-7 text-zinc-900" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3.5 text-sm text-red-600 font-medium mb-4">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Next appointment hero card */}
            {nextAppt && activeTab === 'upcoming' && (
              <div className="mb-6 rounded-3xl bg-zinc-950 p-5 shadow-xl animate-fade-in">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Coming up next</p>
                <div className="flex items-center gap-4">
                  {/* Calendar block */}
                  <div className="h-16 w-16 rounded-2xl bg-zinc-800 flex flex-col items-center justify-center shrink-0 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 leading-none">
                      {new Date(nextAppt.startTime).toLocaleDateString('en-GB', { month: 'short' })}
                    </span>
                    <span className="text-2xl font-black text-white leading-none mt-0.5">
                      {new Date(nextAppt.startTime).getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-bold text-white leading-tight">{nextAppt.serviceName}</p>
                    <p className="text-sm text-zinc-400 mt-0.5 font-medium">{nextAppt.businessName}</p>
                    {nextAppt.staffName && (
                      <p className="text-xs text-zinc-500 mt-0.5">with {nextAppt.staffName}</p>
                    )}
                    <div className="flex items-center gap-1.5 mt-2">
                      <svg className="h-3.5 w-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs font-semibold text-zinc-400">
                        {formatTime(nextAppt.startTime)} – {formatTime(nextAppt.endTime)}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Cancel action */}
                <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between">
                  {nextAppt.businessSlug && (
                    <Link
                      href={`/book/${nextAppt.businessSlug}`}
                      className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                    >
                      Book again →
                    </Link>
                  )}
                  <button
                    type="button"
                    disabled={cancellingId === nextAppt.publicId}
                    onClick={() => handleCancel(nextAppt.publicId)}
                    className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 ml-auto"
                  >
                    {cancellingId === nextAppt.publicId ? 'Cancelling...' : 'Cancel appointment'}
                  </button>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-2xl bg-zinc-200/60 mb-5">
              {(['upcoming', 'past'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  id={`tab-${tab}`}
                  onClick={() => setActiveTab(tab)}
                  className={[
                    'flex-1 rounded-xl py-2.5 text-sm font-bold capitalize transition-all duration-200',
                    activeTab === tab
                      ? 'bg-white text-zinc-900 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-700',
                  ].join(' ')}
                >
                  {tab}
                  {tab === 'upcoming' && upcomingList.length > 0 && (
                    <span className={['ml-1.5 rounded-full px-1.5 py-0.5 text-xs', activeTab === 'upcoming' ? 'bg-zinc-900 text-white' : 'bg-zinc-300 text-zinc-600'].join(' ')}>
                      {upcomingList.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Empty state */}
            {displayList.length === 0 && (
              <div className="flex flex-col items-center py-16 text-center">
                <div className="h-16 w-16 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
                  {activeTab === 'upcoming' ? (
                    <svg className="h-8 w-8 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  ) : (
                    <svg className="h-8 w-8 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <h2 className="text-base font-bold text-zinc-700">
                  {activeTab === 'upcoming' ? 'No upcoming appointments' : 'No past appointments'}
                </h2>
                {activeTab === 'upcoming' && (
                  <p className="mt-2 text-sm text-zinc-400">
                    Ready to book?{' '}
                    <Link href="/" className="text-zinc-900 font-bold underline underline-offset-2">
                      Find a business
                    </Link>
                  </p>
                )}
              </div>
            )}

            {/* Appointment list */}
            {displayList.length > 0 && (
              <div className="space-y-3 stagger-children">
                {displayList.map((appt) => {
                  const dateObj = new Date(appt.startTime);
                  const dayNum = dateObj.getDate();
                  const monthShort = dateObj.toLocaleDateString('en-GB', { month: 'short' });
                  const dayShort = dateObj.toLocaleDateString('en-GB', { weekday: 'short' });
                  const isUpcomingAppt = isUpcoming(appt);

                  return (
                    <div
                      key={appt.publicId}
                      className="bg-white rounded-2xl border border-zinc-200 overflow-hidden"
                    >
                      <div className="flex items-stretch">
                        {/* Date block */}
                        <div className={[
                          'flex flex-col items-center justify-center px-4 py-4 min-w-[60px] shrink-0',
                          isUpcomingAppt ? 'bg-zinc-950' : 'bg-zinc-100',
                        ].join(' ')}>
                          <span className={['text-[10px] font-bold uppercase tracking-wider', isUpcomingAppt ? 'text-zinc-500' : 'text-zinc-400'].join(' ')}>{dayShort}</span>
                          <span className={['text-xl font-black leading-none mt-0.5', isUpcomingAppt ? 'text-white' : 'text-zinc-500'].join(' ')}>{dayNum}</span>
                          <span className={['text-[10px] font-semibold uppercase mt-0.5', isUpcomingAppt ? 'text-zinc-500' : 'text-zinc-400'].join(' ')}>{monthShort}</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 px-4 py-4">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-bold text-zinc-900 leading-tight">{appt.serviceName}</p>
                            <Badge status={appt.status} />
                          </div>
                          <p className="mt-0.5 text-sm font-semibold text-zinc-600">{appt.businessName}</p>
                          {appt.staffName && (
                            <p className="text-xs text-zinc-400 mt-0.5">with {appt.staffName}</p>
                          )}
                          <div className="flex items-center gap-1.5 mt-2">
                            <svg className="h-3.5 w-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-xs text-zinc-500 font-semibold">
                              {formatTime(appt.startTime)}–{formatTime(appt.endTime)}
                            </span>
                          </div>
                          {appt.notes && (
                            <p className="mt-2 text-xs text-zinc-400 italic">{appt.notes}</p>
                          )}
                        </div>
                      </div>

                      {/* Footer actions */}
                      {(isUpcomingAppt || appt.businessSlug) && (
                        <div className="border-t border-zinc-100 px-4 py-3 flex items-center justify-between">
                          {appt.businessSlug ? (
                            <Link
                              href={`/book/${appt.businessSlug}`}
                              className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
                            >
                              Book again →
                            </Link>
                          ) : <span />}

                          {isUpcomingAppt && (
                            <button
                              id={`cancel-appt-${appt.publicId}`}
                              type="button"
                              disabled={cancellingId === appt.publicId}
                              onClick={() => handleCancel(appt.publicId)}
                              className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                            >
                              {cancellingId === appt.publicId ? 'Cancelling...' : 'Cancel'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
