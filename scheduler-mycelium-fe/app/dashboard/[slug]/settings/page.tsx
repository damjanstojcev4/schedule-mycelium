'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import type { BusinessBookingPage, BusinessSettings } from '@/types/api';

export default function DashboardSettingsPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { auth } = useAuth();

  const [businessPublicId, setBusinessPublicId] = useState<string | null>(auth?.businessPublicId || null);
  const [biz, setBiz] = useState<BusinessBookingPage | null>(null);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Business info form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState('');
  const [soloOperator, setSoloOperator] = useState(false);
  const [savingBiz, setSavingBiz] = useState(false);
  const [bizSaved, setBizSaved] = useState(false);
  const [bizError, setBizError] = useState('');

  // Booking settings form state
  const [cutoffHours, setCutoffHours] = useState('');
  const [slotInterval, setSlotInterval] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsError, setSettingsError] = useState('');

  useEffect(() => {
    if (!slug) return;
    if (!businessPublicId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(true);
      api
        .getBookingPage(slug)
        .then((bizData) => {
          setBusinessPublicId(bizData.publicId);
        })
        .catch((e: Error) => {
          setError(e.message);
          setLoading(false);
        });
      return;
    }

    setLoading(true);
    Promise.all([api.getBookingPage(slug), api.getSettings(businessPublicId)])
      .then(([b, s]) => {
        setBiz(b);
        setName(b.name);
        setDescription(b.description ?? '');
        setPhone(b.phone ?? '');
        setAddress(b.address ?? '');
        setCategory(b.category ?? '');
        setSoloOperator(b.soloOperator);
        setSettings(s);
        setCutoffHours(String(s.cancellationCutoffHours));
        setSlotInterval(String(s.slotIntervalMinutes));
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug, businessPublicId]);

  async function handleSaveBiz() {
    if (!businessPublicId) { setBizError('Business public ID is missing.'); return; }
    setSavingBiz(true);
    setBizError('');
    setBizSaved(false);
    try {
      await api.updateBusiness(businessPublicId, {
        name: name.trim(),
        description: description.trim() || undefined,
        phone: phone.trim(),
        address: address.trim(),
        category: category.trim(),
        soloOperator,
      });
      setBizSaved(true);
      setTimeout(() => setBizSaved(false), 3000);
      window.location.reload();
    } catch (e) {
      setBizError(e instanceof Error ? e.message : 'Failed to save.');
    } finally {
      setSavingBiz(false);
    }
  }

  async function handleSaveSettings() {
    if (!businessPublicId) { setSettingsError('Business public ID is missing.'); return; }
    const cutoff = parseInt(cutoffHours, 10);
    const interval = parseInt(slotInterval, 10);
    if (isNaN(cutoff) || cutoff < 0) { setSettingsError('Cutoff hours must be 0 or more.'); return; }
    if (isNaN(interval) || interval < 5) { setSettingsError('Slot interval must be at least 5 minutes.'); return; }
    setSavingSettings(true);
    setSettingsError('');
    setSettingsSaved(false);
    try {
      await api.updateSettings(businessPublicId, {
        cancellationCutoffHours: cutoff,
        slotIntervalMinutes: interval,
      });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
      window.location.reload();
    } catch (e) {
      setSettingsError(e instanceof Error ? e.message : 'Failed to save.');
    } finally {
      setSavingSettings(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8 text-gray-900" />
      </div>
    );
  }

  if (error || !biz) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
        {error || 'Failed to load settings.'}
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-8">
      <PageHeader title="Settings" description="Manage your business information and booking preferences." />

      {/* Business Info */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Business Info</h2>

        {bizError && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {bizError}
          </div>
        )}

        <Input id="settings-name" label="Business name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input id="settings-category" label="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
        <Input id="settings-phone" label="Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Input id="settings-address" label="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
        <Textarea id="settings-description" label="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />

        {/* Solo operator toggle */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            id="settings-solo-toggle"
            role="switch"
            aria-checked={soloOperator}
            onClick={() => setSoloOperator((v) => !v)}
            className={[
              'relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent',
              'transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
              soloOperator ? 'bg-gray-900' : 'bg-gray-200',
            ].join(' ')}
          >
            <span
              className={[
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
                soloOperator ? 'translate-x-5' : 'translate-x-0',
              ].join(' ')}
            />
          </button>
          <div>
            <p className="text-sm font-medium text-gray-700">Solo operator</p>
            <p className="text-xs text-gray-500">Hides staff selection in the booking flow</p>
          </div>
        </div>

        <Button
          id="save-biz-btn"
          loading={savingBiz}
          onClick={handleSaveBiz}
        >
          {bizSaved ? '✓ Saved' : 'Save business info'}
        </Button>
      </div>

      {/* Booking Settings */}
      {settings && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Booking Settings</h2>

          {settingsError && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {settingsError}
            </div>
          )}

          <Input
            id="settings-cutoff"
            label="Cancellation cutoff (hours)"
            type="number"
            min="0"
            value={cutoffHours}
            onChange={(e) => setCutoffHours(e.target.value)}
          />
          <Input
            id="settings-interval"
            label="Slot interval (minutes)"
            type="number"
            min="5"
            value={slotInterval}
            onChange={(e) => setSlotInterval(e.target.value)}
          />

          <Button
            id="save-settings-btn"
            loading={savingSettings}
            onClick={handleSaveSettings}
          >
            {settingsSaved ? '✓ Saved' : 'Save booking settings'}
          </Button>
        </div>
      )}
    </div>
  );
}
