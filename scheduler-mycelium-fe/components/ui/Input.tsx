'use client';

import { type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes, useState } from 'react';

// ─── Input ────────────────────────────────────────────────────────────────────

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, id, type, className = '', ...rest }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  const isPassword = type === 'password';
  const [showPassword, setShowPassword] = useState(false);

  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-semibold text-zinc-700">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          type={inputType}
          {...rest}
          className={[
            'w-full min-h-[48px] rounded-xl border px-4 py-3 text-base text-zinc-900 transition-all duration-150',
            'bg-white placeholder:text-zinc-400',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            'disabled:bg-zinc-50 disabled:text-zinc-400 disabled:cursor-not-allowed',
            error
              ? 'border-red-300 focus:ring-red-400 focus:border-red-400 bg-red-50/30'
              : 'border-zinc-200 focus:ring-zinc-900 focus:border-zinc-900',
            isPassword ? 'pr-12' : '',
            className,
          ].join(' ')}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center px-4 text-zinc-400 hover:text-zinc-600 focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}
      </div>
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
