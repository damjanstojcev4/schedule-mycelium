'use client';

import Link from 'next/link';

import { useAuth } from '@/contexts/AuthContext';

interface BookingNavbarProps {
  businessName: string;
}

export function BookingNavbar({ businessName }: BookingNavbarProps) {
  const { auth, logout } = useAuth();

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:px-6 pointer-events-none">
      <div className="pointer-events-auto flex h-14 w-full max-w-3xl items-center justify-between rounded-full border border-gray-200/50 bg-white/70 px-4 sm:px-6 shadow-sm backdrop-blur-xl transition-all">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        <span className="absolute left-1/2 -translate-x-1/2 text-sm font-bold text-gray-900 hidden sm:block">
          {businessName}
        </span>

        {!auth ? (
          <Link
            href="/login"
            id="booking-nav-login-link"
            className="rounded-full px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100/80 transition-colors"
          >
            Sign in
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-medium text-gray-900">{auth.email}</span>
            </div>
            <button
              onClick={logout}
              className="text-sm font-medium text-gray-400 hover:text-gray-900 transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
