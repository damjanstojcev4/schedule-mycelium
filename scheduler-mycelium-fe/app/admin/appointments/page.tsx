'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Appointment } from '@/types/api';
import { formatDate, formatTime } from '@/lib/format';

type StatusFilter = 'ALL' | 'BOOKED' | 'COMPLETED' | 'CANCELLED';
const STATUS_FILTERS: StatusFilter[] = ['ALL', 'BOOKED', 'COMPLETED', 'CANCELLED'];

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  useEffect(() => {
    api
      .adminGetAppointments()
      .then((data) => {
        const sorted = [...data].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        setAppointments(sorted);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    statusFilter === 'ALL' ? appointments : appointments.filter((a) => a.status === statusFilter);

  return (
    <div>
      <PageHeader title="All Appointments" description={`${appointments.length} total across all businesses`} />

      {/* Filter */}
      <div className="mb-5 flex flex-wrap gap-1 rounded-lg bg-gray-100 p-1 w-fit">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            id={`admin-appt-filter-${f.toLowerCase()}`}
            type="button"
            onClick={() => setStatusFilter(f)}
            className={[
              'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              statusFilter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
            ].join(' ')}
          >
            {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading && <div className="flex justify-center py-20"><Spinner className="h-8 w-8 text-gray-900" /></div>}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {!loading && filtered.length === 0 && (
        <EmptyState title="No appointments" description="No appointments match the current filter." />
      )}

      {!loading && filtered.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Date / Time', 'Service', 'Customer', 'Staff', 'Business', 'Status'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((appt) => (
                <tr key={appt.publicId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <p className="font-medium text-gray-900">{formatDate(appt.startTime)}</p>
                    <p className="text-xs text-gray-400">{formatTime(appt.startTime)}–{formatTime(appt.endTime)}</p>
                  </td>
                  <td className="px-5 py-3.5 text-gray-700">{appt.serviceName}</td>
                  <td className="px-5 py-3.5 text-gray-700">{appt.customerName}</td>
                  <td className="px-5 py-3.5 text-gray-500">{appt.staffName}</td>
                  <td className="px-5 py-3.5 text-gray-400 font-mono text-xs">{appt.businessId}</td>
                  <td className="px-5 py-3.5"><Badge status={appt.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
