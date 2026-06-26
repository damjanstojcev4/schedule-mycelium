'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { BookingConfirmation } from '@/types/api';
import { formatDate, formatTime } from '@/lib/format';

export default function BookingConfirmPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('booking-confirmation');
    if (raw) {
      try {
        // eslint-disable-next-line
        setConfirmation(JSON.parse(raw) as BookingConfirmation);
        sessionStorage.removeItem('booking-confirmation');
      } catch {
        // ignore corrupt data
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Top band */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8">
        {/* Animated checkmark */}
        <div className="relative mb-8">
          <div className="h-24 w-24 rounded-full bg-emerald-500 flex items-center justify-center shadow-xl shadow-emerald-500/30">
            <svg
              className="h-12 w-12 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              style={{ animation: 'checkmark 0.6s ease 0.2s both' }}
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          {/* Pulse ring */}
          <div
            className="absolute inset-0 rounded-full bg-emerald-500/30"
            style={{ animation: 'pulse-ring 1.2s ease-out 0.3s forwards' }}
          />
        </div>

        <h1 className="text-3xl font-bold text-white text-center">You&apos;re booked!</h1>
        <p className="mt-2 text-zinc-400 text-center text-sm max-w-xs">
          A confirmation has been sent to your email. We&apos;ll see you soon!
        </p>
      </div>

      {/* Details card */}
      <div className="mx-4 mb-4 rounded-3xl bg-white overflow-hidden shadow-2xl animate-slide-up">
        {confirmation && (
          <>
            {/* Business + service header */}
            <div className="px-6 pt-6 pb-5 border-b border-zinc-100">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">{confirmation.businessName}</p>
              <p className="text-xl font-bold text-zinc-900">{confirmation.serviceName}</p>
              {confirmation.staffName && (
                <p className="text-sm text-zinc-500 mt-0.5">with {confirmation.staffName}</p>
              )}
            </div>

            {/* Date & time — big visual */}
            <div className="px-6 py-5 flex items-center gap-4 border-b border-zinc-100">
              {/* Calendar icon block */}
              <div className="h-16 w-16 rounded-2xl bg-zinc-950 flex flex-col items-center justify-center shrink-0 text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 leading-none">
                  {new Date(confirmation.startTime).toLocaleDateString('en-GB', { month: 'short' })}
                </span>
                <span className="text-2xl font-black text-white leading-none mt-0.5">
                  {new Date(confirmation.startTime).getDate()}
                </span>
              </div>
              <div>
                <p className="text-base font-bold text-zinc-900">
                  {formatDate(confirmation.startTime)}
                </p>
                <p className="text-sm text-zinc-500 mt-0.5">
                  {formatTime(confirmation.startTime)} — {formatTime(confirmation.endTime)}
                </p>
              </div>
            </div>

            {/* Guest name */}
            <div className="px-6 py-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-zinc-100 flex items-center justify-center text-sm font-bold text-zinc-700 shrink-0">
                {confirmation.guestName?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <p className="text-xs text-zinc-400 font-medium">Booked for</p>
                <p className="text-sm font-semibold text-zinc-900">{confirmation.guestName}</p>
              </div>
            </div>
          </>
        )}

        {/* Actions */}
        <div className="px-4 pb-6 pt-2 space-y-3">
          <Link
            href={`/book/${slug}`}
            id="book-another-btn"
            className="flex items-center justify-center w-full min-h-[48px] rounded-2xl bg-zinc-900 text-white text-sm font-bold hover:bg-zinc-800 transition-colors active:scale-[0.98]"
          >
            Book another appointment
          </Link>

          <div className="rounded-2xl bg-zinc-50 border border-zinc-100 p-4 text-center">
            <p className="text-sm font-semibold text-zinc-900">Track your appointments</p>
            <p className="text-xs text-zinc-500 mt-0.5">Create a free account — takes 30 seconds.</p>
            <Link
              href="/register"
              id="upsell-register-link"
              className="mt-3 inline-flex items-center justify-center rounded-xl bg-zinc-900 text-white text-sm font-semibold px-5 py-2.5 hover:bg-zinc-800 transition-colors active:scale-[0.98]"
            >
              Create free account
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes checkmark {
          from { stroke-dasharray: 100; stroke-dashoffset: 100; }
          to   { stroke-dasharray: 100; stroke-dashoffset: 0; }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
