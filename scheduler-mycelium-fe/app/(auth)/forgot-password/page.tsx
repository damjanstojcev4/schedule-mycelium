'use client';

import Link from 'next/link';
import { type FormEvent, useState } from 'react';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email) {
      setError('Email is required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      // Don't leak whether email exists or not, but just in case
      setError(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />

      <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Link
            href="/login"
            className="mb-6 inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to login
          </Link>

          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900">Forgot Password</h1>
            <p className="mt-1 text-sm text-gray-500">Enter your email to receive a reset link</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
            {success ? (
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Link sent</h3>
                <p className="mt-2 text-sm text-gray-500">
                  If an account exists with that email, a password reset link has been sent.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <Input
                  id="forgot-email"
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />

                <Button type="submit" loading={loading} className="w-full">
                  Send reset link
                </Button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
