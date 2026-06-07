import Link from 'next/link';
import type { Business } from '@/types/api';

function getCategoryIcon() {
  return (
    <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

interface BusinessCardProps {
  business: Business;
}

export function BusinessCard({ business }: BusinessCardProps) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Cover Gradient */}
      <div className="h-24 w-full bg-gradient-to-br from-gray-100 to-gray-200 relative">
        {/* Avatar overlapping */}
        <div className="absolute -bottom-6 left-5 flex h-14 w-14 items-center justify-center rounded-xl border-4 border-white bg-gray-50 shadow-sm">
          {getCategoryIcon()}
        </div>
      </div>

      <div className="flex flex-col p-5 pt-8 h-full">
        <span className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
          {business.category}
        </span>

      {/* Name */}
      <h3 className="mb-1 text-lg font-bold text-gray-900 group-hover:text-black transition-colors line-clamp-1">
        {business.name}
      </h3>

      {/* Address */}
      {business.address && (
        <p className="mb-0.5 text-sm text-gray-500 line-clamp-1">{business.address}</p>
      )}

      {/* Phone */}
      {business.phone && (
        <p className="mb-4 text-sm text-gray-400">{business.phone}</p>
      )}

      <div className="mt-auto pt-4">
        <Link
          href={`/book/${business.slug}`}
          id={`book-btn-${business.slug}`}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-black hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
        >
          Book now
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      </div>
    </div>
  );
}
