'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Service, StaffMember } from '@/types/api';
import { BookingProvider, useBooking } from '@/contexts/BookingContext';
import { SlotPicker } from '@/components/booking/SlotPicker';
import { Spinner } from '@/components/ui/Spinner';

function NewAppointmentForm() {
  const router = useRouter();
  const { slug } = useParams() as { slug: string };
  const { 
    selectedService, setSelectedService, 
    selectedStaff, setSelectedStaff,
    selectedSlot
  } = useBooking();

  const [services, setServices] = useState<Service[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [soloOperator, setSoloOperator] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const raw = sessionStorage.getItem(`solo-${slug}`);
    if (raw === 'true') setSoloOperator(true);

    api.getBusinesses().then(businesses => {
      const biz = businesses.find(b => b.slug === slug);
      if (biz) {
        Promise.all([
          api.getServices(biz.publicId),
          api.getStaff(biz.publicId)
        ]).then(([svcs, staff]) => {
          setServices(svcs.filter(s => s.isActive));
          setStaffList(staff);
          if (raw === 'true' && staff.length > 0) {
            setSelectedStaff(staff[0]);
          }
        }).catch(err => {
          console.error(err);
          setError('Failed to load business data');
        }).finally(() => {
          setIsLoading(false);
        });
      }
    });
  }, [slug, setSelectedStaff]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedSlot) {
      setError('Please select a service, date, and time.');
      return;
    }
    
    if (!soloOperator && !selectedStaff) {
      setError('Please select a staff member.');
      return;
    }

    if (!customerName) {
      setError('Customer name is required.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await api.ownerBookAppointment(slug, {
        servicePublicId: selectedService.publicId,
        staffPublicId: soloOperator ? null : selectedStaff?.publicId ?? null,
        startTime: `${selectedSlot.date}T${selectedSlot.time}:00`,
        customerName,
        customerEmail: customerEmail || undefined,
        customerPhone: customerPhone || undefined,
        notes: notes || undefined
      });
      router.push(`/dashboard/${slug}/appointments`);
    } catch (err: any) {
      setError(err.message || 'Failed to book appointment');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-12"><Spinner className="w-8 h-8 text-black" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Appointment</h1>
      
      {error && <div className="mb-6 p-4 text-sm text-red-600 bg-red-50 rounded-lg">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service *</label>
            <select
              className="w-full rounded-lg border border-gray-300 p-2.5 shadow-sm focus:border-black focus:ring-black sm:text-sm"
              value={selectedService?.publicId || ''}
              onChange={(e) => {
                const s = services.find(x => x.publicId === e.target.value);
                setSelectedService(s || (null as any));
              }}
              required
            >
              <option value="">Select a service...</option>
              {services.map(s => (
                <option key={s.publicId} value={s.publicId}>{s.name} ({s.durationMinutes} min)</option>
              ))}
            </select>
          </div>

          {!soloOperator && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Staff Member *</label>
              <select
                className="w-full rounded-lg border border-gray-300 p-2.5 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                value={selectedStaff?.publicId || ''}
                onChange={(e) => {
                  const s = staffList.find(x => x.publicId === e.target.value);
                  setSelectedStaff(s || null);
                }}
                required={!soloOperator}
              >
                <option value="">Select a staff member...</option>
                {staffList.map(s => (
                  <option key={s.publicId} value={s.publicId}>{s.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {selectedService && (soloOperator || selectedStaff) && (
          <div className="pt-4 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-3">Date & Time *</label>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <SlotPicker slug={slug} />
            </div>
          </div>
        )}

        <div className="pt-6 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-black focus:ring-black sm:text-sm"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-black focus:ring-black sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-black focus:ring-black sm:text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-2.5 focus:border-black focus:ring-black sm:text-sm"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !selectedSlot}
            className="flex items-center justify-center rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none disabled:opacity-50"
          >
            {isSubmitting ? <Spinner className="w-5 h-5 mr-2" /> : null}
            {isSubmitting ? 'Creating...' : 'Create Appointment'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewAppointmentPage() {
  return (
    <BookingProvider>
      <NewAppointmentForm />
    </BookingProvider>
  );
}
