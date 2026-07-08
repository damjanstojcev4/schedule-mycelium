'use client';

import { useEffect, useState, useMemo } from 'react';
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

/* ── Icons ─────────────────────────────────────────────────────── */

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

function ChartBarIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}

function FireIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
    </svg>
  );
}

function XCircleIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function TrendingUpIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  );
}

/* ── Helpers ────────────────────────────────────────────────────── */

function startOfWeekISO(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return localDateISO(d);
}

function getMonthRange(offset: number) {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const lastDay  = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
  return { start: localDateISO(firstDay), end: localDateISO(lastDay) };
}

function formatHourLabel(hour: number): string {
  if (hour === 0)  return '12:00 AM';
  if (hour < 12)   return `${hour}:00 AM`;
  if (hour === 12) return '12:00 PM';
  return `${hour - 12}:00 PM`;
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

/* ── Section Card wrapper ───────────────────────────────────────── */

function SectionCard({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4 bg-zinc-50">
        <h2 className="text-sm font-bold text-zinc-900">{title}</h2>
        {badge && (
          <span className="px-2.5 py-1 text-xs font-semibold bg-white text-zinc-600 rounded-full border border-zinc-200">
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────────── */

export default function DashboardOverviewPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;
    api.getBookingPage(slug).then((biz: BusinessBookingPage) => {
      sessionStorage.setItem(`solo-${slug}`, String(biz.soloOperator));
    }).catch(() => {});

    api.getDashboardAppointments()
      .then((data) => {
        const now = new Date().getTime();
        const autoCompleted = data.map((appt) =>
          appt.status === 'BOOKED' && new Date(appt.endTime).getTime() <= now
            ? { ...appt, status: 'COMPLETED' as const }
            : appt
        );
        setAppointments(
          autoCompleted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        );
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  const today     = todayISO();
  const weekStart = startOfWeekISO();

  /* ── Top stats ────────────────────────────────────────────────── */
  const todayCount     = appointments.filter(a => a.startTime.slice(0,10) === today).length;
  const weekCount      = appointments.filter(a => a.startTime.slice(0,10) >= weekStart && a.startTime.slice(0,10) <= today).length;
  const pendingCount   = appointments.filter(a => a.status === 'BOOKED').length;
  const completedCount = appointments.filter(a => a.status === 'COMPLETED').length;

  /* ── Today's agenda ───────────────────────────────────────────── */
  const todayAppointments = [...appointments]
    .filter(a => a.startTime.slice(0,10) === today)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  /* ── Service popularity ───────────────────────────────────────── */
  const serviceCounts: Record<string, number> = {};
  appointments.forEach(a => { serviceCounts[a.serviceName] = (serviceCounts[a.serviceName] || 0) + 1; });
  const totalBookings = appointments.length;
  const popularServices = Object.entries(serviceCounts)
    .map(([name, count]) => ({ name, count, percentage: totalBookings > 0 ? Math.round((count / totalBookings) * 100) : 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  /* ── Monthly analytics ────────────────────────────────────────── */
  const monthlyStats = useMemo(() => {
    const thisMonth = getMonthRange(0);
    const lastMonth = getMonthRange(-1);
    const thisAppts = appointments.filter(a => a.startTime.slice(0,10) >= thisMonth.start && a.startTime.slice(0,10) <= thisMonth.end);
    const lastAppts = appointments.filter(a => a.startTime.slice(0,10) >= lastMonth.start && a.startTime.slice(0,10) <= lastMonth.end);

    const totalThis = thisAppts.length, totalLast = lastAppts.length;
    const totalTrend = pctChange(totalThis, totalLast);

    const dayOfMonth = new Date().getDate();
    const avgPerDay = dayOfMonth > 0 ? Math.round((totalThis / dayOfMonth) * 10) / 10 : 0;
    const daysInLastMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 0).getDate();
    const avgTrend = pctChange(avgPerDay * 10, (totalLast / daysInLastMonth) * 10);

    const svcCounts: Record<string, number> = {};
    thisAppts.forEach(a => { svcCounts[a.serviceName] = (svcCounts[a.serviceName] || 0) + 1; });
    const topEntry = Object.entries(svcCounts).sort((a, b) => b[1] - a[1])[0];
    const topService = topEntry?.[0] ?? 'No data';
    const topServiceCount = topEntry?.[1] ?? 0;

    const hourBuckets: Record<number, number> = {};
    thisAppts.forEach(a => {
      const h = new Date(a.startTime).getHours();
      hourBuckets[h] = (hourBuckets[h] || 0) + 1;
    });
    const busiestHourEntry = Object.entries(hourBuckets).sort((a, b) => Number(b[1]) - Number(a[1]))[0];
    const busiestHourLabel = busiestHourEntry ? formatHourLabel(Number(busiestHourEntry[0])) : 'N/A';

    const dayBuckets: Record<string, number> = {};
    const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    thisAppts.forEach(a => {
      const day = dayNames[new Date(a.startTime).getDay()];
      dayBuckets[day] = (dayBuckets[day] || 0) + 1;
    });
    const busiestDay = Object.entries(dayBuckets).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';

    const cancelledThis = thisAppts.filter(a => a.status === 'CANCELLED').length;
    const cancelledLast = lastAppts.filter(a => a.status === 'CANCELLED').length;
    const cancelRate     = totalThis > 0 ? Math.round((cancelledThis / totalThis) * 1000) / 10 : 0;
    const cancelRateLast = totalLast > 0 ? Math.round((cancelledLast / totalLast) * 1000) / 10 : 0;
    const cancelTrend    = -pctChange(cancelRate * 10, cancelRateLast * 10);

    return { totalThis, totalTrend, avgPerDay, avgTrend, topService, topServiceCount, busiestHourLabel, busiestDay, cancelRate, cancelTrend };
  }, [appointments]);

  async function copyBookingLink() {
    await navigator.clipboard.writeText(`${window.location.origin}/book/${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  /* ── Monthly metric card ──────────────────────────────────────── */
  function MetricCard({
    icon, label, value, sub, trend,
  }: { icon: React.ReactNode; label: string; value: string | number; sub?: string; trend?: number }) {
    return (
      <div className="bg-white border border-zinc-200 rounded-xl p-4 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="p-2 bg-zinc-50 rounded-lg text-zinc-500 border border-zinc-100">{icon}</div>
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wide">{label}</span>
        </div>
        <p className="text-2xl font-extrabold text-zinc-900 tracking-tight truncate">{value}</p>
        {sub && <p className="text-xs text-zinc-400 mt-1">{sub}</p>}
        {trend !== undefined && trend !== 0 && (
          <span className={`inline-flex items-center gap-1 mt-1.5 text-xs font-semibold px-1.5 py-0.5 rounded ${
            trend > 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'
          }`}>
            {trend > 0 ? '+' : ''}{trend}% vs last month
          </span>
        )}
      </div>
    );
  }

  /* ── Quick access links ───────────────────────────────────────── */
  const quickLinks = [
    { href: `/dashboard/${slug}/appointments`, label: 'Calendar Appointments', icon: <CalendarTodayIcon />, external: false },
    { href: `/dashboard/${slug}/services`,     label: 'Manage Services',        icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
      ), external: false },
    { href: `/dashboard/${slug}/settings`,     label: 'Settings & Hours',       icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
      ), external: false },
    { href: `/book/${slug}`,                   label: 'View Live Booking Page', icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
      ), external: true },
  ];

  /* ── JSX ─────────────────────────────────────────────────────── */

  return (
    <div>
      <PageHeader
        title="Overview"
        action={
          <Button id="copy-booking-link" variant="primary" size="sm" onClick={copyBookingLink}>
            {copied ? '✓ Copied!' : 'Share Booking Link'}
          </Button>
        }
      />

      {loading && (
        <div className="flex justify-center py-20">
          <Spinner className="h-8 w-8 text-zinc-900" />
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-6">
          {error}
        </div>
      )}

      {!loading && (
        <div className="space-y-6">

          {/* Top stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard label="Today"     value={todayCount}     icon={<CalendarTodayIcon />} />
            <StatsCard label="This Week" value={weekCount}      icon={<WeekIcon />} />
            <StatsCard label="Pending"   value={pendingCount}   icon={<ClockIcon />} />
            <StatsCard label="Completed" value={completedCount} icon={<CheckIcon />} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left: Agenda + Popularity */}
            <div className="lg:col-span-2 space-y-6">

              {/* Today's Agenda */}
              <SectionCard title="Today's Agenda" badge={`${todayAppointments.length} scheduled`}>
                <div className="p-5">
                  {todayAppointments.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="h-14 w-14 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <CalendarTodayIcon />
                      </div>
                      <p className="text-sm font-semibold text-zinc-700">No appointments scheduled for today.</p>
                      <p className="text-xs text-zinc-400 mt-1">Keep sharing your booking page to get slots filled!</p>
                    </div>
                  ) : (
                    <ul className="-mb-8">
                      {todayAppointments.map((appt, idx) => (
                        <li key={appt.publicId}>
                          <div className="relative pb-8 group cursor-default">
                            {idx !== todayAppointments.length - 1 && (
                              <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-zinc-200" aria-hidden="true" />
                            )}
                            <div className="relative flex space-x-3 items-start rounded-lg p-2 -mx-2 hover:bg-zinc-50 transition-colors">
                              <span className="h-10 w-10 rounded-full bg-zinc-900 flex items-center justify-center ring-4 ring-white text-xs font-bold text-white shadow-sm">
                                {formatTime(appt.startTime)}
                              </span>
                              <div className="flex-1 min-w-0 pt-1.5 flex flex-col sm:flex-row sm:justify-between gap-2">
                                <div>
                                  <p className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                                    {appt.serviceName}
                                    {appt.status === 'BOOKED' && (
                                      <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-sm text-zinc-500 mt-0.5">
                                    for <span className="font-medium text-zinc-700">{appt.customerName ?? appt.guestName ?? 'Guest'}</span>
                                  </p>
                                  <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-400 font-medium">
                                    <span className="flex items-center gap-1">
                                      <ClockIcon />
                                      {appt.endTime ? `${formatTime(appt.startTime)} – ${formatTime(appt.endTime)}` : '—'}
                                    </span>
                                    <span>· {appt.staffName ?? '—'}</span>
                                  </div>
                                </div>
                                <div className="shrink-0"><Badge status={appt.status} /></div>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </SectionCard>

              {/* Service Popularity */}
              <SectionCard title="Service Popularity" badge="All-time bookings">
                <div className="p-5">
                  {popularServices.length === 0 ? (
                    <div className="text-center py-8 text-sm text-zinc-400 bg-zinc-50 rounded-lg border border-zinc-100 border-dashed">
                      No service stats available yet.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {popularServices.map((svc, i) => (
                        <div key={svc.name} className="space-y-1.5">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-zinc-800">{svc.name}</span>
                            <span className="text-zinc-400 text-xs font-semibold bg-zinc-50 px-2 py-0.5 rounded border border-zinc-100">
                              {svc.count} ({svc.percentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-2 rounded-full transition-all duration-700 ease-out"
                              style={{
                                width: `${svc.percentage}%`,
                                backgroundColor: ['#27272a','#52525b','#71717a','#a1a1aa','#d4d4d8'][i % 5],
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </SectionCard>
            </div>

            {/* Right: Quick Access Hub */}
            <div>
              <SectionCard title="Quick Access Hub">
                <div className="p-4 space-y-2">
                  {quickLinks.map(link =>
                    link.external ? (
                      <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="block">
                        <div className="group flex items-center justify-between rounded-lg border border-zinc-100 bg-white p-3.5 hover:border-zinc-300 hover:bg-zinc-50 transition-all cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-zinc-50 text-zinc-500 rounded-lg border border-zinc-100 group-hover:bg-zinc-100 transition-colors">{link.icon}</div>
                            <span className="text-sm font-semibold text-zinc-800">{link.label}</span>
                          </div>
                          <svg className="h-4 w-4 text-zinc-300 group-hover:text-zinc-500 transition-colors group-hover:-translate-y-0.5 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </div>
                      </a>
                    ) : (
                      <Link key={link.href} href={link.href} className="block">
                        <div className="group flex items-center justify-between rounded-lg border border-zinc-100 bg-white p-3.5 hover:border-zinc-300 hover:bg-zinc-50 transition-all cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-zinc-50 text-zinc-500 rounded-lg border border-zinc-100 group-hover:bg-zinc-100 transition-colors">{link.icon}</div>
                            <span className="text-sm font-semibold text-zinc-800">{link.label}</span>
                          </div>
                          <svg className="h-4 w-4 text-zinc-300 group-hover:text-zinc-500 transition-colors group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </div>
                      </Link>
                    )
                  )}
                </div>
              </SectionCard>
            </div>
          </div>

          {/* Monthly Reporting */}
          <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4 bg-zinc-50">
              <h2 className="text-sm font-bold text-zinc-900">Monthly Reporting &amp; Analytics</h2>
              <span className="px-2.5 py-1 text-xs font-semibold bg-white text-zinc-600 rounded-full border border-zinc-200">
                {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <MetricCard
                  icon={<ChartBarIcon />}
                  label="Total Bookings"
                  value={monthlyStats.totalThis}
                  trend={monthlyStats.totalTrend}
                />
                <MetricCard
                  icon={<TrendingUpIcon />}
                  label="Avg / Day"
                  value={monthlyStats.avgPerDay}
                  trend={monthlyStats.avgTrend}
                />
                <MetricCard
                  icon={<StarIcon />}
                  label="Top Service"
                  value={monthlyStats.topService}
                  sub={monthlyStats.topServiceCount > 0 ? `${monthlyStats.topServiceCount} bookings` : undefined}
                />
                <MetricCard
                  icon={<FireIcon />}
                  label="Busiest Time"
                  value={monthlyStats.busiestHourLabel}
                  sub={monthlyStats.busiestDay ? `${monthlyStats.busiestDay}s` : undefined}
                />
                <MetricCard
                  icon={<XCircleIcon />}
                  label="Cancel Rate"
                  value={`${monthlyStats.cancelRate}%`}
                  trend={monthlyStats.cancelTrend}
                />
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
