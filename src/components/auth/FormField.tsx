interface FormFieldProps {
  id: string
  label: string
  error?: string
  children: React.ReactNode
}

export function FormField({ id, label, error, children }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export function Input({ error, className = '', ...props }: InputProps) {
  return (
    <input
      className={[
        'block w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 focus:border-primary-500',
        error
          ? 'border-red-300 bg-red-50'
          : 'border-gray-300 bg-white hover:border-gray-400',
        className,
      ].join(' ')}
      {...props}
    />
  )
}

interface SubmitButtonProps {
  loading?: boolean
  children: React.ReactNode
}

export function SubmitButton({ loading, children }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  )
}
