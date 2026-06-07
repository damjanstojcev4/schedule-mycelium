'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

interface NavLink {
  href: string;
  label: string;
  icon: ReactNode;
}

interface SidebarProps {
  links: NavLink[];
  businessName: string;
  slug: string;
  email: string;
  onLogout: () => void;
}

export function Sidebar({ links, businessName, slug, email, onLogout }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-gray-200 bg-white">
      {/* Brand */}
      <div className="border-b border-gray-200 px-6 py-5">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
          Scheduler Mycelium
        </p>
        <h1 className="mt-1 truncate text-base font-semibold text-gray-900">
          {businessName}
        </h1>
        <p className="mt-0.5 truncate text-xs text-gray-500">/{slug}</p>
      </div>

      {/* Nav Links */}
      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4" aria-label="Sidebar navigation">
        <ul className="space-y-1">
          {links.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== `/dashboard/${slug}` && pathname.startsWith(link.href));

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={[
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-gray-50 text-black'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
                  ].join(' ')}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className={isActive ? 'text-gray-900' : 'text-gray-400'}>
                    {link.icon}
                  </span>
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User / Logout */}
      <div className="shrink-0 border-t border-gray-200 px-4 py-4">
        <p className="truncate text-xs text-gray-500 mb-3">{email}</p>
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          id="sidebar-logout-btn"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Log out
        </button>
      </div>
    </aside>
  );
}
