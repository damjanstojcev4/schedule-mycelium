import type { ReactNode } from 'react';

interface StatsCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  subtitle?: string;
  trend?: { value: number; label: string };
}

function TrendArrow({ up }: { up: boolean }) {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {up
        ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      }
    </svg>
  );
}

export function StatsCard({ label, value, icon, subtitle, trend }: StatsCardProps) {
  const trendColor =
    trend && trend.value > 0 ? 'text-emerald-600 bg-emerald-50' :
    trend && trend.value < 0 ? 'text-red-600 bg-red-50' :
    'text-zinc-500 bg-zinc-50';

  return (
    <div className="group relative bg-white border border-zinc-200 rounded-2xl p-6 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      {/* Shimmer */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/60 to-transparent pointer-events-none" />
      <div className="relative flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-100 bg-zinc-50 text-zinc-600 shadow-sm group-hover:scale-105 transition-transform duration-200">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">{label}</p>
          <p className="text-3xl font-extrabold text-zinc-900 tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-zinc-400 mt-0.5 truncate">{subtitle}</p>}
          {trend && (
            <div className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-md text-xs font-semibold ${trendColor}`}>
              <TrendArrow up={trend.value >= 0} />
              <span>{trend.value > 0 ? '+' : ''}{trend.value}%</span>
              <span className="text-zinc-400 font-normal ml-0.5">{trend.label}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
