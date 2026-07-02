import Link from 'next/link';
import type { Business } from '@/types/api';

// ── Category-based color map ────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, { bg: string; text: string; accent: string }> = {
  Barbershop:     { bg: 'bg-slate-100',   text: 'text-slate-700',   accent: 'border-slate-300' },
  'Nail Salon':   { bg: 'bg-rose-50',     text: 'text-rose-700',    accent: 'border-rose-200' },
  'Tattoo Studio':{ bg: 'bg-violet-50',   text: 'text-violet-700',  accent: 'border-violet-200' },
  'Beauty Salon': { bg: 'bg-pink-50',     text: 'text-pink-700',    accent: 'border-pink-200' },
  Dentist:        { bg: 'bg-sky-50',      text: 'text-sky-700',     accent: 'border-sky-200' },
  Massage:        { bg: 'bg-emerald-50',  text: 'text-emerald-700', accent: 'border-emerald-200' },
  Trainer:        { bg: 'bg-orange-50',   text: 'text-orange-700',  accent: 'border-orange-200' },
  'Make Up Studio': { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700', accent: 'border-fuchsia-200' },
};

const DEFAULT_COLORS = { bg: 'bg-gray-100', text: 'text-gray-600', accent: 'border-gray-200' };

function getCategoryColors(category: string) {
  return CATEGORY_COLORS[category] || DEFAULT_COLORS;
}

interface BusinessCardProps {
  business: Business;
}

export function BusinessCard({ business }: BusinessCardProps) {
  const colors = getCategoryColors(business.category);

  return (
    <Link
      href={`/book/${business.slug}`}
      id={`book-btn-${business.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-200/60 hover:border-gray-300/80"
    >
      {/* Top accent strip */}
      <div className={`h-1.5 w-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-600 opacity-80 group-hover:opacity-100 transition-opacity`} />

      <div className="flex flex-col p-5 h-full">
        {/* Header row: category badge + icon */}
        <div className="flex items-start justify-between mb-4">
          <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${colors.bg} ${colors.text}`}>
            {business.category}
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all duration-300">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        {/* Name */}
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition-colors duration-200 line-clamp-1 mb-1">
          {business.name}
        </h3>

        {/* Address */}
        {business.address && (
          <div className="flex items-center gap-1.5 mb-0.5">
            <svg className="h-3.5 w-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm text-gray-500 line-clamp-1">{business.address}</p>
          </div>
        )}

        {/* Phone */}
        {business.phone && (
          <div className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <p className="text-sm text-gray-400">{business.phone}</p>
          </div>
        )}

        {/* Book CTA */}
        <div className="mt-auto pt-5">
          <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 group-hover:bg-emerald-50 transition-colors duration-300">
            <span className="text-sm font-bold text-gray-600 group-hover:text-emerald-700 transition-colors duration-300">
              Book now
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 group-hover:bg-emerald-600 transition-all duration-300">
              <svg className="h-3.5 w-3.5 text-white transition-transform duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
