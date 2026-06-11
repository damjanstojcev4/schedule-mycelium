import { type FormEvent, useState } from 'react';
import Link from 'next/link';
import { useBooking } from '@/contexts/BookingContext';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';

interface GuestFormProps {
  onSubmit: (info: {
    fullName: string;
    email: string;
    phone: string;
    notes: string;
  }) => Promise<void>;
  loading: boolean;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
}

export function GuestForm({ onSubmit, loading }: GuestFormProps) {
  const { guestInfo, setGuestInfo, prevStep } = useBooking();

  const [fullName, setFullName] = useState(guestInfo.fullName);
  const [email, setEmail] = useState(guestInfo.email);
  const [phone, setPhone] = useState(guestInfo.phone);
  const [notes, setNotes] = useState(guestInfo.notes);
  const [errors, setErrors] = useState<FormErrors>({});

  function handlePhoneChange(val: string) {
    const clean = val.replace(/\D/g, '');
    let masked = '';
    if (clean.length > 0) {
      masked += clean.substring(0, 3);
    }
    if (clean.length > 3) {
      masked += '-' + clean.substring(3, 6);
    }
    if (clean.length > 6) {
      masked += '-' + clean.substring(6, 9);
    }
    setPhone(masked);
  }

  function validate(): boolean {
    const e: FormErrors = {};
    if (!fullName.trim()) e.fullName = 'Full name is required.';
    if (!email.trim()) e.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address.';
    if (!phone.trim()) e.phone = 'Phone number is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const info = {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      notes: notes.trim(),
    };
    setGuestInfo(info);
    await onSubmit(info);
  }

  return (
    <div>
      <h2 className="mb-1 text-base font-semibold text-gray-900">Your details</h2>
      <p className="mb-5 text-sm text-gray-500">
        No account required — we&apos;ll send a confirmation to your email.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate id="guest-form">
        <Input
          id="guest-fullname"
          label="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={errors.fullName}
          placeholder="Jane Smith"
          autoComplete="name"
        />

        <Input
          id="guest-email"
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          placeholder="jane@example.com"
          autoComplete="email"
        />

        <Input
          id="guest-phone"
          label="Phone number"
          type="tel"
          value={phone}
          onChange={(e) => handlePhoneChange(e.target.value)}
          error={errors.phone}
          placeholder="XXX-XXX-XXX"
          autoComplete="tel"
        />

        <Textarea
          id="guest-notes"
          label="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Any special requests or information for the business…"
        />

        {/* Sign-in hint — never blocking, never redirects away */}
        <p className="text-xs text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="text-gray-900 hover:underline">
            Sign in
          </Link>{' '}
          to autofill your details.
        </p>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={prevStep}
            disabled={loading}
          >
            Back
          </Button>
          <Button
            id="guest-form-submit"
            type="submit"
            loading={loading}
            className="flex-1"
          >
            Confirm booking
          </Button>
        </div>
      </form>
    </div>
  );
}
