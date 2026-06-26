import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';

// ─── Input ────────────────────────────────────────────────────────────────────

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, id, className = '', ...rest }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-semibold text-zinc-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        {...rest}
        className={[
          'w-full min-h-[48px] rounded-xl border px-4 py-3 text-base text-zinc-900 transition-all duration-150',
          'bg-white placeholder:text-zinc-400',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          'disabled:bg-zinc-50 disabled:text-zinc-400 disabled:cursor-not-allowed',
          error
            ? 'border-red-300 focus:ring-red-400 focus:border-red-400 bg-red-50/30'
            : 'border-zinc-200 focus:ring-zinc-900 focus:border-zinc-900',
          className,
        ].join(' ')}
      />
      {error && (
        <p className="flex items-center gap-1.5 text-sm text-red-600 font-medium">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
      {hint && !error && <p className="text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}

// ─── Textarea ─────────────────────────────────────────────────────────────────

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({ label, error, hint, id, className = '', ...rest }: TextareaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-semibold text-zinc-700">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        {...rest}
        className={[
          'w-full rounded-xl border px-4 py-3 text-base text-zinc-900 transition-all duration-150',
          'bg-white placeholder:text-zinc-400 resize-none',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          error
            ? 'border-red-300 focus:ring-red-400 focus:border-red-400 bg-red-50/30'
            : 'border-zinc-200 focus:ring-zinc-900 focus:border-zinc-900',
          className,
        ].join(' ')}
      />
      {error && (
        <p className="flex items-center gap-1.5 text-sm text-red-600 font-medium">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
      {hint && !error && <p className="text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export function Select({ label, error, id, className = '', children, ...rest }: SelectProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-semibold text-zinc-700">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={inputId}
          {...rest}
          className={[
            'w-full min-h-[48px] appearance-none rounded-xl border px-4 py-3 text-base text-zinc-900 transition-all duration-150',
            'bg-white focus:outline-none focus:ring-2 focus:ring-offset-0',
            error ? 'border-red-300 focus:ring-red-400' : 'border-zinc-200 focus:ring-zinc-900 focus:border-zinc-900',
            className,
          ].join(' ')}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
          <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
    </div>
  );
}
