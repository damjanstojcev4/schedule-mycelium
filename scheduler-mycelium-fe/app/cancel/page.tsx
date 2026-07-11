'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import type { GuestAppointmentDTO, CancelConfirmationDTO } from '@/types/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

// ─── Types ────────────────────────────────────────────────────────────────────

type PageState = 'email' | 'list' | 'success';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return iso;
  }
}

function formatDateOnly(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function formatTimeOnly(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return iso;
  }
}

// ─── Email Step ───────────────────────────────────────────────────────────────

function EmailStep({
  onFound,
}: {
  onFound: (email: string, appts: GuestAppointmentDTO[]) => void;
}) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setError('');
    setLoading(true);
    try {
      const appts = await api.getAppointmentsByEmail(email.trim());
      onFound(email.trim(), appts);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Icon */}
      <div className="mb-6 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-zinc-100">
          <svg className="h-8 w-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>

      {/* Heading */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Cancel an Appointment</h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500">
          Enter the email address you used when booking and we&apos;ll find your upcoming appointments.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="cancel-email"
          type="email"
          label="Email address"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error}
          autoComplete="email"
          autoFocus
          required
          inputMode="email"
        />
        <Button
          type="submit"
          fullWidth
          loading={loading}
          size="lg"
          id="find-appointments-btn"
        >
          Find My Appointments
        </Button>
      </form>
    </div>
  );
}

// ─── Appointment Card ─────────────────────────────────────────────────────────

function AppointmentCard({
  appt,
  onCancel,
  cancelling,
}: {
  appt: GuestAppointmentDTO;
  onCancel: (appt: GuestAppointmentDTO) => void;
  cancelling: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      {/* Top band — service + business */}
      <div className="px-4 pt-4 pb-3">
        <p className="text-base font-semibold text-zinc-900">{appt.serviceName}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-500">
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {appt.businessName}
          </span>
        </div>
      </div>

      {/* Date/time pill */}
      <div className="mx-4 mb-4 flex items-center gap-2 rounded-xl bg-zinc-50 px-3 py-2.5">
        <svg className="h-4 w-4 shrink-0 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-700">{formatDateOnly(appt.startTime)}</p>
          <p className="text-xs text-zinc-400">{formatTimeOnly(appt.startTime)} – {formatTimeOnly(appt.endTime)}</p>
        </div>
      </div>

      {/* Action */}
      <div className="border-t border-zinc-100 px-4 py-3">
        {appt.canCancel ? (
          <Button
            variant="destructive"
            size="sm"
            fullWidth
            loading={cancelling}
            onClick={() => onCancel(appt)}
            id={`cancel-btn-${appt.publicId}`}
          >
            Cancel This Appointment
          </Button>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
              <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Cancellation deadline passed
            </div>
            <p className="text-xs text-zinc-400 text-center">
              Contact:{' '}
              <a href={`tel:${appt.businessPhone}`} className="font-semibold text-zinc-600 underline underline-offset-2">
                {appt.businessPhone}
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Appointment List Step ────────────────────────────────────────────────────

function AppointmentListStep({
  email,
  appointments,
  onReset,
  onSuccess,
}: {
  email: string;
  appointments: GuestAppointmentDTO[];
  onReset: () => void;
  onSuccess: (result: CancelConfirmationDTO) => void;
}) {
  const [toCancel, setToCancel] = useState<GuestAppointmentDTO | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function confirmCancel() {
    if (!toCancel) return;
    setCancellingId(toCancel.publicId);
    setToCancel(null);
    setError('');
    try {
      const result = await api.cancelByEmail(toCancel.publicId, email);
      onSuccess(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Cancellation failed. Please try again.');
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Back button — large tap target */}
      <button
        type="button"
        onClick={onReset}
        className="mb-5 flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-zinc-500 transition-colors active:text-zinc-900"
        id="search-again-btn"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Search again
      </button>

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold tracking-tight text-zinc-900">Your Appointments</h1>
        <p className="mt-1 text-sm text-zinc-500 break-all">
          Booked under <span className="font-medium text-zinc-700">{email}</span>
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Empty state */}
      {appointments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 py-12 text-center">
          <svg className="mx-auto mb-3 h-10 w-10 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm font-medium text-zinc-500">No upcoming appointments found.</p>
          <p className="mt-1 text-xs text-zinc-400">They may already be cancelled or completed.</p>
        </div>
      ) : (
        <div className="space-y-3 stagger-children">
          {appointments.map((appt) => (
            <AppointmentCard
              key={appt.publicId}
              appt={appt}
              onCancel={setToCancel}
              cancelling={cancellingId === appt.publicId}
            />
          ))}
        </div>
      )}

      {/* Confirmation modal */}
      <Modal
        isOpen={toCancel !== null}
        onClose={() => setToCancel(null)}
        title="Cancel this appointment?"
      >
        {toCancel && (
          <div className="space-y-5">
            <div className="rounded-xl bg-zinc-50 px-4 py-3">
              <p className="font-semibold text-zinc-800">{toCancel.serviceName}</p>
              <p className="text-sm text-zinc-500">at {toCancel.businessName}</p>
              <p className="mt-2 text-sm font-medium text-zinc-600">{formatDateOnly(toCancel.startTime)}</p>
              <p className="text-sm text-zinc-500">{formatTimeOnly(toCancel.startTime)} – {formatTimeOnly(toCancel.endTime)}</p>
            </div>
            <p className="text-sm text-zinc-500">This cannot be undone.</p>
            {/* Stack vertically on very small screens */}
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setToCancel(null)}
                id="keep-appointment-btn"
              >
                Keep It
              </Button>
              <Button
                variant="destructive"
                fullWidth
                onClick={confirmCancel}
                id="confirm-cancel-btn"
              >
                Yes, Cancel It
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ─── Success Step ─────────────────────────────────────────────────────────────

function SuccessStep({
  result,
  onReset,
}: {
  result: CancelConfirmationDTO;
  onReset: () => void;
}) {
  return (
    <div className="animate-scale-in text-center">
      {/* Check icon */}
      <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Appointment Cancelled</h1>

      {/* Summary card */}
      <div className="mx-auto mt-5 max-w-xs rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-4 text-left">
        <p className="text-sm font-semibold text-zinc-800">{result.serviceName}</p>
        <p className="text-sm text-zinc-500">at {result.businessName}</p>
        <p className="mt-2 text-sm font-medium text-zinc-600">{formatDateOnly(result.startTime)}</p>
        <p className="text-sm text-zinc-500">{formatTimeOnly(result.startTime)}</p>
      </div>

      <p className="mt-4 text-sm text-zinc-400">
        A cancellation confirmation has been sent to your email.
      </p>

      <div className="mt-8 space-y-3">
        <Link href={`/book/${result.businessSlug}`} className="block">
          <Button variant="primary" fullWidth size="lg" id="book-again-btn">
            Book Another Appointment →
          </Button>
        </Link>
        <Button
          variant="ghost"
          fullWidth
          onClick={onReset}
          id="cancel-another-btn"
        >
          Cancel Another Appointment
        </Button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CancelPage() {
  const [state, setState] = useState<PageState>('email');
  const [email, setEmail] = useState('');
  const [appointments, setAppointments] = useState<GuestAppointmentDTO[]>([]);
  const [successResult, setSuccessResult] = useState<CancelConfirmationDTO | null>(null);

  function handleFound(foundEmail: string, appts: GuestAppointmentDTO[]) {
    setEmail(foundEmail);
    setAppointments(appts);
    setState('list');
  }

  function handleSuccess(result: CancelConfirmationDTO) {
    setSuccessResult(result);
    setState('success');
  }

  function handleReset() {
    setEmail('');
    setAppointments([]);
    setSuccessResult(null);
    setState('email');
  }

  return (
    /*
     * Mobile-first layout:
     * - On small screens: full-height, no centering, content scrolls naturally from top
     * - On md+: centered card in the middle of the screen
     */
    <div className="min-h-screen bg-zinc-50">
      {/* Mobile: full-width flush; md+: centered card */}
      <div className="mx-auto w-full max-w-md px-4 pb-10 pt-8 md:flex md:min-h-screen md:items-center md:py-12">
        <div className="w-full">
          {/* Card — flush on mobile, rounded on desktop */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:rounded-3xl sm:p-8 sm:shadow-lg">
            {state === 'email' && <EmailStep onFound={handleFound} />}
            {state === 'list' && (
              <AppointmentListStep
                email={email}
                appointments={appointments}
                onReset={handleReset}
                onSuccess={handleSuccess}
              />
            )}
            {state === 'success' && successResult && (
              <SuccessStep result={successResult} onReset={handleReset} />
            )}
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-zinc-400">
            Powered by{' '}
            <Link href="/" className="underline-offset-2 hover:underline hover:text-zinc-600 transition-colors">
              Scheduler Mycelium
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
