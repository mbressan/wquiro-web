// Card — padrão de container para todas as telas

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md';
}

export function Card({ children, className = '', padding = 'md' }: CardProps) {
  const p = padding === 'none' ? '' : padding === 'sm' ? 'p-4' : 'p-5';
  return (
    <div className={['rounded-xl border border-gray-200 bg-white shadow-sm', p, className].join(' ')}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  action?: React.ReactNode;
  className?: string;
}

export function CardHeader({ title, action, className = '' }: CardHeaderProps) {
  return (
    <div
      className={[
        'flex items-center justify-between border-b border-gray-100 px-5 py-4',
        className,
      ].join(' ')}
    >
      <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      {action}
    </div>
  );
}

interface CardWithHeaderProps {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function CardWithHeader({ title, action, children, className = '', bodyClassName = 'p-5' }: CardWithHeaderProps) {
  return (
    <div className={['rounded-xl border border-gray-200 bg-white shadow-sm', className].join(' ')}>
      <CardHeader title={title} action={action} />
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}
