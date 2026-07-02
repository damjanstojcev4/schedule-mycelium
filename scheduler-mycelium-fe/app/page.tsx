'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import Image from 'next/image';
import { api } from '@/lib/api';
import { PublicNavbar } from '@/components/layout/PublicNavbar';
import { BusinessCard } from '@/components/ui/BusinessCard';
import { CategoryPill } from '@/components/ui/CategoryPill';
import { Spinner } from '@/components/ui/Spinner';
import { DemoRequestForm } from '@/components/landing/DemoRequestForm';
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
  'Make Up Studio',
];

// ── Feature data ────────────────────────────────────────────────────────
const FEATURES = [
  {
    title: 'Smart Scheduling',
    description: 'Automated time-slot management with real-time availability. No double bookings, ever.',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'Multi-Staff Support',
    description: 'Manage schedules for your entire team. Individual calendars, breaks, and time-off.',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: 'Instant Booking',
    description: 'Customers book in seconds — no account required. Just pick a service, time, and confirm.',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: 'Business Dashboard',
    description: 'Full visibility into your appointments, staff, services, and settings — all in one place.',
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

// ── Steps data ──────────────────────────────────────────────────────────
const STEPS = [
  {
    step: '01',
    title: 'Set Up Your Profile',
    description: 'Add your services, staff, and working hours in minutes.',
  },
  {
    step: '02',
    title: 'Share Your Booking Link',
    description: 'Your customers get a clean, branded booking page — no app download needed.',
  },
  {
    step: '03',
    title: 'Manage & Grow',
    description: 'Track bookings, manage your calendar, and focus on what matters.',
  },
];

// ── Scroll reveal hook ──────────────────────────────────────────────────
function useRevealOnScroll() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('revealed');
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

function RevealSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRevealOnScroll();
  return (
    <div ref={ref} className={`reveal-on-scroll ${className}`}>
      {children}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════
// LANDING PAGE — 60/30/10 color system
// 60% White/light gray  ·  30% Slate-950 navy  ·  10% Emerald accent
// ═════════════════════════════════════════════════════════════════════════

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

      {/* ═══ HERO — 30% dark zone ═══════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-slate-950 pb-20 pt-32 sm:pb-28 sm:pt-44">
        {/* Background texture */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-800/40 via-slate-950 to-slate-950 pointer-events-none" />
        {/* Accent orb — 10% emerald glow */}
        <div className="absolute top-16 right-[10%] h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl animate-float pointer-events-none" />
        <div className="absolute bottom-0 left-[5%] h-64 w-64 rounded-full bg-emerald-400/5 blur-3xl animate-float-delayed pointer-events-none" />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

        <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 lg:items-center">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-7 lg:text-left">
              <h1 className="text-5xl font-extrabold tracking-tighter text-white sm:text-7xl leading-[0.95] animate-fade-in">
                The scheduling
                <br />
                platform for{' '}
                <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-500 bg-clip-text text-transparent animate-gradient">
                  local businesses
                </span>
              </h1>

              <p className="mt-6 text-lg tracking-tight text-slate-400 sm:text-xl max-w-lg animate-fade-in" style={{ animationDelay: '100ms' }}>
                Set up in minutes. Let your customers book 24/7 without phone calls, DMs, or missed messages.
              </p>

              {/* CTA Buttons — 10% accent on primary */}
              <div className="mt-10 flex flex-col sm:flex-row gap-3 sm:items-center animate-fade-in" style={{ animationDelay: '200ms' }}>
                <a
                  href="#demo"
                  id="hero-cta-demo"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-7 py-4 text-base font-bold text-slate-950 shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 hover:shadow-xl hover:shadow-emerald-500/30 active:scale-[0.97] transition-all duration-200"
                >
                  Request a Free Demo
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
                <a
                  href="#businesses"
                  id="hero-cta-browse"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-700 bg-white/5 px-7 py-4 text-base font-semibold text-slate-300 hover:bg-white/10 hover:text-white hover:border-slate-500 active:scale-[0.97] transition-all duration-200 backdrop-blur-sm"
                >
                  Browse Businesses
                </a>
              </div>

              {/* Trust indicators */}
              <div className="mt-12 flex items-center gap-6 sm:justify-center lg:justify-start animate-fade-in" style={{ animationDelay: '350ms' }}>
                <div className="flex -space-x-2">
                  {[
                    'from-emerald-400 to-emerald-600',
                    'from-slate-400 to-slate-600',
                    'from-emerald-300 to-emerald-500',
                    'from-slate-300 to-slate-500',
                  ].map((gradient, i) => (
                    <div
                      key={i}
                      className={`h-9 w-9 rounded-full border-2 border-slate-950 bg-gradient-to-br ${gradient} shadow-sm`}
                    />
                  ))}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Trusted by businesses</p>
                  <p className="text-xs text-slate-500">across Macedonia</p>
                </div>
              </div>
            </div>

            <div className="mt-16 sm:mt-24 lg:col-span-5 lg:mt-0">
              <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
                {/* Emerald glow behind image */}
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 blur-2xl opacity-60 animate-float-delayed" />
                <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black/40 border border-slate-800 ring-1 ring-emerald-500/10">
                  <Image
                    src="/images/hero_abstract.png"
                    alt="Mycelium scheduling platform"
                    width={800}
                    height={800}
                    priority
                    className="w-full object-cover aspect-square"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade into white */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* ═══ FEATURES — 60% light zone ══════════════════════════════════ */}
      <section className="py-24 sm:py-32 bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <RevealSection>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="text-sm font-bold uppercase tracking-widest text-emerald-500 mb-3">Platform</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
                Everything you need to run your bookings
              </h2>
              <p className="mt-4 text-lg text-gray-500 leading-relaxed">
                A complete scheduling system designed from the ground up for service-based businesses.
              </p>
            </div>
          </RevealSection>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature, i) => (
              <RevealSection key={feature.title}>
                <div
                  className="group relative rounded-2xl border border-gray-200/80 bg-white p-7 transition-all duration-300 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100/50 hover:-translate-y-1"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {/* Accent top bar */}
                  <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-emerald-400/0 to-transparent group-hover:via-emerald-400 transition-all duration-500" />
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-700 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 group-hover:shadow-lg group-hover:shadow-emerald-500/25">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS — 60% light zone ══════════════════════════════ */}
      <section className="py-24 sm:py-32 bg-gray-50 border-b border-gray-100">
        <div className="mx-auto max-w-5xl px-4 lg:px-8">
          <RevealSection>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="text-sm font-bold uppercase tracking-widest text-emerald-500 mb-3">How it works</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
                Up and running in 3 steps
              </h2>
            </div>
          </RevealSection>

          <div className="grid gap-8 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <RevealSection key={step.step}>
                <div
                  className="relative text-center md:text-left"
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  {/* Step number — 10% accent */}
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950 text-lg font-black mb-5 shadow-lg shadow-emerald-500/20">
                    {step.step}
                  </div>
                  {/* Connector line (desktop) */}
                  {i < STEPS.length - 1 && (
                    <div className="hidden md:block absolute top-7 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-px bg-gradient-to-r from-emerald-300 to-emerald-100" />
                  )}
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto md:mx-0">{step.description}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ BROWSE BUSINESSES — 60% light zone ═════════════════════════ */}
      <section id="businesses" className="py-20 sm:py-28 bg-white border-b border-gray-100 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <RevealSection>
            <div className="text-center max-w-2xl mx-auto mb-12">
              <p className="text-sm font-bold uppercase tracking-widest text-emerald-500 mb-3">Directory</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
                Browse & book instantly
              </h2>
              <p className="mt-4 text-lg text-gray-500 leading-relaxed">
                Find local businesses and book an appointment in seconds — no account needed.
              </p>
            </div>
          </RevealSection>

          {/* Search bar */}
          <div className="relative max-w-xl mx-auto mb-8">
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
              className="w-full rounded-full border border-gray-200/80 bg-white/80 py-4 pl-12 pr-4 text-base text-gray-900 shadow-xl shadow-gray-200/40 backdrop-blur-md placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>

          {/* Category filter row */}
          <div className="flex justify-center mb-10">
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

          {/* Business grid */}
          {loading && (
            <div className="flex justify-center py-20">
              <Spinner className="h-8 w-8 text-emerald-500" />
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
              <p className="mb-5 text-sm text-gray-400 text-center">
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
        </div>
      </section>

      {/* ═══ DEMO REQUEST — 30% dark zone ═══════════════════════════════ */}
      <section id="demo" className="relative py-24 sm:py-32 bg-slate-950 overflow-hidden scroll-mt-20">
        {/* Background accents */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-emerald-500/5 via-slate-950 to-slate-950 pointer-events-none" />
        <div className="absolute top-0 right-[20%] h-64 w-64 rounded-full bg-emerald-500/8 blur-3xl pointer-events-none" />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

        <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            {/* Left side: copy */}
            <RevealSection>
              <div className="mb-12 lg:mb-0">
                <p className="text-sm font-bold uppercase tracking-widest text-emerald-500 mb-3">Get started</p>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-5">
                  Ready to streamline
                  <br />your bookings?
                </h2>
                <p className="text-lg text-slate-400 leading-relaxed mb-8 max-w-md">
                  Request a free demo and we&apos;ll walk you through how Mycelium can help your business manage appointments effortlessly.
                </p>

                {/* Value props */}
                <div className="space-y-4">
                  {[
                    'Free setup & onboarding',
                    'No contracts or hidden fees',
                    'Dedicated support team',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15">
                        <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-slate-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </RevealSection>

            {/* Right side: form card — white card pops on dark bg */}
            <RevealSection>
              <div className="relative">
                {/* Ambient glow */}
                <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-emerald-500/15 via-emerald-400/5 to-transparent blur-xl" />
                {/* Card */}
                <div className="relative rounded-2xl border border-slate-800 bg-white p-8 sm:p-10 shadow-2xl shadow-black/30">
                  <div className="mb-7">
                    <h3 className="text-xl font-bold text-gray-900">Request a Demo</h3>
                    <p className="text-sm text-gray-500 mt-1">Fill in your details and we&apos;ll be in touch.</p>
                  </div>
                  <DemoRequestForm />
                </div>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER — 30% dark zone ═════════════════════════════════════ */}
      <footer className="bg-slate-950 border-t border-slate-900 py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white">Mycelium</span>
              <span className="text-xs text-slate-500 border-l border-slate-800 pl-2 ml-1">Scheduling Platform</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#businesses" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">
                Browse
              </a>
              <a href="#demo" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">
                Request Demo
              </a>
            </div>
            <p className="text-xs text-slate-600">
              &copy; {new Date().getFullYear()} Mycelium. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
