'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

function BuildingIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
function CalendarIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

const ADMIN_LINKS = [
  { href: '/admin/businesses', label: 'Businesses', icon: <BuildingIcon /> },
  { href: '/admin/accounts', label: 'Accounts', icon: <UsersIcon /> },
  { href: '/admin/appointments', label: 'Appointments', icon: <CalendarIcon /> },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { auth, logout } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (auth === null) return; // still loading
    if (!auth || auth.role !== 'SUPER_ADMIN') {
      router.replace('/login');
    }
  }, [auth, router]);

  if (!auth || auth.role !== 'SUPER_ADMIN') return null;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 flex-col lg:flex-row">
      {/* Mobile Header Bar */}
      <header className="lg:hidden flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 h-16 w-full z-30">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="text-gray-500 hover:text-gray-900 focus:outline-none"
            aria-label="Open sidebar"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-base font-bold text-gray-900">Admin Panel</span>
        </div>
        <span className="text-xs font-semibold text-gray-500">Mycelium</span>
      </header>

      {/* Sidebar Backdrop for Mobile */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Scheduler Mycelium
            </p>
            <h1 className="mt-1 text-base font-bold text-gray-900">Admin Panel</h1>
          </div>
          {/* Close button for Mobile */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="text-gray-400 hover:text-gray-600 lg:hidden rounded-full p-1 hover:bg-gray-100 transition-colors"
            aria-label="Close sidebar"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-3 py-4" aria-label="Admin navigation">
          <ul className="space-y-1">
            {ADMIN_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <span className="text-gray-400">{link.icon}</span>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-gray-200 px-4 py-4">
          <p className="truncate text-xs text-gray-500 mb-3">{auth.email}</p>
          <button
            type="button"
            id="admin-logout-btn"
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto w-full">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
