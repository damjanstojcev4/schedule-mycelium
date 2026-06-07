'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { AuthResponse } from '@/types/api';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const e: typeof errors = {};
    if (!email) e.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address.';
    if (!password) e.password = 'Password is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function redirectAfterLogin(auth: AuthResponse) {
    switch (auth.role) {
      case 'SUPER_ADMIN':
        router.push('/admin');
        break;
      case 'BUSINESS_OWNER':
        router.push(auth.slug ? `/dashboard/${auth.slug}` : '/');
        break;
      case 'STAFF':
        router.push(auth.slug ? `/staff/${auth.slug}` : '/');
        break;
      case 'CUSTOMER':
        router.push('/my-appointments');
        break;
      default:
        router.push('/');
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      const auth = await login({ email, password });
      redirectAfterLogin(auth);
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Invalid email or password.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />

      <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Back link */}
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to home
          </Link>

          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="mt-1 text-sm text-gray-500">Sign in to your Mycelium account</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4" noValidate id="login-form">
              {errors.form && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {errors.form}
                </div>
              )}

              <Input
                id="login-email"
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />

              <Input
                id="login-password"
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />

              <Button
                id="login-submit-btn"
                type="submit"
                loading={loading}
                className="w-full"
              >
                Sign in
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-gray-500">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="font-medium text-gray-900 hover:text-black hover:underline"
              >
                Register
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
