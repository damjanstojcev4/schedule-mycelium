'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { AppointmentTable } from '@/components/dashboard/AppointmentTable';
import { Spinner } from '@/components/ui/Spinner';
import type { Appointment } from '@/types/api';

type StatusFilter = 'ALL' | 'BOOKED' | 'COMPLETED' | 'CANCELLED';

const FILTERS: StatusFilter[] = ['ALL', 'BOOKED', 'COMPLETED', 'CANCELLED'];

export default function DashboardAppointmentsPage() {
  const params = useParams<{ slug: string }>();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<StatusFilter>('ALL');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    api
      .getDashboardAppointments()
      .then((data) => {
        const sorted = [...data].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        setAppointments(sorted);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleCancel(publicId: string) {
    const key = `cancel-${publicId}`;
    setLoadingId(key);
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
    const key = `complete-${publicId}`;
    setLoadingId(key);
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

  const filtered =
    filter === 'ALL' ? appointments : appointments.filter((a) => a.status === filter);

  return (
    <div>
      <PageHeader title="Appointments" description="Manage all bookings for your business." />

      {/* Status filter tabs */}
      <div className="mb-5 flex gap-1 rounded-lg bg-gray-100 p-1 w-fit">
        {FILTERS.map((f) => (
          <button
            key={f}
            id={`filter-${f.toLowerCase()}`}
            type="button"
            onClick={() => setFilter(f)}
            className={[
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              filter === f
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700',
            ].join(' ')}
          >
            {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <Spinner className="h-8 w-8 text-gray-900" />
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 mb-4">
          {error}
        </div>
      )}

      {!loading && (
        <div className="bg-white border border-gray-200 rounded-xl">
          <AppointmentTable
            appointments={filtered}
            onCancel={handleCancel}
            onComplete={handleComplete}
            loadingId={loadingId}
          />
        </div>
      )}
    </div>
  );
}
