'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { TextBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Account } from '@/types/api';
import { formatDate } from '@/lib/format';

type RoleFilter = 'ALL' | 'SUPER_ADMIN' | 'BUSINESS_OWNER' | 'STAFF' | 'CUSTOMER';
const ROLES: RoleFilter[] = ['ALL', 'SUPER_ADMIN', 'BUSINESS_OWNER', 'STAFF', 'CUSTOMER'];

const roleBadgeVariant: Record<string, 'blue' | 'green' | 'yellow' | 'red' | 'gray'> = {
  SUPER_ADMIN: 'red',
  BUSINESS_OWNER: 'blue',
  STAFF: 'green',
  CUSTOMER: 'gray',
};

export default function AdminAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');

  useEffect(() => {
    api
      .adminGetAccounts()
      .then(setAccounts)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = roleFilter === 'ALL' ? accounts : accounts.filter((a) => a.role === roleFilter);

  return (
    <div>
      <PageHeader title="Accounts" description={`${accounts.length} total accounts`} />

      {/* Role filter */}
      <div className="mb-5 flex flex-wrap gap-1 rounded-lg bg-gray-100 p-1 w-fit">
        {ROLES.map((r) => (
          <button
            key={r}
            id={`accounts-filter-${r.toLowerCase()}`}
            type="button"
            onClick={() => setRoleFilter(r)}
            className={[
              'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              roleFilter === r ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
            ].join(' ')}
          >
            {r === 'ALL' ? 'All' : r.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading && <div className="flex justify-center py-20"><Spinner className="h-8 w-8 text-gray-900" /></div>}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {!loading && filtered.length === 0 && (
        <EmptyState title="No accounts" description="No accounts match the selected filter." />
      )}

      {!loading && filtered.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Email', 'Role', 'Created'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((acc) => (
                <tr key={acc.publicId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 text-gray-900">{acc.email}</td>
                  <td className="px-5 py-3.5">
                    <TextBadge
                      label={acc.role.replace('_', ' ')}
                      variant={roleBadgeVariant[acc.role] ?? 'gray'}
                    />
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs">{formatDate(acc.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
