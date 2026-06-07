import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'secondary' | 'destructive' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-gray-900 text-white hover:bg-black hover:shadow-md focus:ring-gray-500 border border-transparent',
  secondary:
    'bg-gray-100 text-gray-800 hover:bg-gray-200 hover:shadow-sm focus:ring-gray-300 border border-transparent',
  destructive:
    'bg-red-500 text-white hover:bg-red-600 hover:shadow-md focus:ring-red-400 border border-transparent',
  ghost:
    'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-300 border border-transparent',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-4 py-1.5 text-sm rounded-full',
  md: 'px-6 py-2.5 text-sm rounded-full',
  lg: 'px-8 py-3 text-base rounded-full',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children?: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled ?? loading}
      className={[
        'inline-flex items-center justify-center gap-2 font-medium transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-1',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(' ')}
    >
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  );
}
