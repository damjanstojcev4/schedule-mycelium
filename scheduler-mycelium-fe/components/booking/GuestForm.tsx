import { type FormEvent, useState, useEffect } from 'react';
import Link from 'next/link';
import { useBooking } from '@/contexts/BookingContext';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
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
  const { guestInfo, setGuestInfo } = useBooking();
  const { auth } = useAuth();

  const [fullName, setFullName] = useState(guestInfo.fullName);
  const [email, setEmail] = useState(guestInfo.email);
  const [phone, setPhone] = useState(guestInfo.phone);
  const [notes, setNotes] = useState(guestInfo.notes);
  const [errors, setErrors] = useState<FormErrors>({});
  const [autofilled, setAutofilled] = useState(false);

  // Autofill from logged-in customer data
  useEffect(() => {
    if (!auth || auth.role !== 'CUSTOMER') return;
    // If fields already have content (user revisited step), don't overwrite
    if (fullName || email || phone) return;

    // 1) Pre-fill email from auth token (instant)
    if (auth.email) setEmail(auth.email);

    // 2) Pre-fill full name from auth token if stored at registration (instant)
    if (auth.fullName) {
      setFullName(auth.fullName);
      setAutofilled(true);
    }

    // 3) Fetch most recent appointment to fill phone (and name if not from auth)
    void (async () => {
      try {
        const appts = await api.getMyAppointments();
        const sorted = [...appts].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        const latest = sorted[0];
        if (latest) {
          const latestName = latest.customerName ?? latest.guestName ?? '';
          const latestPhone = latest.guestPhone ?? '';
          // Only fill name from appointments if auth didn't have it
          if (latestName && !auth.fullName) setFullName(latestName);
          if (latestPhone) setPhone(latestPhone);
          if (latest.guestEmail && !auth.email) setEmail(latest.guestEmail);
          setAutofilled(true);
        }
      } catch {
        // Silently ignore — autofill is best-effort
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth]);

  function handlePhoneChange(val: string) {
    const clean = val.replace(/\D/g, '');
    let masked = '';
    if (clean.length > 0) masked += clean.substring(0, 3);
    if (clean.length > 3) masked += '-' + clean.substring(3, 6);
    if (clean.length > 6) masked += '-' + clean.substring(6, 9);
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

  const isLoggedIn = auth?.role === 'CUSTOMER';

  return (
    <div>
      {/* Autofill notice for logged-in customers */}
      {isLoggedIn ? (
        <div className="flex items-center gap-2 mb-5 px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
          <svg className="h-4 w-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <p className="text-sm text-emerald-800 font-medium">
            {autofilled ? 'Details filled from your account.' : 'Logged in — filling your email.'}
          </p>
        </div>
      ) : (
        <p className="text-sm text-zinc-500 mb-6">
          No account required — we'll send a confirmation to your email.
        </p>
      )}

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
          // Don't lock it — customer may want to change the confirmation email
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
          placeholder="Any special requests or information…"
        />

        {!isLoggedIn && (
          <p className="text-sm text-zinc-400">
            Have an account?{' '}
            <Link href="/login" className="text-zinc-900 font-semibold hover:underline underline-offset-2">
              Sign in
            </Link>{' '}
            to autofill.
          </p>
        )}

        <div className="pt-2">
          <Button
            id="guest-form-submit"
            type="submit"
            loading={loading}
            size="lg"
            fullWidth
          >
            {loading ? 'Confirming...' : 'Confirm booking'}
          </Button>
        </div>
      </form>
    </div>
  );
}
