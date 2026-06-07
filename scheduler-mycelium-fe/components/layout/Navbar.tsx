'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export function Navbar() {
  const { auth, logout } = useAuth();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link
          href="/"
          className="text-lg font-semibold text-gray-900 hover:text-black transition-colors"
        >
          Scheduler Mycelium
        </Link>

        <nav className="flex items-center gap-2 text-sm" aria-label="Main navigation">
          {auth ? (
            <div className="flex items-center gap-4">
              <span className="text-gray-500 text-sm hidden sm:block">{auth.email}</span>
              <button
                type="button"
                id="navbar-logout-btn"
                onClick={logout}
                className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-black transition-colors"
              >
                Sign up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
