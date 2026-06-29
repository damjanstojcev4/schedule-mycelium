'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { TextBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import type { Business } from '@/types/api';
import { formatDate } from '@/lib/format';
import Link from 'next/link';

const CATEGORIES = [
  'Barbershop',
  'Nail Salon',
  'Tattoo Studio',
  'Beauty Salon',
  'Dentist',
  'Massage',
  'Trainer',
  'Make Up Studio',
];

export default function AdminBusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal / Add business state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Form fields
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [soloOperator, setSoloOperator] = useState(true);

  // Delete business state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [businessToDelete, setBusinessToDelete] = useState<{ publicId: string; name: string } | null>(null);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  function fetchBusinesses() {
    setLoading(true);
    api
      .adminGetBusinesses()
      .then(setBusinesses)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }

  function handlePhoneChange(val: string) {
    const clean = val.replace(/\D/g, '');
    let masked = '';
    if (clean.length > 0) {
      masked += clean.substring(0, 3);
    }
    if (clean.length > 3) {
      masked += '-' + clean.substring(3, 6);
    }
    if (clean.length > 6) {
      masked += '-' + clean.substring(6, 9);
    }
    setPhone(masked);
  }

  async function handleAddBusiness(e: React.FormEvent) {
    e.preventDefault();
    if (!ownerEmail || !ownerPassword || !name || !category || !phone || !address) {
      setFormError('Please fill in all required fields.');
      return;
    }
    if (ownerPassword.length < 8) {
      setFormError('Owner password must be at least 8 characters.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      await api.adminCreateBusiness({
        ownerEmail,
        ownerPassword,
        name,
        category,
        phone,
        address,
        description,
        soloOperator,
      });
      setIsModalOpen(false);
      // Reset form
      setOwnerEmail('');
      setOwnerPassword('');
      setName('');
      setCategory('');
      setPhone('');
      setAddress('');
      setDescription('');
      setSoloOperator(true);
      fetchBusinesses();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create business account.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative">
      <PageHeader
        title="Businesses"
        description={`${businesses.length} registered businesses`}
        action={
          <Button
            id="admin-add-business-btn"
            onClick={() => setIsModalOpen(true)}
            variant="primary"
            size="sm"
          >
            Add Business
          </Button>
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

      {!loading && businesses.length === 0 && (
        <EmptyState title="No businesses yet" description="Businesses will appear here once registered." />
      )}

      {!loading && businesses.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto shadow-sm">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Name', 'Slug', 'Category', 'Solo/Team', 'Created', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {businesses.map((b) => (
                <tr key={b.publicId} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4 align-middle whitespace-nowrap font-semibold text-gray-900">
                    <Link
                      href={`/book/${b.slug}`}
                      target="_blank"
                      className="hover:text-gray-900 hover:underline"
                    >
                      {b.name}
                    </Link>
                  </td>
                  <td className="px-5 py-4 align-middle whitespace-nowrap text-gray-500 font-mono text-xs">{b.slug}</td>
                  <td className="px-5 py-4 align-middle whitespace-nowrap">
                    <TextBadge label={b.category} variant="default" />
                  </td>
                  <td className="px-5 py-4 align-middle whitespace-nowrap">
                    {b.soloOperator ? (
                      <TextBadge label="Solo" variant="blue" />
                    ) : (
                      <TextBadge label="Team" variant="default" />
                    )}
                  </td>
                  <td className="px-5 py-4 align-middle whitespace-nowrap text-gray-400 text-xs">{formatDate(b.createdAt)}</td>
                  <td className="px-5 py-4 align-middle whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setBusinessToDelete({ publicId: b.publicId, name: b.name })}
                      className="text-xs font-semibold text-red-600 hover:text-red-800 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Business Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-xl bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh] p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Add New Business Account</h2>
                <p className="text-xs text-gray-500 mt-1">Creates a new business and its owner account</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 rounded-full p-1.5 hover:bg-gray-100 transition-all"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {formError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddBusiness} className="space-y-5">
              {/* Account Credentials */}
              <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-4 space-y-4">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Owner Credentials</p>
                <Input
                  id="admin-owner-email"
                  label="Owner email address"
                  type="email"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  placeholder="owner@example.com"
                  required
                />
                <Input
                  id="admin-owner-password"
                  label="Owner password"
                  type="password"
                  value={ownerPassword}
                  onChange={(e) => setOwnerPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  required
                />
              </div>

              {/* Business Info */}
              <div className="space-y-4">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Business Details</p>
                <Input
                  id="admin-business-name"
                  label="Business name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mario's Barbershop"
                  required
                />
                <Select
                  id="admin-business-category"
                  label="Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="">Select a category…</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </Select>
                <Input
                  id="admin-business-phone"
                  label="Phone number"
                  type="tel"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="XXX-XXX-XXX"
                  required
                />
                <Input
                  id="admin-business-address"
                  label="Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Str. Makedonija 1, Skopje"
                  required
                />
                <Textarea
                  id="admin-business-description"
                  label="Description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the business..."
                  rows={2}
                />

                {/* Solo Operator Checkbox */}
                <div className="flex items-start gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="admin-business-solo"
                    checked={soloOperator}
                    onChange={(e) => setSoloOperator(e.target.checked)}
                    className="h-4.5 w-4.5 mt-0.5 rounded border-gray-300 text-gray-900 focus:ring-gray-500 cursor-pointer"
                  />
                  <div>
                    <label htmlFor="admin-business-solo" className="text-sm font-semibold text-gray-700 cursor-pointer select-none">
                      I work alone (no staff members)
                    </label>
                    <p className="text-xs text-gray-400">Hides staff selection for booking clients</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  id="admin-submit-business-btn"
                  type="submit"
                  loading={submitting}
                >
                  Create Business Account
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal Overlay */}
      {businessToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-md bg-white border border-gray-100 rounded-2xl shadow-2xl p-6 space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 text-red-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-gray-900">Delete Business</h3>
                <p className="text-sm text-gray-500">
                  Are you sure you want to permanently delete <span className="font-semibold text-gray-900">&ldquo;{businessToDelete.name}&rdquo;</span>?
                </p>
                <p className="text-xs text-red-500">
                  This action will delete all appointments, staff members, services, closures, settings, and credentials associated with this business. This cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setBusinessToDelete(null)}
                disabled={deletingId !== null}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                loading={deletingId === businessToDelete.publicId}
                onClick={async () => {
                  setDeletingId(businessToDelete.publicId);
                  try {
                    await api.adminDeleteBusiness(businessToDelete.publicId);
                    setBusinesses((prev) => prev.filter((b) => b.publicId !== businessToDelete.publicId));
                    setBusinessToDelete(null);
                    window.location.reload();
                  } catch (err) {
                    alert(err instanceof Error ? err.message : 'Failed to delete business.');
                  } finally {
                    setDeletingId(null);
                  }
                }}
              >
                Delete Business
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
