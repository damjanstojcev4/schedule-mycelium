'use client';

import { useState, type FormEvent } from 'react';

const WEBHOOK_URL = 'https://n8n.myceliumagency.cloud/webhook-test/demo-request';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

/** Formats digits into XXX-XXX-XXX mask */
function formatPhoneMask(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 9);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function DemoRequestForm() {
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const isValid = businessName.trim() && email.trim() && phone.trim();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    setFormState('submitting');
    setErrorMsg('');

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: businessName.trim(),
          email: email.trim(),
          phone: phone.trim(),
        }),
      });

      if (!res.ok) throw new Error('Failed to submit. Please try again.');

      setFormState('success');
      setBusinessName('');
      setEmail('');
      setPhone('');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.');
      setFormState('error');
    }
  }

  // ── Success state ──────────────────────────────────────────────────────
  if (formState === 'success') {
    return (
      <div className="text-center py-8 animate-scale-in">
        {/* Animated checkmark */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 ring-8 ring-emerald-50/50">
          <svg className="h-10 w-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
              style={{ strokeDasharray: 100, animation: 'checkmark 0.6s ease forwards 0.2s' }}
            />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Request received!
        </h3>
        <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">
          Thank you for your interest. We&apos;ll reach out shortly to schedule your personalized demo.
        </p>
        <button
          type="button"
          onClick={() => setFormState('idle')}
          className="mt-6 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors underline underline-offset-4"
        >
          Submit another request
        </button>
      </div>
    );
  }

  // ── Form state ─────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Business Name */}
      <div>
        <label htmlFor="demo-business-name" className="block text-sm font-semibold text-gray-700 mb-1.5">
          Business Name
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <input
            id="demo-business-name"
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Your business name"
            required
            className="w-full rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm py-3.5 pl-12 pr-4 text-base text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="demo-email" className="block text-sm font-semibold text-gray-700 mb-1.5">
          Email Address
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <input
            id="demo-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@business.com"
            required
            className="w-full rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm py-3.5 pl-12 pr-4 text-base text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        </div>
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="demo-phone" className="block text-sm font-semibold text-gray-700 mb-1.5">
          Phone Number
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <input
            id="demo-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(formatPhoneMask(e.target.value))}
            placeholder="070-123-456"
            maxLength={11}
            required
            className="w-full rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm py-3.5 pl-12 pr-4 text-base text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        </div>
      </div>

      {/* Error */}
      {formState === 'error' && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium animate-fade-in">
          {errorMsg}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        id="demo-submit-btn"
        disabled={!isValid || formState === 'submitting'}
        className={[
          'w-full rounded-xl py-4 text-base font-bold transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          isValid
            ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/25 active:scale-[0.98]'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed',
        ].join(' ')}
      >
        {formState === 'submitting' ? (
          <span className="inline-flex items-center gap-2">
            <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Sending…
          </span>
        ) : (
          'Request a Free Demo'
        )}
      </button>

      <p className="text-center text-xs text-gray-400 pt-1">
        No commitment required. We&apos;ll get back to you within 24 hours.
      </p>
    </form>
  );
}
