import { forwardRef } from 'react';

const BASE =
  'block w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 focus:border-primary-500';

const NORMAL = 'border-gray-300 bg-white hover:border-gray-400';
const ERROR = 'border-red-300 bg-red-50';
const DISABLED = 'disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed';

// ─── Input ────────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = '', ...props }, ref) => (
    <input
      ref={ref}
      className={[BASE, error ? ERROR : NORMAL, DISABLED, className].join(' ')}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

// ─── Select ───────────────────────────────────────────────────────────────────

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, className = '', children, ...props }, ref) => (
    <select
      ref={ref}
      className={[BASE, error ? ERROR : NORMAL, DISABLED, className].join(' ')}
      {...props}
    >
      {children}
    </select>
  ),
);
Select.displayName = 'Select';

// ─── Textarea ─────────────────────────────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className = '', ...props }, ref) => (
    <textarea
      ref={ref}
      className={[BASE, error ? ERROR : NORMAL, DISABLED, 'resize-none', className].join(' ')}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';
