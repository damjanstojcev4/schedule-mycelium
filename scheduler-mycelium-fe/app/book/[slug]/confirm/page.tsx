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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Success icon */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-4">
            <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Confirmed!</h1>
          <p className="mt-2 text-sm text-gray-500">
            A confirmation will be sent to your email.
          </p>
        </div>

        {/* Confirmation details card */}
        {confirmation && (
          <div className="mb-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Business</span>
              <span className="font-semibold text-gray-900 text-right max-w-[60%]">
                {confirmation.businessName}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Service</span>
              <span className="font-medium text-gray-900 text-right">{confirmation.serviceName}</span>
            </div>
            {confirmation.staffName && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Staff</span>
                <span className="font-medium text-gray-900">{confirmation.staffName}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Date</span>
              <span className="font-medium text-gray-900">{formatDate(confirmation.startTime)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Time</span>
              <span className="font-medium text-gray-900">
                {formatTime(confirmation.startTime)} — {formatTime(confirmation.endTime)}
              </span>
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between text-sm">
              <span className="text-gray-500">Booked for</span>
              <span className="font-medium text-gray-900">{confirmation.guestName}</span>
            </div>
          </div>
        )}

        {/* Book another */}
        <Link
          href={`/book/${slug}`}
          id="book-another-btn"
          onClick={() => sessionStorage.removeItem('booking-confirmation')}
          className="block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-center text-sm font-medium text-gray-700 hover:border-gray-300 hover:text-gray-900 transition-colors shadow-sm"
        >
          Book another appointment
        </Link>

        {/* Upsell — subtle, non-pushy */}
        <div className="mt-8 rounded-xl border border-gray-100 bg-gray-50 p-5 text-center">
          <p className="text-sm font-medium text-black">
            Want to track your appointments?
          </p>
          <p className="mt-1 text-xs text-gray-900">
            Create a free account — takes 30 seconds.
          </p>
          <Link
            href="/register"
            id="upsell-register-link"
            className="mt-3 inline-block rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black transition-colors"
          >
            Create a free account
          </Link>
        </div>
      </div>
    </div>
  );
}
