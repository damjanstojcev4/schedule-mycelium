'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import type { StaffMember } from '@/types/api';

interface StaffFormState {
  accountId: string;
  name: string;
  roleTitle: string;
  workStart: string;
  workEnd: string;
  breakStart: string;
  breakEnd: string;
}

const emptyForm: StaffFormState = {
  accountId: '',
  name: '',
  roleTitle: '',
  workStart: '09:00',
  workEnd: '17:00',
  breakStart: '',
  breakEnd: '',
};

export default function DashboardStaffPage() {
  const params = useParams<{ slug: string }>();
  const { auth } = useAuth();
  const identifier = auth?.businessPublicId || params.slug;

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<StaffFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    api
      .getStaff(identifier)
      .then(setStaff)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [identifier]);

  function openAdd() {
    setForm(emptyForm);
    setFormError('');
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setForm(emptyForm);
  }

  function updateField(field: keyof StaffFormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    const accountId = parseInt(form.accountId, 10);
    if (isNaN(accountId)) { setFormError('Account ID must be a number.'); return; }
    if (!form.name.trim()) { setFormError('Name is required.'); return; }
    if (!form.roleTitle.trim()) { setFormError('Role title is required.'); return; }
    if (!form.workStart || !form.workEnd) { setFormError('Work hours are required.'); return; }

    setSaving(true);
    setFormError('');
    try {
      const created = await api.createStaff(identifier, {
        accountId,
        name: form.name.trim(),
        roleTitle: form.roleTitle.trim(),
        workStart: form.workStart,
        workEnd: form.workEnd,
        breakStart: form.breakStart || undefined,
        breakEnd: form.breakEnd || undefined,
      });
      setStaff((prev) => [...prev, created]);
      closeModal();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Failed to add staff.');
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(member: StaffMember) {
    if (!confirm(`Remove ${member.name} from this business?`)) return;
    try {
      await api.removeStaff(identifier, member.publicId);
      setStaff((prev) => prev.filter((s) => s.publicId !== member.publicId));
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to remove staff.');
    }
  }

  return (
    <div>
      <PageHeader
        title="Staff"
        description="Manage the team members at your business."
        action={
          <Button id="add-staff-btn" onClick={openAdd}>
            + Add Staff
          </Button>
        }
      />

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

      {!loading && staff.length === 0 && (
        <EmptyState
          title="No staff members yet"
          description="Add team members so customers can choose who to book with."
          action={<Button onClick={openAdd}>Add first staff member</Button>}
        />
      )}

      {!loading && staff.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
          {staff.map((member) => (
            <div key={member.publicId} className="flex items-center gap-4 px-6 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-black shrink-0">
                {member.name.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{member.name}</p>
                <p className="text-sm text-gray-500">{member.roleTitle}</p>
                <p className="text-xs text-gray-400">
                  {member.workStart} – {member.workEnd}
                  {member.breakStart && member.breakEnd
                    ? ` · Break ${member.breakStart}–${member.breakEnd}`
                    : ''}
                </p>
              </div>

              <Button
                id={`remove-staff-${member.publicId}`}
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(member)}
                className="text-gray-400 hover:text-red-600 shrink-0"
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add Staff Modal */}
      <Modal isOpen={modalOpen} onClose={closeModal} title="Add Staff Member">
        <div className="space-y-4">
          {formError && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          )}
          <Input
            id="staff-account-id"
            label="Account ID"
            type="number"
            value={form.accountId}
            onChange={(e) => updateField('accountId', e.target.value)}
            placeholder="Staff member's account ID"
          />
          <Input
            id="staff-name"
            label="Display name"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="e.g. Mario Rossi"
          />
          <Input
            id="staff-role"
            label="Role title"
            value={form.roleTitle}
            onChange={(e) => updateField('roleTitle', e.target.value)}
            placeholder="e.g. Senior Barber"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              id="staff-work-start"
              label="Work start"
              type="time"
              value={form.workStart}
              onChange={(e) => updateField('workStart', e.target.value)}
            />
            <Input
              id="staff-work-end"
              label="Work end"
              type="time"
              value={form.workEnd}
              onChange={(e) => updateField('workEnd', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              id="staff-break-start"
              label="Break start (optional)"
              type="time"
              value={form.breakStart}
              onChange={(e) => updateField('breakStart', e.target.value)}
            />
            <Input
              id="staff-break-end"
              label="Break end (optional)"
              type="time"
              value={form.breakEnd}
              onChange={(e) => updateField('breakEnd', e.target.value)}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={closeModal} disabled={saving}>
              Cancel
            </Button>
            <Button id="save-staff-btn" loading={saving} onClick={handleSave} className="flex-1">
              Add staff member
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
