'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent, Suspense, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface FormErrors {
  email?: string;
  password?: string;
  form?: string;
}

function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const e: FormErrors = {};
    if (!email) e.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email.';
    if (!password) e.password = 'Password is required.';
    else if (password.length < 8) e.password = 'Password must be at least 8 characters.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      await register({ email, password, role: 'CUSTOMER' });
      router.push('/my-appointments');
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
        <div className="w-full max-w-md">
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

              <Button
                id="register-submit-btn"
                type="submit"
                loading={loading}
                className="w-full"
              >
                Create account
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
