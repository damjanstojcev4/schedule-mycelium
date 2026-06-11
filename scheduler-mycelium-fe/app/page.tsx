'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { api } from '@/lib/api';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { BusinessCard } from '@/components/ui/BusinessCard';
import { CategoryPill } from '@/components/ui/CategoryPill';
import { Spinner } from '@/components/ui/Spinner';
import type { Business } from '@/types/api';

const CATEGORIES = [
  'All',
  'Barbershop',
  'Nail Salon',
  'Tattoo Studio',
  'Beauty Salon',
  'Dentist',
  'Massage',
  'Trainer',
];

export default function LandingPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [query, setQuery] = useState('');

  useEffect(() => {
    api
      .getBusinesses()
      .then(setBusinesses)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return businesses.filter((b) => {
      const matchesCategory =
        activeCategory === 'All' || b.category === activeCategory;
      const matchesQuery =
        !query.trim() ||
        b.name.toLowerCase().includes(query.toLowerCase()) ||
        b.category.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [businesses, activeCategory, query]);

  function clearFilters() {
    setActiveCategory('All');
    setQuery('');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-white pb-16 pt-32 sm:pb-24 sm:pt-40 border-b border-gray-100">
        {/* Subtle radial gradient background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-100/80 via-white to-white pointer-events-none" />
        
        <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:items-center">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-5xl font-extrabold tracking-tighter text-gray-900 sm:text-7xl">
                Book appointments with<br />
                <span className="text-gray-800">local businesses</span>
              </h1>
              <p className="mt-6 text-lg tracking-tight text-gray-500 sm:text-xl">
                No account needed. Pick a service, pick a time, done.
              </p>

              {/* Search bar */}
              <div className="relative mt-10 max-w-xl sm:mx-auto lg:mx-0">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  id="business-search"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by business name or category…"
                  className="w-full rounded-full border border-gray-200/80 bg-white/80 py-4 pl-12 pr-4 text-base text-gray-900 shadow-xl shadow-gray-200/40 backdrop-blur-md placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all"
                />
              </div>
            </div>
            <div className="mt-16 sm:mt-24 lg:col-span-6 lg:mt-0">
              <div className="relative mx-auto w-full max-w-lg lg:max-w-none rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
                <Image
                  src="/images/hero_abstract.png"
                  alt="Premium abstract artwork"
                  width={800}
                  height={800}
                  priority
                  className="w-full object-cover aspect-square"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category filter row */}
      <div className="sticky top-[4.5rem] z-20 bg-gray-50/90 backdrop-blur-md border-b border-gray-100">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <CategoryPill
                key={cat}
                label={cat}
                active={activeCategory === cat}
                onClick={() => setActiveCategory(cat)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Business grid */}
      <main className="mx-auto max-w-6xl px-4 py-10">
        {loading && (
          <div className="flex justify-center py-20">
            <Spinner className="h-8 w-8 text-gray-900" />
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="mb-4">
              <svg className="h-12 w-12 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-800">No businesses found</h2>
            <p className="mt-1 text-sm text-gray-400">
              Try a different category or search term.
            </p>
            {(activeCategory !== 'All' || query) && (
              <button
                type="button"
                id="clear-filters-btn"
                onClick={clearFilters}
                className="mt-4 rounded-lg bg-white border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-300 hover:text-gray-900 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <>
            <p className="mb-5 text-sm text-gray-400">
              {filtered.length} {filtered.length === 1 ? 'business' : 'businesses'}
              {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((business) => (
                <BusinessCard key={business.publicId} business={business} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
