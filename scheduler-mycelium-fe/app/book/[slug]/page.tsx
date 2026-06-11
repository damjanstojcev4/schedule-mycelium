'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';
import { BookingProvider, useBooking } from '@/contexts/BookingContext';
import { BookingNavbar } from '@/components/layout/BookingNavbar';
import { StepIndicator } from '@/components/booking/StepIndicator';
import { ServicePicker } from '@/components/booking/ServicePicker';
import { StaffPicker } from '@/components/booking/StaffPicker';
import { SlotPicker } from '@/components/booking/SlotPicker';
import { GuestForm } from '@/components/booking/GuestForm';
import { BookingSummary } from '@/components/booking/BookingSummary';
import { Spinner } from '@/components/ui/Spinner';
import type { BusinessBookingPage } from '@/types/api';

function BookingFlow({ business }: { business: BusinessBookingPage }) {
  const router = useRouter();
  const { step, selectedService, selectedStaff, selectedSlot, nextStep, setStep } = useBooking();
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // If soloOperator, skip step 2
  useEffect(() => {
    if (business.soloOperator && step === 2) {
      nextStep();
    }
  }, [step, business.soloOperator, nextStep]);

  async function handleGuestSubmit(info: {
    fullName: string;
    email: string;
    phone: string;
    notes: string;
  }) {
    if (!selectedService || !selectedSlot) return;
    setBookingLoading(true);
    setBookingError('');
    try {
      // Backend expects startTime as LocalDateTime: "2026-06-07T09:00:00"
      // Ensure time has seconds (HH:mm:ss) required by Java LocalDateTime parsing
      const timeWithSeconds = selectedSlot.time.length === 5
        ? `${selectedSlot.time}:00`
        : selectedSlot.time;
      const startTime = `${selectedSlot.date}T${timeWithSeconds}`;

      const result = await api.bookAppointment(business.slug, {
        servicePublicId: selectedService.publicId,
        staffPublicId: selectedStaff?.publicId,
        startTime,
        guestName: info.fullName,
        guestEmail: info.email,
        guestPhone: info.phone,
        notes: info.notes || undefined,
      });
      sessionStorage.setItem('booking-confirmation', JSON.stringify(result));
      router.push(`/book/${business.slug}/confirm`);
    } catch (e) {
      setBookingError(e instanceof Error ? e.message : 'Booking failed. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  }

  const handleBack = () => {
    if (business.soloOperator && step === 3) {
      setStep(1);
    } else {
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <BookingNavbar businessName={business.name} />

      {/* Business info strip */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-5xl px-4 py-5">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-900">
            {business.category}
          </p>
          <h1 className="mt-0.5 text-xl font-bold text-gray-900">{business.name}</h1>
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
            {business.phone && (
              <span className="flex items-center gap-1.5">
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {business.phone}
              </span>
            )}
            {business.address && (
              <span className="flex items-center gap-1.5">
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {business.address}
              </span>
            )}
          </div>
          {business.description && (
            <p className="mt-2 text-sm text-gray-500 max-w-2xl">{business.description}</p>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Main content */}
          <div className="flex-1">
            {/* Step indicator */}
            <div className="mb-8 flex justify-center">
              <StepIndicator
                currentStep={step}
                soloOperator={business.soloOperator}
                onStepClick={(num) => setStep(num)}
              />
            </div>

            {/* Step content */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              {step === 1 && <ServicePicker services={business.services} />}
              {step === 2 && !business.soloOperator && <StaffPicker staff={business.staff} />}
              {step === 3 && <SlotPicker slug={business.slug} />}
              {step === 4 && (
                <>
                  {bookingError && (
                    <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                      {bookingError}
                    </div>
                  )}
                  <GuestForm onSubmit={handleGuestSubmit} loading={bookingLoading} />
                </>
              )}

              {/* Back navigation for steps 2–4 */}
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="mt-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
              )}
            </div>
          </div>

          {/* Summary sidebar (desktop) */}
          <div className="hidden lg:block lg:w-72">
            <div className="sticky top-20">
              <BookingSummary />
            </div>
          </div>
        </div>

        {/* Summary card (mobile) */}
        <div className="mt-4 lg:hidden">
          <BookingSummary />
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [business, setBusiness] = useState<BusinessBookingPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getBookingPage(slug)
      .then(setBusiness)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Spinner className="h-8 w-8 text-gray-900" />
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 gap-4">
        <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-gray-500 text-center">{error || 'Business not found.'}</p>
        <Link href="/" className="text-sm text-gray-900 hover:underline">
          ← Browse all businesses
        </Link>
      </div>
    );
  }

  return (
    <BookingProvider>
      <BookingFlow business={business} />
    </BookingProvider>
  );
}
