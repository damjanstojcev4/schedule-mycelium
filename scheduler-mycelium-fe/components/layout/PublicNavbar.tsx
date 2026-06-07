'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export function PublicNavbar() {
  const { auth, logout } = useAuth();

  const rightSlot = () => {
    if (!auth) {
      return (
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            id="nav-login-link"
            className="rounded-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100/80 transition-colors"
          >
            Login
          </Link>
          <Link
            href="/register?role=BUSINESS_OWNER"
            id="nav-for-business-link"
            className="rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black transition-colors shadow-sm hover:shadow-md"
          >
            For Business
          </Link>
        </div>
      );
    }

    let navLink = null;
    if (auth.role === 'BUSINESS_OWNER' && auth.slug) {
      navLink = (
        <Link
          href={`/dashboard/${auth.slug}`}
          id="nav-dashboard-link"
          className="rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black transition-colors shadow-sm hover:shadow-md"
        >
          Dashboard
        </Link>
      );
    } else if (auth.role === 'STAFF' && auth.slug) {
      navLink = (
        <Link
          href={`/staff/${auth.slug}`}
          id="nav-schedule-link"
          className="rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black transition-colors shadow-sm hover:shadow-md"
        >
          Schedule
        </Link>
      );
    } else if (auth.role === 'CUSTOMER') {
      navLink = (
        <Link
          href="/my-appointments"
          id="nav-my-appointments-link"
          className="rounded-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100/80 transition-colors border border-gray-200"
        >
          My Appointments
        </Link>
      );
    }

    return (
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden sm:flex flex-col items-end mr-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Logged in</span>
          <span className="text-sm font-medium text-gray-900">{auth.email}</span>
        </div>
        {navLink}
        <button
          onClick={logout}
          className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          title="Logout"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    );
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:px-6 pointer-events-none">
      <div className="pointer-events-auto flex h-14 w-full max-w-5xl items-center justify-between rounded-full border border-gray-200/50 bg-white/70 px-4 sm:px-6 shadow-sm backdrop-blur-xl transition-all">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold text-gray-900 hover:text-black transition-colors"
        >
          Mycelium
        </Link>

        <nav className="flex items-center gap-2" aria-label="Main navigation">
          {rightSlot()}
        </nav>
      </div>
    </header>
  );
}
