'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { type FormEvent, Suspense, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';

type Role = 'CUSTOMER' | 'BUSINESS_OWNER';

const CATEGORIES = [
  'Barbershop',
  'Nail Salon',
  'Tattoo Studio',
  'Beauty Salon',
  'Dentist',
  'Massage',
  'Trainer',
];

interface FormErrors {
  email?: string;
  password?: string;
  businessName?: string;
  category?: string;
  phone?: string;
  address?: string;
  form?: string;
}

function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Pre-select role from query param (e.g. ?role=BUSINESS_OWNER from landing CTA)
  const initialRole = searchParams.get('role') === 'BUSINESS_OWNER' ? 'BUSINESS_OWNER' : 'CUSTOMER';

  const [role, setRole] = useState<Role>(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Business fields
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [soloOperator, setSoloOperator] = useState(true); // default ON

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const e: FormErrors = {};
    if (!email) e.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email.';
    if (!password) e.password = 'Password is required.';
    else if (password.length < 8) e.password = 'Password must be at least 8 characters.';
    if (role === 'BUSINESS_OWNER') {
      if (!businessName.trim()) e.businessName = 'Business name is required.';
      if (!category) e.category = 'Category is required.';
      if (!phone.trim()) e.phone = 'Phone is required.';
      if (!address.trim()) e.address = 'Address is required.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      await register({ email, password, role });

      if (role === 'BUSINESS_OWNER') {
        const business = await api.createBusiness({
          name: businessName.trim(),
          category,
          phone: phone.trim(),
          address: address.trim(),
          description: description.trim() || undefined,
          soloOperator,
        });
        router.push(`/dashboard/${business.slug}`);
      } else {
        router.push('/my-appointments');
      }
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Registration failed.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />

      <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
            <p className="mt-1 text-sm text-gray-500">Get started in minutes</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5" noValidate id="register-form">
              {errors.form && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {errors.form}
                </div>
              )}

              {/* Role selector cards */}
              <div>
                <p className="mb-3 text-sm font-medium text-gray-700">I am a…</p>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    {
                      value: 'CUSTOMER' as Role,
                      icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
                      title: 'Customer',
                      desc: 'Book appointments easily',
                    },
                    {
                      value: 'BUSINESS_OWNER' as Role,
                      icon: <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
                      title: 'Business Owner',
                      desc: 'Manage your bookings',
                    },
                  ] as const).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      id={`role-${opt.value.toLowerCase()}`}
                      onClick={() => setRole(opt.value)}
                      className={[
                        'rounded-xl border-2 px-4 py-4 text-left transition-all',
                        role === opt.value
                          ? 'border-gray-900 bg-gray-50'
                          : 'border-gray-200 bg-white hover:border-gray-300',
                      ].join(' ')}
                    >
                      <div className="mb-1 text-gray-700">{opt.icon}</div>
                      <p className={`text-sm font-semibold ${role === opt.value ? 'text-black' : 'text-gray-800'}`}>
                        {opt.title}
                      </p>
                      <p className="text-xs text-gray-500">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <Input
                id="register-email"
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                placeholder="you@example.com"
                autoComplete="email"
              />

              <Input
                id="register-password"
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />

              {/* Business Owner fields */}
              {role === 'BUSINESS_OWNER' && (
                <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Business Details
                  </p>

                  <Input
                    id="business-name"
                    label="Business name"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    error={errors.businessName}
                    placeholder="Mario's Barbershop"
                  />

                  <Select
                    id="business-category"
                    label="Category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    error={errors.category}
                  >
                    <option value="">Select a category…</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </Select>

                  <Input
                    id="business-phone"
                    label="Phone number"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    error={errors.phone}
                    placeholder="+389 7X XXX XXX"
                  />

                  <Input
                    id="business-address"
                    label="Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    error={errors.address}
                    placeholder="Str. Makedonija 1, Skopje"
                  />

                  <Textarea
                    id="business-description"
                    label="Description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Tell customers about your business…"
                  />

                  {/* Solo operator toggle */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      id="solo-operator-toggle"
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
                      <p className="text-sm font-medium text-gray-700">I work alone (no staff members)</p>
                      <p className="text-xs text-gray-400">
                        Customers won&apos;t need to pick a staff member
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Button
                id="register-submit-btn"
                type="submit"
                loading={loading}
                className="w-full"
              >
                {role === 'BUSINESS_OWNER' ? 'Create account & business' : 'Create account'}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-gray-900 hover:text-black hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-900 border-t-transparent" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
