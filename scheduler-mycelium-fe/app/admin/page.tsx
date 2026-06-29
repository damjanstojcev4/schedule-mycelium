'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Spinner } from '@/components/ui/Spinner';
import { TextBadge } from '@/components/ui/Badge';
import type { Business, Account, Appointment } from '@/types/api';
import { formatDate, formatTime } from '@/lib/format';

function BusinessesIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function CompletedIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function SuperAdminDashboard() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.adminGetBusinesses(),
      api.adminGetAccounts(),
      api.adminGetAppointments(),
    ])
      .then(([bizData, accData, apptData]) => {
        setBusinesses(bizData);
        setAccounts(accData);
        setAppointments(apptData);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // System stats
  const totalBusinesses = businesses.length;
  const totalAccounts = accounts.length;
  const totalAppointments = appointments.length;

  const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length;
  const cancelledCount = appointments.filter((a) => a.status === 'CANCELLED').length;
  const bookedCount = appointments.filter((a) => a.status === 'BOOKED').length;

  // Account role counts
  const ownerCount = accounts.filter((a) => a.role === 'BUSINESS_OWNER').length;
  const staffCount = accounts.filter((a) => a.role === 'STAFF').length;
  const customerCount = accounts.filter((a) => a.role === 'CUSTOMER').length;
  const adminCount = accounts.filter((a) => a.role === 'SUPER_ADMIN').length;

  // Recent system appointments (latest 5)
  const recentAppointments = [...appointments]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Business Performance Breakdown
  const businessStats = businesses.map((biz) => {
    const bizAppts = appointments.filter((a) => a.businessName === biz.name || a.businessSlug === biz.slug);
    const totalBizBookings = bizAppts.length;
    const completedBiz = bizAppts.filter((a) => a.status === 'COMPLETED').length;
    const cancelledBiz = bizAppts.filter((a) => a.status === 'CANCELLED').length;
    const bookedBiz = bizAppts.filter((a) => a.status === 'BOOKED').length;

    const activeRate = totalBizBookings > 0
      ? Math.round(((completedBiz + bookedBiz) / totalBizBookings) * 100)
      : 0;

    return {
      ...biz,
      totalBookings: totalBizBookings,
      completed: completedBiz,
      cancelled: cancelledBiz,
      booked: bookedBiz,
      activeRate,
    };
  }).sort((a, b) => b.totalBookings - a.totalBookings);

  return (
    <div>
      <PageHeader
        title="Admin Control Center"
        description="System-wide metrics and business performance overview"
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
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/businesses">
              <div className="hover:scale-[1.01] active:scale-[0.99] transition-transform cursor-pointer">
                <StatsCard label="Businesses" value={totalBusinesses} icon={<BusinessesIcon />} color="blue" />
              </div>
            </Link>
            <Link href="/admin/accounts">
              <div className="hover:scale-[1.01] active:scale-[0.99] transition-transform cursor-pointer">
                <StatsCard label="Accounts" value={totalAccounts} icon={<UsersIcon />} color="gray" />
              </div>
            </Link>
            <Link href="/admin/appointments">
              <div className="hover:scale-[1.01] active:scale-[0.99] transition-transform cursor-pointer">
                <StatsCard label="Total Bookings" value={totalAppointments} icon={<CalendarIcon />} color="yellow" />
              </div>
            </Link>
            <div className="cursor-default">
              <StatsCard label="Completed Bookings" value={completedCount} icon={<CompletedIcon />} color="green" />
            </div>
          </div>

          {/* Two-Column Detail View */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Business Performance list */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h2 className="text-sm font-semibold text-gray-900">Business Activity Metrics</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        {['Business', 'Category', 'Total Bookings', 'Completed / Cancelled', 'Success Rate'].map((h) => (
                          <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {businessStats.map((biz) => (
                        <tr key={biz.publicId} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 align-middle whitespace-nowrap font-semibold text-gray-900">{biz.name}</td>
                          <td className="px-6 py-4 align-middle whitespace-nowrap">
                            <TextBadge label={biz.category} variant="default" />
                          </td>
                          <td className="px-6 py-4 align-middle whitespace-nowrap font-medium text-gray-900">{biz.totalBookings}</td>
                          <td className="px-6 py-4 align-middle whitespace-nowrap text-gray-500">
                            <span className="text-emerald-600 font-semibold">{biz.completed}</span>
                            {' / '}
                            <span className="text-red-500 font-semibold">{biz.cancelled}</span>
                          </td>
                          <td className="px-6 py-4 align-middle whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-100 rounded-full h-1.5">
                                <div
                                  className="bg-gray-900 h-1.5 rounded-full"
                                  style={{ width: `${biz.activeRate}%` }}
                                />
                              </div>
                              <span className="text-xs font-bold text-gray-600">{biz.activeRate}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column: User breakdown & Activity Feed */}
            <div className="space-y-6">
              
              {/* Account Distribution */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-3">
                  Account Distribution
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Customers', count: customerCount, color: 'bg-blue-500' },
                    { label: 'Business Owners', count: ownerCount, color: 'bg-emerald-500' },
                    { label: 'Staff Members', count: staffCount, color: 'bg-amber-500' },
                    { label: 'Super Admins', count: adminCount, color: 'bg-zinc-600' },
                  ].map((roleGroup) => (
                    <div key={roleGroup.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${roleGroup.color}`} />
                        <span className="text-sm text-gray-600 font-medium">{roleGroup.label}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{roleGroup.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent System Activity Feed */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h2 className="text-sm font-semibold text-gray-900">Recent System Activity</h2>
                </div>
                <div className="p-6">
                  {recentAppointments.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">No bookings recorded yet.</p>
                  ) : (
                    <div className="flow-root">
                      <ul className="-mb-8">
                        {recentAppointments.map((appt, idx) => (
                          <li key={appt.publicId}>
                            <div className="relative pb-8">
                              {idx !== recentAppointments.length - 1 && (
                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                              )}
                              <div className="relative flex space-x-3">
                                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                  <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                </div>
                                <div className="flex-1 min-w-0 pt-1">
                                  <p className="text-xs font-semibold text-gray-900">
                                    {appt.serviceName} booked
                                  </p>
                                  <p className="text-[10px] text-gray-400 mt-0.5">
                                    At {appt.businessName} · {formatDate(appt.startTime)} {formatTime(appt.startTime)}
                                  </p>
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

            </div>

          </div>
        </div>
      )}
    </div>
  );
}
