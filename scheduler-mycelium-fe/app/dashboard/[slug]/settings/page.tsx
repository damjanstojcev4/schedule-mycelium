'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm';
import type { BusinessBookingPage, BusinessSettings, CalendarStatusDTO } from '@/types/api';

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
  const [slotMode, setSlotMode] = useState<'SERVICE_DRIVEN' | 'INTERVAL_DRIVEN'>('SERVICE_DRIVEN');
  const [slotInterval, setSlotInterval] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsError, setSettingsError] = useState('');

  // Google Calendar integration state
  const [calendarStatus, setCalendarStatus] = useState<CalendarStatusDTO | null>(null);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarToast, setCalendarToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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
        setSlotMode(s.slotMode);
        setSlotInterval(String(s.slotIntervalMinutes));
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug, businessPublicId]);

  // Fetch Google Calendar connection status on mount
  useEffect(() => {
    api.getCalendarStatus()
      .then(setCalendarStatus)
      .catch(() => { /* not critical */ });
  }, []);

  // Handle ?calendar=connected and ?calendar=error query params after OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const calendarParam = params.get('calendar');
    if (calendarParam === 'connected') {
      setCalendarToast({ type: 'success', message: 'Google Calendar connected successfully!' });
      api.getCalendarStatus().then(setCalendarStatus).catch(() => {});
      window.history.replaceState({}, '', window.location.pathname);
    } else if (calendarParam === 'error') {
      setCalendarToast({ type: 'error', message: 'Failed to connect Google Calendar. Please try again.' });
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (calendarParam) {
      setTimeout(() => setCalendarToast(null), 5000);
    }
  }, []);

  async function handleSaveBiz() {
    if (!businessPublicId) { setBizError('Business public ID is missing.'); return; }
    if (!name.trim()) { setBizError('Business name is required.'); return; }
    setSavingBiz(true);
    setBizError('');
    setBizSaved(false);
    try {
      await api.updateBusiness(slug, {
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
    if (slotMode === 'INTERVAL_DRIVEN' && (isNaN(interval) || (interval !== 15 && interval !== 30))) { 
      setSettingsError('Slot interval must be 15 or 30 minutes.'); 
      return; 
    }
    setSavingSettings(true);
    setSettingsError('');
    setSettingsSaved(false);
    try {
      await api.updateSettings(businessPublicId, {
        cancellationCutoffHours: cutoff,
        slotMode,
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

  async function handleCalendarConnect() {
    try {
      setCalendarLoading(true);
      const { authorizationUrl } = await api.getCalendarConnectUrl();
      window.location.href = authorizationUrl;
    } catch (e) {
      setCalendarToast({ type: 'error', message: e instanceof Error ? e.message : 'Failed to start Google connection.' });
      setTimeout(() => setCalendarToast(null), 5000);
      setCalendarLoading(false);
    }
  }

  async function handleCalendarDisconnect() {
    try {
      setCalendarLoading(true);
      await api.disconnectCalendar();
      setCalendarStatus({ connected: false, googleEmail: null });
      setCalendarToast({ type: 'success', message: 'Google Calendar disconnected.' });
      setTimeout(() => setCalendarToast(null), 4000);
    } catch (e) {
      setCalendarToast({ type: 'error', message: e instanceof Error ? e.message : 'Failed to disconnect.' });
      setTimeout(() => setCalendarToast(null), 5000);
    } finally {
      setCalendarLoading(false);
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
          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Slot Display Mode</h3>
            
            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="radio" 
                  name="slotMode" 
                  value="SERVICE_DRIVEN"
                  checked={slotMode === 'SERVICE_DRIVEN'}
                  onChange={() => setSlotMode('SERVICE_DRIVEN')}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-gray-900">Service-driven</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Slots shown match your service duration.<br/>
                    A 60-min service shows slots every 60 minutes.<br/>
                    Recommended for most businesses.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="radio" 
                  name="slotMode" 
                  value="INTERVAL_DRIVEN"
                  checked={slotMode === 'INTERVAL_DRIVEN'}
                  onChange={() => setSlotMode('INTERVAL_DRIVEN')}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-gray-900">Interval-driven</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Slots shown at fixed intervals within working hours.<br/>
                    Lets customers start at any 15 or 30-minute mark.<br/>
                    Best if you manage your own schedule flexibly.
                  </div>
                </div>
              </label>
            </div>

            {slotMode === 'INTERVAL_DRIVEN' && (
              <div className="mt-6 ml-7">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Slot interval</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                    <input 
                      type="radio" 
                      name="slotInterval" 
                      value="15"
                      checked={slotInterval === '15'}
                      onChange={(e) => setSlotInterval(e.target.value)}
                    />
                    Every 15 minutes
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                    <input 
                      type="radio" 
                      name="slotInterval" 
                      value="30"
                      checked={slotInterval === '30'}
                      onChange={(e) => setSlotInterval(e.target.value)}
                    />
                    Every 30 minutes
                  </label>
                </div>
              </div>
            )}
          </div>

          <Button
            id="save-settings-btn"
            loading={savingSettings}
            onClick={handleSaveSettings}
          >
            {settingsSaved ? '✓ Saved' : 'Save booking settings'}
          </Button>
        </div>
      )}

      {/* Integrations */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Integrations</h2>

        {/* Calendar toast */}
        {calendarToast && (
          <div className={[
            'rounded-lg px-4 py-3 text-sm font-medium',
            calendarToast.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700',
          ].join(' ')}>
            {calendarToast.message}
          </div>
        )}

        {/* Google Calendar card */}
        <div className="border border-gray-100 rounded-lg p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">Google Calendar</span>
                  {calendarStatus?.connected && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                      ✓ Connected
                    </span>
                  )}
                </div>
                {calendarStatus?.connected && calendarStatus.googleEmail && (
                  <p className="text-xs text-gray-500 mt-0.5">{calendarStatus.googleEmail}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  {calendarStatus?.connected
                    ? 'New bookings automatically appear in your Google Calendar. Cancellations are removed.'
                    : 'Sync appointments automatically to your Google Calendar. Connect once, sync forever.'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4">
            {calendarStatus?.connected ? (
              <button
                id="calendar-disconnect-btn"
                type="button"
                disabled={calendarLoading}
                onClick={handleCalendarDisconnect}
                className="inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg px-4 py-2 transition-colors disabled:opacity-50"
              >
                {calendarLoading ? 'Disconnecting…' : 'Disconnect'}
              </button>
            ) : (
              <button
                id="calendar-connect-btn"
                type="button"
                disabled={calendarLoading}
                onClick={handleCalendarConnect}
                className="inline-flex items-center gap-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-700 rounded-lg px-4 py-2 transition-colors disabled:opacity-50"
              >
                {calendarLoading ? 'Redirecting…' : 'Connect Google Calendar'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Change Password */}
      <ChangePasswordForm />
    </div>
  );
}
