import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, id, className = '', ...rest }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        {...rest}
        className={[
          'w-full rounded-xl border border-gray-200/80 px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors',
          'bg-white placeholder:text-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500',
          'disabled:bg-gray-50 disabled:text-gray-500',
          error
            ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
            : 'border-gray-300',
          className,
        ].join(' ')}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─── Textarea ─────────────────────────────────────────────────────────────────

import type { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, id, className = '', ...rest }: TextareaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        {...rest}
        className={[
          'w-full rounded-xl border border-gray-200/80 px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors',
          'bg-white placeholder:text-gray-400 resize-none',
          'focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500',
          error
            ? 'border-red-400 focus:ring-red-400'
            : 'border-gray-300',
          className,
        ].join(' ')}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────

import type { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export function Select({ label, error, id, className = '', ...rest }: SelectProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <select
        id={inputId}
        {...rest}
        className={[
          'w-full rounded-xl border border-gray-200/80 px-4 py-2.5 text-sm text-gray-900 shadow-sm transition-colors',
          'bg-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500',
          error ? 'border-red-400' : 'border-gray-300',
          className,
        ].join(' ')}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
