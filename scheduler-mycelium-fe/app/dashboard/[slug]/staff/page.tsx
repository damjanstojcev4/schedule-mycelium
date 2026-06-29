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
import type { StaffMember, StaffScheduleEntry, StaffScheduleResponseDTO } from '@/types/api';

interface StaffFormState {
  email: string;
  name: string;
  roleTitle: string;
  workStart: string;
  workEnd: string;
  breakStart: string;
  breakEnd: string;
}

const emptyForm: StaffFormState = {
  email: '',
  name: '',
  roleTitle: '',
  workStart: '09:00',
  workEnd: '17:00',
  breakStart: '',
  breakEnd: '',
};

const DEFAULT_SCHEDULE: StaffScheduleEntry[] = [
  'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'
].map(day => ({
  dayOfWeek: day as any,
  isWorking: !['SATURDAY', 'SUNDAY'].includes(day),
  workStart: '09:00',
  workEnd: '17:00',
  breakStart: null,
  breakEnd: null
}));

export default function DashboardStaffPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { auth } = useAuth();

  const [businessPublicId, setBusinessPublicId] = useState<string | null>(auth?.businessPublicId || null);
  const [soloOperator, setSoloOperator] = useState(false);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Add Staff Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<StaffFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  
  const [newCredentials, setNewCredentials] = useState<{ email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Details Modal
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [schedule, setSchedule] = useState<StaffScheduleEntry[]>([]);
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const [scheduleError, setScheduleError] = useState('');
  const [scheduleSuccess, setScheduleSuccess] = useState('');

  async function copyPassword() {
    if (!newCredentials) return;
    await navigator.clipboard.writeText(newCredentials.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  useEffect(() => {
    if (!slug) return;
    const raw = sessionStorage.getItem(`solo-${slug}`);
    if (raw === 'true') setSoloOperator(true);

    if (!businessPublicId) {
      setLoading(true);
      api
        .getBookingPage(slug)
        .then((biz) => {
          setBusinessPublicId(biz.publicId);
        })
        .catch((e: Error) => {
          setError(e.message);
          setLoading(false);
        });
      return;
    }

    setLoading(true);
    api
      .getStaff(businessPublicId)
      .then(setStaff)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug, businessPublicId]);

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
    if (!form.email.trim() || !form.email.includes('@')) { setFormError('A valid email address is required.'); return; }
    if (!form.name.trim()) { setFormError('Display name is required.'); return; }
    if (!form.roleTitle.trim()) { setFormError('Role title is required.'); return; }
    if (!form.workStart || !form.workEnd) { setFormError('Work hours are required.'); return; }
    if (!businessPublicId) { setFormError('Business public ID is missing.'); return; }

    setSaving(true);
    setFormError('');
    try {
      const created = await api.createStaff(businessPublicId, {
        email: form.email.trim().toLowerCase(),
        name: form.name.trim(),
        roleTitle: form.roleTitle.trim(),
        workStart: form.workStart,
        workEnd: form.workEnd,
        breakStart: form.breakStart || undefined,
        breakEnd: form.breakEnd || undefined,
      });
      setStaff((prev) => [...prev, created]);
      closeModal();

      if (created.tempPassword) {
        setNewCredentials({ email: created.email, password: created.tempPassword });
      } else {
        window.location.reload();
      }
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Failed to add staff.');
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(member: StaffMember, e: React.MouseEvent) {
    e.stopPropagation();
    if (!businessPublicId) return;
    if (!confirm(`Remove ${member.name} from this business?`)) return;
    try {
      await api.removeStaff(businessPublicId, member.publicId);
      setStaff((prev) => prev.filter((s) => s.publicId !== member.publicId));
      if (selectedStaff?.publicId === member.publicId) {
        setSelectedStaff(null);
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to remove staff.');
    }
  }

  async function openStaffDetails(member: StaffMember) {
    setSelectedStaff(member);
    setScheduleError('');
    setScheduleSuccess('');
    setScheduleLoading(true);
    if (!businessPublicId) return;
    
    try {
      const res = await api.getStaffSchedule(businessPublicId, member.publicId);
      // Backend might return empty if not created yet, so fallback to default
      if (res && res.schedule && res.schedule.length === 7) {
        setSchedule(res.schedule);
      } else {
        setSchedule(JSON.parse(JSON.stringify(DEFAULT_SCHEDULE)));
      }
    } catch (err: any) {
      // If 404, we can assume no schedule exists and provide defaults
      if (err.status === 404) {
        setSchedule(JSON.parse(JSON.stringify(DEFAULT_SCHEDULE)));
      } else {
        setScheduleError(err.message || 'Failed to load schedule');
      }
    } finally {
      setScheduleLoading(false);
    }
  }

  function updateScheduleDay(index: number, field: keyof StaffScheduleEntry, value: any) {
    const updated = [...schedule];
    updated[index] = { ...updated[index], [field]: value };
    setSchedule(updated);
  }

  async function handleSaveSchedule() {
    if (!businessPublicId || !selectedStaff) return;
    setScheduleSaving(true);
    setScheduleError('');
    setScheduleSuccess('');
    try {
      await api.updateStaffSchedule(businessPublicId, selectedStaff.publicId, {
        schedule
      });
      setScheduleSuccess('Schedule updated successfully!');
    } catch (err: any) {
      setScheduleError(err.message || 'Failed to save schedule');
    } finally {
      setScheduleSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title={soloOperator ? "Working Hours" : "Staff"}
        description={soloOperator ? "Manage your weekly schedule and working hours." : "Manage the team members at your business."}
        action={
          !soloOperator && (
            <Button id="add-staff-btn" onClick={openAdd}>
              + Add Staff
            </Button>
          )
        }
      />

      {newCredentials && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-amber-800 mb-1">
                ✓ New staff account created — share these credentials once
              </p>
              <p className="text-xs text-amber-700 mb-3">
                This password will not be shown again. The staff member should change it after first login.
              </p>
              <div className="space-y-1 font-mono text-sm text-amber-900">
                <p><span className="font-semibold">Email:</span> {newCredentials.email}</p>
                <p className="flex items-center gap-2 flex-wrap">
                  <span><span className="font-semibold">Temp password:</span> {newCredentials.password}</span>
                  <button
                    type="button"
                    onClick={copyPassword}
                    className="inline-flex items-center gap-1 rounded bg-amber-100 hover:bg-amber-200 px-1.5 py-0.5 text-xs font-semibold text-amber-800 transition-colors"
                  >
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setNewCredentials(null);
              }}
              className="shrink-0 rounded-lg p-1 text-amber-600 hover:bg-amber-100 transition-colors"
              aria-label="Dismiss"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

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
            <div 
              key={member.publicId} 
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => openStaffDetails(member)}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-black shrink-0">
                  {member.name.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <p className="font-medium text-gray-900">{member.name}</p>
                  <p className="text-sm text-gray-500">{member.roleTitle}</p>
                  <p className="text-xs text-gray-400">
                    {member.email}
                  </p>
                </div>
              </div>

              <div className="flex justify-end shrink-0">
                {!soloOperator && (
                  <Button
                    id={`remove-staff-${member.publicId}`}
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleRemove(member, e)}
                    className="text-gray-400 hover:text-red-600 shrink-0"
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      <Modal isOpen={!!selectedStaff} onClose={() => setSelectedStaff(null)} title={selectedStaff?.name || 'Staff Details'}>
        {selectedStaff && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Basic Info</h3>
              <p className="text-sm text-gray-500 mt-1">{selectedStaff.roleTitle} &middot; {selectedStaff.email}</p>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Weekly Schedule</h3>
              
              {scheduleLoading ? (
                <div className="flex justify-center py-6"><Spinner className="h-6 w-6 text-gray-900" /></div>
              ) : (
                <div className="space-y-3">
                  {scheduleError && <div className="text-sm text-red-600">{scheduleError}</div>}
                  {scheduleSuccess && <div className="text-sm text-green-600">{scheduleSuccess}</div>}
                  
                  {schedule.map((entry, index) => (
                    <div key={entry.dayOfWeek} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="w-28 shrink-0 flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={entry.isWorking}
                          onChange={(e) => updateScheduleDay(index, 'isWorking', e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                        />
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {entry.dayOfWeek.toLowerCase()}
                        </span>
                      </div>
                      
                      {entry.isWorking ? (
                        <div className="flex flex-1 flex-wrap items-center gap-2">
                          <input
                            type="time"
                            value={entry.workStart || ''}
                            onChange={(e) => updateScheduleDay(index, 'workStart', e.target.value)}
                            className="block w-24 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-black focus:ring-black"
                          />
                          <span className="text-sm text-gray-500">-</span>
                          <input
                            type="time"
                            value={entry.workEnd || ''}
                            onChange={(e) => updateScheduleDay(index, 'workEnd', e.target.value)}
                            className="block w-24 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-black focus:ring-black"
                          />
                          
                          <div className="flex items-center gap-2 ml-auto">
                            <span className="text-xs text-gray-400">Break:</span>
                            <input
                              type="time"
                              value={entry.breakStart || ''}
                              onChange={(e) => updateScheduleDay(index, 'breakStart', e.target.value)}
                              className="block w-22 rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-500 focus:border-black focus:ring-black"
                            />
                            <span className="text-xs text-gray-400">-</span>
                            <input
                              type="time"
                              value={entry.breakEnd || ''}
                              onChange={(e) => updateScheduleDay(index, 'breakEnd', e.target.value)}
                              className="block w-22 rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-500 focus:border-black focus:ring-black"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400 italic">Not working</div>
                      )}
                    </div>
                  ))}
                  
                  <div className="pt-4 flex justify-end">
                    <Button
                      loading={scheduleSaving}
                      onClick={handleSaveSchedule}
                      className="px-6"
                    >
                      Save Schedule
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Add Staff Modal */}
      <Modal isOpen={modalOpen} onClose={closeModal} title="Add Staff Member">
        <div className="space-y-4">
          {formError && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-700">
            Enter the staff member&apos;s email. If they don&apos;t have an account yet, one will be created automatically and you&apos;ll see a temporary password to share with them.
          </div>

          <Input
            id="staff-email"
            label="Email address"
            type="email"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="staff@example.com"
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
