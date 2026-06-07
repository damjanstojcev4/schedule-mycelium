'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { TextBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Business } from '@/types/api';
import { formatDate } from '@/lib/format';
import Link from 'next/link';

export default function AdminBusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .adminGetBusinesses()
      .then(setBusinesses)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title="Businesses" description={`${businesses.length} registered businesses`} />

      {loading && <div className="flex justify-center py-20"><Spinner className="h-8 w-8 text-gray-900" /></div>}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {!loading && businesses.length === 0 && (
        <EmptyState title="No businesses yet" description="Businesses will appear here once registered." />
      )}

      {!loading && businesses.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Name', 'Slug', 'Category', 'Solo', 'Created'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {businesses.map((b) => (
                <tr key={b.publicId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-900">
                    <Link
                      href={`/book/${b.slug}`}
                      target="_blank"
                      className="hover:text-gray-900 hover:underline"
                    >
                      {b.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 font-mono text-xs">{b.slug}</td>
                  <td className="px-5 py-3.5">
                    <TextBadge label={b.category} variant="gray" />
                  </td>
                  <td className="px-5 py-3.5">
                    {b.soloOperator ? (
                      <TextBadge label="Solo" variant="blue" />
                    ) : (
                      <TextBadge label="Team" variant="gray" />
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs">{formatDate(b.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
