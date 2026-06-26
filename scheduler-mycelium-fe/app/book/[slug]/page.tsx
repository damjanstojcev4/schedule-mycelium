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
  const [showSummary, setShowSummary] = useState(false);

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

  const totalSteps = business.soloOperator ? 3 : 4;
  const currentStepIndex = business.soloOperator
    ? step === 1 ? 1 : step === 3 ? 2 : step === 4 ? 3 : step
    : step;

  const stepLabels: Record<number, string> = {
    1: 'Service',
    2: business.soloOperator ? 'Time' : 'Staff',
    3: business.soloOperator ? 'Your Details' : 'Time',
    4: 'Your Details',
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Top nav */}
      <BookingNavbar businessName={business.name} />

      {/* Business header */}
      <div className="bg-zinc-950 text-white pt-16 pb-6 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-start gap-3 mt-4">
            {/* Business initial avatar */}
            <div className="h-12 w-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-lg font-bold text-white shrink-0">
              {business.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              {business.category && (
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-0.5">{business.category}</p>
              )}
              <h1 className="text-xl font-bold text-white leading-tight">{business.name}</h1>
              <div className="mt-1 flex flex-wrap gap-3 text-xs text-zinc-400">
                {business.phone && (
                  <span className="flex items-center gap-1">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {business.phone}
                  </span>
                )}
                {business.address && (
                  <span className="flex items-center gap-1">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {business.address}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step progress bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-zinc-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <StepIndicator
            currentStep={step}
            soloOperator={business.soloOperator}
            onStepClick={(num) => setStep(num)}
            totalSteps={totalSteps}
            currentStepIndex={currentStepIndex}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 pb-32">
        {/* Step heading */}
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">
          Step {currentStepIndex} of {totalSteps}
        </p>
        <h2 className="text-2xl font-bold text-zinc-900 mb-6">{stepLabels[step]}</h2>

        <div className="animate-fade-in">
          {step === 1 && <ServicePicker services={business.services} />}
          {step === 2 && !business.soloOperator && <StaffPicker staff={business.staff} />}
          {step === 3 && <SlotPicker slug={business.slug} />}
          {step === 4 && (
            <>
              {bookingError && (
                <div className="mb-5 rounded-2xl bg-red-50 border border-red-200 px-4 py-3.5 flex items-start gap-3">
                  <svg className="h-5 w-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-700 font-medium">{bookingError}</p>
                </div>
              )}
              <GuestForm onSubmit={handleGuestSubmit} loading={bookingLoading} />
            </>
          )}
        </div>
      </div>

      {/* Sticky bottom summary strip (visible after step 1) */}
      {selectedService && step < 4 && (
        <div className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-zinc-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="max-w-2xl mx-auto px-4 py-3">
            <button
              type="button"
              onClick={() => setShowSummary(!showSummary)}
              className="w-full flex items-center justify-between text-sm text-zinc-600 mb-2 hover:text-zinc-900 transition-colors"
            >
              <span className="font-semibold text-zinc-900">{selectedService.name}</span>
              <span className="flex items-center gap-1 text-zinc-400 text-xs">
                {showSummary ? 'Hide' : 'Show'} details
                <svg className={['h-3.5 w-3.5 transition-transform', showSummary ? 'rotate-180' : ''].join(' ')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>
            {showSummary && (
              <div className="animate-slide-up pb-2">
                <BookingSummary />
              </div>
            )}
            <div className="flex gap-3">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="min-h-[48px] px-4 rounded-2xl border border-zinc-200 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors active:scale-[0.98]"
                >
                  Back
                </button>
              )}
            </div>
          </div>
        </div>
      )}
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
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="h-8 w-8 text-zinc-900" />
          <p className="text-sm text-zinc-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 gap-5">
        <div className="h-16 w-16 rounded-full bg-zinc-100 flex items-center justify-center">
          <svg className="h-8 w-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="text-center">
          <h1 className="text-lg font-bold text-zinc-900">Business not found</h1>
          <p className="mt-1 text-sm text-zinc-500">{error || 'This booking page doesn\'t exist.'}</p>
        </div>
        <Link href="/" className="text-sm font-semibold text-zinc-900 underline underline-offset-2">
          Browse all businesses
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
